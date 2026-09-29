# populate-item-page-count

Populates `archiveOptions.page_count` on Archive items so the UI can show
"N page(s)" badges.

For each item it fetches `manifest_url`, counts `sequences[0].canvases` in the
IIIF manifest, and writes that number back to the item. The Search page reads it
(`GalleryView`, `ItemListView`), as does the collection browse page.

This is a batch backfill, not an event-driven function: nothing triggers it
automatically, so newly ingested items have no page count until it is run again.

> No table names, account ids or API ids appear in this directory. This
> repository is public; supply them at run time.

## Running it

```bash
# whole table
python3 backfill.py --table <ARCHIVE_TABLE_NAME>

# recount items that already have a count, to refresh stale numbers
python3 backfill.py --table <ARCHIVE_TABLE_NAME> --force

# a single collection
python3 backfill.py --table <ARCHIVE_TABLE_NAME> --collection <COLLECTION_ID>

# another account
python3 backfill.py --table <ARCHIVE_TABLE_NAME> --profile <AWS_PROFILE>
```

`backfill.py` exists because one invocation is capped at 15 minutes, which is not
long enough to fetch a manifest for every item. The function returns a
`start_key` when it runs out of time and the script feeds it back in until the
table is covered.

To invoke by hand instead (console **Test**, or `aws lambda invoke`), use the
same event and repeat with the returned `start_key` until `timeout` is `false`:

```json
{ "archive_table": "<ARCHIVE_TABLE_NAME>", "force": true }
```

| event key | required | meaning |
|---|---|---|
| `archive_table` | yes | table to process |
| `parent_collection_id` | no | restrict to items under one collection |
| `item_category` | no | restrict by category; ignored if a collection is given |
| `force` | no | recount items that already have a `page_count` |
| `start_key` | no | resume point returned by a run that timed out |

Response:

```json
{ "msg": "total processed: N, total items: M", "timeout": false, "start_key": null }
```

`timeout: true` means it stopped early — re-invoke with the returned `start_key`.

A backfill of this size sends every write through Amplify's `@searchable` stream
into OpenSearch, which can make the site briefly sluggish while indexing catches
up.

## What it skips

- **Items with no `manifest.json` URL.** Some items point `manifest_url` at a
  PDF, an MP3 or an `exhibit.json`; those are not IIIF manifests and get no count.
- **Items that already have a `page_count`**, unless `force` is set.
- **3D items** — identified by `archiveOptions.assets.gltf_config` or a
  `media_type` beginning with `3d`.

The 3D exclusion is deliberate. A 3D item's manifest describes a single flat
photo of the object; the model itself (`.glb`) lives in `archiveOptions` and is
not referenced by the manifest at all. Counting canvases would therefore measure
the photo rather than the item, and "pages" is not a meaningful unit for
something you rotate. Without the exclusion, preprod would show "1 page(s)" on
154 of its 350 3D items and nothing on the other 196, purely according to
whether a photo happened to be attached.

## Verifying a run

```python
import boto3
db = boto3.client("dynamodb")
TABLE = "<ARCHIVE_TABLE_NAME>"

def count(expr):
    total, kwargs = 0, {}
    while True:
        r = db.scan(TableName=TABLE, Select="COUNT", FilterExpression=expr, **kwargs)
        total += r["Count"]
        if "LastEvaluatedKey" not in r:
            return total
        kwargs["ExclusiveStartKey"] = r["LastEvaluatedKey"]

print("counted :", count("attribute_exists(archiveOptions.page_count)"))
print("3D with a count (must be 0):",
      count("attribute_exists(archiveOptions.assets) AND attribute_exists(archiveOptions.page_count)"))
```

Paginate like this rather than summing the CLI's per-page `Count` values, which
is easy to get wrong and will silently under-report.

## Deploying

```bash
zip -j deploy.zip lambda_function.py
aws lambda update-function-code --function-name populate-item-page-count \
    --zip-file fileb://deploy.zip
aws lambda wait function-updated --function-name populate-item-page-count
aws lambda publish-version --function-name populate-item-page-count \
    --description "<what changed>"
```

Publish a version before changing the code as well as after, so there is a
snapshot to roll back to. `requests` comes from an attached layer, so it does
not need to be in the zip.

The function needs an execution role with DynamoDB read/write on the Archive
table and CloudWatch Logs, and the `requests` layer attached.
