/**
 * Data Transformation Utilities - Transform API responses to UI-ready formats
 */

/**
 * Vedic sign symbols mapping
 */
const vedicSignSymbols = {
  'Aries': '♈',
  'Taurus': '♉',
  'Gemini': '♊',
  'Cancer': '♋',
  'Leo': '♌',
  'Virgo': '♍',
  'Libra': '♎',
  'Scorpio': '♏',
  'Sagittarius': '♐',
  'Capricorn': '♑',
  'Aquarius': '♒',
  'Pisces': '♓'
};

/**
 * Planet symbols mapping
 */
const planetSymbols = {
  'Sun': '☉',
  'Moon': '☽',
  'Mars': '♂',
  'Mercury': '☿',
  'Jupiter': '♃',
  'Venus': '♀',
  'Saturn': '♄',
  'Rahu': '☊',
  'Ketu': '☋'
};

/**
 * Dignity labels mapping
 */
const dignityLabels = {
  'exalted': 'Exalted',
  'own': 'Own Sign',
  'friendly': 'Friendly',
  'neutral': 'Neutral',
  'enemy': 'Enemy',
  'debilitated': 'Debilitated'
};

/**
 * Yoga type icons mapping
 */
const yogaTypeIcons = {
  'Raj Yoga': '👑',
  'Dhana Yoga': '💰',
  'Arishta Yoga': '⚠️',
  'Parivartana Yoga': '🔄',
  'Neecha Bhanga': '↗️',
  'Gaja Kesari': '🐘'
};

/**
 * Get Vedic symbol for sign
 * @param {string} sign - Sign name
 * @returns {string} Vedic symbol
 */
export function getVedicSymbol(sign) {
  return vedicSignSymbols[sign] || sign;
}

/**
 * Get planet symbol
 * @param {string} planet - Planet name
 * @returns {string} Planet symbol
 */
export function getPlanetSymbol(planet) {
  return planetSymbols[planet] || planet;
}

/**
 * Get dignity label
 * @param {string} dignity - Dignity code
 * @returns {string} Dignity label
 */
export function getDignityLabel(dignity) {
  return dignityLabels[dignity] || dignity;
}

/**
 * Get yoga icon
 * @param {string} yogaType - Yoga type
 * @returns {string} Yoga icon
 */
export function getYogaIcon(yogaType) {
  return yogaTypeIcons[yogaType] || '✨';
}

/**
 * Format degree to DMS (Degrees Minutes Seconds)
 * @param {number} degree - Decimal degree
 * @returns {string} Formatted degree
 */
export function formatDegree(degree) {
  const d = Math.floor(degree);
  const m = Math.floor((degree - d) * 60);
  const s = Math.round(((degree - d) * 60 - m) * 60);
  return `${d}°${m}'${s}"`;
}

/**
 * Format date for display
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date
 */
export function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

/**
 * Process chart data for UI display
 * @param {Object} apiResponse - API response with chart data
 * @returns {Object} Processed chart data
 */
export function processChartData(apiResponse) {
  if (!apiResponse?.data?.chartData) {
    throw new Error('Invalid chart data structure');
  }

  const { chartData } = apiResponse.data;

  return {
    // Transform house data for UI display
    houses: chartData.houses.map(house => ({
      number: house.house,
      sign: house.sign,
      signSymbol: getVedicSymbol(house.sign),
      signLord: house.signLord,
      planets: house.planets.map(planet => ({
        name: planet,
        symbol: getPlanetSymbol(planet),
        degree: chartData.planets[planet]?.position?.degree || 0,
        formattedDegree: formatDegree(chartData.planets[planet]?.position?.degree || 0)
      })),
      degree: house.degree,
      formattedDegree: formatDegree(house.degree),
      isAscendant: house.house === 1
    })),

    // Transform planetary data
    planets: Object.entries(chartData.planets).map(([planet, data]) => ({
      name: planet,
      symbol: getPlanetSymbol(planet),
      position: {
        ...data.position,
        signSymbol: getVedicSymbol(data.position.sign),
        formattedDegree: formatDegree(data.position.degree)
      },
      strength: data.strength,
      isRetrograde: data.strength.retrograde,
      isCombust: data.strength.combustion,
      dignity: getDignityLabel(data.strength.dignity),
      dignityCode: data.strength.dignity
    })),

    // Transform ascendant data
    ascendant: {
      ...chartData.ascendant,
      signSymbol: getVedicSymbol(chartData.ascendant.sign),
      formattedDegree: formatDegree(chartData.ascendant.degree)
    },

    // Add metadata
    metadata: apiResponse.data.metadata || {},

    // Add chart summary
    summary: generateChartSummary(chartData)
  };
}

/**
 * Generate chart summary
 * @param {Object} chartData - Raw chart data
 * @returns {Object} Chart summary
 */
function generateChartSummary(chartData) {
  const summary = {
    totalPlanets: Object.keys(chartData.planets).length,
    retrogradeCount: 0,
    exaltedCount: 0,
    debilitatedCount: 0,
    combustCount: 0,
    emptyHouses: [],
    stelliums: []
  };

  // Count planetary conditions
  Object.values(chartData.planets).forEach(planet => {
    if (planet.strength.retrograde) summary.retrogradeCount++;
    if (planet.strength.dignity === 'exalted') summary.exaltedCount++;
    if (planet.strength.dignity === 'debilitated') summary.debilitatedCount++;
    if (planet.strength.combustion) summary.combustCount++;
  });

  // Find empty houses and stelliums
  chartData.houses.forEach(house => {
    if (house.planets.length === 0) {
      summary.emptyHouses.push(house.house);
    } else if (house.planets.length >= 3) {
      summary.stelliums.push({
        house: house.house,
        sign: house.sign,
        planets: house.planets
      });
    }
  });

  return summary;
}

/**
 * Process analysis data for UI display
 * @param {Object} apiResponse - API response with analysis data
 * @returns {Object} Processed analysis data
 */
export function processAnalysisData(apiResponse) {
  if (!apiResponse?.data) {
    throw new Error('Invalid analysis data structure');
  }

  const { data } = apiResponse;

  return {
    // Personality profile formatting
    personality: {
      primary: {
        title: "Ascendant Analysis",
        sign: data.personality.ascendantAnalysis.sign,
        signSymbol: getVedicSymbol(data.personality.ascendantAnalysis.sign),
        lord: data.personality.ascendantAnalysis.lord,
        traits: data.personality.ascendantAnalysis.characteristics,
        strengths: data.personality.ascendantAnalysis.strengths,
        challenges: data.personality.ascendantAnalysis.challenges,
        description: generatePersonalityDescription(data.personality.ascendantAnalysis)
      },
      secondary: {
        title: "Moon Sign Analysis",
        sign: data.personality.moonSignAnalysis.sign,
        signSymbol: getVedicSymbol(data.personality.moonSignAnalysis.sign),
        nakshatra: data.personality.moonSignAnalysis.nakshatra,
        description: data.personality.moonSignAnalysis.mentalNature
      }
    },

    // Dasha timeline formatting
    dashaTimeline: {
      current: {
        main: formatDashaInfo(data.dashaAnalysis.currentMahaDasha),
        sub: formatDashaInfo(data.dashaAnalysis.currentAntarDasha)
      },
      visual: generateDashaTimeline(data.dashaAnalysis)
    },

    // Yoga analysis formatting
    yogas: data.yogas.map(yoga => ({
      ...yoga,
      icon: getYogaIcon(yoga.type),
      strengthIndicator: getStrengthVisual(yoga.strength),
      planetsFormatted: yoga.planets.map(p => ({
        name: p,
        symbol: getPlanetSymbol(p)
      }))
    })),

    // House analysis formatting
    houseAnalysis: formatHouseAnalysis(data.houseAnalysis),

    // Predictions formatting
    predictions: formatPredictions(data.predictions)
  };
}

/**
 * Generate personality description
 * @param {Object} ascendantAnalysis - Ascendant analysis data
 * @returns {string} Personality description
 */
function generatePersonalityDescription(ascendantAnalysis) {
  const { sign, lord, characteristics, strengths, challenges } = ascendantAnalysis;

  let description = `As a ${sign} ascendant with ${lord} as the lagna lord, `;
  description += `you possess ${characteristics.slice(0, 2).join(' and ').toLowerCase()} qualities. `;
  description += `Your key strengths include ${strengths.slice(0, 2).join(' and ').toLowerCase()}, `;
  description += `while areas for growth involve managing ${challenges.slice(0, 2).join(' and ').toLowerCase()}.`;

  return description;
}

/**
 * Format dasha information
 * @param {Object} dasha - Dasha data
 * @returns {Object} Formatted dasha
 */
function formatDashaInfo(dasha) {
  if (!dasha) return null;

  const startDate = new Date(dasha.startDate);
  const endDate = new Date(dasha.endDate);
  const now = new Date();
  const totalDuration = endDate - startDate;
  const elapsed = now - startDate;
  const progress = Math.max(0, Math.min(100, (elapsed / totalDuration) * 100));

  return {
    planet: dasha.planet,
    planetSymbol: getPlanetSymbol(dasha.planet),
    startDate: formatDate(dasha.startDate),
    endDate: formatDate(dasha.endDate),
    effects: dasha.effects,
    progress: Math.round(progress),
    remaining: calculateRemainingTime(endDate),
    duration: calculateDuration(startDate, endDate)
  };
}

/**
 * Calculate remaining time
 * @param {Date} endDate - End date
 * @returns {string} Remaining time description
 */
function calculateRemainingTime(endDate) {
  const now = new Date();
  const diff = endDate - now;

  if (diff < 0) return 'Completed';

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const years = Math.floor(days / 365);
  const months = Math.floor((days % 365) / 30);

  if (years > 0) {
    return `${years} year${years > 1 ? 's' : ''} ${months} month${months > 1 ? 's' : ''}`;
  } else if (months > 0) {
    return `${months} month${months > 1 ? 's' : ''}`;
  } else {
    return `${days} day${days > 1 ? 's' : ''}`;
  }
}

/**
 * Calculate duration between dates
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {string} Duration description
 */
function calculateDuration(startDate, endDate) {
  const diff = endDate - startDate;
  const years = Math.floor(diff / (1000 * 60 * 60 * 24 * 365));
  return `${years} years`;
}

/**
 * Generate dasha timeline visualization data
 * @param {Object} dashaAnalysis - Dasha analysis data
 * @returns {Array} Timeline data
 */
function generateDashaTimeline(dashaAnalysis) {
  // This would generate data for a visual timeline component
  // For now, returning a simple structure
  return [
    {
      type: 'maha',
      ...formatDashaInfo(dashaAnalysis.currentMahaDasha)
    },
    {
      type: 'antar',
      ...formatDashaInfo(dashaAnalysis.currentAntarDasha)
    }
  ];
}

/**
 * Get strength visual indicator
 * @param {string} strength - Strength level
 * @returns {Object} Visual indicator
 */
function getStrengthVisual(strength) {
  const strengthMap = {
    'Very Strong': { level: 5, color: '#22c55e', icon: '💪💪💪' },
    'Strong': { level: 4, color: '#84cc16', icon: '💪💪' },
    'Moderate': { level: 3, color: '#eab308', icon: '💪' },
    'Weak': { level: 2, color: '#f97316', icon: '⚡' },
    'Very Weak': { level: 1, color: '#ef4444', icon: '⚠️' }
  };

  return strengthMap[strength] || strengthMap['Moderate'];
}

/**
 * Format house analysis
 * @param {Object} houseAnalysis - House analysis data
 * @returns {Object} Formatted house analysis
 */
function formatHouseAnalysis(houseAnalysis) {
  if (!houseAnalysis?.houses) return { houses: [] };

  return {
    houses: houseAnalysis.houses.map(house => ({
      ...house,
      signSymbol: getVedicSymbol(house.sign),
      lordSymbol: getPlanetSymbol(house.lord),
      lordPlacement: {
        ...house.lordPlacement,
        signSymbol: getVedicSymbol(house.lordPlacement.sign),
        strengthLabel: getDignityLabel(house.lordPlacement.strength)
      },
      occupantsFormatted: house.occupants.map(planet => ({
        name: planet,
        symbol: getPlanetSymbol(planet)
      })),
      aspectsFormatted: formatAspects(house.aspects),
      significance: getHouseSignificance(house.house)
    }))
  };
}

/**
 * Format aspects
 * @param {Array} aspects - Aspect descriptions
 * @returns {Array} Formatted aspects
 */
function formatAspects(aspects) {
  return aspects.map(aspect => {
    // Parse aspect string to extract planet and house
    const match = aspect.match(/(\w+) from (\d+)(?:st|nd|rd|th) house/);
    if (match) {
      return {
        planet: match[1],
        planetSymbol: getPlanetSymbol(match[1]),
        fromHouse: parseInt(match[2]),
        description: aspect
      };
    }
    return { description: aspect };
  });
}

/**
 * Get house significance
 * @param {number} houseNumber - House number
 * @returns {Object} House significance
 */
function getHouseSignificance(houseNumber) {
  const significances = {
    1: { name: 'Ascendant', areas: ['Self', 'Personality', 'Health'] },
    2: { name: 'Wealth', areas: ['Money', 'Family', 'Speech'] },
    3: { name: 'Siblings', areas: ['Communication', 'Courage', 'Short Travels'] },
    4: { name: 'Mother', areas: ['Home', 'Comfort', 'Emotions'] },
    5: { name: 'Children', areas: ['Creativity', 'Romance', 'Intelligence'] },
    6: { name: 'Enemies', areas: ['Health', 'Service', 'Obstacles'] },
    7: { name: 'Partnership', areas: ['Marriage', 'Business', 'Others'] },
    8: { name: 'Transformation', areas: ['Longevity', 'Occult', 'Inheritance'] },
    9: { name: 'Dharma', areas: ['Fortune', 'Higher Learning', 'Father'] },
    10: { name: 'Career', areas: ['Profession', 'Status', 'Authority'] },
    11: { name: 'Gains', areas: ['Income', 'Friends', 'Aspirations'] },
    12: { name: 'Liberation', areas: ['Expenses', 'Spirituality', 'Foreign'] }
  };

  return significances[houseNumber] || { name: `House ${houseNumber}`, areas: [] };
}

/**
 * Format predictions
 * @param {Object} predictions - Predictions data
 * @returns {Object} Formatted predictions
 */
function formatPredictions(predictions) {
  if (!predictions) return {};

  return {
    career: formatCareerPredictions(predictions.career),
    relationships: formatRelationshipPredictions(predictions.relationships),
    health: formatHealthPredictions(predictions.health)
  };
}

/**
 * Format career predictions
 * @param {Object} career - Career predictions
 * @returns {Object} Formatted career predictions
 */
function formatCareerPredictions(career) {
  if (!career) return null;

  return {
    ...career,
    timing: {
      favorable: career.timing?.favorable?.map(period => ({
        period,
        formatted: formatTimePeriod(period)
      })) || [],
      challenging: career.timing?.challenging?.map(period => ({
        period,
        formatted: formatTimePeriod(period)
      })) || []
    },
    icon: '💼',
    priority: calculatePredictionPriority(career.current)
  };
}

/**
 * Format relationship predictions
 * @param {Object} relationships - Relationship predictions
 * @returns {Object} Formatted relationship predictions
 */
function formatRelationshipPredictions(relationships) {
  if (!relationships) return null;

  return {
    ...relationships,
    icon: '💕',
    priority: calculatePredictionPriority(relationships.current)
  };
}

/**
 * Format health predictions
 * @param {Object} health - Health predictions
 * @returns {Object} Formatted health predictions
 */
function formatHealthPredictions(health) {
  if (!health) return null;

  return {
    ...health,
    icon: '🏥',
    priority: health.areas?.length > 0 ? 'high' : 'normal'
  };
}

/**
 * Format time period
 * @param {string} period - Time period string (e.g., "2024-03 to 2024-06")
 * @returns {string} Formatted period
 */
function formatTimePeriod(period) {
  const [start, end] = period.split(' to ');
  const startDate = new Date(start + '-01');
  const endDate = new Date(end + '-01');

  const startMonth = startDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  const endMonth = endDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

  return `${startMonth} - ${endMonth}`;
}

/**
 * Calculate prediction priority
 * @param {string} currentStatus - Current status description
 * @returns {string} Priority level
 */
function calculatePredictionPriority(currentStatus) {
  if (!currentStatus) return 'normal';

  const keywords = {
    high: ['favorable', 'excellent', 'auspicious', 'growth'],
    medium: ['moderate', 'steady', 'stable'],
    low: ['challenging', 'difficult', 'caution']
  };

  const lowerStatus = currentStatus.toLowerCase();

  for (const [priority, words] of Object.entries(keywords)) {
    if (words.some(word => lowerStatus.includes(word))) {
      return priority;
    }
  }

  return 'normal';
}

/**
 * Process geocoding data
 * @param {Object} apiResponse - API response with geocoding data
 * @returns {Object} Processed geocoding data
 */
export function processGeocodingData(apiResponse) {
  if (!apiResponse?.data) {
    throw new Error('Invalid geocoding data structure');
  }

  const { data } = apiResponse;

  return {
    coordinates: {
      latitude: data.latitude,
      longitude: data.longitude,
      formatted: `${data.latitude.toFixed(4)}°, ${data.longitude.toFixed(4)}°`
    },
    timezone: data.timezone,
    location: {
      ...data.location,
      displayName: data.location.formatted || `${data.location.city}, ${data.location.country}`
    }
  };
}

// Export all transformation functions
export default {
  processChartData,
  processAnalysisData,
  processGeocodingData,
  getVedicSymbol,
  getPlanetSymbol,
  getDignityLabel,
  getYogaIcon,
  formatDegree,
  formatDate
};
