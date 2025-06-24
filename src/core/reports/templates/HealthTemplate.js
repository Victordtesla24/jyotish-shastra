// Health Analysis Template based on Section 8B of requirements analysis
function generateHealthAnalysis(lagnaAnalysis, houseAnalysis, planetaryAnalysis) {
  const health = {
    vitality: {
      lagnaStrength: lagnaAnalysis.strength || 'Average',
      firstHouse: houseAnalysis.firstHouse || {},
      lagnaLord: lagnaAnalysis.lordCondition || 'Average'
    },
    healthIndicators: {
      sixthHouse: houseAnalysis.sixthHouse || {},
      eighthHouse: houseAnalysis.eighthHouse || {},
      twelfthHouse: houseAnalysis.twelfthHouse || {}
    },
    specificConcerns: [],
    recommendations: [],
    summary: ''
  };

  // Generate health summary
  health.summary = `Your general vitality is ${health.vitality.lagnaStrength}. ` +
    `Health areas to watch: ${health.healthIndicators.sixthHouse.issues || 'None major'}. ` +
    `Long-term health: ${health.healthIndicators.eighthHouse.assessment || 'Stable'}.`;

  return health;
}

// Template for health analysis section
function renderHealthAnalysis(data) {
  return {
    title: 'Health and Wellness',
    summary: data.summary,
    lagnaLord: data.lagnaLord,
    sixthHouse: data.sixthHouse,
    eighthHouse: data.eighthHouse,
    twelfthHouse: data.twelfthHouse,
    healthAlerts: data.healthAlerts,
  };
}

module.exports = { generateHealthAnalysis, renderHealthAnalysis };
