import React, { useState, useMemo, useEffect } from 'react';
import { useAnalysis } from '../../contexts/AnalysisContext.js';
import ResponseDataToUIDisplayAnalyser from '../analysis/ResponseDataToUIDisplayAnalyser.js';

/**
 * Comprehensive Analysis Display Component
 * Transforms raw astrological data into user-friendly, interactive UI components
 * Uses consistent Vedic design system across the entire application
 */
const ComprehensiveAnalysisDisplay = ({ analysisData }) => {
  const [activeSection, setActiveSection] = useState('section1');
  const [expandedItems, setExpandedItems] = useState(new Set());
  const {
    setSectionData,
    isSectionVisited,
    setContextActiveSection
  } = useAnalysis();

  // Process and validate incoming analysis data
  const { sectionsData, sectionOrder, sectionNames } = useMemo(() => {
    console.log('🔍 [ComprehensiveAnalysisDisplay] Processing analysis data...');
    console.log('📊 [ComprehensiveAnalysisDisplay] Received analysisData:', analysisData);
    console.log('📊 [ComprehensiveAnalysisDisplay] AnalysisData type:', typeof analysisData);
    console.log('📊 [ComprehensiveAnalysisDisplay] AnalysisData keys:', analysisData ? Object.keys(analysisData) : 'null');

    if (!analysisData) {
      throw new Error('Analysis data is required. Expected processed data from ResponseDataToUIDisplayAnalyser.processComprehensiveAnalysis().');
    }

    // Extract sections from processed data structure
    let sections = {};
    if (analysisData.sections) {
      console.log('✅ [ComprehensiveAnalysisDisplay] Found sections in analysisData.sections');
      sections = analysisData.sections;
    } else if (analysisData.analysis?.sections) {
      console.log('✅ [ComprehensiveAnalysisDisplay] Found sections in analysisData.analysis.sections');
      sections = analysisData.analysis.sections;
    } else {
      throw new Error('Sections data is missing from analysis data. Expected analysisData.sections or analysisData.analysis.sections with 8 sections (section1-section8).');
    }
    
    if (!sections || Object.keys(sections).length === 0) {
      throw new Error('Sections data is empty. Expected analysisData.sections with 8 sections (section1-section8) from API.');
    }

    console.log('📊 [ComprehensiveAnalysisDisplay] Extracted sections:', {
      sectionsType: typeof sections,
      sectionsKeys: Object.keys(sections),
      sectionsCount: Object.keys(sections).length
    });

    const order = analysisData.sectionOrder ||
                  ['section1', 'section2', 'section3', 'section4', 'section5', 'section6', 'section7', 'section8'];

    const names = ResponseDataToUIDisplayAnalyser.getSectionNames();

    console.log('✅ [ComprehensiveAnalysisDisplay] Final processed data:', {
      sectionsCount: Object.keys(sections).length,
      sectionOrder: order,
      availableSections: Object.keys(sections)
    });

    return {
      sectionsData: sections,
      sectionOrder: order,
      sectionNames: names
    };
  }, [analysisData]);

  // Progress calculation with section visit tracking
  const progress = useMemo(() => {
    const totalSections = sectionOrder.length;
    const completedSections = sectionOrder.filter(sectionId => {
      const section = sectionsData[sectionId];
      return section && (
        (section.questions && section.questions.length > 0) ||
        (section.analyses && Object.keys(section.analyses).length > 0) ||
        (section.houses && Object.keys(section.houses).length > 0) ||
        (section.aspects && Object.keys(section.aspects).length > 0) ||
        (section.arudhaAnalysis) ||
        (section.navamsaAnalysis) ||
        (section.dashaAnalysis)
      );
    }).length;

    return {
      completed: completedSections,
      total: totalSections,
      percentage: totalSections > 0 ? (completedSections / totalSections) * 100 : 0
    };
  }, [sectionsData, sectionOrder]);

  // Mark sections as visited when they contain meaningful data
  useEffect(() => {
    sectionOrder.forEach(sectionId => {
      const section = sectionsData[sectionId];
      if (section && setSectionData) {
        const hasData = Object.keys(section).length > 1 ||
                       (Object.keys(section).length === 1 && !section.name);
        if (hasData) {
          setSectionData(sectionId, section);
        }
      }
    });
  }, [sectionsData, sectionOrder, setSectionData]);

  // Handle section navigation
  const handleSectionChange = (sectionId) => {
    setActiveSection(sectionId);
    if (setContextActiveSection) {
      setContextActiveSection(sectionId);
    }
  };

  // Toggle item expansion for progressive disclosure
  const toggleExpansion = (itemId) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  // === ENHANCED HELPER FUNCTIONS ===

  /**
   * Smart Value Formatter - Uses consistent Vedic design system
   */
  const formatSmartValue = (value, key = '') => {
    if (value === null || value === undefined) {
      return <span className="text-muted italic">Not available</span>;
    }

    if (typeof value === 'boolean') {
      return (
        <span className={`badge-vedic ${value ? 'badge-complete' : 'badge-error'}`}>
          <span className="vedic-symbol">{value ? '✓' : '✗'}</span>
          {value ? 'Yes' : 'No'}
        </span>
      );
    }

    if (typeof value === 'number') {
      // Format numeric values with appropriate precision
      if (key.toLowerCase().includes('longitude') || key.toLowerCase().includes('latitude')) {
        return <span className="text-jupiter font-mono">{value.toFixed(6)}°</span>;
      }
      if (key.toLowerCase().includes('degree')) {
        return <span className="text-venus font-mono">{value.toFixed(2)}°</span>;
      }
      if (value % 1 === 0) {
        return <span className="text-primary font-mono">{value}</span>;
      }
      return <span className="text-primary font-mono">{value.toFixed(2)}</span>;
    }

    if (typeof value === 'string') {
      // Handle special string formatting
      if (value.includes('T') && value.includes('Z')) {
        // ISO date format
        try {
          const date = new Date(value);
          return <span className="text-jupiter">{date.toLocaleString()}</span>;
        } catch {
          return <span className="text-secondary">{value}</span>;
        }
      }
      return <span className="text-secondary">{value}</span>;
    }

    if (Array.isArray(value)) {
      if (value.length === 0) {
        return <span className="text-muted italic">No items</span>;
      }
      return (
        <div className="space-y-1">
          {value.map((item, index) => (
            <div key={index} className="flex items-center gap-vedic">
              <span className="w-1.5 h-1.5 bg-saffron rounded-full flex-shrink-0"></span>
              <span className="text-sm text-secondary">{formatSmartValue(item, key)}</span>
            </div>
          ))}
        </div>
      );
    }

    if (typeof value === 'object') {
      return <ObjectDisplay data={value} compact={true} />;
    }

    return <span className="text-secondary">{String(value)}</span>;
  };

  /**
   * Enhanced Object Display Component - Uses Vedic design system
   */
  const ObjectDisplay = ({ data, compact = false, title = null }) => {
    if (!data || typeof data !== 'object') return null;

    const entries = Object.entries(data);
    if (entries.length === 0) {
      return <span className="text-muted italic">No data available</span>;
    }

    return (
      <div className={`space-vedic ${compact ? 'text-sm' : ''}`}>
        {title && (
          <h4 className="text-lg font-semibold text-saffron border-b border-gold/20 pb-2 mb-3 flex items-center gap-2">
            <span className="vedic-symbol symbol-mandala"></span>
            {title}
          </h4>
        )}
        {entries.map(([key, value]) => (
          <div key={key} className="flex flex-col gap-1">
            <div className="flex items-start justify-between">
              <span className="text-xs font-medium text-gold uppercase tracking-wide">
                {key.replace(/([A-Z])/g, ' $1').trim()}:
              </span>
            </div>
            <div className="ml-2 pl-3 border-l-2 border-gold/30">
              {formatSmartValue(value, key)}
            </div>
          </div>
        ))}
      </div>
    );
  };

  /**
   * Enhanced Details Accordion - Consistent with Vedic design
   */
  const DetailsAccordion = ({ details, title = "Details", defaultExpanded = false, icon = "📋" }) => {
    const [isExpanded, setIsExpanded] = useState(defaultExpanded);

    if (!details || typeof details !== 'object') return null;

    return (
      <div className="card-vedic">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full p-0 bg-transparent border-none flex items-center justify-between text-left"
          aria-expanded={isExpanded}
        >
          <span className="text-lg font-semibold text-saffron flex items-center gap-3">
            <span className="vedic-symbol">{icon}</span>
            {title}
          </span>
          <span className={`text-gold transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
            ▼
          </span>
        </button>
        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-gold/20">
            <ObjectDisplay data={details} />
          </div>
        )}
      </div>
    );
  };

  // === SPECIALIZED DISPLAY COMPONENTS ===

  /**
   * Enhanced Questions Display Component - Uses Vedic design system with sophisticated animations
   */
  const QuestionsDisplay = ({ questions }) => {
    if (!questions || !Array.isArray(questions)) return null;

    return (
      <div className="space-y-8">
        {/* Enhanced Header Section */}
        <div className="card-sacred group hover:shadow-xl transition-all duration-500">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-gold to-saffron rounded-full flex items-center justify-center text-3xl animate-glow">
              Q
            </div>
            <div>
              <h3 className="text-3xl font-bold text-primary group-hover:text-saffron transition-colors duration-300">
                Analysis Questions
              </h3>
              <p className="text-secondary text-lg">
                {questions.length} question{questions.length !== 1 ? 's' : ''} answered
              </p>
            </div>
          </div>
        </div>

        {/* Enhanced Questions Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {questions.map((q, index) => {
            const itemId = `question-${index}`;
            const isExpanded = expandedItems.has(itemId);

            return (
              <div key={index} className="question-card-enhanced group">
                <div className="card-cosmic h-full hover:transform hover:scale-105 transition-all duration-500 hover:shadow-xl">
                  <div
                    className="cursor-pointer"
                    onClick={() => toggleExpansion(itemId)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        toggleExpansion(itemId);
                      }
                    }}
                    aria-expanded={isExpanded}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-saffron to-gold rounded-full flex items-center justify-center text-white font-bold text-lg">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <h4 className="text-lg font-semibold text-primary leading-tight group-hover:text-saffron transition-colors duration-300">
                            {q.question}
                          </h4>
                        </div>
                      </div>

                      <button className="text-saffron hover:text-gold transition-colors p-2 rounded-lg hover:bg-gold/10 group-hover:animate-pulse">
                        <span className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                          ▼
                        </span>
                      </button>
                    </div>

                    {/* Enhanced Answer Preview */}
                    <div className="bg-sacred/30 p-4 rounded-lg mb-4">
                      <p className="text-secondary leading-relaxed">
                        {isExpanded ? q.answer : `${q.answer?.substring(0, 120)}${q.answer?.length > 120 ? '...' : ''}`}
                      </p>
                    </div>

                    {/* Enhanced Completeness Badge */}
                    {q.completeness && (
                      <div className="flex items-center justify-between">
                        <span className={`badge-vedic ${
                          q.completeness === 'Complete' ? 'badge-complete' : 'badge-pending'
                        }`}>
                          <span className="vedic-symbol">{q.completeness === 'Complete' ? '✓' : '⏳'}</span>
                          {q.completeness}
                        </span>
                        <span className="text-xs text-muted">
                          {isExpanded ? 'Click to collapse' : 'Click to expand'}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Enhanced Expandable Details Section */}
                  {isExpanded && q.details && (
                    <div className="mt-6 pt-6 border-t border-gold/20 animate-fadeIn">
                      <div className="card-vedic bg-sacred/50">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-8 h-8 bg-third-eye-chakra/20 rounded-full flex items-center justify-center">
                            <span className="vedic-symbol text-third-eye-chakra">🔍</span>
                          </div>
                          <h5 className="text-lg font-semibold text-primary">Question Details</h5>
                        </div>
                        <ObjectDisplay data={q.details} />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  /**
   * Enhanced Planetary Analyses Display Component - Uses Vedic design system with sophisticated animations
   */
  const AnalysesDisplay = ({ analyses }) => {
    if (!analyses || typeof analyses !== 'object') return null;

    const planetEntries = Object.entries(analyses);

    return (
      <div className="space-y-8">
        {/* Enhanced Header Section */}
        <div className="card-sacred group hover:shadow-xl transition-all duration-500">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-jupiter to-mercury rounded-full flex items-center justify-center text-3xl animate-glow">
              ☿
            </div>
            <div>
              <h3 className="text-3xl font-bold text-primary group-hover:text-saffron transition-colors duration-300">
                Planetary Analysis
              </h3>
              <p className="text-secondary text-lg">
                {planetEntries.length} planet{planetEntries.length !== 1 ? 's' : ''} analyzed
              </p>
            </div>
          </div>
        </div>

        {/* Enhanced Planetary Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {planetEntries.map(([planetKey, planetData]) => {
            if (!planetData || typeof planetData !== 'object') return null;

            const planetName = planetKey.replace('Analysis', '').replace(/([A-Z])/g, ' $1').trim();
            const strength = planetData.strength?.overallStrength || 0;
            const dignity = planetData.dignity?.dignity || 'Unknown';

            return (
              <div key={planetKey} className="planet-card-enhanced group">
                <div className="card-cosmic h-full hover:transform hover:scale-105 transition-all duration-500 hover:shadow-xl">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-jupiter/20 to-mercury/20 rounded-full flex items-center justify-center text-2xl">
                        <span className="vedic-symbol text-jupiter">☿</span>
                      </div>
                      <div>
                        <h4 className="text-2xl font-bold text-primary group-hover:text-saffron transition-colors duration-300 capitalize">
                          {planetName}
                        </h4>
                        <p className="text-sm text-secondary">Planetary Analysis</p>
                      </div>
                    </div>
                    <span className={`badge-vedic ${getDignityBadgeClass(dignity)}`}>
                      {dignity}
                    </span>
                  </div>

                  {/* Enhanced Strength Meter */}
                  {strength > 0 && (
                    <div className="mb-6">
                      <div className="flex justify-between text-sm text-secondary mb-3">
                        <span className="font-medium">Planetary Strength</span>
                        <span className="font-mono text-saffron font-bold">{strength.toFixed(1)}/10</span>
                      </div>
                      <div className="progress-vedic mb-3">
                        <div
                          className="progress-bar-vedic"
                          style={{ width: `${Math.min(strength * 10, 100)}%` }}
                        ></div>
                      </div>
                      <div className="strength-meter">
                        <div className="strength-dots">
                          {[...Array(10)].map((_, i) => (
                            <div
                              key={i}
                              className={`strength-dot ${i < Math.floor(strength) ? 'active' : ''}`}
                            ></div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Enhanced Planet Details */}
                  <div className="space-y-4">
                    {planetData.signCharacteristics && (
                      <div className="card-vedic bg-sacred/30 p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="vedic-symbol text-earth-element">🌍</span>
                          <span className="text-sm font-medium text-secondary">Element:</span>
                          <span className="badge-vedic bg-earth-element/20 text-earth-element">
                            {planetData.signCharacteristics.element}
                          </span>
                        </div>
                        {planetData.signCharacteristics.traits && (
                          <div>
                            <span className="text-sm font-medium text-secondary block mb-2">Traits:</span>
                            <div className="flex flex-wrap gap-2">
                              {planetData.signCharacteristics.traits.slice(0, 3).map((trait, i) => (
                                <span key={i} className="badge-vedic bg-subtle text-secondary">
                                  {trait}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {planetData.strength?.interpretation && (
                      <div className="card-vedic bg-exalted/10 p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="vedic-symbol text-exalted">💡</span>
                          <span className="text-sm font-medium text-secondary">Interpretation</span>
                        </div>
                        <p className="text-sm text-secondary italic leading-relaxed">
                          {planetData.strength.interpretation}
                        </p>
                      </div>
                    )}

                    {/* Additional Planet Data with Progressive Disclosure */}
                    {Object.keys(planetData).length > 3 && (
                      <div className="mt-4">
                        <button
                          onClick={() => toggleExpansion(`planet-${planetKey}`)}
                          className="w-full flex items-center justify-between p-3 bg-sacred/50 rounded-lg hover:bg-sacred transition-all duration-300"
                        >
                          <span className="text-sm font-medium text-secondary">
                            Additional {planetName} Details
                          </span>
                          <span className={`vedic-symbol text-saffron transition-transform duration-300 ${
                            expandedItems.has(`planet-${planetKey}`) ? 'rotate-180' : ''
                          }`}>
                            ▼
                          </span>
                        </button>
                        {expandedItems.has(`planet-${planetKey}`) && (
                          <div className="mt-4 animate-fadeIn">
                            <div className="card-vedic bg-sacred/30">
                              <ObjectDisplay data={planetData} />
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  /**
   * Enhanced Houses Display Component - Uses Vedic design system
   */
  const HousesDisplay = ({ houses }) => {
    if (!houses || typeof houses !== 'object') return null;

    const houseEntries = Object.values(houses);

    return (
      <div className="space-vedic">
        <h3 className="text-2xl font-bold text-saffron mb-6 flex items-center gap-3">
          <span className="w-10 h-10 bg-maroon/20 text-maroon rounded-full flex items-center justify-center vedic-symbol">🏠</span>
          House Analysis
          <span className="ml-auto text-base font-normal text-muted">
            {houseEntries.length} house{houseEntries.length !== 1 ? 's' : ''}
          </span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {houseEntries.map((house, index) => {
            if (!house || typeof house !== 'object') return null;

            const houseNumber = house.house || index + 1;
            const sign = house.sign || 'Unknown';
            const lord = house.lord?.planet || 'Unknown';

            return (
              <div key={index} className="card-vedic group hover:shadow-xl transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-xl font-bold text-maroon group-hover:text-saffron transition-colors flex items-center gap-2">
                    <span className="vedic-symbol">🏠</span>
                    House {houseNumber}
                  </h4>
                  <span className="badge-vedic bg-maroon/20 text-maroon">
                    {sign}
                  </span>
                </div>

                <div className="space-vedic">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-secondary">Lord:</span>
                    <span className="badge-vedic bg-gold/20 text-gold font-semibold">{lord}</span>
                  </div>

                  {house.interpretation && (
                    <div className="card-vedic bg-sacred/50 p-4">
                      <p className="text-sm text-secondary leading-relaxed">
                        {house.interpretation}
                      </p>
                    </div>
                  )}

                  {house.houseData?.significations && (
                    <div>
                      <span className="text-xs font-semibold text-muted uppercase tracking-wide block mb-2">Significations:</span>
                      <div className="flex flex-wrap gap-2">
                        {house.houseData.significations.slice(0, 4).map((sig, i) => (
                          <span key={i} className="badge-vedic bg-subtle text-secondary">
                            {sig}
                          </span>
                        ))}
                        {house.houseData.significations.length > 4 && (
                          <span className="text-xs text-muted px-2 py-1">
                            +{house.houseData.significations.length - 4} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* House Details with Progressive Disclosure */}
                  {Object.keys(house).length > 4 && (
                    <DetailsAccordion
                      details={house}
                      title={`House ${houseNumber} Details`}
                      defaultExpanded={false}
                      icon="🏛️"
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  /**
   * Enhanced Aspects Display Component - Uses Vedic design system
   */
  const AspectsDisplay = ({ aspects }) => {
    if (!aspects || typeof aspects !== 'object') return null;

    const allAspects = aspects.allAspects || [];
    const patterns = aspects.patterns || {};

    return (
      <div className="space-vedic">
        <h3 className="text-2xl font-bold text-saffron mb-6 flex items-center gap-3">
          <span className="w-10 h-10 bg-friendly/20 text-friendly rounded-full flex items-center justify-center vedic-symbol">◯</span>
          Planetary Aspects
          <span className="ml-auto text-base font-normal text-muted">
            {allAspects.length} aspect{allAspects.length !== 1 ? 's' : ''}
          </span>
        </h3>

        {/* Enhanced Aspect Patterns Summary */}
        {Object.keys(patterns).length > 0 && (
          <div className="card-cosmic mb-6">
            <h4 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
              <span className="vedic-symbol">✨</span>
              Special Patterns
            </h4>
            <div className="flex flex-wrap gap-3">
              {Object.entries(patterns).map(([pattern, exists]) => (
                exists && (
                  <span key={pattern} className="badge-vedic bg-friendly/20 text-friendly flex items-center gap-2">
                    <span className="w-2 h-2 bg-friendly rounded-full"></span>
                    {pattern.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                )
              ))}
            </div>
          </div>
        )}

        {/* Enhanced Individual Aspects */}
        <div className="space-vedic">
          {allAspects.map((aspect, index) => {
            if (!aspect || typeof aspect !== 'object') return null;

            const isPositive = aspect.nature === 'benefic';
            const strength = aspect.strength || 0;

            return (
              <div key={index} className={`card-vedic transition-all duration-300 hover:shadow-lg ${
                isPositive
                  ? 'bg-friendly/5 border-friendly/20 hover:bg-friendly/10'
                  : 'bg-enemy/5 border-enemy/20 hover:bg-enemy/10'
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-4">
                    <span className="font-semibold text-primary flex items-center gap-2">
                      <span className="vedic-symbol text-jupiter">☿</span>
                      {aspect.source}
                    </span>
                    <span className="text-muted">→</span>
                    <span className={`badge-vedic ${
                      isPositive ? 'badge-friendly' : 'badge-enemy'
                    }`}>
                      {aspect.type}
                    </span>
                    <span className="text-muted">→</span>
                    <span className="font-semibold text-primary flex items-center gap-2">
                      <span className="vedic-symbol text-venus">♀</span>
                      {aspect.target?.planet || aspect.target}
                    </span>
                  </div>

                  {/* Enhanced Strength Indicator */}
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted">Strength:</span>
                    <div className="strength-meter">
                      <div className="strength-dots">
                        {[...Array(5)].map((_, i) => (
                          <div key={i} className={`strength-dot ${
                            i < Math.floor(strength / 2) ? 'active' : ''
                          }`}></div>
                        ))}
                      </div>
                    </div>
                    <span className="text-xs font-mono text-saffron font-bold">
                      {strength}/10
                    </span>
                  </div>
                </div>

                {aspect.description && (
                  <div className="card-vedic bg-sacred/50 p-4">
                    <p className="text-sm text-secondary italic leading-relaxed">
                      {aspect.description}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  /**
   * Enhanced Generic Content Display - Uses Vedic design system
   */
  /**
   * Synthesis Display Component
   * Formats section8 synthesis data into visually appealing cards
   */
  const SynthesisDisplay = ({ synthesis }) => {
    if (!synthesis || typeof synthesis !== 'object') return null;

    // Transform synthesis data into card format
    const formatValue = (value) => {
      if (value === null || value === undefined) return 'Not available';
      if (typeof value === 'object') {
        // Format nested objects as readable text
        return Object.entries(value)
          .map(([key, val]) => {
            const formattedKey = key.replace(/([A-Z])/g, ' $1').trim();
            return `${formattedKey}: ${val}`;
          })
          .join(', ');
      }
      return String(value);
    };

    // Create card data array from synthesis object
    const cardData = [];
    
    Object.entries(synthesis).forEach(([key, value]) => {
      // Skip empty or internal fields
      if (!value || key.startsWith('_') || key === 'id') return;

      // Format key as readable title
      let title = key.replace(/([A-Z])/g, ' $1').trim();
      title = title.charAt(0).toUpperCase() + title.slice(1);
      
      // Special handling for common fields
      if (key === 'NAME') {
        title = 'Synthesis Overview';
      } else if (key === 'CORE_PERSONALITY' || key === 'PERSONALITY_PROFILE') {
        title = 'Core Personality';
      } else if (key === 'EMOTIONAL_NATURE') {
        title = 'Emotional Nature';
      } else if (key === 'PUBLIC_IMAGE') {
        title = 'Public Image';
      } else if (key === 'LAGNA_SIGN') {
        title = 'Lagna Sign (Ascendant)';
      } else if (key === 'LAGNA_LORD') {
        title = 'Lagna Lord';
      } else if (key === 'LAGNA_LORD_POSITION') {
        title = 'Lagna Lord Position';
      } else if (key === 'ARUDHA_LAGNA') {
        title = 'Arudha Lagna';
      }

      const content = formatValue(value);
      
      cardData.push({
        title,
        content,
        key
      });
    });

    if (cardData.length === 0) return null;

    return (
      <div className="space-vedic">
        <h3 className="text-2xl font-bold text-saffron mb-6 flex items-center gap-3">
          <span className="w-10 h-10 bg-gradient-to-br from-saffron/20 to-gold/20 text-saffron rounded-full flex items-center justify-center text-xl">
            📊
          </span>
          Comprehensive Report
          <span className="ml-auto text-base font-normal text-muted">
            {cardData.length} item{cardData.length !== 1 ? 's' : ''}
          </span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cardData.map((card, index) => (
            <div
              key={card.key || index}
              className="card-vedic bg-gradient-to-br from-white via-sacred-cream/30 to-white border-2 border-saffron/20 hover:border-saffron/40 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
            >
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-saffron/20 to-gold/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-lg">
                    {card.key === 'NAME' ? '📋' :
                     card.key?.includes('PERSONALITY') ? '🌟' :
                     card.key?.includes('EMOTIONAL') ? '💭' :
                     card.key?.includes('LAGNA') ? '🌅' :
                     card.key?.includes('ARUDHA') ? '🎯' :
                     '✨'}
                  </span>
                </div>
                <div className="flex-1">
                  <h4 className="text-lg font-bold text-primary mb-2 leading-tight">
                    {card.title}
                  </h4>
                  <div className="text-secondary leading-relaxed whitespace-pre-wrap">
                    {card.content}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const GenericAnalysisDisplay = ({ data, title, icon = "📊" }) => {
    if (!data || typeof data !== 'object') return null;

    const entries = Object.entries(data);

    return (
      <div className="space-vedic">
        <h3 className="text-2xl font-bold text-saffron mb-6 flex items-center gap-3">
          <span className="w-10 h-10 bg-muted/20 text-muted rounded-full flex items-center justify-center">{icon}</span>
          {title}
          <span className="ml-auto text-base font-normal text-muted">
            {entries.length} item{entries.length !== 1 ? 's' : ''}
          </span>
        </h3>

        <div className="card-vedic">
          <ObjectDisplay data={data} title={null} />
        </div>
      </div>
    );
  };

  // Helper function to get dignity badge class using consistent design system
  const getDignityBadgeClass = (dignity) => {
    switch (dignity.toLowerCase()) {
      case 'exalted':
        return 'badge-exalted';
      case 'debilitated':
        return 'badge-debilitated';
      case 'own sign':
        return 'badge-own-sign';
      case 'strong':
        return 'badge-friendly';
      case 'friendly':
        return 'badge-friendly';
      case 'neutral':
        return 'badge-neutral';
      case 'enemy':
        return 'badge-enemy';
      default:
        return 'badge-neutral';
    }
  };

  // Main section content renderer
  const renderSectionContent = (sectionId) => {
    const section = sectionsData[sectionId];

    if (!section) {
      return (
        <div className="loading-vedic">
          <div className="text-muted text-6xl mb-4">📊</div>
          <h3 className="text-xl font-semibold text-secondary mb-2">No Data Available</h3>
          <p className="text-muted">This section is currently empty or still loading.</p>
        </div>
      );
    }

    // Determine section data for rendering
    let sectionData = section;
    if (section.analysis) {
      sectionData = section.analysis;
    }
    if (section.culturalAnalysisData) {
      sectionData = section.culturalAnalysisData;
    }

    return (
      <div className="p-8 space-vedic">
        {/* Enhanced Section Title */}
        <div className="border-b border-gold/20 pb-6 mb-8">
          <h2 className="text-3xl font-bold text-primary flex items-center gap-3">
            <span className="vedic-symbol symbol-om"></span>
            {sectionNames[sectionId]}
          </h2>
          <div className="flex items-center mt-3 gap-6">
            {isSectionVisited(sectionId) && (
              <span className="badge-vedic badge-complete flex items-center gap-2">
                <span className="w-2 h-2 bg-exalted rounded-full"></span>
                Completed
              </span>
            )}
            <span className="text-sm text-muted">
              Section {sectionId.replace('section', '')} of {sectionOrder.length}
            </span>
          </div>
        </div>

        {/* Render section-specific content with enhanced components */}
        {sectionData.questions && (
          <QuestionsDisplay questions={sectionData.questions} />
        )}

        {sectionData.analyses && (
          <AnalysesDisplay analyses={sectionData.analyses} />
        )}

        {sectionData.houses && (
          <HousesDisplay houses={sectionData.houses} />
        )}

        {sectionData.aspects && (
          <AspectsDisplay aspects={sectionData.aspects} />
        )}

        {sectionData.arudhaAnalysis && (
          <GenericAnalysisDisplay
            data={sectionData.arudhaAnalysis}
            title="Arudha Analysis"
            icon="🏛️"
          />
        )}

        {sectionData.navamsaAnalysis && (
          <GenericAnalysisDisplay
            data={sectionData.navamsaAnalysis}
            title="Navamsa Analysis"
            icon="💒"
          />
        )}

        {sectionData.dashaAnalysis && (
          <GenericAnalysisDisplay
            data={sectionData.dashaAnalysis}
            title="Dasha Analysis"
            icon="⏳"
          />
        )}

        {/* Special handling for section8 - Comprehensive Report with Synthesis */}
        {sectionId === 'section8' && (
          sectionData.analyses?.synthesis ? (
            <SynthesisDisplay synthesis={sectionData.analyses.synthesis} />
          ) : sectionData.synthesis ? (
            <SynthesisDisplay synthesis={sectionData.synthesis} />
          ) : null
        )}

        {/* Display unhandled content - but skip section8 if synthesis was already rendered */}
        {!sectionData.questions &&
         !sectionData.analyses &&
         !sectionData.houses &&
         !sectionData.aspects &&
         !sectionData.arudhaAnalysis &&
         !sectionData.navamsaAnalysis &&
         !sectionData.dashaAnalysis &&
         !(sectionId === 'section8' && (sectionData.analyses?.synthesis || sectionData.synthesis)) && (
          <GenericAnalysisDisplay
            data={sectionData}
            title="Analysis Data"
            icon="📋"
          />
        )}
      </div>
    );
  };

  // Return main component JSX with consistent Vedic design
  return (
    <div className="comprehensive-analysis-display max-w-6xl mx-auto">
      {/* Display when no sections available */}
      {Object.keys(sectionsData).length === 0 ? (
        <div className="card-cosmic text-center py-12">
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-2xl font-bold text-primary mb-4">
            No Analysis Data Available
          </h3>
          <div className="text-secondary mb-6 space-y-2">
            <p>The comprehensive analysis data is not yet available.</p>
            <p>Please ensure:</p>
            <ul className="text-left inline-block mt-4 space-y-1">
              <li>• Birth data has been entered correctly</li>
              <li>• Chart has been generated successfully</li>
              <li>• API analysis has completed</li>
            </ul>
          </div>

          <div className="mt-6 space-y-2">
            <button
              onClick={() => window.location.reload()}
              className="btn-vedic btn-primary"
            >
              🔄 Reload Page
            </button>
            <button
              onClick={() => {
                // Try to fetch fresh data
                const birthData = localStorage.getItem('birthData');
                if (birthData) {
                  console.log('🔄 Attempting to reload comprehensive analysis...');
                  window.location.href = '/comprehensive-analysis';
                } else {
                  window.location.href = '/';
                }
              }}
              className="btn-vedic btn-secondary"
            >
              🏠 Start Over
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Enhanced Progress Section */}
          <div className="mb-8 card-cosmic">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-primary flex items-center gap-3">
                <span className="vedic-symbol symbol-mandala"></span>
                Analysis Progress
              </h3>
              <span className="text-sm font-semibold text-saffron">
                {progress.completed}/{progress.total} sections complete
              </span>
            </div>
            <div className="progress-vedic mb-3">
              <div
                className="progress-bar-vedic"
                style={{ width: `${progress.percentage}%` }}
              ></div>
            </div>
            <div className="text-sm text-secondary">
              {progress.percentage.toFixed(0)}% complete
            </div>
          </div>

          {/* Enhanced Section Navigation */}
          <div className="border-b border-gold/20 mb-8">
            <nav className="tabs-vedic" role="tablist">
              {sectionOrder.map((sectionId) => (
                <button
                  key={sectionId}
                  onClick={() => handleSectionChange(sectionId)}
                  role="tab"
                  aria-selected={activeSection === sectionId}
                  className={`tab-vedic relative ${
                    activeSection === sectionId ? 'active' : ''
                  }`}
                >
                  <span className="font-medium">{sectionNames[sectionId]}</span>
                  {isSectionVisited(sectionId) && (
                    <span className="absolute top-2 right-2 w-2 h-2 bg-exalted rounded-full"></span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          {/* Enhanced Section Content */}
          <div className="card-vedic">
            {renderSectionContent(activeSection)}
          </div>
        </>
      )}
    </div>
  );
};

export default ComprehensiveAnalysisDisplay;
