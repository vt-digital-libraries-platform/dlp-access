#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { AppSyncKeyRotationStack } from "../lib/appsync-key-rotation-stack";

const app = new cdk.App();

const apiId = app.node.tryGetContext("apiId");
if (!apiId) {
  throw new Error(
    "Missing required context 'apiId'. Deploy with: " +
      "npx cdk deploy -c apiId=<appsync-api-id> -c env=<dev|pprd> [-c alarmEmail=<email>]"
  );
}

const envName = app.node.tryGetContext("env") ?? "dev";
const ssmParameterName =
  app.node.tryGetContext("ssmParameterName") ?? `/vtdlp/${envName}/appsync/api-key`;
const keyTtlDays = Number(app.node.tryGetContext("keyTtlDays") ?? 7);
const minRemainingDays = Number(app.node.tryGetContext("minRemainingDays") ?? 3);
const scheduleExpression = app.node.tryGetContext("scheduleExpression") ?? "rate(1 day)";
const alarmEmail = app.node.tryGetContext("alarmEmail");

new AppSyncKeyRotationStack(app, `AppSyncKeyRotation-${envName}`, {
  apiId,
  ssmParameterName,
  keyTtlDays,
  minRemainingDays,
  scheduleExpression,
  alarmEmail,
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION ?? "us-east-1"
  }
});
