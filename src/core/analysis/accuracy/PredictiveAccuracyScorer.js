/**
 * Predictive Accuracy Scorer
 * Provides confidence scores for astrological predictions
 * Uses multi-factor analysis to assess prediction reliability
 */

const ChartVerificationEngine = require('../verification/ChartVerificationEngine');
const TimingPrecisionEnhancer = require('../timing/TimingPrecisionEnhancer');

class PredictiveAccuracyScorer {
  constructor() {
    this.verificationEngine = new ChartVerificationEngine();
    this.timingEnhancer = new TimingPrecisionEnhancer();
    this.initializeAccuracyFactors();
  }

  /**
   * Initialize accuracy assessment factors and weights
   */
  initializeAccuracyFactors() {
    // Primary accuracy factors
    this.accuracyFactors = {
      dataQuality: 0.25,           // Birth data accuracy and completeness
      systemConsistency: 0.20,     // Agreement across different systems
      methodReliability: 0.15,     // Reliability of prediction methods used
      timingPrecision: 0.15,       // Precision of timing predictions
      planetaryStrength: 0.10,     // Strength of key planets for prediction
      aspectualSupport: 0.10,      // Supporting aspects for prediction
      historicalAccuracy: 0.05     // Historical accuracy of similar predictions
    };

    // Data quality indicators
    this.dataQualityFactors = {
      timeAccuracy: 0.30,          // Birth time accuracy (exact vs approximate)
      locationAccuracy: 0.25,      // Birth location precision
      completeness: 0.25,          // Completeness of planetary positions
      sourceReliability: 0.20      // Reliability of birth data source
    };

    // Method reliability scores
    this.methodReliabilityScores = {
      vimshottariDasha: 0.90,      // Highly reliable traditional method
      planetaryTransits: 0.85,     // Well-established transit system
      aspectAnalysis: 0.80,        // Strong basis in classical texts
      houseAnalysis: 0.85,         // Fundamental house system
      progressions: 0.70,          // Secondary progressions
      sadeSati: 0.75,              // Established Saturn cycle
      divisionalCharts: 0.80       // Classical divisional analysis
    };

    // Prediction category base accuracy
    this.categoryBaseAccuracy = {
      marriage: 0.75,              // Generally reliable predictions
      career: 0.70,                // Good accuracy for career trends
      health: 0.65,                // Health requires careful interpretation
      finance: 0.68,               // Financial trends moderately reliable
      spirituality: 0.72,          // Spiritual inclinations fairly clear
      education: 0.78,             // Educational success well-indicated
      relationships: 0.73,         // Relationship patterns visible
      travel: 0.60,                // Travel predictions variable
      property: 0.67,              // Property acquisition moderately clear
      children: 0.70               // Children predictions reasonably reliable
    };

    // Confidence score ranges
    this.confidenceRanges = {
      'Very High': { min: 0.85, max: 1.00, description: 'Exceptional reliability' },
      'High': { min: 0.70, max: 0.84, description: 'Strong confidence' },
      'Medium': { min: 0.55, max: 0.69, description: 'Moderate reliability' },
      'Low': { min: 0.40, max: 0.54, description: 'Limited confidence' },
      'Very Low': { min: 0.00, max: 0.39, description: 'Significant uncertainty' }
    };

    // Accuracy enhancement factors
    this.enhancementFactors = {
      multiMethodConsensus: 0.15,   // Multiple methods agreeing
      planetaryDignity: 0.10,       // Planets in dignity/exaltation
      aspectualHarmony: 0.10,       // Harmonious aspects supporting prediction
      timingConfluence: 0.10,       // Multiple timing indicators aligning
      classicalValidation: 0.05     // Validation against classical texts
    };
  }

  /**
   * Calculate comprehensive accuracy score for predictions
   * @param {Object} prediction - Prediction data to score
   * @param {Object} birthChart - Complete birth chart
   * @param {Object} analysisContext - Analysis context and methods used
   * @returns {Object} Comprehensive accuracy assessment
   */
  calculateAccuracyScore(prediction, birthChart, analysisContext) {
    const accuracy = {
      predictionType: prediction.type || 'general',
      overallScore: 0,
      confidenceLevel: 'Unknown',
      factorScores: {},
      enhancementScores: {},
      limitations: [],
      strengths: [],
      recommendations: [],
      detailedBreakdown: {},
      reliabilityAssessment: {}
    };

    // Calculate individual factor scores
    accuracy.factorScores = this.calculateFactorScores(
      prediction,
      birthChart,
      analysisContext
    );

    // Calculate enhancement scores
    accuracy.enhancementScores = this.calculateEnhancementScores(
      prediction,
      birthChart,
      analysisContext
    );

    // Calculate overall score
    accuracy.overallScore = this.calculateOverallScore(
      accuracy.factorScores,
      accuracy.enhancementScores,
      prediction.type
    );

    // Determine confidence level
    accuracy.confidenceLevel = this.getConfidenceLevel(accuracy.overallScore);

    // Identify strengths and limitations
    accuracy.strengths = this.identifyStrengths(accuracy.factorScores, accuracy.enhancementScores);
    accuracy.limitations = this.identifyLimitations(accuracy.factorScores, analysisContext);

    // Create detailed breakdown
    accuracy.detailedBreakdown = this.createDetailedBreakdown(accuracy);

    // Generate reliability assessment
    accuracy.reliabilityAssessment = this.createReliabilityAssessment(
      accuracy,
      prediction,
      analysisContext
    );

    // Generate recommendations
    accuracy.recommendations = this.generateAccuracyRecommendations(accuracy, analysisContext);

    return accuracy;
  }

  /**
   * Calculate scores for individual accuracy factors
   */
  calculateFactorScores(prediction, birthChart, analysisContext) {
    const factorScores = {};

    // Data Quality Score
    factorScores.dataQuality = this.assessDataQuality(birthChart, analysisContext);

    // System Consistency Score
    factorScores.systemConsistency = this.assessSystemConsistency(analysisContext);

    // Method Reliability Score
    factorScores.methodReliability = this.assessMethodReliability(analysisContext);

    // Timing Precision Score
    factorScores.timingPrecision = this.assessTimingPrecision(prediction, analysisContext);

    // Planetary Strength Score
    factorScores.planetaryStrength = this.assessPlanetaryStrength(
      prediction,
      birthChart,
      analysisContext
    );

    // Aspectual Support Score
    factorScores.aspectualSupport = this.assessAspectualSupport(
      prediction,
      birthChart,
      analysisContext
    );

    // Historical Accuracy Score
    factorScores.historicalAccuracy = this.assessHistoricalAccuracy(
      prediction.type,
      analysisContext
    );

    return factorScores;
  }

  /**
   * Calculate enhancement factor scores
   */
  calculateEnhancementScores(prediction, birthChart, analysisContext) {
    const enhancementScores = {};

    // Multi-method consensus
    enhancementScores.multiMethodConsensus = this.assessMultiMethodConsensus(analysisContext);

    // Planetary dignity
    enhancementScores.planetaryDignity = this.assessPlanetaryDignity(birthChart, prediction);

    // Aspectual harmony
    enhancementScores.aspectualHarmony = this.assessAspectualHarmony(birthChart, prediction);

    // Timing confluence
    enhancementScores.timingConfluence = this.assessTimingConfluence(prediction, analysisContext);

    // Classical validation
    enhancementScores.classicalValidation = this.assessClassicalValidation(prediction);

    return enhancementScores;
  }

  /**
   * Individual assessment methods
   */
  assessDataQuality(birthChart, analysisContext) {
    let score = 0;

    // Time accuracy
    const timeAccuracy = analysisContext.birthData?.timeAccuracy || 'approximate';
    const timeScore = timeAccuracy === 'exact' ? 1.0 : timeAccuracy === 'approximate' ? 0.6 : 0.3;
    score += timeScore * this.dataQualityFactors.timeAccuracy;

    // Location accuracy
    const locationScore = birthChart.birthLocation ? 0.9 : 0.5;
    score += locationScore * this.dataQualityFactors.locationAccuracy;

    // Completeness
    const hasAllPlanets = birthChart.planetaryPositions &&
      Object.keys(birthChart.planetaryPositions).length >= 9;
    const completenessScore = hasAllPlanets ? 1.0 : 0.7;
    score += completenessScore * this.dataQualityFactors.completeness;

    // Source reliability
    const sourceReliability = analysisContext.dataSource?.reliability || 'moderate';
    const sourceScore = sourceReliability === 'high' ? 1.0 :
                       sourceReliability === 'moderate' ? 0.7 : 0.4;
    score += sourceScore * this.dataQualityFactors.sourceReliability;

    return Math.max(0, Math.min(1, score));
  }

  assessSystemConsistency(analysisContext) {
    if (analysisContext.verificationResults) {
      return analysisContext.verificationResults.overallConsistency || 0.7;
    }

    // Comprehensive assessment based on multiple factors
    let consistencyScore = 0.4; // Base score

    // Factor 1: Number of analysis methods used
    const methodsUsed = analysisContext.methodsUsed?.length || 1;
    const methodsBonus = Math.min(0.3, methodsUsed * 0.08);
    consistencyScore += methodsBonus;

    // Factor 2: Chart calculation accuracy
    if (analysisContext.birthData?.timeAccuracy) {
      const timeAccuracyBonus = {
        'exact': 0.15,
        'approximate': 0.08,
        'unknown': 0
      };
      consistencyScore += timeAccuracyBonus[analysisContext.birthData.timeAccuracy] || 0;
    }

    // Factor 3: Data source reliability
    if (analysisContext.dataSource) {
      const sourceReliabilityBonus = {
        'birth_certificate': 0.15,
        'hospital_record': 0.12,
        'family_record': 0.08,
        'personal_memory': 0.04,
        'estimated': 0
      };
      consistencyScore += sourceReliabilityBonus[analysisContext.dataSource] || 0.04;
    }

    // Factor 4: Planetary position consistency
    if (analysisContext.planetaryStrengths) {
      const strengthCount = Object.keys(analysisContext.planetaryStrengths).length;
      const consistencyBonus = Math.min(0.1, strengthCount * 0.01);
      consistencyScore += consistencyBonus;
    }

    // Factor 5: Cross-system validation (if available)
    if (analysisContext.crossSystemValidation) {
      const validationAgreement = analysisContext.crossSystemValidation.agreementPercentage || 0;
      consistencyScore += (validationAgreement / 100) * 0.2;
    }

    return Math.max(0, Math.min(1, consistencyScore));
  }

  assessMethodReliability(analysisContext) {
    if (!analysisContext.methodsUsed || analysisContext.methodsUsed.length === 0) {
      // Base reliability assessment using available information
      let baseReliability = 0.5;

      // Adjust based on chart quality
      if (analysisContext.birthData?.timeAccuracy === 'exact') {
        baseReliability += 0.15;
      } else if (analysisContext.birthData?.timeAccuracy === 'approximate') {
        baseReliability += 0.08;
      }

      // Adjust based on planetary data completeness
      if (analysisContext.planetaryStrengths) {
        const completeness = Object.keys(analysisContext.planetaryStrengths).length / 9; // 9 main planets
        baseReliability += completeness * 0.1;
      }

      return Math.max(0.3, Math.min(0.85, baseReliability));
    }

    let weightedReliability = 0;
    let totalWeight = 0;

    for (const method of analysisContext.methodsUsed) {
      const methodScore = this.methodReliabilityScores[method] || 0.7;

      // Weight methods based on their complexity and traditional validation
      const methodWeight = this.getMethodWeight(method);

      // Adjust score based on implementation quality
      let adjustedScore = methodScore;

      // Bonus for traditional methods
      if (this.isTraditionalMethod(method)) {
        adjustedScore += 0.1;
      }

      // Bonus for methods with strong empirical validation
      if (this.hasStrongValidation(method)) {
        adjustedScore += 0.15;
      }

      // Apply contextual adjustments
      if (analysisContext.methodsContext?.[method]) {
        const contextQuality = analysisContext.methodsContext[method].quality || 1;
        adjustedScore *= contextQuality;
      }

      weightedReliability += adjustedScore * methodWeight;
      totalWeight += methodWeight;
    }

    const averageReliability = totalWeight > 0 ? weightedReliability / totalWeight : 0.7;

    // Bonus for using multiple complementary methods
    const methodDiversity = this.calculateMethodDiversity(analysisContext.methodsUsed);
    const diversityBonus = methodDiversity * 0.1;

    return Math.max(0, Math.min(1, averageReliability + diversityBonus));
  }

  assessTimingPrecision(prediction, analysisContext) {
    if (prediction.timing && analysisContext.timingAnalysis) {
      return analysisContext.timingAnalysis.confidenceScore || 0.6;
    }

    let precisionScore = 0.3; // Base score for timing assessment

    // Assess timing based on prediction structure and available data
    if (prediction.timing) {
      // Factor 1: Timing specificity
      const specificityBonus = this.assessTimingSpecificity(prediction.timing);
      precisionScore += specificityBonus;

      // Factor 2: Multiple timing techniques used
      if (prediction.timing.techniques) {
        const techniqueCount = prediction.timing.techniques.length;
        const techniqueBonus = Math.min(0.2, techniqueCount * 0.05);
        precisionScore += techniqueBonus;
      }

      // Factor 3: Dasha analysis precision
      if (prediction.timing.dashaAnalysis) {
        const dashaDepth = this.assessDashaAnalysisDepth(prediction.timing.dashaAnalysis);
        precisionScore += dashaDepth * 0.15;
      }

      // Factor 4: Transit analysis quality
      if (prediction.timing.transitAnalysis) {
        const transitQuality = this.assessTransitAnalysisQuality(prediction.timing.transitAnalysis);
        precisionScore += transitQuality * 0.12;
      }

      // Factor 5: Progression analysis
      if (prediction.timing.progressionAnalysis) {
        precisionScore += 0.08;
      }
    }

    // Assess based on birth data quality for timing predictions
    if (analysisContext.birthData?.timeAccuracy) {
      const timeAccuracyMultiplier = {
        'exact': 1.0,
        'approximate': 0.7,
        'unknown': 0.4
      };
      precisionScore *= timeAccuracyMultiplier[analysisContext.birthData.timeAccuracy] || 0.4;
    }

    // Prediction type specific adjustments
    const typeAdjustments = {
      'marriage': 0.05,
      'career': 0.08,
      'health': 0.03,
      'finance': 0.06,
      'education': 0.07
    };

    precisionScore += typeAdjustments[prediction.type] || 0;

    return Math.max(0.1, Math.min(0.95, precisionScore));
  }

  assessPlanetaryStrength(prediction, birthChart, analysisContext) {
    let score = 0.6; // Base score

    // Get relevant planets for prediction type
    const relevantPlanets = this.getRelevantPlanets(prediction.type);

    if (analysisContext.planetaryStrengths) {
      let totalStrength = 0;
      let planetCount = 0;

      for (const planet of relevantPlanets) {
        const strength = analysisContext.planetaryStrengths[planet];
        if (strength) {
          totalStrength += strength.total || 5;
          planetCount++;
        }
      }

      if (planetCount > 0) {
        const avgStrength = totalStrength / planetCount;
        score = Math.min(1.0, avgStrength / 10); // Normalize to 0-1 scale
      }
    }

    return score;
  }

  assessAspectualSupport(prediction, birthChart, analysisContext) {
    let score = 0.5; // Base score

    if (analysisContext.aspectAnalysis) {
      const aspectSupport = analysisContext.aspectAnalysis.supportingAspects || [];
      const aspectConflicts = analysisContext.aspectAnalysis.conflictingAspects || [];

      const supportRatio = aspectSupport.length / (aspectSupport.length + aspectConflicts.length || 1);
      score = Math.min(1.0, 0.3 + (supportRatio * 0.7));
    }

    return score;
  }

  assessHistoricalAccuracy(predictionType, analysisContext) {
    // Base historical accuracy for prediction type
    const baseAccuracy = this.categoryBaseAccuracy[predictionType] || 0.65;

    // Adjust based on analysis quality
    const qualityMultiplier = analysisContext.analysisQuality || 1.0;

    return Math.min(1.0, baseAccuracy * qualityMultiplier);
  }

  assessMultiMethodConsensus(analysisContext) {
    if (analysisContext.verificationResults?.crossValidationResults) {
      const validationResults = analysisContext.verificationResults.crossValidationResults;
      let totalAgreement = 0;
      let categoryCount = 0;

      for (const [category, result] of Object.entries(validationResults)) {
        if (category !== 'patternValidation' && result.overallAgreement !== undefined) {
          totalAgreement += result.overallAgreement;
          categoryCount++;
        }
      }

      return categoryCount > 0 ? totalAgreement / categoryCount : 0.5;
    }

    // Comprehensive consensus assessment without formal cross-validation
    let consensusScore = 0.4; // Base consensus

    // Factor 1: Multiple methods used
    const methodsUsed = analysisContext.methodsUsed?.length || 1;
    if (methodsUsed >= 3) {
      consensusScore += 0.15;
    } else if (methodsUsed >= 2) {
      consensusScore += 0.08;
    }

    // Factor 2: Analyze method complementarity
    if (analysisContext.methodsUsed) {
      const methodTypes = this.categorizeAnalysisMethods(analysisContext.methodsUsed);
      const diversityScore = this.calculateMethodTypeDiversity(methodTypes);
      consensusScore += diversityScore * 0.15;
    }

    // Factor 3: Planetary strength consensus
    if (analysisContext.planetaryStrengths) {
      const strengthConsensus = this.assessPlanetaryStrengthConsensus(analysisContext.planetaryStrengths);
      consensusScore += strengthConsensus * 0.1;
    }

    // Factor 4: House analysis consistency
    if (analysisContext.houseAnalysis) {
      const houseConsensus = this.assessHouseAnalysisConsensus(analysisContext.houseAnalysis);
      consensusScore += houseConsensus * 0.08;
    }

    // Factor 5: Yoga analysis agreement
    if (analysisContext.yogaAnalysis) {
      const yogaCount = Object.keys(analysisContext.yogaAnalysis).length;
      const yogaConsensus = Math.min(0.1, yogaCount * 0.02);
      consensusScore += yogaConsensus;
    }

    // Factor 6: Traditional vs modern method agreement
    if (analysisContext.methodsUsed) {
      const traditionalMethods = analysisContext.methodsUsed.filter(m => this.isTraditionalMethod(m));
      const modernMethods = analysisContext.methodsUsed.filter(m => !this.isTraditionalMethod(m));

      if (traditionalMethods.length > 0 && modernMethods.length > 0) {
        consensusScore += 0.12; // Bonus for mixing traditional and modern approaches
      }
    }

    return Math.max(0.2, Math.min(0.9, consensusScore));
  }

  assessPlanetaryDignity(birthChart, prediction) {
    let score = 0.3; // Base score

    const relevantPlanets = this.getRelevantPlanets(prediction.type);

    if (birthChart.planetaryPositions) {
      let totalDignityScore = 0;
      let totalWeight = 0;

      for (const planet of relevantPlanets) {
        const planetData = birthChart.planetaryPositions[planet.toLowerCase()];
        if (planetData) {
          const planetWeight = this.getPlanetaryWeight(planet, prediction.type);
          let planetDignityScore = 0;

          // Comprehensive dignity analysis
          const dignity = planetData.dignity?.toLowerCase() || '';
          const sign = planetData.sign || '';

          // Primary dignities
          if (dignity === 'exalted' || dignity === 'exaltation') {
            planetDignityScore = 1.0;
          } else if (dignity === 'own' || dignity === 'ownsign' || this.isInOwnSign(planet, sign)) {
            planetDignityScore = 0.85;
          } else if (dignity === 'moolatrikona' || this.isInMoolatrikona(planet, sign)) {
            planetDignityScore = 0.9;
          } else if (dignity === 'debilitated' || dignity === 'debilitation') {
            planetDignityScore = 0.1;

            // Check for Neecha Bhanga (cancellation of debilitation)
            if (this.hasNeechaBhanga(birthChart, planet)) {
              planetDignityScore = 0.6; // Significant improvement with cancellation
            }
          } else if (this.isFriendlySign(planet, sign)) {
            planetDignityScore = 0.65;
          } else if (this.isEnemySign(planet, sign)) {
            planetDignityScore = 0.35;
          } else {
            planetDignityScore = 0.5; // Neutral
          }

          // Additional factors affecting dignity

          // Vargottama status (same sign in D1 and D9)
          if (planetData.vargottama || this.isVargottama(planetData)) {
            planetDignityScore *= 1.15;
          }

          // Combustion check
          if (this.isCombust(birthChart, planet)) {
            planetDignityScore *= 0.7; // Reduce dignity due to combustion
          }

          // Retrograde consideration
          if (planetData.isRetrograde && planet !== 'Sun' && planet !== 'Moon') {
            planetDignityScore *= 1.05; // Slight boost for retrograde planets
          }

          // House strength consideration
          const houseNumber = planetData.house;
          if (houseNumber) {
            const houseMultiplier = this.getHouseStrengthMultiplier(houseNumber);
            planetDignityScore *= houseMultiplier;
          }

          totalDignityScore += planetDignityScore * planetWeight;
          totalWeight += planetWeight;
        }
      }

      if (totalWeight > 0) {
        const weightedDignityScore = totalDignityScore / totalWeight;
        score = 0.15 + (weightedDignityScore * 0.85);
      }
    }

    return Math.max(0.1, Math.min(1.0, score));
  }

  assessAspectualHarmony(birthChart, prediction) {
    let score = 0.4; // Base harmony score

    const relevantPlanets = this.getRelevantPlanets(prediction.type);

    if (birthChart.aspectAnalysis) {
      const beneficAspects = birthChart.aspectAnalysis.beneficAspects || [];
      const maleficAspects = birthChart.aspectAnalysis.maleficAspects || [];

      const totalAspects = beneficAspects.length + maleficAspects.length;
      if (totalAspects > 0) {
        const harmonyRatio = beneficAspects.length / totalAspects;
        score = 0.2 + (harmonyRatio * 0.8);
      }
    } else {
      // Calculate aspectual harmony from planetary positions
      if (birthChart.planetaryPositions) {
        let totalHarmonyScore = 0;
        let aspectCount = 0;

        // Analyze aspects between relevant planets
        for (let i = 0; i < relevantPlanets.length; i++) {
          for (let j = i + 1; j < relevantPlanets.length; j++) {
            const planet1 = relevantPlanets[i];
            const planet2 = relevantPlanets[j];

            const aspectInfo = this.calculateAspectBetweenPlanets(
              birthChart, planet1, planet2
            );

            if (aspectInfo.hasAspect) {
              let aspectScore = 0.5; // Neutral

              // Determine aspect nature
              const aspectType = aspectInfo.aspectType;
              const planet1Nature = this.getPlanetNature(planet1);
              const planet2Nature = this.getPlanetNature(planet2);

              // Benefic-benefic aspects
              if (planet1Nature === 'benefic' && planet2Nature === 'benefic') {
                aspectScore = this.getBeneficBeneficAspectScore(aspectType);
              }
              // Malefic-malefic aspects
              else if (planet1Nature === 'malefic' && planet2Nature === 'malefic') {
                aspectScore = this.getMaleficMaleficAspectScore(aspectType);
              }
              // Benefic-malefic aspects
              else {
                aspectScore = this.getBeneficMaleficAspectScore(aspectType);
              }

              // Apply orb consideration
              if (aspectInfo.orb) {
                const orbMultiplier = this.getOrbMultiplier(aspectInfo.orb, aspectType);
                aspectScore *= orbMultiplier;
              }

              totalHarmonyScore += aspectScore;
              aspectCount++;
            }
          }
        }

        if (aspectCount > 0) {
          score = totalHarmonyScore / aspectCount;
        }

        // Additional harmony factors

        // Check for protective aspects (Jupiter aspects)
        const jupiterProtection = this.assessJupiterProtection(birthChart, relevantPlanets);
        score += jupiterProtection * 0.1;

        // Check for malefic mitigation
        const maleficMitigation = this.assessMaleficMitigation(birthChart, relevantPlanets);
        score += maleficMitigation * 0.08;

        // Check for planetary yoga formations
        const yogaHarmony = this.assessYogaHarmony(birthChart, prediction.type);
        score += yogaHarmony * 0.12;
      }
    }

    return Math.max(0.1, Math.min(1.0, score));
  }

  assessTimingConfluence(prediction, analysisContext) {
    if (analysisContext.timingAnalysis?.consensusWindows) {
      const consensusCount = analysisContext.timingAnalysis.consensusWindows.length;
      return Math.min(1.0, 0.4 + (consensusCount * 0.2));
    }

    return 0.5;
  }

  assessClassicalValidation(prediction) {
    // This would validate against classical texts - simplified here
    const classicallyValidated = [
      'marriage', 'career', 'health', 'finance', 'education'
    ];

    return classicallyValidated.includes(prediction.type) ? 0.8 : 0.6;
  }

  /**
   * Calculate overall accuracy score
   */
  calculateOverallScore(factorScores, enhancementScores, predictionType) {
    let totalScore = 0;

    // Apply primary factors with their weights
    for (const [factor, score] of Object.entries(factorScores)) {
      const weight = this.accuracyFactors[factor] || 0;
      totalScore += score * weight;
    }

    // Apply enhancement factors
    let enhancementBonus = 0;
    for (const [factor, score] of Object.entries(enhancementScores)) {
      const weight = this.enhancementFactors[factor] || 0;
      enhancementBonus += score * weight;
    }

    // Apply category base accuracy
    const baseAccuracy = this.categoryBaseAccuracy[predictionType] || 0.65;
    const categoryMultiplier = 0.8 + (baseAccuracy * 0.4); // Scale between 0.8-1.2

    // Final score calculation
    const finalScore = (totalScore * categoryMultiplier) + enhancementBonus;

    return Math.max(0, Math.min(1, finalScore));
  }

  /**
   * Helper methods
   */
  getConfidenceLevel(score) {
    for (const [level, range] of Object.entries(this.confidenceRanges)) {
      if (score >= range.min && score <= range.max) {
        return level;
      }
    }
    return 'Unknown';
  }

  getRelevantPlanets(predictionType) {
    const planetMap = {
      marriage: ['Venus', 'Jupiter', 'Moon', 'Mars'],
      career: ['Saturn', 'Sun', 'Mars', 'Mercury', 'Jupiter'],
      health: ['Mars', 'Saturn', 'Moon', 'Sun'],
      finance: ['Jupiter', 'Venus', 'Mercury', 'Moon'],
      education: ['Mercury', 'Jupiter', 'Moon'],
      spirituality: ['Jupiter', 'Ketu', 'Saturn', 'Moon'],
      relationships: ['Venus', 'Moon', 'Mars'],
      children: ['Jupiter', 'Moon', 'Sun'],
      property: ['Mars', 'Moon', 'Venus'],
      travel: ['Mercury', 'Rahu', 'Moon']
    };

    return planetMap[predictionType] || ['Sun', 'Moon', 'Jupiter'];
  }

  identifyStrengths(factorScores, enhancementScores) {
    const strengths = [];

    // Check factor scores
    for (const [factor, score] of Object.entries(factorScores)) {
      if (score >= 0.8) {
        strengths.push(`Excellent ${factor.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
      } else if (score >= 0.7) {
        strengths.push(`Strong ${factor.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
      }
    }

    // Check enhancement scores
    for (const [factor, score] of Object.entries(enhancementScores)) {
      if (score >= 0.8) {
        strengths.push(`High ${factor.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
      }
    }

    return strengths;
  }

  identifyLimitations(factorScores, analysisContext) {
    const limitations = [];

    // Check low factor scores
    for (const [factor, score] of Object.entries(factorScores)) {
      if (score <= 0.4) {
        limitations.push(`Low ${factor.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
      }
    }

    // Check analysis context for limitations
    if (!analysisContext.birthData?.timeAccuracy || analysisContext.birthData.timeAccuracy === 'unknown') {
      limitations.push('Birth time accuracy uncertain');
    }

    if (!analysisContext.methodsUsed || analysisContext.methodsUsed.length < 2) {
      limitations.push('Limited analysis methods used');
    }

    return limitations;
  }

  createDetailedBreakdown(accuracy) {
    const breakdown = {
      primaryFactors: {},
      enhancementFactors: {},
      weightedContributions: {},
      confidenceRange: this.confidenceRanges[accuracy.confidenceLevel]
    };

    // Primary factors with weighted contributions
    for (const [factor, score] of Object.entries(accuracy.factorScores)) {
      const weight = this.accuracyFactors[factor];
      breakdown.primaryFactors[factor] = {
        score: score,
        weight: weight,
        contribution: score * weight,
        rating: this.getScoreRating(score)
      };
    }

    // Enhancement factors
    for (const [factor, score] of Object.entries(accuracy.enhancementScores)) {
      const weight = this.enhancementFactors[factor];
      breakdown.enhancementFactors[factor] = {
        score: score,
        weight: weight,
        bonus: score * weight,
        rating: this.getScoreRating(score)
      };
    }

    return breakdown;
  }

  createReliabilityAssessment(accuracy, prediction, analysisContext) {
    const assessment = {
      overallReliability: accuracy.confidenceLevel,
      keyStrengths: accuracy.strengths.slice(0, 3),
      mainLimitations: accuracy.limitations.slice(0, 3),
      recommendedConfidence: this.getRecommendedConfidence(accuracy.overallScore),
      qualityIndicators: this.getQualityIndicators(accuracy),
      riskFactors: this.getRiskFactors(accuracy, analysisContext)
    };

    return assessment;
  }

  generateAccuracyRecommendations(accuracy, analysisContext) {
    const recommendations = [];

    // Based on overall score
    if (accuracy.overallScore >= 0.8) {
      recommendations.push('High confidence - predictions are well-supported');
    } else if (accuracy.overallScore >= 0.6) {
      recommendations.push('Good confidence - interpret with awareness of limitations');
    } else if (accuracy.overallScore >= 0.4) {
      recommendations.push('Moderate confidence - seek additional confirmation');
    } else {
      recommendations.push('Low confidence - use with significant caution');
    }

    // Specific improvement recommendations
    if (accuracy.factorScores.dataQuality < 0.6) {
      recommendations.push('Consider rectification if birth time is uncertain');
    }

    if (accuracy.factorScores.systemConsistency < 0.6) {
      recommendations.push('Cross-validate with additional analysis methods');
    }

    if (accuracy.factorScores.timingPrecision < 0.6) {
      recommendations.push('Use multiple timing techniques for better precision');
    }

    // Enhancement recommendations
    if (accuracy.enhancementScores.multiMethodConsensus < 0.6) {
      recommendations.push('Analyze using multiple astrological systems');
    }

    return recommendations;
  }

  getScoreRating(score) {
    if (score >= 0.8) return 'Excellent';
    if (score >= 0.6) return 'Good';
    if (score >= 0.4) return 'Fair';
    return 'Poor';
  }

  getRecommendedConfidence(score) {
    if (score >= 0.85) return 'Very High Confidence';
    if (score >= 0.70) return 'High Confidence';
    if (score >= 0.55) return 'Moderate Confidence';
    if (score >= 0.40) return 'Low Confidence';
    return 'Very Low Confidence';
  }

  getQualityIndicators(accuracy) {
    const indicators = [];

    if (accuracy.factorScores.dataQuality >= 0.8) {
      indicators.push('High-quality birth data');
    }

    if (accuracy.factorScores.systemConsistency >= 0.8) {
      indicators.push('Excellent system agreement');
    }

    if (accuracy.enhancementScores.multiMethodConsensus >= 0.8) {
      indicators.push('Strong multi-method consensus');
    }

    return indicators;
  }

  getRiskFactors(accuracy, analysisContext) {
    const riskFactors = [];

    if (accuracy.factorScores.dataQuality < 0.5) {
      riskFactors.push('Uncertain birth data quality');
    }

    if (accuracy.factorScores.systemConsistency < 0.5) {
      riskFactors.push('Poor agreement across systems');
    }

    if (!analysisContext.verificationResults) {
      riskFactors.push('No cross-validation performed');
    }

    return riskFactors;
  }

  /**
   * Batch accuracy assessment for multiple predictions
   */
  assessBatchAccuracy(predictions, birthChart, analysisContext) {
    const batchAssessment = {
      totalPredictions: predictions.length,
      averageAccuracy: 0,
      highConfidencePredictions: [],
      lowConfidencePredictions: [],
      overallReliability: 'Unknown',
      recommendations: []
    };

    let totalScore = 0;

    for (const prediction of predictions) {
      const accuracy = this.calculateAccuracyScore(prediction, birthChart, analysisContext);
      totalScore += accuracy.overallScore;

      if (accuracy.overallScore >= 0.7) {
        batchAssessment.highConfidencePredictions.push({
          type: prediction.type,
          score: accuracy.overallScore,
          level: accuracy.confidenceLevel
        });
      } else if (accuracy.overallScore < 0.5) {
        batchAssessment.lowConfidencePredictions.push({
          type: prediction.type,
          score: accuracy.overallScore,
          level: accuracy.confidenceLevel
        });
      }
    }

    batchAssessment.averageAccuracy = totalScore / predictions.length;
    batchAssessment.overallReliability = this.getConfidenceLevel(batchAssessment.averageAccuracy);

    // Generate batch recommendations
    if (batchAssessment.averageAccuracy >= 0.7) {
      batchAssessment.recommendations.push('Overall high confidence in predictions');
    } else if (batchAssessment.averageAccuracy >= 0.5) {
      batchAssessment.recommendations.push('Mixed confidence levels - review individual predictions');
    } else {
      batchAssessment.recommendations.push('Overall low confidence - consider additional analysis');
    }

    if (batchAssessment.lowConfidencePredictions.length > predictions.length / 2) {
      batchAssessment.recommendations.push('Majority of predictions have low confidence - review methodology');
    }

    return batchAssessment;
  }

  /**
   * Generate comprehensive accuracy report
   */
  generateAccuracyReport(prediction, birthChart, analysisContext) {
    const accuracy = this.calculateAccuracyScore(prediction, birthChart, analysisContext);

    const report = {
      executiveSummary: this.createExecutiveSummary(accuracy),
      detailedAnalysis: accuracy.detailedBreakdown,
      reliabilityAssessment: accuracy.reliabilityAssessment,
      factorAnalysis: this.createFactorAnalysis(accuracy),
      improvementSuggestions: this.createImprovementSuggestions(accuracy, analysisContext),
      confidenceMetrics: this.createConfidenceMetrics(accuracy),
      recommendations: accuracy.recommendations,
      technicalDetails: this.createTechnicalDetails(accuracy, analysisContext)
    };

    return report;
  }

  createExecutiveSummary(accuracy) {
    return {
      overallScore: accuracy.overallScore,
      confidenceLevel: accuracy.confidenceLevel,
      predictionType: accuracy.predictionType,
      keyStrengths: accuracy.strengths.slice(0, 2),
      mainLimitations: accuracy.limitations.slice(0, 2),
      recommendation: accuracy.recommendations[0] || 'Standard interpretation recommended'
    };
  }

  createFactorAnalysis(accuracy) {
    const analysis = {
      strongestFactors: [],
      weakestFactors: [],
      enhancementOpportunities: []
    };

    // Identify strongest factors
    for (const [factor, breakdown] of Object.entries(accuracy.detailedBreakdown.primaryFactors)) {
      if (breakdown.score >= 0.8) {
        analysis.strongestFactors.push({
          factor: factor,
          score: breakdown.score,
          contribution: breakdown.contribution
        });
      } else if (breakdown.score <= 0.4) {
        analysis.weakestFactors.push({
          factor: factor,
          score: breakdown.score,
          contribution: breakdown.contribution
        });
      }
    }

    // Identify enhancement opportunities
    for (const [factor, breakdown] of Object.entries(accuracy.detailedBreakdown.enhancementFactors)) {
      if (breakdown.score < 0.6) {
        analysis.enhancementOpportunities.push({
          factor: factor,
          currentScore: breakdown.score,
          potentialBonus: breakdown.weight,
          improvement: 'Could be enhanced for better accuracy'
        });
      }
    }

    return analysis;
  }

  createImprovementSuggestions(accuracy, analysisContext) {
    const suggestions = [];

    // Data quality improvements
    if (accuracy.factorScores.dataQuality < 0.7) {
      suggestions.push({
        category: 'Data Quality',
        priority: 'High',
        suggestion: 'Improve birth data accuracy through rectification or better sources',
        expectedImpact: 'Significant improvement in overall accuracy'
      });
    }

    // Method diversity improvements
    if (accuracy.factorScores.methodReliability < 0.7) {
      suggestions.push({
        category: 'Method Diversity',
        priority: 'Medium',
        suggestion: 'Use additional analysis methods for cross-validation',
        expectedImpact: 'Better reliability and confidence'
      });
    }

    // Timing precision improvements
    if (accuracy.factorScores.timingPrecision < 0.6) {
      suggestions.push({
        category: 'Timing Precision',
        priority: 'Medium',
        suggestion: 'Apply multiple timing techniques for better precision',
        expectedImpact: 'More accurate timing predictions'
      });
    }

    // Enhancement opportunities
    if (accuracy.enhancementScores.multiMethodConsensus < 0.6) {
      suggestions.push({
        category: 'Consensus Building',
        priority: 'Low',
        suggestion: 'Seek agreement across multiple astrological systems',
        expectedImpact: 'Increased confidence in predictions'
      });
    }

    return suggestions;
  }

  createConfidenceMetrics(accuracy) {
    const range = this.confidenceRanges[accuracy.confidenceLevel];

    return {
      numericScore: accuracy.overallScore,
      percentageScore: Math.round(accuracy.overallScore * 100),
      confidenceLevel: accuracy.confidenceLevel,
      confidenceRange: range,
      reliabilityIndex: this.calculateReliabilityIndex(accuracy),
      stabilityScore: this.calculateStabilityScore(accuracy),
      precisionRating: this.calculatePrecisionRating(accuracy)
    };
  }

  createTechnicalDetails(accuracy, analysisContext) {
    return {
      calculationMethod: 'Multi-factor weighted analysis',
      primaryFactors: Object.keys(this.accuracyFactors),
      enhancementFactors: Object.keys(this.enhancementFactors),
      methodsUsed: analysisContext.methodsUsed || [],
      dataQualityMetrics: {
        timeAccuracy: analysisContext.birthData?.timeAccuracy || 'unknown',
        locationPrecision: analysisContext.birthData?.locationPrecision || 'moderate',
        sourceReliability: analysisContext.dataSource?.reliability || 'moderate'
      },
      calculationTimestamp: new Date().toISOString(),
      version: '1.0.0'
    };
  }

  calculateReliabilityIndex(accuracy) {
    // Composite reliability based on multiple factors
    const consistencyWeight = 0.4;
    const methodWeight = 0.3;
    const dataWeight = 0.3;

    const reliabilityIndex = (
      accuracy.factorScores.systemConsistency * consistencyWeight +
      accuracy.factorScores.methodReliability * methodWeight +
      accuracy.factorScores.dataQuality * dataWeight
    );

    return Math.round(reliabilityIndex * 100);
  }

  calculateStabilityScore(accuracy) {
    // Measure how stable the prediction is across different factors
    const scores = Object.values(accuracy.factorScores);
    const mean = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    const variance = scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / scores.length;
    const standardDeviation = Math.sqrt(variance);

    // Lower standard deviation = higher stability
    const stabilityScore = Math.max(0, 1 - (standardDeviation * 2));
    return Math.round(stabilityScore * 100);
  }

  calculatePrecisionRating(accuracy) {
    // Combined precision based on timing and method precision
    const timingPrecision = accuracy.factorScores.timingPrecision || 0.5;
    const methodPrecision = accuracy.factorScores.methodReliability || 0.5;
    const consensusPrecision = accuracy.enhancementScores.multiMethodConsensus || 0.5;

    const overallPrecision = (timingPrecision + methodPrecision + consensusPrecision) / 3;
    return Math.round(overallPrecision * 100);
  }

  /**
   * Utility methods for external use
   */
  getAccuracyThresholds() {
    return {
      excellent: 0.85,
      good: 0.70,
      acceptable: 0.55,
      questionable: 0.40,
      unreliable: 0.25
    };
  }

  getMethodWeights() {
    return { ...this.accuracyFactors };
  }

  getEnhancementWeights() {
    return { ...this.enhancementFactors };
  }

  getCategoryBaseAccuracy() {
    return { ...this.categoryBaseAccuracy };
  }

  /**
   * Quick accuracy assessment for simple use cases
   */
  quickAssessment(prediction, birthChart) {
    const simpleContext = {
      methodsUsed: ['houseAnalysis'],
      birthData: { timeAccuracy: 'approximate' }
    };

    const accuracy = this.calculateAccuracyScore(prediction, birthChart, simpleContext);

    return {
      score: accuracy.overallScore,
      level: accuracy.confidenceLevel,
      recommendation: accuracy.recommendations[0] || 'Standard interpretation'
    };
  }

  // Supporting methods for enhanced accuracy calculations

  getMethodWeight(method) {
    const weights = {
      'dasha_analysis': 1.2,
      'transit_analysis': 1.1,
      'divisional_charts': 1.3,
      'yogas': 1.0,
      'aspects': 0.9,
      'house_analysis': 1.0,
      'planetary_strength': 1.1,
      'basic': 0.7
    };
    return weights[method] || 1.0;
  }

  isTraditionalMethod(method) {
    const traditionalMethods = [
      'dasha_analysis', 'yogas', 'divisional_charts',
      'planetary_strength', 'house_analysis'
    ];
    return traditionalMethods.includes(method);
  }

  hasStrongValidation(method) {
    const stronglyValidated = [
      'dasha_analysis', 'transit_analysis', 'divisional_charts'
    ];
    return stronglyValidated.includes(method);
  }

  calculateMethodDiversity(methods) {
    const methodTypes = this.categorizeAnalysisMethods(methods);
    return Object.keys(methodTypes).length / 6; // Max 6 types
  }

  categorizeAnalysisMethods(methods) {
    const categories = {
      timing: ['dasha_analysis', 'transit_analysis'],
      structural: ['divisional_charts', 'house_analysis'],
      planetary: ['planetary_strength', 'aspects'],
      pattern: ['yogas'],
      predictive: ['progression_analysis'],
      basic: ['basic']
    };

    const foundCategories = {};
    for (const method of methods) {
      for (const [category, categoryMethods] of Object.entries(categories)) {
        if (categoryMethods.includes(method)) {
          foundCategories[category] = true;
        }
      }
    }
    return foundCategories;
  }

  calculateMethodTypeDiversity(methodTypes) {
    return Object.keys(methodTypes).length / 6; // Normalize to 0-1
  }

  assessPlanetaryStrengthConsensus(planetaryStrengths) {
    const strengths = Object.values(planetaryStrengths);
    if (strengths.length === 0) return 0;

    const avgStrength = strengths.reduce((sum, s) => sum + (s.total || 5), 0) / strengths.length;
    return Math.min(1, avgStrength / 10);
  }

  assessHouseAnalysisConsensus(houseAnalysis) {
    let consensusScore = 0;
    let totalWeight = 0;

    const houseImportance = {
      1: 1.0,   // Lagna - Self
      2: 0.8,   // Wealth
      3: 0.6,   // Efforts
      4: 0.9,   // Home/Mother
      5: 0.9,   // Children/Intelligence
      6: 0.7,   // Enemies/Disease
      7: 1.0,   // Partnership/Marriage
      8: 0.8,   // Longevity/Transformation
      9: 0.9,   // Fortune/Father
      10: 1.0,  // Career/Status
      11: 0.8,  // Gains
      12: 0.7   // Expenses/Loss
    };

    for (let house = 1; house <= 12; house++) {
      const houseData = houseAnalysis[house];
      const importance = houseImportance[house];
      totalWeight += importance;

      if (houseData) {
        let houseScore = 0;

        // Check lord analysis quality
        if (houseData.lordAnalysis) {
          houseScore += 0.3;

          // Enhanced scoring for detailed lord analysis
          if (houseData.lordAnalysis.strength) houseScore += 0.1;
          if (houseData.lordAnalysis.placement) houseScore += 0.1;
          if (houseData.lordAnalysis.aspects) houseScore += 0.1;
          if (houseData.lordAnalysis.dignity) houseScore += 0.1;
        }

        // Check occupant analysis
        if (houseData.occupants && houseData.occupants.length > 0) {
          houseScore += 0.2;

          // Bonus for detailed occupant analysis
          houseData.occupants.forEach(occupant => {
            if (occupant.strength) houseScore += 0.05;
            if (occupant.effects) houseScore += 0.05;
          });
        }

        // Check aspect analysis
        if (houseData.aspects) {
          houseScore += 0.2;

          // Quality of aspect analysis
          if (houseData.aspects.length > 0) {
            houseData.aspects.forEach(aspect => {
              if (aspect.strength && aspect.effect) houseScore += 0.03;
            });
          }
        }

        // Check signification analysis
        if (houseData.significations) {
          houseScore += 0.15;
        }

        // Check timing analysis
        if (houseData.timing) {
          houseScore += 0.1;
        }

        // Apply house importance weighting
        consensusScore += Math.min(1, houseScore) * importance;
      }
    }

    return Math.min(1, consensusScore / totalWeight);
  }

  assessTimingSpecificity(timing) {
    let specificity = 0;

    if (timing.startDate && timing.endDate) {
      const timeSpan = new Date(timing.endDate) - new Date(timing.startDate);
      const days = timeSpan / (1000 * 60 * 60 * 24);

      if (days <= 30) specificity += 0.3;
      else if (days <= 90) specificity += 0.2;
      else if (days <= 365) specificity += 0.15;
      else specificity += 0.1;
    }

    if (timing.peakDate) specificity += 0.15;
    if (timing.confidence && timing.confidence > 0.7) specificity += 0.1;

    return Math.min(0.4, specificity);
  }

  assessDashaAnalysisDepth(dashaAnalysis) {
    let depth = 0;

    if (dashaAnalysis.mahadasha) depth += 0.3;
    if (dashaAnalysis.antardasha) depth += 0.4;
    if (dashaAnalysis.pratyantardasha) depth += 0.3;

    return Math.min(1, depth);
  }

  assessTransitAnalysisQuality(transitAnalysis) {
    let quality = 0;

    if (transitAnalysis.slowPlanets) quality += 0.4;
    if (transitAnalysis.fastPlanets) quality += 0.2;
    if (transitAnalysis.returnCharts) quality += 0.2;
    if (transitAnalysis.eclipses) quality += 0.2;

    return Math.min(1, quality);
  }

  getPlanetaryWeight(planet, predictionType) {
    const weights = {
      marriage: { Venus: 1.5, Jupiter: 1.3, Moon: 1.2, Mars: 1.1 },
      career: { Saturn: 1.4, Sun: 1.3, Mars: 1.2, Mercury: 1.1, Jupiter: 1.2 },
      health: { Mars: 1.3, Saturn: 1.2, Moon: 1.1, Sun: 1.0 },
      finance: { Jupiter: 1.4, Venus: 1.2, Mercury: 1.1, Moon: 1.0 }
    };

    return weights[predictionType]?.[planet] || 1.0;
  }

  isInOwnSign(planet, sign) {
    const ownSigns = {
      Sun: ['Leo'],
      Moon: ['Cancer'],
      Mars: ['Aries', 'Scorpio'],
      Mercury: ['Gemini', 'Virgo'],
      Jupiter: ['Sagittarius', 'Pisces'],
      Venus: ['Taurus', 'Libra'],
      Saturn: ['Capricorn', 'Aquarius'],
      Rahu: [],
      Ketu: []
    };

    return ownSigns[planet]?.includes(sign) || false;
  }

  isInMoolatrikona(planet, sign) {
    const moolaTrikona = {
      Sun: 'Leo',
      Moon: 'Taurus',
      Mars: 'Aries',
      Mercury: 'Virgo',
      Jupiter: 'Sagittarius',
      Venus: 'Libra',
      Saturn: 'Aquarius'
    };

    return moolaTrikona[planet] === sign;
  }

  hasNeechaBhanga(birthChart, planet) {
    const planetData = birthChart.planetaryPositions?.[planet.toLowerCase()];
    if (!planetData || planetData.dignity !== 'debilitated') return false;

    const planetHouse = planetData.house;
    const planetSign = planetData.sign;
    const moonData = birthChart.planetaryPositions?.moon;

    // Rule 1: Lord of debilitation sign is in Kendra from Lagna
    const debilitationLord = this.getSignLord(planetSign);
    const debilitationLordData = birthChart.planetaryPositions?.[debilitationLord.toLowerCase()];
    if (debilitationLordData && [1, 4, 7, 10].includes(debilitationLordData.house)) {
      return true;
    }

    // Rule 2: Lord of debilitation sign is in Kendra from Moon
    if (moonData && debilitationLordData) {
      const moonHouse = moonData.house;
      const kendrasFromMoon = [
        moonHouse,
        ((moonHouse + 2) % 12) + 1,
        ((moonHouse + 5) % 12) + 1,
        ((moonHouse + 8) % 12) + 1
      ];
      if (kendrasFromMoon.includes(debilitationLordData.house)) {
        return true;
      }
    }

    // Rule 3: Lord of exaltation sign is in Kendra from Lagna or Moon
    const exaltationSign = this.getExaltationSign(planet);
    const exaltationLord = this.getSignLord(exaltationSign);
    const exaltationLordData = birthChart.planetaryPositions?.[exaltationLord.toLowerCase()];

    if (exaltationLordData) {
      // From Lagna
      if ([1, 4, 7, 10].includes(exaltationLordData.house)) {
        return true;
      }

      // From Moon
      if (moonData) {
        const moonHouse = moonData.house;
        const kendrasFromMoon = [
          moonHouse,
          ((moonHouse + 2) % 12) + 1,
          ((moonHouse + 5) % 12) + 1,
          ((moonHouse + 8) % 12) + 1
        ];
        if (kendrasFromMoon.includes(exaltationLordData.house)) {
          return true;
        }
      }
    }

    // Rule 4: Planet is aspected by its exaltation lord
    if (exaltationLordData) {
      const aspectInfo = this.calculateAspectBetweenPlanets(birthChart, exaltationLord, planet);
      if (aspectInfo.hasAspect && ['trine', 'sextile', 'conjunction'].includes(aspectInfo.aspectType)) {
        return true;
      }
    }

    // Rule 5: Debilitated planet is in Kendra from Lagna or Moon
    if ([1, 4, 7, 10].includes(planetHouse)) {
      return true;
    }

    if (moonData) {
      const moonHouse = moonData.house;
      const kendrasFromMoon = [
        moonHouse,
        ((moonHouse + 2) % 12) + 1,
        ((moonHouse + 5) % 12) + 1,
        ((moonHouse + 8) % 12) + 1
      ];
      if (kendrasFromMoon.includes(planetHouse)) {
        return true;
      }
    }

    // Rule 6: Another planet is exalted in the same sign as debilitation
    for (const [otherPlanet, otherData] of Object.entries(birthChart.planetaryPositions || {})) {
      if (otherPlanet !== planet.toLowerCase() && otherData.sign === planetSign) {
        if (this.isExalted(otherPlanet, otherData.sign)) {
          return true;
        }
      }
    }

    return false;
  }

  getSignLord(sign) {
    const lords = {
      'Aries': 'Mars', 'Taurus': 'Venus', 'Gemini': 'Mercury',
      'Cancer': 'Moon', 'Leo': 'Sun', 'Virgo': 'Mercury',
      'Libra': 'Venus', 'Scorpio': 'Mars', 'Sagittarius': 'Jupiter',
      'Capricorn': 'Saturn', 'Aquarius': 'Saturn', 'Pisces': 'Jupiter'
    };
    return lords[sign] || '';
  }

  isFriendlySign(planet, sign) {
    const signLord = this.getSignLord(sign);

    // Comprehensive planetary friendship matrix based on classical texts
    const planetaryFriendships = {
      Sun: {
        friends: ['Moon', 'Mars', 'Jupiter'],
        neutrals: ['Mercury'],
        enemies: ['Venus', 'Saturn', 'Rahu', 'Ketu']
      },
      Moon: {
        friends: ['Sun', 'Mercury'],
        neutrals: ['Mars', 'Jupiter', 'Venus', 'Saturn'],
        enemies: ['Rahu', 'Ketu']
      },
      Mars: {
        friends: ['Sun', 'Moon', 'Jupiter'],
        neutrals: ['Venus', 'Saturn'],
        enemies: ['Mercury', 'Rahu', 'Ketu']
      },
      Mercury: {
        friends: ['Sun', 'Venus'],
        neutrals: ['Mars', 'Jupiter', 'Saturn'],
        enemies: ['Moon', 'Rahu', 'Ketu']
      },
      Jupiter: {
        friends: ['Sun', 'Moon', 'Mars'],
        neutrals: ['Saturn'],
        enemies: ['Mercury', 'Venus', 'Rahu', 'Ketu']
      },
      Venus: {
        friends: ['Mercury', 'Saturn'],
        neutrals: ['Mars', 'Jupiter'],
        enemies: ['Sun', 'Moon', 'Rahu', 'Ketu']
      },
      Saturn: {
        friends: ['Mercury', 'Venus'],
        neutrals: ['Jupiter'],
        enemies: ['Sun', 'Moon', 'Mars', 'Rahu', 'Ketu']
      },
      Rahu: {
        friends: ['Venus', 'Saturn'],
        neutrals: ['Mercury'],
        enemies: ['Sun', 'Moon', 'Mars', 'Jupiter', 'Ketu']
      },
      Ketu: {
        friends: ['Mars', 'Jupiter'],
        neutrals: ['Mercury'],
        enemies: ['Sun', 'Moon', 'Venus', 'Saturn', 'Rahu']
      }
    };

    const planetRelations = planetaryFriendships[planet];
    if (!planetRelations) return false;

    return planetRelations.friends.includes(signLord);
  }

  isEnemySign(planet, sign) {
    const signLord = this.getSignLord(sign);

    // Use the same comprehensive planetary relationship matrix
    const planetaryFriendships = {
      Sun: {
        friends: ['Moon', 'Mars', 'Jupiter'],
        neutrals: ['Mercury'],
        enemies: ['Venus', 'Saturn', 'Rahu', 'Ketu']
      },
      Moon: {
        friends: ['Sun', 'Mercury'],
        neutrals: ['Mars', 'Jupiter', 'Venus', 'Saturn'],
        enemies: ['Rahu', 'Ketu']
      },
      Mars: {
        friends: ['Sun', 'Moon', 'Jupiter'],
        neutrals: ['Venus', 'Saturn'],
        enemies: ['Mercury', 'Rahu', 'Ketu']
      },
      Mercury: {
        friends: ['Sun', 'Venus'],
        neutrals: ['Mars', 'Jupiter', 'Saturn'],
        enemies: ['Moon', 'Rahu', 'Ketu']
      },
      Jupiter: {
        friends: ['Sun', 'Moon', 'Mars'],
        neutrals: ['Saturn'],
        enemies: ['Mercury', 'Venus', 'Rahu', 'Ketu']
      },
      Venus: {
        friends: ['Mercury', 'Saturn'],
        neutrals: ['Mars', 'Jupiter'],
        enemies: ['Sun', 'Moon', 'Rahu', 'Ketu']
      },
      Saturn: {
        friends: ['Mercury', 'Venus'],
        neutrals: ['Jupiter'],
        enemies: ['Sun', 'Moon', 'Mars', 'Rahu', 'Ketu']
      },
      Rahu: {
        friends: ['Venus', 'Saturn'],
        neutrals: ['Mercury'],
        enemies: ['Sun', 'Moon', 'Mars', 'Jupiter', 'Ketu']
      },
      Ketu: {
        friends: ['Mars', 'Jupiter'],
        neutrals: ['Mercury'],
        enemies: ['Sun', 'Moon', 'Venus', 'Saturn', 'Rahu']
      }
    };

    const planetRelations = planetaryFriendships[planet];
    if (!planetRelations) return false;

    return planetRelations.enemies.includes(signLord);
  }

  isVargottama(planetData) {
    // Check if planet is in same sign in D1 and D9
    if (planetData.navamsaSign) {
      return planetData.sign === planetData.navamsaSign;
    }
    return false;
  }

  isCombust(birthChart, planet) {
    const sunData = birthChart.planetaryPositions?.sun;
    const planetData = birthChart.planetaryPositions?.[planet.toLowerCase()];

    if (!sunData || !planetData || planet === 'Sun') return false;

    const distance = Math.abs(sunData.longitude - planetData.longitude);
    const combustionThresholds = {
      Moon: 12, Mercury: 14, Venus: 10, Mars: 17, Jupiter: 11, Saturn: 15
    };

    return distance <= (combustionThresholds[planet] || 8);
  }

  getHouseStrengthMultiplier(houseNumber) {
    const multipliers = {
      1: 1.2, 4: 1.15, 7: 1.1, 10: 1.2, // Kendras
      5: 1.15, 9: 1.15, // Trikonas
      6: 0.8, 8: 0.7, 12: 0.75 // Dusthanas
    };

    return multipliers[houseNumber] || 1.0;
  }

  calculateAspectBetweenPlanets(birthChart, planet1, planet2) {
    const p1Data = birthChart.planetaryPositions?.[planet1.toLowerCase()];
    const p2Data = birthChart.planetaryPositions?.[planet2.toLowerCase()];

    if (!p1Data || !p2Data) {
      return { hasAspect: false };
    }

    const longitudeDiff = Math.abs(p1Data.longitude - p2Data.longitude);
    const aspectAngle = Math.min(longitudeDiff, 360 - longitudeDiff);

    const aspects = [
      { angle: 0, type: 'conjunction', orb: 8 },
      { angle: 60, type: 'sextile', orb: 6 },
      { angle: 90, type: 'square', orb: 8 },
      { angle: 120, type: 'trine', orb: 8 },
      { angle: 180, type: 'opposition', orb: 8 }
    ];

    for (const aspect of aspects) {
      if (Math.abs(aspectAngle - aspect.angle) <= aspect.orb) {
        return {
          hasAspect: true,
          aspectType: aspect.type,
          orb: Math.abs(aspectAngle - aspect.angle)
        };
      }
    }

    return { hasAspect: false };
  }

  getPlanetNature(planet) {
    const benefics = ['Jupiter', 'Venus', 'Moon'];
    const malefics = ['Saturn', 'Mars', 'Sun', 'Rahu', 'Ketu'];

    if (benefics.includes(planet)) return 'benefic';
    if (malefics.includes(planet)) return 'malefic';
    return 'neutral'; // Mercury
  }

  getBeneficBeneficAspectScore(aspectType) {
    const scores = {
      conjunction: 0.85,
      trine: 0.9,
      sextile: 0.75,
      square: 0.4,
      opposition: 0.5
    };
    return scores[aspectType] || 0.6;
  }

  getMaleficMaleficAspectScore(aspectType) {
    const scores = {
      conjunction: 0.4,
      trine: 0.6,
      sextile: 0.55,
      square: 0.3,
      opposition: 0.35
    };
    return scores[aspectType] || 0.4;
  }

  getBeneficMaleficAspectScore(aspectType) {
    const scores = {
      conjunction: 0.5,
      trine: 0.7,
      sextile: 0.65,
      square: 0.35,
      opposition: 0.4
    };
    return scores[aspectType] || 0.5;
  }

  getOrbMultiplier(orb, aspectType) {
    const maxOrb = aspectType === 'conjunction' ? 8 : 6;
    return Math.max(0.5, 1 - (orb / maxOrb) * 0.5);
  }

  assessJupiterProtection(birthChart, relevantPlanets) {
    const jupiterData = birthChart.planetaryPositions?.jupiter;
    if (!jupiterData) return 0;

    let protection = 0;
    for (const planet of relevantPlanets) {
      if (planet === 'Jupiter') continue;

      const aspectInfo = this.calculateAspectBetweenPlanets(birthChart, 'Jupiter', planet);
      if (aspectInfo.hasAspect && ['trine', 'sextile'].includes(aspectInfo.aspectType)) {
        protection += 0.2;
      }
    }

    return Math.min(1, protection);
  }

  assessMaleficMitigation(birthChart, relevantPlanets) {
    let mitigation = 0;
    const malefics = ['Mars', 'Saturn'];

    for (const malefic of malefics) {
      const maleficData = birthChart.planetaryPositions?.[malefic.toLowerCase()];
      if (maleficData) {
        // Check if malefic is well-placed
        if ([5, 9, 11].includes(maleficData.house)) {
          mitigation += 0.3;
        }

        // Check if aspected by benefics
        const jupiterAspect = this.calculateAspectBetweenPlanets(birthChart, 'Jupiter', malefic);
        if (jupiterAspect.hasAspect) {
          mitigation += 0.2;
        }
      }
    }

    return Math.min(1, mitigation);
  }

  assessYogaHarmony(birthChart, predictionType) {
    let harmonyScore = 0;
    let totalWeight = 0;

    if (!birthChart.yogaAnalysis) {
      return 0.5; // Neutral when no yoga analysis available
    }

    // Comprehensive yoga classification with weights based on impact
    const yogaClassification = {
      'raja_yoga': { type: 'benefic', weight: 1.0, strength: 0.9 },
      'gaja_kesari': { type: 'benefic', weight: 0.8, strength: 0.8 },
      'dhana_yoga': { type: 'benefic', weight: 0.7, strength: 0.7 },
      'neecha_bhanga': { type: 'benefic', weight: 0.9, strength: 0.8 },
      'viparita_raja_yoga': { type: 'benefic', weight: 0.8, strength: 0.7 },
      'pancha_mahapurusha': { type: 'benefic', weight: 1.0, strength: 0.9 },
      'chandra_mangala': { type: 'benefic', weight: 0.6, strength: 0.6 },
      'guru_mangala': { type: 'benefic', weight: 0.7, strength: 0.7 },
      'budha_aditya': { type: 'benefic', weight: 0.6, strength: 0.6 },
      'malavya_yoga': { type: 'benefic', weight: 0.8, strength: 0.8 },
      'hamsa_yoga': { type: 'benefic', weight: 0.9, strength: 0.8 },
      'sasha_yoga': { type: 'benefic', weight: 0.7, strength: 0.7 },
      'ruchaka_yoga': { type: 'benefic', weight: 0.7, strength: 0.7 },
      'bhadra_yoga': { type: 'benefic', weight: 0.6, strength: 0.6 },
      'kemadruma': { type: 'malefic', weight: 0.8, strength: -0.7 },
      'daridra_yoga': { type: 'malefic', weight: 0.7, strength: -0.6 },
      'graha_yuddha': { type: 'malefic', weight: 0.5, strength: -0.4 },
      'papa_kartari': { type: 'malefic', weight: 0.6, strength: -0.5 },
      'shakat_yoga': { type: 'malefic', weight: 0.4, strength: -0.3 },
      'kemdruma_dosha': { type: 'malefic', weight: 0.7, strength: -0.6 }
    };

    // Prediction-type specific yoga relevance
    const predictionRelevance = {
      marriage: {
        'gaja_kesari': 1.2,
        'chandra_mangala': 1.3,
        'guru_mangala': 1.1,
        'kemadruma': 1.4
      },
      career: {
        'raja_yoga': 1.3,
        'dhana_yoga': 1.2,
        'pancha_mahapurusha': 1.4,
        'daridra_yoga': 1.3
      },
      health: {
        'neecha_bhanga': 1.2,
        'viparita_raja_yoga': 1.1,
        'papa_kartari': 1.3
      },
      finance: {
        'dhana_yoga': 1.4,
        'raja_yoga': 1.2,
        'daridra_yoga': 1.5,
        'shakat_yoga': 1.2
      }
    };

    // Analyze each yoga
    for (const [yogaName, yogaData] of Object.entries(birthChart.yogaAnalysis)) {
      const yogaKey = this.normalizeYogaName(yogaName);
      const yogaInfo = yogaClassification[yogaKey];

      if (!yogaInfo) continue; // Skip unknown yogas

      let yogaWeight = yogaInfo.weight;
      let yogaStrength = yogaInfo.strength;

      // Apply prediction-type relevance multiplier
      const relevanceMultiplier = predictionRelevance[predictionType]?.[yogaKey] || 1.0;
      yogaWeight *= relevanceMultiplier;

      // Consider yoga strength from analysis if available
      if (yogaData.strength) {
        const dataStrength = this.normalizeYogaStrength(yogaData.strength);
        yogaStrength *= dataStrength;
      }

      // Check if yoga is actually active/manifesting
      let manifestationFactor = 1.0;
      if (yogaData.isActive !== undefined) {
        manifestationFactor = yogaData.isActive ? 1.0 : 0.3;
      } else if (yogaData.manifestation) {
        manifestationFactor = this.assessYogaManifestation(yogaData.manifestation);
      }

      // Calculate final yoga contribution
      const yogaContribution = yogaStrength * manifestationFactor;
      harmonyScore += yogaContribution * yogaWeight;
      totalWeight += yogaWeight;
    }

    // Normalize the score
    if (totalWeight === 0) return 0.5;

    const normalizedScore = harmonyScore / totalWeight;

    // Additional harmony factors
    let harmonyMultiplier = 1.0;

    // Check for yoga combinations (mutual enhancement)
    const activeYogas = Object.keys(birthChart.yogaAnalysis);
    if (activeYogas.length > 3) {
      harmonyMultiplier += 0.1; // Multiple yogas can enhance each other
    }

    // Check for conflicting yogas
    const hasConflictingYogas = this.checkYogaConflicts(activeYogas);
    if (hasConflictingYogas) {
      harmonyMultiplier -= 0.2;
    }

    const finalScore = normalizedScore * harmonyMultiplier;
    return Math.max(0, Math.min(1, (finalScore + 1) / 2)); // Convert from -1,1 to 0,1 range
  }

  // Supporting methods for enhanced calculations

  getExaltationSign(planet) {
    const exaltationSigns = {
      Sun: 'Aries',
      Moon: 'Taurus',
      Mars: 'Capricorn',
      Mercury: 'Virgo',
      Jupiter: 'Cancer',
      Venus: 'Pisces',
      Saturn: 'Libra',
      Rahu: 'Gemini',
      Ketu: 'Sagittarius'
    };
    return exaltationSigns[planet] || '';
  }

  isExalted(planet, sign) {
    return this.getExaltationSign(planet) === sign;
  }

  normalizeYogaName(yogaName) {
    // Convert yoga name to standard key format
    return yogaName.toLowerCase()
      .replace(/\s+/g, '_')
      .replace(/[^a-z0-9_]/g, '')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '');
  }

  normalizeYogaStrength(strength) {
    if (typeof strength === 'number') {
      return Math.max(0, Math.min(1, strength));
    }

    if (typeof strength === 'string') {
      const strengthMap = {
        'very_strong': 1.0,
        'strong': 0.8,
        'moderate': 0.6,
        'weak': 0.4,
        'very_weak': 0.2,
        'excellent': 1.0,
        'good': 0.75,
        'average': 0.5,
        'poor': 0.25
      };

      const normalizedKey = strength.toLowerCase().replace(/\s+/g, '_');
      return strengthMap[normalizedKey] || 0.5;
    }

    return 0.5; // Default moderate strength
  }

  assessYogaManifestation(manifestation) {
    if (typeof manifestation === 'number') {
      return Math.max(0, Math.min(1, manifestation));
    }

    if (typeof manifestation === 'string') {
      const manifestationMap = {
        'full': 1.0,
        'high': 0.8,
        'moderate': 0.6,
        'partial': 0.4,
        'weak': 0.2,
        'dormant': 0.1,
        'active': 0.8,
        'inactive': 0.2
      };

      const normalizedKey = manifestation.toLowerCase().replace(/\s+/g, '_');
      return manifestationMap[normalizedKey] || 0.5;
    }

    return 0.5; // Default moderate manifestation
  }

  checkYogaConflicts(activeYogas) {
    // Define conflicting yoga pairs
    const conflicts = [
      ['raja_yoga', 'daridra_yoga'],
      ['dhana_yoga', 'daridra_yoga'],
      ['gaja_kesari', 'kemadruma'],
      ['neecha_bhanga', 'papa_kartari'],
      ['pancha_mahapurusha', 'kemdruma_dosha']
    ];

    const normalizedYogas = activeYogas.map(yoga => this.normalizeYogaName(yoga));

    for (const [yoga1, yoga2] of conflicts) {
      if (normalizedYogas.includes(yoga1) && normalizedYogas.includes(yoga2)) {
        return true;
      }
    }

    return false;
  }
}

module.exports = PredictiveAccuracyScorer;
