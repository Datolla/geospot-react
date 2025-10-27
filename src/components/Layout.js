import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Layout.css';

const Layout = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const location = useLocation();

  // Check system preference or saved preference for dark mode
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme) {
      setDarkMode(savedTheme === 'dark');
    } else {
      setDarkMode(prefersDark);
    }
  }, []);

  // Apply theme to document
  useEffect(() => {
    if (darkMode) {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="layout">
      <header className="header">
        <div className="header-content">
          <Link to="/" className="logo">
            <h1 className="float">GeoSpot</h1>
          </Link>
          
          <button className="menu-toggle" onClick={toggleMenu}>
            <span></span>
            <span></span>
            <span></span>
          </button>
          
          <nav className={`nav ${isMenuOpen ? 'nav-open' : ''}`}>
            <ul>
              <li>
                <Link 
                  to="/" 
                  className={`slide-in-left ${isActive('/') ? 'active' : ''}`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Home
                </Link>
              </li>
              <li>
                <Link 
                  to="/datasets" 
                  className={`slide-in-left ${isActive('/datasets') ? 'active' : ''}`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Datasets
                </Link>
              </li>
              <li>
                <Link 
                  to="/upload" 
                  className={`slide-in-left ${isActive('/upload') ? 'active' : ''}`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Upload
                </Link>
              </li>
            </ul>
            <div className="theme-toggle-container">
              <button 
                className={`theme-toggle ${darkMode ? 'dark' : 'light'}`} 
                onClick={toggleDarkMode}
                aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                <i className={`fas ${darkMode ? 'fa-sun' : 'fa-moon'}`}></i>
              </button>
            </div>
          </nav>
        </div>
      </header>

      <main className="main-content slide-in-up">
        {children}
      </main>

      <footer className="footer slide-in-down">
        <div className="footer-content">
          <p>© {new Date().getFullYear()} GeoSpot - Geospatial Data Management</p>
          <div className="footer-links">
            <a href="/docs" target="_blank" rel="noopener noreferrer">API Docs</a>
            <a href="#about">About</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;