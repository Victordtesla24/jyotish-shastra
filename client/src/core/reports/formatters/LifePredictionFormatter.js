// Life Predictions Formatter
function formatLifePredictions(predictionsData) {
  const { timeline, transits, lifePhases, recommendations, summary } = predictionsData;

  return {
    html: `
      <div class="life-predictions">
        <h2>Life Predictions</h2>
        <p class="summary">${summary}</p>
        <div class="timeline">
          <h3>Life Timeline</h3>
          <p>Current Period: ${timeline.currentPeriod.planet || 'Unknown'}</p>
          <p>Upcoming Periods: ${timeline.upcomingPeriods.map(p => p.planet).join(', ')}</p>
        </div>
        <div class="transits">
          <h3>Transits</h3>
          <p>Current: ${transits.current.planet || 'None'}</p>
          <p>Upcoming: ${transits.upcoming.map(t => t.planet).join(', ')}</p>
        </div>
      </div>
    `,
    text: `Life Predictions\n\n${summary}\n\nTimeline:\nCurrent Period: ${timeline.currentPeriod.planet || 'Unknown'}\nUpcoming Periods: ${timeline.upcomingPeriods.map(p => p.planet).join(', ')}`
  };
}

// Formats life prediction data for report generation
function formatLifePredictionData(analysis) {
  const { timeline, dashas, transits, highlights } = analysis;

  return {
    timeline: {
      phases: timeline.phases,
      milestones: timeline.milestones,
      cycles: timeline.cycles
    },
    highlights: {
      majorEvents: highlights.majorEvents,
      opportunities: highlights.opportunities,
      challenges: highlights.challenges
    },
    dashas: {
      current: dashas.current,
      sequence: dashas.sequence,
      effects: dashas.effects
    },
    transits: {
      saturn: transits.saturn,
      jupiter: transits.jupiter,
      rahu: transits.rahu,
      ketu: transits.ketu
    },
    summary: generateLifePredictionSummary(timeline, highlights)
  };
}

function generateLifePredictionSummary(timeline, highlights) {
  return `Life phases: ${timeline.phases.length} major periods identified. Key opportunities: ${highlights.opportunities.length}.`;
}

module.exports = { formatLifePredictions, formatLifePredictionData };
