import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import GeoSpotAPI from '../services/geospot-api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import './DatasetDetail.css';

// Fix for default Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const DatasetDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [dataset, setDataset] = useState(null);
  const [geojsonData, setGeojsonData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mapKey, setMapKey] = useState(0); // To force map re-render when data changes

  // Fetch dataset metadata
  const fetchDataset = async () => {
    try {
      const data = await GeoSpotAPI.getDataset(id);
      setDataset(data);
    } catch (err) {
      setError(err.message);
    }
  };

  // Fetch GeoJSON data for the dataset
  const fetchGeoJSON = async () => {
    try {
      const data = await GeoSpotAPI.getDatasetGeoJSON(id);
      setGeojsonData(data);
      // Force map to re-render with new data
      setMapKey(prev => prev + 1);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        await Promise.all([fetchDataset(), fetchGeoJSON()]);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // Function to style GeoJSON features
  const styleFeature = (feature) => {
    return {
      fillColor: '#3498db',
      weight: 2,
      opacity: 1,
      color: '#2980b9',
      dashArray: '3',
      fillOpacity: 0.7
    };
  };

  // Function to handle each feature
  const onEachFeature = (feature, layer) => {
    if (feature.properties) {
      const popupContent = Object.entries(feature.properties)
        .map(([key, value]) => `<b>${key}:</b> ${value}`)
        .join('<br>');
      layer.bindPopup(popupContent);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} onRetry={() => window.location.reload()} />;

  return (
    <div className="dataset-detail">
      <div className="dataset-header">
        <h2>{dataset?.name}</h2>
        <div className="dataset-actions">
          <button 
            className="btn btn-secondary" 
            onClick={() => navigate('/datasets')}
          >
            Back to Datasets
          </button>
          <button 
            className="btn btn-primary" 
            onClick={() => navigator.clipboard.writeText(`${window.location.origin}/api/v1/datasets/${id}/geojson`)}
          >
            Copy GeoJSON URL
          </button>
          <button 
            className="btn btn-danger" 
            onClick={async () => {
              if (window.confirm('Are you sure you want to delete this dataset? This action cannot be undone.')) {
                try {
                  await GeoSpotAPI.deleteDataset(id);
                  navigate('/datasets');
                } catch (err) {
                  setError(err.message);
                }
              }
            }}
          >
            Delete Dataset
          </button>
        </div>
      </div>

      <div className="dataset-metadata">
        <div className="metadata-item">
          <strong>ID:</strong> {dataset?.id}
        </div>
        <div className="metadata-item">
          <strong>Features:</strong> {dataset?.feature_count}
        </div>
        <div className="metadata-item">
          <strong>File Size:</strong> {dataset?.file_size_bytes ? `${(dataset.file_size_bytes / 1024).toFixed(2)} KB` : 'N/A'}
        </div>
        <div className="metadata-item">
          <strong>Uploaded:</strong> {dataset?.uploaded_at ? new Date(dataset.uploaded_at).toLocaleString() : 'N/A'}
        </div>
        <div className="metadata-item description">
          <strong>Description:</strong> {dataset?.description || 'No description provided'}
        </div>
      </div>

      <div className="map-section">
        <h3>Dataset Visualization</h3>
        <div className="map-container">
          {geojsonData ? (
            <MapContainer 
              key={mapKey}
              center={[0, 0]} 
              zoom={2} 
              style={{ height: '500px', width: '100%' }}
              scrollWheelZoom={true}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {geojsonData && (
                <GeoJSON 
                  data={geojsonData} 
                  style={styleFeature}
                  onEachFeature={onEachFeature}
                />
              )}
            </MapContainer>
          ) : (
            <div className="no-data">No GeoJSON data to display</div>
          )}
        </div>
      </div>

      <div className="dataset-features">
        <h3>Feature Properties</h3>
        <div className="features-list">
          {geojsonData?.features && geojsonData.features.length > 0 ? (
            <div className="feature-grid">
              {geojsonData.features.slice(0, 5).map((feature, index) => (
                <div key={index} className="feature-card">
                  <h4>Feature {index + 1}</h4>
                  <div className="feature-properties">
                    {Object.entries(feature.properties).map(([key, value]) => (
                      <div key={key} className="property-item">
                        <span className="property-key">{key}:</span>
                        <span className="property-value">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              {geojsonData.features.length > 5 && (
                <div className="more-features">
                  ... and {geojsonData.features.length - 5} more features
                </div>
              )}
            </div>
          ) : (
            <p>No features available in this dataset.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DatasetDetail;