/**
 * Panch Mahapurusha Yoga Calculator
 * Implements detection and analysis of the five great personality yogas
 * Based on Mars, Mercury, Jupiter, Venus, Saturn in own/exaltation in Kendra houses
 * From Brihat Parashara Hora Shastra - Creates exceptional personalities
 *
 * Accurate implementation based on classical texts:
 * - Ruchaka Yoga: Mars in Aries, Scorpio, or Capricorn in Kendra
 * - Bhadra Yoga: Mercury in Gemini or Virgo in Kendra
 * - Hamsa Yoga: Jupiter in Sagittarius, Pisces, or Cancer in Kendra
 * - Malavya Yoga: Venus in Taurus, Libra, or Pisces in Kendra
 * - Sasa Yoga: Saturn in Capricorn, Aquarius, or Libra in Kendra
 */
class PanchMahapurushaYogaCalculator {
  /**
   * Detect Panch Mahapurusha Yogas
   * @param {Object} chart - Birth chart data
   * @returns {Object} Panch Mahapurusha yoga analysis
   */
  detectPanchMahapurushaYogas(chart) {
    const yogas = [];
    const { ascendant, planetaryPositions } = chart;
    if (!ascendant || !planetaryPositions) {
        return { hasPanchMahapurushaYoga: false, yogas: [], totalCount: 0, description: "Missing chart data." };
    }

    // Accurate yoga definitions based on classical texts
    const yogaDefinitions = {
      Mars: {
        yoga: 'RUCHAKA',
        validSigns: ['ARIES', 'SCORPIO', 'CAPRICORN'], // Own signs + exaltation
        description: 'Mars in Aries, Scorpio (own signs) or Capricorn (exaltation) in Kendra'
      },
      Mercury: {
        yoga: 'BHADRA',
        validSigns: ['GEMINI', 'VIRGO'], // Own signs (Mercury exalts in Virgo which is also own sign)
        description: 'Mercury in Gemini or Virgo (own signs) in Kendra'
      },
      Jupiter: {
        yoga: 'HAMSA',
        validSigns: ['SAGITTARIUS', 'PISCES', 'CANCER'], // Own signs + exaltation
        description: 'Jupiter in Sagittarius, Pisces (own signs) or Cancer (exaltation) in Kendra'
      },
      Venus: {
        yoga: 'MALAVYA',
        validSigns: ['TAURUS', 'LIBRA', 'PISCES'], // Own signs + exaltation
        description: 'Venus in Taurus, Libra (own signs) or Pisces (exaltation) in Kendra'
      },
      Saturn: {
        yoga: 'SASA',
        validSigns: ['CAPRICORN', 'AQUARIUS', 'LIBRA'], // Own signs + exaltation
        description: 'Saturn in Capricorn, Aquarius (own signs) or Libra (exaltation) in Kendra'
      },
    };

    for (const [planet, definition] of Object.entries(yogaDefinitions)) {
      const position = planetaryPositions[planet.toLowerCase()];
      if (!position) continue;

      const house = this.getHouseFromLongitude(position.longitude, ascendant.longitude);
      const isKendra = [1, 4, 7, 10].includes(house);
      const isValidSign = definition.validSigns.includes(position.sign.toUpperCase());

      if (isKendra && isValidSign) {
        // Determine dignity
        let dignity = 'Own Sign';
        let strengthMultiplier = 1.0;

        // Check if it's exaltation sign
        if ((planet === 'Mars' && position.sign.toUpperCase() === 'CAPRICORN') ||
            (planet === 'Mercury' && position.sign.toUpperCase() === 'VIRGO') ||
            (planet === 'Jupiter' && position.sign.toUpperCase() === 'CANCER') ||
            (planet === 'Venus' && position.sign.toUpperCase() === 'PISCES') ||
            (planet === 'Saturn' && position.sign.toUpperCase() === 'LIBRA')) {
          dignity = 'Exalted';
          strengthMultiplier = 1.3;
        }

        const strength = this.calculateYogaStrength([position]) * strengthMultiplier;

        yogas.push({
          type: 'PANCH_MAHAPURUSHA',
          yoga: definition.yoga,
          planet: planet,
          house: house,
          sign: position.sign,
          dignity: dignity,
          strength: strength,
          description: `${planet} in ${dignity === 'Exalted' ? 'exaltation' : 'own sign'} ${position.sign} in ${house}th house forming ${definition.yoga} Yoga`,
          classicalDescription: definition.description
        });
      }
    }

    return {
        hasPanchMahapurushaYoga: yogas.length > 0,
        yogas: yogas,
        totalCount: yogas.length,
        description: yogas.length > 0 ? `${yogas.length} Panch Mahapurusha Yoga(s) detected.` : "No significant Panch Mahapurusha Yogas detected."
    };
  }

  getHouseFromLongitude(planetLongitude, ascendantLongitude) {
    const diff = (planetLongitude - ascendantLongitude + 360) % 360;
    return Math.floor(diff / 30) + 1;
  }

  calculateYogaStrength(planetPositions) {
    let totalStrength = 0;
    for (const position of planetPositions) {
      let planetStrength = 5;

      // Enhanced strength calculation
      if (position.dignity === 'Exalted') planetStrength += 3;
      else if (position.dignity === 'Own Sign') planetStrength += 2;
      else if (position.dignity === 'Debilitated') planetStrength -= 3;

      if (position.isRetrograde) planetStrength += 1;
      if (position.isCombust) planetStrength -= 2;

      // Additional factors
      if (position.house === 1) planetStrength += 1; // Extra strength in 1st house
      if (position.house === 10) planetStrength += 0.5; // Extra strength in 10th house

      totalStrength += Math.max(1, Math.min(10, planetStrength));
    }
    return totalStrength / planetPositions.length;
  }
}

module.exports = PanchMahapurushaYogaCalculator;
