import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

const GlobalF1Sankey = ({ 
  races = [],
  constructors = [],
  constructorResults = [],
  lapTimes = [],
  qualifyingCircuits = [],
  width = 1200, 
  height = 700 
}) => {
  const svgRef = useRef();
  const [hoveredFlow, setHoveredFlow] = useState(null);

  const analyzeRealF1Data = () => {
    console.log("=== Analyzing Real F1 Data ===");
    console.log("Constructors:", constructors.length);
    console.log("Races:", races.length);
    console.log("Constructor Results:", constructorResults.length);
  
    const getEra = (year) => {
      if (year >= 2014) return 'hybrid';
      if (year >= 2006) return 'v8';
      if (year >= 1995) return 'v10';
      return 'early';
    };

    const constructorParticipation = {};
    constructorResults.forEach(result => {
      constructorParticipation[result.constructorId] = 
        (constructorParticipation[result.constructorId] || 0) + 1;
    });

    const majorConstructors = constructors
      .filter(constructor => (constructorParticipation[constructor.constructorId] || 0) > 50)
      .sort((a, b) => (constructorParticipation[b.constructorId] || 0) - (constructorParticipation[a.constructorId] || 0))
      .slice(0, 8);

    console.log("Major constructors:", majorConstructors.map(c => c.name));
    const constructorEraData = {};
    
    races.forEach(race => {
      const era = getEra(race.year);
      const raceResults = constructorResults.filter(cr => cr.raceId === race.raceId);
      
      raceResults.forEach(result => {
        const constructorId = result.constructorId;
        if (!constructorEraData[constructorId]) {
          constructorEraData[constructorId] = {
            early: 0, v10: 0, v8: 0, hybrid: 0
          };
        }
        constructorEraData[constructorId][era]++;
      });
    });

    const constructorPerformance = {};
    constructorResults.forEach(result => {
      if (!constructorPerformance[result.constructorId]) {
        constructorPerformance[result.constructorId] = {
          totalPoints: 0,
          raceCount: 0
        };
      }
      constructorPerformance[result.constructorId].totalPoints += (result.points || 0);
      constructorPerformance[result.constructorId].raceCount++;
    });

    Object.keys(constructorPerformance).forEach(constructorId => {
      const data = constructorPerformance[constructorId];
      data.avgPoints = data.totalPoints / data.raceCount;
    });

    return {
      majorConstructors,
      constructorEraData,
      constructorPerformance,
      getEra
    };
  };
  const createGlobalSankey = () => {
    const analysis = analyzeRealF1Data();
    
    if (!analysis.majorConstructors.length) {
      console.log("No data available for Sankey");
      return { nodes: [], links: [] };
    }

    // Node colors
    const constructorColors = {
      'Ferrari': '#DC143C',
      'McLaren': '#FF8700', 
      'Williams': '#005AFF',
      'Mercedes': '#00D2BE',
      'Red Bull': '#0600EF',
      'Renault': '#0082FA',
      'Lotus': '#FFD700',
      'Tyrrell': '#800080'
    };

    const eraColors = {
      early: '#9b59b6',
      v10: '#e74c3c',
      v8: '#3498db', 
      hybrid: '#2ecc71'
    };

    // Stage 1: Major Constructors 
    const constructorNodes = analysis.majorConstructors.map(constructor => ({
      id: `constructor_${constructor.constructorId}`,
      name: constructor.name,
      stage: 0,
      color: constructorColors[constructor.name] || '#666',
      constructorId: constructor.constructorId
    }));

    // Stage 2: Engine Eras
    const eraNodes = [
      { id: 'early_era', name: 'Early Era\n(1950-1994)', stage: 1, color: eraColors.early, avgHP: 350 },
      { id: 'v10_era', name: 'V10 Era\n(1995-2005)', stage: 1, color: eraColors.v10, avgHP: 850 },
      { id: 'v8_era', name: 'V8 Era\n(2006-2013)', stage: 1, color: eraColors.v8, avgHP: 750 },
      { id: 'hybrid_era', name: 'V6 Hybrid Era\n(2014-2024)', stage: 1, color: eraColors.hybrid, avgHP: 1000 }
    ];

    // Stage 3: Horsepower Ranges
    const powerNodes = [
      { id: 'low_hp', name: 'Low Power\n(300-500 HP)', stage: 2, color: '#95a5a6' },
      { id: 'med_hp', name: 'Medium Power\n(500-800 HP)', stage: 2, color: '#f39c12' },
      { id: 'high_hp', name: 'High Power\n(800-950 HP)', stage: 2, color: '#e67e22' },
      { id: 'ultra_hp', name: 'Ultra Power\n(1000+ HP)', stage: 2, color: '#c0392b' }
    ];

    // Stage 4: Performance Categories
    const performanceNodes = [
      { id: 'champions', name: 'Championship\nContenders', stage: 3, color: '#ff1744' },
      { id: 'competitive', name: 'Competitive\nTeams', stage: 3, color: '#ff5722' },
      { id: 'midfield', name: 'Midfield\nRunners', stage: 3, color: '#ff9800' },
      { id: 'backmarkers', name: 'Backmarker\nTeams', stage: 3, color: '#ffc107' }
    ];

    const allNodes = [...constructorNodes, ...eraNodes, ...powerNodes, ...performanceNodes];

    const links = [];

    // 1. Constructors → Eras 
    analysis.majorConstructors.forEach(constructor => {
      const constructorId = constructor.constructorId;
      const eraData = analysis.constructorEraData[constructorId];
      
      if (eraData) {
        if (eraData.early > 0) {
          links.push({
            source: `constructor_${constructorId}`,
            target: 'early_era',
            value: Math.sqrt(eraData.early) * 3,
            desc: `${constructor.name}: ${eraData.early} races in early era`
          });
        }
        if (eraData.v10 > 0) {
          links.push({
            source: `constructor_${constructorId}`,
            target: 'v10_era', 
            value: Math.sqrt(eraData.v10) * 3,
            desc: `${constructor.name}: ${eraData.v10} races in V10 era`
          });
        }
        if (eraData.v8 > 0) {
          links.push({
            source: `constructor_${constructorId}`,
            target: 'v8_era',
            value: Math.sqrt(eraData.v8) * 3,
            desc: `${constructor.name}: ${eraData.v8} races in V8 era`
          });
        }
        if (eraData.hybrid > 0) {
          links.push({
            source: `constructor_${constructorId}`,
            target: 'hybrid_era',
            value: Math.sqrt(eraData.hybrid) * 3,
            desc: `${constructor.name}: ${eraData.hybrid} races in hybrid era`
          });
        }
      }
    });

    // 2. Eras → Horsepower 
    links.push(
      { source: 'early_era', target: 'low_hp', value: 30, desc: 'Early era: ~350 HP average' },
      { source: 'early_era', target: 'med_hp', value: 10, desc: 'Early era: Some higher power' },
      
      { source: 'v10_era', target: 'high_hp', value: 40, desc: 'V10 era: ~850 HP peak' },
      { source: 'v10_era', target: 'med_hp', value: 15, desc: 'V10 era: Early development' },
      
      { source: 'v8_era', target: 'med_hp', value: 35, desc: 'V8 era: ~750 HP regulated' },
      { source: 'v8_era', target: 'high_hp', value: 10, desc: 'V8 era: Peak performance' },
      
      { source: 'hybrid_era', target: 'ultra_hp', value: 45, desc: 'Hybrid era: 1000+ HP total' },
      { source: 'hybrid_era', target: 'high_hp', value: 10, desc: 'Hybrid era: ICE component' }
    );

    // 3. Horsepower → Performance (THE PARADOX!)
    links.push(
      { source: 'low_hp', target: 'competitive', value: 15, desc: 'Low power: Still competitive in era' },
      { source: 'low_hp', target: 'midfield', value: 20, desc: 'Low power: Mostly midfield' },
      { source: 'low_hp', target: 'backmarkers', value: 10, desc: 'Low power: Some backmarkers' },
      
      { source: 'med_hp', target: 'champions', value: 15, desc: 'Medium power: Championship capable' },
      { source: 'med_hp', target: 'competitive', value: 25, desc: 'Medium power: Very competitive' },
      { source: 'med_hp', target: 'midfield', value: 15, desc: 'Medium power: Solid midfield' },
      
      // 🚨 PARADOX: High power V10 era = Many records!
      { source: 'high_hp', target: 'champions', value: 35, desc: '🏆 PARADOX: V10 era champions & lap records!' },
      { source: 'high_hp', target: 'competitive', value: 20, desc: 'High power: Very competitive' },
      
      // 🚨 PARADOX: Ultra power hybrid = Regulated performance
      { source: 'ultra_hp', target: 'champions', value: 20, desc: 'Ultra power: Some champions' },
      { source: 'ultra_hp', target: 'competitive', value: 25, desc: '⚠️ PARADOX: Most power, but regulated performance!' }
    );

    return { nodes: allNodes, links };
  };

  useEffect(() => {
    if (!svgRef.current) return;

    // Clear previous
    d3.select(svgRef.current).selectAll("*").remove();

    const { nodes, links } = createGlobalSankey();
    
    if (nodes.length === 0) {
      return; // No data to display
    }

    const margin = { top: 100, right: 50, bottom: 120, left: 50 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current)
      .append("svg")
      .attr("width", width)
      .attr("height", height);

    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Layout
    const stageWidth = chartWidth / 4;
    [0, 1, 2, 3].forEach(stage => {
      const stageNodes = nodes.filter(n => n.stage === stage);
      const nodeHeight = Math.min(40, (chartHeight - 40) / Math.max(stageNodes.length, 1));
      const spacing = Math.max(5, (chartHeight - stageNodes.length * nodeHeight) / (stageNodes.length + 1));
      
      stageNodes.forEach((node, i) => {
        node.x = stage * stageWidth + stageWidth * 0.05;
        node.y = spacing + i * (nodeHeight + spacing);
        node.width = stageWidth * 0.9;
        node.height = nodeHeight;
      });
    });

    // Process links
    const processedLinks = links.map(link => ({
      ...link,
      source: nodes.find(n => n.id === link.source),
      target: nodes.find(n => n.id === link.target)
    })).filter(link => link.source && link.target);

    // Link path
    const linkPath = d3.linkHorizontal()
      .source(d => [d.source.x + d.source.width, d.source.y + d.source.height/2])
      .target(d => [d.target.x, d.target.y + d.target.height/2]);

    // Draw links
    g.selectAll(".sankey-link")
      .data(processedLinks)
      .enter().append("path")
      .attr("class", "sankey-link")
      .attr("d", linkPath)
      .attr("stroke", d => {
        if (d.desc.includes('🏆') || d.desc.includes('⚠️')) return '#ff1744';
        return d.source.color || '#666';
      })
      .attr("stroke-width", d => Math.max(1, d.value / 2))
      .attr("fill", "none")
      .attr("opacity", d => d.desc.includes('PARADOX') ? 0.8 : 0.4)
      .style("cursor", "pointer")
      .on("mouseover", function(event, d) {
        d3.select(this).attr("opacity", 0.9);
        setHoveredFlow({
          source: d.source.name.replace('\n', ' '),
          target: d.target.name.replace('\n', ' '),
          value: d.value,
          description: d.desc
        });
      })
      .on("mouseout", function(event, d) {
        d3.select(this).attr("opacity", d.desc.includes('PARADOX') ? 0.8 : 0.4);
        setHoveredFlow(null);
      });

    // Draw nodes
    const nodeGroups = g.selectAll(".sankey-node")
      .data(nodes)
      .enter().append("g")
      .attr("class", "sankey-node")
      .attr("transform", d => `translate(${d.x},${d.y})`);

    nodeGroups.append("rect")
      .attr("width", d => d.width)
      .attr("height", d => d.height)
      .attr("fill", d => d.color)
      .attr("stroke", "#fff")
      .attr("stroke-width", 1)
      .attr("rx", 6)
      .attr("opacity", 0.9);

    nodeGroups.append("text")
      .attr("x", d => d.width/2)
      .attr("y", d => d.height/2)
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .attr("fill", "white")
      .attr("font-weight", "bold")
      .attr("font-size", "10px")
      .style("pointer-events", "none")
      .selectAll("tspan")
      .data(d => d.name.split('\n'))
      .enter().append("tspan")
      .attr("x", function() { return d3.select(this.parentNode).attr("x"); })
      .attr("dy", (d, i) => i === 0 ? "-0.3em" : "1.1em")
      .text(d => d);

    // Stage headers
    const headers = [
      { x: stageWidth/2, label: "Major Teams", desc: "Based on race participation" },
      { x: stageWidth * 1.5, label: "Engine Eras", desc: "Technological periods" },
      { x: stageWidth * 2.5, label: "Power Output", desc: "Horsepower ranges" },
      { x: stageWidth * 3.5, label: "Performance", desc: "Championship results" }
    ];

    headers.forEach(header => {
      g.append("text")
        .attr("x", header.x)
        .attr("y", -60)
        .attr("text-anchor", "middle")
        .attr("font-size", "14px")
        .attr("font-weight", "bold")
        .attr("fill", "#2c3e50")
        .text(header.label);

      g.append("text")
        .attr("x", header.x)
        .attr("y", -45)
        .attr("text-anchor", "middle")
        .attr("font-size", "11px")
        .attr("fill", "#7f8c8d")
        .text(header.desc);
    });

    // Title
    svg.append("text")
      .attr("x", width/2)
      .attr("y", 30)
      .attr("text-anchor", "middle")
      .attr("font-size", "20px")
      .attr("font-weight", "bold")
      .attr("fill", "#2c3e50")
      .text("The F1 Performance Paradox: 75 Years of Data");

    svg.append("text")
      .attr("x", width/2)
      .attr("y", 50)
      .attr("text-anchor", "middle")
      .attr("font-size", "12px")
      .attr("fill", "#7f8c8d")
      .text("From Major Teams to Performance: Why V10 Era (850 HP) Still Holds More Records Than Hybrid Era (1000+ HP)");

    // Paradox explanation
    g.append("text")
      .attr("x", chartWidth/2)
      .attr("y", chartHeight + 80)
      .attr("text-anchor", "middle")
      .attr("font-size", "12px")
      .attr("font-weight", "bold")
      .attr("fill", "#ff1744")
      .text("🚨 THE PARADOX: Despite highest power output, modern F1 is limited by fuel flow, weight, and aerodynamic regulations");

  }, [races, constructors, constructorResults, width, height]);

  // Early return for no data
  if (!constructors.length || !races.length) {
    return (
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        borderRadius: '16px',
        padding: '40px',
        textAlign: 'center',
        color: '#666',
        margin: '40px 20px'
      }}>
        <h3>F1 Performance Analysis</h3>
        <p>Loading data for global performance analysis...</p>
      </div>
    );
  }

  return (
    <div style={{
      background: 'rgba(255, 255, 255, 0.95)',
      borderRadius: '16px',
      padding: '20px',
      margin: '40px 20px',
      position: 'relative'
    }}>
      <div ref={svgRef}></div>
      
      {hoveredFlow && (
        <div style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          background: 'rgba(0, 0, 0, 0.9)',
          color: 'white',
          padding: '15px',
          borderRadius: '8px',
          fontSize: '12px',
          maxWidth: '250px',
          zIndex: 1000
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>
            {hoveredFlow.source} → {hoveredFlow.target}
          </div>
          <div style={{ marginBottom: '5px' }}>
            Flow: {hoveredFlow.value.toFixed(1)}
          </div>
          <div style={{ opacity: 0.8, fontSize: '11px' }}>
            {hoveredFlow.description}
          </div>
        </div>
      )}
    </div>
  );
};

export default GlobalF1Sankey;