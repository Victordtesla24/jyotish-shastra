// Career Analysis Formatter
function formatCareerAnalysis(careerData) {
  const { careerIndicators, education, professionalPath, recommendations, summary } = careerData;

  return {
    html: `
      <div class="career-analysis">
        <h2>Career Analysis</h2>
        <p class="summary">${summary}</p>
        <div class="career-indicators">
          <h3>Career Indicators</h3>
          <p>10th House: ${careerIndicators.tenthHouse.sign || 'Unknown'}</p>
          <p>5th House: ${careerIndicators.fifthHouse.sign || 'Unknown'}</p>
        </div>
        <div class="education">
          <h3>Education</h3>
          <p>5th House: ${education.fifthHouse.assessment || 'Good'}</p>
          <p>9th House: ${education.ninthHouse.assessment || 'Good'}</p>
        </div>
      </div>
    `,
    text: `Career Analysis\n\n${summary}\n\nCareer Indicators:\n10th House: ${careerIndicators.tenthHouse.sign || 'Unknown'}\n5th House: ${careerIndicators.fifthHouse.sign || 'Unknown'}`
  };
}

// Formats career analysis data for report generation
function formatCareerData(analysis) {
  const { education, career, tenthHouse, dashas, yogas } = analysis;

  return {
    education: {
      fifthHouse: education.fifthHouse,
      ninthHouse: education.ninthHouse,
      prospects: education.prospects
    },
    career: {
      field: career.field,
      timing: career.timing,
      success: career.success
    },
    tenthHouse: {
      lord: tenthHouse.lord,
      planets: tenthHouse.planets,
      strength: tenthHouse.strength,
      reputation: tenthHouse.reputation
    },
    dashas: {
      current: dashas.current,
      upcoming: dashas.upcoming,
      careerPeriods: dashas.careerPeriods
    },
    yogas: {
      rajaYogas: yogas.rajaYogas,
      careerYogas: yogas.careerYogas
    },
    summary: generateCareerSummary(career, tenthHouse)
  };
}

function generateCareerSummary(career, tenthHouse) {
  return `Career field: ${career.field}. Professional strength: ${tenthHouse.strength}. Success timing: ${career.timing}.`;
}

module.exports = { formatCareerAnalysis, formatCareerData };
