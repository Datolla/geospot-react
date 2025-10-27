import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, GeoJSON, ZoomControl, useMap } from 'react-leaflet';
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
  const [isFullscreen, setIsFullscreen] = useState(false);
  const mapRef = useRef(null);

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
  }, [id]); // Only re-run when id changes, not when fetch functions change

  // Function to style GeoJSON features with simplified professional color scheme
  const styleFeature = (feature) => {
    const geometryType = feature.geometry.type;
    
    let style = {};
    
    // Different styles for different geometry types - simplified color scheme
    switch(geometryType) {
      case 'Point':
        style = {
          radius: 8,
          fillColor: "#f28123", // orange-wheel for points
          color: "#2c3e50", // dark blue-gray border
          weight: 1,
          opacity: 1,
          fillOpacity: 0.8
        };
        break;
      case 'LineString':
        style = {
          color: "#f28123", // orange-wheel for lines
          weight: 4,
          opacity: 0.8
        };
        break;
      case 'Polygon':
      case 'MultiPolygon':
        style = {
          fillColor: "#34495e", // dark blue-gray for polygons
          weight: 2,
          opacity: 1,
          color: "#2c3e50", // dark blue-gray border
          dashArray: '3',
          fillOpacity: 0.7
        };
        break;
      default:
        style = {
          fillColor: "#95a5a6", // gray for other types
          weight: 2,
          opacity: 1,
          color: "#7f8c8d", // mid-gray border
          dashArray: '3',
          fillOpacity: 0.7
        };
    }
    
    return style;
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
  
  // Component to fit map to data bounds
  const FitBounds = ({ geojsonData }) => {
    const map = useMap();

    useEffect(() => {
      // Only run after map is fully loaded and geojsonData is available
      const timer = setTimeout(() => {
        if (map && geojsonData && geojsonData.features && geojsonData.features.length > 0) {
          try {
            const geoJsonLayer = L.geoJSON(geojsonData);
            const bounds = geoJsonLayer.getBounds();
            
            if (bounds && bounds.isValid()) {
              // Simply call fitBounds without extra checks that might cause issues
              map.fitBounds(bounds, { padding: [50, 50] });
            }
          } catch (error) {
            // Silently handle errors to prevent UI disruption
          }
        }
      }, 500); // Slightly longer delay to ensure everything is ready

      return () => clearTimeout(timer);
    }, [geojsonData, map]); // Only re-run when these values change

    return null;
  };

  // Handle map resize when fullscreen state changes
  useEffect(() => {
    if (mapRef.current && mapRef.current.invalidateSize) {
      // Add a small delay to ensure DOM has updated
      const timer = setTimeout(() => {
        mapRef.current.invalidateSize();
      }, 150);
      
      return () => clearTimeout(timer);
    }
  }, [isFullscreen]);

  if (loading || !dataset || !geojsonData) return <LoadingSpinner />;
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
        <div className={`map-container ${isFullscreen ? 'fullscreen' : ''}`}>
          <button 
            className="fullscreen-btn"
            onClick={() => setIsFullscreen(!isFullscreen)}
          >
            {isFullscreen ? 'Exit Fullscreen' : 'View Fullscreen'}
          </button>
          {geojsonData.features && geojsonData.features.length > 0 ? (
            <MapContainer 
              center={[0, 0]} 
              zoom={2} 
              style={{ height: '100%', width: '100%' }}
              scrollWheelZoom={true}
              zoomControl={true}
              attributionControl={true}
              whenCreated={map => {
                mapRef.current = map;
                // Immediately adjust size when map is created
                setTimeout(() => map.invalidateSize(), 100);
              }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <GeoJSON 
                data={geojsonData} 
                style={styleFeature}
                onEachFeature={onEachFeature}
              />
            </MapContainer>
          ) : (
            <div className="no-data">No features to display</div>
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