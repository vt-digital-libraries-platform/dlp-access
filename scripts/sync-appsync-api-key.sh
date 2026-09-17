#!/usr/bin/env bash
# Overwrites aws_appsync_apiKey in src/amplifyconfiguration.json with the current
# value from SSM Parameter Store, so the built frontend always ships the key the
# rotation Lambda most recently minted instead of whatever amplifyPush baked in.
set -euo pipefail

CONFIG_FILE="src/amplifyconfiguration.json"

if [ -z "${APPSYNC_API_KEY_SSM_PARAM:-}" ]; then
  echo "APPSYNC_API_KEY_SSM_PARAM not set; skipping AppSync API key sync (keeping the key from amplify push)."
  exit 0
fi

if [ ! -f "$CONFIG_FILE" ]; then
  echo "warning: $CONFIG_FILE not found; skipping AppSync API key sync" >&2
  exit 0
fi

API_KEY=$(aws ssm get-parameter \
  --name "$APPSYNC_API_KEY_SSM_PARAM" \
  --with-decryption \
  --query "Parameter.Value" \
  --output text)

if [ -z "$API_KEY" ] || [ "$API_KEY" == "None" ]; then
  echo "error: could not read AppSync API key from SSM parameter $APPSYNC_API_KEY_SSM_PARAM" >&2
  exit 1
fi

node -e "
const fs = require('fs');
const path = '$CONFIG_FILE';
const config = JSON.parse(fs.readFileSync(path, 'utf8'));
config.aws_appsync_apiKey = process.argv[1];
fs.writeFileSync(path, JSON.stringify(config, null, 2) + '\n');
console.log('Synced aws_appsync_apiKey in ' + path + ' from SSM parameter $APPSYNC_API_KEY_SSM_PARAM');
" "$API_KEY"
