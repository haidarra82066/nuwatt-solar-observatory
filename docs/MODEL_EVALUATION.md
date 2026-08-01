# Model evaluation plan

## Experiment log

The first free-data micro-pilot, `beirut-port-oam-2020-v1`, completed on
1 August 2026. An open photovoltaic segmentation model generated 39 unique
review candidates from 0.383 km2 of CC BY 4.0 post-explosion Beirut Port
orthomosaic. Manual review accepted zero candidates. The source and model
combination therefore failed the transfer and fit-for-purpose gate; no heatmap,
capacity estimate, or public detection release was emitted. This negative result
does not measure recall because the scene has no established positive reference
labels.

Full record: [`experiments/BEIRUT_PORT_OAM_2020_V1.md`](experiments/BEIRUT_PORT_OAM_2020_V1.md).

## Decisive MVP experiment

Can a low-resolution, building-level model identify likely PV installations
materially better than a baseline using only roof size, land use, and local
adoption density?

If the answer is no, low-resolution imagery remains useful for large arrays and
candidate-area prioritization only. The product must not force a residential
rooftop interpretation.

## Dataset split

Use geographic, not random-chip, separation. Hold out municipalities and imagery
acquisitions to measure cross-region and cross-provider shift. Stratify reporting by:

- dense urban, suburban, rural/agricultural, and mixed commercial settings
- rooftop, ground-mounted, and canopy installations
- installation-size bins
- roof material and morphology
- imagery provider, resolution, season, and off-nadir angle
- hard negatives, especially solar thermal collectors, tanks, skylights, and shadows

## Required metrics

### Candidate classification

- precision, recall, F1, and PR-AUC
- expected calibration error and reliability diagram
- recall at a fixed human-review budget
- lift over contextual and prevalence baselines

### Segmentation

- polygon and pixel precision/recall
- intersection over union and Dice score
- instance average precision by size
- boundary and area error

### Capacity and yield

- mean absolute error and bias for P50
- empirical coverage of P10-P90 intervals
- error by mounting type, size, and region
- municipal aggregate error and uncertainty coverage

## Release gates

Thresholds must be set before the hidden test set is evaluated. A release fails
when a critical region or system-size slice is unsafe even if the national mean
looks acceptable. Model cards record failures and scoped exclusions.

## Monitoring

Track input drift, prediction drift, correction rates, source-imagery age, and
performance on newly verified sites. Material drift triggers review and a new
version; it never silently mutates an existing release.
