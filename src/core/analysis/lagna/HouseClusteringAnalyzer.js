// Analyzes clustering of planets in houses
function analyzeHouseClustering(chart) {
  const distribution = Array(12).fill(0);
  for (const planet of chart.planets) {
    distribution[planet.house - 1]++;
  }
  const clusters = distribution.map((count, idx) => ({ house: idx + 1, count })).filter(h => h.count > 1);
  return { distribution, clusters };
}

module.exports = { analyzeHouseClustering };
