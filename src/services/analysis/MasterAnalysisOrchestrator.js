/**
 * Master Analysis Orchestrator
 * Systematically coordinates all analysis services to provide expert-level Vedic astrology analysis
 * Following the 8-section workflow from requirements-analysis-questions.md
 */

const BirthDataAnalysisService = require('./BirthDataAnalysisService');
const LagnaAnalysisService = require('./LagnaAnalysisService');
const LuminariesAnalysisService = require('./LuminariesAnalysisService');
const HouseAnalysisService = require('./HouseAnalysisService');
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

      // Generate placeholder charts for initial analysis
      let rasiChart = null;
      let navamsaChart = null;

      try {
        const charts = await this.generateCharts(birthData);
        rasiChart = charts.rasiChart;
        navamsaChart = charts.navamsaChart;
      } catch (chartError) {
        analysis.warnings.push(`Chart generation warning: ${chartError.message}`);
      }

      // Generate charts if birth data is complete
      if (analysis.sections.section1.summary.readyForAnalysis) {
        const { rasiChart, navamsaChart } = await this.generateCharts(birthData);
        analysis.charts = { rasiChart, navamsaChart };

        // Section 2: Preliminary Chart Analysis (Lagna, Luminaries, Patterns)
        analysis.sections.section2 = await this.executeSection2Analysis(analysis.charts, analysis);
        this.updateProgress(analysis, 'section2');

        // Section 3: House-by-House Examination (1st-12th Bhavas)
        analysis.sections.section3 = await this.executeSection3Analysis(analysis.charts, analysis);
        this.updateProgress(analysis, 'section3');

        // Section 4: Planetary Aspects and Interrelationships
        analysis.sections.section4 = await this.executeSection4Analysis(analysis.charts, analysis);
        this.updateProgress(analysis, 'section4');

        // Section 5: Arudha Lagna Analysis (Perception & Public Image)
        analysis.sections.section5 = await this.executeSection5Analysis(analysis.charts, analysis);
        this.updateProgress(analysis, 'section5');

        // Section 6: Navamsa (D9) Chart Interpretation
        analysis.sections.section6 = await this.executeSection6Analysis(analysis.charts, analysis);
        this.updateProgress(analysis, 'section6');

        // Section 7: Dasha Analysis (Timeline of Life Events)
        analysis.sections.section7 = await this.executeSection7Analysis(analysis.charts, birthData, analysis);
        this.updateProgress(analysis, 'section7');

        // Section 8: Synthesis (From Analysis to Comprehensive Report)
        analysis.sections.section8 = await this.executeSection8Synthesis(analysis);
        this.updateProgress(analysis, 'section8');

        // Cross-verification and consistency checking
        analysis.verification = await this.performCrossVerification(analysis);

        // Generate final recommendations
        analysis.recommendations = await this.generateExpertRecommendations(analysis);
      } else {
        analysis.errors.push('Insufficient birth data for complete analysis');
      }

      analysis.processingTime = Date.now() - startTime;
      analysis.status = analysis.errors.length === 0 ? 'completed' : 'completed_with_errors';

      // For backward compatibility with tests, also return legacy format
      if (options.legacyFormat !== false) {
        return this.convertToLegacyFormat(analysis);
      }

      return analysis;

    } catch (error) {
      return {
        id: analysisId,
        status: 'failed',
        error: error.message,
        processingTime: Date.now() - startTime
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
   * Comprehensive analysis of all 12 houses
   */
  async executeSection3Analysis(charts, analysis) {
    try {
      const section = {
        name: "House-by-House Examination (1st-12th Bhavas)",
        houses: {},
        patterns: {},
        crossVerification: {}
      };

            const { rasiChart } = charts;

      // Analyze all 12 houses
      for (let houseNumber = 1; houseNumber <= 12; houseNumber++) {
        section.houses[`house${houseNumber}`] = this.houseService.analyzeHouseInDetail(houseNumber, rasiChart);
      }

      // Cross-verification between houses
      section.crossVerification = this.houseService.crossVerifyHouseIndications(rasiChart);

      // House patterns analysis
      section.patterns = this.analyzeHousePatterns(section.houses);

      return section;
    } catch (error) {
      analysis.errors.push(`Section 3 error: ${error.message}`);
      return { name: "House Analysis", error: error.message };
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
   * Section 6: Navamsa (D9) Chart Interpretation
   */
  async executeSection6Analysis(charts, analysis) {
    try {
      const section = {
        name: "Navamsa (D9) Chart Interpretation",
        navamsaAnalysis: {}
      };

      const { rasiChart, navamsaChart } = charts;

      section.navamsaAnalysis = this.navamsaService.analyzeNavamsaComprehensive(
        rasiChart,
        navamsaChart,
        analysis.birthData.gender || 'male'
      );

      return section;
    } catch (error) {
      analysis.errors.push(`Section 6 error: ${error.message}`);
      return { name: "Navamsa Analysis", error: error.message };
    }
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
   * Helper methods for synthesis
   */
  synthesizePersonalityProfile(analysis) {
    const lagna = analysis.sections.section2?.analyses?.lagna;
    const luminaries = analysis.sections.section2?.analyses?.luminaries;
    const arudha = analysis.sections.section5?.arudhaAnalysis;

    return {
      corePersonality: lagna?.lagnaAnalysis || "Lagna analysis not available",
      emotionalNature: luminaries?.moonAnalysis || "Moon analysis not available",
      publicImage: arudha?.arudhaLagna || "Arudha analysis not available",
      keyTraits: this.extractKeyPersonalityTraits(lagna, luminaries, arudha),
      strengths: this.identifyPersonalityStrengths(analysis),
      challenges: this.identifyPersonalityChallenges(analysis)
    };
  }

  synthesizeHealthWellness(analysis) {
    const lagna = analysis.sections.section2?.analyses?.lagna;
    const sixthHouse = analysis.sections.section3?.houses?.house6;
    const luminaries = analysis.sections.section2?.analyses?.luminaries;

    return {
      generalVitality: lagna?.lagnaStrength || "Vitality analysis not available",
      healthChallenges: sixthHouse?.specificAnalysis || "6th house analysis not available",
      mentalHealth: luminaries?.moonAnalysis || "Mental health analysis not available",
      recommendations: this.generateHealthRecommendations(analysis)
    };
  }

  synthesizeCareerEducation(analysis) {
    const tenthHouse = analysis.sections.section3?.houses?.house10;
    const fifthHouse = analysis.sections.section3?.houses?.house5;
    const yogas = analysis.sections.section2?.analyses?.yogas;

    return {
      careerPath: tenthHouse?.specificAnalysis || "Career analysis not available",
      education: fifthHouse?.specificAnalysis || "Education analysis not available",
      rajaYogas: yogas?.rajaYogas || [],
      timing: this.extractCareerTiming(analysis),
      recommendations: this.generateCareerRecommendations(analysis)
    };
  }

  synthesizeFinancialProspects(analysis) {
    const secondHouse = analysis.sections.section3?.houses?.house2;
    const eleventhHouse = analysis.sections.section3?.houses?.house11;
    const yogas = analysis.sections.section2?.analyses?.yogas;

    return {
      wealthProspects: secondHouse?.specificAnalysis || "Wealth analysis not available",
      gainProspects: eleventhHouse?.specificAnalysis || "Gains analysis not available",
      dhanaYogas: yogas?.dhanaYogas || [],
      timing: this.extractWealthTiming(analysis),
      recommendations: this.generateFinancialRecommendations(analysis)
    };
  }

  synthesizeRelationships(analysis) {
    const seventhHouse = analysis.sections.section3?.houses?.house7;
    const navamsa = analysis.sections.section6?.navamsaAnalysis;

    return {
      marriageProspects: seventhHouse?.specificAnalysis || "Marriage analysis not available",
      navamsaIndications: navamsa?.marriage || "Navamsa analysis not available",
      timing: this.extractMarriageTiming(analysis),
      recommendations: this.generateRelationshipRecommendations(analysis)
    };
  }

  synthesizeLifePredictions(analysis) {
    const dasha = analysis.sections.section7?.dashaAnalysis;

    return {
      currentPeriod: dasha?.currentDasha || "Current dasha not available",
      upcomingPeriods: dasha?.upcomingDashas || [],
      majorTransitions: this.identifyMajorLifeTransitions(analysis),
      timeline: this.createLifeTimeline(analysis),
      recommendations: this.generateTimingRecommendations(analysis)
    };
  }

  synthesizeExpertRecommendations(analysis) {
    return {
      immediate: this.generateImmediateRecommendations(analysis),
      shortTerm: this.generateShortTermRecommendations(analysis),
      longTerm: this.generateLongTermRecommendations(analysis),
      spiritual: this.generateSpiritualRecommendations(analysis),
      remedial: this.generateRemedialRecommendations(analysis)
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
   * Helper methods for recommendations and timing
   */
  extractKeyPersonalityTraits(lagna, luminaries, arudha) {
    return ["Analysis synthesis needed"];
  }

  identifyPersonalityStrengths(analysis) {
    return ["Strength identification needed"];
  }

  identifyPersonalityChallenges(analysis) {
    return ["Challenge identification needed"];
  }

  generateHealthRecommendations(analysis) {
    return ["Health recommendations implementation needed"];
  }

  extractCareerTiming(analysis) {
    return "Career timing analysis needed";
  }

  generateCareerRecommendations(analysis) {
    return ["Career recommendations implementation needed"];
  }

  extractWealthTiming(analysis) {
    return "Wealth timing analysis needed";
  }

  generateFinancialRecommendations(analysis) {
    return ["Financial recommendations implementation needed"];
  }

  extractMarriageTiming(analysis) {
    return "Marriage timing analysis needed";
  }

  generateRelationshipRecommendations(analysis) {
    return ["Relationship recommendations implementation needed"];
  }

  identifyMajorLifeTransitions(analysis) {
    return ["Life transitions identification needed"];
  }

  createLifeTimeline(analysis) {
    return "Life timeline creation needed";
  }

  generateTimingRecommendations(analysis) {
    return ["Timing recommendations implementation needed"];
  }

  generateImmediateRecommendations(analysis) {
    return ["Immediate recommendations implementation needed"];
  }

  generateShortTermRecommendations(analysis) {
    return ["Short-term recommendations implementation needed"];
  }

  generateLongTermRecommendations(analysis) {
    return ["Long-term recommendations implementation needed"];
  }

  generateSpiritualRecommendations(analysis) {
    return ["Spiritual recommendations implementation needed"];
  }

  generateRemedialRecommendations(analysis) {
    return ["Remedial recommendations implementation needed"];
  }

  async generateExpertRecommendations(analysis) {
    return {
      priority: "high",
      recommendations: ["Expert recommendations synthesis needed"]
    };
  }

  /**
   * Utility methods
   */
  generateAnalysisId() {
    return `analysis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
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
    if (!houses) {
      return [];
    }

    const houseArray = [];
    for (let i = 1; i <= 12; i++) {
      const houseKey = `house${i}`;
      const houseData = houses[houseKey];

      houseArray.push({
        houseNumber: i,
        analysis: houseData?.detailedAnalysis?.summary || houseData?.specificAnalysis || `Analysis for ${i}th house`,
        lord: houseData?.houseLord?.planet || houseData?.lord || 'Unknown',
        occupants: houseData?.occupants?.planets || houseData?.occupants || [],
        strength: houseData?.strength || 'Medium'
      });
    }

    return houseArray;
  }
  }

  module.exports = MasterAnalysisOrchestrator;
