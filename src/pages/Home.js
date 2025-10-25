import React from 'react';
import './Home.css';

const Home = () => {
  return (
    <div className="home">
      <section className="hero">
        <div className="hero-content">
          <div className="hero-text">
            <h1>GeoSpot</h1>
            <p>Powerful geospatial data management platform</p>
            <p>Upload, visualize, and manage your GeoJSON datasets</p>
            
            <div className="hero-buttons">
              <a href="/datasets" className="btn btn-primary btn-enhanced ripple">View Datasets</a>
              <a href="/upload" className="btn btn-secondary btn-enhanced ripple">Upload Data</a>
            </div>
          </div>
          <div className="hero-visual">
            <div className="map-animation">
              <div className="map-container">
                <div className="map-image"></div>
                <div className="animated-pin bounce"></div>
                <div className="animated-marker pulse"></div>
                <div className="data-pulse pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="features">
        <div className="feature-card interactive-card">
          <h3>📊 Dataset Management</h3>
          <p>Easily upload, organize, and manage your geospatial datasets with a user-friendly interface.</p>
        </div>
        <div className="feature-card interactive-card">
          <h3>🗺️ Interactive Maps</h3>
          <p>Visualize your GeoJSON data on interactive maps with full control and customization options.</p>
        </div>
        <div className="feature-card interactive-card">
          <h3>⚡ Fast & Scalable</h3>
          <p>Leverage PostgreSQL with PostGIS for high-performance geospatial operations and queries.</p>
        </div>
      </section>
    </div>
  );
};

export default Home;