const sampleBirthData = {
  dateOfBirth: '1990-01-01',
  timeOfBirth: '12:00:00',
  placeOfBirth: 'New York, NY, USA',
  latitude: 40.7128,
  longitude: -74.0060,
  timeZone: 'America/New_York',
  gender: 'male',
};

const sampleChart = {
  rasiChart: {
    ascendant: { sign: 'Cancer', degree: 15.45 },
    planetaryPositions: {
      sun: { sign: 'Sagittarius', house: 6, degree: 15.4 },
      moon: { sign: 'Gemini', house: 12, degree: 22.1 },
    },
  },
  navamsaChart: {
    ascendant: { sign: 'Leo', degree: 2.3 },
    planetaryPositions: {
      sun: { sign: 'Aries', house: 9, degree: 18.2 },
      moon: { sign: 'Virgo', house: 2, degree: 7.5 },
    },
  },
};

const sampleChartWithYogas = {
  ...sampleChart,
  yogas: [
    { name: 'Gaja Kesari Yoga', description: 'Jupiter in a quadrant from the Moon.' },
    { name: 'Raja Yoga', description: 'Lord of 9th and 10th in conjunction.' },
  ],
};

module.exports = {
  sampleBirthData,
  sampleChart,
  sampleChartWithYogas,
};
