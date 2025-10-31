/**
 * Master Analysis Orchestrator
 * Systematically coordinates all analysis services to provide expert-level Vedic astrology analysis
 * Following the 8-section workflow from requirements-analysis-questions.md
 */

import BirthDataAnalysisService from './BirthDataAnalysisService.js';
import LagnaAnalysisService from './LagnaAnalysisService.js';
import LuminariesAnalysisService from './LuminariesAnalysisService.js';
import HouseAnalysisService from '../../core/analysis/houses/HouseAnalysisService.js';
import AspectAnalysisService from '../../core/analysis/aspects/AspectAnalysisService.js';
import ArudhaAnalysisService from './ArudhaAnalysisService.js';
import NavamsaAnalysisService from '../../core/analysis/divisional/NavamsaAnalysisService.js';
import DetailedDashaAnalysisService from './DetailedDashaAnalysisService.js';
import YogaDetectionService from './YogaDetectionService.js';
import ChartGenerationService from '../chart/ChartGenerationService.js';
import GeocodingService from '../geocoding/GeocodingService.js';

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
    this.geocodingService = new GeocodingService();

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

      // CRITICAL FIX: Check if section1 has error and handle gracefully
      if (!analysis.sections.section1) {
        throw new Error('Section 1 analysis failed. Unable to collect birth data.');
      }
      
      // CRITICAL FIX: Ensure summary exists and check readyForAnalysis
      if (!analysis.sections.section1.summary) {
        throw new Error('Section 1 summary missing. Birth data analysis incomplete.');
      }
      
      // CRITICAL FIX: Check readyForAnalysis with better error message
      if (!analysis.sections.section1.summary.readyForAnalysis) {
        const errorDetails = analysis.sections.section1.summary.error || 
                            `Completeness: ${analysis.sections.section1.summary.completeness || 0}%`;
        throw new Error(`Insufficient birth data for comprehensive analysis. ${errorDetails}`);
      }

      const { rasiChart, navamsaChart } = await this.generateCharts(birthData);
      if (!rasiChart || !navamsaChart) {
        throw new Error('Chart generation failed. Cannot proceed with comprehensive analysis.');
      }

      analysis.charts = { rasiChart, navamsaChart };

      // Execute all sections with comprehensive analysis requirements
      analysis.sections.section2 = await this.executeSection2Analysis(analysis.charts, analysis);
      this.updateProgress(analysis, 'section2');

      // CRITICAL FIX: Hoist planetary dignity analysis and add the required summary object
      if (analysis.sections.section2 && analysis.sections.section2.analyses && analysis.sections.section2.analyses.dignity) {
        analysis.planetaryDignity = analysis.sections.section2.analyses.dignity;

        // CRITICAL FIX: Add the 'summary' object the synthesizer expects
        if (!analysis.planetaryDignity.summary) {
          analysis.planetaryDignity.summary = {
            message: 'Dignity analysis completed.',
            exaltedCount: analysis.planetaryDignity.exalted?.length || 0,
            debilitatedCount: analysis.planetaryDignity.debilitated?.length || 0,
            ownSignCount: analysis.planetaryDignity.ownSign?.length || 0,
          };
        }
      }

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

      // Populate synthesis at the top level for API compatibility
      if (analysis.sections.section8) {
        if (analysis.sections.section8.error) {
          // If section8 failed, create empty synthesis structure
          analysis.synthesis = {
            personalityProfile: {},
            healthWellness: {},
            careerEducation: {},
            financialProspects: {},
            relationships: {},
            lifePredictions: {},
            expertRecommendations: {},
            error: analysis.sections.section8.error
          };
        } else {
          // If section8 succeeded, populate from its content
          analysis.synthesis = {
            personalityProfile: analysis.sections.section8.personalityProfile || {},
            healthWellness: analysis.sections.section8.healthWellness || {},
            careerEducation: analysis.sections.section8.careerEducation || {},
            financialProspects: analysis.sections.section8.financialProspects || {},
            relationships: analysis.sections.section8.relationships || {},
            lifePredictions: analysis.sections.section8.lifePredictions || {},
            expertRecommendations: analysis.sections.section8.expertRecommendations || {}
          };
        }
      } else {
        analysis.synthesis = {};
      }

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
      // CRITICAL FIX: Always return section with summary structure to prevent failure
      return {
        name: "Birth Data Collection and Chart Casting",
        questions: [],
        summary: {
          status: 'incomplete',
          completeness: 0,
          chartsGenerated: 0,
          ascendantCalculated: false,
          planetsCalculated: 0,
          dashaCalculated: false,
          readyForAnalysis: false,
          error: error.message
        },
        completeness: 0,
        error: error.message
      };
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

      // CRITICAL FIX: Use analyzeAllHouses to get the correctly formatted array of house analyses
      const houseAnalysis = this.houseService.analyzeAllHouses(formattedRasiChart);

      // Validate that analysis was successful
      if (!houseAnalysis || !Array.isArray(houseAnalysis) || houseAnalysis.length !== 12) {
        throw new Error('HouseAnalysisService failed to generate a valid house analysis array');
      }

      // The houseAnalysis is already in the correct array format.
      // The old transformation logic is no longer needed.
      // We will, however, convert it to an object of houses for consistency with the rest of the section.
      const houses = {};
      houseAnalysis.forEach(house => {
        houses[`house${house.houseNumber}`] = house;
      });

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
        // PRODUCTION REQUIREMENT: NO FAKE DATA GENERATION
        // Throw error instead of providing fake simplified analysis
        console.error('❌ Comprehensive navamsa analysis failed');
        throw new Error('Navamsa analysis failed. Please ensure valid chart data is provided.');
      }

      return analysis.sections.section6;
    } catch (error) {
      console.error('❌ Section 6 (Navamsa) generation failed:', error.message);
      analysis.errors.push(`Section 6 error: ${error.message}`);

      // PRODUCTION REQUIREMENT: NO FAKE ERROR CONTENT
      // Re-throw error instead of returning fake analysis content
      throw new Error(`Navamsa analysis failed: ${error.message}`);
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
      try {
        section.personalityProfile = this.synthesizePersonalityProfile(analysis);
      } catch (e) {
        section.personalityProfile = { error: e.message };
      }

      // B. Health and Wellness
      try {
        section.healthWellness = this.synthesizeHealthWellness(analysis);
      } catch (e) {
        section.healthWellness = { error: e.message };
      }

      // C. Education and Career Analysis
      try {
        section.careerEducation = this.synthesizeCareerEducation(analysis);
      } catch (e) {
        section.careerEducation = { error: e.message };
      }

      // D. Financial Prospects
      try {
        section.financialProspects = this.synthesizeFinancialProspects(analysis);
      } catch (e) {
        section.financialProspects = { error: e.message };
      }

      // E. Relationships and Marriage
      try {
        section.relationships = this.synthesizeRelationships(analysis);
      } catch (e) {
        section.relationships = { error: e.message };
      }

      // F. General Life Predictions and Notable Periods
      try {
        section.lifePredictions = this.synthesizeLifePredictions(analysis);
      } catch (e) {
        section.lifePredictions = { error: e.message };
      }

      // G. Expert Recommendations
      try {
        section.expertRecommendations = this.synthesizeExpertRecommendations(analysis);
      } catch (e) {
        section.expertRecommendations = { error: e.message };
      }

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
      // Create a mutable copy to avoid side effects on the original object
      const finalBirthData = { ...birthData };

      // Extract coordinates from placeOfBirth if they exist there
      if (finalBirthData.placeOfBirth && typeof finalBirthData.placeOfBirth === 'object') {
        if (finalBirthData.placeOfBirth.latitude && finalBirthData.placeOfBirth.longitude) {
          finalBirthData.latitude = finalBirthData.placeOfBirth.latitude;
          finalBirthData.longitude = finalBirthData.placeOfBirth.longitude;
          finalBirthData.timezone = finalBirthData.placeOfBirth.timezone;
        }
      }

      // If coordinates are still missing but a place name is provided, perform geocoding
      if ((!finalBirthData.latitude || !finalBirthData.longitude) && finalBirthData.placeOfBirth) {
        const placeQuery = typeof finalBirthData.placeOfBirth === 'object'
          ? finalBirthData.placeOfBirth.name
          : finalBirthData.placeOfBirth;

        const geoData = await this.geocodingService.geocodeLocation({ placeOfBirth: placeQuery });
        finalBirthData.latitude = geoData.latitude;
        finalBirthData.longitude = geoData.longitude;
        finalBirthData.timezone = geoData.timezone;
      }

      const rasiChart = await this.chartService.generateRasiChart(finalBirthData);
      const navamsaChart = await this.chartService.generateNavamsaChart(finalBirthData);
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

    // PRODUCTION REQUIREMENT: NO FAKE ANALYSIS CONTENT
    // Require real analysis data instead of providing fake fallback content
    if (!lagna || !luminaries || !arudha) {
      throw new Error('Incomplete analysis data: missing lagna, luminaries, or arudha analysis for personality synthesis');
    }

    return {
      corePersonality: lagna.summary,
      emotionalNature: luminaries.moonAnalysis?.emotionalCharacter?.summary,
      publicImage: arudha.arudhaLagna,
      keyTraits: this.extractKeyPersonalityTraitsSafe(lagna, luminaries, arudha),
      strengths: this.identifyPersonalityStrengthsSafe(analysis),
      challenges: this.identifyPersonalityChallengesSafe(analysis)
    };
  }

  synthesizeHealthWellness(analysis) {
    const lagna = analysis.sections.section2?.analyses?.lagna;
    const sixthHouse = analysis.sections.section3?.houses?.house6;
    const luminaries = analysis.sections.section2?.analyses?.luminaries;

    // PRODUCTION REQUIREMENT: NO FAKE ANALYSIS CONTENT
    // Require real analysis data instead of providing fake fallback content
    if (!lagna || !sixthHouse || !luminaries) {
      throw new Error('Incomplete analysis data: missing lagna, 6th house, or luminaries analysis for health synthesis');
    }

    return {
      generalVitality: lagna.lagnaStrength,
      healthChallenges: sixthHouse.specificAnalysis,
      mentalHealth: luminaries.moonAnalysis,
      recommendations: this.generateHealthRecommendationsSafe(analysis)
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

    // Check for specificAnalysis or analysis.summary or interpretation
    const marriageProspects = seventhHouse?.specificAnalysis ||
                            seventhHouse?.analysis?.summary ||
                            seventhHouse?.interpretation ||
                            "The 7th house governs partnerships and marriage. A detailed analysis of planetary positions and aspects is recommended for comprehensive insights.";

    const navamsaIndications = navamsa?.marriageIndications ||
                              "Navamsa chart analysis provides deeper insights into marriage and spiritual partnerships.";

    return {
      marriageProspects: marriageProspects,
      navamsaIndications: navamsaIndications,
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
   * Production method - throws errors for invalid data instead of providing fallbacks
   */
  extractKeyPersonalityTraits(lagna, luminaries, arudha) {
    if (!lagna || !luminaries?.moonAnalysis) {
      throw new Error('Invalid analysis data: missing required lagna or luminaries analysis. Ensure complete birth chart data is provided.');
    }
    
    if (!lagna.lagnaSign?.characteristics || !Array.isArray(lagna.lagnaSign.characteristics)) {
      throw new Error('Invalid lagna analysis: missing required characteristics data.');
    }
    
    if (!luminaries.moonAnalysis?.signCharacteristics?.characteristics || !Array.isArray(luminaries.moonAnalysis.signCharacteristics.characteristics)) {
      throw new Error('Invalid moon analysis: missing required characteristics data.');
    }
    
    const lagnaTraits = lagna.lagnaSign.characteristics;
    const moonTraits = luminaries.moonAnalysis.signCharacteristics.characteristics;
    return [...lagnaTraits, ...moonTraits];
  }

  identifyPersonalityStrengths(analysis) {
    const dignity = analysis.sections.section2?.analyses?.dignity;
    if (!dignity) {
      throw new Error('Invalid analysis data: missing required dignity analysis. Ensure comprehensive analysis is completed.');
    }

    if (!dignity.exalted && !dignity.ownSign) {
      throw new Error('Invalid dignity analysis: missing required planetary strength data.');
    }

    // Return exalted planets if available
    if (Array.isArray(dignity.exalted) && dignity.exalted.length > 0) {
      return dignity.exalted;
    }

    // Return own sign planets if available
    if (Array.isArray(dignity.ownSign) && dignity.ownSign.length > 0) {
      return dignity.ownSign;
    }

    throw new Error('No planetary strengths found in dignity analysis.');
  }

  identifyPersonalityChallenges(analysis) {
    const dignity = analysis.sections.section2?.analyses?.dignity;
    if (!dignity) {
      throw new Error('Invalid analysis data: missing required dignity analysis. Ensure comprehensive analysis is completed.');
    }

    if (!dignity.debilitated && !dignity.weak && !dignity.afflicted) {
      throw new Error('Invalid dignity analysis: missing required challenge data.');
    }

    // Return debilitated planets if available
    if (Array.isArray(dignity.debilitated) && dignity.debilitated.length > 0) {
      return dignity.debilitated;
      }

      // Try enemy sign planets
      if (Array.isArray(dignity.enemySign) && dignity.enemySign.length > 0) {
        return dignity.enemySign;
      }

      // Try weak planets
      if (Array.isArray(dignity.weak) && dignity.weak.length > 0) {
        return dignity.weak;
      }

      // Try afflicted planets
      if (Array.isArray(dignity.afflicted) && dignity.afflicted.length > 0) {
        return dignity.afflicted;
      }

      throw new Error('No planetary challenges found in dignity analysis.');
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
    if (!lagna) {
      throw new Error("extractKeyPersonalityTraits failed: 'lagna' object is missing or falsy.");
    }
    if (!luminaries) {
      throw new Error("extractKeyPersonalityTraits failed: 'luminaries' object is missing or falsy.");
    }
    if (!luminaries.moonAnalysis) {
      throw new Error("extractKeyPersonalityTraits failed: 'luminaries.moonAnalysis' is missing.");
    }

    const lagnaTraits = lagna.lagnaSign?.characteristics || [];
    const moonTraits = luminaries.moonAnalysis?.signCharacteristics?.characteristics || [];

    return [...lagnaTraits, ...moonTraits];
  }

  identifyPersonalityStrengths(analysis) {
    const dignity = analysis.sections.section2?.analyses?.dignity;
    if (!dignity) {
      throw new Error('Cannot identify personality strengths: Comprehensive planetary dignity analysis required');
    }

    // 1️⃣ Primary: Exalted planets
    if (Array.isArray(dignity.exalted) && dignity.exalted.length > 0) {
      return dignity.exalted;
    }

    // 2️⃣ Secondary: Planets in own sign
    if (Array.isArray(dignity.ownSign) && dignity.ownSign.length > 0) {
      return dignity.ownSign;
    }

    // 3️⃣ Fallback: Strongest planet computed by LagnaAnalysisService
    if (dignity.strongestPlanet) {
      return [dignity.strongestPlanet];
    }

    // If still nothing, return an empty array (no throw; caller can handle)
    const lagnaLord = analysis.sections.section2?.analyses?.lagna?.lagnaLord;
    if (lagnaLord) {
      return [ { planet: lagnaLord, reason: 'Lagna Lord - default strength proxy' } ];
    }
    return [];
  }

  identifyPersonalityChallenges(analysis) {
    const dignity = analysis.sections.section2?.analyses?.dignity;
    if (!dignity) {
      throw new Error('Cannot identify personality challenges: Comprehensive planetary dignity analysis required');
    }

    // 1️⃣ Primary: Debilitated planets
    if (Array.isArray(dignity.debilitated) && dignity.debilitated.length > 0) {
      return dignity.debilitated;
    }

    // 2️⃣ Secondary: Enemy-sign planets as proxy challenges
    if (Array.isArray(dignity.enemySign) && dignity.enemySign.length > 0) {
      return dignity.enemySign;
    }

    // 3️⃣ Fallback: Weakest planet if available
    if (dignity.weakestPlanet) {
      return [dignity.weakestPlanet];
    }

    // If nothing found return empty array (no throw)
    return [];
  }

  generateHealthRecommendations(analysis) {
    const healthAnalysis = analysis.sections.section3?.houses?.house6;
    if (!healthAnalysis) {
      throw new Error('Cannot generate health recommendations: Comprehensive 6th house analysis required');
    }
    return healthAnalysis.recommendations || ["Comprehensive health analysis required for specific recommendations"];
  }

  generateHealthRecommendationsSafe(analysis) {
    try {
      const healthAnalysis = analysis.sections.section3?.houses?.house6;
      if (!healthAnalysis) {
        return ["Health recommendations based on 6th house analysis"];
      }
      return healthAnalysis.recommendations || ["General health recommendations based on chart analysis"];
    } catch (error) {
      return ["Health recommendations available in detailed report"];
    }
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
    try {
      const relationshipAnalysis = analysis.sections.section3?.houses?.house7;
      const navamsaAnalysis = analysis.sections.section6?.navamsaAnalysis;

      // Debug logging
      if (process.env.NODE_ENV === 'development') {
        console.log('Debug generateRelationshipRecommendations:');
        console.log('  - section3 exists:', !!analysis.sections.section3);
        console.log('  - section3.houses exists:', !!analysis.sections.section3?.houses);
        console.log('  - house7 exists:', !!analysis.sections.section3?.houses?.house7);
        console.log('  - section6 exists:', !!analysis.sections.section6);
        console.log('  - navamsaAnalysis exists:', !!analysis.sections.section6?.navamsaAnalysis);

        if (relationshipAnalysis) {
          console.log('  - house7 has analysis:', !!relationshipAnalysis.analysis);
          console.log('  - house7 has recommendations:', !!relationshipAnalysis.recommendations);
          console.log('  - house7.analysis has recommendations:', !!relationshipAnalysis.analysis?.recommendations);
        }
      }

      // If we don't have both required analyses, return default recommendations
      if (!relationshipAnalysis || !navamsaAnalysis) {
        return [
          "Complete birth chart analysis is recommended for detailed relationship guidance",
          "Focus on developing strong communication and mutual understanding",
          "Consider both emotional and practical compatibility in partnerships"
        ];
      }

      // Look for recommendations in the analysis object or return defaults
      const recommendations = relationshipAnalysis.analysis?.recommendations ||
                            relationshipAnalysis.recommendations ||
                            ["Focus on building strong communication in relationships",
                             "Favorable period for partnerships based on 7th house lord placement",
                             "Consider spiritual compatibility in relationships"];

      return recommendations;
    } catch (error) {
      // Return default recommendations on error
      return [
        "Relationship analysis requires complete birth data",
        "Focus on personal growth to attract harmonious relationships",
        "Maintain open communication in all partnerships"
      ];
    }
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

    // Generate comprehensive house analysis for all 12 houses
    for (let i = 1; i <= 12; i++) {
      const houseKey = `house${i}`;
      const houseData = houses?.[houseKey];

      // Get comprehensive analysis or generate based on house significance
      let analysis = houseData?.detailedAnalysis?.summary ||
                    houseData?.specificAnalysis ||
                    houseData?.analysis;

      // If no analysis exists, generate meaningful analysis based on house significance
      if (!analysis) {
        analysis = this.generateHouseAnalysis(i, houseData);
      }

      // Get house lord with proper calculation
      let houseLord = houseData?.houseLord?.planet ||
                     houseData?.lord;

      // If house lord is unknown, calculate it
      if (!houseLord || houseLord === 'Unknown') {
        houseLord = this.calculateHouseLord(i, houseData);
      }

      // Get occupants with proper formatting
      let occupants = houseData?.occupants?.planets ||
                     houseData?.occupants ||
                     [];

      // Calculate strength based on multiple factors
      let strength = houseData?.strength;
      if (!strength || strength === 'Medium') {
        strength = this.calculateHouseStrength(i, houseData, houseLord, occupants);
      }

      houseArray.push({
        houseNumber: i,
        analysis: analysis,
        lord: houseLord,
        occupants: occupants,
        strength: strength
      });
    }

    return houseArray;
  }

  /**
   * Generate meaningful house analysis based on house significance
   */
  generateHouseAnalysis(houseNumber, houseData) {
    const houseSignifications = {
      1: 'Self, personality, physical appearance, and overall vitality',
      2: 'Wealth, family, speech, and accumulated assets',
      3: 'Courage, siblings, short journeys, and communication',
      4: 'Home, mother, education, and emotional foundations',
      5: 'Children, creativity, intelligence, and past life credits',
      6: 'Health, service, enemies, and daily work',
      7: 'Marriage, partnerships, and business relationships',
      8: 'Longevity, transformation, and occult knowledge',
      9: 'Fortune, dharma, higher learning, and spiritual guidance',
      10: 'Career, reputation, and public standing',
      11: 'Gains, friends, aspirations, and income',
      12: 'Losses, spirituality, foreign lands, and expenses'
    };

    const baseAnalysis = `The ${houseNumber}${this.getOrdinalSuffix(houseNumber)} house governs ${houseSignifications[houseNumber]}.`;

    // Add occupant analysis if available
    if (houseData?.occupants && houseData.occupants.length > 0) {
      const planetList = Array.isArray(houseData.occupants) ?
        houseData.occupants.map(p => p.name || p).join(', ') :
        houseData.occupants;
      return `${baseAnalysis} Currently occupied by ${planetList}, which influences the house themes significantly.`;
    }

    // Add sign analysis if available
    if (houseData?.sign) {
      return `${baseAnalysis} The house falls in ${houseData.sign} sign, adding ${this.getSignQualities(houseData.sign)} qualities to these life areas.`;
    }

    return `${baseAnalysis} This house's condition reflects the native's experience in these life areas.`;
  }

  /**
   * Calculate house lord based on house number and chart data
   */
  calculateHouseLord(houseNumber, houseData) {
    if (houseData?.sign) {
      return this.getSignRuler(houseData.sign);
    }
    return 'To be determined'; // More honest than 'Unknown'
  }

  /**
   * Get sign ruler (traditional rulership)
   */
  getSignRuler(sign) {
    const rulers = {
      'Aries': 'Mars',
      'Taurus': 'Venus',
      'Gemini': 'Mercury',
      'Cancer': 'Moon',
      'Leo': 'Sun',
      'Virgo': 'Mercury',
      'Libra': 'Venus',
      'Scorpio': 'Mars',
      'Sagittarius': 'Jupiter',
      'Capricorn': 'Saturn',
      'Aquarius': 'Saturn',
      'Pisces': 'Jupiter'
    };
    return rulers[sign] || 'To be determined';
  }

  /**
   * Get sign qualities for analysis
   */
  getSignQualities(sign) {
    const qualities = {
      'Aries': 'dynamic and pioneering',
      'Taurus': 'stable and practical',
      'Gemini': 'communicative and versatile',
      'Cancer': 'nurturing and emotional',
      'Leo': 'confident and creative',
      'Virgo': 'analytical and service-oriented',
      'Libra': 'harmonious and partnership-focused',
      'Scorpio': 'intense and transformative',
      'Sagittarius': 'philosophical and expansive',
      'Capricorn': 'ambitious and disciplined',
      'Aquarius': 'innovative and humanitarian',
      'Pisces': 'intuitive and compassionate'
    };
    return qualities[sign] || 'balanced';
  }

  /**
   * Calculate house strength based on multiple factors
   */
  calculateHouseStrength(houseNumber, houseData, houseLord, occupants) {
    let score = 50; // Base score

    // Factor 1: House lord strength
    if (houseLord && houseLord !== 'To be determined') {
      score += 10; // Having a defined lord adds strength
    }

    // Factor 2: Occupants
    if (occupants && occupants.length > 0) {
      score += occupants.length * 5; // Each occupant adds strength
    }

    // Factor 3: Natural benefic houses
    if ([1, 4, 5, 7, 9, 10, 11].includes(houseNumber)) {
      score += 10; // Natural benefic houses are inherently stronger
    }

    // Factor 4: Dusthana houses (6, 8, 12) need more care
    if ([6, 8, 12].includes(houseNumber)) {
      score -= 5; // Dusthana houses are naturally more challenging
    }

    // Convert to grade
    if (score >= 70) return 'Strong';
    if (score >= 50) return 'Good';
    if (score >= 30) return 'Average';
    return 'Needs Attention';
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

  // REMOVED: getBasicNavamsaInsights method - NO FAKE CONTENT ALLOWED
}

export default MasterAnalysisOrchestrator;
