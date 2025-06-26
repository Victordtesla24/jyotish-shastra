/**
 * Viparita Raja Yoga Calculator
 * Implements detection and analysis of Viparita Raja Yogas
 * Based on dusthana lord exchanges (6th, 8th, 12th house lords in each other's houses)
 * From Brihat Parashara Hora Shastra - "Paradoxical gains from adversity"
 */
class ViparitaRajaYogaCalculator {
  constructor() {
    this.signLords = {
      ARIES: 'Mars',
      TAURUS: 'Venus',
      GEMINI: 'Mercury',
      CANCER: 'Moon',
      LEO: 'Sun',
      VIRGO: 'Mercury',
      LIBRA: 'Venus',
      SCORPIO: 'Mars',
      SAGITTARIUS: 'Jupiter',
      CAPRICORN: 'Saturn',
      AQUARIUS: 'Saturn',
      PISCES: 'Jupiter',
    };
  }

  /**
   * Detect Viparita Raja Yoga
   * @param {Object} chart - Birth chart data
   * @returns {Object} Viparita Raja yoga analysis
   */
  detectViparitaRajaYogas(chart) {
    const yogas = [];
    const { ascendant, planetaryPositions } = chart;
    if (!ascendant || !planetaryPositions) {
        return { hasViparitaRajaYoga: false, yogas: [], totalCount: 0, description: "Missing chart data." };
    }
    const lagnaSign = ascendant.sign.toUpperCase();

    const dusthanaLords = this.getDusthanaLords(lagnaSign);

    for (let i = 0; i < dusthanaLords.length; i++) {
      for (let j = i + 1; j < dusthanaLords.length; j++) {
        const lord1 = dusthanaLords[i];
        const lord2 = dusthanaLords[j];

        const position1 = planetaryPositions[lord1.planet.toLowerCase()];
        const position2 = planetaryPositions[lord2.planet.toLowerCase()];

        if (position1 && position2) {
          const house1 = this.getHouseFromLongitude(position1.longitude, ascendant.longitude);
          const house2 = this.getHouseFromLongitude(position2.longitude, ascendant.longitude);

          if (house1 === lord2.house && house2 === lord1.house) {
            yogas.push({
              type: 'VIPARITA_RAJA_YOGA',
              subType: this.getViparitaSubType(lord1.house, lord2.house),
              planets: [lord1.planet, lord2.planet],
              houses: [lord1.house, lord2.house],
              strength: this.calculateYogaStrength([position1, position2]),
              description: `${lord1.house}th lord in ${lord2.house}th and ${lord2.house}th lord in ${lord1.house}th forming Viparita Raja Yoga`,
            });
          }
        }
      }
    }

    return {
        hasViparitaRajaYoga: yogas.length > 0,
        yogas: yogas,
        totalCount: yogas.length,
        description: yogas.length > 0 ? `${yogas.length} Viparita Raja Yoga(s) detected.` : "No significant Viparita Raja Yogas detected."
    };
  }

  // Helper Methods
  getDusthanaLords(lagnaSign) {
    const signs = Object.keys(this.signLords);
    const lagnaIndex = signs.indexOf(lagnaSign);
    const dusthanaHouses = [6, 8, 12];
    return dusthanaHouses.map(house => {
      const signIndex = (lagnaIndex + house - 1) % 12;
      const sign = signs[signIndex];
      return {
        house: house,
        planet: this.signLords[sign],
      };
    });
  }

  getViparitaSubType(house1, house2) {
    const combination = [house1, house2].sort((a, b) => a - b).join('-');
    const subTypes = {
      '6-8': 'Harsha Yoga',
      '6-12': 'Sarala Yoga',
      '8-12': 'Vimala Yoga',
    };
    return subTypes[combination] || 'General Viparita';
  }

  getHouseFromLongitude(planetLongitude, ascendantLongitude) {
    const diff = (planetLongitude - ascendantLongitude + 360) % 360;
    return Math.floor(diff / 30) + 1;
  }

  calculateYogaStrength(planetPositions) {
    let totalStrength = 0;
    for (const position of planetPositions) {
      let planetStrength = 5;
      if (position.dignity === 'Exalted') planetStrength += 3;
      else if (position.dignity === 'Own Sign') planetStrength += 2;
      else if (position.dignity === 'Debilitated') planetStrength -= 2;
      if (position.isRetrograde) planetStrength += 1;
      if (position.isCombust) planetStrength -= 2;
      totalStrength += Math.max(1, Math.min(10, planetStrength));
    }
    return totalStrength / planetPositions.length;
  }
}

module.exports = ViparitaRajaYogaCalculator;
