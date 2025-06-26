// Career Analysis Template based on Section 8C of requirements analysis
function generateCareerAnalysis(tenthHouse, fifthHouse, ninthHouse, dashaAnalysis) {
  const career = {
    careerIndicators: {
      tenthHouse: tenthHouse || {},
      fifthHouse: fifthHouse || {},
      ninthHouse: ninthHouse || {}
    },
    education: {
      fifthHouse: fifthHouse.education || {},
      ninthHouse: ninthHouse.higherLearning || {}
    },
    professionalPath: {
      currentDasha: dashaAnalysis.current || {},
      upcomingDashas: dashaAnalysis.upcoming || []
    },
    recommendations: [],
    summary: ''
  };

  // Generate career summary
  career.summary = `Your career is influenced by ${tenthHouse.sign} in the 10th house. ` +
    `Education potential: ${career.education.fifthHouse.assessment || 'Good'}. ` +
    `Current period: ${career.professionalPath.currentDasha.period || 'Unknown'}.`;

  return career;
}

// Template for career analysis section
function renderCareerAnalysis(data) {
  return {
    title: 'Education and Career Analysis',
    education: data.education,
    career: data.career,
    tenthHouse: data.tenthHouse,
    dashas: data.dashas,
    yogas: data.yogas,
    summary: data.summary,
  };
}

module.exports = { generateCareerAnalysis, renderCareerAnalysis };
