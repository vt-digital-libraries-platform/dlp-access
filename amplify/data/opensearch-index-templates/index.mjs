// Custom resource handler that installs an index template per @searchable
// model so the streaming Lambda creates each index with the schema-derived
// mappings instead of dynamic mapping. Templates only apply when an index is
// created; an existing index keeps its mappings until it is recreated and
// backfilled (see scripts/opensearch-mappings.ts).
import { createHash, createHmac } from 'node:crypto';

const sha256 = (data) => createHash('sha256').update(data).digest('hex');
const hmac = (key, data) => createHmac('sha256', key).update(data).digest();

async function request(endpoint, method, path, body) {
  const region = process.env.AWS_REGION;
  const payload = body === undefined ? '' : JSON.stringify(body);
  const amzDate = new Date().toISOString().replace(/[:-]|\.\d{3}/g, '');
  const dateStamp = amzDate.slice(0, 8);
  const headers = {
    'content-type': 'application/json',
    host: endpoint,
    'x-amz-content-sha256': sha256(payload),
    'x-amz-date': amzDate,
  };
  if (process.env.AWS_SESSION_TOKEN) {
    headers['x-amz-security-token'] = process.env.AWS_SESSION_TOKEN;
  }
  const names = Object.keys(headers).sort();
  const signedHeaders = names.join(';');
  const canonicalRequest = [
    method,
    path,
    '',
    ...names.map((n) => `${n}:${headers[n]}`),
    '',
    signedHeaders,
    headers['x-amz-content-sha256'],
  ].join('\n');
  const scope = `${dateStamp}/${region}/es/aws4_request`;
  const stringToSign = [
    'AWS4-HMAC-SHA256',
    amzDate,
    scope,
    sha256(canonicalRequest),
  ].join('\n');
  let key = hmac(`AWS4${process.env.AWS_SECRET_ACCESS_KEY}`, dateStamp);
  for (const part of [region, 'es', 'aws4_request']) key = hmac(key, part);
  headers.authorization =
    `AWS4-HMAC-SHA256 Credential=${process.env.AWS_ACCESS_KEY_ID}/${scope}, ` +
    `SignedHeaders=${signedHeaders}, ` +
    `Signature=${createHmac('sha256', key).update(stringToSign).digest('hex')}`;
  delete headers.host;

  const res = await fetch(`https://${endpoint}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : payload,
  });
  const text = await res.text();
  if (!res.ok && res.status !== 404) {
    throw new Error(`${method} ${path} failed (${res.status}): ${text}`);
  }
  return res.status;
}

const templateName = (index) => `${index}-schema`;

export async function handler(event) {
  const { Endpoint: endpoint, Mappings } = event.ResourceProperties;
  const mappings = JSON.parse(Mappings);

  if (event.RequestType === 'Delete') {
    // The domain may already be gone (stack teardown); don't block deletion.
    for (const index of Object.keys(mappings)) {
      try {
        await request(endpoint, 'DELETE', `/_index_template/${templateName(index)}`);
      } catch (err) {
        console.warn(`${index}: could not remove index template: ${err.message}`);
      }
    }
    return { PhysicalResourceId: event.PhysicalResourceId };
  }

  for (const [index, mapping] of Object.entries(mappings)) {
    await request(endpoint, 'PUT', `/_index_template/${templateName(index)}`, {
      index_patterns: [index],
      priority: 100,
      template: { mappings: mapping },
    });
    console.log(`${index}: index template installed`);
  }
  if (event.RequestType === 'Update') {
    const old = JSON.parse(event.OldResourceProperties?.Mappings ?? '{}');
    for (const index of Object.keys(old)) {
      if (mappings[index]) continue;
      await request(endpoint, 'DELETE', `/_index_template/${templateName(index)}`);
      console.log(`${index}: index template removed`);
    }
  }
  return { PhysicalResourceId: `opensearch-index-templates-${endpoint}` };
}
