# Frontend Integration Guide

## Overview

This guide provides instructions for integrating your frontend application with the GeoSpot geospatial data management API. The backend is built with FastAPI and provides a RESTful API with full support for GeoJSON data handling.

## Base Configuration

### API Base URL
- **Development**: `http://localhost:8000`
- **Production**: `https://your-geospot-instance.com` (to be configured)

### API Version
- All dataset endpoints are prefixed with `/api/v1`

## Environment Configuration

Create a `.env` file for your frontend project:

```env
REACT_APP_API_BASE_URL=http://localhost:8000
# or for production:
# REACT_APP_API_BASE_URL=https://your-production-url.com
```

## API Service Implementation

### Basic API Service

Here's a complete API service implementation for handling GeoSpot API calls:

```javascript
// services/geospot-api.js
class GeoSpotAPI {
  constructor(baseURL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000') {
    this.baseURL = baseURL;
  }

  // Helper method for API calls
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || `API error: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Health check
  async healthCheck() {
    return this.request('/health');
  }

  // Database health check
  async databaseHealthCheck() {
    return this.request('/health/db');
  }

  // Readiness check
  async readinessCheck() {
    return this.request('/ready');
  }

  // Upload GeoJSON file
  async uploadGeoJSON(file) {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${this.baseURL}/api/v1/upload`, {
      method: 'POST',
      body: formData,
      // Don't set Content-Type header, let browser set it with boundary
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.detail || `Upload error: ${response.status}`);
    }

    return data;
  }

  // Get all datasets
  async getDatasets(skip = 0, limit = 100) {
    return this.request(`/api/v1/datasets?skip=${skip}&limit=${limit}`);
  }

  // Get dataset by ID
  async getDataset(datasetId) {
    return this.request(`/api/v1/datasets/${datasetId}`);
  }

  // Get dataset as GeoJSON
  async getDatasetGeoJSON(datasetId) {
    // For GeoJSON, don't parse as JSON since it might be large
    const response = await fetch(`${this.baseURL}/api/v1/datasets/${datasetId}/geojson`);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || `API error: ${response.status}`);
    }
    
    return response.json();
  }

  // Delete dataset
  async deleteDataset(datasetId) {
    return this.request(`/api/v1/datasets/${datasetId}`, {
      method: 'DELETE',
    });
  }
}

export default new GeoSpotAPI();
```

## React Hooks for Common Operations

### Dataset Management Hook

```javascript
// hooks/useDatasets.js
import { useState, useEffect } from 'react';
import GeoSpotAPI from '../services/geospot-api';

export const useDatasets = () => {
  const [datasets, setDatasets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchDatasets = async (skip = 0, limit = 100) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await GeoSpotAPI.getDatasets(skip, limit);
      setDatasets(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteDataset = async (datasetId) => {
    try {
      await GeoSpotAPI.deleteDataset(datasetId);
      // Refresh the list
      await fetchDatasets();
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  useEffect(() => {
    fetchDatasets();
  }, []);

  return { datasets, loading, error, fetchDatasets, deleteDataset };
};
```

### File Upload Hook

```javascript
// hooks/useFileUpload.js
import { useState } from 'react';
import GeoSpotAPI from '../services/geospot-api';

export const useFileUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResult, setUploadResult] = useState(null);
  const [error, setError] = useState(null);

  const uploadFile = async (file) => {
    if (!file) {
      setError('No file selected');
      return;
    }

    // Validate file type
    const allowedExtensions = ['.geojson', '.json'];
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    
    if (!allowedExtensions.includes(fileExtension)) {
      setError(`Invalid file type. Allowed: ${allowedExtensions.join(', ')}`);
      return;
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      setError(`File too large. Maximum size: 10MB`);
      return;
    }

    setUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      setUploadProgress(50); // Processing on server
      const result = await GeoSpotAPI.uploadGeoJSON(file);
      setUploadResult(result);
      setUploadProgress(100);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setUploading(false);
    }
  };

  const reset = () => {
    setUploadResult(null);
    setError(null);
    setUploading(false);
    setUploadProgress(0);
  };

  return {
    uploadFile,
    uploading,
    uploadProgress,
    uploadResult,
    error,
    reset
  };
};
```

## Component Examples

### Dataset List Component

```jsx
// components/DatasetList.jsx
import React from 'react';
import { useDatasets } from '../hooks/useDatasets';

const DatasetList = () => {
  const { datasets, loading, error, deleteDataset } = useDatasets();

  if (loading) return <div>Loading datasets...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="dataset-list">
      <h2>Datasets ({datasets.total})</h2>
      <div className="dataset-grid">
        {datasets.datasets?.map(dataset => (
          <div key={dataset.id} className="dataset-card">
            <h3>{dataset.name}</h3>
            <p>{dataset.description}</p>
            <div className="dataset-meta">
              <span>Features: {dataset.feature_count}</span>
              <span>Size: {(dataset.file_size_bytes / 1024).toFixed(2)} KB</span>
              <span>Uploaded: {new Date(dataset.uploaded_at).toLocaleDateString()}</span>
            </div>
            <div className="dataset-actions">
              <button 
                onClick={() => window.location.href = `/datasets/${dataset.id}`}
                className="btn btn-primary"
              >
                View
              </button>
              <button 
                onClick={() => navigator.clipboard.writeText(`${window.location.origin}/api/v1/datasets/${dataset.id}/geojson`)}
                className="btn btn-secondary"
              >
                Copy GeoJSON URL
              </button>
              <button 
                onClick={() => deleteDataset(dataset.id)}
                className="btn btn-danger"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DatasetList;
```

### File Upload Component

```jsx
// components/FileUpload.jsx
import React from 'react';
import { useFileUpload } from '../hooks/useFileUpload';

const FileUpload = ({ onUploadSuccess }) => {
  const { uploadFile, uploading, uploadProgress, uploadResult, error, reset } = useFileUpload();
  
  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      try {
        const result = await uploadFile(file);
        if (onUploadSuccess) {
          onUploadSuccess(result);
        }
      } catch (err) {
        console.error('Upload failed:', err);
      }
    }
  };

  return (
    <div className="file-upload">
      <h2>Upload GeoJSON File</h2>
      
      <div className="upload-area">
        <input
          type="file"
          id="geojson-upload"
          accept=".geojson,.json"
          onChange={handleFileChange}
          disabled={uploading}
        />
        <label htmlFor="geojson-upload" className="upload-label">
          {uploading ? 'Uploading...' : 'Choose GeoJSON file or drag here'}
        </label>
      </div>

      {uploading && (
        <div className="upload-progress">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
          <span>{uploadProgress}%</span>
        </div>
      )}

      {error && <div className="error-message">Error: {error}</div>}
      
      {uploadResult && (
        <div className="success-message">
          <h3>Upload Successful!</h3>
          <p>Dataset ID: {uploadResult.id}</p>
          <p>Features: {uploadResult.feature_count}</p>
          <p>Name: {uploadResult.name}</p>
          <button onClick={reset}>Upload Another</button>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
```

## Error Handling

### Global Error Handler

```javascript
// utils/errorHandler.js
export const handleAPIError = (error, context = '') => {
  console.error(`API Error in ${context}:`, error);
  
  // Handle specific error types
  if (error.message.includes('401')) {
    // Handle unauthorized
    localStorage.removeItem('token');
    window.location.href = '/login';
    return 'Authentication required. Redirecting to login...';
  }
  
  if (error.message.includes('404')) {
    return 'Resource not found';
  }
  
  if (error.message.includes('422')) {
    return 'Invalid data provided';
  }
  
  if (error.message.includes('413')) {
    return 'File too large. Maximum size is 10MB.';
  }
  
  if (error.message.includes('409')) {
    return 'A dataset with this name already exists';
  }
  
  return error.message || 'An error occurred';
};
```

### Loading State Component

```javascript
// components/LoadingSpinner.jsx
import React from 'react';

const LoadingSpinner = ({ message = 'Loading...' }) => (
  <div className="loading-container">
    <div className="spinner"></div>
    <p>{message}</p>
  </div>
);

export default LoadingSpinner;
```

## Map Integration

For displaying GeoJSON data on a map, you can use a library like Leaflet or Mapbox:

```javascript
// utils/mapUtils.js
import L from 'leaflet';

export const addGeoJSONToMap = (map, geojsonData) => {
  // Clear existing layers
  map.eachLayer(layer => {
    if (layer instanceof L.GeoJSON) {
      map.removeLayer(layer);
    }
  });

  // Add new GeoJSON
  const geojsonLayer = L.geoJSON(geojsonData, {
    onEachFeature: (feature, layer) => {
      // Add popup with properties
      if (feature.properties) {
        const popupContent = Object.entries(feature.properties)
          .map(([key, value]) => `<b>${key}:</b> ${value}`)
          .join('<br>');
        layer.bindPopup(popupContent);
      }
    },
    pointToLayer: (feature, latlng) => {
      return L.circleMarker(latlng, {
        radius: 8,
        fillColor: '#ff7800',
        color: '#000',
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
      });
    }
  }).addTo(map);

  // Fit bounds to show all features
  if (geojsonLayer.getBounds().isValid()) {
    map.fitBounds(geojsonLayer.getBounds());
  }
};
```

## Security Considerations

### CORS Configuration

The backend is configured with CORS middleware:
- Development: Allows all origins (`*`)
- Production: Limited to `http://localhost:3000` (configurable)

### File Upload Security

- Maximum file size: 10MB (configurable)
- Allowed file types: `.geojson`, `.json`
- GeoJSON structure validation
- Geometric validation using Shapely
- Duplicate filename prevention

## Performance Tips

### Pagination
- Use skip and limit parameters for large dataset lists
- Default limit is 100, maximum is 1000 per request

### Caching
- Consider caching dataset lists that don't change frequently
- Cache GeoJSON responses for static datasets
- Implement service workers for offline capability

### Large GeoJSON Handling
- For large datasets, consider implementing clustering on the frontend
- Use progressive loading for very large GeoJSON files
- Consider implementing bounding box queries when available

## Testing Your Integration

### Health Check Endpoint
Verify the API is accessible:
```javascript
import GeoSpotAPI from './services/geospot-api';

async function testConnection() {
  try {
    const health = await GeoSpotAPI.healthCheck();
    console.log('API is healthy:', health);
    return true;
  } catch (error) {
    console.error('API connection failed:', error);
    return false;
  }
}
```

### Sample Implementation Test
```javascript
async function testUpload() {
  // Create a sample GeoJSON blob for testing
  const geojson = {
    type: 'FeatureCollection',
    features: [{
      type: 'Feature',
      properties: { name: 'Test Point' },
      geometry: { type: 'Point', coordinates: [0, 0] }
    }]
  };
  
  const blob = new Blob([JSON.stringify(geojson)], { type: 'application/geo+json' });
  const file = new File([blob], 'test.geojson');
  
  try {
    const result = await GeoSpotAPI.uploadGeoJSON(file);
    console.log('Upload successful:', result);
  } catch (error) {
    console.error('Upload failed:', error);
  }
}
```