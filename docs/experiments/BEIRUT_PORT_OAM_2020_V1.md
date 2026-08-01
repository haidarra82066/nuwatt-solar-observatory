# Beirut Port open-imagery experiment v1

## Outcome

**Disposition: needs revision. No panel detections were accepted and no public
observation release was created.**

The first free, end-to-end Lebanon inference run completed on 1 August 2026.
The model produced 64 proposals at a deliberately permissive threshold. After
overlap deduplication, a human reviewed all 39 unique candidates. Every proposal
was blast debris, a shipping container, a vehicle, a damaged industrial
structure, or an orthomosaic edge artifact. The accepted detection count is
therefore zero.

This is a useful feasibility result, not a solar inventory. It proves the legal
asset-to-model-to-review path and prevents a visibly plausible but false heatmap
from entering the product.

## Scope and source

| Field | Value |
|---|---|
| Area | Beirut Port, Lebanon |
| Acquisition | 4 August 2020, after the port explosion |
| Valid imagery footprint | 0.382629 km2 |
| Ground sample distance | 0.12124 m/pixel |
| OpenAerialMap asset | `5f2bd318b0052e00067dbaef` |
| Imagery licence | CC BY 4.0 |
| Imagery SHA-256 | `b5d285a98ee97153e99b9e7b0be8784c5f68442bdfb6f14b926af4bdd24c73c9` |

Attribution: UAV imagery supplied by Rabih El Zein (`@rabzthecopter`),
orthoimage by `@GeoConor`, distributed through OpenAerialMap.

The licence permits this historical feasibility experiment and derived-result
publication with attribution. The source is not fit for a current inventory:
it is a tiny, non-representative post-disaster industrial scene.

## Model and run

The run used the CC BY 4.0
[`agademer/yolo-remote-sensing-photovoltaic`](https://huggingface.co/agademer/yolo-remote-sensing-photovoltaic)
segmentation weights. The Ultralytics AGPL-3.0 runtime was confined to an
isolated local batch-research environment; neither runtime nor weights are
committed to or deployed with the Apache-2.0 web application.

- Source pixels were resampled from 0.12124 m to the model's 0.2 m scale.
- Twenty-five 960 x 960 pixel tiles were inferred with 20% overlap.
- The confidence threshold was 0.03 to favour recall during review.
- Bounding-box overlap removed repeated proposals from adjacent tiles.
- A human inspected every remaining proposal against the source pixels.

The maximum proposal confidence was 0.253984. Confidence was not treated as
validation, and no threshold was lowered after seeing the result.

## Validation result

| Check | Result |
|---|---:|
| Raw model proposals | 64 |
| Unique review candidates | 39 |
| Accepted detections | 0 |
| Verified detections | 0 |
| Public aggregate cells | 0 |
| Capacity range emitted | No |
| Technical-yield range emitted | No |

The experiment fails the fit-for-purpose gate because the imagery contains
almost no intact rooftop stock and the France-trained model shows severe domain
shift on blast debris and port objects. Precision on this reviewed scene is 0%;
recall cannot be estimated because the scene contains no established positive
reference labels.

## Publication decision

The restricted proposal geometries and source imagery remain outside Git. The
public repository contains only this report, the run manifest, and a coverage
summary GeoJSON. The platform must not infer zero solar prevalence outside this
footprint, or treat this result as evidence about Lebanon in 2026.

The next free-data experiment should use Sentinel-2 only for large-installation
screening and use a separate, legally reusable intact urban or agricultural
high-resolution scene for rooftop-model validation. A positive public heatmap
still requires at least three accepted detections per 250 m-or-larger cell.
