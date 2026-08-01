# Source registry

This public file records licence decisions for sources represented in the
repository. Restricted imagery asset records remain outside Git.

| Source | Intended use | Decision | Basis | Notes |
|---|---|---|---|---|
| LCEC, *Solar PV Status Report 2023* | National and governorate installed-capacity benchmark | Approved with attribution | Report states that reproduction is authorized when the source is acknowledged and the reproduction is not sold | Market/customs/survey estimate; not an AI location dataset |
| Bundled demo grid | Interface and API testing | Approved | Repository-authored CC0 synthetic data | Never describe as Lebanese observations |
| OpenStreetMap raster basemap | Interactive geographic context | Approved with attribution | OpenStreetMap tile use and attribution requirements | Not used for panel detection or model training |
| OpenAerialMap asset `5f2bd318b0052e00067dbaef` | Historical Beirut Port micro-pilot | Approved with attribution for this experiment | Asset declares CC BY 4.0 | Acquired 2020-08-04 after the port explosion; 0.12124 m GSD; not representative or current inventory evidence |
| `agademer/yolo-remote-sensing-photovoltaic` weights | Historical Beirut Port micro-pilot inference | Approved with attribution for this experiment | Model repository declares CC BY 4.0 | France-trained model failed transfer validation on the Beirut Port scene; do not treat candidates as detections |

## LCEC benchmark interpretation

The report estimates 1,081.27 MWp installed by the end of 2023. Its regional
figures are market-capacity context derived from company surveys, customs and
import information, stock, and implementation assumptions. They contain no
panel polygons or imagery-derived locations and therefore cannot populate the
AI heatmap.

Source: https://lcec.org.lb/sites/default/files/2025-10/Solar%20PV%20Status%20Report%202023_VF.pdf

## First open-imagery experiment

The 1 August 2026 Beirut Port run produced 39 unique model candidates and zero
accepted detections after manual review. Its source licence passed, but its
fit-for-purpose gate failed. See
[`experiments/BEIRUT_PORT_OAM_2020_V1.md`](experiments/BEIRUT_PORT_OAM_2020_V1.md)
and the machine-readable manifest for the complete decision trail.
