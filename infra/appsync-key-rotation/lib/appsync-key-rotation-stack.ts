import * as path from "path";
import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import * as events from "aws-cdk-lib/aws-events";
import * as targets from "aws-cdk-lib/aws-events-targets";
import * as iam from "aws-cdk-lib/aws-iam";
import * as sns from "aws-cdk-lib/aws-sns";
import * as subs from "aws-cdk-lib/aws-sns-subscriptions";
import * as cloudwatch from "aws-cdk-lib/aws-cloudwatch";
import * as cwActions from "aws-cdk-lib/aws-cloudwatch-actions";

export interface AppSyncKeyRotationStackProps extends cdk.StackProps {
  /** AppSync API id whose API key should be rotated (e.g. 77eik3yv7rbdbjhjemas6h7dmi). */
  apiId: string;
  /** SSM parameter (SecureString) that will hold the active API key value. */
  ssmParameterName: string;
  /** Lifetime given to each newly minted key, in days. Defaults to 7 to match the Amplify apiKeyExpirationDays config. */
  keyTtlDays?: number;
  /** Rotate when the current key has fewer than this many days left. Should be < keyTtlDays with room for schedule misses. */
  minRemainingDays?: number;
  /** EventBridge schedule expression controlling how often the rotation Lambda runs. */
  scheduleExpression?: string;
  /** Optional email address to notify if a rotation run fails. */
  alarmEmail?: string;
}

export class AppSyncKeyRotationStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: AppSyncKeyRotationStackProps) {
    super(scope, id, props);

    const {
      apiId,
      ssmParameterName,
      keyTtlDays = 7,
      minRemainingDays = 3,
      scheduleExpression = "rate(1 day)",
      alarmEmail
    } = props;

    const region = cdk.Stack.of(this).region;
    const account = cdk.Stack.of(this).account;
    const parameterPath = ssmParameterName.startsWith("/")
      ? ssmParameterName
      : `/${ssmParameterName}`;

    const rotateFn = new NodejsFunction(this, "RotateApiKeyFunction", {
      entry: path.join(__dirname, "../lambda/rotate-api-key/index.ts"),
      handler: "handler",
      runtime: Runtime.NODEJS_20_X,
      timeout: cdk.Duration.minutes(2),
      memorySize: 256,
      description: `Rotates the AppSync API key for ${apiId} and publishes it to SSM`,
      environment: {
        APPSYNC_API_ID: apiId,
        SSM_PARAMETER_NAME: parameterPath,
        KEY_TTL_DAYS: String(keyTtlDays),
        MIN_REMAINING_DAYS: String(minRemainingDays)
      },
      bundling: {
        minify: true,
        sourceMap: true,
        externalModules: []
      }
    });

    rotateFn.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ["appsync:ListApiKeys", "appsync:CreateApiKey", "appsync:DeleteApiKey"],
        resources: [`arn:aws:appsync:${region}:${account}:apis/${apiId}`]
      })
    );

    rotateFn.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ["ssm:PutParameter"],
        resources: [
          `arn:aws:ssm:${region}:${account}:parameter${parameterPath}`,
          `arn:aws:ssm:${region}:${account}:parameter${parameterPath}-expires`
        ]
      })
    );

    const rule = new events.Rule(this, "RotationSchedule", {
      schedule: events.Schedule.expression(scheduleExpression),
      description: `Triggers AppSync API key rotation for ${apiId}`
    });
    rule.addTarget(new targets.LambdaFunction(rotateFn, { retryAttempts: 2 }));

    const alarm = rotateFn
      .metricErrors({ period: cdk.Duration.hours(24) })
      .createAlarm(this, "RotationFailureAlarm", {
        threshold: 1,
        evaluationPeriods: 1,
        alarmDescription: `AppSync API key rotation failed for ${apiId} - the current key may expire without renewal`,
        treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING
      });

    if (alarmEmail) {
      const topic = new sns.Topic(this, "RotationAlarmTopic", {
        displayName: `AppSync key rotation alarms (${apiId})`
      });
      topic.addSubscription(new subs.EmailSubscription(alarmEmail));
      alarm.addAlarmAction(new cwActions.SnsAction(topic));
    }

    new cdk.CfnOutput(this, "RotationFunctionName", { value: rotateFn.functionName });
    new cdk.CfnOutput(this, "SsmParameterName", { value: parameterPath });
    new cdk.CfnOutput(this, "SsmParameterExpiresName", { value: `${parameterPath}-expires` });
  }
}
