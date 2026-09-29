import { defineFunction } from '@aws-amplify/backend';
import type { Backend } from '../../backend';

const branchName = process.env.AWS_BRANCH ?? 'sandbox';

export const S3Triggerf2aaed76 = defineFunction({
  entry: './index.js',
  name: `S3Triggerf2aaed76-${branchName}`,
  timeoutSeconds: 25,
  memoryMB: 128,
  environment: { ENV: `${branchName}` },
  runtime: 18,
});

export function applyEscapeHatches(backend: Backend) {
  backend.S3Triggerf2aaed76.resources.cfnResources.cfnFunction.functionName = `S3Triggerf2aaed76-${branchName}`;
}
