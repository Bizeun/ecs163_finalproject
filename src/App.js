import { useState, useEffect } from 'react';
import { loadCSV } from './utils/dataLoader';
import { findQualifyingCircuits, getCircuitLapTimeEvolution } from './utils/dataProcessor';
import WorldMap from './components/WorldMap';
import CircuitInfo from './components/CircuitInfo';
import ImmersiveHomepage from './components/DynamicPage';
import ImprovedEraDominance from './components/StackBarChart';
import GlobalF1Sankey from './components/GlobalSankey';

import './App.css';

function App() {
  const [data, setData] = useState(null);
  const [selectedCircuit, setSelectedCircuit] = useState(null);
  const [circuitLapData, setCircuitLapData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [allCircuitData, setAllCircuitData] = useState({});

  

  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('Loading CSV files...');
        
        const [races, circuits, lapTimes, constructors, constructorResults] = await Promise.all([
          loadCSV('races.csv'),
          loadCSV('circuit.csv'),
          loadCSV('lap_times.csv'),
          loadCSV('constructors.csv'),
          loadCSV('constructor_results.csv')
        ]);

        console.log('Data loaded:', {
          races: races.length,
          circuits: circuits.length,
          lapTimes: lapTimes.length,
          constructors: constructors.length,
          constructorResults: constructorResults.length 
        });
        
        const qualifyingCircuits = findQualifyingCircuits(circuits, races);
        console.log('Qualifying circuits:', qualifyingCircuits.length);

        const allCircuitLapData = {};
        qualifyingCircuits.forEach(circuit => {
          const lapTimeEvolution = getCircuitLapTimeEvolution(
            circuit.circuitId, 
            races, 
            lapTimes
          );
          
          allCircuitLapData[circuit.circuitId] = {
            name: circuit.displayName,
            location: circuit.location,
            country: circuit.country,
            lapTimeData: lapTimeEvolution
          };
          
          console.log(`${circuit.displayName}: ${lapTimeEvolution.length} years of data`);
        });

        console.log('All circuit data processed:', Object.keys(allCircuitLapData).length);
        setAllCircuitData(allCircuitLapData);
      
        setData({ 
          races, 
          circuits, 
          lapTimes,
          qualifyingCircuits,
          constructors,
          constructorResults,
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
              ✅ <strong>Constructors:</strong> <span style={{color: '#000', backgroundColor: 'rgba(255,255,255,0.9)', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold'}}>{data.constructors.length}</span>
            </span>
            <span>
              ✅ <strong>Processed Circuits:</strong> <span style={{color: '#000', backgroundColor: 'rgba(255,255,255,0.9)', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold'}}>{Object.keys(allCircuitData).length}</span>
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


      {/* 🔥 Transition Section: Individual → Global */}
      <div style={{ 
        textAlign: 'center', 
        padding: '50px 20px',
        background: 'rgba(255, 255, 255, 0.03)',
        margin: '60px 20px 20px 20px',
        borderRadius: '20px',
        color: 'white'
      }}>
        <h2 style={{ 
          fontSize: '2rem',
          fontWeight: '700',
          marginBottom: '20px',
          color: '#4ecdc4'
        }}>
          🔄 From Individual to Global Patterns
        </h2>
        <p style={{ 
          fontSize: '1.1rem',
          marginBottom: '20px',
          opacity: 0.9,
          maxWidth: '700px',
          margin: '0 auto 20px auto',
          lineHeight: '1.6'
        }}>
          You've explored individual circuits and their lap time evolution. 
          Now let's step back and see the <strong>bigger picture</strong> - 
          how do these patterns look across <strong>all qualifying circuits</strong>?
        </p>
        
        <div style={{ 
          background: 'rgba(76, 204, 196, 0.1)',
          border: '2px solid rgba(76, 204, 196, 0.3)',
          borderRadius: '12px',
          padding: '20px',
          margin: '0 auto',
          maxWidth: '600px'
        }}>
          <p style={{ 
            fontSize: '1rem',
            opacity: 0.95,
            marginBottom: '0'
          }}>
            💡 <strong>The big question:</strong> If you've noticed some interesting patterns in individual circuits, 
            what happens when we look at <strong>all {Object.keys(allCircuitData).length} circuits together</strong>? 
            The answer might surprise you...
          </p>
        </div>
      </div>

      {/* 🔥 Era Dominance Chart - 최적 위치! */}
      <ImprovedEraDominance 
        allCircuitData={allCircuitData}
        width={1200}
        height={700}
      />

      {/* 🔥 Bridge to Sankey: Pattern Discovery → Cause Analysis */}
      <div style={{ 
        textAlign: 'center', 
        padding: '50px 20px',
        background: 'rgba(255, 255, 255, 0.03)',
        margin: '20px 20px 40px 20px',
        borderRadius: '20px',
        color: 'white'
      }}>
        <h2 style={{ 
          fontSize: '2rem',
          fontWeight: '700',
          marginBottom: '20px',
          color: '#e74c3c'
        }}>
          🤔 The Pattern is Clear, But Why?
        </h2>
        <p style={{ 
          fontSize: '1.1rem',
          marginBottom: '30px',
          opacity: 0.9,
          maxWidth: '800px',
          margin: '0 auto 30px auto',
          lineHeight: '1.6'
        }}>
          The data reveals a striking paradox: despite 75 years of technological advancement, 
          the <strong>V10 era still dominates lap records</strong> across multiple circuits. 
          But what's behind this counterintuitive pattern?
        </p>
        
        <div style={{ 
          background: 'rgba(255, 193, 7, 0.1)',
          border: '2px solid rgba(255, 193, 7, 0.3)',
          borderRadius: '12px',
          padding: '20px',
          margin: '0 auto',
          maxWidth: '700px'
        }}>
          <p style={{ 
            fontSize: '1rem',
            opacity: 0.95,
            marginBottom: '0'
          }}>
            🚨 <strong>The paradox deepens:</strong> Modern hybrid cars produce 1000+ HP compared to 
            V10 era's ~850 HP, yet they're often slower. The answer lies in understanding 
            the complex web of <strong>manufacturers</strong>, <strong>technology</strong>, 
            and <strong>regulations</strong> that shape F1 performance...
          </p>
        </div>
      </div>

      {/* Global F1 Sankey Diagram */}
      <GlobalF1Sankey 
        races={data.races}
        constructors={data.constructors}
        constructorResults={data.constructorResults}
        lapTimes={data.lapTimes}
        qualifyingCircuits={data.qualifyingCircuits}
        width={1200}
        height={700}
      />

      {/* 🔥 Conclusion Section */}
      <div style={{ 
        textAlign: 'center', 
        padding: '40px 20px',
        background: 'rgba(255, 255, 255, 0.03)',
        margin: '40px 20px',
        borderRadius: '20px',
        color: 'white'
      }}>
        <h2 style={{ 
          fontSize: '2rem',
          fontWeight: '700',
          marginBottom: '30px',
          color: '#e74c3c'
        }}>
          🏁 The F1 Paradox Revealed
        </h2>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '20px',
          marginBottom: '30px'
        }}>
          <div style={{
            background: 'rgba(231, 76, 60, 0.1)',
            border: '2px solid rgba(231, 76, 60, 0.3)',
            borderRadius: '12px',
            padding: '20px'
          }}>
            <h3 style={{ color: '#e74c3c', marginBottom: '10px' }}>⚡ More Power</h3>
            <p>Modern hybrid cars: <strong>1000+ HP</strong><br />
            V10 era cars: <strong>~850 HP</strong></p>
          </div>
          
          <div style={{
            background: 'rgba(255, 193, 7, 0.1)',
            border: '2px solid rgba(255, 193, 7, 0.3)',
            borderRadius: '12px',
            padding: '20px'
          }}>
            <h3 style={{ color: '#ffc107', marginBottom: '10px' }}>🔒 More Restrictions</h3>
            <p>Fuel flow limits, weight regulations, aerodynamic restrictions severely limit performance</p>
          </div>
          
          <div style={{
            background: 'rgba(46, 204, 113, 0.1)',
            border: '2px solid rgba(46, 204, 113, 0.3)',
            borderRadius: '12px',
            padding: '20px'
          }}>
            <h3 style={{ color: '#2ecc71', marginBottom: '10px' }}>🏆 Slower Times</h3>
            <p>Result: V10 era still holds majority of lap records across F1 circuits</p>
          </div>
        </div>

        <div style={{ 
          background: 'rgba(52, 152, 219, 0.1)',
          border: '2px solid rgba(52, 152, 219, 0.3)',
          borderRadius: '12px',
          padding: '25px'
        }}>
          <h3 style={{ color: '#3498db', marginBottom: '15px' }}>
            📊 What The Data Tells Us
          </h3>
          <p style={{ 
            fontSize: '1.1rem',
            lineHeight: '1.6',
            marginBottom: '0'
          }}>
            Formula 1's evolution is not just about raw speed—it's about balancing performance, 
            sustainability, safety, and competition. The "paradox" reveals that technological 
            progress doesn't always mean faster lap times when regulations prioritize other goals. 
            <strong>Sometimes, the fastest cars in history were built when rules allowed pure speed.</strong>
          </p>
        </div>
      </div>

      {/* Footer Section */}
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
      </div>
    </ImmersiveHomepage>
  );

}

export default App;