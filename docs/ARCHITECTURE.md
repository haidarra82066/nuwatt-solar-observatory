# Architecture

## Design principles

- **Evidence before aesthetics:** uncertainty, coverage, and provenance are first-class.
- **Provider independence:** no model or public contract assumes one imagery vendor.
- **Immutable releases:** a published dataset is superseded, never silently rewritten.
- **Public aggregation:** restricted geometries and identities do not enter public views.
- **Progressive fidelity:** free national screening and high-resolution detection remain distinct layers.

## System context

```text
Imagery + buildings + labels + solar resource
                    |
                    v
        Geospatial ingestion and QA
                    |
                    v
     Candidate model -> segmentation model
                    |
                    v
  Geometry QA -> capacity -> technical yield
                    |
                    v
        Validation and privacy policy
                    |
                    v
       PostGIS release materialization
                    |
              +-----+-----+
              |           |
              v           v
         Public API   Next.js platform
```

## Current foundation

The web application is a Next.js App Router project in `apps/web`. It reads a
bundled synthetic release, serves it through versioned route handlers, and passes
only serialized data into the interactive MapLibre client boundary.

The standard-library Python package in `services/pipeline` implements the first
executable capacity/yield contract. `infra/postgres/001_init.sql` defines the
production lineage and geospatial storage model.

## Target deployment

| Component | MVP choice | Scale path |
|---|---|---|
| Web/UI | Next.js standalone or Vercel | CDN-cached release pages |
| Public API | Next.js route handlers | Dedicated read API if demand requires |
| Database | PostgreSQL + PostGIS | Read replicas and materialized aggregates |
| Object storage | S3-compatible bucket | Versioned, lifecycle-managed buckets |
| Batch orchestration | Scheduled container jobs | Dagster, Prefect, or managed workflows |
| Model registry | MLflow-compatible metadata | Managed registry if governance requires |
| Tiles | Pre-generated PMTiles/vector tiles | CDN-hosted multi-resolution tiles |
| Monitoring | Structured logs and synthetic health checks | Traces, SLOs, and alerting |

## Environments

- `local`: bundled demo data, optional local PostGIS
- `preview`: pull-request deployment with synthetic or approved test data
- `staging`: restricted pilot data and release-candidate checks
- `production`: approved immutable releases only

No production secret or restricted imagery URL is exposed through a `NEXT_PUBLIC_`
environment variable.

## Production release flow

1. Register source assets and licence decisions.
2. Run imagery QA and candidate generation.
3. Run model inference with immutable model and configuration identifiers.
4. Validate geometry, calibration, and regional performance.
5. Apply aggregation and privacy policies.
6. Materialize release tables and export public GeoJSON/PMTiles.
7. Approve the model card, dataset card, and release notes.
8. Atomically switch the public release alias.
