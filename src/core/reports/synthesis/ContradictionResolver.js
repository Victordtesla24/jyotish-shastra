// Resolves contradictions between different analysis results
function resolveContradictions(synthesizedData) {
  const contradictions = identifyContradictions(synthesizedData);
  const resolutions = resolveIdentifiedContradictions(contradictions, synthesizedData);

  return {
    contradictions,
    resolutions,
    resolvedData: applyResolutions(synthesizedData, resolutions)
  };
}

function identifyContradictions(data) {
  const contradictions = [];

  // Check for health vs career contradictions
  if (data.health.vitality === 'low' && data.career.success === 'high') {
    contradictions.push({
      type: 'health-career',
      description: 'Low vitality conflicts with high career success',
      severity: 'medium'
    });
  }

  // Check for financial vs relationship contradictions
  if (data.financial.wealth === 'low' && data.relationship.marriageProspects === 'excellent') {
    contradictions.push({
      type: 'financial-relationship',
      description: 'Low wealth may affect marriage prospects',
      severity: 'low'
    });
  }

  return contradictions;
}

function resolveIdentifiedContradictions(contradictions, data) {
  return contradictions.map(contradiction => {
    switch (contradiction.type) {
      case 'health-career':
        return {
          type: contradiction.type,
          resolution: 'Career success may come at health cost - balance needed',
          recommendation: 'Focus on health during career peaks'
        };
      case 'financial-relationship':
        return {
          type: contradiction.type,
          resolution: 'Financial growth through partnership possible',
          recommendation: 'Consider joint ventures or business partnerships'
        };
      default:
        return {
          type: contradiction.type,
          resolution: 'Further analysis needed',
          recommendation: 'Consult expert for detailed interpretation'
        };
    }
  });
}

function applyResolutions(data, resolutions) {
  const resolvedData = { ...data };

  resolutions.forEach(resolution => {
    if (!resolvedData.notes) resolvedData.notes = [];
    resolvedData.notes.push(resolution.resolution);
  });

  return resolvedData;
}

module.exports = { resolveContradictions };
