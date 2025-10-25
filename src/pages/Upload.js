import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GeoSpotAPI from '../services/geospot-api';
import './Upload.css';

const Upload = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResult, setUploadResult] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      // Validate file type
      const allowedExtensions = ['.geojson', '.json'];
      const fileExtension = '.' + selectedFile.name.split('.').pop().toLowerCase();
      
      if (!allowedExtensions.includes(fileExtension)) {
        setError(`Invalid file type. Allowed: ${allowedExtensions.join(', ')}`);
        return;
      }

      // Validate file size (10MB max)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (selectedFile.size > maxSize) {
        setError(`File too large. Maximum size: 10MB`);
        return;
      }

      setFile(selectedFile);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    setUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      setUploadProgress(30); // Initial processing
      const result = await GeoSpotAPI.uploadGeoJSON(file);
      setUploadResult(result);
      setUploadProgress(100);
      
      // Show success message and give option to view the dataset
      setTimeout(() => {
        if (window.confirm(`Upload successful! Dataset ID: ${result.id}. Would you like to view it now?`)) {
          navigate(`/datasets/${result.id}`);
        }
      }, 1000);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const resetUpload = () => {
    setFile(null);
    setUploadResult(null);
    setError(null);
    setUploadProgress(0);
  };

  return (
    <div className="upload-page">
      <h2>Upload GeoJSON File</h2>
      
      <div className="upload-container">
        <div className="file-upload-area">
          <input
            type="file"
            id="geojson-upload"
            accept=".geojson,.json,application/geo+json"
            onChange={handleFileChange}
            disabled={uploading}
            style={{ display: 'none' }}
          />
          <label htmlFor="geojson-upload" className="upload-label">
            <div className="upload-content">
              <div className="upload-icon">Upload</div>
              <p>
                {file 
                  ? `Selected: ${file.name} (${(file.size / 1024).toFixed(2)} KB)` 
                  : 'Click to select or drag GeoJSON file here'}
              </p>
            </div>
          </label>
        </div>

        {file && !uploading && !uploadResult && (
          <div className="file-info">
            <p><strong>File:</strong> {file.name}</p>
            <p><strong>Size:</strong> {(file.size / 1024).toFixed(2)} KB</p>
            <p><strong>Type:</strong> {file.type || 'application/json'}</p>
          </div>
        )}

        {uploading && (
          <div className="upload-progress">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <span className="progress-text">{uploadProgress}%</span>
          </div>
        )}

        {error && (
          <div className="error-message">
            <p>Error: {error}</p>
            <button className="btn btn-secondary" onClick={() => setError(null)}>Dismiss</button>
          </div>
        )}

        {uploadResult && (
          <div className="success-message">
            <h3>Upload Successful!</h3>
            <p><strong>Dataset ID:</strong> {uploadResult.id}</p>
            <p><strong>Features:</strong> {uploadResult.feature_count}</p>
            <p><strong>Name:</strong> {uploadResult.name}</p>
            <div className="success-actions">
              <button className="btn btn-primary" onClick={() => navigate(`/datasets/${uploadResult.id}`)}>
                View Dataset
              </button>
              <button className="btn btn-secondary" onClick={resetUpload}>
                Upload Another
              </button>
            </div>
          </div>
        )}

        {!uploadResult && (
          <div className="upload-actions">
            <button 
              className="btn btn-primary" 
              onClick={handleUpload}
              disabled={!file || uploading}
            >
              {uploading ? 'Uploading...' : 'Upload Dataset'}
            </button>
            <button 
              className="btn btn-secondary" 
              onClick={resetUpload}
              disabled={uploading}
            >
              Reset
            </button>
          </div>
        )}

        <div className="upload-guidelines">
          <h3>Upload Guidelines</h3>
          <ul>
            <li>Accepted file formats: .geojson, .json</li>
            <li>Maximum file size: 10 MB</li>
            <li>File should be a valid GeoJSON FeatureCollection</li>
            <li>Supported geometry types: Point, LineString, Polygon, etc.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Upload;