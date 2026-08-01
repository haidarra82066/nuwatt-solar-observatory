# NuWatt Open Solar Observatory

An open, versioned, and uncertainty-aware geospatial platform for understanding
Lebanon's distributed photovoltaic fleet.

> **Current status: public beta with a real AI screening layer.** The primary
> observatory publishes a privacy-safe heatmap of 21 historical large-solar
> candidates screened by the Satlas AI system; two have independent
> OpenStreetMap corroboration. It also presents the 1,081.27 MWp LCEC market
> benchmark as a separate research layer. No imagery-derived capacity is
> claimed for the AI candidates, and the release is not a rooftop inventory.

## What is included

- A responsive Next.js observatory with an interactive Lebanon map
- Distinct `screened`, `corroborated`, and regional `research benchmark` layers
- A combined interactive map with region, evidence, metric, and appearance controls
- Public JSON and GeoJSON API routes
- A versioned sample data release and downloadable OpenAPI definition
- A Python capacity-estimation pipeline and privacy-safe AI-detection publisher
- A PostGIS-ready production schema
- Docker, continuous integration, tests, governance, privacy, and imagery-policy documentation
- A phase-gated plan from foundation to a validated public MVP
- Reproducible result records for the Beirut open-imagery micro-pilot and the
  nationwide Satlas large-solar screening experiment

## Product boundary

The observatory estimates the location and scale of PV installations from
imagery and supporting geospatial evidence. It does **not** infer certified
system ratings or actual delivered electricity from imagery alone. Public
outputs are aggregated wherever exact locations could create privacy or
infrastructure-security concerns.

## Quick start

Requirements: Node.js 22+, npm 10+, and optionally Python 3.11+.

```bash
npm install
npm run dev
```

On Windows PowerShell with script execution disabled, use `npm.cmd` instead:

```powershell
npm.cmd install
npm.cmd run dev
```

Open [http://localhost:3000](http://localhost:3000). The map uses OpenStreetMap
raster tiles by default and remains navigable with its data overlays if tiles
are unavailable.

## Validation

```bash
npm run check
```

The Python pipeline can also enrich a GeoJSON feature collection:

```bash
python -m services.pipeline.src.nuwatt_pipeline.cli \
  services/pipeline/examples/arrays.geojson \
  artifacts/enriched-arrays.geojson
```

After a licensed model run has produced restricted array-level detections, make
a public release with at least 250 m cells and sparse-cell suppression:

```bash
python -m services.pipeline.src.nuwatt_pipeline.publish \
  restricted/detections.geojson \
  artifacts/lbn-ai-2027-01.geojson \
  --release lbn-ai-2027-01 --grid-size-m 250 --min-cell-count 3
```

The real screening release is the default public observatory layer and is also
available through `GET /api/v1/screening`. The older P10/P50/P90 observation
contract remains a separate synthetic API sample until a validated panel-level
detection release passes imagery, licensing, lineage, and privacy gates.

## Repository map

```text
apps/web/                 Public platform, API, and bundled demo release
services/pipeline/        Geospatial contracts and capacity estimation
infra/postgres/           PostGIS schema and database bootstrap
docs/                     Architecture, delivery plan, policy, and data contracts
.github/workflows/        Automated quality gates
```

## Delivery plan

The executable roadmap is in [docs/ROADMAP.md](docs/ROADMAP.md). The shortest
credible path is a 20-50 km², four-environment pilot followed by a public beta.
The decisive experiment is whether free lower-resolution imagery can rank PV
candidates materially better than a simple contextual baseline.

The high-resolution source check is documented in
[docs/experiments/BEIRUT_PORT_OAM_2020_V1.md](docs/experiments/BEIRUT_PORT_OAM_2020_V1.md).
It validated the review pipeline but rejected every proposal. The next free
experiment is documented in
[docs/experiments/SATLAS_LEBANON_2024_V1.md](docs/experiments/SATLAS_LEBANON_2024_V1.md)
and publishes a nationwide 5 km screening layer for large solar installations.

## API

The foundation API is available under `/api/v1`:

- `GET /api/v1/health`
- `GET /api/v1/benchmark`
- `GET /api/v1/screening`
- `GET /api/v1/summary`
- `GET /api/v1/cells?status=detected&governorate=Beirut`
- `GET /api/v1/municipalities`

See [apps/web/public/openapi.json](apps/web/public/openapi.json) for the contract.

## Contributing and licensing

Read [CONTRIBUTING.md](CONTRIBUTING.md) before submitting changes. Code is
Apache-2.0; the bundled synthetic data is CC0. Imagery, third-party datasets,
and NuWatt brand assets retain their own terms.
