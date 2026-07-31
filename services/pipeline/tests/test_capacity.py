from __future__ import annotations

import sys
import unittest
from pathlib import Path


SRC = Path(__file__).resolve().parents[1] / "src"
sys.path.insert(0, str(SRC))

from nuwatt_pipeline.capacity import EstimateRange, estimate_capacity, estimate_generation
from nuwatt_pipeline.cli import enrich
from nuwatt_pipeline.contracts import ContractError


class CapacityTests(unittest.TestCase):
    def test_capacity_is_ordered_and_scales_with_area(self) -> None:
        small = estimate_capacity(10)
        large = estimate_capacity(100)

        self.assertLess(small.p10, small.p50)
        self.assertLess(small.p50, small.p90)
        self.assertAlmostEqual(large.p50, small.p50 * 10, places=2)

    def test_generation_is_technical_range(self) -> None:
        generation = estimate_generation(EstimateRange(5, 6, 7))

        self.assertEqual(generation.p10, 6.75)
        self.assertEqual(generation.p50, 8.88)
        self.assertEqual(generation.p90, 11.2)

    def test_negative_area_is_rejected(self) -> None:
        with self.assertRaises(ValueError):
            estimate_capacity(-1)

    def test_geojson_enrichment(self) -> None:
        payload = {
            "type": "FeatureCollection",
            "features": [
                {
                    "type": "Feature",
                    "geometry": {"type": "Polygon", "coordinates": []},
                    "properties": {
                        "status": "detected",
                        "confidence": 0.84,
                        "array_area_m2": 48.0,
                    },
                }
            ],
        }

        result = enrich(payload)
        properties = result["features"][0]["properties"]
        self.assertIn("capacity_kwp", properties)
        self.assertEqual(properties["estimation_model"], "foundation-scenario-v1")

    def test_invalid_status_is_rejected(self) -> None:
        payload = {
            "type": "FeatureCollection",
            "features": [
                {
                    "type": "Feature",
                    "geometry": {"type": "Point", "coordinates": [0, 0]},
                    "properties": {
                        "status": "certain",
                        "confidence": 1.0,
                        "array_area_m2": 10,
                    },
                }
            ],
        }
        with self.assertRaises(ContractError):
            enrich(payload)


if __name__ == "__main__":
    unittest.main()
