import { useState, useEffect } from 'react';
import { loadCSV } from './utils/dataLoader';
import { findQualifyingCircuits, getCircuitLapTimeEvolution } from './utils/dataProcessor';
import WorldMap from './components/WorldMap';
import CircuitInfo from './components/CircuitInfo';
import ImmersiveHomepage from './components/DynamicPage';

import './App.css';

function App() {
  const [data, setData] = useState(null);
  const [selectedCircuit, setSelectedCircuit] = useState(null);
  const [circuitLapData, setCircuitLapData] = useState(null);
  const [loading, setLoading] = useState(true);

  

  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('Loading CSV files...');
        
        const [races, circuits, lapTimes] = await Promise.all([
          loadCSV('races.csv'),
          loadCSV('circuit.csv'),
          loadCSV('lap_times.csv')
        ]);

        console.log('Data loaded:', {
          races: races.length,
          circuits: circuits.length,
          lapTimes: lapTimes.length
        });

        console.log('Sample circuits:', circuits.slice(0, 3));
        console.log('Sample lap times:', lapTimes.slice(0, 3));
        
        const qualifyingCircuits = findQualifyingCircuits(circuits, races);
    
        console.log('Qualifying circuits:', qualifyingCircuits.length);
      
        setData({ 
          races, 
          circuits, 
          lapTimes,
          qualifyingCircuits 
        });
        
        setLoading(false);
      } catch (error) {
        console.error('Error loading data:', error);
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  useEffect(() => {
    if (selectedCircuit && data) {
      console.log('Processing lap time data for:', selectedCircuit.displayName);
      setCircuitLapData(null); // 로딩 상태
      
      try {
        // 🔥 디버깅: 모든 레이스 연도 확인
        const allRaceYears = selectedCircuit.races.map(r => r.year).sort((a,b) => a-b);
        console.log('📅 All race years for', selectedCircuit.displayName + ':', allRaceYears);
        console.log('📊 Total races:', selectedCircuit.races.length, 'years');
        
        const lapTimeEvolution = getCircuitLapTimeEvolution(
          selectedCircuit.circuitId, 
          data.races, 
          data.lapTimes
        );
        
        // 🔥 디버깅: 랩타임 데이터가 있는 연도들 확인
        if (lapTimeEvolution.length > 0) {
          const lapDataYears = lapTimeEvolution.map(d => d.year).sort((a,b) => a-b);
          console.log('⏱️ Years with lap time data:', lapDataYears);
          console.log('⏱️ Lap time data count:', lapTimeEvolution.length, 'years');
          
          // 누락된 연도들 찾기
          const missingYears = allRaceYears.filter(year => !lapDataYears.includes(year));
          console.log('❌ Missing lap time data for years:', missingYears);
          console.log('❌ Missing years count:', missingYears.length);
          
          // 샘플 데이터 확인
          console.log('🔍 Sample lap time data:', lapTimeEvolution.slice(0, 5));
          
          // 가장 빠른/느린 랩타임
          const fastestMs = Math.min(...lapTimeEvolution.map(d => d.milliseconds));
          const slowestMs = Math.max(...lapTimeEvolution.map(d => d.milliseconds));
          console.log('🏆 Fastest lap:', fastestMs + 'ms (' + (fastestMs/1000).toFixed(3) + 's)');
          console.log('🐌 Slowest lap:', slowestMs + 'ms (' + (slowestMs/1000).toFixed(3) + 's)');
        }
        
        console.log(`Lap time evolution for ${selectedCircuit.displayName}:`, lapTimeEvolution.length, 'data points');
        
        setCircuitLapData(lapTimeEvolution);
      } catch (error) {
        console.error('Error processing lap time data:', error);
        setCircuitLapData([]);
      }
    } else {
      setCircuitLapData(null);
    }
  }, [selectedCircuit, data]);

  const handleCircuitSelect = (circuit) => {
    console.log('Selected circuit:', circuit.displayName);
    setSelectedCircuit(circuit);
  };

  if (loading) {
    return (
      <div style={{ 
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #0f1419 0%, #1a252f 50%, #2d3748 100%)',
        color: 'white'
      }}>
        <h2>Loading F1 data...</h2>
        <p>Please wait while we load the race data and lap times.</p>
        <div style={{
          width: '200px',
          height: '4px',
          background: 'rgba(255,255,255,0.2)',
          borderRadius: '2px',
          overflow: 'hidden',
          marginTop: '20px'
        }}>
          <div style={{
            width: '100%',
            height: '100%',
            background: 'linear-gradient(90deg, #4ecdc4, #45b7d1)',
            borderRadius: '2px',
            animation: 'loading 2s infinite'
          }} />
        </div>
        <style jsx>{`
          @keyframes loading {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
        `}</style>
      </div>
    );
  }


  if (!data) {
    return (
      <div style={{ 
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #0f1419 0%, #1a252f 50%, #2d3748 100%)',
        color: '#ff6b6b'
      }}>
        <h2>❌ Failed to load F1 data</h2>
        <p>Please check that the CSV files are in the /public/data/ folder.</p>
      </div>
    );
  }

  return (
    <ImmersiveHomepage>
      {/* Data Summary Header */}
      <div style={{ 
        textAlign: 'center', 
        padding: '40px 20px',
        background: 'rgba(255, 255, 255, 0.03)',
        margin: '0 20px 40px 20px',
        borderRadius: '20px',
        color: 'white'
      }}>
        <h1 style={{ 
          fontSize: '2.5rem',
          fontWeight: '700',
          marginBottom: '20px',
          color: '#4ecdc4'
        }}>
          Interactive Circuit Analysis
        </h1>
        <p style={{ 
          fontSize: '1.2rem',
          marginBottom: '20px',
          opacity: 0.9 
        }}>
          Analyzing lap time evolution across 14 qualifying F1 circuits (15+ races, active in 2025)
        </p>
        
        <div style={{ 
          background: 'rgba(76, 204, 196, 0.1)', 
          padding: '20px', 
          borderRadius: '12px', 
          display: 'inline-block',
          border: '1px solid rgba(76, 204, 196, 0.3)'
        }}>
          <div style={{ 
            display: 'flex',
            justifyContent: 'center',
            gap: '40px',
            flexWrap: 'wrap',
            fontSize: '14px'
          }}>
            <span>
              ✅ <strong>Races:</strong> <span style={{color: '#000', backgroundColor: 'rgba(255,255,255,0.9)', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold'}}>{data.races.length.toLocaleString()}</span>
            </span>
            <span>
              ✅ <strong>Circuits:</strong> <span style={{color: '#000', backgroundColor: 'rgba(255,255,255,0.9)', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold'}}>{data.circuits.length}</span>
            </span>
            <span>
              ✅ <strong>Lap Times:</strong> <span style={{color: '#000', backgroundColor: 'rgba(255,255,255,0.9)', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold'}}>{data.lapTimes.length.toLocaleString()}</span>
            </span>
            <span>
              ✅ <strong>Qualifying Circuits:</strong> <span style={{color: '#000', backgroundColor: 'rgba(255,255,255,0.9)', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold'}}>{data.qualifyingCircuits.length}</span>
            </span>
          </div>
        </div>
      </div>

      {/* World Map Section */}
      <WorldMap 
        circuits={data.qualifyingCircuits}
        onCircuitSelect={handleCircuitSelect}
        selectedCircuit={selectedCircuit}
      />
      
      {/* Circuit Info Section */}
      <CircuitInfo 
        selectedCircuit={selectedCircuit} 
        lapTimeData={circuitLapData}
      />
    </ImmersiveHomepage>
  );

}

export default App;