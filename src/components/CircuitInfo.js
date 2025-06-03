import React, { useState }  from 'react';
import LapTimeChart from './LapTimeChart';

// Format milliseconds to MM:SS.mmm 
const formatLapTime = (milliseconds) => {
  const totalSeconds = milliseconds / 1000;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  
  if (minutes > 0) {
    return `${minutes}:${seconds.toFixed(3).padStart(6, '0')}`;
  } else {
    return `${seconds.toFixed(3)}s`;
  }
};

const CircuitInfo = ({ selectedCircuit, lapTimeData }) => {
  if (!selectedCircuit) {
    return (
      <div style={{ 
        padding: '40px', 
        background: 'rgba(255, 255, 255, 0.03)',
        borderRadius: '20px',
        margin: '20px 0',
        textAlign: 'center',
        color: 'white'
      }}>
        <h2 style={{ color: '#4ecdc4', marginBottom: '16px' }}>Select a Circuit</h2>
        <p>Click on any marker on the world map to view circuit details and lap time evolution</p>
      </div>
    );
  }

  return (
    <div style={{ 
      background: 'rgba(255, 255, 255, 0.03)',
      borderRadius: '20px',
      padding: '30px',
      margin: '20px 0',
      color: 'white'
    }}>
      {/* Circuit Info Header */}
      <div style={{ marginBottom: '30px', textAlign: 'center' }}>
        <h2 style={{ 
          color: '#4ecdc4', 
          margin: '0 0 16px 0',
          fontSize: '28px',
          fontWeight: '700'
        }}>
          🏁 {selectedCircuit.displayName}
        </h2>
        
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          gap: '40px',
          flexWrap: 'wrap',
          marginBottom: '20px'
        }}>
          <div>
            <strong>📍 Location:</strong> {selectedCircuit.location}, {selectedCircuit.country}
          </div>
          <div>
            <strong>🏆 Total Races:</strong> {selectedCircuit.raceCount}
          </div>
          <div>
            <strong>📅 First Race:</strong> {Math.min(...selectedCircuit.races.map(r => r.year))}
          </div>
          <div>
            <strong>🔄 Latest Race:</strong> {Math.max(...selectedCircuit.races.map(r => r.year))}
          </div>
        </div>

        {lapTimeData && lapTimeData.length > 0 && (
          <div style={{ 
            background: 'rgba(76, 204, 196, 0.1)',
            padding: '15px',
            borderRadius: '12px',
            border: '1px solid rgba(76, 204, 196, 0.3)'
          }}>
            <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>
              ⏱️ Lap Time Data Analysis
            </div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              gap: '30px',
              flexWrap: 'wrap',
              fontSize: '14px'
            }}>
              <span>
                <strong>Data Range:</strong> {Math.min(...lapTimeData.map(d => d.year))} - {Math.max(...lapTimeData.map(d => d.year))}
              </span>
              <span>
                <strong>Years of Data:</strong> {lapTimeData.length}
              </span>
              <span>
                <strong>Fastest Lap:</strong> {formatLapTime(Math.min(...lapTimeData.map(d => d.milliseconds)))}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Chart Section */}
      {lapTimeData === null ? (
        <div style={{ textAlign: 'center', padding: '60px' }}>
          <div style={{ fontSize: '18px', marginBottom: '10px' }}>🔄 Processing lap time data...</div>
          <div style={{ opacity: 0.7 }}>Analyzing {selectedCircuit.displayName} lap times</div>
        </div>
      ) : lapTimeData.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px' }}>
          <div style={{ fontSize: '18px', marginBottom: '10px', color: '#ff6b6b' }}>
            ❌ No lap time data available
          </div>
          <div style={{ opacity: 0.7 }}>
            This circuit may not have lap time records in our dataset (1996-2023)
          </div>
        </div>
      ) : (
        <div>
              <LapTimeChart 
                data={lapTimeData}
                circuitName={selectedCircuit.displayName}
                width={1200}
                height={500}
              />
              
              <div style={{ 
                marginTop: '20px', 
                fontSize: '14px', 
                opacity: 0.8,
                textAlign: 'center',
                display: 'flex',     
                justifyContent: 'center' 
              }}>
                💡 Hover over data points to see detailed lap time information.
                Scroll down to see how this circuit fits into the global F1 performance pattern.
              </div>
        </div>
      )}
    </div>
  );
};

export default CircuitInfo;