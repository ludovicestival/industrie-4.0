"""Manage storage of devices data"""

import json

def save_data(file: str, data: dict) -> None:
    with open(file, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=4)

def read_data(file: str) -> dict:
    with open(file, "r", encoding="utf-8") as f:
        return json.load(f)