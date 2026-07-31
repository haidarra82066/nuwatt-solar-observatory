# Repository guidance

## Scope

This repository contains the public NuWatt Open Solar Observatory platform and
the foundation of its geospatial evidence pipeline.

## Required checks

Run `npm run check` after code or contract changes. Do not commit generated
`.next`, raw imagery, model checkpoints, or local environment files.

## Product invariants

- Never present synthetic values as measured Lebanese solar data.
- Keep `estimated`, `detected`, and `verified` evidence distinct.
- Use P10/P50/P90 ranges for imagery-derived capacity and technical yield.
- Do not describe technical yield as actual electricity generation.
- Public records must not identify or profile households.
- Every production data source requires a recorded licence decision.
- Published releases are immutable and versioned.

## Architecture

- Prefer React Server Components for static and data-oriented UI.
- Keep client components narrow and limited to true interaction boundaries.
- Version public API and GeoJSON contract changes.
- Put pipeline logic in `services/pipeline`, not in the UI.
- Put restricted source imagery and validation evidence outside Git.
