# Product definition

## Mission

Build Lebanon's first open, versioned, and continuously improvable geospatial
observatory for distributed solar energy.

## Problem

National solar-market estimates are valuable but do not provide a regularly
updated, spatially detailed public view of installed systems. Imagery can close
part of that gap, but only if resolution, licensing, model uncertainty, privacy,
and validation are made visible in the product itself.

## Public users

- Municipal and national energy planners
- Researchers and universities
- Civil society and journalists
- Solar installers and market analysts
- NuWatt partners and connected-site operators

## Core jobs

1. Compare PV adoption, capacity density, and technical yield by public geography.
2. Distinguish directly detected, AI-estimated, and externally verified evidence.
3. See imagery date, resolution, coverage gaps, model version, and uncertainty.
4. Download a stable release or consume the same aggregates through an API.
5. Submit corrections without exposing household identities.

## Explicit non-goals for the MVP

- Exact module counting nationwide
- Certified system-nameplate ratings
- Actual energy production inferred from imagery
- Scraping or training on Google Earth/Maps screenshots
- Publication of household identities or sensitive exact locations
- A national-completeness claim from Sentinel-2 screening

## Success metrics

### Product

- Map, methodology, release download, and API are publicly accessible.
- At least four representative pilot environments are included.
- Every public value carries an evidence status and release identifier.
- Core Web Vitals and WCAG 2.2 AA checks pass for main workflows.

### Model

- High-resolution precision and recall thresholds are fixed before test evaluation.
- Results are published by region, roof type, system size, and imagery source.
- Capacity P50 bias and P10-P90 empirical coverage are reported.
- Confidence calibration is materially better than an uncalibrated baseline.

### Data

- 100% of published observations have imagery, model, and release lineage.
- 100% of sources have a recorded licence decision.
- Zero restricted source images or household identifiers are distributed.
