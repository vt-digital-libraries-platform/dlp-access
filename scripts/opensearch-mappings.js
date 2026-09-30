#!/usr/bin/env node
/**
 * Explicit OpenSearch mappings for the @searchable models, derived from the
 * GraphQL schema in amplify/data/resource.ts.
 *
 * Without explicit mappings the indexes are created by dynamic mapping, which
 * guesses field types from the first documents indexed. Date detection turns
 * String fields such as display_date or start_date into `date` fields, and
 * every later document whose value doesn't parse as a date (e.g.
 * "circa 1920") is rejected. The streaming Lambda swallows those errors, so
 * the documents silently go missing from search.
 *
 * Type mapping:
 *   String, ID, AWSEmail, AWSURL, ...  text + .keyword subfield
 *   fields in RAW_KEYWORD_FIELDS      keyword (sorted and range-filtered on the
 *                                     raw field, see nonKeywordFields in
 *                                     amplify/data/resolvers/*.req.vtl)
 *   Boolean                           boolean
 *   Int / Float                       long / double
 *   AWSDateTime / AWSDate             date
 *   AWSJSON                           object, not indexed (kept in _source)
 * Attributes not declared in the schema are kept in _source but not indexed
 * ("dynamic": false).
 *
 * Prerequisites:
 *   - AWS CLI installed and configured, and curl >= 7.75 (for --aws-sigv4)
 *   - IAM permissions for es:ESHttp* on the domain and, for `validate`,
 *     dynamodb:Scan on the tables
 *
 * Usage:
 *   # print the mappings
 *   node scripts/opensearch-mappings.js print
 *
 *   # index every item of each table into a throwaway index with these
 *   # mappings and report any document OpenSearch rejects
 *   node scripts/opensearch-mappings.js validate <domain-endpoint> \
 *     Archive=Archive-b7anxcwcargyxfsgq4vtrtdbem-gentwo \
 *     Collection=Collection-b7anxcwcargyxfsgq4vtrtdbem-gentwo
 *
 *   # install index templates so the indexes are always created with these
 *   # mappings; --recreate also deletes and recreates the existing indexes
 *   # (search is empty until scripts/backfill-opensearch.js is rerun)
 *   node scripts/opensearch-mappings.js apply <domain-endpoint> [--recreate]
 *
 * Options (environment variables):
 *   AWS_REGION   default us-east-1
 */

const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");
const { parse } = require("graphql");

const REGION = process.env.AWS_REGION || "us-east-1";
const RESOURCE_FILE = path.join(__dirname, "../amplify/data/resource.ts");
const RAW_KEYWORD_FIELDS = new Set(["start_date"]);
const BULK_BYTES = 5 * 1024 * 1024;

const TEXT_WITH_KEYWORD = {
  type: "text",
  fields: { keyword: { type: "keyword", ignore_above: 256 } }
};
const SCALAR_MAPPINGS = {
  Boolean: { type: "boolean" },
  Int: { type: "long" },
  Float: { type: "double" },
  AWSDateTime: { type: "date" },
  AWSDate: { type: "date" },
  AWSTimestamp: { type: "date", format: "epoch_second" },
  AWSJSON: { type: "object", enabled: false }
};
const STRING_SCALARS = new Set([
  "String",
  "ID",
  "AWSEmail",
  "AWSURL",
  "AWSPhone",
  "AWSIPAddress",
  "AWSTime"
]);

function namedType(type) {
  return type.kind === "NamedType" ? type.name.value : namedType(type.type);
}

function buildMappings() {
  const src = fs.readFileSync(RESOURCE_FILE, "utf8");
  const match = src.match(/const schema = `([\s\S]*?)`;/);
  if (!match) throw new Error(`No schema found in ${RESOURCE_FILE}`);
  const definitions = parse(match[1]).definitions;
  const typeNames = new Set(
    definitions
      .filter((d) => /^(Object|Interface)TypeDefinition$/.test(d.kind))
      .map((d) => d.name.value)
  );

  const mappings = {};
  for (const def of definitions) {
    if (def.kind !== "ObjectTypeDefinition") continue;
    if (!def.directives.some((d) => d.name.value === "searchable")) continue;
    // @model adds these timestamps to every record
    const properties = {
      createdAt: SCALAR_MAPPINGS.AWSDateTime,
      updatedAt: SCALAR_MAPPINGS.AWSDateTime
    };
    for (const field of def.fields) {
      const name = field.name.value;
      const type = namedType(field.type);
      if (typeNames.has(type)) continue; // relationship, not a stored attribute
      if (RAW_KEYWORD_FIELDS.has(name)) properties[name] = { type: "keyword" };
      else if (SCALAR_MAPPINGS[type]) properties[name] = SCALAR_MAPPINGS[type];
      else if (STRING_SCALARS.has(type)) properties[name] = TEXT_WITH_KEYWORD;
      else throw new Error(`No mapping for ${def.name.value}.${name}: ${type}`);
    }
    mappings[def.name.value.toLowerCase()] = { dynamic: false, properties };
  }
  return mappings;
}

function awsCredentials() {
  return JSON.parse(
    execFileSync("aws", ["configure", "export-credentials", "--format", "process"], {
      encoding: "utf8"
    })
  );
}

function request(endpoint, method, urlPath, body, contentType = "application/json") {
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

function unmarshall(attr) {
  const [type, value] = Object.entries(attr)[0];
  switch (type) {
    case "S":
    case "BOOL":
      return value;
    case "NULL":
      return null;
    case "N":
      return Number(value);
    case "SS":
      return value;
    case "NS":
      return value.map(Number);
    case "L":
      return value.map(unmarshall);
    case "M":
      return Object.fromEntries(
        Object.entries(value).map(([k, v]) => [k, unmarshall(v)])
      );
    default:
      throw new Error(`Unsupported DynamoDB type ${type}`);
  }
}

function* scanTable(tableName) {
  let startingToken;
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
    for (const item of page.Items || []) {
      yield Object.fromEntries(
        Object.entries(item).map(([k, v]) => [k, unmarshall(v)])
      );
    }
    startingToken = page.NextToken;
  } while (startingToken);
}

function validate(endpoint, pairs) {
  const mappings = buildMappings();
  let failed = 0;
  for (const pair of pairs) {
    const [model, tableName] = pair.split("=");
    const mapping = mappings[model.toLowerCase()];
    if (!mapping || !tableName) throw new Error(`Expected <Model>=<Table>, got ${pair}`);
    const index = `${model.toLowerCase()}-mapping-check-${Date.now()}`;
    request(endpoint, "PUT", `/${index}`, { mappings: mapping });
    const rejected = [];
    let scanned = 0;
    try {
      let lines = [];
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
    } finally {
      request(endpoint, "DELETE", `/${index}`);
    }
    console.log(`${model}: ${scanned} scanned, ${rejected.length} rejected`);
    for (const r of rejected.slice(0, 20)) console.log(`  ${r.id}: ${r.reason}`);
    failed += rejected.length;
  }
  if (failed) process.exitCode = 1;
}

function apply(endpoint, recreate) {
  for (const [index, mapping] of Object.entries(buildMappings())) {
    request(endpoint, "PUT", `/_index_template/${index}-schema`, {
      index_patterns: [index],
      priority: 100,
      template: { mappings: mapping }
    });
    console.log(`${index}: index template installed`);
    if (!recreate) continue;
    const exists = request(endpoint, "GET", `/_cat/indices?format=json`).some(
      (i) => i.index === index
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
      "Usage: node scripts/opensearch-mappings.js print\n" +
        "       node scripts/opensearch-mappings.js validate <endpoint> <Model>=<Table> [...]\n" +
        "       node scripts/opensearch-mappings.js apply <endpoint> [--recreate]"
    );
    process.exitCode = 1;
  }
} catch (err) {
  console.error(err.message);
  process.exitCode = 1;
}
