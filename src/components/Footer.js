import React from 'react';

/**
 * Simple Footer Component for F1 Data Visualization Project
 * Displays basic project information and credits
 */
const Footer = () => {
  return (
    <div style={{
      textAlign: 'center',
      padding: '40px 20px',
      background: 'rgba(255, 255, 255, 0.02)',
      margin: '0 20px 40px 20px',
      borderRadius: '20px',
      color: 'white',
      opacity: 0.8
    }}>
      <p style={{ fontSize: '14px', marginBottom: '10px' }}>
        📊 Data visualization of Formula 1 performance evolution from 1950-2024
      </p>
      <p style={{ fontSize: '12px' }}>
        Team 21: Sukhyun Hwang, Christopher Wong, Chun Yat Chu | May 2025
      </p>
      <p style={{ fontSize: '11px', opacity: 0.7 }}>
        Data sources: Kaggle F1 Dataset, StatsF1.com | Built with React, D3.js
      </p>
    </div>
  );
};

export default Footer;