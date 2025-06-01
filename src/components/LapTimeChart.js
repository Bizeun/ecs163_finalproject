import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

// Engine era definitions
const ENGINE_ERAS = {
  early: { start: 1950, end: 1994, name: "Early Era", color: "#9b59b6" },
  v10: { start: 1995, end: 2005, name: "V10 Era", color: "#e74c3c" },
  v8: { start: 2006, end: 2013, name: "V8 Era", color: "#3498db" },
  hybrid: { start: 2014, end: 2024, name: "V6 Hybrid Era", color: "#2ecc71" }
};

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

const LapTimeChart = ({ 
  data, 
  circuitName, 
  width = 900, 
  height = 500,
  margin = { top: 40, right: 100, bottom: 80, left: 120 }
}) => {
  const chartRef = useRef();

  useEffect(() => {
    if (!data || data.length === 0) return;

    // Clear previous chart
    d3.select(chartRef.current).selectAll("*").remove();

    // Calculate chart dimensions
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    // Create SVG
    const svg = d3.select(chartRef.current)
      .append("svg")
      .attr("width", width)
      .attr("height", height);

    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Scales
    const xScale = d3.scaleLinear()
      .domain(d3.extent(data, d => d.year))
      .range([0, chartWidth]);

    const yScale = d3.scaleLinear()
      .domain(d3.extent(data, d => d.milliseconds))
      .range([chartHeight, 0]);

    // Era background colors
    const eraBackgrounds = Object.values(ENGINE_ERAS).filter(era => {
      const eraData = data.filter(d => 
        d.year >= era.start && d.year <= era.end
      );
      return eraData.length > 0;
    });

    // Add era background rectangles
    eraBackgrounds.forEach(era => {
      const xStart = Math.max(0, xScale(era.start));
      const xEnd = Math.min(chartWidth, xScale(era.end));
      
      g.append("rect")
        .attr("class", "era-background")
        .attr("x", xStart)
        .attr("width", xEnd - xStart)
        .attr("y", 0)
        .attr("height", chartHeight)
        .attr("fill", era.color)
        .attr("opacity", 0.1);
    });

    // Grid lines
    const xGrid = g.append("g").attr("class", "grid");
    const yGrid = g.append("g").attr("class", "grid");

    // X Grid
    xGrid.selectAll("line")
      .data(xScale.ticks(8))
      .enter().append("line")
      .attr("x1", d => xScale(d))
      .attr("x2", d => xScale(d))
      .attr("y1", 0)
      .attr("y2", chartHeight)
      .attr("stroke", "rgba(255, 255, 255, 0.1)")
      .attr("stroke-dasharray", "2,2");

    // Y Grid
    yGrid.selectAll("line")
      .data(yScale.ticks(6))
      .enter().append("line")
      .attr("x1", 0)
      .attr("x2", chartWidth)
      .attr("y1", d => yScale(d))
      .attr("y2", d => yScale(d))
      .attr("stroke", "rgba(255, 255, 255, 0.1)")
      .attr("stroke-dasharray", "2,2");

    // Line generator
    const line = d3.line()
      .x(d => xScale(d.year))
      .y(d => yScale(d.milliseconds))
      .curve(d3.curveMonotoneX);

    // Add the line
    g.append("path")
      .datum(data)
      .attr("class", "lap-time-line")
      .attr("fill", "none")
      .attr("stroke", "#4ecdc4")
      .attr("stroke-width", 3)
      .attr("d", line);

    // Add data points
    const dots = g.selectAll(".data-point")
      .data(data)
      .enter().append("circle")
      .attr("class", "data-point")
      .attr("cx", d => xScale(d.year))
      .attr("cy", d => yScale(d.milliseconds))
      .attr("r", 5)
      .attr("fill", d => ENGINE_ERAS[d.era].color)
      .attr("stroke", "#fff")
      .attr("stroke-width", 2)
      .style("cursor", "pointer");

    // Tooltip
    const tooltip = d3.select("body").append("div")
      .attr("class", "d3-tooltip")
      .style("position", "absolute")
      .style("visibility", "hidden")
      .style("background", "rgba(0, 0, 0, 0.9)")
      .style("color", "white")
      .style("padding", "12px")
      .style("border-radius", "8px")
      .style("font-size", "14px")
      .style("border", "1px solid rgba(255, 255, 255, 0.2)")
      .style("z-index", "1000");

    // Tooltip interactions
    dots
      .on("mouseover", function(event, d) {
        d3.select(this)
          .transition().duration(200)
          .attr("r", 8)
          .attr("stroke-width", 3);

        tooltip
          .style("visibility", "visible")
          .html(`
            <div style="font-weight: bold; color: #4ecdc4; margin-bottom: 8px;">
              ${d.year} ${circuitName}
            </div>
            <div><strong>Lap Time:</strong> ${formatLapTime(d.milliseconds)}</div>
            <div><strong>Era:</strong> ${ENGINE_ERAS[d.era].name}</div>
            <div><strong>Milliseconds:</strong> ${d.milliseconds.toLocaleString()}ms</div>
          `);
      })
      .on("mousemove", function(event) {
        tooltip
          .style("top", (event.pageY - 10) + "px")
          .style("left", (event.pageX + 10) + "px");
      })
      .on("mouseout", function() {
        d3.select(this)
          .transition().duration(200)
          .attr("r", 5)
          .attr("stroke-width", 2);

        tooltip.style("visibility", "hidden");
      });

    // Find fastest lap and highlight it
    const fastestLap = data.reduce((prev, current) => 
      (prev.milliseconds < current.milliseconds) ? prev : current
    );

    g.selectAll(".data-point")
      .filter(d => d === fastestLap)
      .attr("r", 8)
      .attr("stroke", "#ff6b6b")
      .attr("stroke-width", 3);

    // Add fastest lap annotation
    g.append("circle")
      .attr("cx", xScale(fastestLap.year))
      .attr("cy", yScale(fastestLap.milliseconds))
      .attr("r", 12)
      .attr("fill", "none")
      .attr("stroke", "#ff6b6b")
      .attr("stroke-width", 2)
      .attr("opacity", 0.7);

    g.append("text")
      .attr("x", xScale(fastestLap.year))
      .attr("y", yScale(fastestLap.milliseconds) - 20)
      .attr("text-anchor", "middle")
      .attr("fill", "#ff6b6b")
      .attr("font-weight", "bold")
      .attr("font-size", "12px")
      .text(`Fastest: ${formatLapTime(fastestLap.milliseconds)} (${fastestLap.year})`);

    // Axes
    const xAxis = g.append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0,${chartHeight})`)
      .call(d3.axisBottom(xScale)
        .tickFormat(d3.format("d"))
        .ticks(8));

    const yAxis = g.append("g")
      .attr("class", "y-axis")
      .call(d3.axisLeft(yScale)
        .tickFormat(d => formatLapTime(d))
        .ticks(6));

    // Style axes
    xAxis.selectAll("text")
      .style("fill", "black")
      .style("font-size", "12px");
    
    yAxis.selectAll("text")
      .style("fill", "black")
      .style("font-size", "12px");

    xAxis.selectAll("path, line")
      .style("stroke", "#718096");
    
    yAxis.selectAll("path, line")
      .style("stroke", "#718096");

    // Axis labels
    g.append("text")
      .attr("class", "axis-label")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left + 30)
      .attr("x", 0 - (chartHeight / 2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .style("fill", "black")
      .style("font-size", "14px")
      .style("font-weight", "600")
      .text("Lap Time");

    g.append("text")
      .attr("class", "axis-label")
      .attr("transform", `translate(${chartWidth / 2}, ${chartHeight + margin.bottom - 20})`)
      .style("text-anchor", "middle")
      .style("fill", "black")
      .style("font-size", "14px")
      .style("font-weight", "600")
      .text("Year");

    // Chart title
    g.append("text")
      .attr("class", "chart-title")
      .attr("x", chartWidth / 2)
      .attr("y", -10)
      .attr("text-anchor", "middle")
      .style("fill", "black")
      .style("font-size", "18px")
      .style("font-weight", "700")
      .text(`${circuitName} - Lap Time Evolution`);

    // Era legend
    const legend = g.append("g")
      .attr("class", "era-legend")
      .attr("transform", `translate(${chartWidth + 20}, 20)`);

    const legendItems = legend.selectAll(".legend-item")
      .data(eraBackgrounds)
      .enter().append("g")
      .attr("class", "legend-item")
      .attr("transform", (d, i) => `translate(0, ${i * 25})`);

    legendItems.append("rect")
      .attr("width", 15)
      .attr("height", 15)
      .attr("fill", d => d.color)
      .attr("opacity", 0.8);

    legendItems.append("text")
      .attr("x", 20)
      .attr("y", 12)
      .style("fill", "black")
      .style("font-size", "12px")
      .text(d => d.name);

    // Cleanup function
    return () => {
      d3.selectAll(".d3-tooltip").remove();
    };

  }, [data, circuitName, width, height, margin]);

  return (
    <div ref={chartRef} style={{ 
      display: 'flex', 
      justifyContent: 'center',
      background: 'rgba(0, 0, 0, 0.2)',
      borderRadius: '12px',
      padding: '20px'
    }}></div>
  );
};

export default LapTimeChart;