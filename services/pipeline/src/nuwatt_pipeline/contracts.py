"""Validation helpers for pre-publication GeoJSON observations."""

from __future__ import annotations

from typing import Any


ALLOWED_STATUSES = {"estimated", "detected", "verified"}
PUBLIC_DETECTION_STATUSES = {"detected", "verified"}
REQUIRED_LINEAGE_FIELDS = {
    "model_run_id",
    "model_version",
    "source_asset_id",
    "imagery_date",
    "imagery_resolution_m",
}


class ContractError(ValueError):
    """Raised when an input violates the observation contract."""


def validate_feature_collection(
    payload: dict[str, Any], *, require_lineage: bool = False
) -> list[dict[str, Any]]:
    if payload.get("type") != "FeatureCollection":
        raise ContractError("Input must be a GeoJSON FeatureCollection")

    features = payload.get("features")
    if not isinstance(features, list):
        raise ContractError("FeatureCollection.features must be a list")

    for index, feature in enumerate(features):
        validate_array_feature(feature, index, require_lineage=require_lineage)
    return features


def validate_array_feature(
    feature: dict[str, Any], index: int = 0, *, require_lineage: bool = False
) -> None:
    if not isinstance(feature, dict):
        raise ContractError(f"Feature {index} must be an object")
    if feature.get("type") != "Feature":
        raise ContractError(f"Feature {index} must have type Feature")
    geometry = feature.get("geometry")
    if not isinstance(geometry, dict):
        raise ContractError(f"Feature {index} is missing geometry")
    if geometry.get("type") not in {"Point", "Polygon"}:
        raise ContractError(f"Feature {index} geometry must be Point or Polygon")

    properties = feature.get("properties")
    if not isinstance(properties, dict):
        raise ContractError(f"Feature {index} is missing properties")

    status = properties.get("status")
    if status not in ALLOWED_STATUSES:
        raise ContractError(
            f"Feature {index} status must be one of {sorted(ALLOWED_STATUSES)}"
        )

    area = properties.get("array_area_m2")
    if not isinstance(area, (int, float)) or isinstance(area, bool) or area <= 0:
        raise ContractError(f"Feature {index} array_area_m2 must be positive")

    confidence = properties.get("confidence")
    if not isinstance(confidence, (int, float)) or isinstance(confidence, bool):
        raise ContractError(f"Feature {index} confidence must be numeric")
    if not 0 <= confidence <= 1:
        raise ContractError(f"Feature {index} confidence must be between 0 and 1")

    if not require_lineage:
        return

    if status not in PUBLIC_DETECTION_STATUSES:
        raise ContractError(
            f"Feature {index} public detection status must be one of "
            f"{sorted(PUBLIC_DETECTION_STATUSES)}"
        )

    for field in REQUIRED_LINEAGE_FIELDS:
        value = properties.get(field)
        if value is None or (isinstance(value, str) and not value.strip()):
            raise ContractError(f"Feature {index} is missing lineage field {field}")

    resolution = properties.get("imagery_resolution_m")
    if (
        not isinstance(resolution, (int, float))
        or isinstance(resolution, bool)
        or resolution <= 0
    ):
        raise ContractError(
            f"Feature {index} imagery_resolution_m must be a positive number"
        )
    if status == "detected" and resolution > 1:
        raise ContractError(
            f"Feature {index} cannot be detected from imagery coarser than 1 metre"
        )

    for field in ("municipality", "district", "governorate"):
        value = properties.get(field)
        if not isinstance(value, str) or not value.strip():
            raise ContractError(f"Feature {index} is missing geography field {field}")
