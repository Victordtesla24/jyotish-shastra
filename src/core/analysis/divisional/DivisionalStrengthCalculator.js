// Assesses planetary strength across divisional charts
function calculateDivisionalStrength(planet, divisionalCharts) {
  // divisionalCharts: { D1: {...}, D9: {...}, D10: {...}, ... }
  const strengths = {};
  for (const key in divisionalCharts) {
    const chart = divisionalCharts[key];
    if (chart.planets[planet]) {
      strengths[key] = chart.planets[planet].sign;
    }
  }
  return strengths;
}

export default calculateDivisionalStrength;
