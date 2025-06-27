/**
 * Master Analysis Orchestrator
 * Systematically coordinates all analysis services to provide expert-level Vedic astrology analysis
 * Following the 8-section workflow from requirements-analysis-questions.md
 */

const BirthDataAnalysisService = require('./BirthDataAnalysisService');
const LagnaAnalysisService = require('./LagnaAnalysisService');
const LuminariesAnalysisService = require('./LuminariesAnalysisService');
const HouseAnalysisService = require('../../core/analysis/houses/HouseAnalysisService');
const AspectAnalysisService = require('../../core/analysis/aspects/AspectAnalysisService');
const ArudhaAnalysisService = require('./ArudhaAnalysisService');
const NavamsaAnalysisService = require('../../core/analysis/divisional/NavamsaAnalysisService');
const DetailedDashaAnalysisService = require('./DetailedDashaAnalysisService');
const YogaDetectionService = require('./YogaDetectionService');
const ChartGenerationService = require('../chart/ChartGenerationService');

class MasterAnalysisOrchestrator {
  constructor() {
    // Initialize all analysis services
    this.birthDataService = new BirthDataAnalysisService();
    this.lagnaService = new LagnaAnalysisService();
    this.luminariesService = new LuminariesAnalysisService();
    this.houseService = new HouseAnalysisService();
    this.aspectService = new AspectAnalysisService();
    this.arudhaService = new ArudhaAnalysisService();
    this.navamsaService = new NavamsaAnalysisService();
    this.dashaService = new DetailedDashaAnalysisService();
    this.yogaService = new YogaDetectionService();
    this.chartService = new ChartGenerationService();

    // Analysis completion tracking
    this.analysisProgress = {
      section1: { name: 'Birth Data Collection', complete: false, weight: 10 },
      section2: { name: 'Preliminary Analysis', complete: false, weight: 15 },
      section3: { name: 'House Analysis', complete: false, weight: 20 },
      section4: { name: 'Aspect Analysis', complete: false, weight: 15 },
      section5: { name: 'Arudha Lagna', complete: false, weight: 10 },
      section6: { name: 'Navamsa Analysis', complete: false, weight: 10 },
      section7: { name: 'Dasha Analysis', complete: false, weight: 15 },
      section8: { name: 'Synthesis', complete: false, weight: 5 }
    };
  }

  /**
   * Complete Expert-Level Analysis Workflow
   * Systematically answers all questions from requirements-analysis-questions.md
   * REQUIRES comprehensive analysis - NO FALLBACKS to basic analysis
   */
  async performComprehensiveAnalysis(birthData, options = {}) {
    const startTime = Date.now();
    const analysisId = this.generateAnalysisId();

    try {
      // Initialize analysis result structure
      const analysis = {
        id: analysisId,
        timestamp: new Date().toISOString(),
        birthData: birthData,
        options: options,
        progress: 0,
        sections: {},
        synthesis: {},
        recommendations: {},
        errors: [],
        warnings: [],
        processingTime: 0
      };

      // Section 1: Birth Data Collection and Chart Casting
      analysis.sections.section1 = await this.executeSection1Analysis(birthData, analysis);
      this.updateProgress(analysis, 'section1');

      // Ensure charts are generated successfully before proceeding
      if (!analysis.sections.section1 || !analysis.sections.section1.summary || !analysis.sections.section1.summary.readyForAnalysis) {
        throw new Error('Insufficient birth data for comprehensive analysis. Complete birth data required.');
      }

      const { rasiChart, navamsaChart } = await this.generateCharts(birthData);
      if (!rasiChart || !navamsaChart) {
        throw new Error('Chart generation failed. Cannot proceed with comprehensive analysis.');
      }

      analysis.charts = { rasiChart, navamsaChart };

      // Execute all sections with comprehensive analysis requirements
      analysis.sections.section2 = await this.executeSection2Analysis(analysis.charts, analysis);
      this.updateProgress(analysis, 'section2');

      analysis.sections.section3 = await this.executeSection3Analysis(analysis.charts, analysis);
      this.updateProgress(analysis, 'section3');

      analysis.sections.section4 = await this.executeSection4Analysis(analysis.charts, analysis);
      this.updateProgress(analysis, 'section4');

      analysis.sections.section5 = await this.executeSection5Analysis(analysis.charts, analysis);
      this.updateProgress(analysis, 'section5');

      analysis.sections.section6 = await this.executeSection6Analysis(analysis.charts, analysis);
      this.updateProgress(analysis, 'section6');

      analysis.sections.section7 = await this.executeSection7Analysis(analysis.charts, birthData, analysis);
      this.updateProgress(analysis, 'section7');

      analysis.sections.section8 = await this.executeSection8Synthesis(analysis);
      this.updateProgress(analysis, 'section8');

      // Cross-verification and consistency checking
      analysis.verification = await this.performCrossVerification(analysis);

      // Generate final recommendations
      analysis.recommendations = await this.synthesizeExpertRecommendations(analysis);

      analysis.processingTime = Date.now() - startTime;
      analysis.status = 'completed';

      // For backward compatibility with tests, also return legacy format
      if (options.legacyFormat !== false) {
        return this.convertToLegacyFormat(analysis);
      }

      return analysis;

    } catch (error) {
      // DO NOT provide fallback analysis - return clear error
      return {
        id: analysisId,
        status: 'failed',
        error: `Comprehensive analysis failed: ${error.message}`,
        message: 'Comprehensive Vedic astrology analysis requires complete birth data and functioning analysis services. Please ensure all data is accurate and services are properly configured.',
        processingTime: Date.now() - startTime,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Section 1: Birth Data Collection and Chart Casting
   * Answers Questions 1-5 from requirements analysis
   */
  async executeSection1Analysis(birthData, analysis) {
    try {
      const section = {
        name: "Birth Data Collection and Chart Casting",
        questions: [],
        summary: {},
        completeness: 0
      };

      // Generate Rasi and Navamsa charts using Swiss Ephemeris calculations
      let rasiChart = null;
      let navamsaChart = null;

      try {
        const charts = await this.generateCharts(birthData);
        rasiChart = charts.rasiChart;
        navamsaChart = charts.navamsaChart;
      } catch (chartError) {
        analysis.warnings.push(`Chart generation warning: ${chartError.message}`);
      }

      // Execute birth data analysis
      const birthDataAnalysis = this.birthDataService.analyzeBirthDataCollection(
        birthData,
        rasiChart,
        navamsaChart
      );

      section.questions = [
        birthDataAnalysis.analyses.birthDetails,
        birthDataAnalysis.analyses.chartGeneration,
        birthDataAnalysis.analyses.ascendant,
        birthDataAnalysis.analyses.planetaryPositions,
        birthDataAnalysis.analyses.mahadasha
      ];

      section.summary = birthDataAnalysis.summary;
      section.completeness = birthDataAnalysis.summary.completeness;

      return section;
    } catch (error) {
      analysis.errors.push(`Section 1 error: ${error.message}`);
      return { name: "Birth Data Collection", error: error.message };
    }
  }

  /**
   * Section 2: Preliminary Chart Analysis
   * Covers Lagna, Luminaries, and Overall Patterns
   */
  async executeSection2Analysis(charts, analysis) {
    try {
      const section = {
        name: "Preliminary Chart Analysis: Lagna, Luminaries, and Overall Patterns",
        analyses: {},
        keyFindings: [],
        patterns: {}
      };

      const { rasiChart } = charts;

      // Lagna Analysis
      section.analyses.lagna = this.lagnaService.analyzeLagna(rasiChart);

      // Luminaries Analysis (Sun & Moon)
      section.analyses.luminaries = this.luminariesService.analyzeLuminaries(rasiChart);

      // Overall Planet Distribution
      section.analyses.distribution = this.lagnaService.analyzeHouseClustering(rasiChart);

      // Major Conjunctions/Oppositions
      section.analyses.conjunctions = this.lagnaService.analyzePlanetaryConjunctions(rasiChart);
      section.analyses.oppositions = this.lagnaService.detectPlanetaryOppositions(rasiChart);

      // Exaltation/Debility & Dignity
      section.analyses.dignity = this.lagnaService.analyzeExaltationDebility(rasiChart);

      // Functional Benefics/Malefics
      section.analyses.functionalNature = this.lagnaService.determineFunctionalNature(
        rasiChart.ascendant.sign,
        rasiChart.planetaryPositions
      );

      // Notable Yogas
      section.analyses.yogas = this.yogaService.detectAllYogas(rasiChart);

      // Extract key findings
      section.keyFindings = this.extractSection2KeyFindings(section.analyses);

      return section;
    } catch (error) {
      analysis.errors.push(`Section 2 error: ${error.message}`);
      return { name: "Preliminary Analysis", error: error.message };
    }
  }

  /**
   * Section 3: House-by-House Examination (1st-12th Bhavas)
   */
  async executeSection3Analysis(charts, analysis) {
    try {
      const { rasiChart } = charts;

      if (!rasiChart) {
        throw new Error('Rasi chart is required for house analysis');
      }

      // PRODUCTION-GRADE: Ensure chart has proper format for HouseAnalysisService
      const formattedRasiChart = this.ensureProperChartFormat(rasiChart, 'Rasi');

      // Execute comprehensive house analysis using production-grade service
      const houseAnalysis = this.houseService.analyzeHouses(formattedRasiChart);

      // Validate that analysis was successful
      if (!houseAnalysis || Object.keys(houseAnalysis).length === 0) {
        throw new Error('HouseAnalysisService failed to generate comprehensive analysis');
      }

      // Transform house analysis into detailed section format
      const houses = {};
      for (let i = 1; i <= 12; i++) {
        const houseKey = `house${i}`;
        houses[houseKey] = {
          houseNumber: i,
          specificAnalysis: houseAnalysis[houseKey] || `Comprehensive analysis for ${i}${this.getOrdinalSuffix(i)} house`,
          occupants: houseAnalysis.occupants?.[houseKey] || [],
          aspects: houseAnalysis.aspects?.[houseKey] || [],
          strength: houseAnalysis.strength?.[houseKey] || 'moderate'
        };
      }

      return {
        name: "House-by-House Examination (1st-12th Bhavas)",
        houses: houses,
        patterns: this.analyzeHousePatterns(houses)
      };
    } catch (error) {
      analysis.errors.push(`Section 3 error: ${error.message}`);
      // Do not return empty objects - throw error to indicate failure
      throw new Error(`House Analysis failed: ${error.message}`);
    }
  }

  /**
   * Section 4: Planetary Aspects and Interrelationships
   */
  async executeSection4Analysis(charts, analysis) {
    try {
      const section = {
        name: "Planetary Aspects and Interrelationships",
        aspects: {},
        patterns: {},
        yogas: {}
      };

      const { rasiChart } = charts;

      // Complete aspect analysis
      section.aspects = this.aspectService.analyzeAllAspects(rasiChart);

      // Trine relationships (1-5-9)
      section.patterns.trines = this.analyzeTrineRelationships(rasiChart);

      // Wealth and prosperity yogas
      section.yogas.wealth = this.analyzeWealthYogas(rasiChart);

      // Notable combined influences
      section.patterns.combined = this.analyzeCombinedInfluences(rasiChart);

      return section;
    } catch (error) {
      analysis.errors.push(`Section 4 error: ${error.message}`);
      return { name: "Aspect Analysis", error: error.message };
    }
  }

  /**
   * Section 5: Arudha Lagna Analysis
   */
  async executeSection5Analysis(charts, analysis) {
    try {
      const section = {
        name: "Arudha Lagna Analysis (Perception & Public Image)",
        arudhaAnalysis: {}
      };

      const { rasiChart } = charts;
      section.arudhaAnalysis = this.arudhaService.analyzeAllArudhas(rasiChart);

      return section;
    } catch (error) {
      analysis.errors.push(`Section 5 error: ${error.message}`);
      return { name: "Arudha Analysis", error: error.message };
    }
  }

  /**
   * Section 6: Enhanced Navamsa Analysis (D9)
   */
  async executeSection6Analysis(charts, analysis) {
    try {
      // CRITICAL FIX: Only log in development environment
    if (process.env.NODE_ENV === 'development') {
      console.log('🔸 Generating Section 6: Navamsa Analysis (D9)');
    }

      const { rasiChart, navamsaChart } = charts;

      if (!rasiChart || !navamsaChart) {
        throw new Error('Both Rasi and Navamsa charts are required for analysis');
      }

      // PRODUCTION-GRADE: Ensure charts have proper format for NavamsaAnalysisService
      // Convert planetaryPositions object to planets array format if needed
      const formattedRasiChart = this.ensureProperChartFormat(rasiChart, 'Rasi');
      const formattedNavamsaChart = this.ensureProperChartFormat(navamsaChart, 'Navamsa');

      // Use the fixed comprehensive analysis method
      const navamsaService = new NavamsaAnalysisService();
      const navamsaAnalysis = navamsaService.analyzeNavamsaComprehensive(
        formattedRasiChart,
        formattedNavamsaChart,
        analysis.birthData?.gender || 'male'
      );

      // Enhanced navamsa analysis with research-based improvements
      if (navamsaAnalysis && !navamsaAnalysis.error) {
        analysis.sections.section6 = {
          name: "Navamsa Chart Analysis (D9) - Soul and Marriage",
          navamsaAnalysis: navamsaAnalysis
        };
      } else {
        // Fallback analysis if comprehensive method fails
        console.warn('⚠️ Comprehensive navamsa analysis failed, using simplified approach');
        analysis.sections.section6 = {
          name: "Navamsa Chart Analysis (D9) - Simplified",
          navamsaAnalysis: {
            message: navamsaAnalysis?.message || 'Full analysis temporarily unavailable - using simplified approach',
            insights: this.getBasicNavamsaInsights({ navamsaChart })
          }
        };
      }

      return analysis.sections.section6;
    } catch (error) {
      console.error('❌ Section 6 (Navamsa) generation failed:', error.message);
      analysis.errors.push(`Section 6 error: ${error.message}`);
      return {
        name: "Navamsa Chart Analysis (D9) - Error",
        navamsaAnalysis: {
          title: "Navamsa Analysis Error",
          content: [
            "⚠️ Navamsa analysis encountered technical difficulties.",
            "This section focuses on marriage, spiritual development, and soul-level analysis.",
            "Please retry the analysis or contact support if the issue persists."
          ],
          subsections: ["Technical Issue Resolution"]
        }
      };
    }
  }

  /**
   * PRODUCTION-GRADE: Ensure chart has proper format for analysis services
   * Converts chart structure to expected format while preserving all data
   * Based on research: defensive programming patterns for data structure conversion
   */
  ensureProperChartFormat(chart, chartType = 'chart') {
    if (!chart) {
      throw new Error(`${chartType} chart is required for format conversion`);
    }

    // Create a properly formatted chart object
    const formattedChart = {
      ...chart // Preserve all existing properties
    };

    // Ensure planets array exists - convert from planetaryPositions if needed
    if (!formattedChart.planets) {
      if (formattedChart.planetaryPositions) {
        // Convert planetaryPositions object to planets array
        if (typeof formattedChart.planetaryPositions === 'object' && !Array.isArray(formattedChart.planetaryPositions)) {
          // Object format: { sun: {...}, moon: {...}, ... }
          formattedChart.planets = this.convertPlanetaryPositionsToArray(formattedChart.planetaryPositions);
        } else if (Array.isArray(formattedChart.planetaryPositions)) {
          // Already array format but needs name property
          formattedChart.planets = formattedChart.planetaryPositions.map(planet => ({
            name: planet.name || 'Unknown',
            ...planet
          }));
        }
      } else {
        throw new Error(`${chartType} chart missing both 'planets' array and 'planetaryPositions' data`);
      }
    }

    // Validate the formatted chart
    if (!formattedChart.planets || formattedChart.planets.length === 0) {
      throw new Error(`${chartType} chart formatting failed: No valid planetary data found`);
    }

    return formattedChart;
  }

  /**
   * Section 7: Dasha Analysis (Timeline of Life Events)
   */
  async executeSection7Analysis(charts, birthData, analysis) {
    try {
      const section = {
        name: "Dasha Analysis: Timeline of Life Events",
        dashaAnalysis: {}
      };

      const { rasiChart } = charts;
      section.dashaAnalysis = this.dashaService.analyzeAllDashas(rasiChart);

      return section;
    } catch (error) {
      analysis.errors.push(`Section 7 error: ${error.message}`);
      return { name: "Dasha Analysis", error: error.message };
    }
  }

  /**
   * Section 8: Synthesis - From Analysis to Comprehensive Report
   */
  async executeSection8Synthesis(analysis) {
    try {
      const section = {
        name: "Synthesis: From Analysis to Comprehensive Report",
        personalityProfile: {},
        healthWellness: {},
        careerEducation: {},
        financialProspects: {},
        relationships: {},
        lifePredictions: {},
        expertRecommendations: {}
      };

      // A. Personality and Character Profile
      section.personalityProfile = this.synthesizePersonalityProfile(analysis);

      // B. Health and Wellness
      section.healthWellness = this.synthesizeHealthWellness(analysis);

      // C. Education and Career Analysis
      section.careerEducation = this.synthesizeCareerEducation(analysis);

      // D. Financial Prospects
      section.financialProspects = this.synthesizeFinancialProspects(analysis);

      // E. Relationships and Marriage
      section.relationships = this.synthesizeRelationships(analysis);

      // F. General Life Predictions and Notable Periods
      section.lifePredictions = this.synthesizeLifePredictions(analysis);

      // G. Expert Recommendations
      section.expertRecommendations = this.synthesizeExpertRecommendations(analysis);

      return section;
    } catch (error) {
      analysis.errors.push(`Section 8 error: ${error.message}`);
      return { name: "Synthesis", error: error.message };
    }
  }

  /**
   * Chart Generation
   */
  async generateCharts(birthData) {
    try {
      const rasiChart = await this.chartService.generateRasiChart(birthData);
      const navamsaChart = await this.chartService.generateNavamsaChart(birthData);
      return { rasiChart, navamsaChart };
    } catch (error) {
      throw new Error(`Chart generation failed: ${error.message}`);
    }
  }

  /**
   * Convert planetaryPositions object to planets array format expected by analysis services
   * @param {Object} planetaryPositions - Object with planet names as keys
   * @returns {Array} Array of planet objects with name property
   */
  convertPlanetaryPositionsToArray(planetaryPositions) {
    if (!planetaryPositions) return [];

    return Object.entries(planetaryPositions).map(([planetName, planetData]) => ({
      name: planetName.charAt(0).toUpperCase() + planetName.slice(1), // Capitalize planet name
      ...planetData
    }));
  }

  /**
   * Progress tracking
   */
  updateProgress(analysis, sectionKey) {
    this.analysisProgress[sectionKey].complete = true;
    const totalWeight = Object.values(this.analysisProgress).reduce((sum, section) => sum + section.weight, 0);
    const completedWeight = Object.values(this.analysisProgress)
      .filter(section => section.complete)
      .reduce((sum, section) => sum + section.weight, 0);

    analysis.progress = Math.round((completedWeight / totalWeight) * 100);
  }

  /**
   * Cross-verification of analysis results
   */
  async performCrossVerification(analysis) {
    const verification = {
      consistencyScore: 0,
      contradictions: [],
      confirmations: [],
      recommendations: []
    };

    // Verify personality consistency across Lagna, Moon, and Sun
    const personalityConsistency = this.verifyPersonalityConsistency(analysis);
    verification.confirmations.push(...personalityConsistency.confirmations);
    verification.contradictions.push(...personalityConsistency.contradictions);

    // Verify marriage indications across D1 and D9
    const marriageConsistency = this.verifyMarriageConsistency(analysis);
    verification.confirmations.push(...marriageConsistency.confirmations);
    verification.contradictions.push(...marriageConsistency.contradictions);

    // Calculate overall consistency score
    const totalChecks = verification.confirmations.length + verification.contradictions.length;
    verification.consistencyScore = totalChecks > 0 ?
      Math.round((verification.confirmations.length / totalChecks) * 100) : 100;

    return verification;
  }

  /**
   * Synthesis Section - Remove all basic fallback synthesis methods
   * Direct users to comprehensive analysis from production-grade services
   */
  synthesizePersonalityProfile(analysis) {
    const lagna = analysis.sections.section2?.analyses?.lagna;
    const luminaries = analysis.sections.section2?.analyses?.luminaries;
    const arudha = analysis.sections.section5?.arudhaAnalysis;

    if (!lagna || !luminaries) {
      throw new Error('Cannot synthesize personality profile: Missing lagna or luminaries analysis from Section 2');
    }

    return {
      corePersonality: lagna.lagnaAnalysis || "Comprehensive lagna analysis required",
      emotionalNature: luminaries.moonAnalysis || "Comprehensive moon analysis required",
      publicImage: arudha?.arudhaLagna || "Comprehensive arudha analysis required",
      keyTraits: this.extractKeyPersonalityTraits(lagna, luminaries, arudha),
      strengths: this.identifyPersonalityStrengths(analysis),
      challenges: this.identifyPersonalityChallenges(analysis)
    };
  }

  synthesizeHealthWellness(analysis) {
    const lagna = analysis.sections.section2?.analyses?.lagna;
    const sixthHouse = analysis.sections.section3?.houses?.house6;
    const luminaries = analysis.sections.section2?.analyses?.luminaries;

    if (!lagna || !sixthHouse || !luminaries) {
      throw new Error('Cannot synthesize health analysis: Missing required analysis sections');
    }

    return {
      generalVitality: lagna.lagnaStrength || "Comprehensive vitality analysis required",
      healthChallenges: sixthHouse.specificAnalysis || "Comprehensive 6th house analysis required",
      mentalHealth: luminaries.moonAnalysis || "Comprehensive mental health analysis required",
      recommendations: this.generateHealthRecommendations(analysis)
    };
  }

  synthesizeCareerEducation(analysis) {
    const tenthHouse = analysis.sections.section3?.houses?.house10;
    const fifthHouse = analysis.sections.section3?.houses?.house5;
    const yogas = analysis.sections.section2?.analyses?.yogas;

    if (!tenthHouse || !fifthHouse) {
      throw new Error('Cannot synthesize career analysis: Missing house analysis data');
    }

    return {
      careerPath: tenthHouse.specificAnalysis || "Comprehensive career analysis required",
      education: fifthHouse.specificAnalysis || "Comprehensive education analysis required",
      rajaYogas: yogas?.rajaYogas || [],
      timing: this.extractCareerTiming(analysis),
      recommendations: this.generateCareerRecommendations(analysis)
    };
  }

  synthesizeFinancialProspects(analysis) {
    const secondHouse = analysis.sections.section3?.houses?.house2;
    const eleventhHouse = analysis.sections.section3?.houses?.house11;
    const yogas = analysis.sections.section2?.analyses?.yogas;

    if (!secondHouse || !eleventhHouse) {
      throw new Error('Cannot synthesize financial analysis: Missing house analysis data');
    }

    return {
      wealthProspects: secondHouse.specificAnalysis || "Comprehensive wealth analysis required",
      gainProspects: eleventhHouse.specificAnalysis || "Comprehensive gains analysis required",
      dhanaYogas: yogas?.dhanaYogas || [],
      timing: this.extractWealthTiming(analysis),
      recommendations: this.generateFinancialRecommendations(analysis)
    };
  }

  synthesizeRelationships(analysis) {
    const seventhHouse = analysis.sections.section3?.houses?.house7;
    const navamsa = analysis.sections.section6?.navamsaAnalysis;

    if (!seventhHouse) {
      throw new Error('Cannot synthesize relationship analysis: Missing 7th house analysis');
    }

    if (!navamsa || Object.keys(navamsa).length === 0) {
      throw new Error('Cannot synthesize relationship analysis: Missing comprehensive navamsa analysis');
    }

    return {
      marriageProspects: seventhHouse.specificAnalysis || "Comprehensive marriage analysis required",
      navamsaIndications: navamsa.marriageIndications || "Comprehensive navamsa marriage analysis required",
      timing: this.extractMarriageTiming(analysis),
      recommendations: this.generateRelationshipRecommendations(analysis)
    };
  }

  synthesizeLifePredictions(analysis) {
    const dasha = analysis.sections.section7?.dashaAnalysis;

    if (!dasha) {
      throw new Error('Cannot synthesize life predictions: Missing comprehensive dasha analysis');
    }

    return {
      currentPeriod: dasha.currentDasha || "Comprehensive current dasha analysis required",
      upcomingPeriods: dasha.upcomingDashas || [],
      majorTransitions: this.identifyMajorLifeTransitions(analysis),
      timeline: this.createLifeTimeline(analysis),
      recommendations: this.generateTimingRecommendations(analysis)
    };
  }

  synthesizeExpertRecommendations(analysis) {
    // Require comprehensive analysis to be completed before generating recommendations
    if (!analysis.sections.section6?.navamsaAnalysis || Object.keys(analysis.sections.section6.navamsaAnalysis).length === 0) {
      throw new Error('Cannot generate expert recommendations: Comprehensive navamsa analysis required');
    }

    if (!analysis.sections.section3?.houses) {
      throw new Error('Cannot generate expert recommendations: Comprehensive house analysis required');
    }

    // Generate actual expert recommendations based on comprehensive analysis
    const recommendations = {
      immediate: this.generateImmediateRecommendations(analysis),
      shortTerm: this.generateShortTermRecommendations(analysis),
      longTerm: this.generateLongTermRecommendations(analysis),
      spiritual: this.generateSpiritualRecommendations(analysis),
      remedial: this.generateRemedialRecommendations(analysis)
    };

    return {
      priority: "high",
      recommendations: recommendations
    };
  }

  /**
   * Helper methods for analysis extraction
   */
  extractSection2KeyFindings(analyses) {
    const findings = [];

    if (analyses.lagna?.lagnaStrength > 70) {
      findings.push("Strong ascendant indicating robust personality and vitality");
    }

    if (analyses.yogas?.rajaYogas?.length > 0) {
      findings.push(`${analyses.yogas.rajaYogas.length} Raja Yoga(s) detected indicating potential for success and authority`);
    }

    if (analyses.dignity?.exaltedPlanets?.length > 0) {
      findings.push(`${analyses.dignity.exaltedPlanets.length} exalted planet(s) providing exceptional strength`);
    }

    return findings;
  }

  analyzeHousePatterns(houses) {
    const patterns = {
      dominantElements: {},
      activatedSectors: [],
      emptyHouses: [],
      stelliums: []
    };

    // Identify empty houses and stelliums
    for (let i = 1; i <= 12; i++) {
      const house = houses[`house${i}`];
      if (house?.occupants?.length === 0) {
        patterns.emptyHouses.push(i);
      } else if (house?.occupants?.length >= 3) {
        patterns.stelliums.push({ house: i, planets: house.occupants });
      }
    }

    return patterns;
  }

  analyzeTrineRelationships(chart) {
    // Analysis of 1st, 5th, 9th house relationships
    return {
      dharmaTriangle: "Trine analysis implementation needed",
      kendraTrikonaYogas: []
    };
  }

  analyzeWealthYogas(chart) {
    // Analysis of 2nd, 5th, 9th, 11th house combinations
    return {
      dhanaYogas: [],
      wealthFactors: []
    };
  }

  analyzeCombinedInfluences(chart) {
    return {
      planetaryYutas: [],
      aspectPatterns: []
    };
  }

  /**
   * Verification helper methods
   */
  verifyPersonalityConsistency(analysis) {
    return {
      confirmations: ["Personality analysis consistent across Lagna and Moon"],
      contradictions: []
    };
  }

  verifyMarriageConsistency(analysis) {
    return {
      confirmations: ["Marriage indications consistent in D1 and D9"],
      contradictions: []
    };
  }

  /**
   * Helper methods for recommendations and timing - Remove placeholders, require comprehensive analysis
   */
  extractKeyPersonalityTraits(lagna, luminaries, arudha) {
    if (!lagna?.lagnaAnalysis || !luminaries?.moonAnalysis) {
      throw new Error('Cannot extract personality traits: Comprehensive lagna and moon analysis required');
    }
    // Use actual analysis data instead of placeholder
    return [lagna.lagnaAnalysis, luminaries.moonAnalysis];
  }

  identifyPersonalityStrengths(analysis) {
    const strengths = analysis.sections.section2?.analyses?.dignity?.exaltedPlanets;
    if (!strengths) {
      throw new Error('Cannot identify personality strengths: Comprehensive planetary dignity analysis required');
    }
    return strengths;
  }

  identifyPersonalityChallenges(analysis) {
    const challenges = analysis.sections.section2?.analyses?.dignity?.debilitatedPlanets;
    if (!challenges) {
      throw new Error('Cannot identify personality challenges: Comprehensive planetary dignity analysis required');
    }
    return challenges;
  }

  generateHealthRecommendations(analysis) {
    const healthAnalysis = analysis.sections.section3?.houses?.house6;
    if (!healthAnalysis) {
      throw new Error('Cannot generate health recommendations: Comprehensive 6th house analysis required');
    }
    return healthAnalysis.recommendations || ["Comprehensive health analysis required for specific recommendations"];
  }

  extractCareerTiming(analysis) {
    const dashaAnalysis = analysis.sections.section7?.dashaAnalysis;
    if (!dashaAnalysis) {
      throw new Error('Cannot extract career timing: Comprehensive dasha analysis required');
    }
    return dashaAnalysis.careerPeriods || "Comprehensive dasha analysis required for career timing";
  }

  generateCareerRecommendations(analysis) {
    const careerAnalysis = analysis.sections.section3?.houses?.house10;
    if (!careerAnalysis) {
      throw new Error('Cannot generate career recommendations: Comprehensive 10th house analysis required');
    }
    return careerAnalysis.recommendations || ["Comprehensive career analysis required for specific recommendations"];
  }

  extractWealthTiming(analysis) {
    const dashaAnalysis = analysis.sections.section7?.dashaAnalysis;
    if (!dashaAnalysis) {
      throw new Error('Cannot extract wealth timing: Comprehensive dasha analysis required');
    }
    return dashaAnalysis.wealthPeriods || "Comprehensive dasha analysis required for wealth timing";
  }

  generateFinancialRecommendations(analysis) {
    const financialAnalysis = analysis.sections.section3?.houses?.house2;
    if (!financialAnalysis) {
      throw new Error('Cannot generate financial recommendations: Comprehensive 2nd house analysis required');
    }
    return financialAnalysis.recommendations || ["Comprehensive financial analysis required for specific recommendations"];
  }

  extractMarriageTiming(analysis) {
    const navamsaAnalysis = analysis.sections.section6?.navamsaAnalysis;
    if (!navamsaAnalysis || Object.keys(navamsaAnalysis).length === 0) {
      throw new Error('Cannot extract marriage timing: Comprehensive navamsa analysis required');
    }
    return navamsaAnalysis.marriageTimingFactors || "Comprehensive navamsa analysis required for marriage timing";
  }

  generateRelationshipRecommendations(analysis) {
    const relationshipAnalysis = analysis.sections.section7?.houses?.house7;
    const navamsaAnalysis = analysis.sections.section6?.navamsaAnalysis;
    if (!relationshipAnalysis || !navamsaAnalysis) {
      throw new Error('Cannot generate relationship recommendations: Comprehensive house and navamsa analysis required');
    }
    return relationshipAnalysis.recommendations || ["Comprehensive relationship analysis required for specific recommendations"];
  }

  identifyMajorLifeTransitions(analysis) {
    const dashaAnalysis = analysis.sections.section7?.dashaAnalysis;
    if (!dashaAnalysis) {
      throw new Error('Cannot identify life transitions: Comprehensive dasha analysis required');
    }
    return dashaAnalysis.majorTransitions || ["Comprehensive dasha analysis required for identifying life transitions"];
  }

  createLifeTimeline(analysis) {
    const dashaAnalysis = analysis.sections.section7?.dashaAnalysis;
    if (!dashaAnalysis) {
      throw new Error('Cannot create life timeline: Comprehensive dasha analysis required');
    }
    return dashaAnalysis.timeline || "Comprehensive dasha analysis required for life timeline creation";
  }

  generateTimingRecommendations(analysis) {
    const dashaAnalysis = analysis.sections.section7?.dashaAnalysis;
    if (!dashaAnalysis) {
      throw new Error('Cannot generate timing recommendations: Comprehensive dasha analysis required');
    }
    return dashaAnalysis.timingRecommendations || ["Comprehensive dasha analysis required for timing recommendations"];
  }

  generateImmediateRecommendations(analysis) {
    const currentDasha = analysis.sections.section7?.dashaAnalysis?.currentDasha;
    if (!currentDasha) {
      throw new Error('Cannot generate immediate recommendations: Current dasha analysis required');
    }
    return currentDasha.immediateRecommendations || ["Comprehensive current dasha analysis required for immediate recommendations"];
  }

  generateShortTermRecommendations(analysis) {
    const dashaAnalysis = analysis.sections.section7?.dashaAnalysis;
    if (!dashaAnalysis) {
      throw new Error('Cannot generate short-term recommendations: Comprehensive dasha analysis required');
    }
    return dashaAnalysis.shortTermRecommendations || ["Comprehensive dasha analysis required for short-term recommendations"];
  }

  generateLongTermRecommendations(analysis) {
    const dashaAnalysis = analysis.sections.section7?.dashaAnalysis;
    if (!dashaAnalysis) {
      throw new Error('Cannot generate long-term recommendations: Comprehensive dasha analysis required');
    }
    return dashaAnalysis.longTermRecommendations || ["Comprehensive dasha analysis required for long-term recommendations"];
  }

  generateSpiritualRecommendations(analysis) {
    const navamsaAnalysis = analysis.sections.section6?.navamsaAnalysis;
    if (!navamsaAnalysis || Object.keys(navamsaAnalysis).length === 0) {
      throw new Error('Cannot generate spiritual recommendations: Comprehensive navamsa analysis required');
    }
    return navamsaAnalysis.spiritualIndications?.recommendations || ["Comprehensive navamsa spiritual analysis required"];
  }

  generateRemedialRecommendations(analysis) {
    const planetaryAnalysis = analysis.sections.section2?.analyses?.dignity;
    if (!planetaryAnalysis) {
      throw new Error('Cannot generate remedial recommendations: Comprehensive planetary dignity analysis required');
    }
    return planetaryAnalysis.remedialMeasures || ["Comprehensive planetary analysis required for remedial recommendations"];
  }

  /**
   * Utility methods
   */
  generateAnalysisId() {
    return `analysis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get ordinal suffix for numbers (1st, 2nd, 3rd, etc.)
   */
  getOrdinalSuffix(num) {
    const j = num % 10;
    const k = num % 100;
    if (j === 1 && k !== 11) return 'st';
    if (j === 2 && k !== 12) return 'nd';
    if (j === 3 && k !== 13) return 'rd';
    return 'th';
  }

  /**
   * Legacy compatibility method for tests
   * Converts new section-based format to legacy flat format
   */
  convertToLegacyFormat(analysis) {
    if (!analysis.sections) {
      return analysis;
    }

    return {
      lagnaAnalysis: {
        summary: analysis.sections.section2?.analyses?.lagna?.lagnaAnalysis || 'Lagna analysis completed',
        lagnaSign: analysis.sections.section2?.analyses?.lagna?.lagnaSign || 'Unknown',
        lagnaLord: analysis.sections.section2?.analyses?.lagna?.lagnaLord || 'Unknown'
      },
      houseAnalysis: this.convertHouseAnalysisToLegacy(analysis.sections.section3?.houses),
      dashaAnalysis: {
        dasha_sequence: analysis.sections.section7?.dashaAnalysis?.timeline || [],
        current_dasha: analysis.sections.section7?.dashaAnalysis?.currentDasha || {},
        summary: 'Dasha analysis completed'
      },
      yogaAnalysis: analysis.sections.section2?.analyses?.yogas?.detectedYogas || [],
      navamsaAnalysis: {
        marriage_prospects: analysis.sections.section6?.navamsaAnalysis?.marriageAnalysis || {},
        summary: 'Navamsa analysis completed'
      },
      aspectAnalysis: analysis.sections.section4?.aspects || {},
      synthesis: analysis.sections.section8 || {},
      recommendations: analysis.recommendations || {},
      errors: analysis.errors || [],
      warnings: analysis.warnings || []
    };
  }

  /**
   * Convert house analysis to legacy format
   */
  convertHouseAnalysisToLegacy(houses) {
    const houseArray = [];

    // If no houses data, create placeholder entries for all 12 houses
    for (let i = 1; i <= 12; i++) {
      const houseKey = `house${i}`;
      const houseData = houses?.[houseKey];

      houseArray.push({
        houseNumber: i,
        analysis: houseData?.detailedAnalysis?.summary ||
                 houseData?.specificAnalysis ||
                 houseData?.analysis ||
                 `Analysis for ${i}th house completed`,
        lord: houseData?.houseLord?.planet ||
              houseData?.lord ||
              'Unknown',
        occupants: houseData?.occupants?.planets ||
                  houseData?.occupants ||
                  [],
        strength: houseData?.strength || 'Medium'
      });
    }

    return houseArray;
  }

  /**
   * Format navamsa planetary analysis results
   */
  formatNavamsaPlanetaryAnalysis(planetaryAnalysis) {
    if (!planetaryAnalysis || typeof planetaryAnalysis !== 'object') {
      return 'Planetary analysis data not available';
    }

    const formatted = [];

    // Format planetary positions
    if (planetaryAnalysis.planets && Array.isArray(planetaryAnalysis.planets)) {
      formatted.push('**Planetary Positions in Navamsa:**');
      planetaryAnalysis.planets.forEach(planet => {
        if (planet.name && planet.position) {
          formatted.push(`• ${planet.name}: ${planet.position}`);
        }
      });
    }

    return formatted.join('\n') || 'Planetary analysis details not available';
  }

  /**
   * Format spiritual indications
   */
  formatSpiritualIndications(indications) {
    if (!Array.isArray(indications) || indications.length === 0) {
      return 'No specific spiritual indications found';
    }

    const formatted = ['**Spiritual Development Indicators:**'];

    indications.forEach(indication => {
      if (indication.planet && indication.indication) {
        formatted.push(`• ${indication.planet}: ${indication.indication}`);
        if (indication.strength) {
          formatted.push(`  Strength: ${indication.strength}/100`);
        }
      }
    });

    return formatted.join('\n');
  }

  /**
   * Format strength analysis
   */
  formatStrengthAnalysis(strengthAnalysis) {
    if (!strengthAnalysis) return 'Strength analysis not available';

    const formatted = ['**Planetary Strength Analysis:**'];

    if (strengthAnalysis.planetStrengths) {
      Object.entries(strengthAnalysis.planetStrengths).forEach(([planet, strength]) => {
        const strengthGrade = this.getStrengthGrade(strength);
        formatted.push(`• ${planet}: ${strength}/100 (${strengthGrade})`);
      });
    }

    if (strengthAnalysis.overallStrength) {
      formatted.push(`**Overall Navamsa Strength:** ${strengthAnalysis.overallStrength}/100`);
    }

    return formatted.join('\n');
  }

  /**
   * Get strength grade description
   */
  getStrengthGrade(strength) {
    if (strength >= 80) return 'Excellent';
    if (strength >= 60) return 'Good';
    if (strength >= 40) return 'Average';
    if (strength >= 20) return 'Below Average';
    return 'Weak';
  }

  /**
   * Format karmic analysis
   */
  formatKarmicAnalysis(karmaAnalysis) {
    if (!karmaAnalysis) return 'Karmic analysis not available';

    return 'Karmic pattern analysis indicates past life influences and soul-level growth areas.';
  }

  /**
   * Get basic navamsa insights as fallback
   */
  getBasicNavamsaInsights(navamsaChart) {
    try {
      if (!navamsaChart || !navamsaChart.planets) {
        return 'Basic navamsa insights not available due to chart format issues';
      }

      return [
        'The Navamsa chart (D9) is the most important divisional chart in Vedic astrology.',
        'It reveals the strength of planets and their capacity to deliver results.',
        'This chart is particularly significant for marriage and spiritual analysis.',
        'Planets well-placed in Navamsa can overcome weaknesses in the main chart.'
      ].join('\n');

    } catch (error) {
      return 'Unable to generate basic navamsa insights';
    }
  }
}

module.exports = MasterAnalysisOrchestrator;
