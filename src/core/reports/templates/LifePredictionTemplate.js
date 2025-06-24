// Life Predictions Template based on Section 8F of requirements analysis
function generateLifePredictions(dashaAnalysis, transitAnalysis, majorEvents) {
  const predictions = {
    timeline: {
      currentPeriod: dashaAnalysis.current || {},
      upcomingPeriods: dashaAnalysis.upcoming || [],
      majorEvents: majorEvents || []
    },
    transits: {
      current: transitAnalysis.current || {},
      upcoming: transitAnalysis.upcoming || []
    },
    lifePhases: [],
    recommendations: [],
    summary: ''
  };

  // Generate life predictions summary
  predictions.summary = `You are currently in ${predictions.timeline.currentPeriod.planet || 'Unknown'} dasha. ` +
    `Next major period: ${predictions.timeline.upcomingPeriods[0]?.planet || 'Unknown'}. ` +
    `Major events: ${predictions.timeline.majorEvents.length || 0} predicted.`;

  return predictions;
}

// Template for life predictions section
function renderLifePredictions(data) {
  return {
    title: 'General Life Predictions',
    timeline: data.timeline,
    highlights: data.highlights,
    dashas: data.dashas,
    transits: data.transits,
    summary: data.summary,
  };
}

module.exports = { generateLifePredictions, renderLifePredictions };
