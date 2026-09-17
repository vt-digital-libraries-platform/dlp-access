import {
  AppSyncClient,
  ListApiKeysCommand,
  CreateApiKeyCommand,
  DeleteApiKeyCommand,
  ApiKey
} from "@aws-sdk/client-appsync";
import { SSMClient, PutParameterCommand } from "@aws-sdk/client-ssm";

const appsync = new AppSyncClient({});
const ssm = new SSMClient({});

const API_ID = requireEnv("APPSYNC_API_ID");
const PARAM_NAME = requireEnv("SSM_PARAMETER_NAME");
const KEY_TTL_DAYS = Number(process.env.KEY_TTL_DAYS ?? "7");
const MIN_REMAINING_DAYS = Number(process.env.MIN_REMAINING_DAYS ?? "3");

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const handler = async (): Promise<void> => {
  const nowSec = Math.floor(Date.now() / 1000);

  const { apiKeys = [] } = await appsync.send(
    new ListApiKeysCommand({ apiId: API_ID })
  );

  const active = apiKeys
    .filter((key) => (key.expires ?? 0) > nowSec)
    .sort((a, b) => (b.expires ?? 0) - (a.expires ?? 0));

  const current = active[0];
  const remainingSeconds = current ? current.expires! - nowSec : 0;
  const minRemainingSeconds = MIN_REMAINING_DAYS * 86400;

  if (current && remainingSeconds > minRemainingSeconds) {
    console.log(
      `Current key ${current.id} still has ${(remainingSeconds / 86400).toFixed(
        1
      )} day(s) left (threshold ${MIN_REMAINING_DAYS}). No rotation needed.`
    );
    await deleteExpiredKeys(apiKeys, nowSec);
    return;
  }

  const newExpires = nowSec + KEY_TTL_DAYS * 86400;
  const { apiKey: created } = await appsync.send(
    new CreateApiKeyCommand({
      apiId: API_ID,
      description: `auto-rotated ${new Date(nowSec * 1000).toISOString()}`,
      expires: newExpires
    })
  );

  if (!created?.id) {
    throw new Error("AppSync CreateApiKey did not return a new key id");
  }

  await ssm.send(
    new PutParameterCommand({
      Name: PARAM_NAME,
      Value: created.id,
      Type: "SecureString",
      Overwrite: true,
      Description: `Active AppSync API key for ${API_ID}`
    })
  );

  await ssm.send(
    new PutParameterCommand({
      Name: `${PARAM_NAME}-expires`,
      Value: String(newExpires),
      Type: "String",
      Overwrite: true,
      Description: `Expiration (epoch seconds) of the AppSync API key at ${PARAM_NAME}`
    })
  );

  console.log(
    `Rotated AppSync API key: created ${created.id}, expires ${new Date(
      newExpires * 1000
    ).toISOString()}, wrote to SSM parameter ${PARAM_NAME}`
  );

  await deleteExpiredKeys(apiKeys, nowSec);
};

async function deleteExpiredKeys(apiKeys: ApiKey[], nowSec: number): Promise<void> {
  const expired = apiKeys.filter((key) => (key.expires ?? 0) <= nowSec);
  for (const key of expired) {
    if (!key.id) continue;
    try {
      await appsync.send(new DeleteApiKeyCommand({ apiId: API_ID, id: key.id }));
      console.log(`Deleted expired API key ${key.id}`);
    } catch (error) {
      console.error(`Failed to delete expired API key ${key.id}`, error);
    }
  }
}
