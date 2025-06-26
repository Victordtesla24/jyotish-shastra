// Detects stelliums (3+ planets in a house)
function detectStelliums(chart) {
  const houseMap = {};
  for (const planet of chart.planets) {
    const house = planet.house;
    if (!houseMap[house]) houseMap[house] = [];
    houseMap[house].push(planet.name);
  }
  const stelliums = [];
  for (const [house, planets] of Object.entries(houseMap)) {
    if (planets.length >= 3) {
      stelliums.push({ house: Number(house), planets });
    }
  }
  return stelliums;
}

module.exports = { detectStelliums };
