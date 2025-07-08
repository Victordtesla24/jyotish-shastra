/**
 * Antardasha Calculator - Calculates detailed sub-periods within Mahadashas
 *
 * Antardashas are sub-periods within each Mahadasha, ruled by all 9 planets
 * in sequence. They provide precise timing for specific events and experiences.
 *
 * Reference: Vimshottari Dasha system from Brihat Parashara Hora Shastra
 */

import PratyanardashaCalculator from "./PratyanardashaCalculator";

class AntardashaCalculator {
    constructor() {
        // Mahadasha periods in years for each planet
        this.mahadashaPeriods = {
            'Sun': 6,
            'Moon': 10,
            'Mars': 7,
            'Rahu': 18,
            'Jupiter': 16,
            'Saturn': 19,
            'Mercury': 17,
            'Ketu': 7,
            'Venus': 20
        };

        // Planet sequence in Vimshottari Dasha
        this.planetSequence = ['Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury', 'Ketu', 'Venus'];
    }

    /**
     * Calculate all Antardashas for a given Mahadasha
     * @param {Object} mahadashaInfo - Information about the current Mahadasha
     * @param {Object} birthData - Birth details for calculations
     * @returns {Object} Detailed Antardasha calculations
     */
    calculateAntardashas(mahadashaInfo, birthData) {
        try {
            const antardashas = {
                mahadashaLord: mahadashaInfo.lord,
                mahadashaStartDate: mahadashaInfo.startDate,
                mahadashaEndDate: mahadashaInfo.endDate,
                mahadashaDuration: mahadashaInfo.duration,
                antardashaList: [],
                currentAntardasha: null,
                upcomingAntardashas: [],
                significantPeriods: [],
                eventTiming: [],
                overall: {
                    totalAntardashas: 9,
                    completedCount: 0,
                    remainingCount: 9,
                    currentPhase: 'Beginning'
                }
            };

            // Calculate individual Antardashas
            antardashas.antardashaList = this.calculateIndividualAntardashas(mahadashaInfo);

            // Identify current Antardasha
            antardashas.currentAntardasha = this.getCurrentAntardasha(antardashas.antardashaList, new Date());

            // Get upcoming Antardashas
            antardashas.upcomingAntardashas = this.getUpcomingAntardashas(antardashas.antardashaList, new Date());

            // Identify significant periods
            antardashas.significantPeriods = this.identifySignificantPeriods(antardashas.antardashaList, mahadashaInfo.lord);

            // Calculate event timing
            antardashas.eventTiming = this.calculateEventTiming(antardashas.antardashaList, mahadashaInfo.lord);

            // Set overall summary
            antardashas.overall = this.generateOverallSummary(antardashas);

            return antardashas;
        } catch (error) {
            console.error('Error calculating Antardashas:', error);
            return this.getDefaultAntardashaResult();
        }
    }

    /**
     * Calculate individual Antardasha periods
     */
    calculateIndividualAntardashas(mahadashaInfo) {
        const antardashas = [];
        const mahadashaLord = mahadashaInfo.lord;
        const mahadashaStartDate = new Date(mahadashaInfo.startDate);
        const mahadashaDurationYears = this.mahadashaPeriods[mahadashaLord];

        let currentDate = new Date(mahadashaStartDate);

        // Calculate each Antardasha starting with the Mahadasha lord itself
        this.planetSequence.forEach((antardashaLord, index) => {
            // Calculate Antardasha duration as proportion of Mahadasha
            const antardashaYears = (this.mahadashaPeriods[antardashaLord] / 120) * mahadashaDurationYears;
            const antardashaDays = antardashaYears * 365.25;

            const startDate = new Date(currentDate);
            const endDate = new Date(currentDate.getTime() + (antardashaDays * 24 * 60 * 60 * 1000));

            const antardasha = {
                lord: antardashaLord,
                startDate: startDate,
                endDate: endDate,
                durationYears: antardashaYears,
                durationDays: Math.round(antardashaDays),
                sequence: index + 1,
                phase: this.determineAntardashaPhase(index),
                significance: this.determineAntardashaSignificance(mahadashaLord, antardashaLord),
                effects: this.getAntardashaEffects(mahadashaLord, antardashaLord),
                eventPotential: this.getEventPotential(mahadashaLord, antardashaLord),
                remedies: this.getAntardashaRemedies(antardashaLord)
            };

            antardashas.push(antardasha);
            currentDate = new Date(endDate);
        });

        return antardashas;
    }

    /**
     * Get current running Antardasha
     */
    getCurrentAntardasha(antardashaList, currentDate) {
        const current = antardashaList.find(antardasha =>
            currentDate >= antardasha.startDate && currentDate <= antardasha.endDate
        );

        if (current) {
            const totalDays = (current.endDate - current.startDate) / (24 * 60 * 60 * 1000);
            const elapsedDays = (currentDate - current.startDate) / (24 * 60 * 60 * 1000);
            const remainingDays = totalDays - elapsedDays;

            return {
                ...current,
                status: 'Current',
                elapsedDays: Math.round(elapsedDays),
                remainingDays: Math.round(remainingDays),
                completionPercentage: Math.round((elapsedDays / totalDays) * 100)
            };
        }

        return null;
    }

    /**
     * Get upcoming Antardashas
     */
    getUpcomingAntardashas(antardashaList, currentDate) {
        return antardashaList
            .filter(antardasha => antardasha.startDate > currentDate)
            .slice(0, 3) // Get next 3 Antardashas
            .map(antardasha => ({
                ...antardasha,
                status: 'Upcoming',
                startsInDays: Math.round((antardasha.startDate - currentDate) / (24 * 60 * 60 * 1000))
            }));
    }

    /**
     * Identify significant periods within the Mahadasha
     */
    identifySignificantPeriods(antardashaList, mahadashaLord) {
        const significantPeriods = [];

        antardashaList.forEach(antardasha => {
            const significance = antardasha.significance;

            if (significance.level === 'Very High' || significance.level === 'High') {
                significantPeriods.push({
                    period: `${antardasha.lord} Antardasha`,
                    startDate: antardasha.startDate,
                    endDate: antardasha.endDate,
                    significance: significance.level,
                    reason: significance.reason,
                    expectedEvents: significance.events,
                    preparation: significance.preparation
                });
            }

            // Special combinations
            if (antardasha.lord === mahadashaLord) {
                significantPeriods.push({
                    period: `${antardasha.lord} Mahadasha - ${antardasha.lord} Antardasha`,
                    startDate: antardasha.startDate,
                    endDate: antardasha.endDate,
                    significance: 'Very High',
                    reason: 'Same planet rules both Mahadasha and Antardasha',
                    expectedEvents: ['Peak manifestation of planetary qualities', 'Major life changes possible'],
                    preparation: 'Focus on planetary strengths and remedies'
                });
            }
        });

        return significantPeriods.sort((a, b) => a.startDate - b.startDate);
    }

    /**
     * Calculate event timing based on Antardashas
     */
    calculateEventTiming(antardashaList, mahadashaLord) {
        const eventTiming = [];

        // Marriage timing
        const marriageAntardashas = antardashaList.filter(ad =>
            ['Venus', 'Jupiter', 'Moon'].includes(ad.lord) || ad.eventPotential.marriage === 'High'
        );

        marriageAntardashas.forEach(ad => {
            eventTiming.push({
                event: 'Marriage/Relationship',
                period: `${ad.lord} Antardasha`,
                startDate: ad.startDate,
                endDate: ad.endDate,
                probability: ad.eventPotential.marriage,
                description: `Favorable period for marriage under ${ad.lord} influence`
            });
        });

        // Career changes
        const careerAntardashas = antardashaList.filter(ad =>
            ['Sun', 'Mars', 'Saturn', 'Mercury'].includes(ad.lord) || ad.eventPotential.career === 'High'
        );

        careerAntardashas.forEach(ad => {
            eventTiming.push({
                event: 'Career Change/Promotion',
                period: `${ad.lord} Antardasha`,
                startDate: ad.startDate,
                endDate: ad.endDate,
                probability: ad.eventPotential.career,
                description: `Significant career developments under ${ad.lord} influence`
            });
        });

        // Health events
        const healthAntardashas = antardashaList.filter(ad =>
            ad.eventPotential.health === 'High' || ad.eventPotential.health === 'Caution'
        );

        healthAntardashas.forEach(ad => {
            eventTiming.push({
                event: 'Health Focus Period',
                period: `${ad.lord} Antardasha`,
                startDate: ad.startDate,
                endDate: ad.endDate,
                probability: ad.eventPotential.health,
                description: `Health attention needed under ${ad.lord} influence`
            });
        });

        // Financial events
        const wealthAntardashas = antardashaList.filter(ad =>
            ['Jupiter', 'Venus', 'Mercury'].includes(ad.lord) || ad.eventPotential.wealth === 'High'
        );

        wealthAntardashas.forEach(ad => {
            eventTiming.push({
                event: 'Financial Growth',
                period: `${ad.lord} Antardasha`,
                startDate: ad.startDate,
                endDate: ad.endDate,
                probability: ad.eventPotential.wealth,
                description: `Financial opportunities under ${ad.lord} influence`
            });
        });

        return eventTiming.sort((a, b) => a.startDate - b.startDate);
    }

    /**
     * Determine Antardasha phase
     */
    determineAntardashaPhase(sequence) {
        if (sequence <= 2) return 'Beginning Phase';
        if (sequence <= 5) return 'Middle Phase';
        if (sequence <= 7) return 'Maturation Phase';
        return 'Completion Phase';
    }

    /**
     * Determine Antardasha significance
     */
    determineAntardashaSignificance(mahadashaLord, antardashaLord) {
        let level = 'Moderate';
        let reason = 'Regular Antardasha period';
        let events = ['Normal life events'];
        let preparation = 'General awareness';

        // Same planet rules both
        if (mahadashaLord === antardashaLord) {
            level = 'Very High';
            reason = 'Same planet rules both periods';
            events = ['Peak manifestation of planetary qualities', 'Major life changes'];
            preparation = 'Focus on planetary strengths and remedies';
        }
        // Friendly planets
        else if (this.areFriendlyPlanets(mahadashaLord, antardashaLord)) {
            level = 'High';
            reason = 'Friendly planetary combination';
            events = ['Harmonious developments', 'Supportive circumstances'];
            preparation = 'Utilize positive energy for growth';
        }
        // Enemy planets
        else if (this.areEnemyPlanets(mahadashaLord, antardashaLord)) {
            level = 'High';
            reason = 'Challenging planetary combination';
            events = ['Conflicts and obstacles', 'Learning opportunities'];
            preparation = 'Prepare for challenges, practice patience';
        }
        // Benefic planets
        else if (this.isBeneficPlanet(antardashaLord)) {
            level = 'Good';
            reason = 'Benefic planet influence';
            events = ['Positive developments', 'Growth opportunities'];
            preparation = 'Make the most of favorable period';
        }
        // Malefic planets
        else if (this.isMaleficPlanet(antardashaLord)) {
            level = 'Caution';
            reason = 'Malefic planet influence';
            events = ['Challenges and tests', 'Character building'];
            preparation = 'Practice caution and discipline';
        }

        return { level, reason, events, preparation };
    }

    /**
     * Get Antardasha effects
     */
    getAntardashaEffects(mahadashaLord, antardashaLord) {
        const effects = [];

        // Base effects of Antardasha lord
        const planetEffects = {
            'Sun': ['Leadership opportunities', 'Government dealings', 'Father-related matters', 'Authority and recognition'],
            'Moon': ['Emotional experiences', 'Mother-related matters', 'Public dealings', 'Travel and changes'],
            'Mars': ['Energy and action', 'Property matters', 'Conflicts and competitions', 'Brother-related events'],
            'Mercury': ['Communication and learning', 'Business opportunities', 'Travel and networking', 'Skill development'],
            'Jupiter': ['Wisdom and spirituality', 'Teacher-student relationships', 'Children and education', 'Religious activities'],
            'Venus': ['Relationships and marriage', 'Artistic pursuits', 'Luxury and comforts', 'Women-related matters'],
            'Saturn': ['Hard work and discipline', 'Delays and obstacles', 'Service and responsibility', 'Elderly people'],
            'Rahu': ['Unconventional experiences', 'Foreign connections', 'Technology and innovation', 'Sudden changes'],
            'Ketu': ['Spiritual insights', 'Detachment and introspection', 'Past-life connections', 'Research and investigation']
        };

        effects.push(...(planetEffects[antardashaLord] || []));

        // Combined effects with Mahadasha lord
        const combinedEffect = this.getCombinedPlanetaryEffect(mahadashaLord, antardashaLord);
        if (combinedEffect) {
            effects.push(combinedEffect);
        }

        return effects;
    }

    /**
     * Get event potential for the Antardasha
     */
    getEventPotential(mahadashaLord, antardashaLord) {
        const potential = {
            marriage: 'Low',
            career: 'Low',
            health: 'Normal',
            wealth: 'Low',
            spirituality: 'Low',
            travel: 'Low'
        };

        // Marriage potential
        if (['Venus', 'Jupiter', 'Moon'].includes(antardashaLord)) {
            potential.marriage = 'High';
        } else if (['Mercury', 'Sun'].includes(antardashaLord)) {
            potential.marriage = 'Moderate';
        }

        // Career potential
        if (['Sun', 'Mars', 'Saturn', 'Mercury'].includes(antardashaLord)) {
            potential.career = 'High';
        } else if (['Jupiter', 'Venus'].includes(antardashaLord)) {
            potential.career = 'Moderate';
        }

        // Health considerations
        if (['Mars', 'Saturn', 'Rahu', 'Ketu'].includes(antardashaLord)) {
            potential.health = 'Caution';
        } else if (['Jupiter', 'Venus', 'Moon'].includes(antardashaLord)) {
            potential.health = 'Good';
        }

        // Wealth potential
        if (['Jupiter', 'Venus', 'Mercury'].includes(antardashaLord)) {
            potential.wealth = 'High';
        } else if (['Sun', 'Moon'].includes(antardashaLord)) {
            potential.wealth = 'Moderate';
        }

        // Spirituality
        if (['Jupiter', 'Ketu', 'Saturn'].includes(antardashaLord)) {
            potential.spirituality = 'High';
        } else if (['Sun', 'Moon'].includes(antardashaLord)) {
            potential.spirituality = 'Moderate';
        }

        // Travel
        if (['Moon', 'Rahu', 'Mercury'].includes(antardashaLord)) {
            potential.travel = 'High';
        } else if (['Venus', 'Jupiter'].includes(antardashaLord)) {
            potential.travel = 'Moderate';
        }

        return potential;
    }

    /**
     * Get remedies for Antardasha
     */
    getAntardashaRemedies(antardashaLord) {
        const remedies = {
            'Sun': ['Surya Namaskara', 'Donate wheat/jaggery on Sundays', 'Wear ruby (if suitable)', 'Chant Gayatri Mantra'],
            'Moon': ['Monday fasting', 'Donate milk/rice', 'Wear pearl (if suitable)', 'Chant Mahamrityunjaya Mantra'],
            'Mars': ['Tuesday fasting', 'Donate red lentils', 'Wear red coral (if suitable)', 'Chant Hanuman Chalisa'],
            'Mercury': ['Wednesday fasting', 'Donate green items', 'Wear emerald (if suitable)', 'Chant Vishnu Sahasranama'],
            'Jupiter': ['Thursday fasting', 'Donate yellow items/turmeric', 'Wear yellow sapphire (if suitable)', 'Chant Guru Mantra'],
            'Venus': ['Friday fasting', 'Donate white items', 'Wear diamond (if suitable)', 'Chant Lakshmi Mantra'],
            'Saturn': ['Saturday fasting', 'Donate black items/oil', 'Wear blue sapphire (if suitable)', 'Chant Shani Mantra'],
            'Rahu': ['Donate coconut on Saturdays', 'Wear hessonite (if suitable)', 'Chant Rahu Mantra', 'Perform Rahu remedies'],
            'Ketu': ['Donate sesame seeds', 'Wear cat\'s eye (if suitable)', 'Chant Ketu Mantra', 'Meditation and spirituality']
        };

        return remedies[antardashaLord] || ['General spiritual practices', 'Charity and good deeds'];
    }

    /**
     * Generate overall summary
     */
    generateOverallSummary(antardashas) {
        const currentDate = new Date();
        const completed = antardashas.antardashaList.filter(ad => ad.endDate < currentDate).length;
        const remaining = antardashas.antardashaList.length - completed;

        let currentPhase = 'Beginning';
        if (completed >= 7) currentPhase = 'Completion';
        else if (completed >= 4) currentPhase = 'Maturation';
        else if (completed >= 2) currentPhase = 'Middle';

        return {
            totalAntardashas: antardashas.antardashaList.length,
            completedCount: completed,
            remainingCount: remaining,
            currentPhase: currentPhase
        };
    }

    // Helper methods for planetary relationships
    areFriendlyPlanets(planet1, planet2) {
        const friendships = {
            'Sun': ['Moon', 'Mars', 'Jupiter'],
            'Moon': ['Sun', 'Mercury'],
            'Mars': ['Sun', 'Moon', 'Jupiter'],
            'Mercury': ['Sun', 'Venus'],
            'Jupiter': ['Sun', 'Moon', 'Mars'],
            'Venus': ['Mercury', 'Saturn'],
            'Saturn': ['Mercury', 'Venus']
        };
        return friendships[planet1]?.includes(planet2) || false;
    }

    areEnemyPlanets(planet1, planet2) {
        const enemies = {
            'Sun': ['Venus', 'Saturn'],
            'Moon': ['None'],
            'Mars': ['Mercury'],
            'Mercury': ['Moon'],
            'Jupiter': ['Mercury', 'Venus'],
            'Venus': ['Sun', 'Moon'],
            'Saturn': ['Sun', 'Moon', 'Mars']
        };
        return enemies[planet1]?.includes(planet2) || false;
    }

    isBeneficPlanet(planet) {
        return ['Jupiter', 'Venus', 'Mercury', 'Moon'].includes(planet);
    }

    isMaleficPlanet(planet) {
        return ['Mars', 'Saturn', 'Rahu', 'Ketu', 'Sun'].includes(planet);
    }

    getCombinedPlanetaryEffect(mahadashaLord, antardashaLord) {
        // Specific combinations
        const combinations = {
            'Sun-Moon': 'Leadership with emotional intelligence',
            'Sun-Mars': 'Dynamic leadership and authority',
            'Moon-Venus': 'Emotional fulfillment and relationships',
            'Mars-Saturn': 'Disciplined action and hard work',
            'Jupiter-Venus': 'Wisdom combined with material prosperity',
            'Mercury-Jupiter': 'Learning and teaching opportunities',
            'Saturn-Rahu': 'Unconventional hard work and sudden changes'
        };

        const key1 = `${mahadashaLord}-${antardashaLord}`;
        const key2 = `${antardashaLord}-${mahadashaLord}`;

        return combinations[key1] || combinations[key2] || null;
    }

    getDefaultAntardashaResult() {
        return {
            mahadashaLord: 'Unknown',
            mahadashaStartDate: null,
            mahadashaEndDate: null,
            mahadashaDuration: 0,
            antardashaList: [],
            currentAntardasha: null,
            upcomingAntardashas: [],
            significantPeriods: [],
            eventTiming: [],
            overall: {
                totalAntardashas: 0,
                completedCount: 0,
                remainingCount: 0,
                currentPhase: 'Unknown'
            }
        };
    }
}

export default AntardashaCalculator;
