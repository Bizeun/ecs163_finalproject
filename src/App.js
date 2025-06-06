import { useState, useEffect } from 'react';
import { loadCSV } from './utils/dataLoader';
import { findQualifyingCircuits, getCircuitLapTimeEvolution } from './utils/dataProcessor';
import WorldMap from './components/WorldMap';
import CircuitInfo from './components/CircuitInfo';
import ImmersiveHomepage from './components/DynamicPage';
import StackBarChart from './components/StackBarChart';
import GlobalF1Sankey from './components/GlobalSankey';
import Footer from './components/Footer';

import './App.css';

function App() {
  const [data, setData] = useState(null);
  const [selectedCircuit, setSelectedCircuit] = useState(null);
  const [circuitLapData, setCircuitLapData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [allCircuitData, setAllCircuitData] = useState({});

  
  // Main data loading effect - runs once on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load all F1 datasets concurrently for better performance
        // These CSV files contain 75 years of F1 data (1950-2024)
        const [races, circuits, lapTimes, constructors, constructorResults] = await Promise.all([
          loadCSV('races.csv'), // Race information with dates and circuit references
          loadCSV('circuit.csv'), // Circuit details including coordinates for world map
          loadCSV('lap_times.csv'), // 550k+ individual lap times - core of our analysis
          loadCSV('constructors.csv'), // Team/manufacturer information
          loadCSV('constructor_results.csv') // Team performance data for Sankey diagram
        ]);
        

        // Pre-process lap time evolution for all qualifying circuits
        // This front-loads the computation to improve interactive performance
        const qualifyingCircuits = findQualifyingCircuits(circuits, races);
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
        });
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

  // Circuit selection effect - updates when user selects a different circuit
  useEffect(() => {
    if (selectedCircuit && data) {
      // Process lap time data specifically for the selected circuit
      // This provides detailed temporal analysis for individual circuit exploration
      try {
        const lapTimeEvolution = getCircuitLapTimeEvolution(
          selectedCircuit.circuitId, 
          data.races, 
          data.lapTimes
        );
        
        setCircuitLapData(lapTimeEvolution);
      } catch (error) {
        console.error('Error processing lap time data:', error);
        setCircuitLapData([]);
      }
    } else {
      setCircuitLapData(null);
    }
  }, [selectedCircuit, data]);

  // Handler for circuit selection from world map
  // Updates the selected circuit state to trigger detailed analysis
  const handleCircuitSelect = (circuit) => {
    console.log('Selected circuit:', circuit.displayName);
    setSelectedCircuit(circuit);
  };

  // Loading state - shown while processing 550k+ lap time records
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
              <strong>Races:</strong> <span style={{color: '#000', backgroundColor: 'rgba(255,255,255,0.9)', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold'}}>{data.races.length.toLocaleString()}</span>
            </span>
            <span>
              <strong>Circuits:</strong> <span style={{color: '#000', backgroundColor: 'rgba(255,255,255,0.9)', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold'}}>{data.circuits.length}</span>
            </span>
            <span>
              <strong>Lap Times:</strong> <span style={{color: '#000', backgroundColor: 'rgba(255,255,255,0.9)', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold'}}>{data.lapTimes.length.toLocaleString()}</span>
            </span>
            <span>
              <strong>Constructors:</strong> <span style={{color: '#000', backgroundColor: 'rgba(255,255,255,0.9)', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold'}}>{data.constructors.length}</span>
            </span>
            <span>
              <strong>Processed Circuits:</strong> <span style={{color: '#000', backgroundColor: 'rgba(255,255,255,0.9)', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold'}}>{Object.keys(allCircuitData).length}</span>
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


      {/* Transition Section: Individual → Global */}
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
          From Individual to Global Patterns
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
            💡 <strong>The big question:</strong> Despite 75 years of technological advancement, 
            many lap records still belong to the early 2000s V10 era. What happens when we analyze 
            <strong> all {Object.keys(allCircuitData).length} qualifying circuits together</strong>? 
            The pattern might surprise you...

          </p>
        </div>
      </div>

      {/* Era Dominance Char! */}
      <StackBarChart
        allCircuitData={allCircuitData}
        height={700}
      />

      {/* Bridge to Sankey: Pattern Discovery → Cause Analysis */}
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
            <strong>The paradox deepens:</strong> Modern hybrid cars produce 1000+ HP compared to 
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

      {/* Conclusion Section */}
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
          🏁 Key Findings: The F1 Paradox Revealed
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
            <h3 style={{ color: '#e74c3c', marginBottom: '10px' }}>V10 Era Dominance</h3>
            <p><strong>Finding:</strong> The V10 era (1995-2005) holds the majority of fastest lap records across qualifying circuits, despite being 20+ years old.</p>
          </div>
          
          <div style={{
            background: 'rgba(255, 193, 7, 0.1)',
            border: '2px solid rgba(255, 193, 7, 0.3)',
            borderRadius: '12px',
            padding: '20px'
          }}>
            <h3 style={{ color: '#ffc107', marginBottom: '10px' }}>Power vs Performance</h3>
            <p><strong>Paradox:</strong> Modern hybrid cars (1000+ HP) are often slower than V10 cars (~850 HP) due to regulatory constraints.</p>
          </div>
          
          <div style={{
            background: 'rgba(46, 204, 113, 0.1)',
            border: '2px solid rgba(46, 204, 113, 0.3)',
            borderRadius: '12px',
            padding: '20px'
          }}>
            <h3 style={{ color: '#2ecc71', marginBottom: '10px' }}>Cross-Circuit Consistency</h3>
            <p><strong>Pattern:</strong> The V10 era's speed advantage appears consistently across different circuit types and geographical locations.</p>
          </div>
        </div>

        <div style={{ 
          background: 'rgba(52, 152, 219, 0.1)',
          border: '2px solid rgba(52, 152, 219, 0.3)',
          borderRadius: '12px',
          padding: '25px'
        }}>
          <h3 style={{ color: '#3498db', marginBottom: '15px' }}>
            What This Means for F1's Future
          </h3>
          <p style={{ 
            fontSize: '1.1rem',
            lineHeight: '1.6',
            marginBottom: '0'
          }}>
            Our analysis reveals that Formula 1's evolution transcends pure speed. The sport has shifted from 
            prioritizing maximum velocity to balancing <strong>performance, sustainability, safety, and competition</strong>. 
            The upcoming 2026 regulations present an opportunity to break this paradox - will new rules finally 
            enable cars to surpass the legendary V10 era? <strong>Only time will tell if F1 can reclaim its speed crown.</strong>
          </p>
        </div>
      </div>

      {/* Footer Section */}
      <Footer />
    </ImmersiveHomepage>
  );

}

export default App;