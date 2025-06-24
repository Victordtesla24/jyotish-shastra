// Personality Profile Formatter
function formatPersonalityProfile(profileData) {
  const { coreTraits, publicImage, strengths, weaknesses, summary } = profileData;

  return {
    html: `
      <div class="personality-profile">
        <h2>Personality Profile</h2>
        <p class="summary">${summary}</p>
        <div class="core-traits">
          <h3>Core Traits</h3>
          <ul>
            ${coreTraits.lagnaTraits.map(trait => `<li>${trait}</li>`).join('')}
            ${coreTraits.moonTraits.map(trait => `<li>${trait}</li>`).join('')}
            ${coreTraits.sunTraits.map(trait => `<li>${trait}</li>`).join('')}
          </ul>
        </div>
        <div class="public-image">
          <h3>Public Image</h3>
          <p>${publicImage.arudhaTraits.join(', ')}</p>
          <p>Image vs Reality: ${publicImage.imageVsReality}</p>
        </div>
      </div>
    `,
    text: `Personality Profile\n\n${summary}\n\nCore Traits:\n${coreTraits.lagnaTraits.join('\n')}\n\nPublic Image:\n${publicImage.arudhaTraits.join(', ')}`
  };
}

// Formats personality analysis data for report generation
function formatPersonalityData(analysis) {
  const { lagna, moon, sun, arudha } = analysis;

  return {
    summary: generatePersonalitySummary(lagna, moon, sun),
    lagna: {
      sign: lagna.sign,
      lord: lagna.lord,
      strength: lagna.strength,
      description: lagna.description
    },
    moon: {
      sign: moon.sign,
      house: moon.house,
      nakshatra: moon.nakshatra,
      mentalCharacter: moon.mentalCharacter
    },
    sun: {
      sign: sun.sign,
      house: sun.house,
      soulPurpose: sun.soulPurpose,
      egoTraits: sun.egoTraits
    },
    arudha: {
      sign: arudha.sign,
      publicImage: arudha.publicImage,
      contrast: arudha.contrast
    },
    highlights: extractPersonalityHighlights(analysis)
  };
}

function generatePersonalitySummary(lagna, moon, sun) {
  return `Core personality: ${lagna.description}. Mental nature: ${moon.mentalCharacter}. Life purpose: ${sun.soulPurpose}.`;
}

function extractPersonalityHighlights(analysis) {
  return analysis.highlights || [];
}

module.exports = { formatPersonalityProfile, formatPersonalityData };
