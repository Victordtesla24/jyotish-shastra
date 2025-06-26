// Priority Ranker - Ranks analysis results by importance
function rankAnalysisPriorities(synthesis) {
  const priorities = {
    critical: [],
    high: [],
    medium: [],
    low: []
  };

  // Critical priorities
  if (synthesis.personality.lagna.strength === 'Weak') {
    priorities.critical.push('Lagna strength needs attention');
  }
  if (synthesis.health.houses.sixth?.afflictions?.length > 0) {
    priorities.critical.push('Health concerns detected');
  }

  // High priorities
  if (synthesis.career.tenthHouse?.lord?.condition === 'debilitated') {
    priorities.high.push('Career challenges indicated');
  }
  if (synthesis.financial.wealthYogas?.length === 0) {
    priorities.high.push('Limited wealth yogas');
  }

  // Medium priorities
  if (synthesis.relationships.seventhHouse?.lord?.placement === 'dusthana') {
    priorities.medium.push('Relationship timing may be delayed');
  }

  // Low priorities
  if (synthesis.predictions.dasha?.upcoming?.length > 0) {
    priorities.low.push('Future periods to consider');
  }

  return priorities;
}

module.exports = { rankAnalysisPriorities };
