// Analysis Synthesis Engine - Combines all analysis results
function synthesizeAnalysis(allAnalyses) {
  const {
    lagnaAnalysis,
    houseAnalysis,
    aspectAnalysis,
    dashaAnalysis,
    navamsaAnalysis,
    arudhaAnalysis,
    yogaAnalysis,
    luminariesAnalysis
  } = allAnalyses;

  const synthesis = {
    personality: {
      lagna: lagnaAnalysis,
      moon: luminariesAnalysis?.moon,
      sun: luminariesAnalysis?.sun,
      arudha: arudhaAnalysis
    },
    health: {
      lagna: lagnaAnalysis,
      houses: houseAnalysis,
      planets: luminariesAnalysis
    },
    career: {
      tenthHouse: houseAnalysis?.tenth,
      fifthHouse: houseAnalysis?.fifth,
      ninthHouse: houseAnalysis?.ninth,
      dasha: dashaAnalysis
    },
    financial: {
      secondHouse: houseAnalysis?.second,
      eleventhHouse: houseAnalysis?.eleventh,
      wealthYogas: yogaAnalysis?.wealthYogas,
      dasha: dashaAnalysis
    },
    relationships: {
      seventhHouse: houseAnalysis?.seventh,
      navamsa: navamsaAnalysis,
      venus: luminariesAnalysis?.venus,
      dasha: dashaAnalysis
    },
    predictions: {
      dasha: dashaAnalysis,
      transits: aspectAnalysis?.transits,
      majorEvents: []
    }
  };

  return synthesis;
}

// Synthesizes multiple analysis results into comprehensive report data
function synthesizeAnalyses(analyses) {
  const { personality, health, career, financial, relationship, lifePrediction } = analyses;

  return {
    overview: generateOverview(analyses),
    personality: personality || {},
    health: health || {},
    career: career || {},
    financial: financial || {},
    relationship: relationship || {},
    lifePrediction: lifePrediction || {},
    crossReferences: findCrossReferences(analyses),
    priorities: rankPriorities(analyses)
  };
}

function generateOverview(analyses) {
  const strengths = extractStrengths(analyses);
  const challenges = extractChallenges(analyses);

  return {
    summary: `Analysis covers ${Object.keys(analyses).length} life areas.`,
    strengths,
    challenges,
    keyThemes: identifyKeyThemes(analyses)
  };
}

function extractStrengths(analyses) {
  const strengths = [];
  Object.values(analyses).forEach(analysis => {
    if (analysis.strengths) strengths.push(...analysis.strengths);
  });
  return strengths;
}

function extractChallenges(analyses) {
  const challenges = [];
  Object.values(analyses).forEach(analysis => {
    if (analysis.challenges) challenges.push(...analysis.challenges);
  });
  return challenges;
}

function findCrossReferences(analyses) {
  return {
    careerHealth: findCareerHealthConnections(analyses.career, analyses.health),
    relationshipCareer: findRelationshipCareerConnections(analyses.relationship, analyses.career),
    financialCareer: findFinancialCareerConnections(analyses.financial, analyses.career)
  };
}

function findCareerHealthConnections(career, health) {
  return career && health ? { connected: true, notes: 'Career stress may affect health' } : {};
}

function findRelationshipCareerConnections(relationship, career) {
  return relationship && career ? { connected: true, notes: 'Partnership may influence career' } : {};
}

function findFinancialCareerConnections(financial, career) {
  return financial && career ? { connected: true, notes: 'Career directly impacts finances' } : {};
}

function rankPriorities(analyses) {
  return Object.keys(analyses).map(area => ({ area, priority: 'medium' }));
}

function identifyKeyThemes(analyses) {
  return ['spiritual growth', 'material success', 'relationships'];
}

module.exports = { synthesizeAnalysis, synthesizeAnalyses };
