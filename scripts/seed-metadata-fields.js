#!/usr/bin/env node
/**
 * Seed MetadataField DynamoDB table directly via AWS CLI.
 *
 * This script bypasses AppSync and writes straight to DynamoDB, so it works
 * BEFORE `amplify push` creates the AppSync resolver.
 *
 * Prerequisites:
 *   - AWS CLI installed and configured (aws configure, or AWS_PROFILE set)
 *   - Correct IAM permissions to DynamoDB in us-east-1
 *
 * Usage:
 *   # Set required environment variables first:
 *   export METADATA_TABLE_NAME="MetadataField-<hash>-<env>"
 *   export AWS_REGION=""          # optional
 *
 *   # Create the table first (skip if it already exists):
 *   node scripts/seed-metadata-fields.js --create-table
 *
 *   # Seed data only:
 *   node scripts/seed-metadata-fields.js
 *
 *   # Both in one go:
 *   node scripts/seed-metadata-fields.js --create-table --seed
 *
 * The METADATA_TABLE_NAME can be found in the AWS DynamoDB console or
 * in amplify/backend/api/vtdlp/build/schema.graphql after `amplify push`.
 */

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { execSync } = require("child_process");
const os = require("os");

const TABLE_NAME = process.env.METADATA_TABLE_NAME;
if (!TABLE_NAME) {
  console.error("Error: METADATA_TABLE_NAME environment variable is required.");
  console.error("  export METADATA_TABLE_NAME=\"MetadataField-<hash>-<env>\"");
  process.exit(1);
}
const REGION = process.env.AWS_REGION || "us-east-1";
const BATCH_SIZE = 25; // DynamoDB batch-write limit

const args = process.argv.slice(2);
const shouldCreateTable = args.includes("--create-table");
// If no flags given, seed by default; explicit --seed also works
const shouldSeed = args.length === 0 || args.includes("--seed") || args.includes("--create-table");

const metadataFieldInfo = JSON.parse(
  fs.readFileSync(
    path.join(__dirname, "../src/data/metadataFieldInfo.json"),
    "utf8"
  )
);

// ---------------------------------------------------------------------------
// Category mapping
// ---------------------------------------------------------------------------
function getCategory(columnName, labelName) {
  if (labelName.includes("(Collection)")) return "Collection";

  // Fields shared by both Archive and Collection schemas
  const bothFields = new Set([
    "alt_text", "archived", "bibliographic_citation", "collection",
    "create_date", "creator", "custom_key", "description", "display_date",
    "embargo_end_date", "embargo_note", "embargo_start_date", "end_date",
    "heirarchy_path", "id", "identifier", "is_part_of", "language",
    "location", "modified_date", "parent_collection",
    "parent_collection_identifier", "partner_id", "provenance", "relation",
    "rights_holder", "rights", "source", "spatial", "start_date", "subject",
    "thumbnail_path", "title", "title_template", "visibility",
    "visual_description"
  ]);

  return bothFields.has(columnName) ? "Both" : "Archive";
}

// ---------------------------------------------------------------------------
// DynamoDB type-annotated item builder
// ---------------------------------------------------------------------------
function toDynamoItem(columnName, info, index) {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  const category = getCategory(columnName, info.labelName);

  return {
    id:         { S: id },
    columnName: { S: columnName },
    labelName:  { S: info.labelName },
    type:       { S: info.type },
    required:   { S: info.required },
    description:{ S: info.description },
    example:    { S: info.example },
    category:   { S: category },
    sortOrder:  { N: String(index + 1) },
    createdAt:  { S: now },
    updatedAt:  { S: now },
    __typename: { S: "MetadataField" }
  };
}

// ---------------------------------------------------------------------------
// Create table
// ---------------------------------------------------------------------------
function createTable() {
  console.log(`Creating table: ${TABLE_NAME} ...`);
  const cmd = [
    "aws dynamodb create-table",
    `--table-name "${TABLE_NAME}"`,
    "--attribute-definitions AttributeName=id,AttributeType=S",
    "--key-schema AttributeName=id,KeyType=HASH",
    "--billing-mode PAY_PER_REQUEST",
    `--region ${REGION}`
  ].join(" ");

  try {
    execSync(cmd, { stdio: "inherit" });
    console.log("Table created. Waiting for it to become ACTIVE...");
    execSync(
      `aws dynamodb wait table-exists --table-name "${TABLE_NAME}" --region ${REGION}`,
      { stdio: "inherit" }
    );
    console.log("Table is ACTIVE.\n");
  } catch (err) {
    if (err.message && err.message.includes("ResourceInUseException")) {
      console.log("Table already exists, skipping creation.\n");
    } else {
      throw err;
    }
  }
}

// ---------------------------------------------------------------------------
// Seed data
// ---------------------------------------------------------------------------
function seedData() {
  const entries = Object.entries(metadataFieldInfo);
  console.log(`Seeding ${entries.length} fields into ${TABLE_NAME} ...\n`);

  // Split into batches of 25
  const batches = [];
  for (let i = 0; i < entries.length; i += BATCH_SIZE) {
    batches.push(entries.slice(i, i + BATCH_SIZE));
  }

  let success = 0;
  let failed = 0;
  const tmpFiles = [];

  try {
    for (let b = 0; b < batches.length; b++) {
      const batch = batches[b];
      const startIdx = b * BATCH_SIZE;

      const putRequests = batch.map(([columnName, info], idx) => ({
        PutRequest: {
          Item: toDynamoItem(columnName, info, startIdx + idx)
        }
      }));

      const requestItems = { [TABLE_NAME]: putRequests };

      // Write to a temp file (AWS CLI requires file:// for large payloads)
      const tmpFile = path.join(os.tmpdir(), `metadata-seed-batch-${b}.json`);
      fs.writeFileSync(tmpFile, JSON.stringify(requestItems));
      tmpFiles.push(tmpFile);

      try {
        execSync(
          `aws dynamodb batch-write-item --request-items "file://${tmpFile}" --region ${REGION}`,
          { stdio: "pipe" }
        );
        const names = batch.map(([k]) => k).join(", ");
        console.log(`✓ Batch ${b + 1}/${batches.length}: ${names}`);
        success += batch.length;
      } catch (err) {
        console.error(`✗ Batch ${b + 1}/${batches.length} failed: ${err.stderr?.toString() || err.message}`);
        failed += batch.length;
      }
    }
  } finally {
    // Clean up temp files
    tmpFiles.forEach((f) => { try { fs.unlinkSync(f); } catch (_) {} });
  }

  console.log(`\nDone. ${success} seeded, ${failed} failed.`);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
if (shouldCreateTable) createTable();
if (shouldSeed) seedData();

