/**
 * Gaja Kesari Yoga Calculator - Detects Jupiter-Moon relationships for fame and wisdom
 *
 * Gaja Kesari Yoga is formed when Jupiter is in a kendra (1st, 4th, 7th, or 10th house)
 * FROM THE MOON (not from lagna). This yoga grants fame, wisdom, and overall prosperity.
 *
 * Reference: Brihat Parashara Hora Shastra and classical Vedic astrology texts
 */
class GajaKesariYogaCalculator {
  /**
   * Detect Gaja Kesari Yoga
   * @param {Object} chart - Birth chart data
   * @returns {Object} Gaja Kesari yoga analysis
   */
  detectGajaKesariYoga(chart) {
    // Handle different chart structures
    let jupiterPos, moonPos;

    if (chart.planetaryPositions) {
      // Structure 1: planetaryPositions object
      jupiterPos = chart.planetaryPositions.jupiter;
      moonPos = chart.planetaryPositions.moon;
    } else if (chart.planets) {
      // Structure 2: planets array
      jupiterPos = chart.planets.find(p => p.name.toLowerCase() === 'jupiter');
      moonPos = chart.planets.find(p => p.name.toLowerCase() === 'moon');
    }

    if (!jupiterPos || !moonPos) {
      return { hasGajaKesariYoga: false, description: "Missing Jupiter or Moon position." };
    }

    // Calculate the house distance from Moon to Jupiter
    const houseDistanceFromMoon = this.calculateHouseDistance(moonPos.longitude, jupiterPos.longitude);

    // Kendra houses from Moon: 1st, 4th, 7th, 10th
    const kendraHouses = [1, 4, 7, 10];
    const isJupiterInKendraFromMoon = kendraHouses.includes(houseDistanceFromMoon);

    if (isJupiterInKendraFromMoon) {
      const ascendantLongitude = chart.ascendant ? chart.ascendant.longitude : 0;
      const jupiterHouse = this.getHouseFromLongitude(jupiterPos.longitude, ascendantLongitude);
      const moonHouse = this.getHouseFromLongitude(moonPos.longitude, ascendantLongitude);
      const strength = this.calculateYogaStrength([jupiterPos, moonPos]);

      let strengthMultiplier = 1.0;
      if (jupiterPos.dignity === 'Exalted') strengthMultiplier += 0.5;
      if (moonPos.dignity === 'Exalted') strengthMultiplier += 0.3;
      if (jupiterPos.dignity === 'Own Sign') strengthMultiplier += 0.3;
      if (moonPos.dignity === 'Own Sign') strengthMultiplier += 0.2;

      return {
        hasGajaKesariYoga: true,
        type: 'GAJA_KESARI_YOGA',
        planets: ['Jupiter', 'Moon'],
        jupiterHouse: jupiterHouse,
        moonHouse: moonHouse,
        houseDistanceFromMoon: houseDistanceFromMoon,
        strength: strength * strengthMultiplier,
        description: `Jupiter in ${this.getOrdinal(houseDistanceFromMoon)} house from Moon forming Gaja Kesari Yoga. Jupiter in ${jupiterHouse}th house, Moon in ${moonHouse}th house`,
        effect: this.getGajaKesariYogaEffect(houseDistanceFromMoon, jupiterPos, moonPos)
      };
    }

    return {
      hasGajaKesariYoga: false,
      description: `Jupiter is in ${this.getOrdinal(houseDistanceFromMoon)} house from Moon (not in kendra). Gaja Kesari Yoga requires Jupiter in 1st, 4th, 7th, or 10th from Moon.`
    };
  }

  /**
   * Calculate house distance from one planet to another
   * @param {number} fromLongitude - Starting longitude (Moon)
   * @param {number} toLongitude - Target longitude (Jupiter)
   * @returns {number} House number (1-12)
   */
  calculateHouseDistance(fromLongitude, toLongitude) {
    const diff = (toLongitude - fromLongitude + 360) % 360;
    return Math.floor(diff / 30) + 1;
  }

  /**
   * Calculate house from longitude and ascendant
   * @param {number} planetLongitude - Planet longitude
   * @param {number} ascendantLongitude - Ascendant longitude
   * @returns {number} House number (1-12)
   */
  getHouseFromLongitude(planetLongitude, ascendantLongitude) {
    const diff = (planetLongitude - ascendantLongitude + 360) % 360;
    return Math.floor(diff / 30) + 1;
  }

  /**
   * Calculate yoga strength based on planetary positions
   * @param {Array} planetPositions - Array of planet position objects
   * @returns {number} Yoga strength (1-10)
   */
  calculateYogaStrength(planetPositions) {
    let totalStrength = 0;
    for (const position of planetPositions) {
      let planetStrength = 5; // Base strength

      // Dignity modifications
      if (position.dignity === 'Exalted') planetStrength += 3;
      else if (position.dignity === 'Own Sign') planetStrength += 2;
      else if (position.dignity === 'Debilitated') planetStrength -= 2;

      // Other factors
      if (position.isRetrograde) planetStrength += 1;
      if (position.isCombust) planetStrength -= 2;

      totalStrength += Math.max(1, Math.min(10, planetStrength));
    }
    return totalStrength / planetPositions.length;
  }

  /**
   * Get ordinal representation of number
   * @param {number} num - Number to convert
   * @returns {string} Ordinal string
   */
  getOrdinal(num) {
    const suffixes = ['th', 'st', 'nd', 'rd'];
    const mod100 = num % 100;
    return num + (suffixes[(mod100 - 20) % 10] || suffixes[mod100] || suffixes[0]);
  }

  /**
   * Get specific effects of Gaja Kesari Yoga based on house position
   * @param {number} houseFromMoon - House distance from Moon
   * @param {Object} jupiterPos - Jupiter position
   * @param {Object} moonPos - Moon position
   * @returns {string} Specific effects
   */
  getGajaKesariYogaEffect(houseFromMoon, jupiterPos, moonPos) {
    const effects = {
      1: 'Strong personality, wisdom, good health, leadership qualities',
      4: 'Happiness, good education, landed property, vehicles, maternal blessings',
      7: 'Good spouse, successful partnerships, business acumen, public recognition',
      10: 'Career success, fame, authority, government favor, high status'
    };

    let baseEffect = effects[houseFromMoon] || 'General prosperity and wisdom';

    // Add dignity-based modifications
    if (jupiterPos.dignity === 'Exalted') {
      baseEffect += '. Enhanced due to exalted Jupiter';
    }
    if (moonPos.dignity === 'Exalted') {
      baseEffect += '. Amplified due to exalted Moon';
    }

    return baseEffect;
  }
}

export default GajaKesariYogaCalculator;
