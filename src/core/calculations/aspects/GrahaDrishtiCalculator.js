/**
 * Graha Drishti Calculator - Calculates planetary aspects in Vedic astrology
 *
 * Planetary aspects (Graha Drishti) are the influences planets cast on other houses
 * and planets. Each planet has specific aspect patterns that affect the chart.
 *
 * Reference: Section 4 - Planetary Aspects and Interrelationships
 */

class GrahaDrishtiCalculator {
    constructor() {
        this.planets = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];
        this.aspectStrengths = this.initializeAspectStrengths();
    }

    /**
     * Calculate all planetary aspects in the chart
     * @param {Object} chart - Birth chart with planetary positions
     * @returns {Object} Complete aspect analysis
     */
    calculateAllAspects(chart) {
        try {
            const aspectAnalysis = {
                planetaryAspects: {},
                houseAspects: {},
                mutualAspects: [],
                aspectPatterns: {},
                overallInfluence: {},
                significantAspects: [],
                aspectStrength: {
                    total: 0,
                    benefic: 0,
                    malefic: 0,
                    neutral: 0
                }
            };

            // Calculate aspects for each planet
            this.planets.forEach(planet => {
                if (chart.planets[planet]) {
                    aspectAnalysis.planetaryAspects[planet] = this.calculatePlanetaryAspects(chart, planet);
                }
            });

            // Calculate house-wise aspect influences
            for (let house = 1; house <= 12; house++) {
                aspectAnalysis.houseAspects[house] = this.calculateHouseAspects(chart, house);
            }

            // Find mutual aspects between planets
            aspectAnalysis.mutualAspects = this.findMutualAspects(chart);

            // Identify aspect patterns
            aspectAnalysis.aspectPatterns = this.identifyAspectPatterns(chart);

            // Calculate overall influence
            aspectAnalysis.overallInfluence = this.calculateOverallInfluence(aspectAnalysis);

            // Find significant aspects
            aspectAnalysis.significantAspects = this.findSignificantAspects(aspectAnalysis);

            // Calculate aspect strength summary
            aspectAnalysis.aspectStrength = this.calculateAspectStrengthSummary(aspectAnalysis);

            return aspectAnalysis;
        } catch (error) {
            console.error('Error calculating aspects:', error);
            return this.getDefaultAspectResult();
        }
    }

    /**
     * Calculate aspects cast by a specific planet
     */
    calculatePlanetaryAspects(chart, planet) {
        const planetData = chart.planets[planet];
        const planetHouse = planetData.house;
        const aspects = [];

        // Get aspect houses for this planet
        const aspectHouses = this.getPlanetAspectHouses(planet, planetHouse);

        aspectHouses.forEach(aspectInfo => {
            const targetHouse = aspectInfo.house;
            const aspectType = aspectInfo.type;
            const aspectStrength = this.calculateAspectStrength(chart, planet, targetHouse, aspectType);

            // Check if any planets are in the aspected house
            const aspectedPlanets = this.getPlanetsInHouse(chart, targetHouse);

            const aspect = {
                fromPlanet: planet,
                fromHouse: planetHouse,
                toHouse: targetHouse,
                aspectType: aspectType,
                strength: aspectStrength,
                aspectedPlanets: aspectedPlanets,
                effects: this.getAspectEffects(planet, targetHouse, aspectType),
                nature: this.getAspectNature(planet, aspectType),
                timing: this.getAspectTiming(planet, aspectType)
            };

            aspects.push(aspect);
        });

        return {
            planet: planet,
            house: planetHouse,
            totalAspects: aspects.length,
            aspects: aspects,
            aspectSummary: this.summarizePlanetaryAspects(aspects)
        };
    }

    /**
     * Get aspect houses for a specific planet
     */
    getPlanetAspectHouses(planet, fromHouse) {
        const aspectHouses = [];

        // All planets have 7th house aspect (opposition)
        const seventhHouse = this.calculateHouseFromDistance(fromHouse, 7);
        aspectHouses.push({
            house: seventhHouse,
            type: '7th Aspect',
            strength: 100
        });

        // Special aspects for specific planets
        switch (planet) {
            case 'Mars':
                // Mars aspects 4th and 8th houses
                const fourthFromMars = this.calculateHouseFromDistance(fromHouse, 4);
                const eighthFromMars = this.calculateHouseFromDistance(fromHouse, 8);
                aspectHouses.push(
                    { house: fourthFromMars, type: '4th Aspect', strength: 100 },
                    { house: eighthFromMars, type: '8th Aspect', strength: 100 }
                );
                break;

            case 'Jupiter':
                // Jupiter aspects 5th and 9th houses
                const fifthFromJupiter = this.calculateHouseFromDistance(fromHouse, 5);
                const ninthFromJupiter = this.calculateHouseFromDistance(fromHouse, 9);
                aspectHouses.push(
                    { house: fifthFromJupiter, type: '5th Aspect', strength: 100 },
                    { house: ninthFromJupiter, type: '9th Aspect', strength: 100 }
                );
                break;

            case 'Saturn':
                // Saturn aspects 3rd and 10th houses
                const thirdFromSaturn = this.calculateHouseFromDistance(fromHouse, 3);
                const tenthFromSaturn = this.calculateHouseFromDistance(fromHouse, 10);
                aspectHouses.push(
                    { house: thirdFromSaturn, type: '3rd Aspect', strength: 100 },
                    { house: tenthFromSaturn, type: '10th Aspect', strength: 100 }
                );
                break;

            case 'Rahu':
            case 'Ketu':
                // Some traditions give Rahu/Ketu additional aspects
                const fifthFromNode = this.calculateHouseFromDistance(fromHouse, 5);
                const ninthFromNode = this.calculateHouseFromDistance(fromHouse, 9);
                aspectHouses.push(
                    { house: fifthFromNode, type: '5th Aspect', strength: 75 },
                    { house: ninthFromNode, type: '9th Aspect', strength: 75 }
                );
                break;
        }

        return aspectHouses;
    }

    /**
     * Calculate house number from distance
     */
    calculateHouseFromDistance(fromHouse, distance) {
        let targetHouse = fromHouse + distance - 1;
        if (targetHouse > 12) {
            targetHouse -= 12;
        }
        return targetHouse;
    }

    /**
     * Calculate aspects affecting a specific house
     */
    calculateHouseAspects(chart, targetHouse) {
        const aspectsOnHouse = [];

        this.planets.forEach(planet => {
            if (chart.planets[planet]) {
                const planetHouse = chart.planets[planet].house;
                const planetAspects = this.getPlanetAspectHouses(planet, planetHouse);

                planetAspects.forEach(aspectInfo => {
                    if (aspectInfo.house === targetHouse) {
                        const aspectStrength = this.calculateAspectStrength(chart, planet, targetHouse, aspectInfo.type);

                        aspectsOnHouse.push({
                            planet: planet,
                            fromHouse: planetHouse,
                            aspectType: aspectInfo.type,
                            strength: aspectStrength,
                            nature: this.getAspectNature(planet, aspectInfo.type),
                            effects: this.getAspectEffects(planet, targetHouse, aspectInfo.type)
                        });
                    }
                });
            }
        });

        return {
            house: targetHouse,
            totalAspects: aspectsOnHouse.length,
            aspects: aspectsOnHouse,
            beneficAspects: aspectsOnHouse.filter(a => a.nature === 'Benefic').length,
            maleficAspects: aspectsOnHouse.filter(a => a.nature === 'Malefic').length,
            overallInfluence: this.calculateHouseOverallInfluence(aspectsOnHouse),
            dominantPlanet: this.findDominantPlanetOnHouse(aspectsOnHouse)
        };
    }

    /**
     * Calculate aspect strength based on various factors
     */
    calculateAspectStrength(chart, planet, targetHouse, aspectType) {
        let strength = 100; // Base strength

        // Planet's own strength affects aspect strength
        const planetStrength = this.getPlanetaryStrength(chart, planet);
        strength = strength * (planetStrength / 100);

        // Aspect type strength modifier
        const typeStrength = this.aspectStrengths[aspectType] || 100;
        strength = strength * (typeStrength / 100);

        // Distance factor (closer aspects are stronger)
        const planetHouse = chart.planets[planet].house;
        const distance = Math.abs(planetHouse - targetHouse);
        if (distance <= 3) {
            strength *= 1.2; // Close aspects are 20% stronger
        } else if (distance >= 9) {
            strength *= 0.8; // Distant aspects are 20% weaker
        }

        // Planet dignity affects aspect strength
        const dignity = this.getPlanetaryDignity(chart, planet);
        switch (dignity) {
            case 'Exalted':
                strength *= 1.3;
                break;
            case 'Own Sign':
                strength *= 1.2;
                break;
            case 'Debilitated':
                strength *= 0.7;
                break;
            case 'Enemy Sign':
                strength *= 0.8;
                break;
        }

        return Math.round(Math.min(150, Math.max(25, strength)));
    }

    /**
     * Find mutual aspects between planets
     */
    findMutualAspects(chart) {
        const mutualAspects = [];

        for (let i = 0; i < this.planets.length; i++) {
            for (let j = i + 1; j < this.planets.length; j++) {
                const planet1 = this.planets[i];
                const planet2 = this.planets[j];

                if (chart.planets[planet1] && chart.planets[planet2]) {
                    const mutual = this.checkMutualAspect(chart, planet1, planet2);
                    if (mutual.exists) {
                        mutualAspects.push(mutual);
                    }
                }
            }
        }

        return mutualAspects;
    }

    /**
     * Check if two planets have mutual aspect
     */
    checkMutualAspect(chart, planet1, planet2) {
        const house1 = chart.planets[planet1].house;
        const house2 = chart.planets[planet2].house;

        const planet1Aspects = this.getPlanetAspectHouses(planet1, house1);
        const planet2Aspects = this.getPlanetAspectHouses(planet2, house2);

        const planet1AspectsHouse2 = planet1Aspects.some(aspect => aspect.house === house2);
        const planet2AspectsHouse1 = planet2Aspects.some(aspect => aspect.house === house1);

        if (planet1AspectsHouse2 && planet2AspectsHouse1) {
            return {
                exists: true,
                planet1: planet1,
                planet2: planet2,
                house1: house1,
                house2: house2,
                type: 'Mutual Aspect',
                strength: this.calculateMutualAspectStrength(chart, planet1, planet2),
                nature: this.getMutualAspectNature(planet1, planet2),
                effects: this.getMutualAspectEffects(planet1, planet2),
                significance: 'High'
            };
        }

        return { exists: false };
    }

    /**
     * Calculate mutual aspect strength
     */
    calculateMutualAspectStrength(chart, planet1, planet2) {
        const strength1 = this.calculateAspectStrength(chart, planet1, chart.planets[planet2].house, '7th Aspect');
        const strength2 = this.calculateAspectStrength(chart, planet2, chart.planets[planet1].house, '7th Aspect');
        return Math.round((strength1 + strength2) / 2);
    }

    /**
     * Identify aspect patterns in the chart
     */
    identifyAspectPatterns(chart) {
        const patterns = {
            grandTrine: this.findGrandTrine(chart),
            grandCross: this.findGrandCross(chart),
            stelliumAspects: this.findStelliumAspects(chart),
            yogaFormingAspects: this.findYogaFormingAspects(chart),
            conflictingAspects: this.findConflictingAspects(chart)
        };

        return patterns;
    }

    /**
     * Calculate overall aspect influence in the chart
     */
    calculateOverallInfluence(aspectAnalysis) {
        const influence = {
            totalAspects: 0,
            beneficInfluence: 0,
            maleficInfluence: 0,
            neutralInfluence: 0,
            dominantPlanets: [],
            weakPlanets: [],
            balanceScore: 0
        };

        // Count all aspects and their influences
        Object.values(aspectAnalysis.planetaryAspects).forEach(planetAspects => {
            influence.totalAspects += planetAspects.totalAspects;

            planetAspects.aspects.forEach(aspect => {
                switch (aspect.nature) {
                    case 'Benefic':
                        influence.beneficInfluence += aspect.strength;
                        break;
                    case 'Malefic':
                        influence.maleficInfluence += aspect.strength;
                        break;
                    default:
                        influence.neutralInfluence += aspect.strength;
                }
            });
        });

        // Calculate balance score
        const totalInfluence = influence.beneficInfluence + influence.maleficInfluence + influence.neutralInfluence;
        if (totalInfluence > 0) {
            influence.balanceScore = Math.round((influence.beneficInfluence / totalInfluence) * 100);
        }

        return influence;
    }

    /**
     * Find significant aspects that have major impact
     */
    findSignificantAspects(aspectAnalysis) {
        const significantAspects = [];

        // Add mutual aspects (always significant)
        significantAspects.push(...aspectAnalysis.mutualAspects);

        // Add high-strength aspects
        Object.values(aspectAnalysis.planetaryAspects).forEach(planetAspects => {
            planetAspects.aspects.forEach(aspect => {
                if (aspect.strength >= 120 || aspect.aspectedPlanets.length > 0) {
                    significantAspects.push({
                        ...aspect,
                        significance: aspect.strength >= 130 ? 'Very High' : 'High',
                        reason: aspect.aspectedPlanets.length > 0 ? 'Planet-to-Planet' : 'High Strength'
                    });
                }
            });
        });

        return significantAspects.sort((a, b) => b.strength - a.strength);
    }

    /**
     * Get planets in a specific house
     */
    getPlanetsInHouse(chart, house) {
        const planetsInHouse = [];

        this.planets.forEach(planet => {
            if (chart.planets[planet] && chart.planets[planet].house === house) {
                planetsInHouse.push(planet);
            }
        });

        return planetsInHouse;
    }

    /**
     * Get aspect effects based on planet and target house
     */
    getAspectEffects(planet, targetHouse, aspectType) {
        const effects = [];

        // Planet-specific aspect effects
        const planetEffects = {
            'Sun': ['Authority and leadership influence', 'Government connections', 'Father-related effects'],
            'Moon': ['Emotional influence', 'Public popularity', 'Mother-related effects'],
            'Mars': ['Energy and action', 'Conflicts and competition', 'Property matters'],
            'Mercury': ['Communication and intellect', 'Business opportunities', 'Learning enhancement'],
            'Jupiter': ['Wisdom and knowledge', 'Spiritual growth', 'Prosperity and luck'],
            'Venus': ['Relationships and harmony', 'Artistic talents', 'Material comforts'],
            'Saturn': ['Discipline and delays', 'Hard work and perseverance', 'Restrictions and lessons'],
            'Rahu': ['Unconventional approaches', 'Foreign connections', 'Sudden changes'],
            'Ketu': ['Spiritual insights', 'Past-life connections', 'Detachment and introspection']
        };

        effects.push(...(planetEffects[planet] || []));

        // House-specific effects
        const houseEffects = {
            1: ['Personality influence', 'Physical health effects', 'Self-image impact'],
            2: ['Wealth and family effects', 'Speech and values influence', 'Resource accumulation'],
            3: ['Communication enhancement', 'Sibling relationships', 'Courage and efforts'],
            4: ['Home and property matters', 'Mother and comfort', 'Emotional foundation'],
            5: ['Children and creativity', 'Education and intelligence', 'Romance and speculation'],
            6: ['Health and service', 'Enemies and obstacles', 'Daily work and routine'],
            7: ['Marriage and partnerships', 'Business relationships', 'Public dealings'],
            8: ['Transformation and change', 'Hidden matters', 'Longevity and inheritance'],
            9: ['Fortune and dharma', 'Higher learning', 'Father and spiritual teachers'],
            10: ['Career and reputation', 'Authority and status', 'Professional achievements'],
            11: ['Gains and income', 'Friends and networks', 'Fulfillment of desires'],
            12: ['Expenses and losses', 'Foreign travels', 'Spiritual liberation']
        };

        effects.push(...(houseEffects[targetHouse] || []));

        return effects;
    }

    /**
     * Get aspect nature (benefic, malefic, or neutral)
     */
    getAspectNature(planet, aspectType) {
        // Planet nature
        const planetNatures = {
            'Sun': 'Malefic',
            'Moon': 'Benefic',
            'Mars': 'Malefic',
            'Mercury': 'Neutral',
            'Jupiter': 'Benefic',
            'Venus': 'Benefic',
            'Saturn': 'Malefic',
            'Rahu': 'Malefic',
            'Ketu': 'Malefic'
        };

        const baseNature = planetNatures[planet] || 'Neutral';

        // Special aspects of benefics are more beneficial
        if (['Jupiter', 'Venus'].includes(planet) && ['5th Aspect', '9th Aspect'].includes(aspectType)) {
            return 'Very Benefic';
        }

        // Special aspects of malefics can be more challenging
        if (['Mars', 'Saturn'].includes(planet) && ['4th Aspect', '8th Aspect', '3rd Aspect', '10th Aspect'].includes(aspectType)) {
            return 'Very Malefic';
        }

        return baseNature;
    }

    /**
     * Get aspect timing information
     */
    getAspectTiming(planet, aspectType) {
        return {
            activePeriods: [`${planet} Mahadasha/Antardasha`, `Transits of ${planet}`],
            peakInfluence: `During ${planet} periods`,
            duration: 'Ongoing influence throughout life'
        };
    }

    // Helper methods
    initializeAspectStrengths() {
        return {
            '7th Aspect': 100,
            '4th Aspect': 100,
            '8th Aspect': 100,
            '5th Aspect': 100,
            '9th Aspect': 100,
            '3rd Aspect': 100,
            '10th Aspect': 100
        };
    }

    getPlanetaryStrength(chart, planet) {
        // This function calculates the comprehensive strength of a planet based on various factors.
        // A full production-grade implementation would involve a detailed Shadbala calculation,
        // considering positional, temporal, motional, and aspectual strengths.

        // For demonstration, we'll use a more robust approximation considering:
        // 1. Dignity (Exaltation, Own Sign, Debilitation, Moolatrikona, Friendly/Enemy signs)
        // 2. House Placement (Kendra, Trikona, Dusthana)
        // 3. Combustion and Retrograde status
        // 4. Aspects from benefics/malefics

        const planetData = chart.planets[planet];
        if (!planetData) return 50; // Default moderate strength if planet data is missing

        let strength = 50; // Base strength (out of 100)

        // Factor 1: Dignity (Positional Strength) - 40% weight
        const planetSign = planetData.sign;
        const planetDegree = planetData.degree;

        const dignity = this.getPlanetaryDignity(chart, planet);
        switch (dignity) {
            case 'Exalted': strength += 40; break;
            case 'Moolatrikona': strength += 35; break;
            case 'Own Sign': strength += 30; break;
            case 'Friendly': strength += 20; break;
            case 'Neutral': strength += 10; break;
            case 'Enemy': strength -= 10; break;
            case 'Debilitated': strength -= 30; break;
        }

        // Factor 2: House Placement - 20% weight
        const planetHouse = planetData.house;
        // Kendra (Angular) houses: 1, 4, 7, 10
        if ([1, 4, 7, 10].includes(planetHouse)) {
            strength += 15;
        }
        // Trikona (Trinal) houses: 1, 5, 9
        else if ([5, 9].includes(planetHouse)) {
            strength += 10;
        }
        // Dusthana (Difficult) houses: 6, 8, 12
        else if ([6, 8, 12].includes(planetHouse)) {
            strength -= 15;
        }

        // Factor 3: Combustion and Retrograde - 20% weight
        // Assuming isCombust and isRetrograde are properties of planetData
        if (planetData.isCombust) {
            strength -= 20;
        }
        if (planetData.isRetrograde) {
            strength += 10; // Retrograde planets gain special strength in Vedic astrology
        }

        // Factor 4: Aspects from Benefics/Malefics - 20% weight
        const beneficAspects = this.countBeneficAspectsToPlanet(chart, planet);
        const maleficAspects = this.countMaleficAspectsToPlanet(chart, planet);

        strength += (beneficAspects * 5); // 5 points per benefic aspect
        strength -= (maleficAspects * 5); // 5 points per malefic aspect

        // Ensure strength is within 0-100 range
        return Math.max(0, Math.min(100, strength));
    }

    // Helper method to count benefic aspects to a planet
    countBeneficAspectsToPlanet(chart, targetPlanet) {
        let count = 0;
        const targetPlanetPos = chart.planets[targetPlanet];
        const benefics = ['Jupiter', 'Venus', 'Moon', 'Mercury']; // Natural benefics

        for (const planet of benefics) {
            const planetPos = chart.planets[planet];
            if (planetPos && this.hasAspect(planetPos, targetPlanetPos, planet)) {
                count++;
            }
        }
        return count;
    }

    // Helper method to count malefic aspects to a planet
    countMaleficAspectsToPlanet(chart, targetPlanet) {
        let count = 0;
        const targetPlanetPos = chart.planets[targetPlanet];
        const malefics = ['Mars', 'Saturn', 'Sun', 'Rahu', 'Ketu']; // Natural malefics

        for (const planet of malefics) {
            const planetPos = chart.planets[planet];
            if (planetPos && this.hasAspect(planetPos, targetPlanetPos, planet)) {
                count++;
            }
        }
        return count;
    }

    // Helper method to check if a planet aspects another (simplified)
    hasAspect(aspectingPlanetPos, receivingPlanetPos, aspectingPlanetName) {
        const diff = Math.abs(aspectingPlanetPos.longitude - receivingPlanetPos.longitude);
        const adjustedDiff = Math.min(diff, 360 - diff);

        // Standard 7th house aspect (opposition)
        if (adjustedDiff >= 175 && adjustedDiff <= 185) return true;

        // Special aspects for Mars, Jupiter, Saturn
        if (aspectingPlanetName === 'Mars' && (adjustedDiff >= 85 && adjustedDiff <= 95 || adjustedDiff >= 205 && adjustedDiff <= 215)) return true; // 4th and 8th
        if (aspectingPlanetName === 'Jupiter' && (adjustedDiff >= 115 && adjustedDiff <= 125 || adjustedDiff >= 235 && adjustedDiff <= 245)) return true; // 5th and 9th
        if (aspectingPlanetName === 'Saturn' && (adjustedDiff >= 55 && adjustedDiff <= 65 || adjustedDiff >= 265 && adjustedDiff <= 275)) return true; // 3rd and 10th

        return false;
    }

    getPlanetaryDignity(chart, planet) {
        const planetData = chart.planets[planet];
        if (!planetData) return 'Neutral';

        const planetSign = planetData.sign;
        const planetDegree = planetData.degree;

        // Exaltation and Debilitation signs and degrees
        const exaltationData = {
            'Sun': { sign: 'Aries', degree: 10 },
            'Moon': { sign: 'Taurus', degree: 3 },
            'Mars': { sign: 'Capricorn', degree: 28 },
            'Mercury': { sign: 'Virgo', degree: 15 },
            'Jupiter': { sign: 'Cancer', degree: 5 },
            'Venus': { sign: 'Pisces', degree: 27 },
            'Saturn': { sign: 'Libra', degree: 20 }
        };

        const debilitationData = {
            'Sun': { sign: 'Libra', degree: 10 },
            'Moon': { sign: 'Scorpio', degree: 3 },
            'Mars': { sign: 'Cancer', degree: 28 },
            'Mercury': { sign: 'Pisces', degree: 15 },
            'Jupiter': { sign: 'Capricorn', degree: 5 },
            'Venus': { sign: 'Virgo', degree: 27 },
            'Saturn': { sign: 'Aries', degree: 20 }
        };

        // Own signs
        const ownSigns = {
            'Sun': ['Leo'],
            'Moon': ['Cancer'],
            'Mars': ['Aries', 'Scorpio'],
            'Mercury': ['Gemini', 'Virgo'],
            'Jupiter': ['Sagittarius', 'Pisces'],
            'Venus': ['Taurus', 'Libra'],
            'Saturn': ['Capricorn', 'Aquarius']
        };

        // Moolatrikona signs and ranges
        const moolatrikonaData = {
            'Sun': { sign: 'Leo', startDegree: 0, endDegree: 20 },
            'Moon': { sign: 'Taurus', startDegree: 4, endDegree: 30 },
            'Mars': { sign: 'Aries', startDegree: 0, endDegree: 12 },
            'Mercury': { sign: 'Virgo', startDegree: 16, endDegree: 20 },
            'Jupiter': { sign: 'Sagittarius', startDegree: 0, endDegree: 10 },
            'Venus': { sign: 'Libra', startDegree: 0, endDegree: 15 },
            'Saturn': { sign: 'Aquarius', startDegree: 0, endDegree: 20 }
        };

        // Check Exaltation
        if (exaltationData[planet] && planetSign === exaltationData[planet].sign) {
            const diff = Math.abs(planetDegree - exaltationData[planet].degree);
            if (diff <= 1) return 'Deep Exaltation';
            return 'Exalted';
        }

        // Check Debilitation
        if (debilitationData[planet] && planetSign === debilitationData[planet].sign) {
            const diff = Math.abs(planetDegree - debilitationData[planet].degree);
            if (diff <= 1) return 'Deep Debilitation';
            return 'Debilitated';
        }

        // Check Own Sign
        if (ownSigns[planet]?.includes(planetSign)) {
            return 'Own Sign';
        }

        // Check Moolatrikona
        if (moolatrikonaData[planet] && planetSign === moolatrikonaData[planet].sign &&
            planetDegree >= moolatrikonaData[planet].startDegree && planetDegree <= moolatrikonaData[planet].endDegree) {
            return 'Moolatrikona';
        }

        // Check Friendly/Enemy Signs (simplified based on general planetary friendships)
        const signLord = this.getSignLord(planetSign);
        const planetaryFriendships = {
            'Sun': { friends: ['Moon', 'Mars', 'Jupiter'], enemies: ['Venus', 'Saturn'] },
            'Moon': { friends: ['Sun', 'Mercury'], enemies: [] },
            'Mars': { friends: ['Sun', 'Moon', 'Jupiter'], enemies: ['Mercury'] },
            'Mercury': { friends: ['Sun', 'Venus'], enemies: ['Moon'] },
            'Jupiter': { friends: ['Sun', 'Moon', 'Mars'], enemies: ['Mercury', 'Venus'] },
            'Venus': { friends: ['Mercury', 'Saturn'], enemies: ['Sun', 'Moon'] },
            'Saturn': { friends: ['Mercury', 'Venus'], enemies: ['Sun', 'Moon', 'Mars'] }
        };

        if (planetaryFriendships[planet] && signLord) {
            if (planetaryFriendships[planet].friends.includes(signLord)) return 'Friendly';
            if (planetaryFriendships[planet].enemies.includes(signLord)) return 'Enemy';
        }

        return 'Neutral';
    }

    getSignLord(sign) {
        const signLords = {
            'Aries': 'Mars', 'Taurus': 'Venus', 'Gemini': 'Mercury', 'Cancer': 'Moon',
            'Leo': 'Sun', 'Virgo': 'Mercury', 'Libra': 'Venus', 'Scorpio': 'Mars',
            'Sagittarius': 'Jupiter', 'Capricorn': 'Saturn', 'Aquarius': 'Saturn', 'Pisces': 'Jupiter'
        };
        return signLords[sign];
    }

    summarizePlanetaryAspects(aspects) {
        return {
            totalHousesAspected: aspects.length,
            strongestAspect: aspects.reduce((strongest, current) =>
                current.strength > strongest.strength ? current : strongest, aspects[0]),
            averageStrength: Math.round(aspects.reduce((sum, aspect) => sum + aspect.strength, 0) / aspects.length),
            beneficAspects: aspects.filter(a => a.nature === 'Benefic' || a.nature === 'Very Benefic').length,
            maleficAspects: aspects.filter(a => a.nature === 'Malefic' || a.nature === 'Very Malefic').length
        };
    }

    calculateHouseOverallInfluence(aspectsOnHouse) {
        if (aspectsOnHouse.length === 0) return 'Neutral';

        const beneficStrength = aspectsOnHouse
            .filter(a => a.nature === 'Benefic' || a.nature === 'Very Benefic')
            .reduce((sum, a) => sum + a.strength, 0);

        const maleficStrength = aspectsOnHouse
            .filter(a => a.nature === 'Malefic' || a.nature === 'Very Malefic')
            .reduce((sum, a) => sum + a.strength, 0);

        const difference = beneficStrength - maleficStrength;

        if (difference > 50) return 'Very Positive';
        if (difference > 0) return 'Positive';
        if (difference > -50) return 'Mixed';
        return 'Challenging';
    }

    findDominantPlanetOnHouse(aspectsOnHouse) {
        if (aspectsOnHouse.length === 0) return null;

        return aspectsOnHouse.reduce((dominant, current) =>
            current.strength > dominant.strength ? current : dominant).planet;
    }

    getMutualAspectNature(planet1, planet2) {
        const natures = {
            'Sun': 'Malefic', 'Moon': 'Benefic', 'Mars': 'Malefic', 'Mercury': 'Neutral',
            'Jupiter': 'Benefic', 'Venus': 'Benefic', 'Saturn': 'Malefic', 'Rahu': 'Malefic', 'Ketu': 'Malefic'
        };

        const nature1 = natures[planet1];
        const nature2 = natures[planet2];

        if (nature1 === 'Benefic' && nature2 === 'Benefic') return 'Very Positive';
        if (nature1 === 'Malefic' && nature2 === 'Malefic') return 'Very Challenging';
        if ((nature1 === 'Benefic' && nature2 === 'Malefic') || (nature1 === 'Malefic' && nature2 === 'Benefic')) return 'Mixed';
        return 'Neutral';
    }

    getMutualAspectEffects(planet1, planet2) {
        return [
            `Mutual influence between ${planet1} and ${planet2}`,
            'Strong karmic connection',
            'Significant life theme involving both planetary energies'
        ];
    }

    /**
     * Finds Grand Trine aspect patterns in the chart.
     * A Grand Trine is formed when three planets are approximately 120 degrees apart from each other,
     * forming an equilateral triangle in the chart. This is generally considered a harmonious aspect.
     * @param {Object} chart - The birth chart data.
     * @returns {Array<Object>} An array of found Grand Trine patterns, or a default object if none.
     */
    findGrandTrine(chart) {
        const grandTrines = [];
        const activePlanets = this.planets.filter(p => chart.planets[p]);
        const orb = 8; // A common orb for trine aspects

        // Generate all unique combinations of 3 planets
        for (let i = 0; i < activePlanets.length - 2; i++) {
            for (let j = i + 1; j < activePlanets.length - 1; j++) {
                for (let k = j + 1; k < activePlanets.length; k++) {
                    const p1Name = activePlanets[i];
                    const p2Name = activePlanets[j];
                    const p3Name = activePlanets[k];

                    const p1Data = chart.planets[p1Name];
                    const p2Data = chart.planets[p2Name];
                    const p3Data = chart.planets[p3Name];

                    if (!p1Data || !p2Data || !p3Data) continue;

                    const pos1 = p1Data.longitude;
                    const pos2 = p2Data.longitude;
                    const pos3 = p3Data.longitude;

                    // Check if all three planets form trine aspects with each other
                    const isTrine12 = this.isAngleWithinOrb(pos1, pos2, 120, orb);
                    const isTrine13 = this.isAngleWithinOrb(pos1, pos3, 120, orb);
                    const isTrine23 = this.isAngleWithinOrb(pos2, pos3, 120, orb);

                    if (isTrine12 && isTrine13 && isTrine23) {
                        const involvedPlanets = [p1Name, p2Name, p3Name];
                        const houses = involvedPlanets.map(p => chart.planets[p].house);
                        const signs = involvedPlanets.map(p => chart.planets[p].sign);

                        // Determine element if all signs are of the same element
                        let element = null;
                        const elementMap = {
                            'Aries': 'Fire', 'Leo': 'Fire', 'Sagittarius': 'Fire',
                            'Taurus': 'Earth', 'Virgo': 'Earth', 'Capricorn': 'Earth',
                            'Gemini': 'Air', 'Libra': 'Air', 'Aquarius': 'Air',
                            'Cancer': 'Water', 'Scorpio': 'Water', 'Pisces': 'Water'
                        };
                        const elementsOfSigns = signs.map(s => elementMap[s]);
                        if (elementsOfSigns.every(e => e === elementsOfSigns[0])) {
                            element = elementsOfSigns[0];
                        }

                        grandTrines.push({
                            exists: true,
                            planets: involvedPlanets,
                            houses: houses,
                            signs: signs,
                            element: element, // Will be null if not an elemental trine
                            description: `Grand Trine involving ${involvedPlanets.join(', ')} in houses ${houses.join(', ')} and signs ${signs.join(', ')}. ${element ? `Elemental: ${element}.` : ''}`,
                            effects: this.getGrandTrineEffects(element, involvedPlanets),
                            strength: this.calculatePatternStrength(chart, involvedPlanets)
                        });
                    }
                }
            }
        }

        // Return an empty array if no grand trines are found, or the array of found trines
        return grandTrines.length > 0 ? grandTrines : [{ exists: false, planets: [], houses: [], description: 'No Grand Trine found' }];
    }

    /**
     * Finds Grand Cross aspect patterns in the chart.
     * A Grand Cross is formed when four planets are approximately 90 degrees apart from each other,
     * forming a cross shape. This is generally considered a challenging aspect.
     * @param {Object} chart - The birth chart data.
     * @returns {Array<Object>} An array of found Grand Cross patterns, or a default object if none.
     */
    findGrandCross(chart) {
        const grandCrosses = [];
        const activePlanets = this.planets.filter(p => chart.planets[p]);
        const squareOrb = 8;
        const oppositionOrb = 10;

        // Generate all unique combinations of 4 planets
        for (let i = 0; i < activePlanets.length - 3; i++) {
            for (let j = i + 1; j < activePlanets.length - 2; j++) {
                for (let k = j + 1; k < activePlanets.length - 1; k++) {
                    for (let l = k + 1; l < activePlanets.length; l++) {
                        const p1Name = activePlanets[i];
                        const p2Name = activePlanets[j];
                        const p3Name = activePlanets[k];
                        const p4Name = activePlanets[l];

                        const p1Data = chart.planets[p1Name];
                        const p2Data = chart.planets[p2Name];
                        const p3Data = chart.planets[p3Name];
                        const p4Data = chart.planets[p4Name];

                        if (!p1Data || !p2Data || !p3Data || !p4Data) continue;

                        const positions = [p1Data.longitude, p2Data.longitude, p3Data.longitude, p4Data.longitude];
                        const involvedPlanets = [p1Name, p2Name, p3Name, p4Name];
                        const houses = involvedPlanets.map(p => chart.planets[p].house);
                        const signs = involvedPlanets.map(p => chart.planets[p].sign);

                        // Check for two oppositions and four squares
                        let numOppositions = 0;
                        let numSquares = 0;

                        for (let a = 0; a < 4; a++) {
                            for (let b = a + 1; b < 4; b++) {
                                if (this.isAngleWithinOrb(positions[a], positions[b], 180, oppositionOrb)) {
                                    numOppositions++;
                                }
                                if (this.isAngleWithinOrb(positions[a], positions[b], 90, squareOrb)) {
                                    numSquares++;
                                }
                            }
                        }

                        // A Grand Cross typically has 2 oppositions and 4 squares
                        if (numOppositions >= 2 && numSquares >= 4) {
                            // Determine modality if all signs are of the same modality
                            let modality = null;
                            const modalityMap = {
                                'Aries': 'Cardinal', 'Cancer': 'Cardinal', 'Libra': 'Cardinal', 'Capricorn': 'Cardinal',
                                'Taurus': 'Fixed', 'Leo': 'Fixed', 'Scorpio': 'Fixed', 'Aquarius': 'Fixed',
                                'Gemini': 'Mutable', 'Virgo': 'Mutable', 'Sagittarius': 'Mutable', 'Pisces': 'Mutable'
                            };
                            const modalitiesOfSigns = signs.map(s => modalityMap[s]);
                            if (modalitiesOfSigns.every(m => m === modalitiesOfSigns[0])) {
                                modality = modalitiesOfSigns[0];
                            }

                            grandCrosses.push({
                                exists: true,
                                planets: involvedPlanets,
                                houses: houses,
                                signs: signs,
                                modality: modality, // Will be null if not a modal cross
                                description: `Grand Cross involving ${involvedPlanets.join(', ')} in houses ${houses.join(', ')} and signs ${signs.join(', ')}. ${modality ? `Modal: ${modality}.` : ''}`,
                                effects: this.getGrandCrossEffects(modality, involvedPlanets),
                                strength: this.calculatePatternStrength(chart, involvedPlanets)
                            });
                        }
                    }
                }
            }
        }

        return grandCrosses.length > 0 ? grandCrosses : [{ exists: false, planets: [], houses: [], description: 'No Grand Cross found' }];
    }

    /**
     * Finds Stellium patterns in the chart.
     * A Stellium is a cluster of three or more planets in the same house or sign,
     * indicating a strong concentration of energy in that area of life.
     * @param {Object} chart - The birth chart data.
     * @returns {Array<Object>} An array of found Stellium patterns, or a default object if none.
     */
    findStelliumAspects(chart) {
        const stelliums = [];
        const houseOccupants = {};
        const signOccupants = {};
        const orb = 8; // Max orb for planets to be considered in a stellium (angular distance)

        for (const planet of this.planets) {
            const pData = chart.planets[planet];
            if (!pData) continue;

            // Group by house
            if (!houseOccupants[pData.house]) houseOccupants[pData.house] = [];
            houseOccupants[pData.house].push(planet);

            // Group by sign
            if (!signOccupants[pData.sign]) signOccupants[pData.sign] = [];
            signOccupants[pData.sign].push(planet);
        }

        const processOccupants = (occupants, type, location) => {
            if (occupants.length >= 3) {
                // For a stellium, planets should also be relatively close in longitude
                const positions = occupants.map(p => chart.planets[p].longitude);
                // Calculate the maximum angular difference between any two planets in the group
                let maxAngularDiff = 0;
                for (let i = 0; i < positions.length; i++) {
                    for (let j = i + 1; j < positions.length; j++) {
                        let diff = Math.abs(positions[i] - positions[j]);
                        if (diff > 180) diff = 360 - diff; // Handle wrap-around
                        if (diff > maxAngularDiff) maxAngularDiff = diff;
                    }
                }

                if (maxAngularDiff <= orb) { // All planets within the defined orb of each other
                     stelliums.push({
                        exists: true,
                        planets: occupants,
                        location: location,
                        type: type, // 'House' or 'Sign'
                        description: `Stellium in ${location} (${type}) involving ${occupants.join(', ')}.`,
                        effects: this.getStelliumEffects(location, occupants, type),
                        strength: this.calculatePatternStrength(chart, occupants)
                    });
                }
            }
        };

        for (const house in houseOccupants) {
            processOccupants(houseOccupants[house], 'House', `House ${house}`);
        }
        for (const sign in signOccupants) {
            processOccupants(signOccupants[sign], 'Sign', sign);
        }

        return stelliums.length > 0 ? stelliums : [{ exists: false, planets: [], house: null, description: 'No Stellium found' }];
    }

    /**
     * Finds Yoga-forming aspects in the chart.
     * Yogas are specific planetary combinations that indicate certain results or potentials.
     * This method focuses on Raja Yogas (combinations of Kendra and Trikona lords) and Dhana Yogas (wealth-giving combinations).
     * @param {Object} chart - The birth chart data.
     * @returns {Object} An object containing found Yogas and a description.
     */
    findYogaFormingAspects(chart) {
        const yogas = [];

        // Raja Yogas (Kendra-Trikona lords)
        // A Raja Yoga is formed when a lord of a Kendra (1, 4, 7, 10) house
        // combines with a lord of a Trikona (1, 5, 9) house through conjunction or mutual aspect.
        const kendraLords = this.getKendraLords(chart);
        const trikonaLords = this.getTrikonaLords(chart);

        for (const kLord of kendraLords) {
            for (const tLord of trikonaLords) {
                if (kLord === tLord) {
                    // Lagna Lord is both Kendra and Trikona, forming a powerful Raja Yoga by itself
                    yogas.push({
                        type: 'Raja Yoga (Lagna Lord)',
                        planets: [kLord],
                        description: `Lagna Lord ${kLord} is both Kendra and Trikona lord, forming a powerful Raja Yoga.`
                    });
                    continue;
                }

                const kLordPos = chart.planets[kLord];
                const tLordPos = chart.planets[tLord];

                if (!kLordPos || !tLordPos) continue;

                // Check for conjunction (same house)
                if (kLordPos.house === tLordPos.house) {
                    yogas.push({
                        type: 'Raja Yoga (Conjunction)',
                        planets: [kLord, tLord],
                        house: kLordPos.house,
                        description: `${kLord} (Kendra Lord) and ${tLord} (Trikona Lord) conjunct in house ${kLordPos.house}`
                    });
                }

                // Check for mutual aspect
                if (this.checkMutualAspect(chart, kLord, tLord).exists) {
                    yogas.push({
                        type: 'Raja Yoga (Mutual Aspect)',
                        planets: [kLord, tLord],
                        description: `${kLord} (Kendra Lord) and ${tLord} (Trikona Lord) mutually aspecting`
                    });
                }
            }
        }

        // Dhana Yogas (Wealth-giving combinations)
        // Formed by combinations of lords of wealth-giving houses (2, 5, 9, 11)
        const wealthHouses = [2, 5, 9, 11];
        const wealthLords = wealthHouses.map(houseNum => {
            if (chart.houses && chart.houses[houseNum] && chart.houses[houseNum].sign) {
                return this.getSignLord(chart.houses[houseNum].sign);
            }
            return null;
        }).filter(Boolean);

        // Check combinations of wealth lords
        for (let i = 0; i < wealthLords.length; i++) {
            for (let j = i + 1; j < wealthLords.length; j++) {
                const lord1 = wealthLords[i];
                const lord2 = wealthLords[j];
                const p1Data = chart.planets[lord1];
                const p2Data = chart.planets[lord2];

                if (!p1Data || !p2Data) continue;

                // Dhana Yoga if lords are in conjunction or mutual aspect
                if (p1Data.house === p2Data.house) {
                    yogas.push({
                        type: 'Dhana Yoga (Conjunction)',
                        planets: [lord1, lord2],
                        house: p1Data.house,
                        description: `${lord1} and ${lord2} (wealth lords) conjunct in house ${p1Data.house}`
                    });
                } else if (this.checkMutualAspect(chart, lord1, lord2).exists) {
                    yogas.push({
                        type: 'Dhana Yoga (Mutual Aspect)',
                        planets: [lord1, lord2],
                        description: `${lord1} and ${lord2} (wealth lords) mutually aspecting`
                    });
                }
            }
        }

        // Add more specific yogas as needed (e.g., Gaja Kesari Yoga, Neecha Bhanga Raja Yoga)
        // This would involve checking specific planetary placements and conditions.

        return {
            exists: yogas.length > 0,
            yogas: yogas,
            description: yogas.length > 0 ? 'Yoga-forming aspects found' : 'No significant Yoga-forming aspects found'
        };
    }

    /**
     * Helper method to get Kendra (Angular) house lords.
     * @param {Object} chart - The birth chart data.
     * @returns {Array<string>} An array of planet names that are lords of Kendra houses.
     */
    getKendraLords(chart) {
        const kendraHouses = [1, 4, 7, 10];
        const lords = new Set(); // Use a Set to avoid duplicate lords
        for (const house of kendraHouses) {
            if (chart.houses && chart.houses[house] && chart.houses[house].sign) {
                lords.add(this.getSignLord(chart.houses[house].sign));
            }
        }
        return Array.from(lords).filter(Boolean); // Filter out any undefined/null lords
    }

    /**
     * Helper method to get Trikona (Trinal) house lords.
     * @param {Object} chart - The birth chart data.
     * @returns {Array<string>} An array of planet names that are lords of Trikona houses.
     */
    getTrikonaLords(chart) {
        const trikonaHouses = [1, 5, 9];
        const lords = new Set(); // Use a Set to avoid duplicate lords
        for (const house of trikonaHouses) {
            if (chart.houses && chart.houses[house] && chart.houses[house].sign) {
                lords.add(this.getSignLord(chart.houses[house].sign));
            }
        }
        return Array.from(lords).filter(Boolean); // Filter out any undefined/null lords
    }

    /**
     * Helper method to get lords of wealth-giving houses (2, 5, 9, 11).
     * @param {Object} chart - The birth chart data.
     * @returns {Array<string>} An array of planet names that are lords of wealth houses.
     */
    getWealthLords(chart) {
        const wealthHouses = [2, 5, 9, 11];
        const lords = new Set(); // Use a Set to avoid duplicate lords
        for (const house of wealthHouses) {
            if (chart.houses && chart.houses[house] && chart.houses[house].sign) {
                lords.add(this.getSignLord(chart.houses[house].sign));
            }
        }
        return Array.from(lords).filter(Boolean); // Filter out any undefined/null lords
    }

    /**
     * Finds conflicting aspects in the chart, typically squares and oppositions.
     * These aspects indicate areas of tension, challenge, and growth.
     * @param {Object} chart - The birth chart data.
     * @returns {Object} An object containing found conflicts and a description.
     */
    findConflictingAspects(chart) {
        const conflicts = [];
        const activePlanets = this.planets.filter(p => chart.planets[p]);

        const maleficPlanets = ['Mars', 'Saturn', 'Rahu', 'Ketu'];
        const beneficPlanets = ['Jupiter', 'Venus', 'Moon', 'Mercury']; // Mercury can be benefic when with benefics

        const squareOrb = 8;
        const oppositionOrb = 10;

        // Iterate through all pairs of planets
        for (let i = 0; i < activePlanets.length; i++) {
            const planet1 = activePlanets[i];
            const p1Data = chart.planets[planet1];
            if (!p1Data) continue;

            for (let j = i + 1; j < activePlanets.length; j++) {
                const planet2 = activePlanets[j];
                const p2Data = chart.planets[planet2];
                if (!p2Data) continue;

                const pos1 = p1Data.longitude;
                const pos2 = p2Data.longitude;

                const isSquare = this.isAngleWithinOrb(pos1, pos2, 90, squareOrb);
                const isOpposition = this.isAngleWithinOrb(pos1, pos2, 180, oppositionOrb);

                if (isSquare || isOpposition) {
                    let conflictType = 'General Conflict';
                    let severity = 'Low';

                    // Malefic-Malefic conflicts (high severity)
                    if (maleficPlanets.includes(planet1) && maleficPlanets.includes(planet2)) {
                        conflictType = 'Malefic-Malefic Conflict';
                        severity = 'High';
                    }
                    // Benefic-Malefic conflicts (moderate severity)
                    else if ((beneficPlanets.includes(planet1) && maleficPlanets.includes(planet2)) ||
                             (maleficPlanets.includes(planet1) && beneficPlanets.includes(planet2))) {
                        conflictType = 'Benefic-Malefic Conflict';
                        severity = 'Medium';
                    }

                    if (severity !== 'Low') { // Only add significant conflicts
                        conflicts.push({
                            planets: [planet1, planet2],
                            house1: p1Data.house,
                            house2: p2Data.house,
                            aspect: isSquare ? 'Square' : 'Opposition',
                            conflictType: conflictType,
                            severity: severity,
                            description: `${planet1} and ${planet2} in ${isSquare ? 'square' : 'opposition'} - ${conflictType} (${severity} severity)`
                        });
                    }
                }
            }
        }

        return {
            exists: conflicts.length > 0,
            conflicts: conflicts,
            description: conflicts.length > 0 ? 'Conflicting aspects found' : 'No significant conflicting aspects found'
        };
    }

    /**
     * Calculates a summary of aspect strengths (total, benefic, malefic, neutral).
     * @param {Object} aspectAnalysis - The complete aspect analysis object.
     * @returns {Object} An object containing the summarized aspect strengths.
     */
    calculateAspectStrengthSummary(aspectAnalysis) {
        let total = 0, benefic = 0, malefic = 0, neutral = 0;

        Object.values(aspectAnalysis.planetaryAspects).forEach(planetAspects => {
            planetAspects.aspects.forEach(aspect => {
                total += aspect.strength;
                switch (aspect.nature) {
                    case 'Benefic':
                    case 'Very Benefic':
                        benefic += aspect.strength;
                        break;
                    case 'Malefic':
                    case 'Very Malefic':
                        malefic += aspect.strength;
                        break;
                    default:
                        neutral += aspect.strength;
                }
            });
        });

        return { total, benefic, malefic, neutral };
    }

    /**
     * Provides a default, empty aspect analysis result object.
     * Useful for initializing or returning in case of errors.
     * @returns {Object} Default aspect analysis result.
     */
    getDefaultAspectResult() {
        return {
            planetaryAspects: {},
            houseAspects: {},
            mutualAspects: [],
            aspectPatterns: {},
            overallInfluence: {
                totalAspects: 0,
                beneficInfluence: 0,
                maleficInfluence: 0,
                neutralInfluence: 0,
                balanceScore: 0
            },
            significantAspects: [],
            aspectStrength: {
                total: 0,
                benefic: 0,
                malefic: 0,
                neutral: 0
            }
        };
    }

    /**
     * Checks if the angular difference between two longitudes is within a specified orb of a target angle.
     * Accounts for wrap-around (360 degrees).
     * @param {number} pos1 - Longitude of the first planet.
     * @param {number} pos2 - Longitude of the second planet.
     * @param {number} targetAngle - The ideal angle for the aspect (e.g., 120 for trine, 90 for square).
     * @param {number} orb - The allowed deviation from the target angle.
     * @returns {boolean} True if the angle is within the orb, false otherwise.
     */
    isAngleWithinOrb(pos1, pos2, targetAngle, orb) {
        let diff = Math.abs(pos1 - pos2);
        if (diff > 180) {
            diff = 360 - diff; // Normalize difference to be within 0-180
        }
        return Math.abs(diff - targetAngle) <= orb;
    }

    /**
     * Provides effects description for a Grand Trine.
     * @param {string|null} element - The element of the Grand Trine (e.g., 'Fire', 'Earth'), or null if non-elemental.
     * @param {Array<string>} planets - Array of planet names involved.
     * @returns {Array<string>} An array of descriptive effects.
     */
    getGrandTrineEffects(element, planets) {
        const effects = {
            'Fire': 'Inspiration, creativity, and dynamic energy. Natural leadership and confidence.',
            'Earth': 'Practicality, stability, and manifestation. Strong ability to build and create in the material world.',
            'Air': 'Intellect, communication, and social connections. Ease in networking, learning, and sharing ideas.',
            'Water': 'Emotional depth, intuition, and healing. Strong empathy and creative expression.'
        };
        const planetNatures = planets.map(p => this.getPlanetNature(p)).join(', ');

        let description = '';
        if (element) {
            description = `A harmonious flow of energy related to the ${element} element. ${effects[element]}`;
        } else {
            description = 'A harmonious flow of energy between the involved planets, indicating ease and natural talent in areas related to their combined significations.';
        }

        return [
            description,
            `The energies of ${planets.join(', ')} (${planetNatures}) combine effortlessly.`
        ];
    }

    /**
     * Calculates the overall strength of an aspect pattern based on the strength of involved planets.
     * @param {Object} chart - The birth chart data.
     * @param {Array<string>} planets - Array of planet names involved in the pattern.
     * @returns {number} The average strength of the involved planets, rounded.
     */
    calculatePatternStrength(chart, planets) {
        let totalStrength = 0;
        planets.forEach(planet => {
            totalStrength += this.getPlanetaryStrength(chart, planet);
        });
        const averageStrength = totalStrength / planets.length;

        // Further enhancements could include bonuses for tight orbs or specific planetary dignities within the pattern.
        return Math.round(averageStrength);
    }

    /**
     * Determines the general nature of a planet (Benefic, Malefic, or Neutral).
     * @param {string} planet - The name of the planet.
     * @returns {string} The nature of the planet.
     */
    getPlanetNature(planet) {
        const benefics = ['Jupiter', 'Venus', 'Moon'];
        const malefics = ['Saturn', 'Mars', 'Rahu', 'Ketu'];
        if (benefics.includes(planet)) return 'Benefic';
        if (malefics.includes(planet)) return 'Malefic';
        return 'Neutral'; // Mercury is generally neutral, Sun can be considered malefic by some traditions
    }

    /**
     * Provides effects description for a Grand Cross.
     * @param {string|null} modality - The modality of the Grand Cross (e.g., 'Cardinal', 'Fixed'), or null if non-modal.
     * @param {Array<string>} planets - Array of planet names involved.
     * @returns {Array<string>} An array of descriptive effects.
     */
    getGrandCrossEffects(modality, planets) {
        const effects = {
            'Cardinal': 'High energy, initiative, and action-oriented. Can lead to major life events and crisis situations that demand immediate action.',
            'Fixed': 'Intense stability, determination, and resistance to change. Can create stubbornness and being locked into situations.',
            'Mutable': 'Constant flux, adaptability, and restlessness. Can lead to a scattered and indecisive nature but great learning potential.'
        };
        const planetNatures = planets.map(p => this.getPlanetNature(p)).join(', ');

        let description = '';
        if (modality) {
            description = `A challenging configuration demanding integration of energies in the ${modality} modality. ${effects[modality]}`;
        } else {
            description = 'A challenging configuration indicating areas of significant tension and dynamic interplay between the involved planetary energies.';
        }

        return [
            description,
            `The energies of ${planets.join(', ')} (${planetNatures}) create tension that requires conscious effort to resolve.`
        ];
    }

    /**
     * Provides effects description for a Stellium.
     * @param {string} location - The house or sign where the stellium is located.
     * @param {Array<string>} planets - Array of planet names involved.
     * @param {string} type - 'House' or 'Sign' indicating the type of stellium.
     * @returns {Array<string>} An array of descriptive effects.
     */
    getStelliumEffects(location, planets, type) {
        // In a more advanced system, the primary planet could be determined by strength, dignity, or angularity.
        const houseNumber = type === 'House' ? parseInt(location.split(' ')[1]) : null;

        let mainTheme = '';
        if (type === 'House' && houseNumber) {
            mainTheme = `This intensely focuses energy on the matters of house ${houseNumber}, making this area of life highly significant.`;
        } else if (type === 'Sign') {
            mainTheme = `This creates a powerful concentration of energy in the sign of ${location}, emphasizing its qualities and themes.`;
        }

        const planetEnergies = planets.map(p => {
            const nature = this.getPlanetNature(p);
            return `${p} (${nature})`;
        }).join(', ');

        return [
            mainTheme,
            `A blend of energies from: ${planetEnergies}.`,
            'This area of life will be highly significant, complex, and a source of great lessons and experiences.',
            `The affairs of ${location} will be a central theme throughout life, often leading to exceptional talent or obsession related to its significations.`
        ];
    }
}

module.exports = GrahaDrishtiCalculator;
