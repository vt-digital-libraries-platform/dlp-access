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
dynamodb = boto3.client("dynamodb")


def lambda_handler(event, context):

    validate_input_event(event)
    archive_table = event["archive_table"]

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
    last_evaluated_key = None
    timeout = False
    try:
        while True and not timeout:
            (items, last_evaluated_key) = get_batch(scan_params, last_evaluated_key)
            total_items += len(items)
            processed = process_batch(items, archive_table)
            total_processed += processed
            logger.info(
                f"processed batch with {len(items)} items | total processed: {total_processed}"
            )
            timeout = has_timeout()
            if not last_evaluated_key:
                break
        if timeout:
            logger.warn("Exceed max duration, you may need to run me again...")
        return {
            "msg": f"total processed: {total_processed}, total items: {total_items}",
            "timeout": timeout,
        }
    except Exception as e:
        logger.exception(f"Error:{e}")


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


def process_batch(items, table) -> int:
    processed = 0
    for item in items:
        if has_timeout():
            break
        id = item.get("id", {}).get("S")
        manifest_url = item.get("manifest_url", {}).get("S")
        archive_options = item.get("archiveOptions", {}).get("M")
        if not manifest_url or "manifest.json" not in manifest_url:
            continue
        # skip if page count exists
        # if archive_options and "page_count" in archive_options:
        #     continue
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


def get_batch(scan_params, last_evaluated_key=None):
    if last_evaluated_key:
        scan_params["ExclusiveStartKey"] = last_evaluated_key
    res = dynamodb.scan(**scan_params)
    items = res["Items"]
    if "LastEvaluatedKey" in res:
        return (items, res["LastEvaluatedKey"])
    return (items, None)


def get_page_count_from_manifest(manifest_url):
    res = requests.get(manifest_url)
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
    required_keys = {"archive_table", "parent_collection_id"}
    if not required_keys.issubset(e.keys()):
        raise (f"Missing required keys: {required_keys}")


# def delete_page_count(itemId):
#     dynamodb.update_item(
#         TableName=TABLE,
#         Key={"id": {"S": itemId}},
#         UpdateExpression="REMOVE page_count",
#     )
