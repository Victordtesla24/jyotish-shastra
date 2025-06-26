/**
 * Raja Yoga Calculator - Detects Kendra-Trikona combinations for success and authority
 *
 * Raja Yogas are formed when lords of Kendra houses (1,4,7,10) combine with
 * lords of Trikona houses (1,5,9) through conjunction, mutual aspect, or exchange.
 * These yogas confer success, authority, and rise in life.
 *
 * Reference: Brihat Parashara Hora Shastra - Chapter on Raja Yogas
 */
class RajaYogaCalculator {
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
   * Detect Raja Yogas (Royal combinations)
   * @param {Object} chart - Birth chart data
   * @returns {Object} Raja yoga analysis
   */
  detectRajaYogas(chart) {
    const yogas = [];
    const { ascendant, planetaryPositions } = chart;
    if (!ascendant || !planetaryPositions) {
      return { hasRajaYoga: false, yogas: [], totalCount: 0, description: "Missing chart data." };
    }
    const lagnaSign = ascendant.sign.toUpperCase();

    const kendraLords = this.getKendraLords(lagnaSign);
    const trikonaLords = this.getTrikonaLords(lagnaSign);

    for (const kendraLord of kendraLords) {
      for (const trikonaLord of trikonaLords) {
        if (kendraLord === trikonaLord) continue;

        const kendraPosition = planetaryPositions[kendraLord.toLowerCase()];
        const trikonaPosition = planetaryPositions[trikonaLord.toLowerCase()];

        if (kendraPosition && trikonaPosition) {
          if (this.areInConjunction(kendraPosition, trikonaPosition)) {
            yogas.push({
              type: 'KENDRA_TRIKONA_CONJUNCTION',
              planets: [kendraLord, trikonaLord],
              house: this.getHouseFromLongitude(kendraPosition.longitude, ascendant.longitude),
              strength: this.calculateYogaStrength([kendraPosition, trikonaPosition]),
              description: `${kendraLord} (lord of a Kendra) conjunct ${trikonaLord} (lord of a Trikona) forming Raja Yoga`,
            });
          }

          if (this.haveMutualAspect(kendraPosition, trikonaPosition)) {
            yogas.push({
              type: 'KENDRA_TRIKONA_ASPECT',
              planets: [kendraLord, trikonaLord],
              houses: [
                this.getHouseFromLongitude(kendraPosition.longitude, ascendant.longitude),
                this.getHouseFromLongitude(trikonaPosition.longitude, ascendant.longitude),
              ],
              strength: this.calculateYogaStrength([kendraPosition, trikonaPosition]) * 0.8,
              description: `${kendraLord} (lord of a Kendra) aspects ${trikonaLord} (lord of a Trikona) forming Raja Yoga through mutual aspect`,
            });
          }

          if (this.isParivartana(kendraPosition, trikonaPosition, kendraLord, trikonaLord)) {
            yogas.push({
              type: 'KENDRA_TRIKONA_PARIVARTANA',
              planets: [kendraLord, trikonaLord],
              houses: [
                this.getHouseFromLongitude(kendraPosition.longitude, ascendant.longitude),
                this.getHouseFromLongitude(trikonaPosition.longitude, ascendant.longitude),
              ],
              strength: this.calculateYogaStrength([kendraPosition, trikonaPosition]) * 1.2,
              description: `${kendraLord} (lord of a Kendra) and ${trikonaLord} (lord of a Trikona) in Parivartana forming powerful Raja Yoga`,
            });
          }
        }
      }
    }

    return {
        hasRajaYoga: yogas.length > 0,
        yogas: yogas,
        totalCount: yogas.length,
        description: yogas.length > 0 ? `${yogas.length} Raja Yoga(s) detected.` : "No significant Raja Yogas detected."
    };
  }

  // Helper Methods
  getKendraLords(lagnaSign) {
    const signs = Object.keys(this.signLords);
    const lagnaIndex = signs.indexOf(lagnaSign);
    const kendraHouses = [1, 4, 7, 10];
    const lords = kendraHouses.map(house => {
      const signIndex = (lagnaIndex + house - 1) % 12;
      return this.signLords[signs[signIndex]];
    });
    return [...new Set(lords)];
  }

  getTrikonaLords(lagnaSign) {
    const signs = Object.keys(this.signLords);
    const lagnaIndex = signs.indexOf(lagnaSign);
    const trikonaHouses = [1, 5, 9];
    const lords = trikonaHouses.map(house => {
      const signIndex = (lagnaIndex + house - 1) % 12;
      return this.signLords[signs[signIndex]];
    });
    return [...new Set(lords)];
  }

  areInConjunction(pos1, pos2) {
    if (!pos1 || !pos2) return false;
    const longitudeDiff = Math.abs(pos1.longitude - pos2.longitude);
    return longitudeDiff <= 8;
  }

  haveMutualAspect(pos1, pos2) {
    if (!pos1 || !pos2) return false;
    const longitudeDiff = Math.abs(pos1.longitude - pos2.longitude);
    const adjustedDiff = longitudeDiff > 180 ? 360 - longitudeDiff : longitudeDiff;
    return Math.abs(adjustedDiff - 180) <= 8;
  }

  isParivartana(pos1, pos2, planet1, planet2) {
    if (!pos1 || !pos2 || !pos1.longitude || !pos2.longitude) return false;
    const planet1OwnSigns = this.getPlanetOwnSigns(planet1);
    const planet2OwnSigns = this.getPlanetOwnSigns(planet2);

    const signOfPos1 = this.getSignFromLongitude(pos1.longitude);
    const signOfPos2 = this.getSignFromLongitude(pos2.longitude);

    const planet1InPlanet2Sign = planet2OwnSigns.includes(signOfPos1);
    const planet2InPlanet1Sign = planet1OwnSigns.includes(signOfPos2);
    return planet1InPlanet2Sign && planet2InPlanet1Sign;
  }

  getPlanetOwnSigns(planet) {
    const ownSigns = {
      Sun: ['LEO'],
      Moon: ['CANCER'],
      Mars: ['ARIES', 'SCORPIO'],
      Mercury: ['GEMINI', 'VIRGO'],
      Jupiter: ['SAGITTARIUS', 'PISCES'],
      Venus: ['TAURUS', 'LIBRA'],
      Saturn: ['CAPRICORN', 'AQUARIUS'],
    };
    return ownSigns[planet] || [];
  }

  getSignFromLongitude(longitude) {
    const signs = ['ARIES', 'TAURUS', 'GEMINI', 'CANCER', 'LEO', 'VIRGO', 'LIBRA', 'SCORPIO', 'SAGITTARIUS', 'CAPRICORN', 'AQUARIUS', 'PISCES'];
    const signIndex = Math.floor(longitude / 30);
    return signs[signIndex];
  }

  getHouseFromLongitude(planetLongitude, ascendantLongitude) {
    const signs = ['ARIES', 'TAURUS', 'GEMINI', 'CANCER', 'LEO', 'VIRGO', 'LIBRA', 'SCORPIO', 'SAGITTARIUS', 'CAPRICORN', 'AQUARIUS', 'PISCES'];
    const ascendantSignIndex = Math.floor(ascendantLongitude / 30);
    const planetSignIndex = Math.floor(planetLongitude / 30);

    // Calculate house number relative to the ascendant's sign
    const houseNumber = (planetSignIndex - ascendantSignIndex + 12) % 12 + 1;
    return houseNumber;
  }

  calculateYogaStrength(planetPositions) {
    let totalStrength = 0;
    for (const position of planetPositions) {
      let planetStrength = 5; // Base strength
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

module.exports = RajaYogaCalculator;
