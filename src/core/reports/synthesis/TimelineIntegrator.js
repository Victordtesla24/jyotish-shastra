// Timeline Integrator - Integrates dasha and transit data
function integrateTimeline(dashaData, transitData) {
  const timeline = {
    current: {
      dasha: dashaData?.current || {},
      transit: transitData?.current || {}
    },
    upcoming: [],
    majorEvents: []
  };

  // Integrate upcoming periods
  if (dashaData?.upcoming) {
    timeline.upcoming = dashaData.upcoming.map(dasha => ({
      type: 'dasha',
      planet: dasha.planet,
      startDate: dasha.startDate,
      endDate: dasha.endDate,
      description: dasha.description
    }));
  }

  if (transitData?.upcoming) {
    timeline.upcoming.push(...transitData.upcoming.map(transit => ({
      type: 'transit',
      planet: transit.planet,
      startDate: transit.startDate,
      endDate: transit.endDate,
      description: transit.description
    })));
  }

  // Sort by start date
  timeline.upcoming.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));

  return timeline;
}

// Integrates dasha and transit timelines for comprehensive timing predictions
function integrateTimelines(dashaData, transitData) {
  const integratedTimeline = mergeTimelines(dashaData, transitData);
  const keyPeriods = identifyKeyPeriods(integratedTimeline);
  const recommendations = generateTimingRecommendations(keyPeriods);

  return {
    timeline: integratedTimeline,
    keyPeriods,
    recommendations,
    summary: generateTimelineSummary(keyPeriods)
  };
}

function mergeTimelines(dashaData, transitData) {
  const timeline = [];

  // Add dasha periods
  if (dashaData && dashaData.periods) {
    dashaData.periods.forEach(period => {
      timeline.push({
        type: 'dasha',
        period: period.period,
        startDate: period.startDate,
        endDate: period.endDate,
        planet: period.planet,
        effects: period.effects
      });
    });
  }

  // Add major transits
  if (transitData && transitData.transits) {
    transitData.transits.forEach(transit => {
      timeline.push({
        type: 'transit',
        period: transit.period,
        startDate: transit.startDate,
        endDate: transit.endDate,
        planet: transit.planet,
        effects: transit.effects
      });
    });
  }

  return timeline.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
}

function identifyKeyPeriods(timeline) {
  return timeline.filter(period => {
    // Identify periods with significant effects
    return period.effects && (
      period.effects.includes('major') ||
      period.effects.includes('transformation') ||
      period.effects.includes('opportunity')
    );
  });
}

function generateTimingRecommendations(keyPeriods) {
  return keyPeriods.map(period => ({
    period: period.period,
    recommendation: generatePeriodRecommendation(period),
    timing: period.startDate,
    focus: determineFocus(period.effects)
  }));
}

function generatePeriodRecommendation(period) {
  if (period.effects.includes('opportunity')) {
    return `Favorable period for new initiatives during ${period.period}`;
  }
  if (period.effects.includes('transformation')) {
    return `Period of significant change during ${period.period}`;
  }
  return `Important period requiring attention during ${period.period}`;
}

function determineFocus(effects) {
  if (effects.includes('career')) return 'Professional growth';
  if (effects.includes('relationship')) return 'Personal relationships';
  if (effects.includes('health')) return 'Health and wellness';
  if (effects.includes('spiritual')) return 'Spiritual development';
  return 'General life areas';
}

function generateTimelineSummary(keyPeriods) {
  return `${keyPeriods.length} significant periods identified in the timeline.`;
}

module.exports = { integrateTimeline, integrateTimelines };
