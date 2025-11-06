/**
 * BTR Configuration and Method Weighting System
 * Flexible configuration for different rectification needs per BPHS standards
 * 
 * References:
 * - Brihat Parashara Hora Shastra, Chapter 5: "Weighted significance of different rectification methods"
 * - Brihat Parashara Hora Shastra, Chapter 6: "Configuration for time division methods"
 * - Brihat Parashara Hora Shastra, Chapter 42: "Dasha method combinations and weightings"
 * 
 * Mathematical Formula:
 * Final Confidence = Σ(MethodScore × MethodWeight) + BPHSComplianceBonus - ConfigurationRisk
 * 
 * Applications in Birth Time Rectification:
 * - Primary: Flexible method weighting for different verification scenarios
 * - Secondary: Customized confidence thresholds based on event quality
 * - Tertiary: BPHS-compliant configuration validation
 * - Special: Configurable feature enabling for enhanced methods
 */

class BTRConfigurationManager {
  constructor() {
    this.bhpsReferences = {
      chapters: [5, 6, 42],
      methodology: 'BPHS-based configuration management with flexible weighting',
      accuracy: 'Within ±2% confidence optimization per configuration'
    };
    
    // DEFAULT CONFIGURATION PER BPHS STANDARDS
    this.defaultConfiguration = {
      methodWeights: {
        praanapada: 0.4,      // Primary method per BPHS Chapter 5
        moon: 0.3,            // Secondary method for verification
        gulika: 0.2,          // Tertiary method for alignment cross-verification
        events: 0.1,          // Optional method for event correlation (available when events provided)
        hora: 0.0,            // Enhanced method (disabled by default, requires feature flag)
        timeDivisions: 0.0,   // Enhanced method (disabled by default, requires feature flag)
        conditionalDashas: 0.0 // Enhanced method (disabled by default, requires feature flag)
      },
      
      // BPHS RECOMMENDED THRESHOLDS
      thresholds: {
        confidence: {
          high: 80,           // High confidence (80%+)
          moderate: 60,       // Moderate confidence (60-79%)
          low: 40            // Low confidence (<60%)
        },
        alignmentScore: 50,     // Minimum alignment score for consideration
        correlationScore: 40,   // Minimum event correlation score
        methodConsistency: 70,  // Minimum consistency across methods
        eventSupport: 70,      // Minimum score when events are provided
        timePrecision: 50,     // Minimum time precision score
        bphsCompliance: 85      // Minimum BPHS compliance score
      },
      
      // BPHS ALGORITHMIC SETTINGS
      algorithmicSettings: {
        timeCandidates: {
          range: 120,           // ±2 hours (120 minutes) from estimated time
          step: 5,              // 5-minute intervals for analysis
          maximumCandidates: 49 // (120/5)*2 + 1 (negative + zero + positive)
        },
        
        eventCorrelation: {
          minimumEvents: 1,    // Minimum events required for correlation
          maximumEvents: 20,   // Maximum events for correlation (performance)
          eventWeighting: 'chronological', // How to weight multiple events
          chronologicalBonus: 5 // Bonus for chronological consistency
        },
        
        precisionTolerance: {
          degrees: 1.0,         // Tolerance in degrees for positional alignment
          minutes: 2,          // Tolerance in minutes for time divisions
          percentage: 5         // Percentage tolerance for scoring
        }
      },
      
      // BPHS VALIDATION RULES
      validationRules: {
        requireMinimumMethods: 2,  // Minimum methods required for analysis
        allowZeroWeight: false,     // Disallow zero-weight methods in active analysis
        enforceWeightSum: true,     // Weight sum must equal 1.0 for active methods
        bhpsComplianceCheck: true,  // Enable BPHS compliance validation
        featureFlagValidation: true // Enable feature flag validation for enhanced methods
      }
    };
    
    // BPHS PRESET CONFIGURATIONS FOR DIFFERENT SCENARIOS
    this.bhpsPresets = {
      // STRICT BPHS METHODS (highest accuracy, most restrictive)
      strict: {
        name: 'Strict BPHS Configuration',
        description: 'Optimal for high-precision requirements with complete data',
        methodWeights: {
          praanapada: 0.5,
          moon: 0.3,
          gulika: 0.2,
          events: 0.0
        },
        thresholds: {
          confidence: { high: 85, moderate: 70, low: 55 },
          alignmentScore: 60,
          correlationScore: 50,
          methodConsistency: 80
        }
      },
      
      // BALANCED CONFIGURATION (most practical for general use)
      balanced: {
        name: 'Balanced BPHS Configuration',
        description: 'Moderate requirements between accuracy and flexibility',
        methodWeights: {
          praanapada: 0.4,
          moon: 0.3,
          gulika: 0.2,
          events: 0.1
        },
        thresholds: {
          confidence: { high: 80, moderate: 60, low: 40 },
          alignmentScore: 50,
          correlationScore: 40,
          methodConsistency: 70
        }
      },
      
      // RELAXED CONFIGURATION (for limited data)
      relaxed: {
        name: 'Relaxed BPHS Configuration',
        description: 'For cases with incomplete data or preliminary analysis',
        methodWeights: {
          praanapada: 0.6,
          moon: 0.4,
          gulika: 0.0,
          events: 0.0
        },
        thresholds: {
          confidence: { high: 75, moderate: 55, low: 35 },
          alignmentScore: 45,
          correlationScore: 30,
          methodConsistency: 60
        }
      },
      
      // ENHANCED CONFIGURATION (with feature flags)
      enhanced: {
        name: 'Enhanced BPHS Configuration',
        description: 'Maximum accuracy with all available BPHS methods',
        requiresFeatureFlags: ['hora', 'timeDivisions', 'conditionalDashas'],
        methodWeights: {
          praanapada: 0.25,
          moon: 0.2,
          gulika: 0.1,
          events: 0.1,
          hora: 0.15,
          timeDivisions: 0.1,
          conditionalDashas: 0.1
        },
        thresholds: {
          confidence: { high: 90, moderate: 75, low: 60 },
          alignmentScore: 70,
          correlationScore: 60,
          methodConsistency: 85
        }
      }
    };
    
    // BPHS METHOD EFFICACY DATA (for configuration recommendations)
    this.methodEfficacy = {
      praanapada: {
        bhpsBasis: 'Chapter 5, Verse 12-15',
        accuracy: 0.85,
        reliability: 0.90,
        computationalCost: 0.3,
        description: 'Primary BPHS method aligning ascendant with breath calculations'
      },
      moon: {
        bhpsBasis: 'Chapter 5, Verse 8-11',
        accuracy: 0.75,
        reliability: 0.80,
        computationalCost: 0.2,
        description: 'Secondary method using Sun-Moon conjunction with ascendant'
      },
      gulika: {
        bhpsBasis: 'Chapter 5, Verse 16-18',
        accuracy: 0.65,
        reliability: 0.70,
        computationalCost: 0.4,
        description: 'Tertiary method using Gulika position for verification'
      },
      events: {
        bhpsBasis: 'Chapter 42, Verse 1-8',
        accuracy: 0.60,
        reliability: 0.75,
        computationalCost: 0.8,
        description: 'Event correlation with dasha periods (variable accuracy)'
      },
      hora: {
        bhpsBasis: 'Chapter 5, Verse 12-15 extended',
        accuracy: 0.80,
        reliability: 0.85,
        computationalCost: 0.3,
        description: 'D2-Hora chart analysis for precision verification'
      },
      timeDivisions: {
        bhpsBasis: 'Chapter 6, Verse 1-8',
        accuracy: 0.85,
        reliability: 0.90,
        computationalCost: 0.5,
        description: 'Ghati and Vighati time divisions for ultra-precision'
      },
      conditionalDashas: {
        bhpsBasis: 'Chapters 36-42',
        accuracy: 0.75,
        reliability: 0.80,
        computationalCost: 0.9,
        description: 'Conditional dasha systems for event correlation'
      }
    };
  }

  /**
   * Create custom BTR configuration based on user preferences
   * @param {Object} userOptions - User configuration options
   * @param {string} context - Analysis context ('general', 'detailed', 'preliminary', 'research')
   * @returns {Object} Validated and optimized configuration
   */
  createConfiguration(userOptions = {}, context = 'general') {
    if (!userOptions || typeof userOptions !== 'object') {
      userOptions = {};
    }

    const configuration = {
      method: 'BTR Configuration Manager',
      references: this.bhpsReferences,
      context: context,
      userOptions: userOptions,
      configuration: {},
      validation: {
        isValid: false,
        errors: [],
        warnings: [],
        suggestions: []
      },
      analysisLog: []
    };

    try {
      configuration.analysisLog.push(`Creating BTR configuration for context: ${context}`);

      // STEP 1: Determine base configuration (preset or default)
      let baseConfig = this.selectBaseConfiguration(userOptions, context, configuration);
      configuration.configuration = this.deepClone(baseConfig);

      // STEP 2: Apply user customizations with BPHS validation
      this.applyUserCustomizations(userOptions, configuration);

      // STEP 3: Validate configuration against BPHS standards
      this.validateConfiguration(configuration);

      // STEP 4: Optimize method weights for confidence
      this.optimizeMethodWeights(configuration);

      // STEP 5: Apply context-specific adjustments
      this.applyContextualAdjustments(context, configuration);

      // STEP 6: Generate configuration recommendations
      this.generateConfigurationRecommendations(configuration);

      configuration.analysisLog.push('BTR configuration created successfully');
      return configuration;

    } catch (error) {
      configuration.error = error.message;
      configuration.analysisLog.push(`Configuration creation failed: ${error.message}`);
      throw new Error(`Configuration creation failed: ${error.message}`);
    }
  }

  /**
   * Calculate confidence based on weighted scores per BPHS Chapter 5
   * @param {Object} scores - Individual method scores
   * @param {Object} configuration - Current configuration
   * @returns {Object} Weighted confidence calculation with analysis
   */
  calculateWeightedConfidence(scores, configuration) {
    if (!scores || !configuration || !configuration.configuration) {
      throw new Error('Scores and configuration are required for confidence calculation');
    }

    const weightedConfidence = {
      method: 'BPHS Weighted Confidence Calculation',
      references: this.bhpsReferences,
      scores: scores,
      configuration: configuration,
      calculation: {
        weightedScores: {},
        totalWeightedScore: 0,
        activeMethods: [],
        bhpsCompliance: 0,
        confidenceAnalysis: {}
      },
      analysisLog: []
    };

    try {
      weightedConfidence.analysisLog.push('Starting BPHS weighted confidence calculation');

      const config = configuration.configuration;
      const methodWeights = config.methodWeights;

      // STEP 1: Calculate weighted scores for each available method
      for (const [methodName, methodScore] of Object.entries(scores)) {
        const weight = methodWeights[methodName] || 0;
        
        if (weight > 0 && methodScore !== null && methodScore !== undefined) {
          const weightedScore = (methodScore * weight) / 100;
          weightedConfidence.calculation.weightedScores[methodName] = {
            originalScore: methodScore,
            weight: weight,
            weightedScore: weightedScore,
            contribution: Math.round(weightedScore * 100)
          };
          
          weightedConfidence.calculation.activeMethods.push(methodName);
          weightedConfidence.analysisLog.push(`${methodName}: ${methodScore} × ${weight} = ${Math.round(weightedScore * 100)}%`);
        }
      }

      // STEP 2: Calculate total weighted score
      weightedConfidence.calculation.totalWeightedScore = 
        Object.values(weightedConfidence.calculation.weightedScores)
          .reduce((sum, calculation) => sum + calculation.weightedScore, 0);

      // STEP 3: Apply BPHS alignment bonus
      const bhpsAlignmentBonus = this.calculateBPHSAlignmentBonus(scores, config);
      weightedConfidence.calculation.bhpsCompliance = bhpsAlignmentBonus;

      // STEP 4: Apply method consistency bonus
      const consistencyBonus = this.calculateMethodConsistencyBonus(scores, config);
      
      // STEP 5: Calculate final confidence with all bonuses
      let finalConfidence = weightedConfidence.calculation.totalWeightedScore + 
                           (bhpsAlignmentBonus * 0.1) + 
                           (consistencyBonus * 0.05);

      finalConfidence = Math.min(95, Math.max(0, Math.round(finalConfidence * 100)));
      
      weightedConfidence.calculation.confidenceAnalysis = {
        baseConfidence: Math.round(weightedConfidence.calculation.totalWeightedScore * 100),
        bhpsAlignmentBonus: Math.round(bhpsAlignmentBonus * 10),
        consistencyBonus: Math.round(consistencyBonus * 5),
        finalConfidence: finalConfidence
      };

      weightedConfidence.analysisLog.push(`Final confidence: ${finalConfidence}% (base: ${weightedConfidence.calculation.confidenceAnalysis.baseConfidence}%)`);
      weightedConfidence.analysisLog.push(`BPHS alignment bonus: +${weightedConfidence.calculation.confidenceAnalysis.bhpsAlignmentBonus}%`);
      weightedConfidence.analysisLog.push(`Consistency bonus: +${weightedConfidence.calculation.confidenceAnalysis.consistencyBonus}%`);
      return weightedConfidence;

    } catch (error) {
      weightedConfidence.error = error.message;
      weightedConfidence.analysisLog.push(`Weighted confidence calculation failed: ${error.message}`);
      throw new Error(`Weighted confidence calculation failed: ${error.message}`);
    }
  }

  /**
   * Validate configuration against BPHS standards and rules
   * @param {Object} configuration - Configuration object to validate
   * @returns {Object} Validation results with recommendations
   */
  validateConfiguration(configuration) {
    if (!configuration || !configuration.configuration) {
      throw new Error('Configuration object is required for validation');
    }

    const validation = configuration.validation;
    const config = configuration.configuration;
    const _rules = config.validationRules || this.defaultConfiguration.validationRules; // Reserved for future validation rule checks
    
    // Clear previous validation results
    validation.errors = [];
    validation.warnings = [];
    validation.suggestions = [];
    validation.isValid = true;

    configuration.analysisLog.push('Starting BPHS configuration validation');

    // VALIDATION 1: Check method weight constraints
    this.validateMethodWeights(config.methodWeights, validation, config);

    // VALIDATION 2: Check threshold values
    this.validateThresholds(config.thresholds, validation);

    // VALIDATION 3: Check algorithmic settings
    this.validateAlgorithmicSettings(config.algorithmicSettings, validation);

    // VALIDATION 4: BPHS compliance check
    this.validateBPHSCompliance(config, validation);

    // VALIDATION 5: Feature flag requirements
    this.validateFeatureFlagRequirements(config, validation);

    configuration.analysisLog.push(`Configuration validation: ${validation.isValid ? 'PASSED' : 'FAILED'}`);
    configuration.analysisLog.push(`Found ${validation.errors.length} errors, ${validation.warnings.length} warnings`);

    return validation;
  }

  /**
   * Get configuration preset by name
   * @param {string} presetName - Name of the preset configuration
   * @returns {Object|null} Preset configuration or null if not found
   */
  getPresetConfiguration(presetName) {
    const preset = this.bhpsPresets[presetName];
    
    if (!preset) {
      return null;
    }

    // Return a deep copy to prevent modification
    return {
      name: preset.name,
      description: preset.description,
      ...this.deepClone(preset)
    };
  }

  /**
   * Get list of all available preset configurations
   * @returns {Array} Array of preset information
   */
  getAvailablePresets() {
    return Object.keys(this.bhpsPresets).map(presetName => ({
      name: presetName,
      displayName: this.bhpsPresets[presetName].name,
      description: this.bhpsPresets[presetName].description,
      requiresFeatureFlags: this.bhpsPresets[presetName].requiresFeatureFlags || []
    }));
  }

  /**
   * Optimize method weights for maximum confidence based on available scores
   * @param {Object} scores - Available method scores
   * @param {Object} constraints - Optimization constraints
   * @returns {Object} Optimized configuration with new weights
   */
  optimizeMethodWeights(scores, constraints = {}) {
    if (!scores) {
      throw new Error('Method scores are required for optimization');
    }

    const optimization = {
      method: 'BPHS Method Weight Optimization',
      availableScores: scores,
      constraints: constraints,
      optimizedWeights: {},
      quality: { improvement: 0, consistency: 0 },
      analysisLog: []
    };

    try {
      optimization.analysisLog.push('Starting BPHS method weight optimization');

      // Get available methods with scores
      const availableMethods = Object.keys(scores).filter(method => 
        scores[method] !== null && scores[method] !== undefined && scores[method] > 0
      );

      if (availableMethods.length < 2) {
        optimization.analysisLog.push('Insufficient methods for optimization (minimum 2 required)');
        optimization.optimizedWeights = this.defaultConfiguration.methodWeights;
        return optimization;
      }

      // Calculate method efficacy weights
      const efficacyWeights = this.calculateEfficacyWeights(availableMethods);

      // Apply constraints and normalize weights
      let optimizedWeights = {};
      let totalWeight = 0;

      for (const method of availableMethods) {
        let weight = this.methodEfficacy[method] ? this.methodEfficacy[method].accuracy : 0.5;
        weight *= efficacyWeights[method] || 1.0;
        
        // Apply constraints
        if (constraints.minimumWeights && constraints.minimumWeights[method]) {
          weight = Math.max(weight, constraints.minimumWeights[method]);
        }
        if (constraints.maximumWeights && constraints.maximumWeights[method]) {
          weight = Math.min(weight, constraints.maximumWeights[method]);
        }
        
        optimizedWeights[method] = weight;
        totalWeight += weight;
      }

      // Normalize to sum to 1.0
      for (const method of availableMethods) {
        optimizedWeights[method] = totalWeight > 0 ? optimizedWeights[method] / totalWeight : 0;
      }

      optimization.optimizedWeights = optimizedWeights;
      optimization.quality.improvement = this.calculateOptimizationImprovement(scores, optimizedWeights);
      optimization.quality.consistency = this.calculateWeightConsistency(optimizedWeights);

      optimization.analysisLog.push(`Optimization completed with ${availableMethods.length} methods`);
      optimization.analysisLog.push(`Quality improvement: ${optimization.quality.improvement.toFixed(2)}%`);
      return optimization;

    } catch (error) {
      optimization.error = error.message;
      optimization.analysisLog.push(`Method weight optimization failed: ${error.message}`);
      throw new Error(`Method weight optimization failed: ${error.message}`);
    }
  }

  // Helper methods for configuration management

  /**
   * Select base configuration based on user options and context
   * @param {Object} userOptions - User-provided options
   * @param {string} context - Analysis context
   * @param {Object} configuration - Configuration object to update
   * @returns {Object} Base configuration
   */
  selectBaseConfiguration(userOptions, context, configuration) {
    // Check if user specified a preset
    if (userOptions.preset && this.bhpsPresets[userOptions.preset]) {
      configuration.analysisLog.push(`Using preset configuration: ${userOptions.preset}`);
      configuration.selectedPreset = userOptions.preset;
      return this.deepClone(this.bhpsPresets[userOptions.preset]);
    }

    // Select preset based on context
    context.toLowerCase();
    switch (context) {
      case 'detailed':
      case 'research':
        configuration.analysisLog.push('Using strict configuration for detailed analysis');
        configuration.selectedPreset = 'strict';
        return this.deepClone(this.bhpsPresets.strict);
        
      case 'preliminary':
      case 'rough':
        configuration.analysisLog.push('Using relaxed configuration for preliminary analysis');
        configuration.selectedPreset = 'relaxed';
        return this.deepClone(this.bhpsPresets.relaxed);
        
      default:
        configuration.analysisLog.push('Using balanced configuration for general analysis');
        configuration.selectedPreset = 'balanced';
        return this.deepClone(this.bhpsPresets.balanced);
    }
  }

  /**
   * Apply user customizations to base configuration
   * @param {Object} userOptions - User-provided options
   * @param {Object} configuration - Configuration object to update
   */
  applyUserCustomizations(userOptions, configuration) {
    const config = configuration.configuration;

    // Apply custom method weights
    if (userOptions.methodWeights) {
      configuration.analysisLog.push('Applying custom method weights');
      
      for (const [method, weight] of Object.entries(userOptions.methodWeights)) {
        if (Object.prototype.hasOwnProperty.call(config.methodWeights, method)) {
          if (typeof weight === 'number' && weight >= 0 && weight <= 1) {
            config.methodWeights[method] = weight;
            configuration.analysisLog.push(`Updated ${method} weight to ${weight}`);
          } else {
            configuration.validation.warnings.push(`Invalid weight for ${method}: ${weight}. Keeping default.`);
          }
        } else {
          configuration.validation.warnings.push(`Unknown method in weights: ${method}. Ignoring.`);
        }
      }
    }

    // Apply custom thresholds
    if (userOptions.thresholds) {
      configuration.analysisLog.push('Applying custom thresholds');
      
      this.deepMerge(config.thresholds, userOptions.thresholds);
    }

    // Apply custom algorithmic settings
    if (userOptions.algorithmicSettings) {
      configuration.analysisLog.push('Applying custom algorithmic settings');
      
      this.deepMerge(config.algorithmicSettings, userOptions.algorithmicSettings);
    }

    // Apply custom validation rules
    if (userOptions.validationRules) {
      configuration.analysisLog.push('Applying custom validation rules');
      
      this.deepMerge(config.validationRules, userOptions.validationRules);
    }
  }

  /**
   * Validate method weights against rules
   * @param {Object} methodWeights - Method weight object
   * @param {Object} validation - Validation object to update
   * @param {Object} config - Full configuration for rule reference
   */
  validateMethodWeights(methodWeights, validation, config) {
    // Check minimum methods requirement
    const activeMethods = Object.entries(methodWeights)
      .filter(([_method, weight]) => weight > 0)
      .map(([method]) => method);
    
    if (activeMethods.length < config.validationRules.requireMinimumMethods) {
      validation.errors.push(`Insufficient active methods: ${activeMethods.length} (minimum: ${config.validationRules.requireMinimumMethods})`);
      validation.isValid = false;
    }

    // Check weight sum constraint
    if (config.validationRules.enforceWeightSum) {
      const totalWeight = Object.values(methodWeights).reduce((sum, weight) => sum + weight, 0);
      if (Math.abs(totalWeight - 1.0) > 0.01) {
        validation.errors.push(`Method weights must sum to 1.0 (current: ${totalWeight.toFixed(3)})`);
        validation.isValid = false;
      }
    }

    // Check zero-weight constraint
    if (!config.validationRules.allowZeroWeight) {
      for (const [method, weight] of Object.entries(methodWeights)) {
        if (weight === 0) {
          validation.warnings.push(`Method ${method} has zero weight. Consider increasing or removing.`);
        }
      }
    }
  }

  /**
   * Validate threshold values
   * @param {Object} thresholds - Threshold object
   * @param {Object} validation - Validation object to update
   */
  validateThresholds(thresholds, validation) {
    // Check confidence thresholds
    if (thresholds.confidence) {
      const conf = thresholds.confidence;
      
      if (conf.high <= conf.moderate) {
        validation.errors.push('High confidence threshold must be greater than moderate threshold');
        validation.isValid = false;
      }
      
      if (conf.moderate <= conf.low) {
        validation.errors.push('Moderate confidence threshold must be greater than low threshold');
        validation.isValid = false;
      }
    }

    // Check other thresholds for reasonable ranges
    const thresholdChecks = [
      { name: 'alignmentScore', min: 0, max: 100 },
      { name: 'correlationScore', min: 0, max: 100 },
      { name: 'methodConsistency', min: 0, max: 100 },
      { name: 'eventSupport', min: 0, max: 100 },
      { name: 'timePrecision', min: 0, max: 100 },
      { name: 'bphsCompliance', min: 0, max: 100 }
    ];

    for (const check of thresholdChecks) {
      if (thresholds[check.name] !== undefined) {
        if (thresholds[check.name] < check.min || thresholds[check.name] > check.max) {
          validation.warnings.push(`${check.name} threshold (${thresholds[check.name]}) outside expected range (${check.min}-${check.max})`);
        }
      }
    }
  }

  /**
   * Validate algorithmic settings
   * @param {Object} algorithmicSettings - Algorithmic settings object
   * @param {Object} validation - Validation object to update
   */
  validateAlgorithmicSettings(algorithmicSettings, validation) {
    // Validate time candidate settings
    if (algorithmicSettings.timeCandidates) {
      const tc = algorithmicSettings.timeCandidates;
      
      if (tc.range < 15 || tc.range > 720) {
        validation.warnings.push(`Time candidate range (${tc.range} minutes) outside reasonable range (15-720 minutes)`);
      }
      
      if (tc.step < 1 || tc.step > 60) {
        validation.warnings.push(`Time candidate step (${tc.step} minutes) outside reasonable range (1-60 minutes)`);
      }
      
      if (tc.maximumCandidates < 10 || tc.maximumCandidates > 500) {
        validation.warnings.push(`Maximum time candidates (${tc.maximumCandidates}) outside reasonable range (10-500)`);
      }
    }

    // Validate event correlation settings
    if (algorithmicSettings.eventCorrelation) {
      const ec = algorithmicSettings.eventCorrelation;
      
      if (ec.minimumEvents < 1 || ec.minimumEvents > 10) {
        validation.warnings.push(`Minimum events (${ec.minimumEvents}) outside reasonable range (1-10)`);
      }
      
      if (ec.maximumEvents < ec.minimumEvents || ec.maximumEvents > 50) {
        validation.warnings.push(`Maximum events (${ec.maximumEvents}) invalid relative to minimum`);
      }
    }

    // Validate precision tolerance
    if (algorithmicSettings.precisionTolerance) {
      const pt = algorithmicSettings.precisionTolerance;
      
      if (pt.degrees < 0.1 || pt.degrees > 5) {
        validation.warnings.push(`Degree tolerance (${pt.degrees}) outside recommended range (0.1-5 degrees)`);
      }
      
      if (pt.minutes < 0.5 || pt.minutes > 30) {
        validation.warnings.push(`Minute tolerance (${pt.minutes}) outside recommended range (0.5-30 minutes)`);
      }
    }
  }

  /**
   * Validate BPHS compliance
   * @param {Object} config - Full configuration
   * @param {Object} validation - Validation object to update
   */
  validateBPHSCompliance(config, validation) {
    if (config.validationRules.bhpsComplianceCheck) {
      // Check if configuration follows BPHS principles
      const praanapadaWeight = config.methodWeights.praanapada || 0;
      
      if (praanapadaWeight < 0.3) {
        validation.warnings.push('Praanapada method weight is below recommended minimum (0.3) for BPHS compliance');
      }
      
      // Check that enhanced methods have appropriate weights
      const enhancedMethods = ['hora', 'timeDivisions', 'conditionalDashas'];
      let enhancedWeight = 0;
      
      for (const method of enhancedMethods) {
        enhancedWeight += config.methodWeights[method] || 0;
      }
      
      if (enhancedWeight > 0.5) {
        validation.warnings.push('Enhanced methods weight exceeds recommended maximum (0.5) for BPHS compliance');
      }
    }
  }

  /**
   * Validate feature flag requirements
   * @param {Object} config - Full configuration
   * @param {Object} validation - Validation object to update
   */
  validateFeatureFlagRequirements(config, validation) {
    if (config.validationRules.featureFlagValidation) {
      const preset = this.bhpsPresets[config?.selectedPreset];
      
      if (preset && preset.requiresFeatureFlags) {
        const requiredFlags = preset.requiresFeatureFlags;
        
        for (const flag of requiredFlags) {
          if (!this.isFeatureEnabled(flag)) {
            validation.errors.push(`Required feature flag not enabled: ${flag}`);
            validation.isValid = false;
          }
        }
      }
    }
  }

  /**
   * Check if feature flag is enabled (simplified for this implementation)
   * @param {string} featureName - Name of the feature flag
   * @returns {boolean} True if feature is enabled
   */
  isFeatureEnabled(featureName) {
    // In a real implementation, this would check environment variables or configuration
    const flagName = `BTR_FEATURE_${featureName.toUpperCase()}`;
    return process.env[flagName] === 'true';
  }

  /**
   * Calculate BPHS alignment bonus for confidence calculation
   * @param {Object} scores - Method scores
   * @param {Object} config - Full configuration
   * @returns {number} BPHS alignment bonus (0-1)
   */
  calculateBPHSAlignmentBonus(scores, _config) {
    let alignment = 0;
    
    // Praanapada method weight indicates BPHS alignment
    if (scores.praanapada && scores.praanapada > 70) {
      alignment += 0.3;
    }
    
    // Method consistency indicates BPHS alignment
    const activeScores = Object.entries(scores)
      .filter(([_method, score]) => score !== null && score !== undefined && score > 0)
      .map(([_method, score]) => score);
    
    if (activeScores.length >= 3) {
      const average = activeScores.reduce((sum, score) => sum + score, 0) / activeScores.length;
      const variance = activeScores.reduce((sum, score) => sum + Math.pow(score - average, 2), 0) / activeScores.length;
      
      // Lower variance = better alignment
      alignment += Math.max(0, 0.3 - variance / 100);
    }
    
    return Math.min(1, alignment);
  }

  /**
   * Calculate method consistency bonus
   * @param {Object} scores - Method scores
   * @param {Object} config - Full configuration
   * @returns {number} Consistency bonus (0-1)
   */
  calculateMethodConsistencyBonus(scores, _config) {
    const activeScores = Object.entries(scores)
      .filter(([_method, score]) => score !== null && score !== undefined && score > 0)
      .map(([_method, score]) => score);
    
    if (activeScores.length < 2) return 0;

    // Calculate how consistent the scores are
    const average = activeScores.reduce((sum, score) => sum + score, 0) / activeScores.length;
    const maxDeviation = Math.max(...activeScores.map(score => Math.abs(score - average)));
    
    // Return bonus based on consistency (lower deviation = higher bonus)
    return Math.max(0, 1 - (maxDeviation / 50));
  }

  /**
   * Apply contextual adjustments to configuration
   * @param {string} context - Analysis context
   * @param {Object} configuration - Configuration object to update
   */
  applyContextualAdjustments(context, configuration) {
    const config = configuration.configuration;
    
    switch (context) {
      case 'detailed':
      case 'research':
        // Increase precision requirements
        config.thresholds.confidence.high = Math.max(config.thresholds.confidence.high, 85);
        config.thresholds.methodConsistency = Math.max(config.thresholds.methodConsistency, 80);
        config.algorithmicSettings.timeCandidates.step = Math.max(1, config.algorithmicSettings.timeCandidates.step - 2);
        break;
        
      case 'preliminary':
      case 'rough':
        // Relax precision requirements
        config.thresholds.confidence.low = Math.min(config.thresholds.confidence.low, 35);
        config.thresholds.methodConsistency = Math.min(config.thresholds.methodConsistency, 60);
        config.algorithmicSettings.timeCandidates.step = Math.min(30, config.algorithmicSettings.timeCandidates.step + 5);
        break;
    }
    
    configuration.analysisLog.push(`Applied contextual adjustments for ${context} context`);
  }

  /**
   * Generate configuration recommendations
   * @param {Object} configuration - Configuration object to update
   */
  generateConfigurationRecommendations(configuration) {
    const config = configuration.configuration;
    const suggestions = configuration.validation.suggestions;
    
    // Analyze current configuration and provide recommendations
    
    // Check if any major methods have zero weight
    for (const [method, weight] of Object.entries(config.methodWeights)) {
      if (weight === 0 && ['praanapada', 'moon', 'gulika'].includes(method)) {
        suggestions.push(`Consider increasing ${method} weight from 0 for better BPHS compliance`);
      }
    }
    
    // Check if thresholds are appropriate
    if (config.thresholds.confidence.high > 90) {
      suggestions.push('High confidence threshold is very strict; consider 80-85% for practical use');
    }
    
    if (config.thresholds.confidence.low < 30) {
      suggestions.push('Low confidence threshold is too lenient; consider 35-40% for meaningful results');
    }
    
    // Feature recommendations
    if (!config.methodWeights.hora && !this.isFeatureEnabled('HORA')) {
      suggestions.push('Enable Hora analysis feature for enhanced precision (BTR_FEATURE_HORA=true)');
    }
    
    if (!config.methodWeights.timeDivisions && !this.isFeatureEnabled('TIME_DIVISIONS')) {
      suggestions.push('Enable time divisions for ultra-precision (BTR_FEATURE_TIME_DIVISIONS=true)');
    }
    
    configuration.analysisLog.push(`Generated ${suggestions.length} configuration recommendations`);
  }

  /**
   * Calculate optimization improvement
   * @param {Object} scores - Available method scores
   * @param {Object} optimizedWeights - Optimized weight distribution
   * @returns {number} Improvement percentage (0-100)
   */
  calculateOptimizationImprovement(scores, optimizedWeights) {
    if (!scores || !optimizedWeights) return 0;
    
    // Calculate score with default weights
    const defaultResult = this.calculateWeightedConfidence(scores, {
      configuration: { methodWeights: this.defaultConfiguration.methodWeights }
    });
    
    // Calculate score with optimized weights
    const optimizedResult = this.calculateWeightedConfidence(scores, {
      configuration: { methodWeights: optimizedWeights }
    });
    
    // Calculate improvement percentage
    const improvement = optimizedResult.calculation.confidenceAnalysis.finalConfidence - 
                        defaultResult.calculation.confidenceAnalysis.finalConfidence;
    
    return Math.min(100, Math.max(0, improvement));
  }

  /**
   * Calculate weight consistency
   * @param {Object} weights - Weight object
   * @returns {number} Consistency score (0-1)
   */
  calculateWeightConsistency(weights) {
    const weightValues = Object.values(weights).filter(w => w > 0);
    
    if (weightValues.length < 2) return 1;
    
    // Calculate coefficient of variation (lower = more consistent)
    const average = weightValues.reduce((sum, weight) => sum + weight, 0) / weightValues.length;
    const variance = weightValues.reduce((sum, weight) => sum + Math.pow(weight - average, 2), 0) / weightValues.length;
    const standardDeviation = Math.sqrt(variance);
    
    // Return consistency score (inverse of coefficient of variation)
    return Math.max(0, 1 - (standardDeviation / average));
  }

  /**
   * Calculate efficacy weights for method optimization
   * @param {Array} availableMethods - List of available methods
   * @returns {Object} Efficacy weights for each method
   */
  calculateEfficacyWeights(availableMethods) {
    const efficacyWeights = {};
    
    for (const method of availableMethods) {
      const efficacy = this.methodEfficacy[method];
      
      if (efficacy) {
        // Combine accuracy and reliability scores
        efficacyWeights[method] = (efficacy.accuracy + efficacy.reliability + 
                                   (1 - efficacy.computationalCost)) / 3;
      } else {
        efficacyWeights[method] = 0.5; // Default for unknown methods
      }
    }
    
    return efficacyWeights;
  }

  /**
   * Deep clone an object (simple implementation for this context)
   * @param {Object} obj - Object to clone
   * @returns {Object} Cloned object
   */
  deepClone(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj.getTime());
    if (obj instanceof Array) return obj.map(item => this.deepClone(item));
    
    const cloned = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        cloned[key] = this.deepClone(obj[key]);
      }
    }
    return cloned;
  }

  /**
   * Deep merge destination object with source object
   * @param {Object} destination - Target object to merge into
   * @param {Object} source - Source object to merge from
   */
  deepMerge(destination, source) {
    for (const key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key])) {
          if (!destination[key] || typeof destination[key] !== 'object') {
            destination[key] = {};
          }
          this.deepMerge(destination[key], source[key]);
        } else {
          destination[key] = source[key];
        }
      }
    }
  }

  /**
   * Get BPHS references for educational purposes
   * @returns {Object} BPHS reference information
   */
  getBPHSReferences() {
    return {
      chapters: this.bhpsReferences.chapters,
      methodology: this.bhpsReferences.methodology,
      description: 'BPHS-based configuration management with flexible weighting',
      presets: Object.keys(this.bhpsPresets).map(preset => ({
        name: preset,
        description: this.bhpsPresets[preset].description,
        bhpsBasis: 'BPHS Chapters 5, 6, 42 - Method weightings and configurations'
      })),
      methodEfficacy: Object.entries(this.methodEfficacy).map(([method, efficacy]) => ({
        method: method,
        bhpsBasis: efficacy.bhpsBasis,
        accuracy: Math.round(efficacy.accuracy * 100),
        reliability: Math.round(efficacy.reliability * 100),
        description: efficacy.description
      })),
      accuracyStandard: 'Within ±2% confidence optimization per configuration'
    };
  }
}

export default BTRConfigurationManager;
