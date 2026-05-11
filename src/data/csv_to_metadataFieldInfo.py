#!/usr/bin/env python3
"""
Convert docs/metadata_field_referenc.csv to src/data/metadataFieldInfo.json format.
Rows in the CSV are transposed: each column is a field, each row is an attribute.
"""

import csv
import json
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).parent.parent.parent
CSV_PATH = REPO_ROOT / "src" / "data" / "metadata_field_reference.csv"
OUTPUT_PATH = REPO_ROOT / "src" / "data" / "metadataFieldInfo.json"

# Map CSV row labels to JSON keys
ROW_KEY_MAP = {
    "Label Name": "labelName",
    "Type": "type",
    "Required": "required",
    "Description": "description",
    "Example": "example",
}

def convert():
    with open(CSV_PATH, newline="", encoding="utf-8", errors="replace") as f:
        reader = csv.reader(f)
        rows = list(reader)

    # First row is field names (column headers)
    field_names = rows[0]

    # Build a dict: row_label -> list of values (one per field)
    row_map = {}
    for row in rows[1:]:
        if not row or not row[0].strip():
            continue
        label = row[0].strip()
        row_map[label] = row

    result = {}
    # Skip first column (it's the row label column, e.g. "Metadata Column Name")
    for col_idx in range(1, len(field_names)):
        field_name = field_names[col_idx].strip()
        if not field_name:
            continue

        entry = {}
        for csv_label, json_key in ROW_KEY_MAP.items():
            if csv_label in row_map:
                row = row_map[csv_label]
                value = row[col_idx].strip() if col_idx < len(row) else ""
                entry[json_key] = value

        result[field_name] = entry

    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(result, f, indent=2, ensure_ascii=False)

    print(f"Generated: {OUTPUT_PATH}")
    return result

def compare(generated):
    print(f"\nGenerated {len(generated)} fields in {OUTPUT_PATH}")

if __name__ == "__main__":
    generated = convert()
    compare(generated)
