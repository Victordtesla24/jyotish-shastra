/**
 * Astronomical Constants for Swiss Ephemeris
 * Configuration constants for Vedic astrological calculations
 */

// Optional swisseph import for serverless compatibility
let swisseph = null;
let swissephAvailable = false;

(async () => {
  try {
    const swissephModule = await import('swisseph');
    swisseph = swissephModule.default || swissephModule;
    swissephAvailable = true;
  } catch (error) {
    console.warn('⚠️  astronomicalConstants: swisseph not available:', error.message);
    swissephAvailable = false;
    // Provide fallback constants
    swisseph = {
      SE_JUL_CAL: 0,
      SE_GREG_CAL: 1,
      SEFLG_SWIEPH: 2,
      SEFLG_SIDEREAL: 256,
      SEFLG_SPEED: 2,
      SE_SUN: 0,
      SE_MOON: 1,
      SE_MERCURY: 2,
      SE_VENUS: 3,
      SE_MARS: 4,
      SE_JUPITER: 5,
      SE_SATURN: 6,
      SE_URANUS: 7,
      SE_NEPTUNE: 8,
      SE_PLUTO: 9,
      SE_MEAN_NODE: 11,
      SE_TRUE_NODE: 12
    };
  }
})();

// Helper to get swisseph values safely
function getSwissephValue(prop, defaultValue) {
  if (swisseph && swisseph[prop] !== undefined) {
    return swisseph[prop];
  }
  return defaultValue;
}

const SWISS_EPHEMERIS = {
  // Calendar types
  CALENDAR: {
    JULIAN: getSwissephValue('SE_JUL_CAL', 0),
    GREGORIAN: getSwissephValue('SE_GREG_CAL', 1)
  },

  // Calculation flags
  FLAGS: {
    SWIEPH: getSwissephValue('SEFLG_SWIEPH', 2),
    SIDEREAL: getSwissephValue('SEFLG_SIDEREAL', 256),
    SPEED: getSwissephValue('SEFLG_SPEED', 2),
    NOGEO: getSwissephValue('SEFLG_NOGEO', 0),
    NOLIGHT: getSwissephValue('SEFLG_NOLIGHT', 0),
    NOABER: getSwissephValue('SEFLG_NOABER', 0),
    NONEUT: getSwissephValue('SEFLG_NONEUT', 0),
    HELCTR: getSwissephValue('SEFLG_HELCTR', 0),
    EQUATORIAL: getSwissephValue('SEFLG_EQUATORIAL', 0),
    MOSEPH: getSwissephValue('SEFLG_MOSEPH', 0),
    JPLEPH: getSwissephValue('SEFLG_JPLEPH', 0)
  },

  // Planet IDs
  PLANETS: {
    SUN: getSwissephValue('SE_SUN', 0),
    MOON: getSwissephValue('SE_MOON', 1),
    MERCURY: getSwissephValue('SE_MERCURY', 2),
    VENUS: getSwissephValue('SE_VENUS', 3),
    MARS: getSwissephValue('SE_MARS', 4),
    JUPITER: getSwissephValue('SE_JUPITER', 5),
    SATURN: getSwissephValue('SE_SATURN', 6),
    URANUS: getSwissephValue('SE_URANUS', 7),
    NEPTUNE: getSwissephValue('SE_NEPTUNE', 8),
    PLUTO: getSwissephValue('SE_PLUTO', 9),
    RAHU: getSwissephValue('SE_MEAN_NODE', 11),
    KETU: getSwissephValue('SE_MEAN_APOG', 10),
    TRUE_RAHU: getSwissephValue('SE_TRUE_NODE', 12),
    ASCENDANT: getSwissephValue('SE_ASC', 999),
    MC: getSwissephValue('SE_MC', 999)
  },

  // Ayanamsa systems
  AYANAMSA: {
    LAHIRI: getSwissephValue('SE_SIDM_LAHIRI', 1),
    KRISHNAMURTI: getSwissephValue('SE_SIDM_KRISHNAMURTI', 0),
    DJWHAL_KHUL: getSwissephValue('SE_SIDM_DJWHAL_KHUL', 0),
    YUKTESHWAR: getSwissephValue('SE_SIDM_YUKTESHWAR', 0),
    JN_BHASIN: getSwissephValue('SE_SIDM_JN_BHASIN', 0),
    BABYL_KUGLER1: getSwissephValue('SE_SIDM_BABYL_KUGLER1', 0),
    BABYL_KUGLER2: getSwissephValue('SE_SIDM_BABYL_KUGLER2', 0),
    BABYL_KUGLER3: getSwissephValue('SE_SIDM_BABYL_KUGLER3', 0),
    BABYL_HUBER: getSwissephValue('SE_SIDM_BABYL_HUBER', 0),
    BABYL_ETPSC: getSwissephValue('SE_SIDM_BABYL_ETPSC', 0),
    ALDEBARAN_15TAU: getSwissephValue('SE_SIDM_ALDEBARAN_15TAU', 0),
    HIPPARCHOS: getSwissephValue('SE_SIDM_HIPPARCHOS', 0),
    SASSANIAN: getSwissephValue('SE_SIDM_SASSANIAN', 0),
    GALCENT_0SAG: getSwissephValue('SE_SIDM_GALCENT_0SAG', 0),
    J2000: getSwissephValue('SE_SIDM_J2000', 0),
    J1900: getSwissephValue('SE_SIDM_J1900', 0),
    B1950: getSwissephValue('SE_SIDM_B1950', 0)
  },

  // House systems
  HOUSE_SYSTEMS: {
    PLACIDUS: 'P',
    KOCH: 'K',
    PORPHYRY: 'O',
    REGIOMONTANUS: 'R',
    CAMPANUS: 'C',
    EQUAL: 'E',
    WHOLE_SIGN: 'W',
    MERIDIAN: 'X',
    AZIMUTHAL: 'H',
    POLICH_PAGE: 'T',
    ALCABITUS: 'B',
    MORINUS: 'M',
    KRUSINSKI: 'U',
    GAUQUELIN_36: 'G'
  },

  // Coordinate systems
  COORDINATES: {
    ECLIPTIC: 0,
    EQUATORIAL: getSwissephValue('SEFLG_EQUATORIAL', 0),
    HORIZONTAL: 1
  },

  // Error codes
  ERRORS: {
    OK: getSwissephValue('OK', 0),
    ERR: getSwissephValue('ERR', -1)
  }
};

// Planetary data constants
const PLANETARY_DATA = {
  // Planet symbols
  SYMBOLS: {
    sun: '☉',
    moon: '☽',
    mercury: '☿',
    venus: '♀',
    mars: '♂',
    jupiter: '♃',
    saturn: '♄',
    uranus: '♅',
    neptune: '♆',
    pluto: '♇',
    rahu: '☊',
    ketu: '☋'
  },

  // Planet colors for visualization
  COLORS: {
    sun: '#FFA500',
    moon: '#C0C0C0',
    mercury: '#32CD32',
    venus: '#FFB6C1',
    mars: '#FF4500',
    jupiter: '#FFD700',
    saturn: '#4B0082',
    uranus: '#40E0D0',
    neptune: '#0000FF',
    pluto: '#8B4513',
    rahu: '#708090',
    ketu: '#2F4F4F'
  },

  // Planet natural significators
  SIGNIFICATORS: {
    sun: ['soul', 'father', 'authority', 'government', 'health', 'vitality'],
    moon: ['mind', 'mother', 'emotions', 'public', 'water', 'travel'],
    mercury: ['intellect', 'communication', 'business', 'education', 'siblings'],
    venus: ['love', 'beauty', 'luxury', 'arts', 'relationships', 'marriage'],
    mars: ['energy', 'courage', 'conflict', 'siblings', 'property', 'surgery'],
    jupiter: ['wisdom', 'teacher', 'spirituality', 'children', 'wealth', 'luck'],
    saturn: ['discipline', 'obstacles', 'longevity', 'service', 'delay', 'karma'],
    rahu: ['illusion', 'foreign', 'technology', 'sudden events', 'materialism'],
    ketu: ['spirituality', 'liberation', 'past life', 'research', 'occult']
  },

  // Planet aspects (Vedic)
  ASPECTS: {
    sun: [7],
    moon: [7],
    mercury: [7],
    venus: [7],
    mars: [4, 7, 8],
    jupiter: [5, 7, 9],
    saturn: [3, 7, 10],
    rahu: [5, 7, 9],
    ketu: [5, 7, 9]
  },

  // Planet dignities
  DIGNITIES: {
    sun: { exaltation: 1, debilitation: 7, own: [5], moolatrikona: 5 },
    moon: { exaltation: 2, debilitation: 8, own: [4], moolatrikona: 4 },
    mercury: { exaltation: 6, debilitation: 12, own: [3, 6], moolatrikona: 6 },
    venus: { exaltation: 12, debilitation: 6, own: [2, 7], moolatrikona: 7 },
    mars: { exaltation: 10, debilitation: 4, own: [1, 8], moolatrikona: 1 },
    jupiter: { exaltation: 4, debilitation: 10, own: [9, 12], moolatrikona: 9 },
    saturn: { exaltation: 7, debilitation: 1, own: [10, 11], moolatrikona: 11 },
    rahu: { exaltation: 3, debilitation: 9, own: [], moolatrikona: null },
    ketu: { exaltation: 9, debilitation: 3, own: [], moolatrikona: null }
  }
};

// Zodiac sign constants
const ZODIAC_SIGNS = {
  NAMES: [
    'Aries', 'Taurus', 'Gemini', 'Cancer',
    'Leo', 'Virgo', 'Libra', 'Scorpio',
    'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
  ],

  SANSKRIT_NAMES: [
    'Mesha', 'Vrishabha', 'Mithuna', 'Karkata',
    'Simha', 'Kanya', 'Tula', 'Vrischika',
    'Dhanus', 'Makara', 'Kumbha', 'Meena'
  ],

  SYMBOLS: [
    '♈', '♉', '♊', '♋',
    '♌', '♍', '♎', '♏',
    '♐', '♑', '♒', '♓'
  ],

  ELEMENTS: [
    'Fire', 'Earth', 'Air', 'Water',
    'Fire', 'Earth', 'Air', 'Water',
    'Fire', 'Earth', 'Air', 'Water'
  ],

  QUALITIES: [
    'Cardinal', 'Fixed', 'Mutable', 'Cardinal',
    'Fixed', 'Mutable', 'Cardinal', 'Fixed',
    'Mutable', 'Cardinal', 'Fixed', 'Mutable'
  ],

  RULERS: [
    'Mars', 'Venus', 'Mercury', 'Moon',
    'Sun', 'Mercury', 'Venus', 'Mars',
    'Jupiter', 'Saturn', 'Saturn', 'Jupiter'
  ]
};

// House constants
const VEDIC_HOUSES = {
  NAMES: [
    'Tanu Bhava', 'Dhana Bhava', 'Sahaja Bhava', 'Sukha Bhava',
    'Putra Bhava', 'Ari Bhava', 'Yuvati Bhava', 'Ayus Bhava',
    'Dharma Bhava', 'Karma Bhava', 'Labha Bhava', 'Vyaya Bhava'
  ],

  ENGLISH_NAMES: [
    'Ascendant', 'Wealth', 'Siblings', 'Home',
    'Children', 'Enemies', 'Partnership', 'Longevity',
    'Fortune', 'Career', 'Gains', 'Losses'
  ],

  SIGNIFICATORS: [
    ['self', 'personality', 'health', 'appearance'],
    ['wealth', 'family', 'speech', 'food'],
    ['siblings', 'courage', 'communication', 'short journeys'],
    ['mother', 'home', 'property', 'education'],
    ['children', 'creativity', 'intelligence', 'romance'],
    ['enemies', 'disease', 'service', 'obstacles'],
    ['marriage', 'partnership', 'spouse', 'public relations'],
    ['longevity', 'transformation', 'inheritance', 'occult'],
    ['fortune', 'spirituality', 'teacher', 'long journeys'],
    ['career', 'reputation', 'father', 'authority'],
    ['gains', 'friends', 'elder siblings', 'income'],
    ['losses', 'expenses', 'foreign lands', 'liberation']
  ],

  NATURAL_KARAKAS: [
    'Sun',      // 1st house - self
    'Jupiter',  // 2nd house - wealth
    'Mars',     // 3rd house - siblings
    'Moon',     // 4th house - mother
    'Jupiter',  // 5th house - children
    'Mars',     // 6th house - enemies
    'Venus',    // 7th house - spouse
    'Saturn',   // 8th house - longevity
    'Jupiter',  // 9th house - fortune
    'Sun',      // 10th house - career
    'Jupiter',  // 11th house - gains
    'Saturn'    // 12th house - losses
  ]
};

// Nakshatra constants
const NAKSHATRAS = {
  NAMES: [
    'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra',
    'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni',
    'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha',
    'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha',
    'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'
  ],

  LORDS: [
    'Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu',
    'Jupiter', 'Saturn', 'Mercury', 'Ketu', 'Venus', 'Sun',
    'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury',
    'Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu',
    'Jupiter', 'Saturn', 'Mercury'
  ],

  DEITIES: [
    'Ashwini Kumaras', 'Yama', 'Agni', 'Brahma', 'Soma', 'Rudra',
    'Aditi', 'Brihaspati', 'Sarpas', 'Pitrs', 'Bhaga', 'Aryaman',
    'Savitar', 'Tvashtar', 'Vayu', 'Indragni', 'Mitra', 'Indra',
    'Nirriti', 'Apas', 'Vishvedevas', 'Vishnu', 'Vasus', 'Varuna',
    'Ajaikapada', 'Ahirbudhnya', 'Pushan'
  ]
};

// Dasha constants
const VIMSHOTTARI_DASHA = {
  PERIODS: {
    ketu: 7,
    venus: 20,
    sun: 6,
    moon: 10,
    mars: 7,
    rahu: 18,
    jupiter: 16,
    saturn: 19,
    mercury: 17
  },

  ORDER: ['ketu', 'venus', 'sun', 'moon', 'mars', 'rahu', 'jupiter', 'saturn', 'mercury'],

  TOTAL_YEARS: 120
};

// Yoga constants
const CLASSICAL_YOGAS = {
  RAJA_YOGAS: [
    'Dharmakarmadhipati',
    'Viparita Raja',
    'Neecha Bhanga Raja',
    'Kahala',
    'Chamara'
  ],

  DHANA_YOGAS: [
    'Lakshmi',
    'Kubera',
    'Gaja Kesari',
    'Chandra Mangala',
    'Guru Mangala'
  ],

  MAHAPURUSHA_YOGAS: [
    'Ruchaka', // Mars
    'Bhadra',  // Mercury
    'Hamsa',   // Jupiter
    'Malavya', // Venus
    'Sasa'     // Saturn
  ]
};

// Constants for HouseLordCalculator compatibility
const PLANETS = {
  SUN: 'Sun',
  MOON: 'Moon',
  MARS: 'Mars',
  MERCURY: 'Mercury',
  JUPITER: 'Jupiter',
  VENUS: 'Venus',
  SATURN: 'Saturn',
  RAHU: 'Rahu',
  KETU: 'Ketu'
};

// Constants for zodiac signs
const SIGNS = {
  ARIES: 'Aries',
  TAURUS: 'Taurus',
  GEMINI: 'Gemini',
  CANCER: 'Cancer',
  LEO: 'Leo',
  VIRGO: 'Virgo',
  LIBRA: 'Libra',
  SCORPIO: 'Scorpio',
  SAGITTARIUS: 'Sagittarius',
  CAPRICORN: 'Capricorn',
  AQUARIUS: 'Aquarius',
  PISCES: 'Pisces'
};

export {
  SWISS_EPHEMERIS,
  PLANETARY_DATA,
  ZODIAC_SIGNS,
  VEDIC_HOUSES,
  NAKSHATRAS,
  VIMSHOTTARI_DASHA,
  CLASSICAL_YOGAS,
  PLANETS,
  ZODIAC_SIGNS as SIGNS
};
