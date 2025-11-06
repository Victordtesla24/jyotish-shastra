/**
 * Chart Rendering Service
 * Integrates renderChart.js with ChartGenerationService data for consistent chart rendering
 * Uses vedic_chart_xy_spec.json for accurate positioning and template fidelity
 * Optimized data extraction system for reliable chart generation
 */

import fs from 'fs';
import path from 'path';

/**
 * Get project root directory path compatible with both Jest and Node.js
 * Uses process.cwd() which works in both environments
 */
function getProjectRoot() {
  return process.cwd();
}

// Planet code mappings for chart display
const PLANET_CODES = {
  'Sun': 'Su',
  'Moon': 'Mo', 
  'Mars': 'Ma',
  'Mercury': 'Me',
  'Jupiter': 'Ju',
  'Venus': 'Ve',
  'Saturn': 'Sa',
  'Rahu': 'Ra',
  'Ketu': 'Ke',
  'Ascendant': 'As',
  // Outer planets (modern addition to Vedic system)
  'Uranus': 'Ur',
  'Neptune': 'Ne',
  'Pluto': 'Pl',
  // API returns lowercase names
  'sun': 'Su',
  'moon': 'Mo', 
  'mars': 'Ma',
  'mercury': 'Me',
  'jupiter': 'Ju',
  'venus': 'Ve',
  'saturn': 'Sa',
  'rahu': 'Ra',
  'ketu': 'Ke',
  'ascendant': 'As',
  'uranus': 'Ur',
  'neptune': 'Ne',
  'pluto': 'Pl'
};

// Load vedic_chart_xy_spec.json for positioning reference
let chartSpec = null;
try {
  const projectRoot = process.cwd();
  // Try user-docs/ first (canonical location), then project root as fallback
  const userDocsPath = path.join(projectRoot, 'user-docs', 'vedic_chart_xy_spec.json');
  const rootPath = path.join(projectRoot, 'vedic_chart_xy_spec.json');
  
  let specPath = null;
  if (fs.existsSync(userDocsPath)) {
    specPath = userDocsPath;
  } else if (fs.existsSync(rootPath)) {
    specPath = rootPath;
  } else {
    throw new Error('vedic_chart_xy_spec.json not found in user-docs/ or project root');
  }
  
  chartSpec = JSON.parse(fs.readFileSync(specPath, 'utf8'));
} catch (error) {
  console.warn('Failed to load vedic_chart_xy_spec.json, using built-in defaults:', error.message);
  chartSpec = getDefaultChartSpec();
}

// Scale point utility function (same as renderChart.js)
function scalePoint([x, y], k) {
  return [x * k, y * k];
}

function lineToSVG([[x1, y1], [x2, y2]], k) {
  const [X1, Y1] = scalePoint([x1, y1], k);
  const [X2, Y2] = scalePoint([x2, y2], k);
  // Fixed stroke width of 2 for better visibility matching template (not scaled)
  return `<line x1="${X1}" y1="${Y1}" x2="${X2}" y2="${Y2}" stroke="black" stroke-width="2" />`;
}

function getDefaultChartSpec() {
  return {
    canvas: { width: 1000, height: 1000 },
    lines: {
      outer_square: [
        [[0, 0], [1000, 0]], [[1000, 0], [1000, 1000]],
        [[1000, 1000], [0, 1000]], [[0, 1000], [0, 0]]
      ],
      diamond: [
        [[500, 0], [1000, 500]], [[1000, 500], [500, 1000]],
        [[500, 1000], [0, 500]], [[0, 500], [500, 0]]
      ],
      square_diagonals: [
        [[0, 0], [1000, 1000]], [[1000, 0], [0, 1000]]
      ]
    },
    slot_order_clockwise: [
      "asc_rasi_h1", "asc_planet_h1", "h12_rasi", "h12_planet", "h11_rasi", "h11_planet", "h10_rasi", "h10_planet", "h9_rasi", "h9_planet", "h8_rasi", "h8_planet", "h7_rasi", "h7_planet", "h6_rasi", "h6_planet", "h5_rasi", "h5_planet", "h4_rasi", "h4_planet", "h3_rasi", "h3_planet", "h2_rasi", "h2_planet"
    ],
    slots: [
      { slot_index: 0, slot_name: "asc_rasi_h1", x: 500.0, y: 380.0 },
      { slot_index: 1, slot_name: "asc_planet_h1", x: 500.0, y: 203.0 },
      { slot_index: 2, slot_name: "h12_rasi", x: 780.0, y: 203.0 },
      { slot_index: 3, slot_name: "h12_planet", x: 780.00, y: 90.00 },
      { slot_index: 4, slot_name: "h11_rasi", x: 800.00, y: 250.00 },
      { slot_index: 5, slot_name: "h11_planet", x: 950.0, y: 220.0 },
      { slot_index: 6, slot_name: "h10_rasi", x: 580.00, y: 500.00 },
      { slot_index: 7, slot_name: "h10_planet", x: 800.0, y: 500.0 },
      { slot_index: 8, slot_name: "h9_rasi", x: 800.0, y: 780.0 },
      { slot_index: 9, slot_name: "h9_planet", x: 950.0, y: 780.0 },
      { slot_index: 10, slot_name: "h8_rasi", x: 780.0, y: 800.0 },
      { slot_index: 11, slot_name: "h8_planet", x: 780.00, y: 950.00 },
      { slot_index: 12, slot_name: "h7_rasi", x: 500.0, y: 580.0 },
      { slot_index: 13, slot_name: "h7_planet", x: 500.0, y: 800.0 },
      { slot_index: 14, slot_name: "h6_rasi", x: 250.0, y: 800.0 },
      { slot_index: 15, slot_name: "h6_planet", x: 250.0, y: 950.0 },
      { slot_index: 16, slot_name: "h5_rasi", x: 180.0, y: 780.0 },
      { slot_index: 17, slot_name: "h5_planet", x: 100.0, y: 780.0 },
      { slot_index: 18, slot_name: "h4_rasi", x: 400.0, y: 500.0 },
      { slot_index: 19, slot_name: "h4_planet", x: 200.0, y: 500.0 },
      { slot_index: 20, slot_name: "h3_rasi", x: 200.0, y: 250.0 },
      { slot_index: 21, slot_name: "h3_planet", x: 100.0, y: 230.0 },
      { slot_index: 22, slot_name: "h2_rasi", x: 250.0, y: 200.0 },
      { slot_index: 23, slot_name: "h2_planet", x: 250.0, y: 80.0 }
    ]
  };
}

class ChartRenderingService {
  constructor() {
    this.spec = chartSpec;
    const projectRoot = getProjectRoot();
    this.tempStorageDir = path.join(projectRoot, 'temp-data');
    this.ensureTempStorageDir();
  }

  /**
   * Ensure temp storage directory exists
   */
  ensureTempStorageDir() {
    try {
      if (!fs.existsSync(this.tempStorageDir)) {
        fs.mkdirSync(this.tempStorageDir, { recursive: true });
      }
    } catch (error) {
      console.warn('Failed to create temp storage directory:', error.message);
      // Fallback to project root if temp directory creation fails
      const projectRoot = getProjectRoot();
      this.tempStorageDir = projectRoot;
    }
  }

  /**
   * Optimized data extraction: Extract all data sets including nested structures
   * @param {Object} chartData - Complete API response data
   * @returns {Object} Extracted and joined data sets
   */
  extractAllDataSets(chartData) {
    if (!chartData) {
      return {
        timestamp: new Date().toISOString(),
        extractionVersion: '1.0.0',
        datasets: {},
        error: 'Chart data is required for extraction'
      };
    }

    // Handle both direct chart data and nested response structure
    const apiData = chartData.data || chartData;
    const extractedDataSets = {
      timestamp: new Date().toISOString(),
      extractionVersion: '1.0.0',
      datasets: {}
    };

    // 1. Root Level Data
    extractedDataSets.datasets.rootLevelData = {
      success: chartData.success !== undefined ? chartData.success : true,
      generatedAt: chartData.generatedAt || chartData.data?.generatedAt || new Date().toISOString(),
      chartId: apiData.chartId || null
    };

    // 2. Birth Data - check both direct location and metadata location
    const birthData = apiData.birthData || apiData.metadata?.birthData;
    if (birthData) {
      extractedDataSets.datasets.birthData = {
        name: birthData.name || null,
        dateOfBirth: birthData.dateOfBirth || null,
        timeOfBirth: birthData.timeOfBirth || null,
        latitude: birthData.latitude || null,
        longitude: birthData.longitude || null,
        timezone: birthData.timezone || null,
        gender: birthData.gender || null,
        geocodingInfo: birthData.geocodingInfo || null
      };
    }

    // 3. Rasi Chart Data
    const rasiChart = apiData.rasiChart || chartData.rasiChart;
    if (rasiChart) {
      extractedDataSets.datasets.rasiChartData = {
        id: rasiChart.id || null,
        jd: rasiChart.jd || null,
        hasAscendant: !!rasiChart.ascendant,
        hasPlanets: !!(rasiChart.planets || rasiChart.planetaryPositions),
        hasHousePositions: !!rasiChart.housePositions,
        hasNakshatra: !!rasiChart.nakshatra,
        hasAspects: !!rasiChart.aspects,
        planetCount: rasiChart.planets ? rasiChart.planets.length : 
                    (rasiChart.planetaryPositions ? Object.keys(rasiChart.planetaryPositions).length : 0),
        housePositionsCount: rasiChart.housePositions ? rasiChart.housePositions.length : 0
      };
    }

    // 4. Ascendant Data
    if (rasiChart?.ascendant) {
      extractedDataSets.datasets.ascendantData = {
        longitude: rasiChart.ascendant.longitude || null,
        signIndex: rasiChart.ascendant.signIndex || null,
        signName: rasiChart.ascendant.signName || null,
        signId: rasiChart.ascendant.signId || null,
        longitudeTropical: rasiChart.ascendant.longitudeTropical || null,
        ayanamsa: rasiChart.ascendant.ayanamsa || null,
        degree: rasiChart.ascendant.degree || null,
        degreeInSign: rasiChart.ascendant.degreeInSign || null,
        sign: rasiChart.ascendant.sign || null
      };
    }

    // 5. Planets Array Data
    if (rasiChart?.planets && Array.isArray(rasiChart.planets)) {
      extractedDataSets.datasets.planetsArrayData = rasiChart.planets.map(planet => ({
        name: planet.name || null,
        longitude: planet.longitude || null,
        degree: planet.degree || null,
        sign: planet.sign || null,
        signId: planet.signId || null,
        latitude: planet.latitude || null,
        distance: planet.distance || null,
        speed: planet.speed || null,
        isRetrograde: planet.isRetrograde || false,
        isCombust: planet.isCombust || false,
        dignity: planet.dignity || null,
        house: planet.house || null
      }));
    }

    // 6. Planetary Positions Object Data
    if (rasiChart?.planetaryPositions) {
      const planetaryPositions = rasiChart.planetaryPositions;
      extractedDataSets.datasets.planetaryPositionsObjectData = {};
      
      for (const [planetName, planetData] of Object.entries(planetaryPositions)) {
        if (planetData) {
          extractedDataSets.datasets.planetaryPositionsObjectData[planetName] = {
            longitude: planetData.longitude || null,
            degree: planetData.degree || null,
            sign: planetData.sign || null,
            signId: planetData.signId || null,
            latitude: planetData.latitude || null,
            distance: planetData.distance || null,
            speed: planetData.speed || null,
            isRetrograde: planetData.isRetrograde || false,
            isCombust: planetData.isCombust || false,
            dignity: planetData.dignity || null,
            house: planetData.house || null
          };
        }
      }
    }

    // 7. House Positions Array Data - handle both array and object formats
    if (rasiChart?.housePositions) {
      if (Array.isArray(rasiChart.housePositions)) {
        // Array format
        extractedDataSets.datasets.housePositionsArrayData = rasiChart.housePositions.map(house => ({
          houseNumber: house.houseNumber || null,
          degree: house.degree || null,
          sign: house.sign || null,
          signId: house.signId || null,
          longitude: house.longitude || null
        }));
      } else if (typeof rasiChart.housePositions === 'object') {
        // Object format - convert to array
        extractedDataSets.datasets.housePositionsArrayData = [];
        for (let i = 1; i <= 12; i++) {
          const houseData = rasiChart.housePositions[i.toString()];
          if (houseData) {
            extractedDataSets.datasets.housePositionsArrayData.push({
              houseNumber: houseData.house || i,
              degree: houseData.degree || null,
              sign: houseData.sign || null,
              signId: houseData.signId || null,
              signName: houseData.signName || null,
              longitude: houseData.cuspLongitude || houseData.longitude || null
            });
          }
        }
      }
    }

    // 8. Nakshatra Data
    if (rasiChart?.nakshatra) {
      extractedDataSets.datasets.nakshatraData = {
        name: rasiChart.nakshatra.name || null,
        number: rasiChart.nakshatra.number || null,
        pada: rasiChart.nakshatra.pada || null,
        degree: rasiChart.nakshatra.degree || null
      };
    }

    // 9. Aspects Data
    if (rasiChart?.aspects) {
      extractedDataSets.datasets.aspectsData = {
        conjunctions: rasiChart.aspects.conjunctions || [],
        oppositions: rasiChart.aspects.oppositions || [],
        trines: rasiChart.aspects.trines || [],
        squares: rasiChart.aspects.squares || [],
        specialAspects: rasiChart.aspects.specialAspects || []
      };
    }

    // 10. Navamsa Chart Data
    if (apiData.navamsaChart) {
      extractedDataSets.datasets.navamsaChartData = {
        hasAscendant: !!apiData.navamsaChart.ascendant,
        hasPlanetaryPositions: !!apiData.navamsaChart.planetaryPositions,
        hasPlanets: !!(apiData.navamsaChart.planets && Array.isArray(apiData.navamsaChart.planets)),
        hasHousePositions: !!apiData.navamsaChart.housePositions,
        planetCount: apiData.navamsaChart.planets ? apiData.navamsaChart.planets.length : 0,
        planets: apiData.navamsaChart.planets ? apiData.navamsaChart.planets.map(p => ({
          name: p.name,
          planet: p.planet,
          longitude: p.longitude,
          degree: p.degree,
          sign: p.sign,
          signId: p.signId,
          house: p.house,
          dignity: p.dignity
        })) : []
      };
    }

    // 11. Navamsa Planets Array Data (with house numbers)
    if (apiData.navamsaChart?.planets && Array.isArray(apiData.navamsaChart.planets)) {
      extractedDataSets.datasets.navamsaPlanetsArrayData = apiData.navamsaChart.planets.map(planet => ({
        name: planet.name || null,
        planet: planet.planet || null,
        longitude: planet.longitude || null,
        degree: planet.degree || null,
        sign: planet.sign || null,
        signId: planet.signId || null,
        house: planet.house || null,
        dignity: planet.dignity || null
      }));
    }

    // 12. Analysis Data
    if (apiData.analysis) {
      extractedDataSets.datasets.analysisData = {
        hasPersonality: !!apiData.analysis.personality,
        hasHealth: !!apiData.analysis.health,
        hasCareer: !!apiData.analysis.career,
        hasRelationships: !!apiData.analysis.relationships,
        hasFinances: !!apiData.analysis.finances,
        hasSpirituality: !!apiData.analysis.spirituality,
        hasTiming: !!apiData.analysis.timing
      };
    }

    // 13. Dasha Info Data
    if (apiData.dashaInfo) {
      extractedDataSets.datasets.dashaInfoData = {
        birthDasha: apiData.dashaInfo.birthDasha || null,
        currentDasha: apiData.dashaInfo.currentDasha || null,
        dashaPeriods: apiData.dashaInfo.dashaPeriods || null,
        nakshatraLord: apiData.dashaInfo.nakshatraLord || null,
        dashaSequence: apiData.dashaInfo.dashaSequence || [],
        summary: apiData.dashaInfo.summary || null
      };
    }

    // 14. Birth Data Analysis Data
    const birthDataAnalysis = chartData.birthDataAnalysis || apiData.birthDataAnalysis;
    if (birthDataAnalysis) {
      extractedDataSets.datasets.birthDataAnalysisData = {
        section: birthDataAnalysis.section || null,
        timestamp: birthDataAnalysis.timestamp || null,
        hasAnalyses: !!birthDataAnalysis.analyses,
        hasSummary: !!birthDataAnalysis.summary
      };

      // 15. Chart Generation Data (nested in birthDataAnalysis)
      if (birthDataAnalysis.analyses?.chartGeneration) {
        extractedDataSets.datasets.chartGenerationData = {
          question: birthDataAnalysis.analyses.chartGeneration.question || null,
          answer: birthDataAnalysis.analyses.chartGeneration.answer || null,
          hasDetails: !!birthDataAnalysis.analyses.chartGeneration.details,
          hasRasiChart: !!birthDataAnalysis.analyses.chartGeneration.details?.rasiChart,
          hasNavamsaChart: !!birthDataAnalysis.analyses.chartGeneration.details?.navamsaChart
        };
      }

      // 16. Planetary Positions WITH HOUSE NUMBERS - check multiple locations
      let planetaryPositionsWithHouses = null;
      
      // First check nested in birthDataAnalysis (comprehensive analysis response)
      if (birthDataAnalysis.analyses?.planetaryPositions?.planetaryPositions) {
        planetaryPositionsWithHouses = birthDataAnalysis.analyses.planetaryPositions.planetaryPositions;
      }
      
      if (planetaryPositionsWithHouses) {
        extractedDataSets.datasets.planetaryPositionsWithHouseNumbers = {};
        
        for (const [planetName, planetData] of Object.entries(planetaryPositionsWithHouses)) {
          if (planetData) {
            extractedDataSets.datasets.planetaryPositionsWithHouseNumbers[planetName] = {
              sign: planetData.sign || null,
              degree: planetData.degree || null,
              longitude: planetData.longitude || null,
              house: planetData.house || null,
              dignity: planetData.dignity || null,
              isRetrograde: planetData.isRetrograde || false,
              isCombust: planetData.isCombust || false
            };
          }
        }
      }

      // 17. Mahadasha Data (nested in birthDataAnalysis)
      if (birthDataAnalysis.analyses?.mahadasha) {
        extractedDataSets.datasets.mahadashaData = {
          question: birthDataAnalysis.analyses.mahadasha.question || null,
          answer: birthDataAnalysis.analyses.mahadasha.answer || null,
          hasDetails: !!birthDataAnalysis.analyses.mahadasha.details,
          nakshatra: birthDataAnalysis.analyses.mahadasha.details?.nakshatra || null,
          nakshatraLord: birthDataAnalysis.analyses.mahadasha.details?.nakshatraLord || null,
          startingDasha: birthDataAnalysis.analyses.mahadasha.details?.startingDasha || null,
          currentDasha: birthDataAnalysis.analyses.mahadasha.details?.currentDasha || null,
          dashaSequence: birthDataAnalysis.analyses.mahadasha.details?.dashaSequence || []
        };
      }

      // 18. Summary Data (nested in birthDataAnalysis)
      if (birthDataAnalysis.summary) {
        extractedDataSets.datasets.summaryData = {
          status: birthDataAnalysis.summary.status || null,
          completeness: birthDataAnalysis.summary.completeness || null,
          chartsGenerated: birthDataAnalysis.summary.chartsGenerated || null,
          ascendantCalculated: birthDataAnalysis.summary.ascendantCalculated || null,
          planetsCalculated: birthDataAnalysis.summary.planetsCalculated || null,
          dashaCalculated: birthDataAnalysis.summary.dashaCalculated || null,
          readyForAnalysis: birthDataAnalysis.summary.readyForAnalysis || null
        };
      }
    }

    // CRITICAL FIX: Create planetaryPositionsWithHouseNumbers from rasiChart if not already created
    if (!extractedDataSets.datasets.planetaryPositionsWithHouseNumbers && rasiChart?.planetaryPositions) {
      extractedDataSets.datasets.planetaryPositionsWithHouseNumbers = {};
      
      for (const [planetName, planetData] of Object.entries(rasiChart.planetaryPositions)) {
        if (planetData) {
          extractedDataSets.datasets.planetaryPositionsWithHouseNumbers[planetName] = {
            sign: planetData.sign || null,
            degree: planetData.degree || null,
            longitude: planetData.longitude || null,
            house: planetData.house || null,
            dignity: planetData.dignity || null,
            isRetrograde: planetData.isRetrograde || false,
            isCombust: planetData.isCombust || false
          };
        }
      }
    }

    return extractedDataSets;
  }

  /**
   * Join all extracted data sets according to joining strategy
   * @param {Object} extractedDataSets - All extracted data sets
   * @returns {Object} Joined data ready for rendering
   */
  joinDataSets(extractedDataSets) {
    const joinedData = {
      timestamp: new Date().toISOString(),
      joiningVersion: '1.0.0',
      joins: {}
    };

    const datasets = extractedDataSets.datasets;

    // Join 1: House Positions → Rasi Numbers
    // Extract rasi numbers by house with flexible validation
    if (datasets.housePositionsArrayData && datasets.housePositionsArrayData.length === 12) {
      // Use getRasiByHouse with flexible validation for better reliability
      joinedData.joins.rasiByHouse = this.getRasiByHouse(datasets.housePositionsArrayData);
    }

    // Join 2: Planetary Positions + Birth Data Analysis → House Numbers
    if (datasets.planetaryPositionsObjectData && datasets.planetaryPositionsWithHouseNumbers) {
      const enhancedPlanetaryPositions = {};
      const planetaryPositions = datasets.planetaryPositionsObjectData;
      const planetaryPositionsWithHouses = datasets.planetaryPositionsWithHouseNumbers;

      for (const [planetName, baseData] of Object.entries(planetaryPositions)) {
        const houseData = planetaryPositionsWithHouses[planetName];
        if (houseData) {
          enhancedPlanetaryPositions[planetName] = {
            ...baseData,
            house: houseData.house || baseData.house || null
          };
        } else {
          enhancedPlanetaryPositions[planetName] = baseData;
        }
      }
      joinedData.joins.enhancedPlanetaryPositions = enhancedPlanetaryPositions;
    }

    // Join 3: Enhanced Planetary Positions → Planets by House
    if (joinedData.joins.enhancedPlanetaryPositions) {
      const planetsByHouse = {};
      for (let h = 1; h <= 12; h++) {
        planetsByHouse[h] = [];
      }

      for (const [planetName, planetData] of Object.entries(joinedData.joins.enhancedPlanetaryPositions)) {
        if (planetData && typeof planetData.house === 'number' && planetData.house >= 1 && planetData.house <= 12) {
          const house = planetData.house;
          const degree = planetData.degree !== undefined ? 
            Math.floor(planetData.degree) : 
            (planetData.longitude ? Math.floor(planetData.longitude % 30) : 0);
          const dignitySymbol = planetData.dignity === 'debilitated' ? '↓' : 
                               planetData.dignity === 'exalted' ? '↑' : '';
          const planetCode = PLANET_CODES[planetName] || planetName;
          const formattedPlanet = `${planetCode} ${degree}${dignitySymbol}`;
          
          planetsByHouse[house].push(formattedPlanet);
        }
      }
      joinedData.joins.planetsByHouse = planetsByHouse;
    }

    return joinedData;
  }

  /**
   * Save extracted and joined data sets to temporary storage
   * @param {Object} extractedDataSets - All extracted data sets
   * @param {Object} joinedData - Joined data sets
   * @returns {string} Path to saved file
   */
  saveDataSetsToTempStorage(extractedDataSets, joinedData) {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `chart-data-extraction-${timestamp}.json`;
      const filepath = path.join(this.tempStorageDir, filename);

      const dataToSave = {
        extracted: extractedDataSets,
        joined: joinedData,
        metadata: {
          savedAt: new Date().toISOString(),
          totalDatasets: Object.keys(extractedDataSets.datasets || {}).length,
          datasetsExtracted: Object.keys(extractedDataSets.datasets || {})
        }
      };

      fs.writeFileSync(filepath, JSON.stringify(dataToSave, null, 2), 'utf8');
      
      return filepath;
    } catch (error) {
      console.warn('Failed to save data sets to temp storage:', error.message);
      return null;
    }
  }

  /**
   * Transform ChartGenerationService data to renderChart.js format
   * @param {Object} chartData - Chart data from ChartGenerationService
   * @param {string} chartType - Type of chart: 'rasi' or 'navamsa' (default: 'rasi')
   * @returns {Object} Data in renderChart.js expected format
   */
  transformToRenderFormat(chartData, chartType = 'rasi') {
    if (!chartData) {
      throw new Error('Chart data is required for rendering');
    }

    // PRODUCTION-GRADE DATA EXTRACTION: Extract all data sets including nested structures
    const extractedDataSets = this.extractAllDataSets(chartData);
    
    // JOIN ALL DATA SETS: Join extracted data sets according to joining strategy
    const joinedData = this.joinDataSets(extractedDataSets);
    
    // SAVE TO TEMP STORAGE: Save all extracted and joined data sets for future use
    const savedPath = this.saveDataSetsToTempStorage(extractedDataSets, joinedData);
    if (savedPath) {
      console.log(`✅ Chart data extraction saved to: ${savedPath}`);
    }

    // CRITICAL FIX: Select correct chart based on chartType
    let targetChart;
    
    if (chartType === 'navamsa') {
      // Extract Navamsa chart data
      targetChart = chartData.navamsaChart || chartData.data?.navamsaChart;
      
      if (!targetChart) {
        throw new Error('Navamsa chart data not found in response. Ensure navamsaChart is generated.');
      }
      
      console.log(`✅ Using Navamsa chart for rendering`);
    } else {
      // Handle both direct chart data and nested response structure
      // API response can be: { data: { rasiChart: {...} } } or { rasiChart: {...} } or rasiChart directly
      targetChart = chartData.rasiChart || chartData.data?.rasiChart || chartData;

      // If rasiChart is still the full response, try to extract from data property
      if (!targetChart.planetaryPositions && !targetChart.housePositions) {
        // Check if we need to navigate deeper into the structure
        if (chartData.data?.rasiChart) {
          targetChart = chartData.data.rasiChart;
        } else if (chartData.rasiChart) {
          targetChart = chartData.rasiChart;
        } else {
          targetChart = chartData;
        }
      }
      
      console.log(`✅ Using Rasi chart for rendering`);
    }

    // Validate target chart structure
    if (!targetChart.planetaryPositions || !targetChart.housePositions) {
      throw new Error(`Invalid ${chartType} chart data: missing planetaryPositions or housePositions`);
    }

    // CRITICAL FIX: Extract planetary positions differently for Rasi vs Navamsa
    let planetaryPositions;
    
    if (chartType === 'navamsa') {
      // For Navamsa: Use planets array which has correct house numbers calculated from Navamsa ascendant
      // Convert planets array to planetaryPositions object format
      planetaryPositions = {};
      const navamsaPlanets = targetChart.planets || [];
      
      console.log(`🔍 NAVAMSA RENDER FIX: Using planets array with ${navamsaPlanets.length} planets`);
      
      for (const planet of navamsaPlanets) {
        if (planet && planet.name) {
          planetaryPositions[planet.name] = {
            sign: planet.sign,
            signId: planet.signId,
            degree: planet.degree,
            longitude: planet.longitude,
            house: planet.house, // CORRECT Navamsa house number!
            dignity: planet.dignity || 'neutral',
            isRetrograde: planet.isRetrograde || false
          };
          console.log(`  ✅ Navamsa ${planet.name}: ${planet.sign} House ${planet.house}`);
        }
      }
    } else {
      // For Rasi: Use planetaryPositions object (original logic)
      planetaryPositions = targetChart.planetaryPositions;
      
      // Fallback 1: Extract from birthDataAnalysis if house numbers are missing
      const birthDataAnalysis = chartData.birthDataAnalysis || chartData.data?.birthDataAnalysis;
      if (birthDataAnalysis?.analyses?.planetaryPositions?.planetaryPositions) {
        const planetaryPositionsWithHouses = birthDataAnalysis.analyses.planetaryPositions.planetaryPositions;
        
        // Check if any planet in planetaryPositions has house property
        const hasHouseNumbers = Object.values(planetaryPositions).some(p => p && typeof p.house === 'number');
        
        // If house numbers are missing, merge from birthDataAnalysis
        if (!hasHouseNumbers) {
          for (const [planetName, planetDataWithHouse] of Object.entries(planetaryPositionsWithHouses)) {
            if (planetaryPositions[planetName]) {
              planetaryPositions[planetName] = {
                ...planetaryPositions[planetName],
                house: planetDataWithHouse.house
              };
            }
          }
        }
      }
    }

    // Use joined data if available, otherwise fallback to original extraction
    // CRITICAL FIX: For Navamsa, ALWAYS use fresh grouping since we extracted from planets array
    const rasiByHouse = joinedData.joins.rasiByHouse || this.getRasiByHouse(targetChart.housePositions);
    const planetsByHouse = (chartType === 'navamsa') 
      ? this.groupPlanetsByHouse(planetaryPositions)  // ALWAYS fresh for Navamsa
      : (joinedData.joins.planetsByHouse || this.groupPlanetsByHouse(planetaryPositions));
    
    // Calculate ascendant slot index (default to 0 for template standard)
    const ascSlotIndex = this.calculateAscendantSlot(targetChart.ascendant);

    // DEBUG: Log transformed data to verify correct chart is being used
    console.log(`🔍 RENDER DEBUG (${chartType}): Ascendant = ${targetChart.ascendant.sign}, planetsByHouse sample:`, 
      Object.entries(planetsByHouse).filter(([_h, p]) => p.length > 0).slice(0, 3).map(([h, p]) => `H${h}:[${p.join(',')}]`));

    return {
      ascSlotIndex,
      rasiByHouse,
      planetsByHouse,
      extractedDataSets,
      joinedData,
      savedPath
    };
  }

  /**
   * Group planets by house and convert to short codes with degree and dignity
   * @param {Object} planetaryPositions - Planetary positions from API
   * @returns {Object} Planets grouped by house with formatted codes (e.g., "Ra 15↓")
   */
  groupPlanetsByHouse(planetaryPositions) {
    const planetsByHouse = {};
    
    // Initialize all houses
    for (let house = 1; house <= 12; house++) {
      planetsByHouse[house] = [];
    }

    // Group planets by their house
    for (const [planetName, planetData] of Object.entries(planetaryPositions)) {
      if (!planetData || typeof planetData.house !== 'number') {
        console.warn(`Invalid planet data for ${planetName}, skipping`);
        continue;
      }

      const house = planetData.house;
      if (house < 1 || house > 12) {
        console.warn(`Invalid house number ${house} for planet ${planetName}, skipping`);
        continue;
      }

      // Convert planet name to short code
      const planetCode = PLANET_CODES[planetName];
      if (!planetCode) {
        console.warn(`Unknown planet: ${planetName}, skipping`);
        continue;
      }

      // Extract degree (integer part only, matching template format)
      const degree = planetData.degree !== undefined ? 
        Math.floor(planetData.degree) : 
        Math.floor(planetData.longitude % 30);

      // Map dignity to symbol
      let dignitySymbol = '';
      if (planetData.dignity === 'exalted') {
        dignitySymbol = '↑';
      } else if (planetData.dignity === 'debilitated') {
        dignitySymbol = '↓';
      }

      // Format as "PlanetCode DegreeDignity" (e.g., "Ra 15↓", "Ju 14↓", "Mo 19")
      const formattedPlanet = `${planetCode} ${degree}${dignitySymbol}`;
      planetsByHouse[house].push(formattedPlanet);
    }

    return planetsByHouse;
  }

  /**
   * Extract rasi numbers by house from house positions (flexible validation)
   * @param {Array} housePositions - House positions array from API (array index represents house number)
   * @returns {Object} Rasi numbers mapped by house
   */
  getRasiByHouse(housePositions) {
    // Initialize default house mapping if invalid data provided
    const defaultRasiByHouse = {};
    for (let i = 1; i <= 12; i++) {
      defaultRasiByHouse[i] = i.toString(); // Default mapping: House N → Rasi N
    }

    if (!Array.isArray(housePositions) || housePositions.length !== 12) {
      console.warn('⚠️ getRasiByHouse: Invalid housePositions data, using default mapping');
      return defaultRasiByHouse;
    }

    const rasiByHouse = {};
    
    for (let index = 0; index < housePositions.length; index++) {
      const housePosition = housePositions[index];
      const houseNumber = index + 1; // Convert array index to house number
      
      if (!housePosition) {
        console.warn(`⚠️ getRasiByHouse: House ${houseNumber} is null, using default rasi`);
        rasiByHouse[houseNumber] = houseNumber.toString();
        continue;
      }

      let rasiNumber;

      // Handle different data structures
      if (typeof housePosition === 'number') {
        rasiNumber = housePosition;
      } else if (typeof housePosition === 'object') {
        if (typeof housePosition.signId === 'number' && housePosition.signId >= 1 && housePosition.signId <= 12) {
          rasiNumber = housePosition.signId;
        } else if (typeof housePosition.sign === 'string') {
          // Convert sign name to number
          const signNames = {
            'Aries': 1, 'Taurus': 2, 'Gemini': 3, 'Cancer': 4,
            'Leo': 5, 'Virgo': 6, 'Libra': 7, 'Scorpio': 8,
            'Sagittarius': 9, 'Capricorn': 10, 'Aquarius': 11, 'Pisces': 12
          };
          rasiNumber = signNames[housePosition.sign];
        }
      }

      // Validate rasi number or use default
      if (!rasiNumber || rasiNumber < 1 || rasiNumber > 12) {
        console.warn(`⚠️ getRasiByHouse: Invalid rasi number for house ${houseNumber}, using default`);
        rasiNumber = houseNumber;
      }

      rasiByHouse[houseNumber] = rasiNumber.toString();
    }

    return rasiByHouse;
  }

  /**
   * Calculate ascendant slot index based on ascendant position
   * @param {Object} _ascendant - Ascendant data from API (reserved for future chart orientations)
   * @returns {number} Slot index (0-11) for ascendant position
   */
  calculateAscendantSlot(_ascendant) {
    // For template standard, we place House 1 (Lagna) at the top (slot index 0)
    // This matches the vedic_chart_xy_spec.json standard positioning
    return 0;
    
    // Future enhancement: Calculate based on specific chart requirements
    // This could be enhanced to support different chart orientations
  }

  /**
   * Render chart as SVG using renderChart.js logic
   * @param {Object} chartData - Chart data from ChartGenerationService
   * @param {Object} options - Rendering options
   * @param {string} options.chartType - Type of chart: 'rasi' or 'navamsa' (default: 'rasi')
   * @returns {string} SVG string of the rendered chart
   */
  renderChartSVG(chartData, options = {}) {
    const { width = 800, chartType = 'rasi' } = options;
    
    // Transform data to render format (includes data extraction and joining)
    // CRITICAL FIX: Pass chartType to ensure correct chart is rendered
    const placements = this.transformToRenderFormat(chartData, chartType);
    
    // Scale factor
    const k = width / 1000;
    const height = width; // square

    // Generate lines for chart frame
    const lines = [
      ...this.spec.lines.outer_square.map(seg => lineToSVG(seg, k)),
      ...this.spec.lines.diamond.map(seg => lineToSVG(seg, k)),
      ...this.spec.lines.square_diagonals.map(seg => lineToSVG(seg, k)),
    ].join('\n');

    // Map house to slot indices using 24-slot structure (2 slots per house: rasi + planet)
    // Anti-clockwise house order: 1, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2
    // House 1 → slots 0 (rasi), 1 (planet)
    // House 12 → slots 2 (rasi), 3 (planet)
    // House 11 → slots 4 (rasi), 5 (planet)
    // ... and so on
    const houseOrder = [1, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2];
    const houseToSlots = {};
    for (let i = 0; i < houseOrder.length; i++) {
      const houseNum = houseOrder[i];
      const rasiSlotIndex = i * 2;
      const planetSlotIndex = i * 2 + 1;
      houseToSlots[houseNum] = { rasi: rasiSlotIndex, planet: planetSlotIndex };
    }

    // Generate text elements (rasi at rasi slots, planets at planet slots)
    const texts = [];
    for (let h = 1; h <= 12; h++) {
      const slots = houseToSlots[h];
      if (!slots) continue;

      const rasi = placements.rasiByHouse?.[h] ?? `${h}`;
      const planets = placements.planetsByHouse?.[h] ?? [];

      // Place rasi number at dedicated rasi slot
      const rasiSlot = this.spec.slots[slots.rasi];
      if (rasiSlot) {
        const [rasiX, rasiY] = scalePoint([rasiSlot.x, rasiSlot.y], k);
        texts.push(
          `<text x="${rasiX}" y="${rasiY}" font-family="monospace" font-size="${16 * k}" text-anchor="middle" dominant-baseline="central">${rasi}</text>`
        );
      }

      // Place planets at dedicated planet slot (stacked vertically if multiple)
      const planetSlot = this.spec.slots[slots.planet];
      if (planetSlot && planets.length > 0) {
        const [planetX, planetY] = scalePoint([planetSlot.x, planetSlot.y], k);
        planets.forEach((p, i) => {
          const dy = i * 14 * k;
          texts.push(
            `<text x="${planetX}" y="${planetY + dy}" font-family="monospace" font-size="${12 * k}" text-anchor="middle" dominant-baseline="central">${p}</text>`
          );
        });
      }
    }

    // Background rectangle with light yellow color matching template (#FFF8E1)
    const background = `<rect width="${width}" height="${height}" fill="#FFF8E1" />`;

    return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  ${background}
  ${lines}
  ${texts.join('\n  ')}
</svg>`;
  }

  /**
   * Get chart specification for reference
   * @returns {Object} Chart specification
   */
  getChartSpec() {
    return this.spec;
  }

  /**
   * Validate chart data before rendering (production validation with flexible data structures)
   * @param {Object} chartData - Chart data to validate
   * @returns {Object} Validation result with any errors
   */
  validateChartData(chartData) {
    const _errors = []; // Reserved: Currently throws instead of collecting errors
    const warnings = [];

    // PRODUCTION-GRADE: Require valid chart data
    if (!chartData) {
      throw new Error('Chart data is required for rendering');
    }

    // ENHANCED: Flexibly extract rasiChart from different possible structures
    let rasiChart = null;
    
    // Try multiple extraction strategies for backward compatibility
    if (chartData.rasiChart) {
      rasiChart = chartData.rasiChart;
    } else if (chartData.data?.rasiChart) {
      rasiChart = chartData.data.rasiChart;
    } else if (chartData.data && chartData.data.planetaryPositions) {
      // chartData.data itself might be the rasiChart
      rasiChart = chartData.data;
    } else if (chartData.planetaryPositions || chartData.housePositions) {
      // chartData itself might be the rasiChart
      rasiChart = chartData;
    }

    // If still no rasiChart, we can't proceed
    if (!rasiChart) {
      throw new Error('Could not extract rasiChart data from chart structure. Expected nested rasiChart property with planetaryPositions and housePositions.');
    }

    // PRODUCTION-GRADE: Validate rasiChart structure
    if (!rasiChart || typeof rasiChart !== 'object') {
      throw new Error(`Invalid rasiChart structure: expected object, got ${typeof rasiChart}`);
    }

    // ENHANCED: Flexible planetary positions validation
    if (!rasiChart.planetaryPositions) {
      throw new Error('Planetary positions are required for chart rendering');
    }
    
    if (typeof rasiChart.planetaryPositions !== 'object') {
      throw new Error(`Invalid planetaryPositions: expected object, got ${typeof rasiChart.planetaryPositions}`);
    }

    // Validate that planetary positions contain at least one planet
    const planetCount = Object.keys(rasiChart.planetaryPositions).length;
    if (planetCount === 0) {
      throw new Error('Planetary positions object is empty - at least one planet is required for chart rendering');
    }

    // ENHANCED: Flexible house positions validation
    if (!rasiChart.housePositions) {
      throw new Error('House positions are required for chart rendering');
    }
    
    // PRODUCTION-GRADE: Handle both array and object formats for housePositions
    let housePositions = rasiChart.housePositions;
    
    if (Array.isArray(housePositions)) {
      // Array format (as per API docs)
      if (housePositions.length !== 12) {
        throw new Error(`Invalid housePositions length: expected 12, got ${housePositions.length}`);
      }
    } else if (typeof housePositions === 'object' && housePositions !== null) {
      // Object format (actual API response) - convert to array
      const houseKeys = Object.keys(housePositions);
      if (houseKeys.length !== 12) {
        throw new Error(`Invalid housePositions object: expected 12 houses, got ${houseKeys.length}`);
      }
      
      // Convert object to array format for consistency
      housePositions = [];
      for (let i = 1; i <= 12; i++) {
        const houseData = rasiChart.housePositions[i.toString()];
        if (!houseData) {
          throw new Error(`Missing house ${i} in housePositions object`);
        }
        housePositions.push({
          houseNumber: i,
          ...houseData
        });
      }
      
      // Update the chart data to use array format
      rasiChart.housePositions = housePositions;
    } else {
      throw new Error(`Invalid housePositions: expected array or object, got ${typeof rasiChart.housePositions}`);
    }

    // ENHANCED: Validate house positions structure more flexibly
    const invalidHouses = [];
    rasiChart.housePositions.forEach((house, index) => {
      const houseNumber = index + 1;
      if (!house) {
        invalidHouses.push(houseNumber);
        return;
      }
      
      // Check for valid house structure - allow multiple formats
      const houseObj = typeof house === 'object' ? house : {};
      const signId = houseObj.signId || houseObj.sign || houseObj.longitude;
      
      if (signId === undefined || signId === null) {
        invalidHouses.push(houseNumber);
      } else {
        // Validate signId if it's a number
        const signIdNum = typeof signId === 'number' ? signId : parseFloat(signId);
        if (isNaN(signIdNum) || signIdNum < 1 || signIdNum > 12) {
          warnings.push(`House ${houseNumber} has potentially invalid signId: ${signId}`);
        }
      }
    });

    if (invalidHouses.length > 0) {
      throw new Error(`Invalid house positions for houses: ${invalidHouses.join(', ')}. Each house must have signId or longitude data.`);
    }

    // ENHANCED: Flexible ascendant validation
    if (!rasiChart.ascendant) {
      warnings.push('Ascendant data is recommended for accurate chart rendering');
      // Don't throw error - ascendant is recommended but not strictly required for rendering
    } else if (typeof rasiChart.ascendant !== 'object') {
      warnings.push(`Invalid ascendant: expected object, got ${typeof rasiChart.ascendant}`);
      // Don't throw error - can still render without perfect ascendant data
    } else {
      // Validate longitude if ascendant present
      if (typeof rasiChart.ascendant.longitude !== 'number') {
        warnings.push('Ascendant longitude is not a number or missing');
      }
    }

    return { 
      valid: true, 
      errors: [],
      warnings: warnings
    };
  }
}

export default ChartRenderingService;
