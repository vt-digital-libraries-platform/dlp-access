import * as data from './data/resource';
import * as auth from './auth/resource';
import * as S3Triggerf2aaed76 from './function/S3Triggerf2aaed76/resource';
import * as storage from './storage/resource';
import { defineBackend } from '@aws-amplify/backend';
import { Tags } from 'aws-cdk-lib';

const backend = defineBackend({
  data: data.data,
  auth: auth.auth,
  S3Triggerf2aaed76: S3Triggerf2aaed76.S3Triggerf2aaed76,
  storage: storage.storage,
});

export type Backend = typeof backend;

data.applyEscapeHatches(backend);
auth.applyEscapeHatches(backend);
S3Triggerf2aaed76.applyEscapeHatches(backend);
storage.applyEscapeHatches(backend);

export function postRefactor() {
  storage.postRefactor(backend);
  Tags.of(backend.stack).add('gen2-migration/post-refactor', 'true');
}

// Uncomment after refactor
// postRefactor();
