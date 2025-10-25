import React, { useState, useEffect } from 'react';

// Interactive Button component with ripple effect
export const InteractiveButton = ({ children, onClick, className = '', variant = 'primary', ...props }) => {
  const [ripples, setRipples] = useState([]);

  const handleClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const newRipple = {
      x,
      y,
      id: Date.now()
    };
    
    setRipples(prev => [...prev, newRipple]);
    if (onClick) onClick(e);
  };

  const handleRippleAnimationEnd = (id) => {
    setRipples(prev => prev.filter(ripple => ripple.id !== id));
  };

  const buttonClasses = `btn btn-${variant} interactive-button ${className}`;
  
  return (
    <button 
      className={buttonClasses} 
      onClick={handleClick}
      {...props}
    >
      <span className="interactive-button-content">{children}</span>
      {ripples.map(ripple => (
        <span
          key={ripple.id}
          className="ripple-effect"
          style={{
            left: ripple.x,
            top: ripple.y
          }}
          onAnimationEnd={() => handleRippleAnimationEnd(ripple.id)}
        />
      ))}
    </button>
  );
};

// Interactive Card component with enhanced hover effects
export const InteractiveCard = ({ children, className = '', ...props }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);

  return (
    <div 
      className={`card interactive-card ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseDown={() => setIsClicked(true)}
      onMouseUp={() => setIsClicked(false)}
      {...props}
    >
      {children}
    </div>
  );
};

// Animated Counter component
export const AnimatedCounter = ({ value, duration = 2000, className = '' }) => {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    let start = 0;
    const increment = value / (duration / 16); // ~60fps
    const timer = setInterval(() => {
      start += increment;
      if (start >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.ceil(start));
      }
    }, 16);
    
    return () => clearInterval(timer);
  }, [value, duration]);
  
  return <span className={className}>{count}</span>;
};

// ToggleSwitch component
export const ToggleSwitch = ({ checked, onChange, label, id }) => {
  return (
    <div className="toggle-switch-container">
      <label htmlFor={id} className="toggle-switch-label">
        {label}
      </label>
      <div className="toggle-switch">
        <input
          type="checkbox"
          id={id}
          checked={checked}
          onChange={onChange}
          className="toggle-switch-input"
        />
        <span className="toggle-switch-slider" />
      </div>
    </div>
  );
};

// ProgressBar component
export const ProgressBar = ({ progress, className = '' }) => {
  return (
    <div className={`progress-bar ${className}`}>
      <div 
        className="progress-bar-fill" 
        style={{ width: `${progress}%` }}
      />
    </div>
  );
};

// Tooltip component
export const Tooltip = ({ children, text, position = 'top' }) => {
  const [isVisible, setIsVisible] = useState(false);
  
  return (
    <div className="tooltip-container">
      <div 
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
      >
        {children}
      </div>
      {isVisible && (
        <div className={`tooltip tooltip-${position}`}>
          {text}
        </div>
      )}
    </div>
  );
};

// Modal component
export const Modal = ({ isOpen, onClose, title, children }) => {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose]);
  
  if (!isOpen) return null;
  
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          {children}
        </div>
      </div>
    </div>
  );
};

// LoadingSpinner component
export const LoadingSpinner = ({ size = 'medium', className = '' }) => {
  const sizeClasses = {
    small: 'spinner-small',
    medium: 'spinner-medium',
    large: 'spinner-large'
  };
  
  return (
    <div className={`loading-spinner ${sizeClasses[size]} ${className}`}>
      <div className="spinner-inner" />
    </div>
  );
};