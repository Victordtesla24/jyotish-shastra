/**
 * Template Matching Utilities for Vedic Chart Display
 * Provides functions for chart positioning, coordinate calculations, and data mapping
 */

/**
 * Calculate house position from longitude
 * @param {number} longitude - Planetary longitude
 * @param {number} ascendantLongitude - Ascendant longitude
 * @returns {number} House number (1-12)
 */
export function calculateHousePosition(longitude, ascendantLongitude) {
  if (longitude == null || ascendantLongitude == null) return 1;
  
  const normalizedLongitude = ((longitude % 360) + 360) % 360;
  const normalizedAscendant = ((ascendantLongitude % 360) + 360) % 360;
  
  let houseLongitude = normalizedLongitude - normalizedAscendant;
  if (houseLongitude < 0) houseLongitude += 360;
  
  return Math.floor(houseLongitude / 30) + 1;
}

/**
 * Convert longitude to house number
 * @param {number} longitude - Celestial longitude
 * @param {number} ascendant - Ascendant degree
 * @returns {number} House number (1-12)
 */
export function convertLongitudeToHouse(longitude, ascendant) {
  return calculateHousePosition(longitude, ascendant);
}

/**
 * Format degree display as degrees and minutes
 * @param {number} degree - Degree value
 * @returns {string} Formatted degree string (e.g., "15°30'")
 */
export function formatDegreeDisplay(degree) {
  if (degree == null) return "0°00'";
  
  const normalizedDegree = ((degree % 360) + 360) % 360;
  const signDegree = normalizedDegree % 30;
  const degrees = Math.floor(signDegree);
  const minutes = Math.floor((signDegree - degrees) * 60);
  
  return `${degrees}\u00B0${minutes.toString().padStart(2, '0')}'`;
}

/**
 * Calculate Rashi number from house number and ascendant
 * @param {number} houseNumber - House number (1-12)
 * @param {number} ascendantSignIndex - Ascendant sign index (0-11)
 * @returns {number} Rashi number (1-12)
 */
export function calculateRashiNumber(houseNumber, ascendantSignIndex) {
  if (houseNumber < 1 || houseNumber > 12) return 1;
  if (ascendantSignIndex < 0 || ascendantSignIndex > 11) return 1;
  
  return ((ascendantSignIndex + houseNumber - 1) % 12) + 1;
}

/**
 * Get planet coordinates for SVG positioning (Diamond Layout)
 * @param {number} houseNumber - House number (1-12)
 * @param {number} svgSize - SVG canvas size
 * @returns {Object} {x, y} coordinates
 */
export function getPlanetCoordinates(houseNumber, svgSize = 500) {
  if (houseNumber < 1 || houseNumber > 12) houseNumber = 1;
  
  const centerX = svgSize / 2;
  const centerY = svgSize / 2;
  const size = svgSize * 0.35;
  
  // Diamond layout coordinates for each house
  // Houses arranged in clockwise direction starting from top
  const coordinates = {
    1:  { x: centerX, y: centerY - size },           // Top
    2:  { x: centerX + size * 0.5, y: centerY - size * 0.5 },
    3:  { x: centerX + size, y: centerY },           // Right
    4:  { x: centerX + size * 0.5, y: centerY + size * 0.5 },
    5:  { x: centerX, y: centerY + size },           // Bottom
    6:  { x: centerX - size * 0.5, y: centerY + size * 0.5 },
    7:  { x: centerX - size, y: centerY },           // Left (opposite of 1)
    8:  { x: centerX - size * 0.5, y: centerY - size * 0.5 },
    9:  { x: centerX - size * 0.3, y: centerY - size * 0.7 },
    10: { x: centerX + size * 0.3, y: centerY - size * 0.7 },
    11: { x: centerX + size * 0.7, y: centerY - size * 0.3 },
    12: { x: centerX - size * 0.7, y: centerY - size * 0.3 }
  };
  
  return coordinates[houseNumber] || { x: centerX, y: centerY };
}

/**
 * Get house coordinates for chart rendering
 * @param {number} houseNumber - House number (1-12)
 * @param {number} svgSize - SVG canvas size
 * @returns {Object} House coordinates with dimensions
 */
export function getHouseCoordinates(houseNumber, svgSize = 500) {
  const coords = getPlanetCoordinates(houseNumber, svgSize);
  
  // Add width and height for house box rendering
  return {
    x: coords.x,
    y: coords.y,
    width: svgSize * 0.15,
    height: svgSize * 0.10
  };
}

/**
 * Calculate aspect ratio for chart display
 * @param {number} width - Chart width
 * @param {number} height - Chart height
 * @returns {Object} Aspect ratio dimensions
 */
export function calculateAspectRatio(width, height) {
  if (!width || !height) return { width: 1, height: 1 };
  
  const ratio = width / height;
  
  if (ratio > 1) {
    // Landscape
    return { width: Math.min(width, height), height: Math.min(width, height) };
  } else {
    // Portrait or square
    return { width: Math.min(width, height), height: Math.min(width, height) };
  }
}

/**
 * Validate template compliance
 * @param {Object} chartData - Chart data object
 * @returns {boolean} True if compliant
 */
export function validateTemplateCompliance(chartData) {
  if (!chartData) return false;
  
  // Check for required template elements
  const hasHouses = Array.isArray(chartData.houses) && chartData.houses.length === 12;
  const hasRashis = Array.isArray(chartData.rashis) && chartData.rashis.length === 12;
  const hasPlanets = Array.isArray(chartData.planets) && chartData.planets.length > 0;
  const hasSvgViewBox = typeof chartData.svgViewBox === 'string' && chartData.svgViewBox.length > 0;
  const hasCenterSymbol = typeof chartData.centerSymbol === 'string' && chartData.centerSymbol.length > 0;
  
  return hasHouses && hasRashis && hasPlanets && hasSvgViewBox && hasCenterSymbol;
}

/**
 * Map API data to chart format
 * @param {Object} apiData - Data from API response
 * @returns {Object} Formatted chart data
 */
export function mapApiDataToChart(apiData) {
  if (!apiData) return null;
  
  // Handle nested structure: apiData.data.rasiChart
  const rasiChart = apiData.data?.rasiChart || apiData.rasiChart;
  
  // Always return a valid structure, even for incomplete data
  const ascendant = rasiChart?.ascendant || null;
  const planets = rasiChart?.planets || [];
  
  // Add coordinates to planets for rendering
  const planetsWithCoordinates = planets.map((planet, index) => {
    const house = planet.house || (index % 12) + 1;
    const coordinates = getPlanetCoordinates(house, 400);
    
    return {
      ...planet,
      house: house,
      coordinates: coordinates
    };
  });
  
  return {
    ascendant: ascendant,
    planets: planetsWithCoordinates,
    houses: rasiChart?.houses || Array.from({length: 12}, (_, i) => ({
      house: i + 1,
      sign: null,
      planets: []
    }))
  };
}

/**
 * Generate SVG path for chart elements
 * @param {string|Array|Object} type - Layout type ('diamond') or array of coordinates
 * @param {number} svgSize - SVG canvas size
 * @returns {Array|string} Array of SVG path strings for layout type, or single path for points
 */
export function generateSVGPath(type, svgSize = 400) {
  // Handle layout type (diamond, square, etc.)
  if (typeof type === 'string') {
    if (type === 'diamond') {
      const center = svgSize / 2;
      const size = svgSize * 0.35;
      
      // Generate diamond shape paths for Vedic chart
      const paths = [
        // Outer diamond
        `M ${center} ${center - size} L ${center + size} ${center} L ${center} ${center + size} L ${center - size} ${center} Z`,
        // Inner diamond
        `M ${center} ${center - size * 0.6} L ${center + size * 0.6} ${center} L ${center} ${center + size * 0.6} L ${center - size * 0.6} ${center} Z`,
        // Horizontal line
        `M ${center - size} ${center} L ${center + size} ${center}`,
        // Vertical line
        `M ${center} ${center - size} L ${center} ${center + size}`
      ];
      
      return paths;
    }
    return [];
  }
  
  // Handle object with numeric keys (house coordinates)
  if (!Array.isArray(type) && typeof type === 'object') {
    const pointsArray = Object.values(type);
    if (pointsArray.length === 0) return '';
    
    const pathData = pointsArray.map((point, index) => {
      const command = index === 0 ? 'M' : 'L';
      return `${command} ${point.x} ${point.y}`;
    }).join(' ');
    
    return pathData + ' Z';
  }
  
  // Handle array of points
  if (!type || type.length === 0) return '';
  
  const pathData = type.map((point, index) => {
    const command = index === 0 ? 'M' : 'L';
    return `${command} ${point.x} ${point.y}`;
  }).join(' ');
  
  return pathData + ' Z'; // Close the path
}

/**
 * Validate chart data structure
 * @param {Object} chartData - Chart data to validate
 * @returns {boolean} True if valid, false otherwise
 */
export function validateChartData(chartData) {
  if (!chartData) return false;
  
  // Check nested structure: data.rasiChart
  if (chartData.data && chartData.data.rasiChart) {
    const rasiChart = chartData.data.rasiChart;
    
    if (!rasiChart.ascendant) return false;
    if (!rasiChart.planets || !Array.isArray(rasiChart.planets)) return false;
    
    // Validate planet structure
    if (rasiChart.planets.length > 0) {
      const hasInvalidPlanet = rasiChart.planets.some(planet => 
        !planet.name || typeof planet.name !== 'string'
      );
      if (hasInvalidPlanet) return false;
    }
    
    return true;
  }
  
  // Check direct structure
  if (!chartData.ascendant) return false;
  if (!chartData.planets || !Array.isArray(chartData.planets)) return false;
  
  return true;
}

