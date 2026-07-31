# Data contracts

## Evidence states

| State | Meaning | Minimum requirement |
|---|---|---|
| `estimated` | Contextual or low-resolution model indicates likely PV | Calibrated probability and declared inference inputs |
| `detected` | PV is visible in adequate-resolution imagery | Physical detection threshold and imagery QA pass |
| `verified` | External evidence confirms the installation | Traceable installer, field, permit, or operational record |

The states describe provenance, not an ordering that allows `estimated` data to
be relabelled as `detected` merely because confidence is high.

## Public cell schema v1

Required fields:

- `id`: stable release-scoped cell identifier
- `municipality`, `district`, `governorate`
- `status`: one of the evidence states above
- `installations`: candidate installation count
- `capacity_p10_mwp`, `capacity_p50_mwp`, `capacity_p90_mwp`
- `generation_p10_gwh`, `generation_p50_gwh`, `generation_p90_gwh`
- `confidence`: calibrated value in `[0, 1]`
- `coverage_km2`
- `imagery_date`
- `imagery_resolution_m`

Production records also require source asset, model run, aggregation policy, and
dataset release foreign keys in PostGIS.

## Invariants

- P10 ≤ P50 ≤ P90 for every uncertainty range.
- Confidence is finite and between zero and one.
- Polygon rings are valid and closed.
- An imagery date cannot be later than release approval.
- A public cell contains no household identifier.
- `verified` records link to a restricted validation event.
- Zero observations are different from unavailable or unscanned coverage.

## Versioning

Breaking changes create a new API and schema version. Additive fields can be
introduced within v1 when consumers can safely ignore them. Dataset releases use
immutable identifiers such as `lbn-pilot-2027-01`.
