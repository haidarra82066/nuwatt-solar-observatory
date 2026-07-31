# MVP delivery plan

## Outcome

Deliver a fully working, validated public MVP covering 20-50 km² across four
representative Lebanese environments. The MVP includes an interactive map,
versioned data release, public API, reproducible methodology, uncertainty,
coverage, and a correction workflow.

The expected critical path after source access begins is **18-25 weeks**. Work
can overlap where dependencies allow; phase gates cannot be waived.

## Phase 0 — Repository and product foundation (complete)

**Duration:** 2 weeks equivalent

Deliverables:

- Next.js platform, interactive map, API, synthetic release, and data downloads
- evidence-state, uncertainty, and public-aggregation product contracts
- Python capacity/yield pipeline scaffold and PostGIS schema
- architecture, evaluation, imagery, privacy, operations, and contributor docs
- CI, Docker, type, lint, unit-test, and build gates

Exit criteria:

- all automated checks pass
- no synthetic metric is presented as measured data
- repository can be cloned and started from the README

## Phase 1 — Free-data feasibility and pilot selection

**Duration:** 2-3 weeks

Workstreams:

1. Build the Lebanon area-of-interest and administrative boundary catalogue.
2. Evaluate OSM/Overture/research building footprints and quantify coverage.
3. Build a Sentinel-2 multi-date quality and feature pipeline.
4. Register every candidate imagery source and licence decision.
5. Score candidate pilot areas for diversity, imagery, ground truth, and partners.
6. Implement contextual baselines based on roofs, land use, and settlement density.

Pilot strata:

- dense Beirut urban fabric
- Mount Lebanon suburban residential area
- Beqaa or comparable rural/agricultural area
- mixed commercial-residential area in the north or south

Exit criteria:

- four pilot areas total 20-50 km²
- adequate legal imagery exists for each area
- ground-truth and field-validation paths are identified
- candidate baseline and data-quality report are reproducible

## Phase 2 — Local training and validation dataset

**Duration:** 4-6 weeks

Workstreams:

1. Define PV, solar-thermal, shadow, tank, skylight, and dark-roof classes.
2. Annotate rooftop, ground, and canopy systems with array polygons.
3. Double-review a statistically meaningful subset.
4. Keep geographic and imagery acquisitions separated across splits.
5. Capture source, reviewer, ambiguity, roof type, and installation-size metadata.
6. Publish a dataset card without distributing restricted pixels.

Exit criteria:

- inter-annotator agreement meets the pre-registered threshold
- all four environments and hard negatives are represented
- restricted and public artefacts are cleanly separated
- test set is sealed before model selection

## Phase 3 — Detection, capacity, and yield models

**Duration:** 6-8 weeks

Benchmark:

- contextual and classical image-feature baseline
- YOLO-style instance segmentation
- U-Net/DeepLab/SegFormer-style semantic segmentation
- roof-aware two-stage classifier and segmenter
- high-resolution teacher with low-resolution student experiment

Workstreams:

1. Create reproducible training and inference manifests.
2. Evaluate by geography, source, roof type, mounting type, and size.
3. Calibrate confidence and select human-review thresholds.
4. Polygonize and validate geometry.
5. Fit capacity quantiles using array area, packing, tilt, and module-density priors.
6. Integrate versioned monthly and annual solar-yield assumptions.

Exit criteria:

- segmentation passes pre-registered high-resolution thresholds
- capacity P50 bias and P10-P90 coverage pass calibration gates
- low-resolution model beats the contextual baseline or its scope is narrowed
- a signed model card documents known exclusions

## Phase 4 — Public MVP release

**Duration:** 4-6 weeks

Workstreams:

1. Load approved observations and lineage into PostGIS.
2. Aggregate to public cells and municipalities.
3. Generate release GeoJSON/PMTiles and API materializations.
4. Replace synthetic dashboard data with the release-candidate contract.
5. Add coverage, imagery age, confidence, and model-version layers.
6. Implement corrections, opt-outs, analytics, monitoring, backups, and runbooks.
7. Run accessibility, security, privacy, licence, and performance reviews.

Exit criteria:

- platform works on mobile and desktop and meets WCAG 2.2 AA for core tasks
- model card, dataset card, methodology, release notes, and API are public
- source imagery is not redistributed without permission
- correction flow and operational ownership are live
- no unsupported national-completeness or actual-generation claim is present

## Phase 5 — Selective national scaling

**Duration:** 6-12 months, conditional

1. Publish a nationwide screening and coverage-priority layer.
2. Use active learning and uncertainty sampling to choose new labels and imagery.
3. Acquire very-high-resolution imagery only where information gain justifies cost.
4. Expand installer, university, municipality, and field-validation partnerships.
5. Release by region while preserving evidence-state differences.
6. Add temporal change only where comparable imagery vintages support it.

## Team

Minimum core team:

- product/partnership lead
- geospatial/data engineer
- computer-vision engineer
- full-stack engineer
- solar-performance modeller (part-time initially)
- annotation/validation lead plus local reviewers
- privacy/legal reviewer at data-source and release gates

## Decision log

The following decisions are deliberately reversible until the evidence says otherwise:

- imagery vendor
- segmentation architecture
- workflow orchestrator and model registry
- map-tile format beyond the foundation release

The following are product invariants:

- visible uncertainty and coverage
- separate evidence states
- immutable releases
- no actual-generation claim from imagery alone
- no sensitive household-level public profiling
