import React, { useState, useEffect } from 'react';
import './Docs.css';

const Docs = () => {
  const [docsContent, setDocsContent] = useState({});
  const [selectedDoc, setSelectedDoc] = useState('project_overview.md');
  const [loading, setLoading] = useState(true);

  const docTitles = {
    'project_overview.md': 'Project Overview',
    'api_endpoints.md': 'API Endpoints',
    'database_models.md': 'Database Models',
    'frontend_integration_guide.md': 'Frontend Integration Guide'
  };

  useEffect(() => {
    const fetchDocs = async () => {
      setLoading(true);
      try {
        // In a real app, this would fetch from an API
        // For now, we'll simulate the content
        const content = {
          'project_overview.md': `# GeoSpot Project Overview

GeoSpot is a geospatial data management platform that allows users to upload, visualize, and manage GeoJSON datasets. This React-based frontend provides an intuitive user interface for interacting with the GeoSpot backend API.

## Features

- **Dataset Management**: Upload, view, and delete GeoJSON datasets
- **Interactive Maps**: Visualize geospatial data on interactive maps
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **File Upload**: Drag-and-drop interface for GeoJSON files
- **Dataset Details**: View metadata and feature properties
- **API Integration**: Full integration with the GeoSpot backend API

## Maps

The application uses Leaflet for map visualization. When viewing a dataset, the map will automatically center and zoom to show all features in the dataset. Feature properties are accessible via popups when clicking on map elements.

## Architecture

- Frontend: React, React Router, React Leaflet
- Backend: Node.js/Express (external API)
- Maps: Leaflet with OpenStreetMap tiles
- Styling: CSS with custom variables

## Environment Variables

- \`REACT_APP_API_BASE_URL\`: Base URL for the GeoSpot backend API

## Development

To run the development server:

\`\`\`
npm start
\`\`\`

For production build:

\`\`\`
npm run build
\`\`\``,
          'api_endpoints.md': `# API Endpoints

## Authentication

\`\`\`
POST /api/v1/auth/login
POST /api/v1/auth/register
GET /api/v1/auth/profile
\`\`\`

## Datasets

\`\`\`
GET /api/v1/datasets
POST /api/v1/datasets
GET /api/v1/datasets/:id
PUT /api/v1/datasets/:id
DELETE /api/v1/datasets/:id
GET /api/v1/datasets/:id/geojson
POST /api/v1/datasets/:id/upload
\`\`\`

## Data

\`\`\`
GET /api/v1/data/features/:datasetId
GET /api/v1/data/stats/:datasetId
\`\`\`

## Examples

### Upload Dataset
\`\`\`
curl -X POST \\
  -H "Content-Type: multipart/form-data" \\
  -H "Authorization: Bearer <token>" \\
  -F "file=@dataset.geojson" \\
  https://api.geospot.com/v1/datasets
\`\`\``,
          'database_models.md': `# Database Models

## Dataset

\`\`\`json
{
  "id": "string (uuid)",
  "name": "string",
  "description": "string (optional)",
  "feature_count": "integer",
  "file_size_bytes": "integer",
  "upload_date": "datetime",
  "user_id": "string (uuid)",
  "public": "boolean"
}
\`\`\`

## Feature

\`\`\`json
{
  "id": "string (uuid)",
  "dataset_id": "string (uuid)",
  "geometry": "GeoJSON object",
  "properties": "object",
  "created_at": "datetime"
}
\`\`\`

## User

\`\`\`json
{
  "id": "string (uuid)",
  "email": "string",
  "username": "string",
  "first_name": "string",
  "last_name": "string",
  "created_at": "datetime",
  "last_login": "datetime"
}
\`\`\`

## Project

\`\`\`json
{
  "id": "string (uuid)",
  "name": "string",
  "description": "string (optional)",
  "owner_id": "string (uuid)",
  "created_at": "datetime"
}
\`\`\``,
          'frontend_integration_guide.md': `# Frontend Integration Guide

## Setup

\`\`\`
npm install
npm start
\`\`\`

## Components Structure

### Core Components
- \`Layout\`: Main layout with navigation and theme toggle
- \`ErrorMessage\`: Error display with retry functionality
- \`LoadingSpinner\`: Loading indicator

### Page Components
- \`Home\`: Landing page
- \`Datasets\`: Dataset listing page
- \`DatasetDetail\`: Individual dataset view with map
- \`Upload\`: File upload page

## API Integration

API calls are handled through the \`GeoSpotAPI\` service:

\`\`\`javascript
import GeoSpotAPI from '../services/geospot-api';

// Get all datasets
const datasets = await GeoSpotAPI.getDatasets();

// Get specific dataset
const dataset = await GeoSpotAPI.getDataset(datasetId);

// Upload file
const result = await GeoSpotAPI.uploadGeoJSON(file);
\`\`\`

## Styling

The application uses CSS custom properties defined in \`src/styles/variables.css\`. To use theme variables:

\`\`\`css
.my-element {
  background-color: var(--primary-color);
  color: var(--text-color);
}
\`\`\`

## Maps

Maps are implemented with React Leaflet:

\`\`\`javascript
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';

<MapContainer center={[51.505, -0.09]} zoom={13}>
  <TileLayer
    attribution='&copy; OpenStreetMap contributors'
    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
  />
</MapContainer>
\`\`\``
        };
        setDocsContent(content);
      } catch (error) {
        console.error('Error loading docs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDocs();
  }, []);

  const renderMarkdown = (text) => {
    // Simple markdown rendering - in a real app, use a library like marked or react-markdown
    if (!text) return null;

    // Convert headers
    let html = text
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/^\> (.*$)/gim, '<blockquote>$1</blockquote>')
      .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
      .replace(/\*(.*)\*/gim, '<em>$1</em>')
      .replace(/!\[(.*?)\]\((.*?)\)/gim, '<img alt="$1" src="$2" />')
      .replace(/\[(.*?)\]\((.*?)\)/gim, '<a href="$2">$1</a>')
      .replace(/\n$/gim, '<br />');

    // Handle code blocks
    html = html.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
    
    // Handle inline code
    html = html.replace(/`(.*?)`/g, '<code>$1</code>');
    
    // Handle lists
    html = html.replace(/^\- (.*$)/gim, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>');
    
    return { __html: html };
  };

  if (loading) {
    return (
      <div className="docs-page">
        <div className="docs-header">
          <h1>Documentation</h1>
          <p>Loading documentation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="docs-page">
      <div className="docs-container">
        <div className="docs-sidebar">
          <h3>Documentation</h3>
          <ul>
            {Object.entries(docTitles).map(([key, title]) => (
              <li key={key}>
                <button
                  className={selectedDoc === key ? 'active' : ''}
                  onClick={() => setSelectedDoc(key)}
                >
                  {title}
                </button>
              </li>
            ))}
          </ul>
        </div>
        
        <div className="docs-content">
          <h1>{docTitles[selectedDoc]}</h1>
          <div 
            className="markdown-content"
            dangerouslySetInnerHTML={renderMarkdown(docsContent[selectedDoc])}
          />
        </div>
      </div>
    </div>
  );
};

export default Docs;