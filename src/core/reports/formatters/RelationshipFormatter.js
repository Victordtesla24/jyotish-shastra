// Relationship Analysis Formatter
function formatRelationshipAnalysis(relationshipData) {
  const { marriageIndicators, partnerCharacteristics, timing, challenges, recommendations, summary } = relationshipData;

  return {
    html: `
      <div class="relationship-analysis">
        <h2>Relationship Analysis</h2>
        <p class="summary">${summary}</p>
        <div class="marriage-indicators">
          <h3>Marriage Indicators</h3>
          <p>7th House: ${marriageIndicators.seventhHouse.sign || 'Unknown'}</p>
          <p>Navamsa 7th: ${marriageIndicators.navamsaSeventh.assessment || 'Good'}</p>
        </div>
        <div class="partner-characteristics">
          <h3>Partner Characteristics</h3>
          <p>Rasi: ${partnerCharacteristics.rasi.join(', ')}</p>
          <p>Navamsa: ${partnerCharacteristics.navamsa.join(', ')}</p>
        </div>
      </div>
    `,
    text: `Relationship Analysis\n\n${summary}\n\nMarriage Indicators:\n7th House: ${marriageIndicators.seventhHouse.sign || 'Unknown'}\nNavamsa 7th: ${marriageIndicators.navamsaSeventh.assessment || 'Good'}`
  };
}

// Formats relationship analysis data for report generation
function formatRelationshipData(analysis) {
  const { seventhHouse, navamsa, venus, jupiter, marriagePeriods } = analysis;

  return {
    summary: generateRelationshipSummary(seventhHouse, navamsa),
    seventhHouse: {
      lord: seventhHouse.lord,
      planets: seventhHouse.planets,
      partnerTraits: seventhHouse.partnerTraits,
      marriageIndications: seventhHouse.marriageIndications
    },
    navamsa: {
      seventhLord: navamsa.seventhLord,
      venusPosition: navamsa.venusPosition,
      jupiterPosition: navamsa.jupiterPosition,
      maritalHappiness: navamsa.maritalHappiness
    },
    venus: {
      sign: venus.sign,
      house: venus.house,
      strength: venus.strength,
      romance: venus.romance
    },
    jupiter: {
      sign: jupiter.sign,
      house: jupiter.house,
      strength: jupiter.strength,
      wisdom: jupiter.wisdom
    },
    marriagePeriods: {
      favorable: marriagePeriods.favorable,
      challenging: marriagePeriods.challenging,
      optimal: marriagePeriods.optimal
    },
    cautions: extractRelationshipCautions(analysis)
  };
}

function generateRelationshipSummary(seventhHouse, navamsa) {
  return `Marriage prospects: ${seventhHouse.marriageIndications}. Marital happiness: ${navamsa.maritalHappiness}.`;
}

function extractRelationshipCautions(analysis) {
  return analysis.cautions || [];
}

module.exports = { formatRelationshipAnalysis, formatRelationshipData };
