BEGIN;

CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TYPE evidence_status AS ENUM ('estimated', 'detected', 'verified');
CREATE TYPE release_status AS ENUM ('draft', 'candidate', 'published', 'superseded');

CREATE TABLE imagery_sources (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    provider text NOT NULL,
    product text NOT NULL,
    licence_identifier text NOT NULL,
    training_permitted boolean NOT NULL DEFAULT false,
    inference_permitted boolean NOT NULL DEFAULT false,
    derivative_publication_permitted boolean NOT NULL DEFAULT false,
    source_pixels_redistributable boolean NOT NULL DEFAULT false,
    attribution_text text,
    restrictions jsonb NOT NULL DEFAULT '{}'::jsonb,
    reviewed_by text NOT NULL,
    reviewed_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE (provider, product, licence_identifier)
);

CREATE TABLE imagery_assets (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    source_id uuid NOT NULL REFERENCES imagery_sources(id),
    provider_asset_id text NOT NULL,
    acquired_at timestamptz NOT NULL,
    ground_sample_distance_m numeric(7,3) NOT NULL CHECK (ground_sample_distance_m > 0),
    cloud_fraction numeric(5,4) CHECK (cloud_fraction BETWEEN 0 AND 1),
    usable_fraction numeric(5,4) NOT NULL CHECK (usable_fraction BETWEEN 0 AND 1),
    footprint geometry(MultiPolygon, 4326) NOT NULL,
    restricted_uri text,
    checksum text,
    quality jsonb NOT NULL DEFAULT '{}'::jsonb,
    created_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE (source_id, provider_asset_id)
);

CREATE INDEX imagery_assets_footprint_gix ON imagery_assets USING gist (footprint);
CREATE INDEX imagery_assets_acquired_idx ON imagery_assets (acquired_at DESC);

CREATE TABLE model_versions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    version text NOT NULL,
    task text NOT NULL,
    source_revision text NOT NULL,
    artifact_uri text NOT NULL,
    artifact_checksum text NOT NULL,
    input_contract jsonb NOT NULL,
    metrics jsonb NOT NULL DEFAULT '{}'::jsonb,
    model_card_uri text,
    approved_for_release boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE (name, version)
);

CREATE TABLE model_runs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    model_version_id uuid NOT NULL REFERENCES model_versions(id),
    imagery_asset_id uuid NOT NULL REFERENCES imagery_assets(id),
    configuration jsonb NOT NULL,
    started_at timestamptz NOT NULL,
    completed_at timestamptz,
    status text NOT NULL CHECK (status IN ('queued', 'running', 'succeeded', 'failed')),
    logs_uri text,
    UNIQUE (model_version_id, imagery_asset_id, configuration)
);

CREATE TABLE observations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    public_id text NOT NULL UNIQUE,
    model_run_id uuid NOT NULL REFERENCES model_runs(id),
    evidence evidence_status NOT NULL,
    installation_type text NOT NULL CHECK (installation_type IN ('rooftop', 'ground', 'canopy', 'unknown')),
    geometry geometry(MultiPolygon, 4326) NOT NULL,
    centroid geometry(Point, 4326) GENERATED ALWAYS AS (ST_PointOnSurface(geometry)) STORED,
    array_area_m2 numeric(14,3) NOT NULL CHECK (array_area_m2 >= 0),
    confidence numeric(5,4) NOT NULL CHECK (confidence BETWEEN 0 AND 1),
    capacity_p10_kwp numeric(14,3) NOT NULL CHECK (capacity_p10_kwp >= 0),
    capacity_p50_kwp numeric(14,3) NOT NULL CHECK (capacity_p50_kwp >= capacity_p10_kwp),
    capacity_p90_kwp numeric(14,3) NOT NULL CHECK (capacity_p90_kwp >= capacity_p50_kwp),
    generation_p10_mwh numeric(14,3) NOT NULL CHECK (generation_p10_mwh >= 0),
    generation_p50_mwh numeric(14,3) NOT NULL CHECK (generation_p50_mwh >= generation_p10_mwh),
    generation_p90_mwh numeric(14,3) NOT NULL CHECK (generation_p90_mwh >= generation_p50_mwh),
    capacity_model_version text NOT NULL,
    yield_model_version text NOT NULL,
    municipality_code text,
    district_code text,
    governorate_code text,
    quality_flags jsonb NOT NULL DEFAULT '[]'::jsonb,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX observations_geometry_gix ON observations USING gist (geometry);
CREATE INDEX observations_centroid_gix ON observations USING gist (centroid);
CREATE INDEX observations_admin_idx ON observations (governorate_code, district_code, municipality_code);
CREATE INDEX observations_evidence_idx ON observations (evidence, confidence DESC);

CREATE TABLE validation_events (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    observation_id uuid NOT NULL REFERENCES observations(id),
    validation_type text NOT NULL CHECK (validation_type IN ('annotation_review', 'installer', 'field', 'permit', 'telemetry', 'correction')),
    decision text NOT NULL CHECK (decision IN ('confirmed', 'rejected', 'modified', 'uncertain')),
    restricted_evidence_uri text,
    reviewer_role text NOT NULL,
    notes_restricted text,
    occurred_at timestamptz NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE dataset_releases (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    slug text NOT NULL UNIQUE,
    schema_version text NOT NULL,
    status release_status NOT NULL DEFAULT 'draft',
    data_cutoff_at timestamptz NOT NULL,
    approved_at timestamptz,
    published_at timestamptz,
    supersedes_id uuid REFERENCES dataset_releases(id),
    model_card_uri text,
    dataset_card_uri text,
    release_notes_uri text,
    public_checksum text,
    created_at timestamptz NOT NULL DEFAULT now(),
    CHECK ((status <> 'published') OR (approved_at IS NOT NULL AND published_at IS NOT NULL))
);

CREATE TABLE aggregate_cells (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    release_id uuid NOT NULL REFERENCES dataset_releases(id),
    cell_id text NOT NULL,
    aggregation_system text NOT NULL,
    aggregation_resolution integer NOT NULL,
    geometry geometry(Polygon, 4326) NOT NULL,
    municipality_name text,
    district_name text,
    governorate_name text,
    evidence evidence_status NOT NULL,
    installation_count integer NOT NULL CHECK (installation_count >= 0),
    capacity_p10_mwp numeric(14,4) NOT NULL CHECK (capacity_p10_mwp >= 0),
    capacity_p50_mwp numeric(14,4) NOT NULL CHECK (capacity_p50_mwp >= capacity_p10_mwp),
    capacity_p90_mwp numeric(14,4) NOT NULL CHECK (capacity_p90_mwp >= capacity_p50_mwp),
    generation_p10_gwh numeric(14,4) NOT NULL CHECK (generation_p10_gwh >= 0),
    generation_p50_gwh numeric(14,4) NOT NULL CHECK (generation_p50_gwh >= generation_p10_gwh),
    generation_p90_gwh numeric(14,4) NOT NULL CHECK (generation_p90_gwh >= generation_p50_gwh),
    mean_confidence numeric(5,4) NOT NULL CHECK (mean_confidence BETWEEN 0 AND 1),
    coverage_fraction numeric(5,4) NOT NULL CHECK (coverage_fraction BETWEEN 0 AND 1),
    latest_imagery_at timestamptz NOT NULL,
    minimum_imagery_resolution_m numeric(7,3) NOT NULL,
    suppressed boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE (release_id, aggregation_system, aggregation_resolution, cell_id)
);

CREATE INDEX aggregate_cells_geometry_gix ON aggregate_cells USING gist (geometry);
CREATE INDEX aggregate_cells_release_idx ON aggregate_cells (release_id, evidence);

CREATE VIEW public_published_cells AS
SELECT
    r.slug AS release_slug,
    c.cell_id,
    c.geometry,
    c.municipality_name,
    c.district_name,
    c.governorate_name,
    c.evidence,
    c.installation_count,
    c.capacity_p10_mwp,
    c.capacity_p50_mwp,
    c.capacity_p90_mwp,
    c.generation_p10_gwh,
    c.generation_p50_gwh,
    c.generation_p90_gwh,
    c.mean_confidence,
    c.coverage_fraction,
    c.latest_imagery_at,
    c.minimum_imagery_resolution_m
FROM aggregate_cells c
JOIN dataset_releases r ON r.id = c.release_id
WHERE r.status = 'published' AND c.suppressed = false;

COMMIT;
