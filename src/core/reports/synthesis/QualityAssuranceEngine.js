// Quality Assurance Engine - Validates report completeness and consistency
function validateReport(reportData) {
  const validation = {
    passed: true,
    errors: [],
    warnings: [],
    completeness: {}
  };

  // Check required sections
  const requiredSections = ['personality', 'health', 'career', 'financial', 'relationships', 'predictions'];
  for (const section of requiredSections) {
    if (!reportData[section]) {
      validation.errors.push(`Missing required section: ${section}`);
      validation.passed = false;
    } else {
      validation.completeness[section] = 'present';
    }
  }

  // Check data consistency
  if (reportData.personality?.lagna?.sign && reportData.health?.lagna?.sign) {
    if (reportData.personality.lagna.sign !== reportData.health.lagna.sign) {
      validation.warnings.push('Lagna sign inconsistency between personality and health sections');
    }
  }

  // Check for empty or null values
  for (const [section, data] of Object.entries(reportData)) {
    if (data && typeof data === 'object') {
      const emptyFields = findEmptyFields(data);
      if (emptyFields.length > 0) {
        validation.warnings.push(`Empty fields in ${section}: ${emptyFields.join(', ')}`);
      }
    }
  }

  return validation;
}

function findEmptyFields(obj, prefix = '') {
  const empty = [];
  for (const [key, value] of Object.entries(obj)) {
    const fieldPath = prefix ? `${prefix}.${key}` : key;
    if (value === null || value === undefined || value === '') {
      empty.push(fieldPath);
    } else if (typeof value === 'object' && !Array.isArray(value)) {
      empty.push(...findEmptyFields(value, fieldPath));
    }
  }
  return empty;
}

// Validates report quality for completeness, consistency, and accuracy
function validateReportQuality(reportData) {
  const completenessCheck = checkCompleteness(reportData);
  const consistencyCheck = checkConsistency(reportData);
  const accuracyCheck = checkAccuracy(reportData);

  const overallScore = calculateOverallScore(completenessCheck, consistencyCheck, accuracyCheck);
  const issues = [...completenessCheck.issues, ...consistencyCheck.issues, ...accuracyCheck.issues];

  return {
    score: overallScore,
    grade: determineGrade(overallScore),
    completeness: completenessCheck,
    consistency: consistencyCheck,
    accuracy: accuracyCheck,
    issues,
    recommendations: generateRecommendations(issues)
  };
}

function checkCompleteness(reportData) {
  const requiredSections = ['personality', 'health', 'career', 'financial', 'relationship'];
  const missingSections = requiredSections.filter(section => !reportData[section]);
  const incompleteSections = findIncompleteSections(reportData);

  return {
    score: Math.max(0, 100 - (missingSections.length * 20) - (incompleteSections.length * 10)),
    missingSections,
    incompleteSections,
    issues: [
      ...missingSections.map(section => `Missing section: ${section}`),
      ...incompleteSections.map(section => `Incomplete section: ${section}`)
    ]
  };
}

function findIncompleteSections(reportData) {
  const incomplete = [];
  Object.entries(reportData).forEach(([section, data]) => {
    if (typeof data === 'object' && Object.keys(data).length < 2) {
      incomplete.push(section);
    }
  });
  return incomplete;
}

function checkConsistency(reportData) {
  const inconsistencies = [];

  // Check for logical inconsistencies
  if (reportData.health && reportData.career) {
    if (reportData.health.vitality === 'poor' && reportData.career.success === 'excellent') {
      inconsistencies.push('Health and career success may be inconsistent');
    }
  }

  // Check timeline consistency
  if (reportData.lifePrediction && reportData.lifePrediction.timeline) {
    const timelineIssues = validateTimelineConsistency(reportData.lifePrediction.timeline);
    inconsistencies.push(...timelineIssues);
  }

  return {
    score: Math.max(0, 100 - (inconsistencies.length * 15)),
    inconsistencies,
    issues: inconsistencies
  };
}

function validateTimelineConsistency(timeline) {
  const issues = [];
  if (timeline.phases && timeline.phases.length === 0) {
    issues.push('Timeline has no phases defined');
  }
  return issues;
}

function checkAccuracy(reportData) {
  const accuracyIssues = [];

  // Check for unrealistic predictions
  Object.entries(reportData).forEach(([section, data]) => {
    if (typeof data === 'object' && data.summary) {
      if (data.summary.length < 10) {
        accuracyIssues.push(`${section} summary too brief`);
      }
    }
  });

  return {
    score: Math.max(0, 100 - (accuracyIssues.length * 10)),
    issues: accuracyIssues
  };
}

function calculateOverallScore(completeness, consistency, accuracy) {
  return Math.round((completeness.score + consistency.score + accuracy.score) / 3);
}

function determineGrade(score) {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
}

function generateRecommendations(issues) {
  return issues.map(issue => {
    if (issue.includes('Missing section')) {
      return 'Add the missing analysis section';
    }
    if (issue.includes('Incomplete section')) {
      return 'Complete the analysis for this section';
    }
    if (issue.includes('inconsistent')) {
      return 'Review and resolve logical inconsistencies';
    }
    return 'Review and improve this aspect';
  });
}

module.exports = { validateReport, validateReportQuality };
