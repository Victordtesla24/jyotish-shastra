// Financial Analysis Formatter
function formatFinancialAnalysis(financialData) {
  const { wealthIndicators, earningCapacity, riskAreas, recommendations, summary } = financialData;

  return {
    html: `
      <div class="financial-analysis">
        <h2>Financial Analysis</h2>
        <p class="summary">${summary}</p>
        <div class="wealth-indicators">
          <h3>Wealth Indicators</h3>
          <p>2nd House: ${wealthIndicators.secondHouse.sign || 'Unknown'}</p>
          <p>11th House: ${wealthIndicators.eleventhHouse.sign || 'Unknown'}</p>
          <p>Wealth Yogas: ${wealthIndicators.wealthYogas.length}</p>
        </div>
        <div class="earning-capacity">
          <h3>Earning Capacity</h3>
          <p>Current Period: ${earningCapacity.current.planet || 'Unknown'}</p>
        </div>
      </div>
    `,
    text: `Financial Analysis\n\n${summary}\n\nWealth Indicators:\n2nd House: ${wealthIndicators.secondHouse.sign || 'Unknown'}\n11th House: ${wealthIndicators.eleventhHouse.sign || 'Unknown'}`
  };
}

// Formats financial analysis data for report generation
function formatFinancialData(analysis) {
  const { secondHouse, eleventhHouse, dhanaYogas, timeline } = analysis;

  return {
    summary: generateFinancialSummary(secondHouse, eleventhHouse),
    secondHouse: {
      lord: secondHouse.lord,
      planets: secondHouse.planets,
      wealth: secondHouse.wealth,
      family: secondHouse.family
    },
    eleventhHouse: {
      lord: eleventhHouse.lord,
      planets: eleventhHouse.planets,
      gains: eleventhHouse.gains,
      income: eleventhHouse.income
    },
    dhanaYogas: {
      present: dhanaYogas.present,
      strength: dhanaYogas.strength,
      timing: dhanaYogas.timing
    },
    financialTimeline: {
      periods: timeline.periods,
      peaks: timeline.peaks,
      challenges: timeline.challenges
    },
    cautions: extractFinancialCautions(analysis)
  };
}

function generateFinancialSummary(secondHouse, eleventhHouse) {
  return `Wealth potential: ${secondHouse.wealth}. Income sources: ${eleventhHouse.income}.`;
}

function extractFinancialCautions(analysis) {
  return analysis.cautions || [];
}

module.exports = { formatFinancialAnalysis, formatFinancialData };
