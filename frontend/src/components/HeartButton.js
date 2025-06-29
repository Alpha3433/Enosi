import React from 'react';

const styles = {
  Button: {
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '32px',
    height: '32px',
    border: '0',
    boxSizing: 'border-box',
    borderRadius: '100px',
    color: '#ffffff',
    backgroundColor: 'rgba(255,255,255,0.8)',
    outline: 'none',
    transition: 'all 0.2s ease',
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
  },
  ButtonActive: {
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '32px',
    height: '32px',
    border: '0',
    boxSizing: 'border-box',
    borderRadius: '100px',
    color: '#ffffff',
    backgroundColor: 'rgba(220, 38, 127, 0.9)',
    outline: 'none',
    transition: 'all 0.2s ease',
    boxShadow: '0 2px 8px rgba(220, 38, 127, 0.3)',
    transform: 'scale(1.1)',
  },
  Icon: {
    color: '#897560',
    fill: 'none',
    width: '16px',
    height: '16px',
    fontSize: '16px',
    stroke: 'currentColor',
    strokeWidth: '2',
  },
  IconActive: {
    color: '#ffffff',
    fill: '#dc267f',
    width: '16px',
    height: '16px',
    fontSize: '16px',
    stroke: '#dc267f',
    strokeWidth: '2',
  },
};

const HeartIcon = ({ isActive, style }) => (
  <svg style={style} viewBox="0 0 24 24">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

const HeartButton = ({ isActive = false, onClick }) => {
  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onClick && onClick();
  };

  return (
    <button 
      style={isActive ? styles.ButtonActive : styles.Button}
      onClick={handleClick}
      onMouseEnter={(e) => {
        if (!isActive) {
          e.target.style.backgroundColor = 'rgba(255,255,255,0.95)';
          e.target.style.transform = 'scale(1.05)';
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive) {
          e.target.style.backgroundColor = 'rgba(255,255,255,0.8)';
          e.target.style.transform = 'scale(1)';
        }
      }}
    >
      <HeartIcon 
        isActive={isActive} 
        style={isActive ? styles.IconActive : styles.Icon} 
      />
    </button>
  );
};

export default HeartButton;