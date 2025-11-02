/**
 * Complete data analysis layer for comprehensive analysis display
 * Handles data loading, caching, and transformation for UI display
 */

import UIDataSaver from '../forms/UIDataSaver.js';

const ResponseDataToUIDisplayAnalyser = {
  /**
   * Process comprehensive analysis API response
   * @param {Object} apiResponse - Raw API response
   * @returns {Object} Formatted data for UI display
   */
  processComprehensiveAnalysis: (apiResponse) => {
    if (!apiResponse) {
      throw new Error('API response is required for comprehensive analysis processing');
    }

    // CRITICAL FIX: Check if API returned an error
    if (!apiResponse.success || apiResponse.metadata?.status === 'failed') {
      const errorMessage = apiResponse.error?.message || 
                          apiResponse.error?.details || 
                          apiResponse.message || 
                          'Comprehensive analysis failed. Unable to process response.';
      
      // Enhanced error object with user-friendly message
      const error = new Error(errorMessage);
      error.userMessage = errorMessage;
      error.technicalDetails = {
        success: apiResponse.success,
        status: apiResponse.metadata?.status,
        error: apiResponse.error
      };
      throw error;
    }

    // Handle multiple response formats with enhanced fallback logic
    let analysis;
    if (apiResponse.analysis) {
      analysis = apiResponse.analysis; // Standard: {success: true, analysis: {sections: {}}}
    } else if (apiResponse.data?.analysis) {
      analysis = apiResponse.data.analysis; // Nested: {success: true, data: {analysis: {sections: {}}}}
    } else if (apiResponse.sections) {
      analysis = apiResponse; // Direct: {sections: {}}
    } else if (apiResponse.data?.sections) {
      analysis = { sections: apiResponse.data.sections }; // Nested: {success: true, data: {sections: {}}}
    } else {
      // Enhanced error with response structure information
      const error = new Error('Invalid API response structure. Expected apiResponse.analysis, apiResponse.data.analysis, apiResponse.sections, or apiResponse.data.sections.');
      error.responseStructure = {
        hasSuccess: 'success' in apiResponse,
        hasAnalysis: 'analysis' in apiResponse,
        hasData: 'data' in apiResponse,
        hasDataAnalysis: 'data' in apiResponse && 'analysis' in apiResponse.data,
        hasSections: 'sections' in apiResponse,
        hasDataSections: 'data' in apiResponse && 'sections' in apiResponse.data,
        keys: Object.keys(apiResponse)
      };
      throw error;
    }

    const { sections } = analysis;
    if (!sections || Object.keys(sections).length === 0) {
      throw new Error('Sections data is missing from API response. Expected analysis.sections with 8 sections (section1-section8).');
    }

    // CRITICAL FIX: Validate section count (should be 8 sections) with graceful handling
    const sectionKeys = Object.keys(sections);
    if (sectionKeys.length < 8) {
      console.warn(`⚠️ [ResponseDataToUIDisplayAnalyser] Expected 8 sections but found ${sectionKeys.length}. Sections: ${sectionKeys.join(', ')}`);
      // Continue processing with available sections
    }

    return {
      success: apiResponse.success || true,
      sections: sections,
      sectionOrder: ['section1', 'section2', 'section3', 'section4', 'section5', 'section6', 'section7', 'section8'],
      synthesis: analysis.synthesis || analysis.synthesis || null,
      recommendations: analysis.recommendations || analysis.recommendations || null
    };
  },

  /**
   * Process houses analysis API response
   * @param {Object} apiResponse - Raw API response
   * @returns {Object} Formatted data for UI display
   */
  processHouseAnalysis: (apiResponse) => {
    if (!apiResponse) {
      throw new Error('API response is required for houses analysis processing');
    }
    
    if (!apiResponse.analysis) {
      throw new Error('Invalid houses analysis API response structure. Expected apiResponse.analysis with houses data.');
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
    if (!apiResponse) {
      throw new Error('API response is required for dasha analysis processing');
    }
    
    if (!apiResponse.analysis) {
      throw new Error('Invalid dasha analysis API response structure. Expected apiResponse.analysis with dashaAnalysis data.');
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
    if (!apiResponse) {
      throw new Error('API response is required for navamsa analysis processing');
    }
    
    if (!apiResponse.analysis) {
      throw new Error('Invalid navamsa analysis API response structure. Expected apiResponse.analysis with navamsaAnalysis data.');
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
    if (!apiResponse) {
      throw new Error('API response is required for aspects analysis processing');
    }
    
    if (!apiResponse.analysis) {
      throw new Error('Invalid aspects analysis API response structure. Expected apiResponse.analysis with aspects data.');
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
    if (!apiResponse) {
      throw new Error('API response is required for arudha analysis processing');
    }
    
    if (!apiResponse.analysis) {
      throw new Error('Invalid arudha analysis API response structure. Expected apiResponse.analysis with arudhaAnalysis data.');
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
    if (!apiResponse) {
      throw new Error('API response is required for lagna analysis processing');
    }
    
    if (!apiResponse.analysis) {
      throw new Error('Invalid lagna analysis API response structure. Expected apiResponse.analysis with lagna data.');
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
    if (!apiResponse) {
      throw new Error('API response is required for preliminary analysis processing');
    }
    
    if (!apiResponse.analysis) {
      throw new Error('Invalid preliminary analysis API response structure. Expected apiResponse.analysis with preliminary data.');
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
      throw new Error(`API response is required for ${analysisType} analysis processing`);
    }
    
    if (!apiResponse.analysis && !apiResponse.success) {
      throw new Error(`Invalid ${analysisType} analysis API response structure. Expected apiResponse.analysis or apiResponse with success status.`);
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

          // SECTION 2: Preliminary Chart Analysis: Lagna, Luminaries, and Overall Patterns - FIXED
          if (sections.section2?.analyses?.lagna) {
            const rawLagnaData = sections.section2.analyses.lagna;
            const formattedLagnaData = {
              analysis: {
                // Extract actual lagna data from API response
                sign: rawLagnaData.sign || rawLagnaData.lagnaSign?.sign,
                signLord: rawLagnaData.signLord || rawLagnaData.ruler,
                element: rawLagnaData.element,
                characteristics: rawLagnaData.characteristics || [],
                degree: rawLagnaData.degree,
                nakshatra: rawLagnaData.nakshatra,
                lagnaLord: rawLagnaData.lagnaLord,
                dignity: rawLagnaData.dignity,
                fullData: rawLagnaData,
                // Handle luminaries data
                luminaries: sections.section2.analyses.luminaries || {}
              },
              success: true
            };
            loadedData.lagna = formattedLagnaData;
            console.log('✅ [ResponseDataToUIDisplayAnalyser] Extracted lagna data from section2');
          } else if (sections.section2) {
            // PRODUCTION: Extract lagna data from section2 if structured correctly
            const rawLagnaData = sections.section2.analyses?.lagna || sections.section2.lagna;
            if (!rawLagnaData) {
              throw new Error('Lagna analysis data not found in section2. Required structure: sections.section2.analyses.lagna');
            }
            const formattedLagnaData = {
              analysis: {
                sign: rawLagnaData.sign || rawLagnaData.lagnaSign?.sign,
                signLord: rawLagnaData.signLord || rawLagnaData.ruler,
                element: rawLagnaData.element,
                characteristics: rawLagnaData.characteristics || [],
                degree: rawLagnaData.degree,
                nakshatra: rawLagnaData.nakshatra,
                lagnaLord: rawLagnaData.lagnaLord,
                dignity: rawLagnaData.dignity,
                fullData: rawLagnaData,
                luminaries: sections.section2.analyses?.luminaries || {}
              },
              success: true
            };
            loadedData.lagna = formattedLagnaData;
            console.log('✅ [ResponseDataToUIDisplayAnalyser] Extracted lagna data from section2');
          } else {
            throw new Error('Lagna analysis data not found. Required in sections.section2.analyses.lagna or sections.section1');
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
      let birthData = UIDataSaver.getBirthData();

      // PRODUCTION: Require birth data, no fallbacks
      if (!birthData) {
        const error = new Error('Birth data is required for analysis. Please generate a chart first by filling out the birth data form.');
        error.code = 'BIRTH_DATA_REQUIRED';
        error.userMessage = 'Please fill out the birth data form on the homepage and generate your chart to view analysis results.';
        error.action = 'navigate_home';
        throw error;
      }

      console.log('🔄 [ResponseDataToUIDisplayAnalyser] No cached data found, fetching from API...');

      // Fetch comprehensive analysis from API
      // Use apiConfig utility to get full API URL
      const { getApiUrl } = await import('../../utils/apiConfig');
      const response = await fetch(getApiUrl('/api/v1/analysis/comprehensive'), {
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

        // SECTION 2: Preliminary Chart Analysis: Lagna, Luminaries, and Overall Patterns - FIXED
        if (sections.section2?.analyses?.lagna) {
          const rawLagnaData = sections.section2.analyses.lagna;
          const formattedLagnaData = {
            analysis: {
              // Extract actual lagna data from API response
              sign: rawLagnaData.sign || rawLagnaData.lagnaSign?.sign,
              signLord: rawLagnaData.signLord || rawLagnaData.ruler,
              element: rawLagnaData.element,
              characteristics: rawLagnaData.characteristics || [],
              degree: rawLagnaData.degree,
              nakshatra: rawLagnaData.nakshatra,
              lagnaLord: rawLagnaData.lagnaLord,
              dignity: rawLagnaData.dignity,
              fullData: rawLagnaData,
              // Handle luminaries data
              luminaries: sections.section2.analyses.luminaries || {}
            },
            success: true
          };
          loadedData.lagna = formattedLagnaData;
          console.log('✅ [ResponseDataToUIDisplayAnalyser] Extracted lagna data from API section2');
        } else if (sections.section2) {
          // Extract lagna data from section2 structure
          loadedData.lagna = {
            analysis: {
              fullData: sections.section2,
              sign: sections.section2.lagnaSign || sections.section2.sign || 'Data available in section2',
              message: 'Lagna analysis data extracted from section2'
            },
            success: true
          };
          console.log('✅ [ResponseDataToUIDisplayAnalyser] Extracted lagna data from section2');
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
      let birthData = UIDataSaver.getBirthData();

      // PRODUCTION: Require birth data, no fallbacks
      if (!birthData) {
        const error = new Error('Birth data is required for analysis. Please generate a chart first by filling out the birth data form.');
        error.code = 'BIRTH_DATA_REQUIRED';
        error.userMessage = 'Please fill out the birth data form on the homepage and generate your chart to view analysis results.';
        error.action = 'navigate_home';
        throw error;
      }

      // Get endpoint for this analysis type
      const endpoint = ResponseDataToUIDisplayAnalyser.getAnalysisEndpoint(analysisType);
      if (!endpoint) {
        throw new Error(`No endpoint defined for ${analysisType}`);
      }

      // Use apiConfig utility to get full API URL
      const { getApiUrl } = await import('../../utils/apiConfig');
      const fullEndpoint = getApiUrl(endpoint);

      const response = await fetch(fullEndpoint, {
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
          // Process as comprehensive and extract lagna section
          const comprehensiveData = ResponseDataToUIDisplayAnalyser.processComprehensiveAnalysis(apiData);
          if (!comprehensiveData || !comprehensiveData.sections || !comprehensiveData.sections.section2) {
            throw new Error('Lagna analysis data not found in API response. Please ensure the comprehensive analysis endpoint returns section2 data.');
          }
          return {
            success: true,
            analysis: comprehensiveData.sections.section2,
            message: 'Lagna analysis extracted from comprehensive analysis'
          };
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
