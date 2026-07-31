from __future__ import annotations

import sys
import unittest
from pathlib import Path


SRC = Path(__file__).resolve().parents[1] / "src"
sys.path.insert(0, str(SRC))

from nuwatt_pipeline.contracts import ContractError
from nuwatt_pipeline.publish import aggregate_public_grid


def detection(
    observation_id: str,
    longitude: float,
    latitude: float,
    *,
    resolution: float = 0.3,
    status: str = "detected",
) -> dict:
    return {
        "type": "Feature",
        "id": observation_id,
        "geometry": {"type": "Point", "coordinates": [longitude, latitude]},
        "properties": {
            "status": status,
            "confidence": 0.9,
            "array_area_m2": 40,
            "model_run_id": "run-2027-01",
            "model_version": "pv-detector-1.0.0",
            "source_asset_id": "licensed-tile-01",
            "imagery_date": "2027-01-10",
            "imagery_resolution_m": resolution,
            "municipality": "Beirut",
            "district": "Beirut",
            "governorate": "Beirut",
        },
    }


def collection(features: list[dict], *, licence: str = "approved") -> dict:
    return {
        "type": "FeatureCollection",
        "metadata": {
            "model_version": "pv-detector-1.0.0",
            "imagery_source": "licensed test imagery",
            "source_license_decision": licence,
        },
        "features": features,
    }


class PublishTests(unittest.TestCase):
    def test_aggregates_detections_and_suppresses_sparse_cells(self) -> None:
        payload = collection(
            [
                detection("one", 35.5000, 33.8900),
                detection("two", 35.5001, 33.8901),
                detection("three", 35.5002, 33.8902),
                detection("isolated", 35.6000, 33.9900),
            ]
        )

        result = aggregate_public_grid(payload, release_id="lbn-ai-2027-01")

        self.assertEqual(result["metadata"]["data_mode"], "model-detections")
        self.assertEqual(result["metadata"]["privacy"], "public-aggregate")
        self.assertEqual(len(result["features"]), 1)
        properties = result["features"][0]["properties"]
        self.assertEqual(properties["installations"], 3)
        self.assertLess(properties["capacity_p10_mwp"], properties["capacity_p50_mwp"])
        self.assertLess(properties["capacity_p50_mwp"], properties["capacity_p90_mwp"])
        ring = result["features"][0]["geometry"]["coordinates"][0]
        self.assertEqual(ring[0], ring[-1])

    def test_rejects_unapproved_imagery(self) -> None:
        payload = collection(
            [detection("one", 35.5, 33.89)] * 3,
            licence="pending",
        )
        with self.assertRaisesRegex(ContractError, "licence decision"):
            aggregate_public_grid(payload, release_id="blocked")

    def test_rejects_coarse_detected_imagery(self) -> None:
        payload = collection(
            [
                detection("one", 35.5000, 33.8900, resolution=10),
                detection("two", 35.5001, 33.8901, resolution=10),
                detection("three", 35.5002, 33.8902, resolution=10),
            ]
        )
        with self.assertRaisesRegex(ContractError, "coarser than 1 metre"):
            aggregate_public_grid(payload, release_id="blocked")

    def test_enforces_public_privacy_thresholds(self) -> None:
        payload = collection(
            [
                detection("one", 35.5000, 33.8900),
                detection("two", 35.5001, 33.8901),
                detection("three", 35.5002, 33.8902),
            ]
        )
        with self.assertRaisesRegex(ContractError, "at least 250 metres"):
            aggregate_public_grid(payload, release_id="blocked", grid_size_m=100)
        with self.assertRaisesRegex(ContractError, "smaller than three"):
            aggregate_public_grid(payload, release_id="blocked", min_cell_count=1)


if __name__ == "__main__":
    unittest.main()
