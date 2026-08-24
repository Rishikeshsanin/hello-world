#!/usr/bin/env python3
"""Validate the Hello World Atlas catalog against repository files."""

from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CATALOG = ROOT / "docs" / "catalog.json"
GREETING = "Hello, World!"
COMMENT_TEXT = "this is a comment and is ignored by the compiler"


def main() -> int:
    entries = json.loads(CATALOG.read_text(encoding="utf-8"))
    errors: list[str] = []
    seen_names: set[str] = set()
    seen_paths: set[str] = set()

    for entry in entries:
        name = entry["name"]
        relative = entry["path"]
        path = ROOT / relative

        if name in seen_names:
            errors.append(f"duplicate language name: {name}")
        seen_names.add(name)

        if relative in seen_paths:
            errors.append(f"duplicate path: {relative}")
        seen_paths.add(relative)

        if not path.is_file():
            errors.append(f"missing file: {relative}")
            continue

        text = path.read_text(encoding="utf-8", errors="replace")
        if GREETING not in text:
            errors.append(f"greeting missing from: {relative}")
        if COMMENT_TEXT not in text:
            errors.append(f"educational comment missing from: {relative}")

    if errors:
        print("Catalog check failed:")
        for error in errors:
            print(f" - {error}")
        return 1

    print(f"✓ {len(entries)} catalog entries verified.")
    print(f"✓ Every source file contains {GREETING!r}.")
    print("✓ Every source file includes the educational comment.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
