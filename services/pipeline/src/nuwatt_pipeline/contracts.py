"""Validation helpers for pre-publication GeoJSON observations."""

from __future__ import annotations

from typing import Any


ALLOWED_STATUSES = {"estimated", "detected", "verified"}


class ContractError(ValueError):
    """Raised when an input violates the observation contract."""


def validate_feature_collection(payload: dict[str, Any]) -> list[dict[str, Any]]:
    if payload.get("type") != "FeatureCollection":
        raise ContractError("Input must be a GeoJSON FeatureCollection")

    features = payload.get("features")
    if not isinstance(features, list):
        raise ContractError("FeatureCollection.features must be a list")

    for index, feature in enumerate(features):
        validate_array_feature(feature, index)
    return features


def validate_array_feature(feature: dict[str, Any], index: int = 0) -> None:
    if feature.get("type") != "Feature":
        raise ContractError(f"Feature {index} must have type Feature")
    if not isinstance(feature.get("geometry"), dict):
        raise ContractError(f"Feature {index} is missing geometry")

    properties = feature.get("properties")
    if not isinstance(properties, dict):
        raise ContractError(f"Feature {index} is missing properties")

    status = properties.get("status")
    if status not in ALLOWED_STATUSES:
        raise ContractError(
            f"Feature {index} status must be one of {sorted(ALLOWED_STATUSES)}"
        )

    area = properties.get("array_area_m2")
    if not isinstance(area, (int, float)) or isinstance(area, bool) or area < 0:
        raise ContractError(f"Feature {index} array_area_m2 must be non-negative")

    confidence = properties.get("confidence")
    if not isinstance(confidence, (int, float)) or isinstance(confidence, bool):
        raise ContractError(f"Feature {index} confidence must be numeric")
    if not 0 <= confidence <= 1:
        raise ContractError(f"Feature {index} confidence must be between 0 and 1")
