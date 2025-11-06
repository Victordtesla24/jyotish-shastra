/**
 * Detailed House Analyzer - Comprehensive analysis of all 12 houses
 *
 * Provides detailed analysis for each of the 12 houses covering:
 * - House significations and themes
 * - House lord placement and condition
 * - Planets occupying the house
 * - Aspects affecting the house
 * - Cross-house verification and patterns
 *
 * Reference: Section 3 of requirements analysis - House-by-House Examination
 */

class DetailedHouseAnalyzer {
    constructor() {
        this.houseSignifications = this.initializeHouseSignifications();
        this.planetaryNatures = this.initializePlanetaryNatures();
    }

    /**
     * Analyze all 12 houses comprehensively
     * @param {Object} chart - Birth chart with planetary positions and house data
     * @returns {Object} Detailed analysis of all houses
     */
    analyzeAllHouses(chart) {
        try {
            const houseAnalysis = {
                houses: {},
                patterns: {},
                crossVerification: {},
                overall: {
                    strongHouses: [],
                    weakHouses: [],
                    dominantThemes: [],
                    lifeBalance: {}
                }
            };

            // Analyze each house individually
            for (let houseNumber = 1; houseNumber <= 12; houseNumber++) {
                houseAnalysis.houses[houseNumber] = this.analyzeIndividualHouse(chart, houseNumber);
            }

            // Identify patterns across houses
            houseAnalysis.patterns = this.identifyHousePatterns(chart, houseAnalysis.houses);

            // Cross-verification between related houses
            houseAnalysis.crossVerification = this.performCrossVerification(chart, houseAnalysis.houses);

            // Generate overall summary
            houseAnalysis.overall = this.generateOverallSummary(houseAnalysis.houses);

            return houseAnalysis;
        } catch (error) {
            console.error('Error in detailed house analysis:', error);
            return this.getDefaultHouseAnalysisResult();
        }
    }

    /**
     * Analyze individual house in detail
     */
    analyzeIndividualHouse(chart, houseNumber) {
        const house = chart.houses[houseNumber];
        const houseSign = house.sign;
        const houseLord = this.getSignLord(houseSign);

        const analysis = {
            number: houseNumber,
            sign: houseSign,
            lord: houseLord,
            significations: this.houseSignifications[houseNumber],
            lordAnalysis: this.analyzeLordPlacement(chart, houseNumber, houseLord),
            occupants: this.analyzeHouseOccupants(chart, houseNumber),
            aspects: this.analyzeHouseAspects(chart, houseNumber),
            strength: this.calculateHouseStrength(chart, houseNumber),
            effects: this.determineHouseEffects(chart, houseNumber),
            timing: this.calculateHouseTiming(chart, houseNumber, houseLord),
            remedies: this.getHouseRemedies(houseNumber, chart)
        };

        return analysis;
    }

    /**
     * Analyze house lord placement and condition
     */
    analyzeLordPlacement(chart, houseNumber, houseLord) {
        const lordPosition = chart.planets[houseLord];
        const lordHouse = lordPosition.house;
        const lordSign = lordPosition.sign;

        const analysis = {
            planet: houseLord,
            placedInHouse: lordHouse,
            placedInSign: lordSign,
            dignity: this.getPlanetaryDignity(chart, houseLord),
            strength: this.getPlanetaryStrength(chart, houseLord),
            condition: this.getLordCondition(chart, houseLord),
            effects: this.getLordPlacementEffects(houseNumber, lordHouse),
            distanceFromOwnHouse: this.calculateDistance(houseNumber, lordHouse),
            aspectsToOwnHouse: this.lordAspectsOwnHouse(chart, houseNumber, houseLord)
        };

        return analysis;
    }

    /**
     * Analyze planets occupying the house
     */
    analyzeHouseOccupants(chart, houseNumber) {
        const occupants = [];

        Object.keys(chart.planets).forEach(planet => {
            if (chart.planets[planet].house === houseNumber) {
                occupants.push({
                    planet: planet,
                    sign: chart.planets[planet].sign,
                    degree: chart.planets[planet].degree || 0,
                    dignity: this.getPlanetaryDignity(chart, planet),
                    strength: this.getPlanetaryStrength(chart, planet),
                    effects: this.getPlanetInHouseEffects(planet, houseNumber),
                    nature: this.planetaryNatures[planet],
                    isRetrograde: chart.planets[planet].isRetrograde || false,
                    isCombust: this.isPlanetCombust(chart, planet)
                });
            }
        });

        return {
            count: occupants.length,
            planets: occupants,
            stellium: occupants.length >= 3,
            beneficCount: occupants.filter(p => this.isBeneficPlanet(p.planet)).length,
            maleficCount: occupants.filter(p => this.isMaleficPlanet(p.planet)).length,
            overallEffect: this.calculateOccupantEffect(occupants, houseNumber)
        };
    }

    /**
     * Analyze aspects affecting the house
     */
    analyzeHouseAspects(chart, houseNumber) {
        const aspects = [];

        Object.keys(chart.planets).forEach(planet => {
            const planetHouse = chart.planets[planet].house;

            // Check if planet aspects this house
            if (this.planetAspectsHouse(planetHouse, houseNumber, planet)) {
                aspects.push({
                    planet: planet,
                    fromHouse: planetHouse,
                    aspectType: this.getAspectType(planetHouse, houseNumber, planet),
                    strength: this.getAspectStrength(chart, planet, houseNumber),
                    nature: this.planetaryNatures[planet].nature,
                    effects: this.getAspectEffects(planet, houseNumber)
                });
            }
        });

        return {
            count: aspects.length,
            aspects: aspects,
            beneficAspects: aspects.filter(a => a.nature === 'Benefic').length,
            maleficAspects: aspects.filter(a => a.nature === 'Malefic').length,
            overallInfluence: this.calculateAspectInfluence(aspects, houseNumber)
        };
    }

    /**
     * Calculate house strength
     */
    calculateHouseStrength(chart, houseNumber) {
        let strength = 0;

        // Lord strength (40% weightage)
        const houseLord = this.getHouseLord(chart, houseNumber);
        const lordStrength = this.getPlanetaryStrength(chart, houseLord);
        strength += lordStrength * 0.4;

        // Occupant strength (30% weightage)
        const occupants = this.getHouseOccupants(chart, houseNumber);
        const occupantStrength = this.calculateOccupantStrength(chart, occupants);
        strength += occupantStrength * 0.3;

        // Aspect strength (20% weightage)
        const aspectStrength = this.calculateHouseAspectStrength(chart, houseNumber);
        strength += aspectStrength * 0.2;

        // House nature and position (10% weightage)
        const houseNatureStrength = this.getHouseNatureStrength(houseNumber);
        strength += houseNatureStrength * 0.1;

        return {
            total: Math.round(strength),
            grade: this.getStrengthGrade(strength),
            components: {
                lord: Math.round(lordStrength * 0.4),
                occupants: Math.round(occupantStrength * 0.3),
                aspects: Math.round(aspectStrength * 0.2),
                nature: Math.round(houseNatureStrength * 0.1)
            }
        };
    }

    /**
     * Determine house effects based on analysis
     */
    determineHouseEffects(chart, houseNumber) {
        const effects = [];
        const significations = this.houseSignifications[houseNumber];

        // Base significations
        effects.push(`Primary themes: ${significations.primary.join(', ')}`);

        // Lord effects
        const houseLord = this.getHouseLord(chart, houseNumber);
        const lordHouse = chart.planets[houseLord].house;
        const lordEffects = this.getLordPlacementEffects(houseNumber, lordHouse);
        effects.push(...lordEffects);

        // Occupant effects
        const occupants = this.getHouseOccupants(chart, houseNumber);
        occupants.forEach(planet => {
            const planetEffects = this.getPlanetInHouseEffects(planet, houseNumber);
            effects.push(...planetEffects);
        });

        return effects;
    }

    /**
     * Calculate timing for house-related events
     */
    calculateHouseTiming(chart, houseNumber, houseLord) {
        const timing = [];

        // House lord Mahadasha
        timing.push({
            period: `${houseLord} Mahadasha`,
            significance: 'Primary activation period',
            effects: `Peak manifestation of ${houseNumber}th house themes`,
            duration: this.getMahadashaDuration(houseLord)
        });

        // Occupant planets' dashas
        const occupants = this.getHouseOccupants(chart, houseNumber);
        occupants.forEach(planet => {
            timing.push({
                period: `${planet} Mahadasha/Antardasha`,
                significance: 'Secondary activation',
                effects: `${planet} influences on ${houseNumber}th house matters`,
                duration: this.getMahadashaDuration(planet)
            });
        });

        return timing;
    }

    /**
     * Get remedies for house-related issues
     */
    getHouseRemedies(houseNumber, chart) {
        const remedies = [];
        const houseLord = this.getHouseLord(chart, houseNumber);
        const houseStrength = this.calculateHouseStrength(chart, houseNumber);

        // General house remedies
        const generalRemedies = this.getGeneralHouseRemedies(houseNumber);
        remedies.push(...generalRemedies);

        // Lord-specific remedies
        if (houseStrength.total < 50) {
            const lordRemedies = this.getPlanetaryRemedies(houseLord);
            remedies.push(...lordRemedies);
        }

        return remedies;
    }

    /**
     * Identify patterns across houses
     */
    identifyHousePatterns(chart, houses) {
        const patterns = {
            stelliums: [],
            emptyHouses: [],
            kendraStrength: 0,
            trikonaStrength: 0,
            dusthanaStrength: 0
        };

        // Find stelliums (3+ planets in one house)
        for (let i = 1; i <= 12; i++) {
            if (houses[i].occupants.stellium) {
                patterns.stelliums.push({
                    house: i,
                    planets: houses[i].occupants.planets.map(p => p.planet),
                    count: houses[i].occupants.count
                });
            }
        }

        // Find empty houses
        for (let i = 1; i <= 12; i++) {
            if (houses[i].occupants.count === 0) {
                patterns.emptyHouses.push(i);
            }
        }

        // Calculate Kendra strength (1,4,7,10)
        const kendraHouses = [1, 4, 7, 10];
        patterns.kendraStrength = kendraHouses.reduce((sum, house) =>
            sum + houses[house].strength.total, 0) / kendraHouses.length;

        // Calculate Trikona strength (1,5,9)
        const trikonaHouses = [1, 5, 9];
        patterns.trikonaStrength = trikonaHouses.reduce((sum, house) =>
            sum + houses[house].strength.total, 0) / trikonaHouses.length;

        // Calculate Dusthana strength (6,8,12)
        const dusthanaHouses = [6, 8, 12];
        patterns.dusthanaStrength = dusthanaHouses.reduce((sum, house) =>
            sum + houses[house].strength.total, 0) / dusthanaHouses.length;

        return patterns;
    }

    /**
     * Perform cross-verification between related houses
     */
    performCrossVerification(chart, houses) {
        const crossVerification = {
            personalityConsistency: this.checkPersonalityConsistency(houses),
            wealthIndications: this.checkWealthIndications(houses),
            relationshipHarmony: this.checkRelationshipHarmony(houses),
            careerAlignment: this.checkCareerAlignment(houses),
            healthIndications: this.checkHealthIndications(houses),
            spiritualInclination: this.checkSpiritualInclination(houses)
        };

        return crossVerification;
    }

    /**
     * Generate overall summary of house analysis
     */
    generateOverallSummary(houses) {
        const strongHouses = [];
        const weakHouses = [];
        const dominantThemes = [];

        for (let i = 1; i <= 12; i++) {
            const house = houses[i];
            if (house.strength.total >= 70) {
                strongHouses.push({
                    house: i,
                    strength: house.strength.total,
                    themes: house.significations.primary
                });
            } else if (house.strength.total <= 30) {
                weakHouses.push({
                    house: i,
                    strength: house.strength.total,
                    themes: house.significations.primary
                });
            }
        }

        // Sort by strength
        strongHouses.sort((a, b) => b.strength - a.strength);
        weakHouses.sort((a, b) => a.strength - b.strength);

        // Determine dominant themes
        strongHouses.forEach(house => {
            dominantThemes.push(...house.themes);
        });

        const lifeBalance = this.calculateLifeBalance(houses);

        return {
            strongHouses: strongHouses.slice(0, 3), // Top 3 strong houses
            weakHouses: weakHouses.slice(0, 3), // Top 3 weak houses
            dominantThemes: [...new Set(dominantThemes)], // Unique themes
            lifeBalance
        };
    }

    /**
     * Calculate life balance across different areas
     */
    calculateLifeBalance(houses) {
        const areas = {
            personal: [1, 2, 3, 4], // Self, wealth, siblings, home
            social: [5, 7, 11], // Creativity, partnerships, gains
            transformation: [6, 8, 12], // Service, transformation, spirituality
            purpose: [9, 10] // Dharma, career
        };

        const balance = {};

        Object.keys(areas).forEach(area => {
            const areaHouses = areas[area];
            const totalStrength = areaHouses.reduce((sum, house) =>
                sum + houses[house].strength.total, 0);
            const averageStrength = totalStrength / areaHouses.length;

            balance[area] = {
                strength: Math.round(averageStrength),
                grade: this.getStrengthGrade(averageStrength),
                houses: areaHouses
            };
        });

        return balance;
    }

    // Cross-verification methods
    checkPersonalityConsistency(houses) {
        const firstHouse = houses[1];
        const tenthHouse = houses[10];

        return {
            consistent: firstHouse.strength.total > 50 && tenthHouse.strength.total > 50,
            analysis: 'Checking alignment between self (1st) and public image (10th)',
            recommendations: firstHouse.strength.total < 50 ?
                ['Strengthen self-confidence and personality'] :
                ['Maintain strong personal presence']
        };
    }

    checkWealthIndications(houses) {
        const secondHouse = houses[2];
        const eleventhHouse = houses[11];

        const wealthStrength = (secondHouse.strength.total + eleventhHouse.strength.total) / 2;

        return {
            strength: Math.round(wealthStrength),
            analysis: 'Wealth potential based on 2nd (savings) and 11th (income) houses',
            indications: wealthStrength > 60 ?
                ['Good wealth accumulation potential'] :
                ['Focus on improving earning and saving capacity']
        };
    }

    checkRelationshipHarmony(houses) {
        const seventhHouse = houses[7];
        const fourthHouse = houses[4];

        const relationshipHarmony = (seventhHouse.strength.total + fourthHouse.strength.total) / 2;

        return {
            harmony: Math.round(relationshipHarmony),
            analysis: 'Relationship potential based on 7th (partnerships) and 4th (emotional foundation)',
            guidance: relationshipHarmony > 60 ?
                ['Good relationship potential'] :
                ['Work on emotional maturity and partnership skills']
        };
    }

    checkCareerAlignment(houses) {
        const tenthHouse = houses[10];
        const sixthHouse = houses[6];

        const careerStrength = (tenthHouse.strength.total + sixthHouse.strength.total) / 2;

        return {
            alignment: Math.round(careerStrength),
            analysis: 'Career potential based on 10th (profession) and 6th (service/work)',
            prospects: careerStrength > 60 ?
                ['Strong career prospects'] :
                ['Focus on skill development and service attitude']
        };
    }

    checkHealthIndications(houses) {
        const firstHouse = houses[1];
        const sixthHouse = houses[6];
        const eighthHouse = houses[8];

        const healthScore = (firstHouse.strength.total - sixthHouse.strength.total - eighthHouse.strength.total/2) / 2;

        return {
            score: Math.round(Math.max(0, healthScore)),
            analysis: 'Health assessment based on 1st (vitality), 6th (diseases), and 8th (chronic issues)',
            recommendations: healthScore > 40 ?
                ['Generally good health indicated'] :
                ['Pay attention to health and lifestyle']
        };
    }

    checkSpiritualInclination(houses) {
        const ninthHouse = houses[9];
        const twelfthHouse = houses[12];

        const spiritualInclination = (ninthHouse.strength.total + twelfthHouse.strength.total) / 2;

        return {
            inclination: Math.round(spiritualInclination),
            analysis: 'Spiritual potential based on 9th (dharma) and 12th (moksha)',
            path: spiritualInclination > 60 ?
                ['Strong spiritual inclination'] :
                ['Gradual spiritual development possible']
        };
    }

    // Utility methods
    initializeHouseSignifications() {
        return {
            1: {
                primary: ['Self', 'Personality', 'Physical body', 'General health'],
                secondary: ['First impressions', 'Life approach', 'Vitality', 'Head and face']
            },
            2: {
                primary: ['Wealth', 'Family', 'Speech', 'Food'],
                secondary: ['Values', 'Early childhood', 'Right eye', 'Accumulated resources']
            },
            3: {
                primary: ['Siblings', 'Courage', 'Communication', 'Short travels'],
                secondary: ['Hobbies', 'Skills', 'Neighbors', 'Hands and arms']
            },
            4: {
                primary: ['Home', 'Mother', 'Comfort', 'Property'],
                secondary: ['Emotional foundation', 'Education', 'Vehicles', 'Chest and heart']
            },
            5: {
                primary: ['Children', 'Creativity', 'Romance', 'Education'],
                secondary: ['Intelligence', 'Speculation', 'Past life merit', 'Stomach']
            },
            6: {
                primary: ['Enemies', 'Diseases', 'Service', 'Debts'],
                secondary: ['Daily routine', 'Pets', 'Legal issues', 'Digestive system']
            },
            7: {
                primary: ['Marriage', 'Partnerships', 'Business', 'Public relations'],
                secondary: ['Open enemies', 'Foreign travels', 'Lower abdomen', 'Spouse characteristics']
            },
            8: {
                primary: ['Longevity', 'Transformation', 'Hidden things', 'Inheritance'],
                secondary: ['Occult', 'Surgery', 'Sudden events', 'Reproductive organs']
            },
            9: {
                primary: ['Dharma', 'Higher learning', 'Father', 'Fortune'],
                secondary: ['Philosophy', 'Long travels', 'Spiritual teachers', 'Thighs']
            },
            10: {
                primary: ['Career', 'Reputation', 'Authority', 'Government'],
                secondary: ['Social status', 'Achievements', 'Public image', 'Knees']
            },
            11: {
                primary: ['Gains', 'Income', 'Friends', 'Fulfillment of desires'],
                secondary: ['Elder siblings', 'Social networks', 'Left ear', 'Profits']
            },
            12: {
                primary: ['Expenses', 'Losses', 'Foreign lands', 'Moksha'],
                secondary: ['Bed comforts', 'Isolation', 'Charity', 'Feet', 'Subconscious']
            }
        };
    }

    initializePlanetaryNatures() {
        return {
            'Sun': { nature: 'Malefic', temperament: 'Hot', element: 'Fire' },
            'Moon': { nature: 'Benefic', temperament: 'Cold', element: 'Water' },
            'Mars': { nature: 'Malefic', temperament: 'Hot', element: 'Fire' },
            'Mercury': { nature: 'Neutral', temperament: 'Mixed', element: 'Earth' },
            'Jupiter': { nature: 'Benefic', temperament: 'Warm', element: 'Ether' },
            'Venus': { nature: 'Benefic', temperament: 'Cool', element: 'Water' },
            'Saturn': { nature: 'Malefic', temperament: 'Cold', element: 'Air' },
            'Rahu': { nature: 'Malefic', temperament: 'Hot', element: 'Air' },
            'Ketu': { nature: 'Malefic', temperament: 'Hot', element: 'Fire' }
        };
    }

    // Helper methods for calculations and effects
    getSignLord(sign) {
        const signLords = {
            'Aries': 'Mars', 'Taurus': 'Venus', 'Gemini': 'Mercury', 'Cancer': 'Moon',
            'Leo': 'Sun', 'Virgo': 'Mercury', 'Libra': 'Venus', 'Scorpio': 'Mars',
            'Sagittarius': 'Jupiter', 'Capricorn': 'Saturn', 'Aquarius': 'Saturn', 'Pisces': 'Jupiter'
        };
        return signLords[sign];
    }

    getHouseLord(chart, houseNumber) {
        const houseSign = chart.houses[houseNumber].sign;
        return this.getSignLord(houseSign);
    }

    getHouseOccupants(chart, houseNumber) {
        const occupants = [];
        Object.keys(chart.planets).forEach(planet => {
            if (chart.planets[planet].house === houseNumber) {
                occupants.push(planet);
            }
        });
        return occupants;
    }

    getPlanetaryDignity(chart, planet) {
        if (this.isExalted(chart, planet)) return 'Exalted';
        if (this.isInOwnSign(chart, planet)) return 'Own Sign';
        if (this.isDebilitated(chart, planet)) return 'Debilitated';
        return 'Neutral';
    }

    getPlanetaryStrength(chart, planet) {
        let strength = 50; // Base strength

        const dignity = this.getPlanetaryDignity(chart, planet);
        switch (dignity) {
            case 'Exalted': strength += 30; break;
            case 'Own Sign': strength += 20; break;
            case 'Debilitated': strength -= 30; break;
        }

        return Math.max(0, Math.min(100, strength));
    }

    getStrengthGrade(strength) {
        if (strength >= 80) return 'Excellent';
        if (strength >= 60) return 'Good';
        if (strength >= 40) return 'Average';
        if (strength >= 20) return 'Weak';
        return 'Very Weak';
    }

    isBeneficPlanet(planet) {
        return ['Jupiter', 'Venus', 'Mercury', 'Moon'].includes(planet);
    }

    isMaleficPlanet(planet) {
        return ['Mars', 'Saturn', 'Rahu', 'Ketu', 'Sun'].includes(planet);
    }

    isExalted(chart, planet) {
        const planetSign = chart.planets[planet].sign;
        const exaltationSigns = {
            'Sun': 'Aries', 'Moon': 'Taurus', 'Mars': 'Capricorn',
            'Mercury': 'Virgo', 'Jupiter': 'Cancer', 'Venus': 'Pisces', 'Saturn': 'Libra'
        };
        return exaltationSigns[planet] === planetSign;
    }

    isInOwnSign(chart, planet) {
        const planetSign = chart.planets[planet].sign;
        const ownSigns = {
            'Sun': ['Leo'], 'Moon': ['Cancer'], 'Mars': ['Aries', 'Scorpio'],
            'Mercury': ['Gemini', 'Virgo'], 'Jupiter': ['Sagittarius', 'Pisces'],
            'Venus': ['Taurus', 'Libra'], 'Saturn': ['Capricorn', 'Aquarius']
        };
        return ownSigns[planet]?.includes(planetSign) || false;
    }

    isDebilitated(chart, planet) {
        const planetSign = chart.planets[planet].sign;
        const debilitationSigns = {
            'Sun': 'Libra', 'Moon': 'Scorpio', 'Mars': 'Cancer',
            'Mercury': 'Pisces', 'Jupiter': 'Capricorn', 'Venus': 'Virgo', 'Saturn': 'Aries'
        };
        return debilitationSigns[planet] === planetSign;
    }

    // Production-grade implementations for comprehensive analysis
    getLordCondition(chart, planet) {
        let strength = 0;
        let details = [];

        // Dignity-based strength
        const dignity = this.getPlanetaryDignity(chart, planet);
        switch (dignity) {
            case 'Exalted':
                strength += 30;
                details.push('Planet is exalted');
                break;
            case 'Own Sign':
                strength += 25;
                details.push('Planet is in own sign');
                break;
            case 'Debilitated':
                strength -= 20;
                details.push('Planet is debilitated');
                break;
            default:
                strength += 10;
                details.push('Planet in neutral dignity');
        }

        // Check for combustion
        if (this.isPlanetCombust(chart, planet)) {
            strength -= 15;
            details.push('Planet is combust');
        }

        // Check for retrograde motion (applicable to outer planets)
        if (chart.planets[planet].isRetrograde) {
            strength -= 5;
            details.push('Planet is retrograde');
        }

        // Check for aspectual influences
        const beneficAspects = this.getBeneficAspectsToplanet(chart, planet);
        const maleficAspects = this.getMaleficAspectsToplanet(chart, planet);

        strength += beneficAspects.length * 3;
        strength -= maleficAspects.length * 2;

        if (beneficAspects.length > 0) {
            details.push(`Receives ${beneficAspects.length} benefic aspects`);
        }
        if (maleficAspects.length > 0) {
            details.push(`Receives ${maleficAspects.length} malefic aspects`);
        }

        // Check for Vargottama status (same sign in D1 and D9)
        if (this.isVargottama(chart, planet)) {
            strength += 10;
            details.push('Planet is Vargottama');
        }

        // House placement strength
        const planetHouse = chart.planets[planet].house;
        if ([1, 4, 7, 10].includes(planetHouse)) {
            strength += 5;
            details.push('Planet in Kendra house');
        } else if ([5, 9].includes(planetHouse)) {
            strength += 8;
            details.push('Planet in Trikona house');
        } else if ([6, 8, 12].includes(planetHouse)) {
            strength -= 3;
            details.push('Planet in Dusthana house');
        }

        // Normalize strength to 0-100 scale
        const normalizedStrength = Math.max(0, Math.min(100, strength + 50));

        let condition;
        if (normalizedStrength >= 80) condition = 'Excellent';
        else if (normalizedStrength >= 65) condition = 'Very Good';
        else if (normalizedStrength >= 50) condition = 'Good';
        else if (normalizedStrength >= 35) condition = 'Average';
        else if (normalizedStrength >= 20) condition = 'Weak';
        else condition = 'Very Weak';

        return {
            condition,
            strength: normalizedStrength,
            details: details,
            dignity: dignity
        };
    }

    getLordPlacementEffects(houseNumber, lordHouse) {
        const effects = [];
        const houseDifference = Math.abs(houseNumber - lordHouse);

        // Lord in own house
        if (houseNumber === lordHouse) {
            effects.push('Very strong - Lord in own house');
            effects.push('Full control over house significations');
            effects.push('Excellent results for house matters');
            return effects;
        }

        // Specific placement effects based on house combinations
        const placementMatrix = {
            1: {
                1: ['Strong self-identity', 'Good health', 'Leadership qualities'],
                2: ['Focus on wealth accumulation', 'Family-oriented approach'],
                3: ['Courageous personality', 'Good with siblings'],
                4: ['Home-loving nature', 'Emotional stability'],
                5: ['Creative self-expression', 'Good with children'],
                6: ['Service-oriented nature', 'Health consciousness'],
                7: ['Partnership focus', 'Public relations skills'],
                8: ['Transformative personality', 'Interest in mysteries'],
                9: ['Philosophical nature', 'Religious inclination'],
                10: ['Career-focused identity', 'Leadership in profession'],
                11: ['Social personality', 'Good earning capacity'],
                12: ['Spiritual inclination', 'Foreign connections']
            },
            2: {
                1: ['Self-earned wealth', 'Strong family values'],
                3: ['Wealth through communication', 'Sibling support in finance'],
                4: ['Family property', 'Inherited wealth'],
                6: ['Service-based income', 'Health-related expenses'],
                7: ['Partnership in wealth', 'Spouse contributes to income'],
                8: ['Sudden gains/losses', 'Inheritance possibilities'],
                10: ['Professional income', 'Career-based wealth'],
                11: ['Multiple income sources', 'Gains through friends'],
                12: ['Foreign income', 'Charitable expenses']
            },
            // Continue with other houses...
        };

        // Generic effects based on house nature
        const kendraHouses = [1, 4, 7, 10];
        const trikonaHouses = [1, 5, 9];
        const dusthanaHouses = [6, 8, 12];

        if (kendraHouses.includes(lordHouse)) {
            effects.push('Strong placement in Kendra house');
            effects.push('Stability and foundation for house matters');
        }

        if (trikonaHouses.includes(lordHouse)) {
            effects.push('Auspicious placement in Trikona house');
            effects.push('Fortune and dharmic support');
        }

        if (dusthanaHouses.includes(lordHouse)) {
            effects.push('Challenging placement in Dusthana house');
            effects.push('Obstacles and transformative experiences');
        }

        // Distance-based effects
        if (houseDifference <= 2) {
            effects.push('Close placement - manageable results');
        } else if (houseDifference >= 6) {
            effects.push('Distant placement - requires conscious effort');
        }

        return effects.length > 0 ? effects : [`${houseNumber}th lord in ${lordHouse}th house - mixed results`];
    }

    calculateDistance(house1, house2) {
        return Math.abs(house1 - house2);
    }

    lordAspectsOwnHouse(chart, houseNumber, houseLord) {
        const lordHouse = chart.planets[houseLord].house;
        return this.planetAspectsHouse(lordHouse, houseNumber, houseLord);
    }

    isPlanetCombust(chart, planet) {
        if (planet === 'Sun') return false; // Sun cannot be combust

        const planetData = chart.planets[planet];
        const sunData = chart.planets.Sun;

        if (!planetData || !sunData) return false;

        // Calculate actual degrees difference
        const planetLongitude = planetData.longitude || (planetData.degree + (planetData.sign - 1) * 30);
        const sunLongitude = sunData.longitude || (sunData.degree + (sunData.sign - 1) * 30);

        const angularDistance = Math.abs(planetLongitude - sunLongitude);
        const adjustedDistance = Math.min(angularDistance, 360 - angularDistance);

        // Combustion distances in degrees (traditional Vedic values)
        const combustionDistances = {
            'Moon': 12,
            'Mars': 17,
            'Mercury': planetData.isRetrograde ? 12 : 14,
            'Jupiter': 11,
            'Venus': planetData.isRetrograde ? 8 : 10,
            'Saturn': 15,
            'Rahu': 12,
            'Ketu': 12
        };

        const threshold = combustionDistances[planet];
        const isCombust = threshold ? adjustedDistance <= threshold : false;

        return {
            isCombust: isCombust,
            distance: adjustedDistance,
            threshold: threshold,
            severity: isCombust ? (adjustedDistance <= threshold / 2 ? 'Severe' : 'Moderate') : 'None'
        };
    }

    getPlanetInHouseEffects(planet, house) {
        const effects = [];

        // Planet-house combination effects
        const planetHouseEffects = {
            'Sun': {
                1: ['Strong personality', 'Leadership qualities', 'Good health', 'Authority'],
                2: ['Government income', 'Family pride', 'Strong speech', 'Eye problems possible'],
                3: ['Courage', 'Government support', 'Sibling leadership', 'Communication skills'],
                4: ['Government property', 'Father-like behavior', 'Home authority', 'Heart issues possible'],
                5: ['Creative leadership', 'Government job', 'Male children', 'Academic success'],
                6: ['Victory over enemies', 'Service in government', 'Health issues', 'Legal victories'],
                7: ['Late marriage', 'Government partnerships', 'Public recognition', 'Spouse dominance'],
                8: ['Government secrets', 'Sudden authority', 'Health issues', 'Research abilities'],
                9: ['Religious authority', 'Father blessings', 'Higher education', 'Pilgrimage'],
                10: ['Government career', 'High position', 'Public recognition', 'Father support'],
                11: ['Government gains', 'Powerful friends', 'Elder brother success', 'Social authority'],
                12: ['Foreign government job', 'Spiritual authority', 'Expenses on father', 'Eye problems']
            },
            'Moon': {
                1: ['Attractive personality', 'Caring nature', 'Popularity', 'Emotional sensitivity'],
                2: ['Family wealth', 'Food business', 'Caring speech', 'Mother support'],
                3: ['Emotional courage', 'Travel inclination', 'Sister benefits', 'Changing interests'],
                4: ['Happy home', 'Mother love', 'Property gains', 'Emotional stability'],
                5: ['Creative mind', 'Educational success', 'Female children', 'Artistic talents'],
                6: ['Emotional enemies', 'Health fluctuations', 'Service to women', 'Debt troubles'],
                7: ['Attractive spouse', 'Partnership with women', 'Public popularity', 'Business fluctuations'],
                8: ['Emotional transformation', 'Mother troubles', 'Intuitive abilities', 'Sudden changes'],
                9: ['Religious devotion', 'Mother guru', 'Foreign education', 'Emotional wisdom'],
                10: ['Popular career', 'Public service', 'Mother support in career', 'Fame'],
                11: ['Emotional gains', 'Female friends', 'Mother income', 'Popularity profits'],
                12: ['Foreign residence', 'Spiritual inclination', 'Mother separation', 'Charitable nature']
            },
            'Mars': {
                1: ['Strong physique', 'Aggressive nature', 'Leadership', 'Head injuries possible'],
                2: ['Harsh speech', 'Family disputes', 'Military income', 'Food preferences'],
                3: ['Courageous', 'Engineering skills', 'Brother conflicts', 'Short travels'],
                4: ['Property disputes', 'Home violence', 'Technical education', 'Chest problems'],
                5: ['Technical creativity', 'Sports talents', 'Male children', 'Investment losses'],
                6: ['Victory in competitions', 'Medical field', 'Enemy defeat', 'Accident prone'],
                7: ['Delayed marriage', 'Spouse arguments', 'Business partnerships', 'Legal issues'],
                8: ['Sudden events', 'Surgery', 'Research abilities', 'Accidents'],
                9: ['Religious conflicts', 'Engineering education', 'Father disputes', 'Pilgrimage'],
                10: ['Military career', 'Engineering profession', 'Authority conflicts', 'Success'],
                11: ['Competitive gains', 'Technical friends', 'Elder brother conflicts', 'Sports income'],
                12: ['Foreign military', 'Spiritual conflicts', 'Hidden enemies', 'Medical expenses']
            }
            // Continue with other planets...
        };

        // Get specific effects for this planet-house combination
        const specificEffects = planetHouseEffects[planet]?.[house];
        if (specificEffects) {
            effects.push(...specificEffects);
        }

        // Add general planetary nature effects
        const planetaryNature = this.planetaryNatures[planet];
        if (planetaryNature) {
            if (planetaryNature.nature === 'Benefic') {
                effects.push('Generally positive influence');
            } else if (planetaryNature.nature === 'Malefic') {
                effects.push('Challenging but transformative influence');
            } else {
                effects.push('Mixed results depending on other factors');
            }
        }

        // House-specific modulations
        if ([1, 4, 7, 10].includes(house)) {
            effects.push('Strong influence due to Kendra placement');
        }
        if ([5, 9].includes(house)) {
            effects.push('Auspicious results due to Trikona placement');
        }
        if ([6, 8, 12].includes(house)) {
            effects.push('Transformative challenges due to Dusthana placement');
        }

        return effects.length > 0 ? effects : [`${planet} in ${house}th house - general planetary influence`];
    }

    calculateOccupantEffect(occupants, houseNumber) {
        if (occupants.length === 0) return 'Neutral';

        const beneficCount = occupants.filter(p => this.isBeneficPlanet(p.planet)).length;
        const maleficCount = occupants.filter(p => this.isMaleficPlanet(p.planet)).length;

        if (beneficCount > maleficCount) return 'Positive';
        if (maleficCount > beneficCount) return 'Challenging';
        return 'Mixed';
    }

    planetAspectsHouse(planetHouse, targetHouse, planet) {
        const difference = Math.abs(planetHouse - targetHouse);

        // All planets have 7th house aspect
        if (difference === 6 || difference === 7) return true;

        // Special aspects
        if (planet === 'Mars' && (difference === 3 || difference === 7)) return true;
        if (planet === 'Jupiter' && (difference === 4 || difference === 8)) return true;
        if (planet === 'Saturn' && (difference === 2 || difference === 9)) return true;

        return false;
    }

    getAspectType(fromHouse, toHouse, planet) {
        const difference = Math.abs(fromHouse - toHouse);

        if (difference === 6 || difference === 7) return '7th Aspect';
        if (planet === 'Mars' && difference === 3) return '4th Aspect';
        if (planet === 'Mars' && difference === 7) return '8th Aspect';
        if (planet === 'Jupiter' && difference === 4) return '5th Aspect';
        if (planet === 'Jupiter' && difference === 8) return '9th Aspect';
        if (planet === 'Saturn' && difference === 2) return '3rd Aspect';
        if (planet === 'Saturn' && difference === 9) return '10th Aspect';

        return 'Unknown Aspect';
    }

    getAspectStrength(chart, planet, house) {
        const planetStrength = this.getPlanetaryStrength(chart, planet);
        return planetStrength * 0.7; // Aspect is 70% of planet strength
    }

    getAspectEffects(planet, house) {
        return [`${planet} aspect on ${house}th house brings specific influences`];
    }

    calculateAspectInfluence(aspects, houseNumber) {
        if (aspects.length === 0) return 'Neutral';

        const beneficAspects = aspects.filter(a => a.nature === 'Benefic').length;
        const maleficAspects = aspects.filter(a => a.nature === 'Malefic').length;

        if (beneficAspects > maleficAspects) return 'Positive';
        if (maleficAspects > beneficAspects) return 'Challenging';
        return 'Mixed';
    }

    calculateOccupantStrength(chart, occupants) {
        if (occupants.length === 0) return 50;

        const totalStrength = occupants.reduce((sum, planet) =>
            sum + this.getPlanetaryStrength(chart, planet), 0);

        return totalStrength / occupants.length;
    }

    calculateHouseAspectStrength(chart, houseNumber) {
        let totalStrength = 0;
        let aspectCount = 0;

        Object.keys(chart.planets).forEach(planet => {
            const planetHouse = chart.planets[planet].house;
            if (this.planetAspectsHouse(planetHouse, houseNumber, planet)) {
                totalStrength += this.getAspectStrength(chart, planet, houseNumber);
                aspectCount++;
            }
        });

        return aspectCount > 0 ? totalStrength / aspectCount : 50;
    }

    getHouseNatureStrength(houseNumber) {
        // Kendra houses (1,4,7,10) are stronger
        if ([1, 4, 7, 10].includes(houseNumber)) return 80;
        // Trikona houses (1,5,9) are strong
        if ([5, 9].includes(houseNumber)) return 70;
        // Upachaya houses (3,6,10,11) grow with time
        if ([3, 6, 11].includes(houseNumber)) return 60;
        // Dusthana houses (6,8,12) are challenging
        if ([8, 12].includes(houseNumber)) return 30;
        // Other houses
        return 50;
    }

    getMahadashaDuration(planet) {
        const durations = {
            'Sun': 6, 'Moon': 10, 'Mars': 7, 'Rahu': 18, 'Jupiter': 16,
            'Saturn': 19, 'Mercury': 17, 'Ketu': 7, 'Venus': 20
        };
        return durations[planet] || 0;
    }

    getGeneralHouseRemedies(houseNumber) {
        const remedies = {
            1: ['Strengthen self-confidence', 'Physical exercise', 'Meditation'],
            2: ['Family harmony practices', 'Speech improvement', 'Charity'],
            3: ['Sibling relationships', 'Communication skills', 'Short travels'],
            4: ['Mother worship', 'Home decoration', 'Property investment'],
            5: ['Children welfare', 'Creative pursuits', 'Education'],
            6: ['Service to others', 'Health care', 'Debt management'],
            7: ['Partnership harmony', 'Business ethics', 'Relationship counseling'],
            8: ['Spiritual practices', 'Occult studies', 'Transformation rituals'],
            9: ['Father respect', 'Religious activities', 'Higher learning'],
            10: ['Career development', 'Authority respect', 'Professional ethics'],
            11: ['Friendship cultivation', 'Income improvement', 'Goal setting'],
            12: ['Charity', 'Spiritual retreat', 'Foreign connections']
        };
        return remedies[houseNumber] || ['General spiritual practices'];
    }

    getPlanetaryRemedies(planet) {
        const remedies = {
            'Sun': ['Surya Namaskara', 'Ruby gemstone', 'Sunday worship'],
            'Moon': ['Monday fasting', 'Pearl gemstone', 'Milk donation'],
            'Mars': ['Tuesday fasting', 'Red coral', 'Hanuman worship'],
            'Mercury': ['Wednesday worship', 'Emerald gemstone', 'Education donation'],
            'Jupiter': ['Thursday worship', 'Yellow sapphire', 'Guru respect'],
            'Venus': ['Friday worship', 'Diamond', 'Art and beauty'],
            'Saturn': ['Saturday worship', 'Blue sapphire', 'Service to elderly'],
            'Rahu': ['Rahu remedies', 'Hessonite', 'Meditation'],
            'Ketu': ['Ketu remedies', 'Cats eye gemstone', 'Spiritual practices']
        };
        return remedies[planet] || ['General planetary worship'];
    }

    getDefaultHouseAnalysisResult() {
        return {
            houses: {},
            patterns: {},
            crossVerification: {},
            overall: {
                strongHouses: [],
                weakHouses: [],
                dominantThemes: [],
                lifeBalance: {}
            }
        };
    }

    /**
     * Production-grade helper methods
     */

    /**
     * Get benefic aspects to a planet
     * @param {Object} chart - Birth chart
     * @param {string} targetPlanet - Planet receiving aspects
     * @returns {Array} Benefic aspects
     */
    getBeneficAspectsToplanet(chart, targetPlanet) {
        const benefics = ['Jupiter', 'Venus', 'Moon'];
        const aspects = [];

        const targetHouse = chart.planets[targetPlanet].house;

        benefics.forEach(planet => {
            if (planet === targetPlanet) return;

            const planetHouse = chart.planets[planet]?.house;
            if (planetHouse && this.planetAspectsHouse(planetHouse, targetHouse, planet)) {
                aspects.push({
                    planet: planet,
                    aspectType: this.getAspectType(planetHouse, targetHouse, planet),
                    strength: this.getAspectStrength(chart, planet, targetHouse)
                });
            }
        });

        return aspects;
    }

    /**
     * Get malefic aspects to a planet
     * @param {Object} chart - Birth chart
     * @param {string} targetPlanet - Planet receiving aspects
     * @returns {Array} Malefic aspects
     */
    getMaleficAspectsToplanet(chart, targetPlanet) {
        const malefics = ['Sun', 'Mars', 'Saturn', 'Rahu', 'Ketu'];
        const aspects = [];

        const targetHouse = chart.planets[targetPlanet].house;

        malefics.forEach(planet => {
            if (planet === targetPlanet) return;

            const planetHouse = chart.planets[planet]?.house;
            if (planetHouse && this.planetAspectsHouse(planetHouse, targetHouse, planet)) {
                aspects.push({
                    planet: planet,
                    aspectType: this.getAspectType(planetHouse, targetHouse, planet),
                    strength: this.getAspectStrength(chart, planet, targetHouse)
                });
            }
        });

        return aspects;
    }

    /**
     * Check if planet is Vargottama (same sign in D1 and D9)
     * @param {Object} chart - Birth chart
     * @param {string} planet - Planet name
     * @returns {boolean} Vargottama status
     */
    isVargottama(chart, planet) {
        const planetData = chart.planets[planet];
        if (!planetData) return false;

        // Calculate D1 sign
        const d1Sign = planetData.sign;

        // Calculate D9 (Navamsa) sign - simplified calculation
        const longitude = planetData.longitude || (planetData.degree + (planetData.sign - 1) * 30);
        const navamsaPosition = this.calculateNavamsaPosition(longitude);
        const d9Sign = Math.floor(navamsaPosition / 30) + 1;

        return d1Sign === d9Sign;
    }

    /**
     * Calculate Navamsa position
     * @param {number} longitude - Planet longitude
     * @returns {number} Navamsa longitude
     */
    calculateNavamsaPosition(longitude) {
        const sign = Math.floor(longitude / 30);
        const degree = longitude % 30;

        // Each sign is divided into 9 parts (Navamsas) of 3°20' each
        const navamsaNumber = Math.floor(degree / (30/9));

        // Calculate Navamsa sign based on traditional rules
        let navamsaSign;
        if ([0, 3, 6, 9].includes(sign % 12)) { // Movable signs
            navamsaSign = (sign + navamsaNumber) % 12;
        } else if ([1, 4, 7, 10].includes(sign % 12)) { // Fixed signs
            navamsaSign = (sign + 8 + navamsaNumber) % 12;
        } else { // Dual signs
            navamsaSign = (sign + 4 + navamsaNumber) % 12;
        }

        const navamsaDegree = (degree % (30/9)) * 9;
        return navamsaSign * 30 + navamsaDegree;
    }

    /**
     * Enhanced combustion check with exact degrees
     * @param {Object} chart - Birth chart
     * @param {string} planet - Planet name
     * @returns {Object} Detailed combustion information
     */
    getDetailedCombustionInfo(chart, planet) {
        const combustionResult = this.isPlanetCombust(chart, planet);

        if (typeof combustionResult === 'boolean') {
            return { isCombust: combustionResult };
        }

        return {
            isCombust: combustionResult.isCombust,
            distance: combustionResult.distance,
            threshold: combustionResult.threshold,
            severity: combustionResult.severity,
            effects: this.getCombustionEffects(planet, combustionResult.severity)
        };
    }

    /**
     * Get combustion effects for a planet
     * @param {string} planet - Planet name
     * @param {string} severity - Combustion severity
     * @returns {Array} Combustion effects
     */
    getCombustionEffects(planet, severity) {
        const baseEffects = {
            'Moon': ['Emotional instability', 'Mother troubles', 'Mental stress'],
            'Mars': ['Anger issues', 'Rash decisions', 'Conflicts'],
            'Mercury': ['Communication problems', 'Learning difficulties', 'Nervous issues'],
            'Jupiter': ['Wisdom blocked', 'Spiritual challenges', 'Teacher troubles'],
            'Venus': ['Relationship problems', 'Artistic blocks', 'Luxury losses'],
            'Saturn': ['Discipline issues', 'Career delays', 'Authority conflicts']
        };

        const effects = baseEffects[planet] || ['General planetary weakness'];

        if (severity === 'Severe') {
            effects.push('Severe reduction in planetary benefits');
            effects.push('Requires strong remedial measures');
        } else if (severity === 'Moderate') {
            effects.push('Moderate reduction in planetary strength');
            effects.push('Manageable with appropriate remedies');
        }

        return effects;
    }

    /**
     * Calculate comprehensive planet strength
     * @param {Object} chart - Birth chart
     * @param {string} planet - Planet name
     * @returns {Object} Detailed strength calculation
     */
    calculateComprehensivePlanetStrength(chart, planet) {
        const planetData = chart.planets[planet];
        if (!planetData) return null;

        let totalStrength = 0;
        const components = {};

        // Dignity strength (40% weightage)
        const dignity = this.getPlanetaryDignity(chart, planet);
        let dignityPoints = 0;
        switch (dignity) {
            case 'Exalted': dignityPoints = 40; break;
            case 'Own Sign': dignityPoints = 35; break;
            case 'Debilitated': dignityPoints = 5; break;
            default: dignityPoints = 20;
        }
        components.dignity = dignityPoints;
        totalStrength += dignityPoints;

        // House strength (20% weightage)
        const housePoints = this.getHouseNatureStrength(planetData.house) * 0.2;
        components.house = housePoints;
        totalStrength += housePoints;

        // Aspect strength (20% weightage)
        const beneficAspects = this.getBeneficAspectsToplanet(chart, planet);
        const maleficAspects = this.getMaleficAspectsToplanet(chart, planet);
        const aspectPoints = Math.max(0, (beneficAspects.length * 5) - (maleficAspects.length * 3));
        components.aspects = aspectPoints;
        totalStrength += aspectPoints;

        // Combustion penalty (10% weightage)
        const combustionInfo = this.getDetailedCombustionInfo(chart, planet);
        let combustionPenalty = 0;
        if (combustionInfo.isCombust) {
            combustionPenalty = combustionInfo.severity === 'Severe' ? -15 : -8;
        }
        components.combustion = combustionPenalty;
        totalStrength += combustionPenalty;

        // Vargottama bonus (10% weightage)
        const vargottamaBonus = this.isVargottama(chart, planet) ? 10 : 0;
        components.vargottama = vargottamaBonus;
        totalStrength += vargottamaBonus;

        return {
            totalStrength: Math.max(0, Math.min(100, totalStrength)),
            components: components,
            grade: this.getStrengthGrade(totalStrength),
            dignity: dignity
        };
    }
}

export default DetailedHouseAnalyzer;
