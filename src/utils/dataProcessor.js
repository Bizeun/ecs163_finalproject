const ACTIVE_2025_CIRCUITS = [
  'Albert Park Grand Prix Circuit',      // Australia
  'Bahrain International Circuit',       // Bahrain  
  'Shanghai International Circuit',      // China
  'Suzuka Circuit',                      // Japan
  'Miami International Autodrome',       // Miami
  'Autodromo Enzo e Dino Ferrari',      // Imola
  'Circuit de Monaco',                   // Monaco
  'Circuit de Barcelona-Catalunya',      // Spain
  'Circuit Gilles Villeneuve',          // Canada
  'Red Bull Ring',                       // Austria
  'Silverstone Circuit',                 // Great Britain
  'Circuit de Spa-Francorchamps',       // Belgium
  'Hungaroring',                         // Hungary
  'Circuit Park Zandvoort',             // Netherlands
  'Autodromo Nazionale di Monza',       // Italy
  'Baku City Circuit',                   // Azerbaijan
  'Marina Bay Street Circuit',          // Singapore
  'Circuit of the Americas',            // USA
  'Autódromo Hermanos Rodríguez',       // Mexico
  'Autódromo José Carlos Pace',         // Brazil (Interlagos)
  'Las Vegas Strip Street Circuit',     // Las Vegas
  'Losail International Circuit',       // Qatar
  'Yas Marina Circuit'                  // Abu Dhabi
];

export const ENGINE_ERAS = {
  early: { start: 1950, end: 1994, name: "Early Era", color: "#9b59b6" },
  v10: { start: 1995, end: 2005, name: "V10 Era", color: "#e74c3c" },
  v8: { start: 2006, end: 2013, name: "V8 Era", color: "#3498db" },
  hybrid: { start: 2014, end: 2024, name: "V6 Hybrid Era", color: "#2ecc71" }
};

export const getEngineEra = (year) => {
  if (year >= 2014) return 'hybrid';
  if (year >= 2006) return 'v8';
  if (year >= 1995) return 'v10';
  return 'early';
};

export const getCircuitRaces = (races, circuitId) => {
  return races.filter(race => race.circuitId === circuitId || race.circuitId === String(circuitId)||race.circuitId === Number(circuitId));
};

export const findQualifyingCircuits = (circuits, races) => {
  console.log('Starting circuit matching...');
  const qualifyingCircuits = [];

  const circuitRaceCounts = {};
  races.forEach(race => {
    if (race.circuitId) {
      circuitRaceCounts[race.circuitId] = (circuitRaceCounts[race.circuitId] || 0) + 1;
    }
  });
  
  console.log('Circuit race counts:', circuitRaceCounts);
  console.log('Available circuitIds in races:', Object.keys(circuitRaceCounts));
  

  circuits.forEach(circuit => {
    
    const raceCount = circuitRaceCounts[circuit.circuitId] || circuitRaceCounts[String(circuit.circuitId)] || circuitRaceCounts[Number(circuit.circuitId)] || 0;
    const isActive2025 = ACTIVE_2025_CIRCUITS.includes(circuit.name);
    
    console.log(`${circuit.name}: ${raceCount} races, Active 2025: ${isActive2025}`);
    
    if (raceCount > 15 && isActive2025) {
      console.log(`Found qualifying circuit: ${circuit.name} (${raceCount} races)`);
      
      const circuitRaces = getCircuitRaces(races, circuit.circuitId);
      
      qualifyingCircuits.push({
        ...circuit,
        displayName: circuit.name || circuit.circuitRef,
        raceCount: raceCount,
        races: circuitRaces
      });
    }
  });
  
  console.log('Total qualifying circuits (10+ races + Active 2025):', qualifyingCircuits.length);
  return qualifyingCircuits.sort((a, b) => b.raceCount - a.raceCount); 
};

export const getCircuitLapTimeEvolution = (circuitId, races, lapTimes) => {
  console.log(`Processing lap times for circuit ${circuitId}...`);
  
  const circuitRaces = races.filter(race => 
    race.circuitId === circuitId || 
    race.circuitId === String(circuitId) || 
    race.circuitId === Number(circuitId)
  );

  if (circuitRaces.length === 0) {
    console.log(`No races found for circuit ${circuitId}`);
    return [];
  }
  const raceYearMap = {};
  circuitRaces.forEach(race => {
    raceYearMap[race.raceId] = race.year;
  });

  const circuitRaceIds = new Set(circuitRaces.map(race => race.raceId));
  const circuitLapTimes = lapTimes.filter(lap => 
    circuitRaceIds.has(lap.raceId) && 
    lap.milliseconds && 
    lap.milliseconds > 0
  );

  console.log(`Found ${circuitLapTimes.length} lap times for circuit ${circuitId}`);

  const lapTimesByYear = {};
  circuitLapTimes.forEach(lap => {
    const year = raceYearMap[lap.raceId];
    if (year) {
      if (!lapTimesByYear[year]) {
        lapTimesByYear[year] = [];
      }
      lapTimesByYear[year].push(lap);
    }
  });

  const fastestByYear = [];
  Object.entries(lapTimesByYear).forEach(([year, laps]) => {
    if (laps.length > 0) {
      const fastestLap = laps.reduce((fastest, current) => 
        current.milliseconds < fastest.milliseconds ? current : fastest
      );
      
      const yearNum = parseInt(year);
      fastestByYear.push({
        year: yearNum,
        milliseconds: fastestLap.milliseconds,
        seconds: fastestLap.milliseconds / 1000,
        timeString: fastestLap.time,
        era: getEngineEra(yearNum),
        raceId: fastestLap.raceId,
        driverId: fastestLap.driverId,
        lap: fastestLap.lap
      });
    }
  });

  const sortedData = fastestByYear.sort((a, b) => a.year - b.year);
  console.log(`Processed ${sortedData.length} years of data for circuit ${circuitId}`);
  
  return sortedData;
};

export const formatLapTime = (milliseconds) => {
  const totalSeconds = milliseconds / 1000;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  
  if (minutes > 0) {
    return `${minutes}:${seconds.toFixed(3).padStart(6, '0')}`;
  } else {
    return `${seconds.toFixed(3)}s`;
  }
};