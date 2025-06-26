/**
 * Neecha Bhanga Yoga Calculator
 * Implements detection and analysis of debilitation cancellation yogas
 * Based on classical rules from Brihat Parashara Hora Shastra
 * Transforms planetary weakness into strength through specific combinations
 */
class NeechaBhangaYogaCalculator {
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
    this.debilitationSigns = {
      Sun: 'LIBRA',
      Moon: 'SCORPIO',
      Mars: 'CANCER',
      Mercury: 'PISCES',
      Jupiter: 'CAPRICORN',
      Venus: 'VIRGO',
      Saturn: 'ARIES',
    };
    this.exaltationSigns = {
        Sun: 'ARIES',
        Moon: 'TAURUS',
        Mars: 'CAPRICORN',
        Mercury: 'VIRGO',
        Jupiter: 'CANCER',
        Venus: 'PISCES',
        Saturn: 'LIBRA',
    }
  }

  /**
   * Detect Neecha Bhanga Yoga (Debilitation cancellation)
   * @param {Object} chart - Birth chart data
   * @returns {Object} Neecha Bhanga yoga analysis
   */
  detectNeechaBhangaYogas(chart) {
    const yogas = [];
    const { ascendant, planetaryPositions } = chart;
    if (!ascendant || !planetaryPositions) {
        return { hasNeechaBhangaYoga: false, yogas: [], totalCount: 0, description: "Missing chart data." };
    }

    for (const [planet, debilSign] of Object.entries(this.debilitationSigns)) {
      const position = planetaryPositions[planet.toLowerCase()];
      if (!position || position.sign.toUpperCase() !== debilSign) continue;

      const cancellationFactors = this.checkNeechaBhangaFactors(planet, position, planetaryPositions, ascendant);

      if (cancellationFactors.length > 0) {
        const house = this.getHouseFromLongitude(position.longitude, ascendant.longitude);
        const strength = cancellationFactors.length * 2;

        yogas.push({
          type: 'NEECHA_BHANGA_YOGA',
          planet: planet,
          debilitationSign: debilSign,
          house: house,
          cancellationFactors: cancellationFactors,
          strength: strength,
          description: `${planet} debilitated in ${debilSign} but forming Neecha Bhanga due to ${cancellationFactors.join(', ')}`,
        });
      }
    }

    return {
        hasNeechaBhangaYoga: yogas.length > 0,
        yogas: yogas,
        totalCount: yogas.length,
        description: yogas.length > 0 ? `${yogas.length} Neecha Bhanga Yoga(s) detected.` : "No significant Neecha Bhanga Yogas detected."
    };
  }

  checkNeechaBhangaFactors(planet, position, planetaryPositions, ascendant) {
    const factors = [];
    const house = this.getHouseFromLongitude(position.longitude, ascendant.longitude);

    const dispositor = this.signLords[position.sign.toUpperCase()];
    const dispositorPos = planetaryPositions[dispositor.toLowerCase()];
    if (dispositorPos) {
      const dispositorHouse = this.getHouseFromLongitude(dispositorPos.longitude, ascendant.longitude);
      if ([1, 4, 7, 10].includes(dispositorHouse)) {
        factors.push('Dispositor in Kendra');
      }
    }

    if ([1, 4, 7, 10].includes(house)) {
      factors.push('Debilitated planet in Kendra');
    }

    const exaltationSign = this.exaltationSigns[planet];
    if (exaltationSign) {
      const exaltationLord = this.signLords[exaltationSign];
      const exaltationLordPos = planetaryPositions[exaltationLord.toLowerCase()];
      if (exaltationLordPos) {
        const exaltationLordHouse = this.getHouseFromLongitude(exaltationLordPos.longitude, ascendant.longitude);
        if ([1, 4, 7, 10].includes(exaltationLordHouse)) {
          factors.push('Exaltation lord in Kendra');
        }
      }
    }

    return factors;
  }

  getHouseFromLongitude(planetLongitude, ascendantLongitude) {
    const diff = (planetLongitude - ascendantLongitude + 360) % 360;
    return Math.floor(diff / 30) + 1;
  }
}

module.exports = NeechaBhangaYogaCalculator;
