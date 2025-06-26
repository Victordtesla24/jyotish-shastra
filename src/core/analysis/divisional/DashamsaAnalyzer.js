// Dashamsa (D10) chart analysis for career
function analyzeDashamsaCareer(dashamsaChart) {
  // Example: Look at 10th house and its lord
  const tenthHouse = dashamsaChart.houses[10];
  const tenthLord = dashamsaChart.houseLords[10];
  return { tenthHouse, tenthLord };
}

module.exports = { analyzeDashamsaCareer };
