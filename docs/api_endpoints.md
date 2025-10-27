# API Endpoints Documentation

## Root Endpoints

### GET `/`
**Description**: Root endpoint returning basic service information
**Authentication**: None required
**Response**:
```json
{
  "message": "Welcome to GeoSpot API",
  "version": "1.0.0",
  "docs": "/docs"
}
```

## Health Check Endpoints

### GET `/health`
**Description**: Basic health check to verify service is running
**Authentication**: None required
**Response**:
```json
{
  "status": "healthy",
  "service": "GeoSpot",
  "timestamp": "2023-11-01T10:00:00Z"
}
```

### GET `/health/db`
**Description**: Database health check verifying connectivity and PostGIS extension
**Authentication**: None required
**Response**:
```json
{
  "status": "healthy",
  "database": "connected",
  "postgis_version": "3.3.0 r21705",
  "timestamp": "2023-11-01T10:00:00Z"
}
```

### GET `/ready`
**Description**: Readiness check for Kubernetes/cloud deployments
**Authentication**: None required
**Response**:
```json
{
  "status": "ready",
  "database": "connected",
  "tables": ["datasets", "features"],
  "timestamp": "2023-11-01T10:00:00Z"
}
```

## Dataset Management Endpoints

All dataset endpoints are prefixed with `/api/v1`

### POST `/api/v1/upload`
**Description**: Upload a GeoJSON file
**Authentication**: None required
**Request**: `multipart/form-data` with file field
- **file** (required): GeoJSON or JSON file containing a FeatureCollection
- **File size limit**: 10MB (configurable via environment variables)

**Response (201 Created)**:
```json
{
  "id": 1,
  "name": "sample.geojson",
  "feature_count": 100,
  "file_size_bytes": 54321,
  "uploaded_at": "2023-11-01T10:00:00",
  "message": "Successfully uploaded 100 features"
}
```

**Error Responses**:
- `400 Bad Request`: Invalid file extension
- `413 Payload Too Large`: File exceeds size limit
- `422 Unprocessable Entity`: Invalid GeoJSON structure
- `409 Conflict`: Dataset with same name already exists
- `500 Internal Server Error`: Server error during upload

**Example Request**:
```bash
curl -X POST "http://localhost:8000/api/v1/upload" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@sample-data.geojson"
```

### GET `/api/v1/datasets`
**Description**: List all datasets with pagination
**Authentication**: None required
**Query Parameters**:
- **skip** (optional, default=0): Number of records to skip
- **limit** (optional, default=100, max=1000): Maximum number of records to return

**Response**:
```json
{
  "datasets": [
    {
      "id": 1,
      "name": "sample.geojson",
      "description": "Uploaded GeoJSON file with 100 features",
      "uploaded_at": "2023-11-01T10:00:00",
      "feature_count": 100,
      "file_size_bytes": 54321
    }
  ],
  "total": 1,
  "skip": 0,
  "limit": 100
}
```

### GET `/api/v1/datasets/{dataset_id}`
**Description**: Get dataset metadata by ID
**Authentication**: None required
**Path Parameters**:
- **dataset_id** (required): Dataset ID

**Response**:
```json
{
  "id": 1,
  "name": "sample.geojson",
  "description": "Uploaded GeoJSON file with 100 features",
  "uploaded_at": "2023-11-01T10:00:00",
  "feature_count": 100,
  "file_size_bytes": 54321
}
```

**Error Responses**:
- `404 Not Found`: Dataset not found

### GET `/api/v1/datasets/{dataset_id}/geojson`
**Description**: Get complete dataset as GeoJSON FeatureCollection
**Authentication**: None required
**Path Parameters**:
- **dataset_id** (required): Dataset ID

**Response**:
```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "id": 1,
      "geometry": {
        "type": "Point",
        "coordinates": [125.6, 10.1]
      },
      "properties": {
        "name": "Sample Point",
        "value": 123
      }
    }
  ]
}
```

**Error Responses**:
- `404 Not Found`: Dataset not found
- `500 Internal Server Error`: Error retrieving GeoJSON data

### DELETE `/api/v1/datasets/{dataset_id}`
**Description**: Delete dataset and all its features (cascading delete)
**Authentication**: None required
**Path Parameters**:
- **dataset_id** (required): Dataset ID

**Response**:
```json
{
  "message": "Dataset 'sample.geojson' and all its features deleted successfully",
  "deleted_dataset_id": 1
}
```

**Error Responses**:
- `404 Not Found`: Dataset not found
- `500 Internal Server Error`: Error deleting dataset

## API Documentation Endpoints

### GET `/docs`
**Description**: Interactive API documentation (Swagger UI)

### GET `/redoc`
**Description**: Alternative API documentation (ReDoc)

## Authentication

Currently, the API does not require authentication. In a production environment, authentication would be implemented using:
- JWT tokens
- API keys
- OAuth2 flows
- Session-based authentication

## Error Handling

All error responses follow the standard format:
```json
{
  "detail": "Error message describing the issue"
}
```

### Common HTTP Status Codes

- `200 OK`: Successful GET, PUT requests
- `201 Created`: Successful POST requests
- `400 Bad Request`: Client error in request format
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `409 Conflict`: Resource conflict (e.g., duplicate names)
- `413 Payload Too Large`: Request body too large
- `422 Unprocessable Entity`: Validation error
- `500 Internal Server Error`: Server error
- `503 Service Unavailable`: Service health check failure

## Content Types

- `application/json`: Standard API responses
- `multipart/form-data`: File uploads
- `application/geo+json`: GeoJSON responses