import requests
import logging
import json
import time
import boto3

logger = logging.getLogger()
logger.setLevel(logging.INFO)

# global timer:
start_time = None

MAX_DURATION = 890  # timeout in 14 minutes and 50 seconds
REQUEST_TIMEOUT = 10  # per-manifest HTTP timeout, so one slow host can't stall the run
dynamodb = boto3.client("dynamodb")


def lambda_handler(event, context):

    validate_input_event(event)
    archive_table = event["archive_table"]

    # force=True recounts items that already have a page_count, so a count that
    # went stale (pages added since it was last counted) gets refreshed
    force = bool(event.get("force", False))

    global start_time
    start_time = time.time()

    scan_params = {
        "TableName": archive_table,
        "ProjectionExpression": "id, manifest_url, archiveOptions",
        "Limit": 100,
    }

    scan_filter = get_scan_filter_expression(event)
    if scan_filter:
        scan_params = scan_params | scan_filter

    total_items = 0
    total_processed = 0
    # resume from where a previous run stopped, if it ran out of time
    last_evaluated_key = event.get("start_key")
    timeout = False
    try:
        while True and not timeout:
            (items, last_evaluated_key) = get_batch(scan_params, last_evaluated_key)
            total_items += len(items)
            processed = process_batch(items, archive_table, force)
            total_processed += processed
            logger.info(
                f"processed batch with {len(items)} items | total processed: {total_processed}"
            )
            timeout = has_timeout()
            if not last_evaluated_key:
                break
        if timeout:
            logger.warning(
                "Exceeded max duration; re-invoke with the returned start_key to resume"
            )
        return {
            "msg": f"total processed: {total_processed}, total items: {total_items}",
            "timeout": timeout,
            # pass this back in as "start_key" to continue where this run stopped.
            # absent means the whole table was covered.
            "start_key": last_evaluated_key if timeout else None,
        }
    except Exception as e:
        logger.exception(f"Error:{e}")
        raise


def get_scan_filter_expression(event):
    if "parent_collection_id" in event:
        return {
            "FilterExpression": "contains(#heirarchyPath, :collectionId)",
            "ExpressionAttributeNames": {
                "#heirarchyPath": "heirarchy_path",
            },
            "ExpressionAttributeValues": {
                ":collectionId": {"S": event["parent_collection_id"]}
            },
        }
    elif "item_category" in event:
        return {
            "FilterExpression": "#itemCategory = :category",
            "ExpressionAttributeNames": {
                "#itemCategory": "item_category",
            },
            "ExpressionAttributeValues": {":category": {"S": event["item_category"]}},
        }
    else:
        return None


def process_batch(items, table, force=False) -> int:
    processed = 0
    for item in items:
        if has_timeout():
            break
        id = item.get("id", {}).get("S")
        manifest_url = item.get("manifest_url", {}).get("S")
        archive_options = item.get("archiveOptions", {}).get("M")
        if not manifest_url or "manifest.json" not in manifest_url:
            continue
        if is_3d_item(archive_options):
            logger.info(f"{id} skipped: 3D item")
            continue
        # skip items already counted, unless force asks for a refresh
        if not force and archive_options and "page_count" in archive_options:
            continue
        page_cnt = get_page_count_from_manifest(manifest_url)
        if page_cnt > 0:
            if archive_options:
                logger.info(
                    f"{id} found existing archiveOptions: {json.dumps(archive_options)}"
                )
                update_page_count(id, page_cnt, table, archive_options)
            else:
                update_page_count(id, page_cnt, table)
            logger.info(f"{id} populated page count: {page_cnt}")
        else:
            logger.info(
                f"{id} page count did not populate: probably not IIIF compliant"
            )
        processed += 1
    return processed


def is_3d_item(archive_options) -> bool:
    """A 3D item's manifest describes only a flat photo of the object; the model
    itself (.glb) is stored here in archiveOptions, not in the manifest. Counting
    manifest canvases would therefore measure the photo, not the item."""
    if not archive_options:
        return False
    assets = archive_options.get("assets", {}).get("M", {})
    media_type = assets.get("media_type", {}).get("S", "")
    return "gltf_config" in assets or media_type.startswith("3d")


def get_batch(scan_params, last_evaluated_key=None):
    if last_evaluated_key:
        scan_params["ExclusiveStartKey"] = last_evaluated_key
    res = dynamodb.scan(**scan_params)
    items = res["Items"]
    if "LastEvaluatedKey" in res:
        return (items, res["LastEvaluatedKey"])
    return (items, None)


def get_page_count_from_manifest(manifest_url):
    res = requests.get(manifest_url, timeout=REQUEST_TIMEOUT)
    res.raise_for_status()
    manifest = res.json()
    if "sequences" in manifest and manifest["sequences"]:
        sequence = manifest["sequences"][0]
        if "canvases" in sequence:
            return len(sequence["canvases"])

    return 0


def update_page_count(itemId, page_cnt, table, prev_archive_options=None):
    new_archive_options = {}
    if prev_archive_options:
        new_archive_options = prev_archive_options
    new_archive_options["page_count"] = {"N": str(page_cnt)}

    dynamodb.update_item(
        TableName=table,
        Key={"id": {"S": itemId}},
        UpdateExpression="SET archiveOptions = :archiveOptions",
        ExpressionAttributeValues={":archiveOptions": {"M": new_archive_options}},
    )


def has_timeout():
    global start_time
    curr_time = time.time()
    return curr_time - start_time > MAX_DURATION


def validate_input_event(e: dict):
    # parent_collection_id and item_category are optional filters; with neither,
    # the whole table is processed (see get_scan_filter_expression)
    required_keys = {"archive_table"}
    if not required_keys.issubset(e.keys()):
        raise ValueError(f"Missing required keys: {required_keys}")


# def delete_page_count(itemId):
#     dynamodb.update_item(
#         TableName=TABLE,
#         Key={"id": {"S": itemId}},
#         UpdateExpression="REMOVE page_count",
#     )
