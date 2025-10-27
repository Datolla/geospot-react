# GeoSpot Project Overview

## Technology Stack

**Backend Framework**: FastAPI - A modern, fast web framework for Python with automatic API documentation (Swagger/OpenAPI)

**Programming Language**: Python 3.11

**Database**: PostgreSQL with PostGIS extension for geospatial data storage

**Database ORM**: SQLAlchemy 2.0 with async support

**Key Dependencies**:
- `fastapi==0.104.1` - Web framework
- `uvicorn[standard]==0.24.0` - ASGI server
- `sqlalchemy==2.0.23` - Database ORM with async support
- `asyncpg==0.29.0` - Async PostgreSQL driver
- `geoalchemy2==0.14.2` - Geospatial extension for SQLAlchemy
- `geojson==3.1.0` - GeoJSON handling
- `shapely==2.0.2` - Geometric operations
- `pydantic==2.5.0` - Data validation and settings management

## Project Structure

```
├── app/                    # Main application code
│   ├── __init__.py
│   ├── config.py          # Application settings and configuration
│   ├── crud.py            # Database operations (Create, Read, Update, Delete)
│   ├── database.py        # Database connection and session management
│   ├── main.py            # Main application entry point
│   ├── models.py          # Database models (SQLAlchemy ORM classes)
│   ├── schemas.py         # Pydantic schemas for request/response validation
│   ├── __pycache__/       # Python compiled files
│   ├── api/               # API route definitions
│   │   ├── __init__.py
│   │   ├── health.py      # Health check endpoints
│   │   └── datasets.py    # Dataset management endpoints
│   └── utils/             # Utility modules
│       ├── __init__.py
│       └── validators.py  # File and data validation utilities
├── docs/                  # Documentation (this file)
├── tests/                 # Test files
├── .env.example           # Environment variable template
├── .gitignore
├── docker-compose.yml     # Docker Compose configuration for local development
├── Dockerfile             # Docker image definition
├── init.sql              # Database initialization script
├── README.md
├── requirements.txt      # Python dependencies
└── sample-data.geojson   # Sample GeoJSON file for testing
```

## Application Architecture

### Architecture Pattern
- **API-First**: RESTful API with automatic documentation
- **Model-View-Controller (MVC)** inspired structure
- **Async/Sync**: Asynchronous operations for better performance
- **Dependency Injection**: FastAPI's built-in dependency injection system

### Main Components

1. **Main Application (`main.py`)**:
   - FastAPI instance with CORS middleware
   - Lifespan events for startup/shutdown
   - API router inclusion

2. **Configuration (`config.py`)**:
   - Settings management using Pydantic
   - Environment variable loading
   - Cached settings instance

3. **Database Layer (`database.py`)**:
   - Async SQLAlchemy engine
   - Session management
   - Database initialization

4. **Models (`models.py`)**:
   - SQLAlchemy ORM models for datasets and features
   - PostGIS geometry fields
   - JSONB properties storage

5. **API Routes (`api/`)**:
   - Health check endpoints
   - Dataset management endpoints
   - File upload functionality

6. **CRUD Operations (`crud.py`)**:
   - Database operations separated from API logic
   - Proper transaction handling
   - SQL queries for geospatial operations

7. **Schemas (`schemas.py`)**:
   - Pydantic models for request/response validation
   - API response structures
   - Error handling schemas

8. **Utilities (`utils/validators.py`)**:
   - File validation pipeline
   - GeoJSON structure validation
   - Geometric validation using Shapely

## Deployment

### Local Development
- Docker Compose with PostgreSQL + PostGIS
- Hot reload for development
- Environment variables management

### Production Readiness
- Health check endpoints for container orchestration
- Logging with structured format
- Proper error handling and status codes
- Database connection pooling

## Application Flow

1. **Request Entry**: FastAPI receives HTTP requests
2. **Middleware**: CORS handling and authentication (if implemented)
3. **Route Handler**: FastAPI router directs to appropriate handler
4. **Validation**: Request validation using Pydantic schemas
5. **Business Logic**: API handler calls CRUD functions
6. **Database**: SQLAlchemy executes database queries
7. **Response**: Pydantic schemas validate and format response
8. **Return**: JSON response to client

## Special Features

1. **Geospatial Support**: Full PostGIS integration with geometry handling
2. **File Upload**: Validated GeoJSON file upload with size and structure checks
3. **Batch Processing**: Efficient bulk insertion of GeoJSON features
4. **Spatial Indexing**: Optimized queries using PostGIS spatial indexes
5. **Auto Documentation**: Interactive API documentation via FastAPI
6. **CORS Support**: Configurable CORS for frontend integration
7. **Health Checks**: Multiple health check endpoints for container orchestration