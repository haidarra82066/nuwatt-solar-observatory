"""Create privacy-safe public grid releases from array-level AI detections."""

from __future__ import annotations

import argparse
import hashlib
import json
import math
from collections import Counter
from pathlib import Path
from typing import Any, Sequence

from .capacity import EstimateRange, estimate_capacity, estimate_generation
from .contracts import ContractError, validate_feature_collection


REFERENCE_LATITUDE = 33.9
METRES_PER_DEGREE_LATITUDE = 111_320.0


def _required_text(record: dict[str, Any], field: str, label: str) -> str:
    value = record.get(field)
    if not isinstance(value, str) or not value.strip():
        raise ContractError(f"{label} must provide {field}")
    return value.strip()


def _feature_center(feature: dict[str, Any], index: int) -> tuple[float, float]:
    geometry = feature["geometry"]
    coordinates = geometry.get("coordinates")
    if geometry.get("type") == "Point":
        if (
            not isinstance(coordinates, list)
            or len(coordinates) < 2
            or not all(isinstance(value, (int, float)) for value in coordinates[:2])
        ):
            raise ContractError(f"Feature {index} has invalid Point coordinates")
        longitude, latitude = float(coordinates[0]), float(coordinates[1])
    else:
        if not isinstance(coordinates, list) or not coordinates:
            raise ContractError(f"Feature {index} has invalid Polygon coordinates")
        ring = coordinates[0]
        if not isinstance(ring, list) or len(ring) < 4:
            raise ContractError(f"Feature {index} polygon ring is invalid")
        positions = [
            coordinate
            for coordinate in ring
            if isinstance(coordinate, list)
            and len(coordinate) >= 2
            and all(isinstance(value, (int, float)) for value in coordinate[:2])
        ]
        if len(positions) != len(ring):
            raise ContractError(f"Feature {index} polygon coordinates are invalid")
        longitude = (min(item[0] for item in positions) + max(item[0] for item in positions)) / 2
        latitude = (min(item[1] for item in positions) + max(item[1] for item in positions)) / 2

    if not (-180 <= longitude <= 180 and -90 <= latitude <= 90):
        raise ContractError(f"Feature {index} coordinates are outside WGS84 bounds")
    return longitude, latitude


def _mode(values: list[str]) -> str:
    return Counter(values).most_common(1)[0][0]


def _sum_ranges(ranges: list[EstimateRange], divisor: float) -> dict[str, float]:
    return {
        "p10": round(sum(value.p10 for value in ranges) / divisor, 6),
        "p50": round(sum(value.p50 for value in ranges) / divisor, 6),
        "p90": round(sum(value.p90 for value in ranges) / divisor, 6),
    }


def _asset_set_id(asset_ids: list[str]) -> str:
    unique = sorted(set(asset_ids))
    if len(unique) == 1:
        return unique[0]
    digest = hashlib.sha256("\n".join(unique).encode("utf-8")).hexdigest()[:16]
    return f"asset-set-{digest}"


def aggregate_public_grid(
    payload: dict[str, Any],
    *,
    release_id: str,
    grid_size_m: int = 250,
    min_cell_count: int = 3,
) -> dict[str, Any]:
    """Aggregate restricted detection geometry into a publishable WGS84 grid.

    Sparse cells are omitted. The source geometry and model-run identifiers are
    deliberately not copied into the public release.
    """

    if not release_id.strip():
        raise ContractError("release_id must be non-empty")
    if grid_size_m < 250:
        raise ContractError("Public grid cells must be at least 250 metres")
    if min_cell_count < 3:
        raise ContractError("Public cells must suppress groups smaller than three")

    metadata = payload.get("metadata")
    if not isinstance(metadata, dict):
        raise ContractError("Input must provide release metadata")
    if metadata.get("source_license_decision") != "approved":
        raise ContractError("Source licence decision must be approved before publication")
    model_version = _required_text(metadata, "model_version", "Input metadata")
    imagery_source = _required_text(metadata, "imagery_source", "Input metadata")
    source_url = metadata.get("source_url")
    if source_url is not None and not isinstance(source_url, str):
        raise ContractError("Input metadata source_url must be a string")

    features = validate_feature_collection(payload, require_lineage=True)
    latitude_step = grid_size_m / METRES_PER_DEGREE_LATITUDE
    longitude_step = grid_size_m / (
        METRES_PER_DEGREE_LATITUDE * math.cos(math.radians(REFERENCE_LATITUDE))
    )
    groups: dict[tuple[int, int], list[dict[str, Any]]] = {}

    for index, feature in enumerate(features):
        properties = feature["properties"]
        if properties["model_version"] != model_version:
            raise ContractError(f"Feature {index} model_version differs from release metadata")
        longitude, latitude = _feature_center(feature, index)
        column = math.floor((longitude + 180) / longitude_step)
        row = math.floor((latitude + 90) / latitude_step)
        groups.setdefault((column, row), []).append(feature)

    public_features: list[dict[str, Any]] = []
    all_published_assets: list[str] = []
    for (column, row), group in sorted(groups.items()):
        if len(group) < min_cell_count:
            continue

        west = column * longitude_step - 180
        south = row * latitude_step - 90
        east = west + longitude_step
        north = south + latitude_step
        properties = [feature["properties"] for feature in group]
        capacities = [estimate_capacity(float(item["array_area_m2"])) for item in properties]
        generations = [estimate_generation(value) for value in capacities]
        capacity = _sum_ranges(capacities, 1_000)
        generation = _sum_ranges(generations, 1_000)
        asset_ids = [str(item["source_asset_id"]) for item in properties]
        source_asset_id = _asset_set_id(asset_ids)
        all_published_assets.extend(asset_ids)
        statuses = {str(item["status"]) for item in properties}
        cell_id = f"{release_id}-g{column}-{row}"

        public_features.append(
            {
                "type": "Feature",
                "id": cell_id,
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [
                        [
                            [round(west, 7), round(south, 7)],
                            [round(east, 7), round(south, 7)],
                            [round(east, 7), round(north, 7)],
                            [round(west, 7), round(north, 7)],
                            [round(west, 7), round(south, 7)],
                        ]
                    ],
                },
                "properties": {
                    "id": cell_id,
                    "municipality": _mode([str(item["municipality"]) for item in properties]),
                    "district": _mode([str(item["district"]) for item in properties]),
                    "governorate": _mode([str(item["governorate"]) for item in properties]),
                    "status": "verified" if statuses == {"verified"} else "detected",
                    "installations": len(group),
                    "capacity_p10_mwp": capacity["p10"],
                    "capacity_p50_mwp": capacity["p50"],
                    "capacity_p90_mwp": capacity["p90"],
                    "generation_p10_gwh": generation["p10"],
                    "generation_p50_gwh": generation["p50"],
                    "generation_p90_gwh": generation["p90"],
                    "confidence": round(
                        sum(float(item["confidence"]) for item in properties) / len(group), 4
                    ),
                    "coverage_km2": round(grid_size_m * grid_size_m / 1_000_000, 6),
                    "imagery_date": max(str(item["imagery_date"]) for item in properties),
                    "imagery_resolution_m": max(
                        float(item["imagery_resolution_m"]) for item in properties
                    ),
                    "model_version": model_version,
                    "source_asset_id": source_asset_id,
                    "grid_size_m": grid_size_m,
                },
            }
        )

    if not public_features:
        raise ContractError("No cells satisfy the public minimum detection count")

    release_metadata: dict[str, Any] = {
        "release": release_id,
        "data_mode": "model-detections",
        "privacy": "public-aggregate",
        "grid_size_m": grid_size_m,
        "min_cell_count": min_cell_count,
        "model_version": model_version,
        "source_asset_id": _asset_set_id(all_published_assets),
        "imagery_source": imagery_source,
        "source_license_decision": "approved",
    }
    if source_url:
        release_metadata["source_url"] = source_url
    return {
        "type": "FeatureCollection",
        "metadata": release_metadata,
        "features": public_features,
    }


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Publish a privacy-safe grid from array-level AI detections."
    )
    parser.add_argument("input", type=Path, help="Restricted array detection GeoJSON")
    parser.add_argument("output", type=Path, help="Public aggregate GeoJSON path")
    parser.add_argument("--release", required=True, help="Immutable public release identifier")
    parser.add_argument("--grid-size-m", type=int, default=250)
    parser.add_argument("--min-cell-count", type=int, default=3)
    return parser


def main(argv: Sequence[str] | None = None) -> int:
    args = build_parser().parse_args(argv)
    payload = json.loads(args.input.read_text(encoding="utf-8"))
    result = aggregate_public_grid(
        payload,
        release_id=args.release,
        grid_size_m=args.grid_size_m,
        min_cell_count=args.min_cell_count,
    )
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(result, indent=2), encoding="utf-8")
    print(f"Published {len(result['features'])} aggregate cells -> {args.output}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
