# Database Models Documentation

## Overview

The GeoSpot application uses PostgreSQL with the PostGIS extension for geospatial data storage. The database schema consists of two main tables with a one-to-many relationship between datasets and their features.

## Database Setup

- **Database**: PostgreSQL with PostGIS extension
- **Engine**: Async SQLAlchemy with asyncpg driver
- **Spatial Reference**: SRID 4326 (WGS84)
- **Connection**: Async with connection pooling

## Models

### Dataset Model
**Table Name**: `datasets`

Represents metadata about uploaded GeoJSON files.

#### Schema
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | Integer (SERIAL) | Primary Key, Index | Auto-incrementing unique identifier |
| name | String (VARCHAR 255) | Unique, Not Null, Index | Name of the uploaded dataset file |
| description | Text | Nullable | Description of the dataset |
| uploaded_at | DateTime | Default NOW() | Timestamp of upload, defaults to current time |
| feature_count | Integer | Default 0 | Number of features in the dataset |
| bounds | Geometry (Polygon, SRID 4326) | Nullable | Bounding box of all features in the dataset |
| file_size_bytes | Integer | Nullable | Size of the original file in bytes |

#### Indexes
- `id` (Primary Key)
- `name` (Unique, BTree)
- `uploaded_at` (Descending BTree) - For chronological ordering

#### SQL Definition
```sql
CREATE TABLE datasets (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    uploaded_at TIMESTAMP DEFAULT NOW(),
    feature_count INTEGER DEFAULT 0,
    bounds GEOMETRY(Polygon, 4326),
    file_size_bytes INTEGER,
    CONSTRAINT unique_dataset_name UNIQUE(name)
);

CREATE INDEX idx_datasets_uploaded ON datasets(uploaded_at DESC);
```

#### Relationships
- One-to-many with `features` table via `dataset_id` foreign key
- Cascading delete: When a dataset is deleted, all associated features are automatically deleted

#### Constraints
- Unique constraint on `name` field to prevent duplicate dataset uploads
- Foreign key constraint for related features

### Feature Model
**Table Name**: `features`

Represents individual GeoJSON features within a dataset.

#### Schema
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | Integer (SERIAL) | Primary Key, Index | Auto-incrementing unique identifier |
| dataset_id | Integer | Foreign Key, Not Null, Index | References parent dataset |
| geometry | Geometry (GEOMETRY, SRID 4326) | Not Null | Geometric representation of the feature |
| properties | JSONB | Default {} | Key-value properties associated with the feature |
| created_at | DateTime | Default NOW() | Timestamp of creation, defaults to current time |

#### Indexes
- `id` (Primary Key)
- `dataset_id` (BTree) - For joining with datasets
- `geometry` (GIST) - Spatial index for efficient geometric queries
- `properties` (GIN) - Index for JSON property queries

#### SQL Definition
```sql
CREATE TABLE features (
    id SERIAL PRIMARY KEY,
    dataset_id INTEGER NOT NULL,
    geometry GEOMETRY(Geometry, 4326) NOT NULL,
    properties JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT fk_dataset 
        FOREIGN KEY(dataset_id) 
        REFERENCES datasets(id) 
        ON DELETE CASCADE
);

CREATE INDEX idx_features_geometry ON features USING GIST(geometry);
CREATE INDEX idx_features_dataset ON features(dataset_dataset_id);
CREATE INDEX idx_features_properties ON features USING GIN(properties);
```

#### Relationships
- Many-to-one with `datasets` table via `dataset_id` foreign key
- Cascading delete: When a dataset is deleted, all associated features are automatically deleted

#### Constraints
- Foreign key constraint linking to datasets table
- Cascade delete on dataset removal
- Geometry field uses PostGIS geometry type for spatial operations

## Spatial Capabilities

### Geometry Types
- **Dataset.bounds**: POLYGON geometry for bounding box representation
- **Feature.geometry**: GEOMETRY type supporting all GeoJSON geometry types (Point, LineString, Polygon, etc.)

### PostGIS Functions Used
- `ST_GeomFromGeoJSON`: Convert GeoJSON to PostGIS geometry
- `ST_AsGeoJSON`: Convert PostGIS geometry back to GeoJSON
- `ST_Envelope`: Create bounding box envelope
- `ST_Union`: Combine geometries for bounding box calculation
- `ST_Contains`, `ST_Intersects`: Spatial relationship queries (not yet implemented but possible)

### Spatial Indexing
- GIST (Generalized Search Tree) index on geometry field for fast spatial queries
- Bounding box calculations using spatial functions
- Optimized storage and retrieval of geometric data

## Data Flow

### Upload Process
1. Dataset metadata is created in `datasets` table
2. Individual features from GeoJSON are inserted into `features` table with `dataset_id`
3. Dataset bounds are calculated using spatial functions and updated in `datasets` table

### Retrieval Process
1. Dataset metadata retrieved from `datasets` table
2. Associated features retrieved from `features` table using `dataset_id`
3. Geometries converted back to GeoJSON format for API responses

## Security Considerations

### SQL Injection Prevention
- All database queries use parameterized queries
- SQLAlchemy ORM provides built-in protection
- Raw SQL queries are carefully parameterized

### Data Validation
- Geometric validation using Shapely library before database insertion
- File size and content validation before processing
- GeoJSON structure validation using geojson library

## Performance Optimizations

### Indexing Strategy
- BTree indexes for traditional lookups (id, name, timestamps)
- GIST indexes for spatial queries on geometry
- GIN indexes for JSON property searches

### Connection Pooling
- Async SQLAlchemy engine with connection pooling
- Configurable pool size (default 5) and overflow (default 10)
- Connection verification before use (`pool_pre_ping`)

### Query Optimization
- Use of `selectinload`/`joinedload` for relationship queries (when implemented)
- Efficient pagination with skip/limit
- Minimal data retrieval based on API needs