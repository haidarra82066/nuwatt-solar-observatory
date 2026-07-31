# Source registry

This public file records licence decisions for sources represented in the
repository. Restricted imagery asset records remain outside Git.

| Source | Intended use | Decision | Basis | Notes |
|---|---|---|---|---|
| LCEC, *Solar PV Status Report 2023* | National and governorate installed-capacity benchmark | Approved with attribution | Report states that reproduction is authorized when the source is acknowledged and the reproduction is not sold | Market/customs/survey estimate; not an AI location dataset |
| Bundled demo grid | Interface and API testing | Approved | Repository-authored CC0 synthetic data | Never describe as Lebanese observations |
| OpenStreetMap raster basemap | Interactive geographic context | Approved with attribution | OpenStreetMap tile use and attribution requirements | Not used for panel detection or model training |

## LCEC benchmark interpretation

The report estimates 1,081.27 MWp installed by the end of 2023. Its regional
figures are market-capacity context derived from company surveys, customs and
import information, stock, and implementation assumptions. They contain no
panel polygons or imagery-derived locations and therefore cannot populate the
AI heatmap.

Source: https://lcec.org.lb/sites/default/files/2025-10/Solar%20PV%20Status%20Report%202023_VF.pdf
