"""Command-line enrichment for array-level GeoJSON observations."""

from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Any, Sequence

from .capacity import estimate_capacity, estimate_generation
from .contracts import validate_feature_collection


def enrich(payload: dict[str, Any]) -> dict[str, Any]:
    features = validate_feature_collection(payload)
    for feature in features:
        properties = feature["properties"]
        capacity = estimate_capacity(float(properties["array_area_m2"]))
        generation = estimate_generation(capacity)
        properties["capacity_kwp"] = capacity.__dict__
        properties["technical_generation_mwh_year"] = generation.__dict__
        properties["estimation_model"] = "foundation-scenario-v1"
    return payload


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Add transparent capacity and technical-yield ranges to array GeoJSON."
    )
    parser.add_argument("input", type=Path, help="Input GeoJSON feature collection")
    parser.add_argument("output", type=Path, help="Output path")
    return parser


def main(argv: Sequence[str] | None = None) -> int:
    args = build_parser().parse_args(argv)
    payload = json.loads(args.input.read_text(encoding="utf-8"))
    result = enrich(payload)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(result, indent=2), encoding="utf-8")
    print(f"Enriched {len(result['features'])} features -> {args.output}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
