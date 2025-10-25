// services/geospot-api.js
class GeoSpotAPI {
  constructor(baseURL = process.env.REACT_APP_API_BASE_URL || 'https://geospot-b.onrender.com') {
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