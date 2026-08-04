/**
 * @fileoverview Stub `aws-exports` for local mock mode (no real AWS resources).
 *
 * Loaded from `src/index.js` when `REACT_APP_USE_MOCKS=true` so Amplify can
 * initialize without a generated `aws-exports.js` from `amplify push`.
 * Values are placeholders only; the mock layer never calls these endpoints.
 */

/**
 * Minimal Amplify configuration object matching the shape of a generated
 * `aws-exports.js` (Cognito, AppSync, S3 keys).
 *
 * @type {Object}
 * @property {string} aws_project_region
 * @property {string} aws_cognito_identity_pool_id
 * @property {string} aws_cognito_region
 * @property {string} aws_user_pools_id
 * @property {string} aws_user_pools_web_client_id
 * @property {Object} oauth
 * @property {string} aws_appsync_graphqlEndpoint
 * @property {string} aws_appsync_region
 * @property {string} aws_appsync_authenticationType
 * @property {string} aws_appsync_apiKey
 * @property {string} aws_user_files_s3_bucket
 * @property {string} aws_user_files_s3_bucket_region
 */
const awsmobile = {
  aws_project_region: "us-east-1",
  aws_cognito_identity_pool_id:
    "us-east-1:00000000-0000-0000-0000-000000000000",
  aws_cognito_region: "us-east-1",
  aws_user_pools_id: "us-east-1_MockPool",
  aws_user_pools_web_client_id: "mockclientid00000000000000",
  oauth: {},
  aws_appsync_graphqlEndpoint:
    "https://mock.appsync-api.us-east-1.amazonaws.com/graphql",
  aws_appsync_region: "us-east-1",
  aws_appsync_authenticationType: "API_KEY",
  aws_appsync_apiKey: "da2-mockapikey000000000000000",
  aws_user_files_s3_bucket: "dlp-access-local-mock",
  aws_user_files_s3_bucket_region: "us-east-1"
};

export default awsmobile;
