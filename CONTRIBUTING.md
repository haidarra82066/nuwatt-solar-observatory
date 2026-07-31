# Contributing

Thank you for helping build a transparent solar-data public good.

## Before opening a change

1. Create a focused branch.
2. Keep raw or licensed imagery outside Git.
3. Add provenance for every new dataset.
4. Never add household names, contact information, or unaggregated sensitive locations.
5. Label model outputs as estimates and include the imagery date, model version, and confidence.

## Local checks

Run `npm run check` before opening a pull request. Changes to the Python pipeline
must include tests in `services/pipeline/tests`. Changes to a public data contract
must update `docs/DATA_CONTRACTS.md` and the OpenAPI definition.

## Commit style

Use short imperative messages, for example `Add uncertainty filter to map`.
