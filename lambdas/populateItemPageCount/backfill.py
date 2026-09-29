"""Drive populate-item-page-count across an entire Archive table.

One Lambda invocation is capped at 15 minutes, which is not enough to fetch a
manifest for every item in the table. The function returns a `start_key` when it
runs out of time; this script feeds that back in until the table is covered.

Usage:
    python3 backfill.py --table <ARCHIVE_TABLE_NAME>
    python3 backfill.py --table <ARCHIVE_TABLE_NAME> --force
    python3 backfill.py --table <ARCHIVE_TABLE_NAME> --profile production

The table name is supplied at run time and deliberately not stored here: this
repository is public and holds no infrastructure identifiers.
"""

import argparse
import json
import sys
import time

import boto3
from botocore.config import Config

FUNCTION_NAME = "populate-item-page-count"

# read_timeout must exceed the Lambda's own 900s limit or the client hangs up
# while the function is still running. retries must be 0: boto3 treats a read
# timeout as retryable and would start a second concurrent execution while the
# first is still going, duplicating the whole scan.
CLIENT_CONFIG = Config(
    read_timeout=960, connect_timeout=30, retries={"max_attempts": 0}
)


def parse_args():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("--table", required=True, help="Archive DynamoDB table name")
    p.add_argument(
        "--force",
        action="store_true",
        help="recount items that already have a page_count (refreshes stale counts)",
    )
    p.add_argument("--profile", help="AWS profile; omit to use the default")
    p.add_argument(
        "--collection",
        help="restrict to one parent collection id instead of the whole table",
    )
    return p.parse_args()


def main():
    args = parse_args()
    session = boto3.Session(profile_name=args.profile) if args.profile else boto3.Session()
    lam = session.client("lambda", config=CLIENT_CONFIG)

    event = {"archive_table": args.table, "force": args.force}
    if args.collection:
        event["parent_collection_id"] = args.collection

    run, started = 0, time.time()
    while True:
        run += 1
        print(f"[run {run}] invoking... (elapsed {int(time.time() - started)}s)", flush=True)
        response = lam.invoke(
            FunctionName=FUNCTION_NAME, Payload=json.dumps(event).encode()
        )
        body = json.loads(response["Payload"].read())

        if response.get("FunctionError"):
            print("  FUNCTION ERROR:", json.dumps(body)[:800], flush=True)
            return 1

        print(f"  -> {body['msg']} | timeout={body['timeout']}", flush=True)

        if not body.get("timeout"):
            print(f"\nCOMPLETE after {run} run(s), {int(time.time() - started)}s", flush=True)
            return 0

        event["start_key"] = body.get("start_key")
        if not event["start_key"]:
            # without a cursor the next run would restart from the beginning
            print("  timed out without a start_key - stopping", flush=True)
            return 1


if __name__ == "__main__":
    sys.exit(main())
