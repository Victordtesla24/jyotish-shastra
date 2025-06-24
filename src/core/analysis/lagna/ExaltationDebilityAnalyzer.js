// Returns the dignity of a planet in a given sign: 'exalted', 'debilitated', 'own', 'friendly', 'enemy', 'neutral'
const dignityTable = require('../../../../src/utils/constants/planetaryConstants').dignityTable;

// Assesses planetary dignity (exaltation/debilitation) for Lagna and lord
const { getDignity } = require('../../calculations/helpers/astrologyHelpers');

function getPlanetaryDignity(planet, sign) {
  if (!dignityTable[planet]) return 'neutral';
  if (dignityTable[planet].exaltation === sign) return 'exalted';
  if (dignityTable[planet].debilitation === sign) return 'debilitated';
  if (dignityTable[planet].own && dignityTable[planet].own.includes(sign)) return 'own';
  if (dignityTable[planet].friendly && dignityTable[planet].friendly.includes(sign)) return 'friendly';
  if (dignityTable[planet].enemy && dignityTable[planet].enemy.includes(sign)) return 'enemy';
  return 'neutral';
}

function analyzeExaltationDebility(chart) {
  const dignities = {};
  for (const planet of chart.planets) {
    dignities[planet.name] = getDignity(planet, chart);
  }
  return dignities;
}

module.exports = { getPlanetaryDignity, analyzeExaltationDebility };
