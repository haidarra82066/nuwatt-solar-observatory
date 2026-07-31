"""Transparent first-order PV capacity and technical-yield estimation.

The foundation implementation uses three pre-declared assumption scenarios. A
production version should fit calibrated quantiles or run a documented Monte
Carlo model using locally validated distributions.
"""

from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class EstimateRange:
    """Ordered P10, P50, and P90 estimates."""

    p10: float
    p50: float
    p90: float

    def __post_init__(self) -> None:
        if min(self.p10, self.p50, self.p90) < 0:
            raise ValueError("Estimate values cannot be negative")
        if not self.p10 <= self.p50 <= self.p90:
            raise ValueError("Estimate range must satisfy P10 <= P50 <= P90")

    def rounded(self, digits: int = 3) -> "EstimateRange":
        return EstimateRange(
            p10=round(self.p10, digits),
            p50=round(self.p50, digits),
            p90=round(self.p90, digits),
        )


@dataclass(frozen=True)
class EstimationAssumptions:
    """Scenario assumptions for projected array area to DC capacity."""

    packing_factor: EstimateRange = EstimateRange(0.78, 0.86, 0.92)
    tilt_correction: EstimateRange = EstimateRange(1.00, 1.08, 1.18)
    module_density_kwp_m2: EstimateRange = EstimateRange(0.16, 0.19, 0.22)
    specific_yield_kwh_kwp_year: EstimateRange = EstimateRange(1_350, 1_480, 1_600)


def estimate_capacity(
    projected_array_area_m2: float,
    assumptions: EstimationAssumptions | None = None,
) -> EstimateRange:
    """Estimate DC capacity in kWp from detected plan-view array area."""

    if projected_array_area_m2 < 0:
        raise ValueError("Projected array area cannot be negative")

    model = assumptions or EstimationAssumptions()
    capacity = EstimateRange(
        p10=(
            projected_array_area_m2
            * model.packing_factor.p10
            * model.tilt_correction.p10
            * model.module_density_kwp_m2.p10
        ),
        p50=(
            projected_array_area_m2
            * model.packing_factor.p50
            * model.tilt_correction.p50
            * model.module_density_kwp_m2.p50
        ),
        p90=(
            projected_array_area_m2
            * model.packing_factor.p90
            * model.tilt_correction.p90
            * model.module_density_kwp_m2.p90
        ),
    )
    return capacity.rounded()


def estimate_generation(
    capacity_kwp: EstimateRange,
    assumptions: EstimationAssumptions | None = None,
) -> EstimateRange:
    """Estimate annual technical generation in MWh.

    The result is technical expected yield, not measured or delivered energy.
    """

    model = assumptions or EstimationAssumptions()
    generation = EstimateRange(
        p10=capacity_kwp.p10 * model.specific_yield_kwh_kwp_year.p10 / 1_000,
        p50=capacity_kwp.p50 * model.specific_yield_kwh_kwp_year.p50 / 1_000,
        p90=capacity_kwp.p90 * model.specific_yield_kwh_kwp_year.p90 / 1_000,
    )
    return generation.rounded()
