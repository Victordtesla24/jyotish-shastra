/**
 * Dhana Yoga Calculator - Detects wealth combinations for financial prosperity
 *
 * Dhana Yogas are formed when lords of wealth houses (2,5,9,11) combine through
 * conjunction, mutual aspect, or exchange. These yogas indicate financial prosperity.
 *
 * Reference: Classical texts on Dhana Yogas and wealth indicators
 */
class DhanaYogaCalculator {
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
   * Detect Dhana Yogas (Wealth combinations)
   * @param {Object} chart - Birth chart data
   * @returns {Object} Dhana yoga analysis
   */
  detectDhanaYogas(chart) {
    if (!chart.ascendant || !chart.planetaryPositions) {
        return { hasDhanaYoga: false, yogas: [], totalCount: 0, description: "Missing chart data." };
    }

    // Check in order of priority: exchanges first, then benefic placements, then conjunctions
    const exchangeYogas = this._checkExchanges(chart);
    const placementYogas = this._checkBeneficPlacements(chart);
    const conjunctionYogas = this._checkConjunctions(chart);

    const allYogas = [...exchangeYogas, ...placementYogas, ...conjunctionYogas];

    return {
        hasDhanaYoga: allYogas.length > 0,
        yogas: allYogas,
        totalCount: allYogas.length,
        description: allYogas.length > 0 ? `${allYogas.length} Dhana Yoga(s) detected.` : "No significant Dhana Yogas detected."
    };
  }

  _checkConjunctions(chart) {
      const yogas = [];
      const { ascendant, planetaryPositions } = chart;
      const wealthLords = this.getWealthHouseLords(ascendant.sign.toUpperCase());

      for (let i = 0; i < wealthLords.length; i++) {
          for (let j = i + 1; j < wealthLords.length; j++) {
              const lord1 = wealthLords[i];
              const lord2 = wealthLords[j];

              // Ensure different planets to avoid same planet ruling multiple houses
              if (lord1.planet === lord2.planet) continue;

              const position1 = planetaryPositions[lord1.planet.toLowerCase()];
              const position2 = planetaryPositions[lord2.planet.toLowerCase()];

              if (position1 && position2 && this.areInConjunction(position1, position2)) {
                  yogas.push({
                      type: 'WEALTH_LORDS_CONJUNCTION',
                      planets: [lord1.planet, lord2.planet],
                      houses: [lord1.house, lord2.house],
                      location: this.getHouseFromLongitude(position1.longitude, ascendant.longitude),
                      strength: this.calculateYogaStrength([position1, position2]),
                      description: `${lord1.house}th lord ${lord1.planet} conjunct ${lord2.house}th lord ${lord2.planet} forming Dhana Yoga`,
                  });
              }
          }
      }
      return yogas;
  }

  _checkExchanges(chart) {
      const yogas = [];
      const { ascendant, planetaryPositions } = chart;
      const wealthLords = this.getWealthHouseLords(ascendant.sign.toUpperCase());

      for (let i = 0; i < wealthLords.length; i++) {
          for (let j = i + 1; j < wealthLords.length; j++) {
              const lord1 = wealthLords[i];
              const lord2 = wealthLords[j];

              const position1 = planetaryPositions[lord1.planet.toLowerCase()];
              const position2 = planetaryPositions[lord2.planet.toLowerCase()];

              if(position1 && position2) {
                  const house1 = this.getHouseFromLongitude(position1.longitude, ascendant.longitude);
                  const house2 = this.getHouseFromLongitude(position2.longitude, ascendant.longitude);

                  // True exchange: Lord1 in Lord2's house AND Lord2 in Lord1's house
                  if (house1 === lord2.house && house2 === lord1.house) {
                      yogas.push({
                        type: 'WEALTH_LORDS_EXCHANGE',
                        planets: [lord1.planet, lord2.planet],
                        houses: [lord1.house, lord2.house],
                        strength: this.calculateYogaStrength([position1, position2]) * 1.3,
                        description: `${lord1.house}th lord in ${lord2.house}th and ${lord2.house}th lord in ${lord1.house}th forming exchange Dhana Yoga`,
                      });
                  }
              }
          }
      }
      return yogas;
  }

  _checkBeneficPlacements(chart) {
      const yogas = [];
      const { ascendant, planetaryPositions } = chart;
      const wealthHouses = [2, 5, 9, 11];

      for (const house of wealthHouses) {
        const planetsInHouse = this.getPlanetsInHouse(house, planetaryPositions, ascendant);

        // Filter for actual benefic planets only
        const beneficPlanets = planetsInHouse.filter(p => {
          const planetName = p.planet.charAt(0).toUpperCase() + p.planet.slice(1);
          return this.isBeneficPlanet(planetName);
        });

        // Require at least 2 benefic planets for this yoga
        if (beneficPlanets.length >= 2) {
          yogas.push({
            type: 'MULTIPLE_BENEFICS_IN_WEALTH_HOUSE',
            planets: beneficPlanets.map(p => p.planet),
            house: house,
            strength: beneficPlanets.length * 2,
            description: `${beneficPlanets.length} benefic planets (${beneficPlanets.map(p => p.planet).join(', ')}) in ${house}th house forming wealth combination`,
          });
        }
      }
      return yogas;
  }

  // Helper Methods
  getWealthHouseLords(lagnaSign) {
    const signs = Object.keys(this.signLords);
    const lagnaIndex = signs.indexOf(lagnaSign);
    const wealthHouses = [2, 5, 9, 11];
    return wealthHouses.map(house => {
      const signIndex = (lagnaIndex + house - 1) % 12;
      const sign = signs[signIndex];
      return {
        house: house,
        planet: this.signLords[sign],
      };
    });
  }

  getPlanetsInHouse(house, planetaryPositions, ascendant) {
    const planetsInHouse = [];
    for (const [planet, position] of Object.entries(planetaryPositions)) {
      if (this.getHouseFromLongitude(position.longitude, ascendant.longitude) === house) {
        planetsInHouse.push({ planet, position });
      }
    }
    return planetsInHouse;
  }

  isBeneficPlanet(planet) {
    const benefics = ['Jupiter', 'Venus', 'Moon', 'Mercury'];
    return benefics.includes(planet);
  }

  areInConjunction(pos1, pos2) {
    if (!pos1 || !pos2) return false;
    const longitudeDiff = Math.abs(pos1.longitude - pos2.longitude);
    return longitudeDiff <= 8;
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

module.exports = DhanaYogaCalculator;
