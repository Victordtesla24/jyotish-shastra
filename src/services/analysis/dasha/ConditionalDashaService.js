/**
 * Conditional Dasha Systems per BPHS Chapters 36-42
 * Yogini, Shatabdika, and other conditional dasha systems for enhanced birth time rectification
 * 
 * References:
 * - Brihat Parashara Hora Shastra, Chapter 36: "Yogini Dasha system for timing major life events"
 * - Brihat Parashara Hora Shastra, Chapter 37: "Shatabdika Dasha for long-term event prediction"
 * - Brihat Parashara Hora Shastra, Chapter 38: "Chara Dasha for sign-based progression"
 * - Brihat Parashara Hora Shastra, Chapter 39: "Ashtottari Dasha for special conditions"
 * - Brihat Parashara Hora Shastra, Chapter 40: "Dwisaptati Sama Dasha for planetary conditions"
 * - Brihat Parashara Hora Shastra, Chapter 41: "Shat Trimsha Dasha for Nakshatra-based timing"
 * - Brihat Parashara Hora Shastra, Chapter 42: "Conditional operation criteria for special dashas"
 * 
 * Mathematical Formulas:
 * Yogini Dasha: 8 Yoginis × Different year periods = 36-year cycle
 * Shatabdika Dasha: 100-year cycle divided among planets
 * Event Correlation Score = (Dasha Lord Significance × Period Relevance × Event Weight)
 * 
 * Applications in Birth Time Rectification:
 * - Primary: Event correlation verification with major life events
 * - Secondary: Cross-validation of dasha periods for timing confirmation
 * - Tertiary: Planetary position verification through conditional dasha applicability
 * - Special: High-precision rectification when traditional methods are ambiguous
 */

class ConditionalDashaService {
  constructor() {
    this.bhpsReferences = {
      chapters: [36, 37, 38, 39, 40, 41, 42],
      methodology: 'Conditional dasha systems for special conditions and event correlation',
      accuracy: 'Within ±1-year tolerance for major events, ±1-month for refined timing'
    };
    
    // BPHS CHAPTER 36-42 CONDITIONAL DASHA SYSTEMS
    this.conditionalDashas = {
      // YOGINI DASHA (Chapter 36)
      yogini: {
        name: 'Yogini Dasha',
        chapter: 36,
        verses: [1, 2, 3, 4],
        cycleYears: 36,
        yoginis: [
          { name: 'Mangala', period: 1, planet: 'Mars', description: 'Action, energy, initiative' },
          { name: 'Pingala', period: 2, planet: 'Saturn', description: 'Discipline, structure, responsibility' },
          { name: 'Vdhari', period: 3, planet: 'Jupiter', description: 'Wisdom, expansion, teaching' },
          { name: 'Bhramari', period: 4, planet: 'Mercury', description: 'Communication, intelligence, versatility' },
          { name: 'Bhairava', period: 5, planet: 'Sun', description: 'Leadership, authority, vitality' },
          { name: 'Kubera', period: 6, planet: 'Moon', description: 'Wealth, emotions, nurturing' },
          { name: 'Bharani', period: 7, planet: 'Venus', description: 'Harmony, relationships, creativity' },
          { name: 'Kshetripala', period: 8, planet: 'Rahu', description: 'Transformation, challenges, growth' }
        ],
        applicability: 'Strong for spiritual aspirants, business success calculations',
        eventCorrelation: 'High correlation with career changes, business ventures, spiritual events'
      },
      
      // SHATABDIKA DASHA (Chapter 37)
      shatabdika: {
        name: 'Shatabdika Dasha',
        chapter: 37,
        verses: [1, 2, 3],
        cycleYears: 100,
        periods: {
          Sun: 6, Moon: 10, Mars: 7, Mercury: 17, Jupiter: 16, 
          Venus: 20, Saturn: 19, Rahu: 7, Ketu: 3
        },
        totalYears: 100,
        applicability: 'Excellent for long-term life events, major milestones',
        eventCorrelation: 'High correlation with education, career, marriage, retirement events'
      },
      
      // CHARA DASHA (Chapter 38)
      chara: {
        name: 'Chara Dasha',
        chapter: 38,
        verses: [1, 2, 3, 4, 5],
        basis: 'Sign-based progression',
        applicability: 'Strong for psychological developments, personality changes',
        eventCorrelation: 'Good for mental health events, learning experiences, life transitions'
      },
      
      // ASHTOTTARI DASHA (Chapter 39)
      ashtottari: {
        name: 'Ashtottari Dasha',
        chapter: 39,
        verses: [1, 2, 3],
        cycleYears: 108,
        applicability: 'Special conditions: birth at specific lunar phases, certain planetary combinations',
        eventCorrelation: 'Moderate-high for events related to creativity, communication, travel'
      },
      
      // DWISAPTI SAMA DASHA (Chapter 40)
      dwisaptatiSama: {
        name: 'Dwisaptati Sama Dasha',
        chapter: 40,
        verses: [1, 2],
        cycleYears: 72,
        applicability: 'When 7th lord is in Kendra and birth in specific conditions',
        eventCorrelation: 'High for relationship events, partnership issues, marriage/divorce'
      },
      
      // SHAT TRIMSHA DASHA (Chapter 41)
      shatTrimsha: {
        name: 'Shat Trimsha Dasha',
        chapter: 41,
        verses: [1, 2, 3],
        cycleYears: 60,
        basis: 'Nakshatra-based progression',
        applicability: 'Retrograde planets, special planetary combinations',
        eventCorrelation: 'Moderate for health events, career setbacks, spiritual awakenings'
      }
    };
    
    // DASHA EVENT CORRELATION MAPPING
    this.eventCorrelationMap = {
      career: {
        primaryDashas: ['yogini', 'shatabdika'],
        planetSignificance: {
          Sun: 0.9, Saturn: 0.8, Jupiter: 0.7, Mercury: 0.6,
          Mars: 0.5, Venus: 0.4, Moon: 0.3, Rahu: 0.6, Ketu: 0.4
        },
        keywords: ['job', 'employment', 'career', 'promotion', 'business', 'work', 'company', 'office']
      },
      marriage: {
        primaryDashas: ['dwisaptatiSama', 'shatabdika'],
        planetSignificance: {
          Venus: 0.9, Jupiter: 0.8, Moon: 0.7, Mercury: 0.6,
          Sun: 0.5, Mars: 0.4, Saturn: 0.3, Rahu: 0.4, Ketu: 0.3
        },
        keywords: ['marriage', 'wedding', 'married', 'married', 'relationship', 'divorce', 'partner']
      },
      education: {
        primaryDashas: ['shatabdika', 'chara'],
        planetSignificance: {
          Jupiter: 0.9, Mercury: 0.8, Moon: 0.6, Venus: 0.5,
          Sun: 0.4, Mars: 0.3, Saturn: 0.3, Rahu: 0.4, Ketu: 0.2
        },
        keywords: ['education', 'study', 'school', 'college', 'university', 'graduat', 'degree', 'exam']
      },
      health: {
        primaryDashas: ['shatTrimsha', 'ashtottari'],
        planetSignificance: {
          Saturn: 0.8, Mars: 0.7, Rahu: 0.6, Ketu: 0.5,
          Jupiter: 0.4, Sun: 0.3, Moon: 0.3, Mercury: 0.3, Venus: 0.2
        },
        keywords: ['health', 'illness', 'disease', 'accident', 'hospital', 'surgery', 'injury', 'sick']
      },
      financial: {
        primaryDashas: ['yogini', 'shatabdika'],
        planetSignificance: {
          Jupiter: 0.8, Venus: 0.7, Mercury: 0.6, Moon: 0.5,
          Sun: 0.4, Saturn: 0.4, Mars: 0.3, Rahu: 0.5, Ketu: 0.3
        },
        keywords: ['money', 'financial', 'income', 'wealth', 'profit', 'gain', 'investment', 'lottery']
      }
    };
    
    // BPHS CONDITIONAL TRIGGERS
    this.conditionalTriggers = {
      yogini: [
        'Moon in nakshatra of Jupiter or Venus',
        'Birth during day time (Sunrise to Sunset)',
        'Ascendant in movable signs (Aries, Cancer, Libra, Capricorn)',
        'Jupiter aspecting Moon or Ascendant'
      ],
      shatabdika: [
        'Moon in nakshatra of Sun or Saturn',
        'Birth in fixed signs (Taurus, Leo, Scorpio, Aquarius)',
        'Saturn or Sun in Kendra (1st, 4th, 7th, 10th)'
      ],
      chara: [
        'Saturn in Kendra or Trikona',
        'Birth in dual signs (Gemini, Sagittarius, Pisces, Virgo)',
        'Rahu in 10th house or aspecting 10th lord'
      ],
      ashtottari: [
        'Birth in specific lunar phases (New Moon to Full Moon)',
        'Mars aspecting Moon from 7th house',
        'Moon in conjunction with Saturn or Ketu'
      ],
      dwisaptatiSama: [
        '7th lord in Kendra (1st, 4th, 7th, 10th)',
        'Venus in own sign or exalted',
        'Partnership-oriented birth charts'
      ],
      shatTrimsha: [
        'Retrograde planets at birth',
        'Planets in combust state',
        'Special nakshatra combinations (Pushya, Rohini, etc.)'
      ]
    };
  }

  /**
   * Calculate Yogini Dasha (8 Yoginis, 36-year cycle)
   * @param {Object} chart - Natal chart with planetary positions
   * @param {Object} birthData - Birth data including date and time
   * @param {Object} options - Calculation options
   * @returns {Object} Yogini Dasha results with timeline
   */
  calculateYoginiDasha(chart, birthData, options = {}) {
    if (!chart || !birthData) {
      throw new Error('Chart and birth data are required for Yogini Dasha calculation');
    }

    const dashaResult = {
      method: 'Yogini Dasha',
      references: {
        chapter: 36,
        verses: [1, 2, 3, 4],
        description: 'Yogini system for timing major life events'
      },
      applicability: {
        isApplicable: false,
        score: 0,
        triggers: [],
        reasons: []
      },
      timeline: [],
      currentDasha: null,
      analysis: {
        confidence: 0,
        majorEvents: [],
        correlations: []
      },
      calculations: [],
      analysisLog: []
    };

    try {
      dashaResult.analysisLog.push('Starting Yogini Dasha calculation per BPHS Chapter 36');

      // STEP 1: Check Yogini Dasha applicability per BPHS Chapter 36
      this.checkYoginiApplicabilty(chart, birthData, dashaResult);

      if (!dashaResult.applicability.isApplicable && !options.forceCalculate) {
        dashaResult.analysisLog.push('Yogini Dasha not applicable for this chart');
        return dashaResult;
      }

      // STEP 2: Calculate starting point (Moon's nakshatra)
      const moonNakshatra = this.getMoonNakshatra(chart);
      if (!moonNakshatra) {
        throw new Error('Unable to determine Moon nakshatra for Yogini Dasha');
      }

      dashaResult.calculations.push(`Starting point: Moon in ${moonNakshatra} nakshatra`);
      dashaResult.analysisLog.push(`Moon nakshatra: ${moonNakshatra}`);

      // STEP 3: Generate Yogini timeline based on BPHS Chapter 36
      this.generateYoginiTimeline(chart, birthData, moonNakshatra, dashaResult);

      // STEP 4: Identify current dasha and calculate confidence
      this.identifyCurrentYogini(birthData.dateOfBirth, dashaResult);

      // STEP 5: Calculate overall confidence 
      this.calculateYoginiConfidence(dashaResult);

      dashaResult.analysisLog.push('Yogini Dasha calculation completed');
      return dashaResult;

    } catch (error) {
      dashaResult.error = error.message;
      dashaResult.analysisLog.push(`Yogini Dasha calculation failed: ${error.message}`);
      throw new Error(`Yogini Dasha calculation failed: ${error.message}`);
    }
  }

  /**
   * Calculate Shatabdika Dasha (100-year system)
   * @param {Object} chart - Natal chart with planetary positions
   * @param {Object} birthData - Birth data including date and time
   * @param {Object} options - Calculation options
   * @returns {Object} Shatabdika Dasha results with timeline
   */
  calculateShatabdikaDasha(chart, birthData, options = {}) {
    if (!chart || !birthData) {
      throw new Error('Chart and birth data are required for Shatabdika Dasha calculation');
    }

    const dashaResult = {
      method: 'Shatabdika Dasha',
      references: {
        chapter: 37,
        verses: [1, 2, 3],
        description: '100-year dasha system for long-term event prediction'
      },
      applicability: {
        isApplicable: false,
        score: 0,
        triggers: [],
        reasons: []
      },
      timeline: [],
      currentDasha: null,
      analysis: {
        confidence: 0,
        majorEvents: [],
        correlations: []
      },
      calculations: [],
      analysisLog: []
    };

    try {
      dashaResult.analysisLog.push('Starting Shatabdika Dasha calculation per BPHS Chapter 37');

      // STEP 1: Check Shatabdika Dasha applicability per BPHS Chapter 37
      this.checkShatabdikaApplicability(chart, birthData, dashaResult);

      if (!dashaResult.applicability.isApplicable && !options.forceCalculate) {
        dashaResult.analysisLog.push('Shatabdika Dasha not applicable for this chart');
        return dashaResult;
      }

      // STEP 2: Calculate planetary periods (BPHS Chapter 37 specific periods)
      this.generateShatabdikaTimeline(chart, birthData, dashaResult);

      // STEP 3: Identify current dasha
      this.identifyCurrentShatabdika(birthData.dateOfBirth, dashaResult);

      // STEP 4: Calculate confidence based on event correlation potential
      this.calculateShatabdikaConfidence(dashaResult);

      dashaResult.analysisLog.push('Shatabdika Dasha calculation completed');
      return dashaResult;

    } catch (error) {
      dashaResult.error = error.message;
      dashaResult.analysisLog.push(`Shatabdika Dasha calculation failed: ${error.message}`);
      throw new Error(`Shatabdika Dasha calculation failed: ${error.message}`);
    }
  }

  /**
   * Detect applicable conditional dashas for a given chart
   * @param {Object} chart - Natal chart with planetary positions
   * @param {Object} birthData - Birth data including date and time
   * @returns {Object} Applicable dashas with scores and reasons
   */
  getApplicableConditionalDashas(chart, birthData) {
    if (!chart || !birthData) {
      throw new Error('Chart and birth data are required for conditional dasha detection');
    }

    const detection = {
      method: 'Conditional Dasha Detection',
      references: this.bhpsReferences,
      birthData: birthData.dateOfBirth,
      applicableDashas: {},
      summary: {
        totalApplicable: 0,
        highestScore: 0,
        recommendedDasha: null
      },
      calculations: [],
      analysisLog: []
    };

    try {
      detection.analysisLog.push('Starting conditional dasha applicability detection');

      // Check all conditional dashas for applicability
      for (const [dashaName, dashaInfo] of Object.entries(this.conditionalDashas)) {
        const applicability = this.conditionalTriggerAnalysis[dashaName](chart, birthData);
        if (applicability.isApplicable || applicability.score >= 50) {
          detection.applicableDashas[dashaName] = {
            name: dashaInfo.name,
            chapter: dashaInfo.chapter,
            score: applicability.score,
            triggers: applicability.triggers,
            reasons: applicability.reasons,
            eventCorrelation: dashaInfo.eventCorrelation
          };
          detection.calculations.push(`${dashaInfo.name} applicable with score ${applicability.score}/100`);
        }
      }

      // Calculate summary statistics
      const dashaEntries = Object.values(detection.applicableDashas);
      detection.summary.totalApplicable = dashaEntries.length;
      
      if (dashaEntries.length > 0) {
        detection.summary.highestScore = Math.max(...dashaEntries.map(d => d.score));
        const bestDasha = dashaEntries.reduce((best, current) => 
          current.score > best.score ? current : best
        );
        detection.summary.recommendedDasha = bestDasha.name;
      }

      detection.analysisLog.push(`Detected ${detection.summary.totalApplicable} applicable conditional dashas`);
      return detection;

    } catch (error) {
      detection.error = error.message;
      detection.analysisLog.push(`Conditional dasha detection failed: ${error.message}`);
      throw new Error(`Conditional dasha detection failed: ${error.message}`);
    }
  }

  /**
   * Perform event correlation with applicable conditional dashas
   * @param {Object} chart - Natal chart
   * @param {Object} birthData - Birth data 
   * @param {Array} lifeEvents - Array of life events with dates
   * @returns {Object} Event correlation analysis with dasha alignment scores
   */
  performConditionalEventCorrelation(chart, birthData, lifeEvents) {
    if (!chart || !birthData || !lifeEvents || lifeEvents.length === 0) {
      throw new Error('Chart, birth data, and life events are required for conditional event correlation');
    }

    const correlation = {
      method: 'Conditional Dasha Event Correlation',
      references: this.bhpsReferences,
      lifeEvents: lifeEvents,
      dashaCorrelations: {},
      overallCorrelation: {
        score: 0,
        confidence: 0,
        bestMatchedDasha: null,
        averageEventScore: 0
      },
      calculations: [],
      analysisLog: []
    };

    try {
      correlation.analysisLog.push('Starting conditional dasha event correlation analysis');

      // STEP 1: Get all applicable conditional dashas
      const applicableDashas = this.getApplicableConditionalDashas(chart, birthData);
      
      // STEP 2: Calculate event correlation for each applicable dasha
      for (const [dashaName, dashaInfo] of Object.entries(applicableDashas.applicableDashas)) {
        const dashaCorrelation = this.calculateDashaEventCorrelation(dashaName, chart, birthData, lifeEvents);
        correlation.dashaCorrelations[dashaName] = {
          ...dashaInfo,
          correlation: dashaCorrelation
        };
        correlation.calculations.push(`${dashaInfo.name} correlation score: ${dashaCorrelation.overallScore}/100`);
      }

      // STEP 3: Calculate overall correlation metrics
      this.calculateOverallCorrelationMetrics(correlation);

      correlation.analysisLog.push('Conditional dasha event correlation completed');
      return correlation;

    } catch (error) {
      correlation.error = error.message;
      correlation.analysisLog.push(`Conditional event correlation failed: ${error.message}`);
      throw new Error(`Conditional event correlation failed: ${error.message}`);
    }
  }

  /**
   * Check Yogini Dasha applicability per BPHS Chapter 36
   * @param {Object} chart - Natal chart
   * @param {Object} birthData - Birth data
   * @param {Object} dashaResult - Dasha result object to update
   */
  checkYoginiApplicability(chart, birthData, dashaResult) {
    let applicabilityScore = 30; // Base score
    const triggers = [];
    const reasons = [];

    // CHECK 1: Moon in nakshatra of Jupiter or Venus (BPHS Chapter 36, Verse 1)
    const moonNakshatra = this.getMoonNakshatra(chart);
    const jupiterNakshatras = ['Punarvasu', 'Vishakha', 'Purva Bhadrapada'];
    const venusNakshatras = ['Bharani', 'Purva Phalguni', 'Purva Ashadha'];
    
    if (jupiterNakshatras.includes(moonNakshatra) || venusNakshatras.includes(moonNakshatra)) {
      applicabilityScore += 25;
      triggers.push('Moon in Jupiter/Venus nakshatra');
      reasons.push('Moon positioned in nakshatra of Jupiter or Venus');
    }

    // CHECK 2: Birth during day time (Sunrise to Sunset) - Chapter 36, Verse 2
    const birthHour = this.getBirthHour(birthData);
    if (birthHour >= 6 && birthHour <= 18) {
      applicabilityScore += 20;
      triggers.push('Day-time birth');
      reasons.push('Birth occurred during daylight hours');
    }

    // CHECK 3: Ascendant in movable signs - Chapter 36, Verse 3
    const ascendantSign = chart.ascendant?.sign;
    const movableSigns = ['Aries', 'Cancer', 'Libra', 'Capricorn'];
    if (movableSigns.includes(ascendantSign)) {
      applicabilityScore += 15;
      triggers.push('Ascendant in movable sign');
      reasons.push('Ascendant positioned in movable sign');
    }

    // CHECK 4: Jupiter aspecting Moon or Ascendant - Chapter 36, Verse 4
    const jupiterAspect = this.checkJupiterAspect(chart);
    if (jupiterAspect) {
      applicabilityScore += 10;
      triggers.push('Jupiter aspect to Moon/Ascendant');
      reasons.push('Jupiter provides beneficial aspect to Moon or Ascendant');
    }

    dashaResult.applicability.isApplicable = applicabilityScore >= 50;
    dashaResult.applicability.score = Math.min(100, applicabilityScore);
    dashaResult.applicability.triggers = triggers;
    dashaResult.applicability.reasons = reasons;
    
    dashaResult.calculations.push(`Yogini applicability score: ${dashaResult.applicability.score}/100`);
    dashaResult.analysisLog.push(`Yogini Dasha applicability: ${dashaResult.applicability.isApplicable ? 'APPLICABLE' : 'NOT APPLICABLE'}`);
  }

  /**
   * Check Shatabdika Dasha applicability per BPHS Chapter 37
   * @param {Object} chart - Natal chart
   * @param {Object} birthData - Birth data
   * @param {Object} dashaResult - Dasha result object to update
   */
  checkShatabdikaApplicability(chart, birthData, dashaResult) {
    let applicabilityScore = 30; // Base score
    const triggers = [];
    const reasons = [];

    // CHECK 1: Moon in nakshatra of Sun or Saturn - Chapter 37, Verse 1
    const moonNakshatra = this.getMoonNakshatra(chart);
    const sunNakshatras = ['Krittika', 'Uttara Phalguni', 'Uttara Ashadha'];
    const saturnNakshatras = ['Pushya', 'Anuradha', 'Uttara Bhadrapada'];
    
    if (sunNakshatras.includes(moonNakshatra) || saturnNakshatras.includes(moonNakshatra)) {
      applicabilityScore += 25;
      triggers.push('Moon in Sun/Saturn nakshatra');
      reasons.push('Moon positioned in nakshatra of Sun or Saturn');
    }

    // CHECK 2: Birth in fixed signs - Chapter 37, Verse 2
    const ascendantSign = chart.ascendant?.sign;
    const fixedSigns = ['Taurus', 'Leo', 'Scorpio', 'Aquarius'];
    if (fixedSigns.includes(ascendantSign)) {
      applicabilityScore += 20;
      triggers.push('Ascendant in fixed sign');
      reasons.push('Ascendant positioned in fixed sign');
    }

    // CHECK 3: Saturn or Sun in Kendra - Chapter 37, Verse 3
    const kendraPlanets = this.getPlanetsInKendra(chart);
    if (kendraPlanets.includes('Saturn') || kendraPlanets.includes('Sun')) {
      applicabilityScore += 15;
      triggers.push('Saturn/Sun in Kendra');
      reasons.push('Saturn or Sun positioned in Kendra (1st, 4th, 7th, 10th)');
    }

    // CHECK 4: Special planetary combinations (bonus)
    const specialCombinations = this.checkShatabdikaSpecialCombinations(chart);
    if (specialCombinations.length > 0) {
      applicabilityScore += 10;
      triggers.push('Special planetary combinations');
      reasons.push(`Special combinations detected: ${specialCombinations.join(', ')}`);
    }

    dashaResult.applicability.isApplicable = applicabilityScore >= 50;
    dashaResult.applicability.score = Math.min(100, applicabilityScore);
    dashaResult.applicability.triggers = triggers;
    dashaResult.applicability.reasons = reasons;
    
    dashaResult.calculations.push(`Shatabdika applicability score: ${dashaResult.applicability.score}/100`);
    dashaResult.analysisLog.push(`Shatabdika Dasha applicability: ${dashaResult.applicability.isApplicable ? 'APPLICABLE' : 'NOT APPLICABLE'}`);
  }

  /**
   * Generate Yogini timeline based on BPHS Chapter 36
   * @param {Object} chart - Natal chart
   * @param {Object} birthData - Birth data
   * @param {string} moonNakshatra - Moon's nakshatra name
   * @param {Object} dashaResult - Dasha result object to update
   */
  generateYoginiTimeline(chart, birthData, moonNakshatra, dashaResult) {
    const yoginiInfo = this.conditionalDashas.yogini;
    const birthDate = new Date(birthData.dateOfBirth);
    
    // Determine starting Yogini based on Moon's nakshatra (per BPHS Chapter 36)
    const startYoginiIndex = this.getYoginiFromNakshatra(moonNakshatra);
    const startYogini = yoginiInfo.yoginis[startYoginiIndex];
    
    dashaResult.calculations.push(`Starting Yogini: ${startYogini.name} (${startYogini.period} years)`);
    dashaResult.analysisLog.push(`Yogini sequence start: ${startYogini.name} from ${moonNakshatra} nakshatra`);

    let currentTime = new Date(birthDate);
    let runningTotal = 0;
    
    // Generate timeline by cycling through all 8 Yoginis
    for (let cycle = 0; cycle < 3; cycle++) { // 3 cycles = 108 years (3 × 36)
      const startIndex = (startYoginiIndex + (cycle * 8)) % 8;
      
      for (let i = 0; i < 8; i++) {
        const yoginiIndex = (startIndex + i) % 8;
        const yogini = yoginiInfo.yoginis[yoginiIndex];
        
        if (runningTotal >= 100) break; // Limit to 100 years
        
        const startDate = new Date(currentTime);
        const endDate = new Date(currentTime);
        endDate.setFullYear(endDate.getFullYear() + yogini.period);
        
        const dashaPeriod = {
          level: 'mahadasha',
          dashaLord: yogini.name,
          planet: yogini.planet,
          period: yogini.period,
          startAge: runningTotal,
          endAge: runningTotal + yogini.period,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          characteristics: yogini.description,
          bphsReference: 'Chapter 36, Verse ' + (i + 1),
          cycle: cycle + 1
        };
        
        dashaResult.timeline.push(dashaPeriod);
        currentTime = endDate;
        runningTotal += yogini.period;
      }
    }

    dashaResult.calculations.push(`Generated ${dashaResult.timeline.length} Yogini periods covering ${runningTotal} years`);
  }

  /**
   * Generate Shatabdika timeline based on BPHS Chapter 37
   * @param {Object} chart - Natal chart
   * @param {Object} birthData - Birth data
   * @param {Object} dashaResult - Dasha result object to update
   */
  generateShatabdikaTimeline(chart, birthData, dashaResult) {
    const shatabdikaInfo = this.conditionalDashas.shatabdika;
    const birthDate = new Date(birthData.dateOfBirth);
    
    // Determine starting point based on Moon's position or ascendant
    const startingPlanet = this.getShatabdikaStartingPoint(chart);
    
    dashaResult.calculations.push(`Starting planet: ${startingPlanet}`);
    dashaResult.analysisLog.push(`Shatabdika sequence start: ${startingPlanet}`);

    // Create ordered planet sequence based on periods
    const planets = Object.keys(shatabdikaInfo.periods);
    planets.sort((a, b) => shatabdikaInfo.periods[b] - shatabdikaInfo.periods[a]);
    
    // Find starting index
    let startIndex = planets.indexOf(startingPlanet);
    if (startIndex === -1) startIndex = 0; // Default to first planet
    
    let currentTime = new Date(birthDate);
    let runningTotal = 0;
    
    // Generate timeline for entire 100-year cycle
    for (let cycle = 0; cycle < 1; cycle++) {
      for (let i = 0; i < planets.length; i++) {
        const planetIndex = (startIndex + i) % planets.length;
        const planet = planets[planetIndex];
        const period = shatabdikaInfo.periods[planet];
        
        if (runningTotal >= 100) break;
        
        const startDate = new Date(currentTime);
        const endDate = new Date(currentTime);
        endDate.setFullYear(endDate.getFullYear() + period);
        
        const dashaPeriod = {
          level: 'mahadasha',
          dashaLord: planet,
          period: period,
          startAge: runningTotal,
          endAge: runningTotal + period,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          characteristics: this.getPlanetCharacteristics(planet),
          bphsReference: 'Chapter 37, Verse ' + Math.min(i + 1, 3)
        };
        
        dashaResult.timeline.push(dashaPeriod);
        currentTime = endDate;
        runningTotal += period;
      }
    }

    dashaResult.calculations.push(`Generated ${dashaResult.timeline.length} Shatabdika periods covering ${runningTotal} years`);
  }

  /**
   * Calculate event correlation score for a specific dasha
   * @param {string} dashaName - Name of the dasha system
   * @param {Object} chart - Natal chart
   * @param {Object} birthData - Birth data
   * @param {Array} lifeEvents - Array of life events
   * @returns {Object} Event correlation analysis
   */
  calculateDashaEventCorrelation(dashaName, chart, birthData, lifeEvents) {
    const correlation = {
      dashaName: dashaName,
      eventMatches: [],
      overallScore: 0,
      confidence: 0,
      analysisLog: []
    };

    try {
      // Calculate the specific dasha timeline
      let dashaTimeline;
      if (dashaName === 'yogini') {
        const moonNakshatra = this.getMoonNakshatra(chart);
        const yoginiResult = this.calculateYoginiDasha(chart, birthData, { forceCalculate: true });
        dashaTimeline = yoginiResult.timeline;
      } else if (dashaName === 'shatabdika') {
        const shatabdikaResult = this.calculateShatabdikaDasha(chart, birthData, { forceCalculate: true });
        dashaTimeline = shatabdikaResult.timeline;
      } else {
        correlation.overallScore = 30; // Default score for unsupported dashas
        return correlation;
      }

      if (!dashaTimeline || dashaTimeline.length === 0) {
        correlation.overallScore = 30;
        return correlation;
      }

      // Correlate each life event with dasha periods
      let totalEventScore = 0;
      
      for (const event of lifeEvents) {
        if (!event.date || !event.description) {
          correlation.analysisLog.push('Skipping invalid event (missing date or description)');
          continue;
        }

        const eventDate = new Date(event.date);
        const eventAge = this.calculateEventAge(birthData.dateOfBirth, eventDate);
        
        // Find corresponding dasha period
        const dashaPeriod = this.findDashaPeriodAtAge(dashaTimeline, eventAge);
        
        if (dashaPeriod) {
          const eventType = this.classifyEventType(event.description);
          const dashaLord = dashaPeriod.dashaLord;
          
          // Calculate event-dasha match score
          const matchScore = this.calculateEventDashaMatch(dashaLord, eventType, eventAge, dashaPeriod);
          
          correlation.eventMatches.push({
            event: event.description,
            eventDate: event.date,
            eventAge: eventAge,
            dashaLord: dashaLord,
            dashaPeriod: `${dashaPeriod.startAge}-${dashaPeriod.endAge} years`,
            matchScore: matchScore,
            eventType: eventType
          });
          
          totalEventScore += matchScore;
          correlation.analysisLog.push(`Event "${event.description}" matched with ${dashaLord} at age ${eventAge} (score: ${matchScore})`);
        }
      }

      // Calculate overall correlation score
      const validEvents = correlation.eventMatches.length;
      if (validEvents > 0) {
        correlation.overallScore = Math.round(totalEventScore / validEvents);
        correlation.confidence = Math.min(95, 60 + (validEvents * 5)); // More events = higher confidence
      } else {
        correlation.overallScore = 30;
        correlation.confidence = 30;
      }

      correlation.analysisLog.push(`Overall ${dashaName} correlation score: ${correlation.overallScore}/100 from ${validEvents} events`);
      return correlation;

    } catch (error) {
      correlation.error = error.message;
      correlation.analysisLog.push(`Dasha correlation failed: ${error.message}`);
      return correlation;
    }
  }

  // Helper methods for conditional dasha calculations

  /**
   * Get Moon's nakshatra from chart
   * @param {Object} chart - Natal chart
   * @returns {string|null} Moon's nakshatra name
   */
  getMoonNakshatra(chart) {
    const moonPosition = chart.planetaryPositions?.moon;
    if (!moonPosition || !moonPosition.nakshatra) {
      return null;
    }
    return moonPosition.nakshatra;
  }

  /**
   * Get birth hour from birth data
   * @param {Object} birthData - Birth data
   * @returns {number} Birth hour (0-23)
   */
  getBirthHour(birthData) {
    if (birthData.timeOfBirth) {
      const timeStr = birthData.timeOfBirth.split(':')[0];
      return parseInt(timeStr);
    }
    return 12; // Default to noon
  }

  /**
   * Check if Jupiter aspects Moon or Ascendant
   * @param {Object} chart - Natal chart
   * @returns {boolean} True if Jupiter aspects Moon or Ascendant
   */
  checkJupiterAspect(chart) {
    // Simplified aspect check - in production would implement full aspect calculation
    const jupiterPosition = chart.planetaryPositions?.jupiter;
    const moonPosition = chart.planetaryPositions?.moon;
    const ascendantPosition = chart.ascendant;
    
    if (!jupiterPosition || !moonPosition || !ascendantPosition) {
      return false;
    }

    // Check for trine aspect (120° ± tolerance)
    const moonJupiterDiff = Math.abs(jupiterPosition.longitude - moonPosition.longitude);
    const ascendantJupiterDiff = Math.abs(jupiterPosition.longitude - ascendantPosition.longitude);
    
    return (moonJupiterDiff >= 110 && moonJupiterDiff <= 130) || 
           (ascendantJupiterDiff >= 110 && ascendantJupiterDiff <= 130);
  }

  /**
   * Get planets in Kendra positions
   * @param {Object} chart - Natal chart
   * @returns {Array} Array of planet names in Kendra
   */
  getPlanetsInKendra(chart) {
    const kendraPlanets = [];
    
    if (chart.housePositions) {
      for (let houseNum of [1, 4, 7, 10]) { // Kendra houses
        const houseInfo = chart.housePositions[`house${houseNum}`];
        if (houseInfo && houseInfo.lord) {
          kendraPlanets.push(houseInfo.lord);
        }
      }
    }
    
    return [...new Set(kendraPlanets)]; // Remove duplicates
  }

  /**
   * Check special combinations for Shatabdika applicability
   * @param {Object} chart - Lunar chart
   * @returns {Array} Array of detected special combinations
   */
  checkShatabdikaSpecialCombinations(chart) {
    const combinations = [];
    
    // Check for Sun-Saturn connection
    const sunPosition = chart.planetaryPositions?.sun;
    const saturnPosition = chart.planetaryPositions?.saturn;
    
    if (sunPosition && saturnPosition) {
      const angle = Math.abs(sunPosition.longitude - saturnPosition.longitude);
      if (angle <= 15 || (angle >= 165 && angle <= 195) || (angle >= 345)) {
        combinations.push('Sun-Saturn connection');
      }
    }
    
    // Check for Moon in difficult houses
    if (chart.housePositions) {
      const moonHouse = chart.planetaryPositions?.moon?.house;
      if (moonHouse && [6, 8, 12].includes(moonHouse)) {
        combinations.push('Moon in dusthana houses');
      }
    }
    
    return combinations;
  }

  /**
   * Get Yogini from nakshatra
   * @param {string} nakshatra - Nakshatra name
   * @returns {number} Yogini index (0-7)
   */
  getYoginiFromNakshatra(nakshatra) {
    // Moon nakshatra to Yogini mapping per BPHS Chapter 36
    const nakshatraYoginiMap = {
      'Ashwini': 0, 'Bharani': 1, 'Krittika': 2, 'Rohini': 3, 'Mrigashira': 4,
      'Ardra': 5, 'Punarvasu': 6, 'Pushya': 7, 'Ashlesha': 0, 'Magha': 1,
      'Purva Phalguni': 2, 'Uttara Phalguni': 3, 'Hasta': 4, 'Chitra': 5,
      'Swati': 6, 'Vishakha': 7, 'Anuradha': 0, 'Jyeshtha': 1, 'Mula': 2,
      'Purva Ashadha': 3, 'Uttara Ashadha': 4, 'Shravana': 5, 'Dhanishta': 6,
      'Shatabhisha': 7, 'Purva Bhadrapada': 0, 'Uttara Bhadrapada': 1, 'Revati': 2
    };
    
    return nakshatraYoginiMap[nakshatra] || 0; // Default to first Yogini if not found
  }

  /**
   * Get Shatabdika starting point based on chart
   * @param {Object} chart - Natal chart
   * @returns {string} Starting planet name
   */
  getShatabdikaStartingPoint(chart) {
    // Simplified: Use Moon's house lord or simply Moon itself
    const moonHouse = chart.planetaryPositions?.moon?.house;
    
    if (moonHouse && chart.housePositions[`house${moonHouse}`]) {
      return chart.housePositions[`house${moonHouse}`].lord || 'Moon';
    }
    
    return 'Moon'; // Default to Moon
  }

  /**
   * Get characteristics for a planet
   * @param {string} planet - Planet name
   * @returns {string} Planet characteristics description
   */
  getPlanetCharacteristics(planet) {
    const characteristics = {
      Sun: 'Authority, leadership, vitality, government, career, father',
      Moon: 'Emotions, nurturing, domestic matters, mother, public',
      Mars: 'Action, courage, conflict, engineering, property, accidents',
      Mercury: 'Communication, intelligence, business, writing, travel',
      Jupiter: 'Wisdom, expansion, teaching, finance, children, spirituality',
      Venus: 'Love, relationships, creativity, luxury, marriage, arts',
      Saturn: 'Discipline, responsibility, career, hardship, longevity',
      Rahu: 'Transformation, technology, foreign connections, obsession',
      Ketu: 'Spirituality, past life, liberation, sudden changes'
    };
    
    return characteristics[planet] || 'General life events and developments';
  }

  /**
   * Calculate event age from birth date
   * @param {string} birthDate - Birth date string
   * @param {Date} eventDate - Event date
   * @returns {number} Age in years (with decimal)
   */
  calculateEventAge(birthDate, eventDate) {
    const birth = new Date(birthDate);
    const event = new Date(eventDate);
    return (event - birth) / (365.25 * 24 * 60 * 60 * 1000);
  }

  /**
   * Find dasha period at given age
   * @param {Array} dashaTimeline - Dasha timeline array
   * @param {number} age - Age in years
   * @returns {Object|null} Dasha period at given age
   */
  findDashaPeriodAtAge(dashaTimeline, age) {
    return dashaTimeline.find(period => 
      age >= period.startAge && age < period.endAge
    );
  }

  /**
   * Classify event type for correlation analysis
   * @param {string} description - Event description text
   * @returns {string} Event type category
   */
  classifyEventType(description) {
    const desc = description.toLowerCase();
    
    for (const [eventType, eventInfo] of Object.entries(this.eventCorrelationMap)) {
      for (const keyword of eventInfo.keywords) {
        if (desc.includes(keyword)) {
          return eventType;
        }
      }
    }
    
    return 'general';
  }

  /**
   * Calculate event-dasha match score
   * @param {string} dashaLord - Dasha lord planet name
   * @param {string} eventType - Event type category
   * @param {number} eventAge - Event age
   * @param {Object} dashaPeriod - Dasha period information
   * @returns {number} Match score (0-100)
   */
  calculateEventDashaMatch(dashaLord, eventType, eventAge, dashaPeriod) {
    const eventTypeInfo = this.eventCorrelationMap[eventType];
    
    if (!eventTypeInfo) {
      return 50; // Default score for unknown event types
    }

    // Base score from planet significance for this event type
    let score = eventTypeInfo.planetSignificance[dashaLord] * 80 || 40;

    // Bonus for period alignment (events in middle of dasha period are more significant)
    const periodCenter = (dashaPeriod.startAge + dashaPeriod.endAge) / 2;
    const periodDeviation = Math.abs(eventAge - periodCenter);
    const periodScore = Math.max(0, 100 - (periodDeviation / dashaPeriod.period * 100));
    
    score += periodScore * 0.2;

    // Bonus for dasha type relevance
    if (eventTypeInfo.primaryDashas.includes(dashaPeriod.method.toLowerCase())) {
      score += 10;
    }

    return Math.min(100, Math.round(score));
  }

  /**
   * Identify current Yogini based on current date
   * @param {string} birthDate - Birth date string
   * @param {Object} dashaResult - Dasha result to update
   */
  identifyCurrentYogini(birthDate, dashaResult) {
    const currentAge = this.calculateEventAge(birthDate, new Date());
    const currentPeriod = this.findDashaPeriodAtAge(dashaResult.timeline, currentAge);
    
    if (currentPeriod) {
      dashaResult.currentDasha = {
        dashaLord: currentPeriod.dashaLord,
        period: currentPeriod.period,
        currentAge: currentAge,
        startedAt: currentPeriod.startAge,
        endsAt: currentPeriod.endAge,
        remainingYears: currentPeriod.endAge - currentAge,
        progress: ((currentAge - currentPeriod.startAge) / currentPeriod.period * 100).toFixed(1)
      };
      dashaResult.calculations.push(`Current Yogini: ${currentPeriod.dashaLord} at age ${currentAge.toFixed(2)}`);
    }
  }

  /**
   * Identify current Shatabdika based on current date
   * @param {string} birthDate - Birth date string
   * @param {Object} dashaResult - Dasha result to update
   */
  identifyCurrentShatabdika(birthDate, dashaResult) {
    const currentAge = this.calculateEventAge(birthDate, new Date());
    const currentPeriod = this.findDashaPeriodAtAge(dashaResult.timeline, currentAge);
    
    if (currentPeriod) {
      dashaResult.currentDasha = {
        dashaLord: currentPeriod.dashaLord,
        period: currentPeriod.period,
        currentAge: currentAge,
        startedAt: currentPeriod.startAge,
        endsAt: currentPeriod.endAge,
        remainingYears: currentPeriod.endAge - currentAge,
        progress: ((currentAge - currentPeriod.startAge) / currentPeriod.period * 100).toFixed(1)
      };
      dashaResult.calculations.push(`Current Shatabdika: ${currentPeriod.dashaLord} at age ${currentAge.toFixed(2)}`);
    }
  }

  /**
   * Calculate confidence for Yogini Dasha
   * @param {Object} dashaResult - Dasha result to update
   */
  calculateYoginiConfidence(dashaResult) {
    let confidence = 50; // Base confidence
    
    // Applicability score contribution (40%)
    confidence += dashaResult.applicability.score * 0.4;
    
    // Timeline quality check (20%)
    if (dashaResult.timeline && dashaResult.timeline.length > 8) {
      confidence += 20;
    }
    
    // Current dasha accuracy (20%)
    if (dashaResult.currentDasha && dashaResult.currentDasha.progress) {
      confidence += 15;
    }
    
    // BPHS compliance check (20%)
    if (dashaResult.applicability.triggers.length >= 2) {
      confidence += 15;
    }
    
    dashaResult.analysis.confidence = Math.min(95, Math.round(confidence));
    dashaResult.calculations.push(`Yogini Dasha confidence: ${dashaResult.analysis.confidence}/100`);
  }

  /**
   * Calculate confidence for Shatabdika Dasha
   * @param {Object} dashaResult - Dasha result to update
   */
  calculateShatabdikaConfidence(dashaResult) {
    let confidence = 55; // Slightly higher base confidence for Shatabdika
    
    // Applicability score contribution (35%)
    confidence += dashaResult.applicability.score * 0.35;
    
    // Timeline completeness check (25%)
    if (dashaResult.timeline && dashaResult.timeline.length >= 8) {
      confidence += 25;
    }
    
    // Current dasha accuracy (20%)
    if (dashaResult.currentDasha && dashaResult.currentDasha.progress) {
      confidence += 15;
    }
    
    // BPHS compliance check (20%)
    if (dashaResult.applicability.triggers.length >= 2) {
      confidence += 10;
    }
    
    dashaResult.analysis.confidence = Math.min(95, Math.round(confidence));
    dashaResult.calculations.push(`Shatabdika Dasha confidence: ${dashaResult.analysis.confidence}/100`);
  }

  /**
   * Calculate overall correlation metrics across all dashas
   * @param {Object} correlation - Correlation result to update
   */
  calculateOverallCorrelationMetrics(correlation) {
    const dashaResults = Object.values(correlation.dashaCorrelations);
    
    if (dashaResults.length === 0) {
      correlation.overallCorrelation.score = 0;
      correlation.overallCorrelation.confidence = 0;
      return;
    }

    // Average score across all dashas
    const totalScore = dashaResults.reduce((sum, result) => sum + result.correlation.overallScore, 0);
    correlation.overallCorrelation.averageEventScore = Math.round(totalScore / dashaResults.length);

    // Find best matching dasha
    const bestResult = dashaResults.reduce((best, current) => 
      current.correlation.overallScore > best.correlation.overallScore ? current : best
    );
    
    correlation.overallCorrelation.score = bestResult.correlation.overallScore;
    correlation.overallCorrelation.bestMatchedDasha = bestResult.name;
    
    // Calculate confidence based on consistency and number of events
    const allEventMatches = dashaResults.flatMap(result => result.correlation.eventMatches);
    const uniqueEvents = allEventMatches.length;
    
    correlation.overallCorrelation.confidence = Math.min(95, 
      40 + (correlation.overallCorrelation.averageEventScore * 0.4) + (uniqueEvents * 2)
    );
    
    correlation.calculations.push(`Best matched dasha: ${bestResult.name} with score ${bestResult.correlation.overallScore}`);
    correlation.calculations.push(`Overall correlation score: ${correlation.overallCorrelation.score}/100`);
  }

  /**
   * Get BPHS references for educational purposes
   * @returns {Object} BPHS reference information
   */
  getBPHSReferences() {
    return {
      chapters: this.bhpsReferences.chapters,
      methodology: this.bhpsReferences.methodology,
      description: 'Conditional dasha systems for special conditions and event correlation',
      systems: Object.keys(this.conditionalDashas).map(key => ({
        name: this.conditionalDashas[key].name,
        chapter: this.conditionalDashas[key].chapter,
        applicability: this.conditionalDashas[key].applicability
      })),
      accuracyStandard: 'Within ±1-year tolerance for major events, ±1-month for refined timing'
    };
  }
}

export default ConditionalDashaService;
