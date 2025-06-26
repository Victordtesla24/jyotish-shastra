// Health Analysis Formatter
function formatHealthAnalysis(healthData) {
  const { vitality, healthIndicators, specificConcerns, recommendations, summary } = healthData;

  return {
    html: `
      <div class="health-analysis">
        <h2>Health Analysis</h2>
        <p class="summary">${summary}</p>
        <div class="vitality">
          <h3>Vitality</h3>
          <p>Lagna Strength: ${vitality.lagnaStrength}</p>
          <p>Lagna Lord: ${vitality.lagnaLord}</p>
        </div>
        <div class="health-indicators">
          <h3>Health Indicators</h3>
          <p>6th House: ${healthIndicators.sixthHouse.assessment || 'Normal'}</p>
          <p>8th House: ${healthIndicators.eighthHouse.assessment || 'Stable'}</p>
        </div>
      </div>
    `,
    text: `Health Analysis\n\n${summary}\n\nVitality:\nLagna Strength: ${vitality.lagnaStrength}\nLagna Lord: ${vitality.lagnaLord}`
  };
}

// Formats health analysis data for report generation
function formatHealthData(analysis) {
  const { lagnaLord, sixthHouse, eighthHouse, twelfthHouse } = analysis;

  return {
    summary: generateHealthSummary(lagnaLord, sixthHouse),
    lagnaLord: {
      strength: lagnaLord.strength,
      placement: lagnaLord.placement,
      vitality: lagnaLord.vitality
    },
    sixthHouse: {
      planets: sixthHouse.planets,
      lord: sixthHouse.lord,
      diseaseIndications: sixthHouse.diseaseIndications
    },
    eighthHouse: {
      planets: eighthHouse.planets,
      chronicIssues: eighthHouse.chronicIssues,
      longevity: eighthHouse.longevity
    },
    twelfthHouse: {
      planets: twelfthHouse.planets,
      hospitalization: twelfthHouse.hospitalization,
      mentalHealth: twelfthHouse.mentalHealth
    },
    healthAlerts: extractHealthAlerts(analysis)
  };
}

function generateHealthSummary(lagnaLord, sixthHouse) {
  return `General vitality: ${lagnaLord.vitality}. Health challenges: ${sixthHouse.diseaseIndications}.`;
}

function extractHealthAlerts(analysis) {
  return analysis.alerts || [];
}

module.exports = { formatHealthAnalysis, formatHealthData };
