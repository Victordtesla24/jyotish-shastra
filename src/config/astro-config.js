/**
 * Astrological Configuration
 * Contains constants and settings for Vedic astrology calculations
 */

module.exports = {
  // Zodiac Signs (Rashis)
  ZODIAC_SIGNS: {
    ARIES: { id: 1, name: 'Aries', sanskrit: 'Mesha', element: 'Fire', quality: 'Cardinal' },
    TAURUS: { id: 2, name: 'Taurus', sanskrit: 'Vrishabha', element: 'Earth', quality: 'Fixed' },
    GEMINI: { id: 3, name: 'Gemini', sanskrit: 'Mithuna', element: 'Air', quality: 'Mutable' },
    CANCER: { id: 4, name: 'Cancer', sanskrit: 'Karka', element: 'Water', quality: 'Cardinal' },
    LEO: { id: 5, name: 'Leo', sanskrit: 'Simha', element: 'Fire', quality: 'Fixed' },
    VIRGO: { id: 6, name: 'Virgo', sanskrit: 'Kanya', element: 'Earth', quality: 'Mutable' },
    LIBRA: { id: 7, name: 'Libra', sanskrit: 'Tula', element: 'Air', quality: 'Cardinal' },
    SCORPIO: { id: 8, name: 'Scorpio', sanskrit: 'Vrishchika', element: 'Water', quality: 'Fixed' },
    SAGITTARIUS: { id: 9, name: 'Sagittarius', sanskrit: 'Dhanu', element: 'Fire', quality: 'Mutable' },
    CAPRICORN: { id: 10, name: 'Capricorn', sanskrit: 'Makara', element: 'Earth', quality: 'Cardinal' },
    AQUARIUS: { id: 11, name: 'Aquarius', sanskrit: 'Kumbha', element: 'Air', quality: 'Fixed' },
    PISCES: { id: 12, name: 'Pisces', sanskrit: 'Meena', element: 'Water', quality: 'Mutable' }
  },

  // Planets (Grahas)
  PLANETS: {
    SUN: { id: 1, name: 'Sun', sanskrit: 'Surya', nature: 'Malefic', element: 'Fire' },
    MOON: { id: 2, name: 'Moon', sanskrit: 'Chandra', nature: 'Benefic', element: 'Water' },
    MARS: { id: 3, name: 'Mars', sanskrit: 'Mangal', nature: 'Malefic', element: 'Fire' },
    MERCURY: { id: 4, name: 'Mercury', sanskrit: 'Budh', nature: 'Neutral', element: 'Earth' },
    JUPITER: { id: 5, name: 'Jupiter', sanskrit: 'Guru', nature: 'Benefic', element: 'Ether' },
    VENUS: { id: 6, name: 'Venus', sanskrit: 'Shukra', nature: 'Benefic', element: 'Water' },
    SATURN: { id: 7, name: 'Saturn', sanskrit: 'Shani', nature: 'Malefic', element: 'Air' },
    RAHU: { id: 8, name: 'Rahu', sanskrit: 'Rahu', nature: 'Malefic', element: 'Shadow' },
    KETU: { id: 9, name: 'Ketu', sanskrit: 'Ketu', nature: 'Malefic', element: 'Shadow' }
  },

  // Houses (Bhavas)
  HOUSES: {
    FIRST: { id: 1, name: 'First House', sanskrit: 'Lagna', significations: ['Self', 'Personality', 'Health'] },
    SECOND: { id: 2, name: 'Second House', sanskrit: 'Dhana', significations: ['Wealth', 'Family', 'Speech'] },
    THIRD: { id: 3, name: 'Third House', sanskrit: 'Sahaja', significations: ['Siblings', 'Courage', 'Communication'] },
    FOURTH: { id: 4, name: 'Fourth House', sanskrit: 'Sukha', significations: ['Home', 'Mother', 'Comforts'] },
    FIFTH: { id: 5, name: 'Fifth House', sanskrit: 'Putra', significations: ['Children', 'Education', 'Creativity'] },
    SIXTH: { id: 6, name: 'Sixth House', sanskrit: 'Roga', significations: ['Health', 'Enemies', 'Service'] },
    SEVENTH: { id: 7, name: 'Seventh House', sanskrit: 'Yuvati', significations: ['Marriage', 'Partnerships', 'Travel'] },
    EIGHTH: { id: 8, name: 'Eighth House', sanskrit: 'Mrityu', significations: ['Longevity', 'Mysteries', 'Transformation'] },
    NINTH: { id: 9, name: 'Ninth House', sanskrit: 'Dharma', significations: ['Religion', 'Luck', 'Father'] },
    TENTH: { id: 10, name: 'Tenth House', sanskrit: 'Karma', significations: ['Career', 'Profession', 'Status'] },
    ELEVENTH: { id: 11, name: 'Eleventh House', sanskrit: 'Labha', significations: ['Gains', 'Income', 'Friends'] },
    TWELFTH: { id: 12, name: 'Twelfth House', sanskrit: 'Vyaya', significations: ['Expenses', 'Losses', 'Moksha'] }
  },

  // Exaltation and Debilitation
  EXALTATION: {
    SUN: { sign: 'ARIES', degree: 10 },
    MOON: { sign: 'TAURUS', degree: 33 },
    MARS: { sign: 'CAPRICORN', degree: 28 },
    MERCURY: { sign: 'VIRGO', degree: 15 },
    JUPITER: { sign: 'CANCER', degree: 5 },
    VENUS: { sign: 'PISCES', degree: 27 },
    SATURN: { sign: 'LIBRA', degree: 20 }
  },

  DEBILITATION: {
    SUN: { sign: 'LIBRA', degree: 10 },
    MOON: { sign: 'SCORPIO', degree: 3 },
    MARS: { sign: 'CANCER', degree: 28 },
    MERCURY: { sign: 'PISCES', degree: 15 },
    JUPITER: { sign: 'CAPRICORN', degree: 5 },
    VENUS: { sign: 'VIRGO', degree: 27 },
    SATURN: { sign: 'ARIES', degree: 20 }
  },

  // Dasha Periods (Vimshottari)
  DASHA_PERIODS: {
    SUN: 6,
    MOON: 10,
    MARS: 7,
    RAHU: 18,
    JUPITER: 16,
    SATURN: 19,
    MERCURY: 17,
    KETU: 7,
    VENUS: 20
  },

  // Calculation Settings
  CALCULATION_SETTINGS: {
    DEFAULT_AYANAMSA: 23.85, // Lahiri Ayanamsa
    EPHEMERIS_PATH: './ephemeris',
    PRECISION: 6, // Decimal places for calculations
    TIME_ZONE_DEFAULT: 'UTC'
  },

  // Report Settings
  REPORT_SETTINGS: {
    DEFAULT_LANGUAGE: 'en',
    SUPPORTED_LANGUAGES: ['en', 'hi', 'sa'],
    MAX_CHART_HISTORY: 100,
    REPORT_CACHE_DURATION: 3600 // 1 hour in seconds
  }
};
