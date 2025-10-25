import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import GeoSpotAPI from '../services/geospot-api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import './DatasetList.css';

const DatasetList = () => {
  const [datasets, setDatasets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [total, setTotal] = useState(0);
  const navigate = useNavigate();

  const fetchDatasets = async (skip = 0, limit = 100) => {
    try {
      setLoading(true);
      setError(null);
      const data = await GeoSpotAPI.getDatasets(skip, limit);
      setDatasets(data.datasets || []);
      setTotal(data.total || 0);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteDataset = async (datasetId) => {
    if (window.confirm('Are you sure you want to delete this dataset? This action cannot be undone.')) {
      try {
        await GeoSpotAPI.deleteDataset(datasetId);
        // Refresh the list
        fetchDatasets(currentPage * 100, 100);
      } catch (err) {
        setError(err.message);
      }
    }
  };

  useEffect(() => {
    fetchDatasets(currentPage * 100, 100);
  }, [currentPage]);

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage * 100 < total) {
      setCurrentPage(newPage);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} onRetry={() => fetchDatasets(currentPage * 100, 100)} />;

  return (
    <div className="dataset-list">
      <div className="page-header">
        <h2>Datasets ({total})</h2>
        <button 
          className="btn btn-primary" 
          onClick={() => navigate('/upload')}
        >
          Upload New Dataset
        </button>
      </div>

      {datasets.length === 0 ? (
        <div className="empty-state">
          <p>No datasets found. Upload your first GeoJSON file to get started.</p>
          <button className="btn btn-secondary" onClick={() => navigate('/upload')}>
            Upload Dataset
          </button>
        </div>
      ) : (
        <>
          <div className="dataset-grid">
            {datasets.map(dataset => (
              <div key={dataset.id} className="dataset-card">
                <div className="dataset-header">
                  <h3>{dataset.name}</h3>
                  <div className="dataset-actions">
                    <button 
                      onClick={() => navigate(`/datasets/${dataset.id}`)}
                      className="btn btn-small btn-primary"
                    >
                      View
                    </button>
                    <button 
                      onClick={() => navigator.clipboard.writeText(`${window.location.origin}/api/v1/datasets/${dataset.id}/geojson`)}
                      className="btn btn-small btn-secondary"
                      title="Copy GeoJSON URL"
                    >
                      Copy URL
                    </button>
                    <button 
                      onClick={() => deleteDataset(dataset.id)}
                      className="btn btn-small btn-danger"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                
                <div className="dataset-info">
                  <p>{dataset.description || 'No description provided'}</p>
                  
                  <div className="dataset-meta">
                    <span className="meta-item">
                      <strong>Features:</strong> {dataset.feature_count}
                    </span>
                    <span className="meta-item">
                      <strong>Size:</strong> {dataset.file_size_bytes ? `${(dataset.file_size_bytes / 1024).toFixed(2)} KB` : 'N/A'}
                    </span>
                    <span className="meta-item">
                      <strong>Uploaded:</strong> {new Date(dataset.uploaded_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="pagination">
            <button 
              onClick={() => handlePageChange(currentPage - 1)} 
              disabled={currentPage === 0}
              className="btn btn-secondary"
            >
              Previous
            </button>
            <span className="page-info">
              Page {currentPage + 1} of {Math.ceil(total / 100)}
            </span>
            <button 
              onClick={() => handlePageChange(currentPage + 1)} 
              disabled={(currentPage + 1) * 100 >= total}
              className="btn btn-secondary"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default DatasetList;