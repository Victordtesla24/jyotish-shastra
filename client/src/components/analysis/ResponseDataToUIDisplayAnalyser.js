/**
 * Complete data analysis layer for comprehensive analysis display
 * Handles data loading, caching, and transformation for UI display
 */

import UIDataSaver from '../forms/UIDataSaver';

const ResponseDataToUIDisplayAnalyser = {
  /**
   * Process comprehensive analysis API response
   * @param {Object} apiResponse - Raw API response
   * @returns {Object} Formatted data for UI display
   */
  processComprehensiveAnalysis: (apiResponse) => {
    if (!apiResponse) return null;

    // Handle multiple response formats
    let analysis;
    if (apiResponse.analysis) {
      analysis = apiResponse.analysis; // Standard: {success: true, analysis: {sections: {}}}
    } else if (apiResponse.sections) {
      analysis = apiResponse; // Direct: {sections: {}}
    } else {
      return null;
    }

    const { sections } = analysis;
    if (!sections || Object.keys(sections).length === 0) return null;

    return {
      success: apiResponse.success || true,
      sections: sections,
      sectionOrder: ['section1', 'section2', 'section3', 'section4', 'section5', 'section6', 'section7', 'section8'],
      synthesis: analysis.synthesis || null,
      recommendations: analysis.recommendations || null
    };
  },

  /**
   * Process houses analysis API response
   * @param {Object} apiResponse - Raw API response
   * @returns {Object} Formatted data for UI display
   */
  processHouseAnalysis: (apiResponse) => {
    if (!apiResponse || !apiResponse.analysis) {
      console.error('Invalid houses analysis API response structure');
      return null;
    }

    const { analysis } = apiResponse;
    console.log('Processing houses analysis data:', Object.keys(analysis.houses || {}));

    return {
      success: apiResponse.success,
      section: analysis.section,
      houses: analysis.houses || {},
      message: analysis.message
    };
  },

  /**
   * Process dasha analysis API response
   * @param {Object} apiResponse - Raw API response
   * @returns {Object} Formatted data for UI display
   */
  processDashaAnalysis: (apiResponse) => {
    if (!apiResponse || !apiResponse.analysis) {
      console.error('Invalid dasha analysis API response structure');
      return null;
    }

    const { analysis } = apiResponse;
    console.log('Processing dasha analysis data:', Object.keys(analysis.dashaAnalysis || {}));

    return {
      success: apiResponse.success,
      section: analysis.section,
      dashaAnalysis: analysis.dashaAnalysis || {},
      currentDasha: analysis.dashaAnalysis?.currentDasha || analysis.dashaAnalysis?.current_dasha,
      dashaSequence: analysis.dashaAnalysis?.dasha_sequence || analysis.dashaAnalysis?.timeline,
      message: analysis.message
    };
  },

  /**
   * Process navamsa analysis API response
   * @param {Object} apiResponse - Raw API response
   * @returns {Object} Formatted data for UI display
   */
  processNavamsaAnalysis: (apiResponse) => {
    if (!apiResponse || !apiResponse.analysis) {
      console.error('Invalid navamsa analysis API response structure');
      return null;
    }

    const { analysis } = apiResponse;
    console.log('Processing navamsa analysis data:', Object.keys(analysis.navamsaAnalysis || {}));

    return {
      success: apiResponse.success,
      section: analysis.section,
      navamsaAnalysis: analysis.navamsaAnalysis || {},
      message: analysis.message
    };
  },

  /**
   * Process aspects analysis API response
   * @param {Object} apiResponse - Raw API response
   * @returns {Object} Formatted data for UI display
   */
  processAspectsAnalysis: (apiResponse) => {
    if (!apiResponse || !apiResponse.analysis) {
      console.error('Invalid aspects analysis API response structure');
      return null;
    }

    const { analysis } = apiResponse;
    console.log('Processing aspects analysis data:', Object.keys(analysis.aspects || {}));

    // Handle empty aspects (common case)
    const aspects = analysis.aspects || {};
    if (Object.keys(aspects).length === 0) {
      return {
        success: apiResponse.success,
        section: analysis.section,
        aspects: {
          majorAspects: [],
          beneficAspects: [],
          challengingAspects: [],
          yogas: []
        },
        message: analysis.message || 'Aspects analysis available in comprehensive report',
        isEmpty: true
      };
    }

    return {
      success: apiResponse.success,
      section: analysis.section,
      aspects: aspects,
      message: analysis.message
    };
  },

  /**
   * Process arudha analysis API response
   * @param {Object} apiResponse - Raw API response
   * @returns {Object} Formatted data for UI display
   */
  processArudhaAnalysis: (apiResponse) => {
    if (!apiResponse || !apiResponse.analysis) {
      console.error('Invalid arudha analysis API response structure');
      return null;
    }

    const { analysis } = apiResponse;
    console.log('Processing arudha analysis data:', Object.keys(analysis.arudhaAnalysis || {}));

    // Handle empty arudha analysis (common case)
    const arudhaAnalysis = analysis.arudhaAnalysis || {};
    if (Object.keys(arudhaAnalysis).length === 0) {
      return {
        success: apiResponse.success,
        section: analysis.section,
        arudhaAnalysis: {
          arudhaLagna: null,
          upapadalagna: null,
          housePadas: {},
          analysis: 'Arudha analysis available in comprehensive report',
          socialImage: []
        },
        message: analysis.message || 'Arudha analysis available in comprehensive report',
        isEmpty: true
      };
    }

    return {
      success: apiResponse.success,
      section: analysis.section,
      arudhaAnalysis: arudhaAnalysis,
      message: analysis.message
    };
  },

  /**
   * Process lagna analysis API response
   * @param {Object} apiResponse - Raw API response
   * @returns {Object} Formatted data for UI display
   */
  processLagnaAnalysis: (apiResponse) => {
    if (!apiResponse || !apiResponse.analysis) {
      console.error('Invalid lagna analysis API response structure');
      return null;
    }

    const { analysis } = apiResponse;
    console.log('Processing lagna analysis data:', Object.keys(analysis));

    return {
      success: apiResponse.success,
      analysis: analysis,
      message: analysis.message || 'Lagna analysis completed successfully'
    };
  },

  /**
   * Process preliminary analysis API response
   * @param {Object} apiResponse - Raw API response
   * @returns {Object} Formatted data for UI display
   */
  processPreliminaryAnalysis: (apiResponse) => {
    if (!apiResponse || !apiResponse.analysis) {
      console.error('Invalid preliminary analysis API response structure');
      return null;
    }

    const { analysis } = apiResponse;
    console.log('Processing preliminary analysis data:', Object.keys(analysis));

    return {
      success: apiResponse.success,
      analysis: analysis,
      preliminary: analysis.preliminary || analysis,
      summary: analysis.summary || analysis.preliminary?.summary,
      keyPlacements: analysis.keyPlacements || analysis.preliminary?.keyPlacements,
      strengths: analysis.strengths || analysis.preliminary?.strengths,
      challenges: analysis.challenges || analysis.preliminary?.challenges,
      recommendations: analysis.recommendations || analysis.preliminary?.recommendations,
      message: analysis.message || 'Preliminary analysis completed successfully'
    };
  },

  /**
   * Alias for processHouseAnalysis to match AnalysisPage.jsx expectations
   * @param {Object} apiResponse - Raw API response
   * @returns {Object} Formatted data for UI display
   */
  processHousesAnalysis: (apiResponse) => {
    return ResponseDataToUIDisplayAnalyser.processHouseAnalysis(apiResponse);
  },

  /**
   * Generic processor for any analysis type
   * @param {Object} apiResponse - Raw API response
   * @param {string} analysisType - Type of analysis
   * @returns {Object} Formatted data for UI display
   */
  processGenericAnalysis: (apiResponse, analysisType) => {
    if (!apiResponse) {
      console.error(`Invalid ${analysisType} analysis API response structure`);
      return null;
    }

    console.log(`Processing ${analysisType} analysis data:`, apiResponse);

    return {
      success: apiResponse.success || true,
      analysis: apiResponse.analysis || apiResponse,
      message: apiResponse.message || `${analysisType} analysis completed successfully`
    };
  },

  /**
   * CRITICAL: Load comprehensive analysis data from cache or API
   * This function replaces the missing loadFromComprehensiveAnalysis in UI components
   * @returns {Promise<Object>} Comprehensive analysis data ready for UI
   */
  loadFromComprehensiveAnalysis: async () => {
    console.log('🔄 [ResponseDataToUIDisplayAnalyser] Loading comprehensive analysis data...');

    try {
      // First try to get cached data from UIDataSaver
      const cachedData = UIDataSaver.getComprehensiveAnalysis();

      if (cachedData && (cachedData.sections || cachedData.analysis?.sections || cachedData.comprehensiveAnalysis?.analysis?.sections)) {
        console.log('✅ [ResponseDataToUIDisplayAnalyser] Using cached comprehensive analysis');

        // Extract individual analysis types from the comprehensive data
        const loadedData = {};

        // Get the sections from the various possible locations
        const sections = cachedData.sections ||
                        cachedData.analysis?.sections ||
                        cachedData.comprehensiveAnalysis?.analysis?.sections;

        if (sections) {
          console.log('✅ [ResponseDataToUIDisplayAnalyser] Extracting individual analysis types from sections');

          // SECTION 1: Birth Data Collection and Chart Casting
          if (sections.section1) {
            loadedData.preliminary = {
              analysis: sections.section1,
              success: true
            };
            console.log('✅ [ResponseDataToUIDisplayAnalyser] Extracted preliminary data from section1');
          }

          // SECTION 2: Preliminary Chart Analysis: Lagna, Luminaries, and Overall Patterns
          if (sections.section2?.analyses?.lagna) {
            const rawLagnaData = sections.section2.analyses.lagna;
            const formattedLagnaData = {
              analysis: {
                sign: rawLagnaData.lagnaSign?.sign,
                signLord: rawLagnaData.lagnaSign?.ruler,
                element: rawLagnaData.lagnaSign?.element,
                characteristics: rawLagnaData.lagnaSign?.characteristics,
                degree: rawLagnaData.lagnaLord?.currentPosition?.degree,
                nakshatra: rawLagnaData.lagnaLord?.currentPosition?.nakshatra,
                fullData: rawLagnaData
              },
              success: true
            };
            loadedData.lagna = formattedLagnaData;
            console.log('✅ [ResponseDataToUIDisplayAnalyser] Extracted lagna data from section2');
          }

          // SECTION 3: House-by-House Examination (1st-12th Bhavas)
          if (sections.section3?.houses) {
            loadedData.houses = {
              analysis: sections.section3.houses,
              success: true
            };
            console.log('✅ [ResponseDataToUIDisplayAnalyser] Extracted houses data from section3');
          }

          // SECTION 4: Planetary Aspects and Interrelationships
          if (sections.section4) {
            const aspectsData = sections.section4.aspects || sections.section4;
            loadedData.aspects = {
              analysis: {
                // Flatten aspects data to match display component expectations
                allAspects: aspectsData.majorAspects || aspectsData.allAspects || [],
                majorAspects: aspectsData.majorAspects || [],
                patterns: aspectsData.patterns || sections.section4.patterns || [],
                yogas: aspectsData.yogas || sections.section4.yogas || [],
                fullSection: sections.section4
              },
              success: true
            };
            console.log('✅ [ResponseDataToUIDisplayAnalyser] Extracted aspects data from section4');
          }

          // SECTION 5: Arudha Lagna Analysis (Perception & Public Image)
          if (sections.section5) {
            const arudhaData = sections.section5.arudhaAnalysis || sections.section5;
            loadedData.arudha = {
              analysis: {
                // Flatten arudha data to match display component expectations
                arudhaLagna: arudhaData.arudhaLagna || {},
                arudhaPadas: arudhaData.arudhaPadas || {},
                imageStability: arudhaData.imageStability || {},
                publicImageFactors: arudhaData.publicImageFactors || [],
                recommendations: arudhaData.recommendations || [],
                reputationCycles: arudhaData.reputationCycles || [],
                fullSection: sections.section5
              },
              success: true
            };
            console.log('✅ [ResponseDataToUIDisplayAnalyser] Extracted arudha data from section5');
          }

          // SECTION 6: Navamsa Chart Analysis (D9) - Soul and Marriage
          if (sections.section6) {
            const navamsaData = sections.section6.navamsaAnalysis || sections.section6;
            loadedData.navamsa = {
              analysis: {
                // Flatten navamsa data to match display component expectations
                navamsaLagna: navamsaData.navamsaLagna || '',
                marriageIndications: navamsaData.marriageIndications || {},
                spiritualIndications: navamsaData.spiritualIndications || {},
                planetaryStrengths: navamsaData.planetaryStrengths || {},
                vargottamaPlanets: navamsaData.vargottamaPlanets || [],
                yogaFormations: navamsaData.yogaFormations || [],
                overallAnalysis: navamsaData.overallAnalysis || {},
                fullSection: sections.section6
              },
              success: true
            };
            console.log('✅ [ResponseDataToUIDisplayAnalyser] Extracted navamsa data from section6');
          }

          // SECTION 7: Dasha Analysis: Timeline of Life Events
          if (sections.section7) {
            const dashaData = sections.section7.dashaAnalysis || sections.section7;
            loadedData.dasha = {
              analysis: {
                // Flatten dasha data to match display component expectations
                currentDasha: dashaData.currentDasha || {},
                upcomingPeriods: dashaData.upcomingPeriods || [],
                majorTransitions: dashaData.majorTransitions || [],
                periodEffects: dashaData.periodEffects || {},
                recommendations: dashaData.recommendations || [],
                timeline: dashaData.timeline || [],
                fullSection: sections.section7
              },
              success: true
            };
            console.log('✅ [ResponseDataToUIDisplayAnalyser] Extracted dasha data from section7');
          }

          // SECTION 8: Synthesis: From Analysis to Comprehensive Report
          if (sections.section8) {
            const synthesisData = sections.section8.synthesis || sections.section8;
            loadedData.comprehensive = {
              analysis: {
                // Flatten synthesis data to match display component expectations
                overallThemes: synthesisData.overallThemes || [],
                keyStrengths: synthesisData.keyStrengths || [],
                challenges: synthesisData.challenges || [],
                recommendations: synthesisData.recommendations || [],
                lifeDirection: synthesisData.lifeDirection || '',
                primaryFocus: synthesisData.primaryFocus || '',
                fullSection: sections.section8
              },
              success: true
            };
            console.log('✅ [ResponseDataToUIDisplayAnalyser] Extracted comprehensive data from section8');
          }
        }

        // Add comprehensive analysis to the loaded data
        const processedComprehensive = ResponseDataToUIDisplayAnalyser.processComprehensiveAnalysis(cachedData);
        loadedData.comprehensive = processedComprehensive;

        return {
          success: true,
          data: loadedData,
          source: 'cache'
        };
      }

      // Get birth data for API call
      const birthData = UIDataSaver.getBirthData();
      if (!birthData) {
        throw new Error('No birth data found. Please fill the birth data form first.');
      }

      console.log('🔄 [ResponseDataToUIDisplayAnalyser] No cached data found, fetching from API...');

      // Fetch comprehensive analysis from API
      const response = await fetch('/api/v1/analysis/comprehensive', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(birthData)
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      const apiData = await response.json();
      console.log('✅ [ResponseDataToUIDisplayAnalyser] Comprehensive analysis API response received');

      // Save to UIDataSaver for future use
      UIDataSaver.saveComprehensiveAnalysis(apiData);

      // Extract individual analysis types from the API response
      const loadedData = {};

      // Get the sections from the API response
      const sections = apiData.sections || apiData.analysis?.sections;

      if (sections) {
        console.log('🔍 [ResponseDataToUIDisplayAnalyser] Extracting individual analysis types from API response');

        // SECTION 1: Birth Data Collection and Chart Casting
        if (sections.section1) {
          loadedData.preliminary = {
            analysis: sections.section1,
            success: true
          };
          console.log('✅ [ResponseDataToUIDisplayAnalyser] Extracted preliminary data from API section1');
        }

        // SECTION 2: Preliminary Chart Analysis: Lagna, Luminaries, and Overall Patterns
        if (sections.section2?.analyses?.lagna) {
          const rawLagnaData = sections.section2.analyses.lagna;
          const formattedLagnaData = {
            analysis: {
              sign: rawLagnaData.lagnaSign?.sign,
              signLord: rawLagnaData.lagnaSign?.ruler,
              element: rawLagnaData.lagnaSign?.element,
              characteristics: rawLagnaData.lagnaSign?.characteristics,
              degree: rawLagnaData.lagnaLord?.currentPosition?.degree,
              nakshatra: rawLagnaData.lagnaLord?.currentPosition?.nakshatra,
              fullData: rawLagnaData
            },
            success: true
          };
          loadedData.lagna = formattedLagnaData;
          console.log('✅ [ResponseDataToUIDisplayAnalyser] Extracted lagna data from API section2');
        }

        // SECTION 3: House-by-House Examination (1st-12th Bhavas)
        if (sections.section3?.houses) {
          loadedData.houses = {
            analysis: sections.section3.houses,
            success: true
          };
          console.log('✅ [ResponseDataToUIDisplayAnalyser] Extracted houses data from API section3');
        }

        // SECTION 4: Planetary Aspects and Interrelationships
        if (sections.section4) {
          const aspectsData = sections.section4.aspects || sections.section4;
          loadedData.aspects = {
            analysis: {
              // Flatten aspects data to match display component expectations
              allAspects: aspectsData.majorAspects || aspectsData.allAspects || [],
              majorAspects: aspectsData.majorAspects || [],
              patterns: aspectsData.patterns || sections.section4.patterns || [],
              yogas: aspectsData.yogas || sections.section4.yogas || [],
              fullSection: sections.section4
            },
            success: true
          };
          console.log('✅ [ResponseDataToUIDisplayAnalyser] Extracted aspects data from API section4');
        }

        // SECTION 5: Arudha Lagna Analysis (Perception & Public Image)
        if (sections.section5) {
          const arudhaData = sections.section5.arudhaAnalysis || sections.section5;
          loadedData.arudha = {
            analysis: {
              // Flatten arudha data to match display component expectations
              arudhaLagna: arudhaData.arudhaLagna || {},
              arudhaPadas: arudhaData.arudhaPadas || {},
              imageStability: arudhaData.imageStability || {},
              publicImageFactors: arudhaData.publicImageFactors || [],
              recommendations: arudhaData.recommendations || [],
              reputationCycles: arudhaData.reputationCycles || [],
              fullSection: sections.section5
            },
            success: true
          };
          console.log('✅ [ResponseDataToUIDisplayAnalyser] Extracted arudha data from API section5');
        }

        // SECTION 6: Navamsa Chart Analysis (D9) - Soul and Marriage
        if (sections.section6) {
          const navamsaData = sections.section6.navamsaAnalysis || sections.section6;
          loadedData.navamsa = {
            analysis: {
              // Flatten navamsa data to match display component expectations
              navamsaLagna: navamsaData.navamsaLagna || '',
              marriageIndications: navamsaData.marriageIndications || {},
              spiritualIndications: navamsaData.spiritualIndications || {},
              planetaryStrengths: navamsaData.planetaryStrengths || {},
              vargottamaPlanets: navamsaData.vargottamaPlanets || [],
              yogaFormations: navamsaData.yogaFormations || [],
              overallAnalysis: navamsaData.overallAnalysis || {},
              fullSection: sections.section6
            },
            success: true
          };
          console.log('✅ [ResponseDataToUIDisplayAnalyser] Extracted navamsa data from API section6');
        }

        // SECTION 7: Dasha Analysis: Timeline of Life Events
        if (sections.section7) {
          const dashaData = sections.section7.dashaAnalysis || sections.section7;
          loadedData.dasha = {
            analysis: {
              // Flatten dasha data to match display component expectations
              currentDasha: dashaData.currentDasha || {},
              upcomingPeriods: dashaData.upcomingPeriods || [],
              majorTransitions: dashaData.majorTransitions || [],
              periodEffects: dashaData.periodEffects || {},
              recommendations: dashaData.recommendations || [],
              timeline: dashaData.timeline || [],
              fullSection: sections.section7
            },
            success: true
          };
          console.log('✅ [ResponseDataToUIDisplayAnalyser] Extracted dasha data from API section7');
        }

        // SECTION 8: Synthesis: From Analysis to Comprehensive Report
        if (sections.section8) {
          const synthesisData = sections.section8.synthesis || sections.section8;
          loadedData.comprehensive = {
            analysis: {
              // Flatten synthesis data to match display component expectations
              overallThemes: synthesisData.overallThemes || [],
              keyStrengths: synthesisData.keyStrengths || [],
              challenges: synthesisData.challenges || [],
              recommendations: synthesisData.recommendations || [],
              lifeDirection: synthesisData.lifeDirection || '',
              primaryFocus: synthesisData.primaryFocus || '',
              fullSection: sections.section8
            },
            success: true
          };
          console.log('✅ [ResponseDataToUIDisplayAnalyser] Extracted comprehensive data from API section8');
        }
      }

      // Process the comprehensive data and add it to loaded data
      const processedComprehensive = ResponseDataToUIDisplayAnalyser.processComprehensiveAnalysis(apiData);
      loadedData.comprehensive = processedComprehensive;

      return {
        success: true,
        data: loadedData,
        source: 'api'
      };

    } catch (error) {
      console.error('❌ [ResponseDataToUIDisplayAnalyser] Error loading comprehensive analysis:', error);
      return {
        success: false,
        error: error.message,
        data: {}
      };
    }
  },

  /**
   * CRITICAL: Fetch individual analysis data by type
   * This function replaces the missing fetchIndividualAnalysis in UI components
   * @param {string} analysisType - Type of analysis to fetch
   * @returns {Promise<Object>} Individual analysis data ready for UI
   */
  fetchIndividualAnalysis: async (analysisType) => {
    console.log(`🔄 [ResponseDataToUIDisplayAnalyser] Fetching individual ${analysisType} analysis...`);

    try {
      // First check if we already have cached data
      const cachedData = UIDataSaver.getIndividualAnalysis(analysisType);
      if (cachedData) {
        console.log(`✅ [ResponseDataToUIDisplayAnalyser] Using cached ${analysisType} data`);
        const processedData = ResponseDataToUIDisplayAnalyser.processAnalysisData(cachedData, analysisType);
        return {
          success: true,
          data: processedData,
          source: 'cache'
        };
      }

      // Get birth data for API call
      const birthData = UIDataSaver.getBirthData();
      if (!birthData) {
        throw new Error('No birth data found for individual analysis');
      }

      // Get endpoint for this analysis type
      const endpoint = ResponseDataToUIDisplayAnalyser.getAnalysisEndpoint(analysisType);
      if (!endpoint) {
        throw new Error(`No endpoint defined for ${analysisType}`);
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(birthData)
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      const apiData = await response.json();
      console.log(`✅ [ResponseDataToUIDisplayAnalyser] ${analysisType} analysis API response received`);

      // Save to UIDataSaver
      UIDataSaver.saveIndividualAnalysis(analysisType, apiData);

      // Process the data through appropriate processor
      const processedData = ResponseDataToUIDisplayAnalyser.processAnalysisData(apiData, analysisType);

      return {
        success: true,
        data: processedData,
        source: 'api'
      };

    } catch (error) {
      console.error(`❌ [ResponseDataToUIDisplayAnalyser] Error fetching ${analysisType} analysis:`, error);
      return {
        success: false,
        error: error.message,
        data: null
      };
    }
  },

  /**
   * Get API endpoint for analysis type
   * @param {string} analysisType - Type of analysis
   * @returns {string} API endpoint URL
   */
  getAnalysisEndpoint: (analysisType) => {
    const endpoints = {
      // FIXED: lagna data comes from comprehensive analysis, no dedicated endpoint
      lagna: '/api/v1/analysis/comprehensive',
      preliminary: '/api/v1/analysis/preliminary',
      houses: '/api/v1/analysis/houses',
      aspects: '/api/v1/analysis/aspects',
      arudha: '/api/v1/analysis/arudha',
      navamsa: '/api/v1/analysis/navamsa',
      dasha: '/api/v1/analysis/dasha',
      comprehensive: '/api/v1/analysis/comprehensive'
    };
    return endpoints[analysisType];
  },

  /**
   * Process analysis data using the appropriate processor
   * @param {Object} apiData - Raw API response
   * @param {string} analysisType - Type of analysis
   * @returns {Object} Processed data
   */
  processAnalysisData: (apiData, analysisType) => {
    switch (analysisType) {
      case 'comprehensive':
        return ResponseDataToUIDisplayAnalyser.processComprehensiveAnalysis(apiData);
      case 'houses':
        return ResponseDataToUIDisplayAnalyser.processHouseAnalysis(apiData);
      case 'dasha':
        return ResponseDataToUIDisplayAnalyser.processDashaAnalysis(apiData);
      case 'navamsa':
        return ResponseDataToUIDisplayAnalyser.processNavamsaAnalysis(apiData);
      case 'aspects':
        return ResponseDataToUIDisplayAnalyser.processAspectsAnalysis(apiData);
      case 'arudha':
        return ResponseDataToUIDisplayAnalyser.processArudhaAnalysis(apiData);
      case 'lagna':
        // FIXED: lagna data comes from comprehensive analysis, extract lagnaAnalysis section
        if (apiData && apiData.analysis && apiData.analysis.lagnaAnalysis) {
          return ResponseDataToUIDisplayAnalyser.processLagnaAnalysis({
            success: apiData.success,
            analysis: apiData.analysis.lagnaAnalysis
          });
        } else {
          // Fallback: process as comprehensive and extract lagna section
          const comprehensiveData = ResponseDataToUIDisplayAnalyser.processComprehensiveAnalysis(apiData);
          if (comprehensiveData && comprehensiveData.sections && comprehensiveData.sections.section2) {
            return {
              success: true,
              analysis: comprehensiveData.sections.section2,
              message: 'Lagna analysis extracted from comprehensive analysis'
            };
          }
          return ResponseDataToUIDisplayAnalyser.processLagnaAnalysis(apiData);
        }
      case 'preliminary':
        return ResponseDataToUIDisplayAnalyser.processPreliminaryAnalysis(apiData);
      default:
        return ResponseDataToUIDisplayAnalyser.processGenericAnalysis(apiData, analysisType);
    }
  },

  /**
   * Get section display names
   * @returns {Object} Section ID to display name mapping
   */
  getSectionNames: () => ({
    section1: 'Birth Data Collection',
    section2: 'Lagna & Luminaries',
    section3: 'House Analysis',
    section4: 'Planetary Aspects',
    section5: 'Arudha Analysis',
    section6: 'Navamsa Analysis',
    section7: 'Dasha Analysis',
    section8: 'Comprehensive Report'
  })
};

export default ResponseDataToUIDisplayAnalyser;
