#!/usr/bin/env node
/**
 * Maintain the @searchable OpenSearch indexes using the schema-derived
 * mappings in amplify/data/opensearch-mappings.ts. Deploying the backend
 * installs the same mappings as index templates; this script checks data
 * against them and recreates existing indexes, which templates don't touch.
 *
 * Prerequisites:
 *   - AWS CLI installed and configured, and curl >= 7.75 (for --aws-sigv4)
 *   - IAM permissions for es:ESHttp* on the domain and, for `validate`,
 *     dynamodb:Scan on the tables
 *
 * Usage:
 *   # print the mappings
 *   npx tsx scripts/opensearch-mappings.ts print
 *
 *   # index every item of each table into a throwaway index with these
 *   # mappings; report documents OpenSearch rejects and date values it skips
 *   npx tsx scripts/opensearch-mappings.ts validate <domain-endpoint> \
 *     Archive=Archive-b7anxcwcargyxfsgq4vtrtdbem-gentwo \
 *     Collection=Collection-b7anxcwcargyxfsgq4vtrtdbem-gentwo
 *
 *   # install the index templates (for domains not deployed from this
 *   # backend); --recreate also deletes and recreates the existing indexes
 *   # (search is empty until scripts/backfill-opensearch.js is rerun)
 *   npx tsx scripts/opensearch-mappings.ts apply <domain-endpoint> [--recreate]
 *
 * Options (environment variables):
 *   AWS_REGION   default us-east-1
 */

import fs from "fs";
import path from "path";
import { execFileSync } from "child_process";
import {
  buildOpenSearchMappings,
  DATE_FIELDS
} from "../amplify/data/opensearch-mappings";

const REGION = process.env.AWS_REGION || "us-east-1";
const RESOURCE_FILE = path.join(__dirname, "../amplify/data/resource.ts");
const BULK_BYTES = 5 * 1024 * 1024;

function buildMappings() {
  const src = fs.readFileSync(RESOURCE_FILE, "utf8");
  const match = src.match(/const schema = `([\s\S]*?)`;/);
  if (!match) throw new Error(`No schema found in ${RESOURCE_FILE}`);
  return buildOpenSearchMappings(match[1]);
}

type Json = any; // eslint-disable-line @typescript-eslint/no-explicit-any
type DynamoAttribute = Record<string, Json>;

function awsCredentials(): Json {
  return JSON.parse(
    execFileSync("aws", ["configure", "export-credentials", "--format", "process"], {
      encoding: "utf8"
    })
  );
}

function request(
  endpoint: string,
  method: string,
  urlPath: string,
  body?: Json,
  contentType = "application/json"
): Json {
  const creds = awsCredentials();
  const args = [
    "-s",
    "--aws-sigv4",
    `aws:amz:${REGION}:es`,
    "--user",
    `${creds.AccessKeyId}:${creds.SecretAccessKey}`,
    "-X",
    method,
    `https://${endpoint}${urlPath}`
  ];
  if (creds.SessionToken) args.push("-H", `x-amz-security-token: ${creds.SessionToken}`);
  if (body !== undefined) {
    args.push("-H", `content-type: ${contentType}`, "--data-binary", "@-");
  }
  const out = execFileSync("curl", args, {
    input: typeof body === "string" ? body : JSON.stringify(body),
    maxBuffer: 512 * 1024 * 1024,
    encoding: "utf8"
  });
  const res = JSON.parse(out);
  if (res.error) throw new Error(`${method} ${urlPath}: ${JSON.stringify(res.error)}`);
  return res;
}

function unmarshall(attr: DynamoAttribute): Json {
  const [type, value] = Object.entries(attr)[0];
  switch (type) {
    case "S":
    case "BOOL":
    case "SS":
      return value;
    case "NULL":
      return null;
    case "N":
      return Number(value);
    case "NS":
      return value.map(Number);
    case "L":
      return value.map(unmarshall);
    case "M":
      return unmarshallItem(value);
    default:
      throw new Error(`Unsupported DynamoDB type ${type}`);
  }
}

function unmarshallItem(item: Record<string, DynamoAttribute>): Json {
  return Object.fromEntries(
    Object.entries(item).map(([k, v]) => [k, unmarshall(v)])
  );
}

function* scanTable(tableName: string): Generator<Json> {
  let startingToken: string | undefined;
  do {
    const args = ["dynamodb", "scan", "--table-name", tableName, "--max-items", "500"];
    if (startingToken) args.push("--starting-token", startingToken);
    const page = JSON.parse(
      execFileSync(
        "aws",
        [...args, "--region", REGION, "--output", "json", "--no-cli-pager"],
        { maxBuffer: 512 * 1024 * 1024, encoding: "utf8" }
      )
    );
    for (const item of page.Items || []) yield unmarshallItem(item);
    startingToken = page.NextToken;
  } while (startingToken);
}

function validate(endpoint: string, pairs: string[]) {
  const mappings = buildMappings();
  let failed = 0;
  for (const pair of pairs) {
    const [model, tableName] = pair.split("=");
    const mapping = mappings[model.toLowerCase()];
    if (!mapping || !tableName) throw new Error(`Expected <Model>=<Table>, got ${pair}`);
    const index = `${model.toLowerCase()}-mapping-check-${Date.now()}`;
    request(endpoint, "PUT", `/${index}`, { mappings: mapping });
    const rejected: { id: string; reason: string }[] = [];
    const skipped: Record<string, number> = {};
    let scanned = 0;
    try {
      let lines: string[] = [];
      let bytes = 0;
      const flush = () => {
        if (lines.length === 0) return;
        const res = request(
          endpoint,
          "POST",
          `/${index}/_bulk`,
          lines.join("\n") + "\n",
          "application/x-ndjson"
        );
        for (const { index: r } of res.items) {
          if (r.error) rejected.push({ id: r._id, reason: r.error.reason });
        }
        lines = [];
        bytes = 0;
      };
      for (const item of scanTable(tableName)) {
        scanned++;
        const line = JSON.stringify(item);
        lines.push(JSON.stringify({ index: { _id: item.id } }), line);
        bytes += line.length;
        if (bytes > BULK_BYTES) flush();
      }
      flush();
      // Documents whose date values didn't parse are indexed without them
      // (ignore_malformed) and list the field in _ignored.
      request(endpoint, "POST", `/${index}/_refresh`);
      for (const field of DATE_FIELDS.filter((f) => mapping.properties[f])) {
        const { count } = request(endpoint, "POST", `/${index}/_count`, {
          query: { term: { _ignored: field } }
        });
        if (count) skipped[field] = count;
      }
    } finally {
      request(endpoint, "DELETE", `/${index}`);
    }
    console.log(`${model}: ${scanned} scanned, ${rejected.length} rejected`);
    for (const r of rejected.slice(0, 20)) console.log(`  ${r.id}: ${r.reason}`);
    for (const [field, count] of Object.entries(skipped)) {
      console.log(`  ${field}: unparseable in ${count} documents (indexed without it)`);
    }
    failed += rejected.length;
  }
  if (failed) process.exitCode = 1;
}

function apply(endpoint: string, recreate: boolean) {
  for (const [index, mapping] of Object.entries(buildMappings())) {
    request(endpoint, "PUT", `/_index_template/${index}-schema`, {
      index_patterns: [index],
      priority: 100,
      template: { mappings: mapping }
    });
    console.log(`${index}: index template installed`);
    if (!recreate) continue;
    const exists = request(endpoint, "GET", `/_cat/indices?format=json`).some(
      (i: Json) => i.index === index
    );
    if (exists) request(endpoint, "DELETE", `/${index}`);
    request(endpoint, "PUT", `/${index}`, {});
    console.log(`${index}: recreated (empty until backfilled)`);
  }
}

const [command, endpoint, ...rest] = process.argv.slice(2);
try {
  if (command === "print") {
    console.log(JSON.stringify(buildMappings(), null, 2));
  } else if (command === "validate" && endpoint && rest.length) {
    validate(endpoint, rest);
  } else if (command === "apply" && endpoint) {
    apply(endpoint, rest.includes("--recreate"));
  } else {
    console.error(
      "Usage: npx tsx scripts/opensearch-mappings.ts print\n" +
        "       npx tsx scripts/opensearch-mappings.ts validate <endpoint> <Model>=<Table> [...]\n" +
        "       npx tsx scripts/opensearch-mappings.ts apply <endpoint> [--recreate]"
    );
    process.exitCode = 1;
  }
} catch (err) {
  console.error((err as Error).message);
  process.exitCode = 1;
}
