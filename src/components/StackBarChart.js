import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

const StackBarChart = ({ 
  allCircuitData = {},
  width = 1200, 
  height = 700 
}) => {
  const svgRef = useRef();
  const [hoveredBar, setHoveredBar] = useState(null);


  const createShortName = (fullName) => {
    const specialCases = {
      'Circuit de Spa-Francorchamps': 'Spa',
      'Circuit de Monaco': 'Monaco', 
      'Circuit Gilles Villeneuve': 'Canada',
      'Circuit de Nevers Magny-Cours': 'Magny-Cours',
      'Circuit Paul Ricard': 'Paul Ricard',
      'Autodromo Nazionale di Monza': 'Monza',
      'Autodromo Hermanos Rodriguez': 'Mexico',
      'Autodromo Jose Carlos Pace': 'Interlagos',
      'Autodromo Enzo e Dino Ferrari': 'Imola',
      'Silverstone Circuit': 'Silverstone',
      'Suzuka Circuit': 'Suzuka',
      'Hungaroring': 'Hungary',
      'Red Bull Ring': 'Austria',
      'Bahrain International Circuit': 'Bahrain',
      'Shanghai International Circuit': 'China',
      'Melbourne Grand Prix Circuit': 'Melbourne',
      'Marina Bay Street Circuit': 'Singapore',
      'Yas Marina Circuit': 'Abu Dhabi',
      'Circuit of the Americas': 'COTA'
    };

    if (specialCases[fullName]) return specialCases[fullName];
    
    if (fullName.startsWith('Circuit de ')) {
      const remaining = fullName.replace('Circuit de ', '');
      return remaining.includes('-') ? remaining.split('-')[0] : remaining.split(' ')[0];
    }
    
    if (fullName.startsWith('Autodromo ')) {
      const remaining = fullName.replace('Autodromo ', '');
      if (remaining.includes('di ')) return remaining.split('di ')[1].split(' ')[0];
      if (remaining.includes('Hermanos')) return 'Mexico';
      if (remaining.includes('Jose Carlos')) return 'Interlagos';
      return remaining.split(' ')[0];
    }

    return fullName.length > 12 ? fullName.substring(0, 10) : fullName;
  };
  const analyzeParticipationData = () => {
    const circuitAnalysis = [];
    const globalEraStats = {
      early: { recordCount: 0, circuits: new Set() },
      v10: { recordCount: 0, circuits: new Set() },
      v8: { recordCount: 0, circuits: new Set() },
      hybrid: { recordCount: 0, circuits: new Set() }
    };

    Object.entries(allCircuitData).forEach(([circuitId, circuitInfo]) => {
      const lapTimeData = circuitInfo.lapTimeData || [];
      
      if (lapTimeData.length > 0) {
        const eraParticipation = { early: 0, v10: 0, v8: 0, hybrid: 0 };
        const eraDetails = {
          early: { years: [], times: [], bestTime: Infinity },
          v10: { years: [], times: [], bestTime: Infinity },
          v8: { years: [], times: [], bestTime: Infinity },
          hybrid: { years: [], times: [], bestTime: Infinity }
        };

        lapTimeData.forEach(yearData => {
          const era = yearData.era;
          if (eraParticipation.hasOwnProperty(era)) {
            eraParticipation[era]++;
            eraDetails[era].years.push(yearData.year);
            eraDetails[era].times.push(yearData.milliseconds);
            
            if (yearData.milliseconds < eraDetails[era].bestTime) {
              eraDetails[era].bestTime = yearData.milliseconds;
            }
            globalEraStats[era].circuits.add(circuitInfo.name);
          }
        });

        const allTimes = lapTimeData.map(d => ({ time: d.milliseconds, era: d.era, year: d.year }));
        const fastestLap = allTimes.reduce((fastest, current) => 
          current.time < fastest.time ? current : fastest
        );

        circuitAnalysis.push({
          circuitId: circuitId,
          name: circuitInfo.name,
          shortName: createShortName(circuitInfo.name),
          recordHolder: fastestLap.era,
          recordYear: fastestLap.year,
          recordTime: fastestLap.time,
          eraParticipation: eraParticipation,
          eraDetails: eraDetails,
          totalYears: lapTimeData.length
        });

        globalEraStats[fastestLap.era].recordCount++;
      }
    });

    Object.keys(globalEraStats).forEach(era => {
      globalEraStats[era].totalCircuits = globalEraStats[era].circuits.size;
      delete globalEraStats[era].circuits;
    });

    return { circuitAnalysis, globalEraStats };
  };

  const prepareChartData = () => {
    const { circuitAnalysis, globalEraStats } = analyzeParticipationData();
    
    if (circuitAnalysis.length === 0) return { data: [], globalStats: globalEraStats };

    const sortedCircuits = circuitAnalysis.sort((a, b) => b.totalYears - a.totalYears);

    const chartData = sortedCircuits.map(circuit => ({
      name: circuit.shortName,
      fullName: circuit.name,
      recordHolder: circuit.recordHolder,
      recordYear: circuit.recordYear,
      recordTime: circuit.recordTime,
      totalYears: circuit.totalYears,
      early: circuit.eraParticipation.early,
      v10: circuit.eraParticipation.v10,
      v8: circuit.eraParticipation.v8,
      hybrid: circuit.eraParticipation.hybrid,
      eraDetails: circuit.eraDetails
    }));

    return { data: chartData, globalStats: globalEraStats };
  };

  const formatTime = (ms) => {
    if (ms === Infinity) return 'N/A';
    const seconds = ms / 1000;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return minutes > 0 ? `${minutes}:${remainingSeconds.toFixed(3).padStart(6, '0')}` : `${remainingSeconds.toFixed(3)}s`;
  };

  useEffect(() => {
    if (!svgRef.current) return;

    d3.select(svgRef.current).selectAll("*").remove();

    const { data, globalStats } = prepareChartData();
    
    if (data.length === 0) return;

    const margin = { top: 80, right: 200, bottom: 100, left: 80 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current)
      .append("svg")
      .attr("width", width)
      .attr("height", height);

    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const eraColors = {
      early: '#9b59b6',
      v10: '#e74c3c',
      v8: '#3498db',
      hybrid: '#2ecc71'
    };

    const eraNames = {
      early: 'Early Era (1950-1994)',
      v10: 'V10 Era (1995-2005)',
      v8: 'V8 Era (2006-2013)', 
      hybrid: 'Hybrid Era (2014-2024)'
    };

    const xScale = d3.scaleBand()
      .domain(data.map(d => d.name))
      .range([0, chartWidth])
      .padding(0.03);

    const maxValue = d3.max(data, d => d.early + d.v10 + d.v8 + d.hybrid);
    const yScale = d3.scaleLinear()
      .domain([0, maxValue + 2])
      .range([chartHeight, 0]);

    const stack = d3.stack().keys(['early', 'v10', 'v8', 'hybrid']);
    const stackedData = stack(data);

    const groups = g.selectAll(".era-group")
      .data(stackedData)
      .enter().append("g")
      .attr("class", "era-group")
      .attr("fill", d => eraColors[d.key]);

    groups.selectAll(".bar")
      .data(d => d)
      .enter().append("rect")
      .attr("class", "bar")
      .attr("x", d => xScale(d.data.name))
      .attr("y", d => yScale(d[1]))
      .attr("height", d => Math.max(0, yScale(d[0]) - yScale(d[1])))
      .attr("width", xScale.bandwidth())
      .style("cursor", "pointer")
      .style("stroke", "#fff")
      .style("stroke-width", 1)
      .on("mouseover", function(event, d) {
        const era = d3.select(this.parentNode).datum().key;
        const eraDetail = d.data.eraDetails[era];
        
        setHoveredBar({
          circuit: d.data.fullName,
          era: eraNames[era],
          participationYears: d.data[era],
          recordHolder: eraNames[d.data.recordHolder],
          recordYear: d.data.recordYear,
          recordTime: d.data.recordTime,
          totalYears: d.data.totalYears,
          eraYears: eraDetail.years,
          eraBestTime: eraDetail.bestTime,
          isRecordHolder: era === d.data.recordHolder
        });
        
        d3.select(this).style("opacity", 0.8);
      })
      .on("mouseout", function() {
        setHoveredBar(null);
        d3.select(this).style("opacity", 1);
      });

    const xAxis = g.append("g")
      .attr("transform", `translate(0,${chartHeight})`)
      .call(d3.axisBottom(xScale));

    xAxis.selectAll("text")
      .style("text-anchor", "end")
      .attr("dx", "-.3em")
      .attr("dy", ".15em")
      .attr("transform", "rotate(-30)") 
      .style("font-size", "9px") 
      .style("fill", "#2c3e50")
      .style("font-weight", "500");

    g.append("g").call(d3.axisLeft(yScale))
      .selectAll("text")
      .style("font-size", "12px")
      .style("fill", "#2c3e50");

    g.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left + 20)
      .attr("x", 0 - (chartHeight / 2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .style("fill", "#2c3e50")
      .style("font-weight", "bold")
      .style("font-size", "14px")
      .text("Years of Participation");

    g.append("text")
      .attr("transform", `translate(${chartWidth / 2}, ${chartHeight + margin.bottom - 20})`)
      .style("text-anchor", "middle")
      .style("fill", "#2c3e50")
      .style("font-weight", "bold")
      .style("font-size", "14px")
      .text("F1 Circuits");

    const legend = g.append("g")
      .attr("transform", `translate(${chartWidth + 20}, 20)`);

    const legendItems = Object.keys(eraColors).map(era => ({
      era,
      name: eraNames[era].split(' ')[0] + ' ' + eraNames[era].split(' ')[1],
      color: eraColors[era],
      recordCount: globalStats[era].recordCount
    }));

    const legendGroups = legend.selectAll(".legend-item")
      .data(legendItems)
      .enter().append("g")
      .attr("class", "legend-item")
      .attr("transform", (d, i) => `translate(0, ${i * 30})`);

    legendGroups.append("rect")
      .attr("width", 15)
      .attr("height", 15)
      .attr("fill", d => d.color)
      .attr("stroke", "#fff")
      .attr("stroke-width", 1);

    legendGroups.append("text")
      .attr("x", 20)
      .attr("y", 12)
      .style("font-size", "12px")
      .style("fill", "#2c3e50")
      .style("font-weight", "bold")
      .text(d => d.name);

    legendGroups.append("text")
      .attr("x", 20)
      .attr("y", 25)
      .style("font-size", "10px")
      .style("fill", "#666")
      .text(d => `${d.recordCount} records`);

    svg.append("text")
      .attr("x", width/2)
      .attr("y", 30)
      .attr("text-anchor", "middle")
      .attr("font-size", "20px")
      .attr("font-weight", "bold")
      .attr("fill", "#2c3e50")
      .text("F1 Era Participation by Circuit");

    svg.append("text")
      .attr("x", width/2)
      .attr("y", 50)
      .attr("text-anchor", "middle")
      .attr("font-size", "12px")
      .attr("fill", "#7f8c8d")
      .text(`Years each era participated at F1 circuits (${data.length} circuits)`);

  }, [allCircuitData, width, height]);

  const { data, globalStats } = prepareChartData();

  if (data.length === 0) {
    return (
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        borderRadius: '16px',
        padding: '40px',
        textAlign: 'center',
        color: '#666',
        margin: '20px'
      }}>
        <h3>F1 Era Participation Analysis</h3>
        <p>Loading circuit data...</p>
      </div>
    );
  }

  return (
    <div style={{
      background: 'rgba(255, 255, 255, 0.95)',
      borderRadius: '16px',
      padding: '20px',
      margin: '20px',
      position: 'relative',
      display: 'flex',       
    justifyContent: 'center' 
    }}>
      <div ref={svgRef}></div>

      {/* hover tooltip */}
      {hoveredBar && (
        <div style={{
          position: 'absolute',
          top: '100px',
          right: '20px',
          background: 'rgba(0, 0, 0, 0.9)',
          color: 'white',
          padding: '12px',
          borderRadius: '8px',
          fontSize: '12px',
          maxWidth: '220px',
          zIndex: 1000,
          border: '1px solid rgba(255,255,255,0.2)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#4ecdc4' }}>
            {hoveredBar.circuit}
          </div>
          
          <div style={{ marginBottom: '6px', borderBottom: '1px solid rgba(255,255,255,0.2)', paddingBottom: '6px' }}>
            <strong>Record:</strong> {hoveredBar.recordHolder}
            <br />
            <strong>Year:</strong> {hoveredBar.recordYear}
            <br />
            <strong>Time:</strong> {formatTime(hoveredBar.recordTime)}
          </div>

          <div style={{ marginBottom: '6px' }}>
            <strong style={{ color: '#ffc107' }}>{hoveredBar.era}</strong>
            <br />
            <strong>Participation:</strong> {hoveredBar.participationYears} years
            {hoveredBar.participationYears > 0 && (
              <>
                <br />
                <strong>Best:</strong> {formatTime(hoveredBar.eraBestTime)}
              </>
            )}
          </div>

          <div style={{ fontSize: '11px', color: '#ccc' }}>
            Total History: {hoveredBar.totalYears} years
          </div>

          {hoveredBar.isRecordHolder && (
            <div style={{ 
              marginTop: '6px', 
              color: '#ff6b6b', 
              fontWeight: 'bold', 
              fontSize: '11px',
              background: 'rgba(255, 107, 107, 0.2)',
              padding: '3px 6px',
              borderRadius: '4px'
            }}>
              🏆 Lap Record Holder!
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StackBarChart;