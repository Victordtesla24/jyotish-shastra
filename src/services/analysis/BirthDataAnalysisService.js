/**
 * Birth Data Analysis Service
 * Systematically analyzes birth data and answers questions from Section 1:
 * "Birth Data Collection and Chart Casting"
 */

import swisseph from 'swisseph';
import moment from 'moment';
import { getSign, getSignName } from '../../utils/helpers/astrologyHelpers.js';

class BirthDataAnalysisService {
  constructor() {
    this.signs = [
      'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
      'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
    ];

    this.planets = {
      'Sun': 'Surya',
      'Moon': 'Chandra',
      'Mars': 'Mangal',
      'Mercury': 'Budh',
      'Jupiter': 'Guru',
      'Venus': 'Shukra',
      'Saturn': 'Shani',
      'Rahu': 'Rahu',
      'Ketu': 'Ketu'
    };

    this.nakshatras = [
      'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra', 'Punarvasu', 'Pushya', 'Ashlesha',
      'Magha', 'Purva Phalguni', 'Uttara Phalguni', 'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha',
      'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha', 'Purva Bhadrapada',
      'Uttara Bhadrapada', 'Revati'
    ];

    this.dashaPeriods = {
      Ketu: 7,
      Venus: 20,
      Sun: 6,
      Moon: 10,
      Mars: 7,
      Rahu: 18,
      Jupiter: 16,
      Saturn: 19,
      Mercury: 17
    };
  }

  /**
   * Question 1: Birth Details Analysis
   * Have you gathered the exact birth date, time, and place (latitude/longitude) of the individual?
   */
  analyzeBirthDetails(birthData) {
    const analysis = {
      question: "Have you gathered the exact birth date, time, and place (latitude/longitude) of the individual?",
      answer: "",
      details: {},
      completeness: 0,
      missing: []
    };

    // Check birth date
    if (birthData.dateOfBirth) {
      analysis.details.dateOfBirth = {
        value: birthData.dateOfBirth,
        status: 'present',
        precision: 'exact'
      };
    } else {
      analysis.missing.push('Date of Birth');
    }

    // Check birth time
    if (birthData.timeOfBirth) {
      analysis.details.timeOfBirth = {
        value: birthData.timeOfBirth,
        status: 'present',
        precision: 'exact'
      };
    } else {
      analysis.missing.push('Time of Birth');
    }

    // Check location data
    const hasCoordinates = birthData.latitude && birthData.longitude;
    const hasPlace = birthData.placeOfBirth || (birthData.city && birthData.country);

    if (hasCoordinates) {
      analysis.details.coordinates = {
        latitude: birthData.latitude,
        longitude: birthData.longitude,
        status: 'present',
        precision: 'exact',
        source: birthData.geocodingInfo?.service || 'user_provided'
      };
    } else if (hasPlace) {
      analysis.details.place = {
        placeOfBirth: birthData.placeOfBirth,
        city: birthData.city,
        state: birthData.state,
        country: birthData.country,
        status: 'present',
        precision: 'approximate',
        geocodingRequired: true
      };
    } else {
      analysis.missing.push('Location (place or coordinates)');
    }

    // Calculate completeness
    const totalRequired = 3; // date, time, location
    const present = [birthData.dateOfBirth, birthData.timeOfBirth, (hasCoordinates || hasPlace)].filter(Boolean).length;
    analysis.completeness = (present / totalRequired) * 100;

    // Generate answer
    if (analysis.completeness === 100) {
      analysis.answer = "Yes, all critical birth details have been gathered: exact birth date, time, and precise location coordinates. This data allows for accurate calculation of the Ascendant and planetary positions.";
    } else {
      analysis.answer = `Partially. Missing: ${analysis.missing.join(', ')}. Complete birth data is essential for accurate astrological calculations.`;
    }

    return analysis;
  }

  /**
   * Question 2: Chart Generation Analysis
   * Can you cast the Vedic birth chart (Kundli) with Rasi (D1) and Navamsa (D9) charts?
   */
  analyzeChartGeneration(rasiChart, navamsaChart) {
    const analysis = {
      question: "Can you cast the Vedic birth chart (Kundli) with Rasi (D1) and Navamsa (D9) charts?",
      answer: "",
      details: {},
      chartsGenerated: [],
      status: 'complete'
    };

    // Check Rasi chart
    if (rasiChart && rasiChart.ascendant && rasiChart.planetaryPositions) {
      analysis.details.rasiChart = {
        status: 'generated',
        ascendant: rasiChart.ascendant,
        planetaryCount: Object.keys(rasiChart.planetaryPositions).length,
        housesCalculated: true
      };
      analysis.chartsGenerated.push('Rasi (D1)');
    } else {
      analysis.details.rasiChart = { status: 'missing' };
      analysis.status = 'incomplete';
    }

    // Check Navamsa chart
    if (navamsaChart && navamsaChart.ascendant && navamsaChart.planetaryPositions) {
      analysis.details.navamsaChart = {
        status: 'generated',
        ascendant: navamsaChart.ascendant,
        planetaryCount: Object.keys(navamsaChart.planetaryPositions).length,
        housesCalculated: true
      };
      analysis.chartsGenerated.push('Navamsa (D9)');
    } else {
      analysis.details.navamsaChart = { status: 'missing' };
      analysis.status = 'incomplete';
    }

    // Generate answer
    if (analysis.status === 'complete') {
      analysis.answer = `Yes, both essential charts have been successfully generated: ${analysis.chartsGenerated.join(' and ')}. The Rasi chart shows planetary positions in the 12 signs/houses at birth, while the Navamsa chart provides finer detail for marriage and destiny analysis.`;
    } else {
      analysis.answer = "Partially. Some charts could not be generated due to insufficient data or calculation errors.";
    }

    return analysis;
  }

  /**
   * Question 3: Ascendant Calculation Analysis
   * What is the Ascendant (Lagna) at birth?
   */
  analyzeAscendant(rasiChart) {
    const analysis = {
      question: "What is the Ascendant (Lagna) at birth?",
      answer: "",
      details: {},
      lagnaSign: null,
      lagnaDegree: null
    };

    if (rasiChart && rasiChart.ascendant) {
      const ascendant = rasiChart.ascendant;
      analysis.details.ascendant = {
        sign: ascendant.sign,
        degree: ascendant.degree,
        longitude: ascendant.longitude,
        house: 1,
        significance: 'Sets House 1 and anchors the entire house structure'
      };

      analysis.lagnaSign = ascendant.sign;
      analysis.lagnaDegree = ascendant.degree;

      analysis.answer = `The Ascendant (Lagna) is ${ascendant.sign} at ${ascendant.degree.toFixed(2)}°. This sign was rising on the eastern horizon at the birth time/location, setting House 1 of the chart and anchoring the entire house structure.`;
    } else {
      analysis.answer = "Ascendant could not be calculated due to insufficient birth data or calculation errors.";
    }

    return analysis;
  }

  /**
   * Question 4: Planetary Positions Analysis
   * Which signs and houses are each of the nine planets in at birth?
   */
  analyzePlanetaryPositions(rasiChart) {
    const analysis = {
      question: "Which signs and houses are each of the nine planets in at birth?",
      answer: "",
      details: {},
      planetaryPositions: {},
      missingPlanets: []
    };

    if (rasiChart && rasiChart.planetaryPositions) {
      const positions = rasiChart.planetaryPositions;
      const housePositions = rasiChart.housePositions || {};

      for (const [planet, position] of Object.entries(positions)) {
        const houseNumber = this.calculateHouseNumber(position.longitude, rasiChart.ascendant.longitude);

        analysis.planetaryPositions[planet] = {
          sign: position.sign,
          degree: position.degree,
          longitude: position.longitude,
          house: houseNumber,
          dignity: position.dignity || 'neutral',
          isRetrograde: position.isRetrograde || false,
          isCombust: position.isCombust || false
        };
      }

      // Check for missing planets
      const expectedPlanets = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];
      for (const planet of expectedPlanets) {
        if (!analysis.planetaryPositions[planet]) {
          analysis.missingPlanets.push(planet);
        }
      }

      // Generate answer
      const planetList = Object.entries(analysis.planetaryPositions)
        .map(([planet, pos]) => `${planet} in ${pos.sign} (${pos.house}${this.getOrdinalSuffix(pos.house)} house)`)
        .join(', ');

      analysis.answer = `All nine planets have been calculated: ${planetList}. This forms the natal chart blueprint. ${analysis.missingPlanets.length > 0 ? `Missing planets: ${analysis.missingPlanets.join(', ')}.` : ''}`;
    } else {
      analysis.answer = "Planetary positions could not be calculated due to insufficient birth data or calculation errors.";
    }

    return analysis;
  }

  /**
   * Question 5: Mahadasha Calculation Analysis
   * Which Mahadasha is the person running from birth and what is the sequence of planetary periods?
   */
  analyzeMahadasha(rasiChart, birthData) {
    const analysis = {
      question: "Which Mahadasha is the person running from birth and what is the sequence of planetary periods?",
      answer: "",
      details: {},
      currentDasha: null,
      dashaSequence: [],
      totalPeriod: 120
    };

    if (rasiChart && rasiChart.nakshatra) {
      const nakshatra = rasiChart.nakshatra;
      const birthDate = moment(birthData.dateOfBirth);
      const currentDate = moment();
      const ageInYears = currentDate.diff(birthDate, 'years', true);

      // Calculate starting Mahadasha based on Moon's nakshatra
      const startingDasha = this.getNakshatraLord(nakshatra.name);

      // Calculate current Mahadasha
      const currentDasha = this.calculateCurrentDasha(startingDasha, ageInYears);

      // Generate dasha sequence
      const dashaSequence = this.generateDashaSequence(startingDasha, ageInYears);

      analysis.details = {
        nakshatra: nakshatra.name,
        nakshatraLord: startingDasha,
        startingDasha: startingDasha,
        currentDasha: currentDasha,
        ageInYears: ageInYears,
        dashaSequence: dashaSequence
      };

      analysis.currentDasha = currentDasha;
      analysis.dashaSequence = dashaSequence;

      // Generate answer
      const currentDashaInfo = dashaSequence.find(d => d.isCurrent);
      const nextDasha = dashaSequence.find(d => d.startAge > ageInYears);

      // CRITICAL FIX: Enhanced null safety for dasha info access
      const currentPlanet = (currentDashaInfo && currentDashaInfo.planet) ? currentDashaInfo.planet : startingDasha;
      const currentRemaining = (currentDashaInfo && currentDashaInfo.remainingYears) ? currentDashaInfo.remainingYears.toFixed(1) : '0';
      const nextPlanet = (nextDasha && nextDasha.planet) ? nextDasha.planet : 'Unknown';
      const nextStartAge = (nextDasha && nextDasha.startAge) ? nextDasha.startAge.toFixed(1) : 'Unknown';

      analysis.answer = `Based on Moon's nakshatra (${nakshatra.name}), the person started with ${startingDasha} Mahadasha. Currently running ${currentPlanet} Mahadasha (${currentRemaining} years remaining). Next: ${nextPlanet} Mahadasha starting at age ${nextStartAge}. The complete 120-year Vimshottari cycle includes all 9 planets.`;
    } else {
      analysis.answer = "Mahadasha calculation requires Moon's nakshatra position, which could not be determined.";
    }

    return analysis;
  }

  /**
   * Comprehensive analysis of all Section 1 questions
   */
  analyzeBirthDataCollection(birthData, rasiChart, navamsaChart) {
    return {
      section: "1. Birth Data Collection and Chart Casting",
      timestamp: new Date().toISOString(),
      analyses: {
        birthDetails: this.analyzeBirthDetails(birthData),
        chartGeneration: this.analyzeChartGeneration(rasiChart, navamsaChart),
        ascendant: this.analyzeAscendant(rasiChart),
        planetaryPositions: this.analyzePlanetaryPositions(rasiChart),
        mahadasha: this.analyzeMahadasha(rasiChart, birthData)
      },
      summary: this.generateSectionSummary(birthData, rasiChart, navamsaChart)
    };
  }

  /**
   * Generate summary for Section 1
   */
  generateSectionSummary(birthData, rasiChart, navamsaChart) {
    const birthDetails = this.analyzeBirthDetails(birthData);
    const chartGeneration = this.analyzeChartGeneration(rasiChart, navamsaChart);
    const ascendant = this.analyzeAscendant(rasiChart);
    const planetaryPositions = this.analyzePlanetaryPositions(rasiChart);
    const mahadasha = this.analyzeMahadasha(rasiChart, birthData);

    const allComplete = birthDetails.completeness === 100 &&
                       chartGeneration.status === 'complete' &&
                       ascendant.lagnaSign &&
                       Object.keys(planetaryPositions.planetaryPositions).length === 9 &&
                       mahadasha.currentDasha;

    return {
      status: allComplete ? 'complete' : 'incomplete',
      completeness: birthDetails.completeness,
      chartsGenerated: chartGeneration.chartsGenerated.length,
      ascendantCalculated: !!ascendant.lagnaSign,
      planetsCalculated: Object.keys(planetaryPositions.planetaryPositions).length,
      dashaCalculated: !!mahadasha.currentDasha,
      readyForAnalysis: allComplete
    };
  }

  // Helper methods
  calculateHouseNumber(planetLongitude, ascendantLongitude) {
    const diff = (planetLongitude - ascendantLongitude + 360) % 360;
    return Math.floor(diff / 30) + 1;
  }

  getOrdinalSuffix(num) {
    const j = num % 10;
    const k = num % 100;
    if (j === 1 && k !== 11) return 'st';
    if (j === 2 && k !== 12) return 'nd';
    if (j === 3 && k !== 13) return 'rd';
    return 'th';
  }

  getNakshatraLord(nakshatraName) {
    const nakshatraIndex = this.nakshatras.indexOf(nakshatraName);
    if (nakshatraIndex === -1) return null;

    const lords = ['Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury'];
    return lords[Math.floor(nakshatraIndex / 3)];
  }

  calculateCurrentDasha(startingDasha, ageInYears) {
    const dashaOrder = ['Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury', 'Ketu', 'Venus'];
    let currentAge = 0;
    let currentDashaIndex = dashaOrder.indexOf(startingDasha);

    while (currentAge < ageInYears) {
      const currentDasha = dashaOrder[currentDashaIndex];
      const dashaPeriod = this.dashaPeriods[currentDasha];

      if (currentAge + dashaPeriod > ageInYears) {
        return {
          planet: currentDasha,
          startAge: currentAge,
          endAge: currentAge + dashaPeriod,
          remainingYears: (currentAge + dashaPeriod) - ageInYears
        };
      }

      currentAge += dashaPeriod;
      currentDashaIndex = (currentDashaIndex + 1) % 9;
    }

    return null;
  }

  generateDashaSequence(startingDasha, currentAge) {
    const dashaOrder = ['Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury', 'Ketu', 'Venus'];
    const sequence = [];
    let age = 0;
    let dashaIndex = dashaOrder.indexOf(startingDasha);

    // Generate past and current dashas
    while (age <= currentAge + 50) { // Show current + next few dashas
      const planet = dashaOrder[dashaIndex];
      const period = this.dashaPeriods[planet];
      const startAge = age;
      const endAge = age + period;
      const isCurrent = currentAge >= startAge && currentAge < endAge;

      sequence.push({
        planet,
        startAge,
        endAge,
        period,
        isCurrent,
        remainingYears: isCurrent ? endAge - currentAge : null
      });

      age += period;
      dashaIndex = (dashaIndex + 1) % 9;
    }

    return sequence;
  }
}

export default BirthDataAnalysisService;
