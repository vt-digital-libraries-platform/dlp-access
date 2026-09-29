#!/usr/bin/env node
/**
 * Backfill the Gen 2 @searchable OpenSearch domain from existing DynamoDB data.
 *
 * The OpenSearch streaming Lambda's DynamoDB stream mappings start at LATEST,
 * so items that existed before the Gen 2 deploy (e.g. the migrated Gen 1
 * tables) are never indexed. This script scans each table and replays every
 * item through that Lambda as a synthetic stream INSERT record, the same
 * approach as Amplify's ddb_to_es.py backfill script.
 *
 * Prerequisites:
 *   - AWS CLI installed and configured (aws configure, or AWS_PROFILE set)
 *   - IAM permissions for dynamodb:DescribeTable/Scan,
 *     lambda:ListEventSourceMappings and lambda:InvokeFunction
 *
 * Usage:
 *   node scripts/backfill-opensearch.js <TableName> [<TableName> ...]
 *
 *   # e.g. the tables mapped in amplify/data/resource.ts:
 *   node scripts/backfill-opensearch.js \
 *     Collection-b7anxcwcargyxfsgq4vtrtdbem-gentwo \
 *     Archive-b7anxcwcargyxfsgq4vtrtdbem-gentwo \
 *     Partner-b7anxcwcargyxfsgq4vtrtdbem-gentwo
 *
 * Options (environment variables):
 *   AWS_REGION                 default us-east-1
 *   STREAMING_FUNCTION_NAME    streaming Lambda to invoke; required only when a
 *                              table's stream has more than one Lambda mapped
 *                              (e.g. the Gen 1 stack's streaming Lambda too)
 *   SCAN_PAGE_SIZE             items per scan page (default 100)
 *   MAX_PAYLOAD_BYTES          max Lambda invoke payload (default 5000000)
 */

const fs = require("fs");
const path = require("path");
const os = require("os");
const { execFileSync } = require("child_process");

const REGION = process.env.AWS_REGION || "us-east-1";
const SCAN_PAGE_SIZE = Number(process.env.SCAN_PAGE_SIZE || 100);
const MAX_PAYLOAD_BYTES = Number(process.env.MAX_PAYLOAD_BYTES || 5000000);

const tables = process.argv.slice(2);
if (tables.length === 0) {
  console.error("Usage: node scripts/backfill-opensearch.js <TableName> [...]");
  process.exit(1);
}

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "backfill-opensearch-"));

function aws(args) {
  const out = execFileSync(
    "aws",
    [...args, "--region", REGION, "--output", "json", "--no-cli-pager"],
    { maxBuffer: 512 * 1024 * 1024, encoding: "utf8" }
  );
  return out.trim() ? JSON.parse(out) : {};
}

function findStreamingFunction(streamArn) {
  const { EventSourceMappings = [] } = aws([
    "lambda",
    "list-event-source-mappings",
    "--event-source-arn",
    streamArn,
  ]);
  const candidates = EventSourceMappings.map((m) => m.FunctionArn);
  const wanted = process.env.STREAMING_FUNCTION_NAME;
  if (wanted) {
    const match = candidates.find(
      (arn) => arn === wanted || arn.split(":").pop() === wanted
    );
    if (!match) {
      throw new Error(
        `STREAMING_FUNCTION_NAME ${wanted} is not mapped to ${streamArn}. ` +
          `Mapped: ${candidates.join(", ") || "none"}`
      );
    }
    return match;
  }
  if (candidates.length !== 1) {
    throw new Error(
      `Expected one Lambda mapped to ${streamArn}, found ${candidates.length}: ` +
        `${candidates.join(", ") || "none"}. Set STREAMING_FUNCTION_NAME.`
    );
  }
  return candidates[0];
}

function invoke(functionArn, records) {
  const payloadFile = path.join(tmpDir, "payload.json");
  const outFile = path.join(tmpDir, "out.json");
  fs.writeFileSync(payloadFile, JSON.stringify({ Records: records }));
  const res = aws([
    "lambda",
    "invoke",
    "--function-name",
    functionArn,
    "--payload",
    `fileb://${payloadFile}`,
    "--log-type",
    "Tail",
    outFile,
  ]);
  // The streaming Lambda swallows all exceptions, so inspect its log tail.
  const log = Buffer.from(res.LogResult || "", "base64").toString("utf8");
  if (res.FunctionError || /errors present|Traceback|\[ERROR\]/.test(log)) {
    throw new Error(`Streaming Lambda reported an error:\n${log}`);
  }
}

function backfillTable(tableName) {
  const { Table } = aws(["dynamodb", "describe-table", "--table-name", tableName]);
  const streamArn = Table.LatestStreamArn;
  if (!streamArn) throw new Error(`${tableName} has no DynamoDB stream enabled`);
  const keyNames = Table.KeySchema.map((k) => k.AttributeName);
  const functionArn = findStreamingFunction(streamArn);
  console.log(`${tableName}: replaying through ${functionArn}`);

  let batch = [];
  let batchBytes = 0;
  let sent = 0;
  let seq = 0;
  const flush = () => {
    if (batch.length === 0) return;
    invoke(functionArn, batch);
    sent += batch.length;
    console.log(`  indexed ${sent}`);
    batch = [];
    batchBytes = 0;
  };

  let startingToken;
  do {
    const args = [
      "dynamodb",
      "scan",
      "--table-name",
      tableName,
      "--max-items",
      String(SCAN_PAGE_SIZE),
    ];
    if (startingToken) args.push("--starting-token", startingToken);
    const page = aws(args);
    for (const item of page.Items || []) {
      const Keys = Object.fromEntries(keyNames.map((k) => [k, item[k]]));
      const record = {
        eventSource: "aws:dynamodb",
        eventSourceARN: streamArn,
        eventName: "INSERT",
        dynamodb: {
          Keys,
          NewImage: item,
          SequenceNumber: String(++seq),
          StreamViewType: "NEW_AND_OLD_IMAGES",
        },
      };
      const bytes = Buffer.byteLength(JSON.stringify(record));
      if (batchBytes + bytes > MAX_PAYLOAD_BYTES) flush();
      batch.push(record);
      batchBytes += bytes;
    }
    startingToken = page.NextToken;
  } while (startingToken);
  flush();
  console.log(`${tableName}: done, ${sent} items`);
}

try {
  for (const table of tables) backfillTable(table);
} catch (err) {
  console.error(err.message);
  process.exitCode = 1;
} finally {
  fs.rmSync(tmpDir, { recursive: true, force: true });
}
