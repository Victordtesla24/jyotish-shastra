// Financial Analysis Template based on Section 8D of requirements analysis
function generateFinancialAnalysis(secondHouse, eleventhHouse, wealthYogas, dashaAnalysis) {
  const financial = {
    wealthIndicators: {
      secondHouse: secondHouse || {},
      eleventhHouse: eleventhHouse || {},
      wealthYogas: wealthYogas || []
    },
    earningCapacity: {
      current: dashaAnalysis.current || {},
      future: dashaAnalysis.upcoming || []
    },
    riskAreas: [],
    recommendations: [],
    summary: ''
  };

  // Generate financial summary
  financial.summary = `Your wealth is indicated by ${secondHouse.sign} in the 2nd house. ` +
    `Gains potential: ${financial.wealthIndicators.eleventhHouse.assessment || 'Good'}. ` +
    `Wealth yogas: ${financial.wealthIndicators.wealthYogas.length || 0} found.`;

  return financial;
}

// Template for financial analysis section
function renderFinancialAnalysis(data) {
  return {
    title: 'Financial Prospects',
    summary: data.summary,
    secondHouse: data.secondHouse,
    eleventhHouse: data.eleventhHouse,
    dhanaYogas: data.dhanaYogas,
    financialTimeline: data.financialTimeline,
    cautions: data.cautions,
  };
}

module.exports = { generateFinancialAnalysis, renderFinancialAnalysis };
