import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

// Import Vedic design system
import '../styles/vedic-design-system.css';

// Import UI components with Vedic design
import { VedicLoadingSpinner, ErrorMessage } from '../components/ui';
// Note: Progressive loading with skeleton states implemented for better UX

// Import chart visualization components
import VedicChartDisplay from '../components/charts/VedicChartDisplay.jsx';

// Import birth time rectification component
import BirthTimeRectification from '../components/BirthTimeRectification.jsx';

// Import contexts
import { useChart } from '../contexts/ChartContext.js';
import { useAnalysis } from '../contexts/AnalysisContext.js';

// Import singleton data flow components
import UIDataSaver from '../components/forms/UIDataSaver.js';
import ResponseDataToUIDisplayAnalyser from '../components/analysis/ResponseDataToUIDisplayAnalyser.js';

// ===== REUSABLE SUMMARY DISPLAY COMPONENT (ENHANCED) =====

const SummaryDisplay = ({ summary, title = '', compact = false }) => {
  if (!summary) return null;

  // Handle string summary
  if (typeof summary === 'string') {
    return (
      <div className={`summary-vedic ${compact ? 'text-sm' : ''}`}>
        {title && <h4 className="summary-title">{title}</h4>}
        <p className="summary-text leading-relaxed">{summary}</p>
      </div>
    );
  }

  // Handle object summary with proper formatting
  if (typeof summary === 'object' && summary !== null) {
    const formatValue = (key, value) => {
      if (value === null || value === undefined) return <span className="text-muted">N/A</span>;
      
      if (typeof value === 'boolean') {
        return (
          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
            value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {value ? '✅ Complete' : '❌ Incomplete'}
          </span>
        );
      }
      
      if (typeof value === 'number') {
        // Format numbers nicely
        if (key.toLowerCase().includes('age') || key.toLowerCase().includes('year')) {
          return <span className="font-semibold text-primary">{value.toFixed(1)} years</span>;
        }
        if (key.toLowerCase().includes('percent') || key.toLowerCase().includes('completeness')) {
          return (
            <div className="flex items-center gap-2">
              <span className="font-semibold text-primary">{value}%</span>
              <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-[100px]">
                <div 
                  className={`h-2 rounded-full transition-all ${
                    value === 100 ? 'bg-green-500' : value >= 75 ? 'bg-yellow-500' : 'bg-orange-500'
                  }`}
                  style={{ width: `${value}%` }}
                />
              </div>
            </div>
          );
        }
        return <span className="font-semibold text-primary">{value.toString()}</span>;
      }
      
      if (typeof value === 'object') {
        // Handle nested objects (like readyForAnalysis)
        if (value.planet && value.startAge !== undefined) {
          return (
            <div className="bg-gradient-to-r from-saffron/10 to-gold/10 p-3 rounded-lg border border-saffron/20">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg font-bold text-saffron">{value.planet}</span>
                <span className="text-sm text-secondary">Dasha Period</span>
              </div>
              <div className="text-sm text-secondary space-y-1">
                <div>Age Range: <span className="font-semibold text-primary">{value.startAge} - {value.endAge} years</span></div>
                {value.remainingYears !== undefined && (
                  <div>Remaining: <span className="font-semibold text-primary">{value.remainingYears.toFixed(1)} years</span></div>
                )}
              </div>
            </div>
          );
        }
        // Other nested objects - display as formatted list
        return (
          <div className="space-y-1 text-sm">
            {Object.entries(value).map(([nestedKey, nestedValue]) => (
              <div key={nestedKey} className="flex justify-between">
                <span className="text-secondary">{nestedKey.replace(/([A-Z])/g, ' $1').trim()}:</span>
                <span className="font-semibold text-primary">
                  {typeof nestedValue === 'object' ? String(nestedValue) : String(nestedValue)}
                </span>
              </div>
            ))}
          </div>
        );
      }
      
      return <span className="text-primary">{String(value)}</span>;
    };

    const formatLabel = (key) => {
      const labelMap = {
        status: 'Analysis Status',
        completeness: 'Completeness',
        chartsGenerated: 'Charts Generated',
        ascendantCalculated: 'Ascendant Calculated',
        planetsCalculated: 'Planets Calculated',
        dashaCalculated: 'Dasha Calculated',
        readyForAnalysis: 'Current Dasha Period'
      };
      return labelMap[key] || key.replace(/([A-Z])/g, ' $1').trim().replace(/^\w/, c => c.toUpperCase());
    };

    const statusItems = Object.entries(summary).filter(([key]) => 
      !['readyForAnalysis'].includes(key) || typeof summary[key] !== 'object'
    );
    const readyForAnalysis = summary.readyForAnalysis && typeof summary.readyForAnalysis === 'object' 
      ? summary.readyForAnalysis 
      : null;

    return (
      <div className={`summary-vedic ${compact ? 'compact' : ''}`}>
        {title && <h4 className="summary-title mb-4">{title}</h4>}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {statusItems.map(([key, value]) => (
            <div key={key} className="bg-white/50 backdrop-blur-sm p-4 rounded-lg border border-sacred/20 hover:border-saffron/40 transition-all duration-300 hover:shadow-md">
              <div className="text-xs font-semibold text-secondary uppercase tracking-wide mb-2">
                {formatLabel(key)}
              </div>
              <div className="text-base">
                {formatValue(key, value)}
              </div>
            </div>
          ))}
        </div>
        {readyForAnalysis && (
          <div className="mt-4">
            {formatValue('readyForAnalysis', readyForAnalysis)}
          </div>
        )}
      </div>
    );
  }

  return null;
};

// ===== SPECIALIZED DISPLAY COMPONENTS (ENHANCED) =====

const LagnaDisplay = ({ data }) => {
  if (!data) return (
    <div className="card-cosmic text-center animate-pulse">
      <div className="text-6xl mb-4 animate-float">🌅</div>
      <p className="text-muted text-lg">No Lagna analysis data available</p>
    </div>
  );

  const lagna = data.analysis || data.lagna || data;

  return (
    <div className="space-y-8">
      {/* Enhanced Header Section */}
      <div className="card-sacred group hover:shadow-xl transition-all duration-500">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-saffron to-gold rounded-full flex items-center justify-center text-3xl animate-glow">
            🌅
          </div>
          <div>
            <h3 className="text-3xl font-bold text-primary group-hover:text-saffron transition-colors duration-300">
              Lagna Analysis (Ascendant)
            </h3>
            <p className="text-secondary text-lg">The foundation of your personality and life path</p>
          </div>
        </div>
      </div>

      {/* Enhanced Insight Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {lagna.sign && (
          <div className="insight-card-enhanced group">
            <div className="card-vedic h-full hover:transform hover:scale-105 transition-all duration-300 hover:shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-jupiter/20 rounded-full flex items-center justify-center">
                  <span className="vedic-symbol text-jupiter">♃</span>
                </div>
                <h4 className="text-lg font-semibold text-primary">Ascendant Sign</h4>
              </div>
              <div className="space-y-3">
                <div className="text-2xl font-bold text-saffron">{lagna.sign}</div>
                {lagna.signLord && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-secondary">Ruled by:</span>
                    <span className="badge-vedic bg-gold/20 text-gold">{lagna.signLord}</span>
                  </div>
                )}
                {lagna.element && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-secondary">Element:</span>
                    <span className="badge-vedic bg-earth-element/20 text-earth-element">{lagna.element}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {lagna.degree && (
          <div className="insight-card-enhanced group">
            <div className="card-vedic h-full hover:transform hover:scale-105 transition-all duration-300 hover:shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-venus/20 rounded-full flex items-center justify-center">
                  <span className="vedic-symbol text-venus">♀</span>
                </div>
                <h4 className="text-lg font-semibold text-primary">Exact Degree</h4>
              </div>
              <div className="space-y-3">
                <div className="text-2xl font-bold text-saffron font-mono">{lagna.degree}</div>
                <div className="text-sm text-secondary">Precise ascendant position</div>
              </div>
            </div>
          </div>
        )}

        {lagna.nakshatra && (
          <div className="insight-card-enhanced group">
            <div className="card-vedic h-full hover:transform hover:scale-105 transition-all duration-300 hover:shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-moon/20 rounded-full flex items-center justify-center">
                  <span className="vedic-symbol text-moon">☽</span>
                </div>
                <h4 className="text-lg font-semibold text-primary">Nakshatra</h4>
              </div>
              <div className="space-y-3">
                <div className="text-2xl font-bold text-saffron">{lagna.nakshatra}</div>
                {lagna.nakshatraPada && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-secondary">Pada:</span>
                    <span className="badge-vedic bg-moon/20 text-moon">{lagna.nakshatraPada}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Interpretation Section */}
      {lagna.description && (
        <div className="card-cosmic group hover:shadow-xl transition-all duration-500">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-third-eye-chakra to-crown-chakra rounded-full flex items-center justify-center text-white text-xl">
              🧠
            </div>
            <h4 className="text-2xl font-bold text-primary group-hover:text-saffron transition-colors duration-300">
              Lagna Interpretation
            </h4>
          </div>
          <div className="prose prose-lg max-w-none">
            <p className="text-secondary leading-relaxed text-lg">{lagna.description}</p>
          </div>
        </div>
      )}

      {/* Enhanced Characteristics Grid */}
      {lagna.characteristics && Array.isArray(lagna.characteristics) && (
        <div className="card-sacred group hover:shadow-xl transition-all duration-500">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-friendly to-exalted rounded-full flex items-center justify-center text-white text-xl">
              ✨
            </div>
            <h4 className="text-2xl font-bold text-primary group-hover:text-saffron transition-colors duration-300">
              Key Characteristics
            </h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {lagna.characteristics.map((char, index) => (
              <div key={index} className="characteristic-item-enhanced group">
                <div className="flex items-center gap-3 p-4 bg-sacred/50 rounded-lg hover:bg-sacred transition-all duration-300 hover:transform hover:scale-105">
                  <span className="text-saffron group-hover:animate-pulse">✨</span>
                  <span className="text-secondary group-hover:text-primary transition-colors duration-300">{char}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Enhanced Strengths Section */}
      {lagna.strengths && Array.isArray(lagna.strengths) && (
        <div className="card-vedic group hover:shadow-xl transition-all duration-500">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-exalted to-friendly rounded-full flex items-center justify-center text-white text-xl">
              💪
            </div>
            <h4 className="text-2xl font-bold text-primary group-hover:text-saffron transition-colors duration-300">
              Strengths
            </h4>
          </div>
          <div className="space-y-4">
            {lagna.strengths.map((strength, index) => (
              <div key={index} className="strength-item-enhanced group">
                <div className="flex items-center gap-4 p-4 bg-exalted/10 rounded-lg hover:bg-exalted/20 transition-all duration-300 hover:transform hover:scale-105">
                  <span className="text-exalted group-hover:animate-pulse">💪</span>
                  <span className="text-secondary group-hover:text-primary transition-colors duration-300">
                    {typeof strength === 'object' ? String(strength) : strength}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Additional Analysis Sections */}
      <div className="space-y-6">
        {lagna.challenges && Array.isArray(lagna.challenges) && (
          <div className="challenges-vedic">
            <h4 className="challenges-title">Areas for Growth</h4>
            <div className="challenge-list">
              {lagna.challenges.map((challenge, index) => (
                <div key={index} className="challenge-item">
                  <span className="challenge-icon">⚡</span>
                  <span>{typeof challenge === 'object' ? String(challenge) : challenge}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {lagna.personalityTraits && Array.isArray(lagna.personalityTraits) && (
          <div className="traits-vedic">
            <h4 className="traits-title">Personality Traits</h4>
            <div className="trait-list">
              {lagna.personalityTraits.map((trait, index) => (
                <div key={index} className="characteristic-item">
                  <span className="trait-icon">✨</span>
                  <span className="characteristic-text">{typeof trait === 'object' ? String(trait) : trait}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Enhanced display for fullData if available */}
        {lagna.fullData && typeof lagna.fullData === 'object' && (
          <div className="interpretation-vedic">
            <h4 className="interpretation-title">Detailed Lagna Analysis</h4>
            <div className="space-vedic">
              {lagna.fullData.lagnaAnalysis && (
                <p className="interpretation-text">{lagna.fullData.lagnaAnalysis}</p>
              )}
              {lagna.fullData.personality && Array.isArray(lagna.fullData.personality) && (
                <div className="characteristics-vedic">
                  <h5>Personality Traits</h5>
                  <div className="characteristics-grid">
                    {lagna.fullData.personality.map((trait, index) => (
                      <div key={index} className="characteristic-item">
                        <span className="characteristic-icon">🌟</span>
                        <span className="characteristic-text">{trait}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Display data from API response */}
        {!lagna.sign && !lagna.description && !lagna.characteristics && (
          <div className="interpretation-vedic">
            <h4 className="interpretation-title">Lagna Analysis Available</h4>
            <p className="interpretation-text">
              Lagna analysis data has been loaded successfully. The cosmic influences of your ascendant are being processed.
            </p>
            <div className="insight-card">
              <div className="insight-label">Analysis Status</div>
              <div className="insight-value">✅ Data Available</div>
              <div className="insight-detail">Comprehensive Lagna interpretation ready</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const HouseDisplay = ({ houseNumber, data }) => {
  if (!data) return (
    <div className="card-vedic text-center">
      <div className="text-muted">🏠</div>
      <p className="text-muted">No data available for House {houseNumber}</p>
    </div>
  );

  const getHouseDetails = (num) => {
    const houseInfo = {
      1: { name: "तनु भाव (Self)", themes: ["Physical Body", "Personality", "First Impressions", "Health"], element: "Fire" },
      2: { name: "धन भाव (Wealth)", themes: ["Family", "Speech", "Accumulated Wealth", "Values"], element: "Earth" },
      3: { name: "भ्रातृ भाव (Siblings)", themes: ["Courage", "Communication", "Short Journeys", "Skills"], element: "Fire" },
      4: { name: "मातृ भाव (Mother)", themes: ["Home", "Education", "Inner Peace", "Property"], element: "Water" },
      5: { name: "पुत्र भाव (Children)", themes: ["Creativity", "Intelligence", "Romance", "Speculation"], element: "Fire" },
      6: { name: "रिपु भाव (Enemies)", themes: ["Health", "Service", "Daily Routine", "Obstacles"], element: "Earth" },
      7: { name: "कलत्र भाव (Partnership)", themes: ["Marriage", "Business Partners", "Open Enemies", "Trade"], element: "Air" },
      8: { name: "आयु भाव (Longevity)", themes: ["Transformation", "Occult", "Inheritance", "Research"], element: "Water" },
      9: { name: "भाग्य भाव (Fortune)", themes: ["Higher Learning", "Philosophy", "Long Journeys", "Luck"], element: "Fire" },
      10: { name: "कर्म भाव (Career)", themes: ["Profession", "Reputation", "Authority", "Social Status"], element: "Earth" },
      11: { name: "लाभ भाव (Gains)", themes: ["Income", "Friends", "Aspirations", "Elder Siblings"], element: "Air" },
      12: { name: "व्यय भाव (Expenditure)", themes: ["Spirituality", "Foreign Lands", "Hidden Enemies", "Liberation"], element: "Water" }
    };
    return houseInfo[num] || { name: `House ${num}`, themes: [], element: "Unknown" };
  };

  const houseInfo = getHouseDetails(houseNumber);
  const house = data.analysis || data.house || data;

  // Extract lord information - handle both string and object formats
  const houseLord = house.lord?.planet || house.lord || house.houseLord;
  const lordPosition = house.lord?.house ? `House ${house.lord.house}` : house.lord?.analysis || house.lordPosition;
  const lordSign = house.lord?.sign;

  return (
    <div className="card-vedic">
      <div className="section-header-vedic">
        <h3 className="section-title-vedic">🏠 {houseInfo.name}</h3>
        <p className="section-subtitle-vedic">House {houseNumber} • {houseInfo.element} Element</p>
      </div>

      <div className="space-vedic">
        {/* House Themes */}
        <div className="themes-vedic">
          <h4 className="themes-title">Life Areas Governed</h4>
          <div className="themes-grid">
            {houseInfo.themes.map((theme, index) => (
              <div key={index} className="theme-item">
                <span className="theme-icon">🔮</span>
                <span>{theme}</span>
              </div>
            ))}
          </div>
        </div>

        {/* House Lord */}
        {houseLord && (
          <div className="insight-card">
            <div className="insight-label">House Lord</div>
            <div className="insight-value">{houseLord}</div>
            {lordPosition && (
              <div className="insight-detail">Positioned in {lordPosition}</div>
            )}
            {lordSign && (
              <div className="insight-detail">Currently in {lordSign}</div>
            )}
          </div>
        )}

        {/* Planets in House */}
        {(house.planets || house.occupants || house.houseOccupants) && (
          <div className="planets-vedic">
            <h4 className="planets-title">Planets Present</h4>
            <div className="planets-list">
              {(() => {
                const planets = house.planets || house.occupants || house.houseOccupants || [];
                const planetList = Array.isArray(planets) ? planets : [planets];
                return planetList.length > 0 ? planetList.map((planet, index) => (
                  <div key={index} className="planet-item">
                    <span className="planet-icon">🪐</span>
                    <span className="planet-name">{planet}</span>
                  </div>
                )) : (
                  <div className="planet-item">
                    <span className="planet-icon">🌟</span>
                    <span className="planet-name">No planets in this house</span>
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {/* Sign in House */}
        {(house.sign || house.houseSign) && (
          <div className="insight-card">
            <div className="insight-label">Sign</div>
            <div className="insight-value">{house.sign || house.houseSign?.sign || house.houseSign}</div>
            {house.signLord && (
              <div className="insight-detail">Sign Lord: {house.signLord}</div>
            )}
          </div>
        )}

        {/* House Analysis/Interpretation */}
        {(house.analysis?.summary || house.interpretation || house.analysis) && (
          <div className="interpretation-vedic">
            <h4 className="interpretation-title">House Analysis</h4>
            <p className="interpretation-text">
              {house.analysis?.summary || house.interpretation ||
               (typeof house.analysis === 'string' ? house.analysis : '')}
            </p>

            {/* Strengths */}
            {house.analysis?.strengths && house.analysis.strengths.length > 0 && (
              <div className="mt-4">
                <h5 className="text-sm font-semibold text-success mb-2">✨ Strengths</h5>
                <ul className="list-disc list-inside space-y-1">
                  {house.analysis.strengths.map((strength, index) => (
                    <li key={index} className="text-sm text-muted">{strength}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Challenges */}
            {house.analysis?.challenges && house.analysis.challenges.length > 0 && (
              <div className="mt-4">
                <h5 className="text-sm font-semibold text-warning mb-2">⚠️ Challenges</h5>
                <ul className="list-disc list-inside space-y-1">
                  {house.analysis.challenges.map((challenge, index) => (
                    <li key={index} className="text-sm text-muted">{challenge}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Recommendations */}
            {house.analysis?.recommendations && house.analysis.recommendations.length > 0 && (
              <div className="mt-4">
                <h5 className="text-sm font-semibold text-primary mb-2">💡 Recommendations</h5>
                <ul className="list-disc list-inside space-y-1">
                  {house.analysis.recommendations.map((rec, index) => (
                    <li key={index} className="text-sm text-muted">{rec}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Strength Assessment */}
        {house.strength && (
          <div className="strength-assessment-vedic">
            <h4 className="strength-title">House Strength</h4>
            <div className="strength-meter">
              <div className="strength-level" data-level={house.strength}>{house.strength}</div>
            </div>
          </div>
        )}

        {/* House Data (for debugging) */}
        {house.houseData && (
          <div className="mt-4 p-3 bg-gray-50 rounded">
            <h5 className="text-sm font-semibold mb-2">House Information</h5>
            <div className="text-xs space-y-1">
              {house.houseData.name && <div><strong>Name:</strong> {house.houseData.name}</div>}
              {house.houseData.nature && <div><strong>Nature:</strong> {house.houseData.nature}</div>}
              {house.houseData.category && <div><strong>Category:</strong> {house.houseData.category}</div>}
              {house.houseData.significations && (
                <div>
                  <strong>Significations:</strong> {house.houseData.significations.join(', ')}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const AspectsDisplay = ({ data }) => {
  // DEBUG: Log the data structure being received

  if (!data) {
    return (
      <div className="card-cosmic text-center animate-pulse">
        <div className="text-6xl mb-4 animate-float">🔗</div>
        <p className="text-muted text-lg">No planetary aspects data available</p>
      </div>
    );
  }

  // Handle the actual API data structure
  const aspects = data.aspects || data.analysis || data;

  const allAspects = aspects.allAspects || aspects.majorAspects || [];
  const patterns = aspects.patterns || [];
  const yogas = aspects.yogas || [];

  // Categorize aspects by nature
  const beneficAspects = allAspects.filter(aspect => aspect.nature === 'benefic');
  const maleficAspects = allAspects.filter(aspect => aspect.nature === 'malefic');
  const majorAspects = allAspects.slice(0, 10); // Show first 10 as major aspects

  return (
    <div className="space-y-8">
      {/* Enhanced Header Section */}
      <div className="card-sacred group hover:shadow-xl transition-all duration-500">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-friendly to-exalted rounded-full flex items-center justify-center text-3xl animate-glow">
            🔗
          </div>
          <div>
            <h3 className="text-3xl font-bold text-primary group-hover:text-saffron transition-colors duration-300">
              Planetary Aspects
            </h3>
            <p className="text-secondary text-lg">Cosmic relationships influencing your life</p>
          </div>
        </div>
      </div>

      {/* Enhanced Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card-vedic group hover:transform hover:scale-105 transition-all duration-300 hover:shadow-xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-jupiter/20 rounded-full flex items-center justify-center">
              <span className="vedic-symbol text-jupiter">♃</span>
            </div>
            <h4 className="text-lg font-semibold text-primary">Total Aspects</h4>
          </div>
          <div className="text-3xl font-bold text-saffron">{allAspects.length}</div>
          <div className="text-sm text-secondary">Planetary relationships</div>
        </div>

        <div className="card-vedic group hover:transform hover:scale-105 transition-all duration-300 hover:shadow-xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-exalted/20 rounded-full flex items-center justify-center">
              <span className="vedic-symbol text-exalted">✓</span>
            </div>
            <h4 className="text-lg font-semibold text-primary">Benefic Aspects</h4>
          </div>
          <div className="text-3xl font-bold text-exalted">{beneficAspects.length}</div>
          <div className="text-sm text-secondary">Positive influences</div>
        </div>

        <div className="card-vedic group hover:transform hover:scale-105 transition-all duration-300 hover:shadow-xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-enemy/20 rounded-full flex items-center justify-center">
              <span className="vedic-symbol text-enemy">⚠</span>
            </div>
            <h4 className="text-lg font-semibold text-primary">Challenging Aspects</h4>
          </div>
          <div className="text-3xl font-bold text-enemy">{maleficAspects.length}</div>
          <div className="text-sm text-secondary">Growth opportunities</div>
        </div>
      </div>

      {/* Enhanced Major Aspects List */}
      {majorAspects.length > 0 && (
        <div className="card-cosmic group hover:shadow-xl transition-all duration-500">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-third-eye-chakra to-crown-chakra rounded-full flex items-center justify-center text-white text-xl">
              ⭐
            </div>
            <h4 className="text-2xl font-bold text-primary group-hover:text-saffron transition-colors duration-300">
              Major Aspects
            </h4>
          </div>
          <div className="space-y-4">
            {majorAspects.map((aspect, index) => {
              const isPositive = aspect.nature === 'benefic';
              const strength = aspect.strength || 0;
              
              return (
                <div key={index} className={`aspect-item-enhanced group ${
                  isPositive ? 'bg-exalted/5 border-exalted/20' : 'bg-enemy/5 border-enemy/20'
                }`}>
                  <div className="card-vedic hover:transform hover:scale-105 transition-all duration-300 hover:shadow-lg">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          isPositive ? 'bg-exalted/20' : 'bg-enemy/20'
                        }`}>
                          <span className={`vedic-symbol ${isPositive ? 'text-exalted' : 'text-enemy'}`}>
                            {isPositive ? '✓' : '⚠'}
                          </span>
                        </div>
                        <div>
                          <div className="text-lg font-semibold text-primary">
                            {aspect.source} → {aspect.target?.planet || aspect.target}
                          </div>
                          <div className="text-sm text-secondary">{aspect.type} aspect</div>
                        </div>
                      </div>
                      
                      {/* Enhanced Strength Indicator */}
                      <div className="flex items-center gap-3">
                        <div className="strength-meter">
                          <div className="strength-dots">
                            {[...Array(5)].map((_, i) => (
                              <div key={i} className={`strength-dot ${
                                i < Math.floor(strength / 2) ? 'active' : ''
                              }`}></div>
                            ))}
                          </div>
                        </div>
                        <span className="text-sm font-mono text-saffron font-bold">
                          {strength}/10
                        </span>
                      </div>
                    </div>

                    {aspect.description && (
                      <div className="bg-sacred/50 p-4 rounded-lg">
                        <p className="text-secondary leading-relaxed">{aspect.description}</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Enhanced Patterns Section */}
      {patterns.length > 0 && (
        <div className="card-sacred group hover:shadow-xl transition-all duration-500">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-friendly to-exalted rounded-full flex items-center justify-center text-white text-xl">
              ✨
            </div>
            <h4 className="text-2xl font-bold text-primary group-hover:text-saffron transition-colors duration-300">
              Special Patterns
            </h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {patterns.map((pattern, index) => (
              <div key={index} className="pattern-item-enhanced group">
                <div className="flex items-center gap-3 p-4 bg-sacred/50 rounded-lg hover:bg-sacred transition-all duration-300 hover:transform hover:scale-105">
                  <span className="text-saffron group-hover:animate-pulse">✨</span>
                  <span className="text-secondary group-hover:text-primary transition-colors duration-300">
                    {pattern}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Enhanced Yogas Section */}
      {yogas.length > 0 && (
        <div className="card-vedic group hover:shadow-xl transition-all duration-500">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-exalted to-friendly rounded-full flex items-center justify-center text-white text-xl">
              🕉️
            </div>
            <h4 className="text-2xl font-bold text-primary group-hover:text-saffron transition-colors duration-300">
              Special Yogas
            </h4>
          </div>
          <div className="space-y-4">
            {yogas.map((yoga, index) => (
              <div key={index} className="yoga-item-enhanced group">
                <div className="flex items-center gap-4 p-4 bg-exalted/10 rounded-lg hover:bg-exalted/20 transition-all duration-300 hover:transform hover:scale-105">
                  <span className="text-exalted group-hover:animate-pulse">🕉️</span>
                  <span className="text-secondary group-hover:text-primary transition-colors duration-300">
                    {yoga}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Display when no data found */}
      {allAspects.length === 0 && patterns.length === 0 && yogas.length === 0 && (
        <div className="text-center text-muted">
          <p className="text-lg">Planetary aspects analysis will be available once comprehensive data is loaded.</p>
          <pre className="text-xs mt-2 bg-gray-100 p-2 rounded">
            Data structure: {String(Object.keys(aspects), null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

const ArudhaDisplay = ({ data }) => {
  if (!data) return (
    <div className="card-cosmic text-center animate-pulse">
      <div className="text-6xl mb-4 animate-float">🎯</div>
      <p className="text-muted text-lg">No Arudha Padas data available</p>
    </div>
  );

  // Handle the actual API data structure
  // The data structure can be: data.arudha.analysis or data.analysis or just data
  const arudha = data.arudha || data.analysis || data;
  const arudhaLagna = arudha.arudhaLagna || {};
  
  // Extract arudhaPadas - STRICT validation
  let arudhaPadas = {};
  
  // CRITICAL FIX: Check for nested arudhaPadas.arudhaPadas structure first (actual API format)
  // Path: section5.arudhaAnalysis.arudhaPadas.arudhaPadas
  if (arudha.arudhaPadas?.arudhaPadas && typeof arudha.arudhaPadas.arudhaPadas === 'object' && !Array.isArray(arudha.arudhaPadas.arudhaPadas)) {
    arudhaPadas = arudha.arudhaPadas.arudhaPadas;
  }
  // Check direct arudhaPadas (but validate it contains A1-A12 keys, not wrapper properties)
  else if (arudha.arudhaPadas && typeof arudha.arudhaPadas === 'object' && !Array.isArray(arudha.arudhaPadas)) {
    // Validate: check if this object has A1, A2, etc. as direct keys
    const topLevelKeys = Object.keys(arudha.arudhaPadas);
    const padaKeyPattern = /^[Aa]?([1-9]|1[0-2])$/; // Matches A1-A12, 1-12
    const hasDirectPadaKeys = topLevelKeys.some(key => padaKeyPattern.test(key.trim()));
    
    if (hasDirectPadaKeys) {
      // This IS the padas object directly
      arudhaPadas = arudha.arudhaPadas;
    } else {
      // This is a wrapper, check if it has arudhaPadas nested inside
      if (arudha.arudhaPadas.arudhaPadas && typeof arudha.arudhaPadas.arudhaPadas === 'object') {
        arudhaPadas = arudha.arudhaPadas.arudhaPadas;
      }
    }
  } 
  // Check alternative naming conventions
  else if (arudha.AarudhaPadas?.arudhaPadas && typeof arudha.AarudhaPadas.arudhaPadas === 'object' && !Array.isArray(arudha.AarudhaPadas.arudhaPadas)) {
    arudhaPadas = arudha.AarudhaPadas.arudhaPadas;
  }
  else if (arudha.AarudhaPadas && typeof arudha.AarudhaPadas === 'object' && !Array.isArray(arudha.AarudhaPadas)) {
    const topLevelKeys = Object.keys(arudha.AarudhaPadas);
    const padaKeyPattern = /^[Aa]?([1-9]|1[0-2])$/;
    const hasDirectPadaKeys = topLevelKeys.some(key => padaKeyPattern.test(key.trim()));
    if (hasDirectPadaKeys) {
      arudhaPadas = arudha.AarudhaPadas;
    } else if (arudha.AarudhaPadas.arudhaPadas && typeof arudha.AarudhaPadas.arudhaPadas === 'object') {
      arudhaPadas = arudha.AarudhaPadas.arudhaPadas;
    }
  }
  
  // CRITICAL: Filter to ONLY include valid Arudha Pada keys (A1-A12)
  // Use strict regex pattern to match exactly A1, A2, ..., A12 or 1, 2, ..., 12
  const padaKeyPattern = /^[Aa]?([1-9]|1[0-2])$/;
  const validPadaKeys = Object.keys(arudhaPadas).filter(key => {
    const trimmedKey = key.trim();
    
    // Must match pattern exactly (A1-A12 or 1-12)
    if (!padaKeyPattern.test(trimmedKey)) {
      return false;
    }
    
    // Extract number to validate range
    const normalizedKey = trimmedKey.replace(/^[Aa]/i, '').trim();
    const num = parseInt(normalizedKey, 10);
    
    // Must be 1-12
    if (isNaN(num) || num < 1 || num > 12) {
      return false;
    }
    
    // Validate the value is a proper pada object
    const value = arudhaPadas[trimmedKey];
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      return false;
    }
    
    // Must have at least one of these properties to be a valid pada
    const hasValidProperties = value.sign || value.arudhaHouse || value.house || 
                               value.description || value.houseLord || 
                               value.originalHouse !== undefined || 
                               value.calculatedArudhaHouse !== undefined;
    
    return hasValidProperties;
  });
  
  // Create filtered arudhaPadas object with only valid keys, preserving original key case
  const filteredArudhaPadas = {};
  validPadaKeys.forEach(key => {
    const value = arudhaPadas[key];
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      filteredArudhaPadas[key] = value;
    }
  });
  
  const imageStability = arudha.imageStability || {};
  const publicImageFactors = arudha.publicImageFactors || [];
  const recommendations = arudha.recommendations || [];
  const reputationCycles = arudha.reputationCycles || [];

  // Get house meanings for Arudha Padas
  const getHouseMeaning = (houseNum) => {
    const meanings = {
      '1': 'Self-image', 'A1': 'Self-image',
      '2': 'Wealth image', 'A2': 'Wealth image',
      '3': 'Siblings image', 'A3': 'Siblings image',
      '4': 'Home image', 'A4': 'Home image',
      '5': 'Creative image', 'A5': 'Creative image',
      '6': 'Service image', 'A6': 'Service image',
      '7': 'Partnership image', 'A7': 'Partnership image',
      '8': 'Transformation image', 'A8': 'Transformation image',
      '9': 'Dharma image', 'A9': 'Dharma image',
      '10': 'Career image', 'A10': 'Career image',
      '11': 'Gains image', 'A11': 'Gains image',
      '12': 'Spiritual image', 'A12': 'Spiritual image'
    };
    return meanings[houseNum] || 'House perception';
  };

  return (
    <div className="space-y-8">
      {/* Enhanced Header Section */}
      <div className="card-sacred group hover:shadow-xl transition-all duration-500">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-jupiter to-saffron rounded-full flex items-center justify-center text-3xl animate-glow">
            🎯
          </div>
          <div>
            <h3 className="text-3xl font-bold text-primary group-hover:text-saffron transition-colors duration-300">
              Arudha Padas Analysis
            </h3>
            <p className="text-secondary text-lg">Public image, perception, and social reputation</p>
          </div>
        </div>
      </div>

      {/* Arudha Lagna Section */}
      {arudhaLagna.lagnaSign && (
        <div className="card-cosmic group hover:shadow-xl transition-all duration-500">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-jupiter to-gold rounded-full flex items-center justify-center text-white text-xl">
              🌟
            </div>
            <h4 className="text-2xl font-bold text-primary group-hover:text-saffron transition-colors duration-300">
              Arudha Lagna (Public Image)
            </h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card-vedic group hover:transform hover:scale-105 transition-all duration-300 hover:shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-jupiter/20 rounded-full flex items-center justify-center">
                  <span className="vedic-symbol text-jupiter">⭐</span>
                </div>
                <h5 className="text-lg font-semibold text-primary">Arudha Lagna Sign</h5>
              </div>
              <div className="text-3xl font-bold text-saffron">{arudhaLagna.lagnaSign}</div>
              <div className="text-sm text-secondary">How the world perceives you</div>
            </div>

            {arudhaLagna.lagnaLord && (
              <div className="card-vedic group hover:transform hover:scale-105 transition-all duration-300 hover:shadow-xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-saffron/20 rounded-full flex items-center justify-center">
                    <span className="vedic-symbol text-saffron">👑</span>
                  </div>
                  <h5 className="text-lg font-semibold text-primary">Arudha Lagna Lord</h5>
                </div>
                <div className="text-3xl font-bold text-saffron">{arudhaLagna.lagnaLord}</div>
                <div className="text-sm text-secondary">Ruler of your public image</div>
              </div>
            )}

            {arudhaLagna.lagnaLordPosition?.sign && (
              <div className="card-vedic group hover:transform hover:scale-105 transition-all duration-300 hover:shadow-xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gold/20 rounded-full flex items-center justify-center">
                    <span className="vedic-symbol text-gold">📍</span>
                  </div>
                  <h5 className="text-lg font-semibold text-primary">AL Lord Position</h5>
                </div>
                <div className="text-2xl font-bold text-saffron">
                  {arudhaLagna.lagnaLordPosition.sign}
                </div>
                <div className="text-sm text-secondary">House {arudhaLagna.lagnaLordPosition.house} - Image stability factor</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Arudha Padas Section - Enhanced UI */}
      {Object.keys(filteredArudhaPadas).length > 0 && (
        <div className="card-cosmic group hover:shadow-xl transition-all duration-500">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-third-eye-chakra to-crown-chakra rounded-full flex items-center justify-center text-white text-xl">
              🏠
            </div>
            <h4 className="text-2xl font-bold text-primary group-hover:text-saffron transition-colors duration-300">
              Arudha Padas (House Perceptions)
            </h4>
            <span className="ml-auto text-base font-normal text-muted">
              {Object.keys(filteredArudhaPadas).length} pada{Object.keys(filteredArudhaPadas).length !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="space-y-4">
            {Object.entries(filteredArudhaPadas).map(([key, pada]) => {
              // Extract house number from key (A1, A2, etc. or just 1, 2, etc.)
              const houseNum = key.replace(/^[Aa]/i, '').trim();
              const houseKey = key.startsWith('A') || key.startsWith('a') ? key.toUpperCase() : `A${houseNum}`;
              
              // Handle both object and primitive pada data - ensure it's an object
              const padaData = typeof pada === 'object' && pada !== null && !Array.isArray(pada) ? pada : {};
              
              // Extract data from standard API response structure
              const sign = padaData.sign || padaData.arudhaSign || '';
              const house = padaData.arudhaHouse || padaData.calculatedArudhaHouse || houseNum;
              const description = padaData.description || padaData.calculation || '';
              const houseLord = padaData.houseLord || padaData.lord || '';
              const originalHouse = padaData.originalHouse !== undefined ? padaData.originalHouse : (padaData.houseNumber !== undefined ? padaData.houseNumber : houseNum);
              
              // Skip if this doesn't look like valid pada data
              if (!sign && !description && !houseLord && originalHouse === undefined && house === houseNum) {
                return null;
              }
              
              return (
                <div key={key} className="group bg-white/5 border border-white/10 hover:border-saffron/30 transition-all duration-300 rounded-lg overflow-hidden">
                  <div className="card-vedic hover:shadow-lg transition-all duration-300 p-5 bg-gradient-to-br from-white/5 to-white/10">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-14 h-14 rounded-full flex items-center justify-center bg-gradient-to-br from-saffron to-gold flex-shrink-0 shadow-lg">
                        <span className="text-white text-base font-bold">
                          {houseKey}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h5 className="text-xl font-bold text-primary mb-2 leading-tight">
                          {getHouseMeaning(houseNum)}
                        </h5>
                        <div className="text-sm text-secondary leading-relaxed">
                          {sign ? (
                            <div className="flex flex-wrap items-baseline gap-1">
                              <span className="font-medium text-primary">{houseKey}</span>
                              <span className="text-secondary">:</span>
                              <span className="font-semibold text-saffron">{sign}</span>
                              <span className="text-secondary">(House {house})</span>
                            </div>
                          ) : (
                            <div className="flex flex-wrap items-baseline gap-1">
                              <span className="font-medium text-primary">{houseKey}</span>
                              <span className="text-secondary">:</span>
                              <span className="text-secondary">House {house}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Detailed Information */}
                    {(houseLord || description || padaData.lordPlacedInHouse || padaData.distanceToLord !== undefined) && (
                      <div className="bg-white/5 p-4 rounded-lg space-y-2 mt-4 border-t border-white/10">
                        {houseLord && (
                          <div className="flex flex-wrap items-center gap-2 text-sm">
                            <span className="font-semibold text-primary">House Lord:</span>
                            <span className="text-secondary">{houseLord}</span>
                          </div>
                        )}
                        {originalHouse && originalHouse.toString() !== houseNum && (
                          <div className="flex flex-wrap items-center gap-2 text-sm">
                            <span className="font-semibold text-primary">Original House:</span>
                            <span className="text-secondary">{originalHouse}</span>
                          </div>
                        )}
                        {padaData.lordPlacedInHouse && (
                          <div className="flex flex-wrap items-center gap-2 text-sm">
                            <span className="font-semibold text-primary">Lord placed in House:</span>
                            <span className="text-secondary">{padaData.lordPlacedInHouse}</span>
                          </div>
                        )}
                        {padaData.distanceToLord !== undefined && padaData.distanceToLord !== null && (
                          <div className="flex flex-wrap items-center gap-2 text-sm">
                            <span className="font-semibold text-primary">Distance to Lord:</span>
                            <span className="text-secondary">{padaData.distanceToLord}</span>
                          </div>
                        )}
                        {description && (
                          <p className="text-secondary leading-relaxed mt-3 pt-3 border-t border-white/10">{description}</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Image Stability */}
      {Object.keys(imageStability).length > 0 && (
        <div className="card-vedic group hover:shadow-xl transition-all duration-500">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-exalted to-friendly rounded-full flex items-center justify-center text-white text-xl">
              ⚖️
            </div>
            <h4 className="text-2xl font-bold text-primary group-hover:text-saffron transition-colors duration-300">
              Image Stability Analysis
            </h4>
          </div>
          <div className="space-y-4">
            {imageStability.stabilityScore !== undefined && (
              <div className="card-vedic group hover:transform hover:scale-105 transition-all duration-300 hover:shadow-xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-exalted/20 rounded-full flex items-center justify-center">
                    <span className="vedic-symbol text-exalted">📊</span>
                  </div>
                  <h5 className="text-lg font-semibold text-primary">Stability Score</h5>
                </div>
                <div className="text-3xl font-bold text-saffron">{imageStability.stabilityScore}/10</div>
                <div className="text-sm text-secondary">Public image stability rating</div>
              </div>
            )}
            {imageStability.stabilityFactors && Array.isArray(imageStability.stabilityFactors) && imageStability.stabilityFactors.length > 0 && (
              <div className="card-cosmic">
                <h5 className="text-lg font-semibold text-primary mb-3 flex items-center gap-2">
                  <span className="vedic-symbol text-exalted">✓</span>
                  Stability Factors
                </h5>
                <div className="space-y-2">
                  {imageStability.stabilityFactors.map((factor, index) => {
                    const factorText = typeof factor === 'object' ? (factor.name || factor.description || factor.text || String(factor)) : factor;
                    return (
                      <div key={index} className="flex items-center gap-2 p-2 bg-exalted/10 rounded">
                        <span className="text-exalted">✓</span>
                        <span className="text-secondary">{factorText}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            {imageStability.volatilityFactors && Array.isArray(imageStability.volatilityFactors) && imageStability.volatilityFactors.length > 0 && (
              <div className="card-cosmic">
                <h5 className="text-lg font-semibold text-primary mb-3 flex items-center gap-2">
                  <span className="vedic-symbol text-enemy">⚠</span>
                  Volatility Factors
                </h5>
                <div className="space-y-2">
                  {imageStability.volatilityFactors.map((factor, index) => {
                    const factorText = typeof factor === 'object' ? (factor.name || factor.description || factor.text || String(factor)) : factor;
                    return (
                      <div key={index} className="flex items-center gap-2 p-2 bg-enemy/10 rounded">
                        <span className="text-enemy">⚠</span>
                        <span className="text-secondary">{factorText}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Public Image Factors */}
      {publicImageFactors.length > 0 && (
        <div className="card-cosmic group hover:shadow-xl transition-all duration-500">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-jupiter to-saffron rounded-full flex items-center justify-center text-white text-xl">
              👥
            </div>
            <h4 className="text-2xl font-bold text-primary group-hover:text-saffron transition-colors duration-300">
              Public Image Factors
            </h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {publicImageFactors.map((factor, index) => {
              const factorObj = typeof factor === 'object' && factor !== null ? factor : { name: factor };
              return (
                <div key={index} className="card-vedic group hover:transform hover:scale-105 transition-all duration-300 hover:shadow-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="vedic-symbol text-jupiter">⭐</span>
                    <h5 className="text-lg font-semibold text-primary">
                      {factorObj.type || factorObj.name || 'Factor'}
                    </h5>
                  </div>
                  {factorObj.description && (
                    <p className="text-secondary text-sm mb-2">{factorObj.description}</p>
                  )}
                  {factorObj.influence && (
                    <div className="text-xs text-secondary mt-2">
                      <span className="font-semibold">Influence:</span> {factorObj.influence}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Reputation Cycles */}
      {reputationCycles.length > 0 && (
        <div className="card-cosmic group hover:shadow-xl transition-all duration-500">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-friendly to-exalted rounded-full flex items-center justify-center text-white text-xl">
              🔄
            </div>
            <h4 className="text-2xl font-bold text-primary group-hover:text-saffron transition-colors duration-300">
              Reputation Cycles
            </h4>
          </div>
          <div className="space-y-4">
            {reputationCycles.map((cycle, index) => {
              const cycleObj = typeof cycle === 'object' && cycle !== null ? cycle : { period: cycle };
              return (
                <div key={index} className="card-vedic group hover:transform hover:scale-105 transition-all duration-300 hover:shadow-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="vedic-symbol text-friendly">🔄</span>
                    <h5 className="text-lg font-semibold text-primary">
                      {cycleObj.period || cycleObj.phase || 'Period'}
                    </h5>
                  </div>
                  {cycleObj.description && (
                    <p className="text-secondary text-sm mb-3">{cycleObj.description}</p>
                  )}
                  {cycleObj.characteristics && Array.isArray(cycleObj.characteristics) && cycleObj.characteristics.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {cycleObj.characteristics.map((char, i) => {
                        const charText = typeof char === 'object' ? (char.name || char.text || String(char)) : char;
                        return (
                          <span key={i} className="badge-vedic bg-friendly/20 text-friendly text-xs px-2 py-1 rounded">
                            {charText}
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="card-cosmic group hover:shadow-xl transition-all duration-500">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-saffron to-gold rounded-full flex items-center justify-center text-white text-xl">
              💡
            </div>
            <h4 className="text-2xl font-bold text-primary group-hover:text-saffron transition-colors duration-300">
              Image Enhancement Recommendations
            </h4>
          </div>
          <div className="space-y-3">
            {recommendations.map((rec, index) => {
              const recObj = typeof rec === 'object' && rec !== null ? rec : { text: rec };
              return (
                <div key={index} className="card-vedic group hover:transform hover:scale-105 transition-all duration-300 hover:shadow-lg">
                  <div className="flex items-start gap-3">
                    <span className="vedic-symbol text-saffron text-xl">✨</span>
                    <div className="flex-1">
                      <p className="text-secondary leading-relaxed">
                        {recObj.text || recObj.description || recObj}
                      </p>
                      {recObj.category && (
                        <span className="inline-block mt-2 badge-vedic bg-saffron/20 text-saffron text-xs px-2 py-1 rounded">
                          {recObj.category}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Display when no data available */}
      {!arudhaLagna.lagnaSign && Object.keys(filteredArudhaPadas).length === 0 && (
        <div className="card-vedic text-center">
          <div className="text-6xl mb-4">🎯</div>
          <p className="text-lg text-secondary">Arudha analysis will be available once comprehensive data is loaded.</p>
        </div>
      )}
    </div>
  );
};

const NavamsaDisplay = ({ data }) => {
  if (!data) return (
    <div className="card-cosmic text-center animate-pulse">
      <div className="text-6xl mb-4 animate-float">🔄</div>
      <p className="text-muted text-lg">No Navamsa chart data available</p>
    </div>
  );

  // Handle the actual API data structure
  // The data structure can be: data.navamsa.analysis or data.analysis or just data
  const navamsa = data.navamsa || data.analysis || data;
  
  // Extract chart info - check multiple locations
  const chartInfo = navamsa.chartInfo || {};
  
  // Extract navamsa lagna - handle different structures
  let navamsaLagna = {};
  if (navamsa.lagnaAnalysis && typeof navamsa.lagnaAnalysis === 'object') {
    // Structure: lagnaAnalysis.navamsaLagna (string) or lagnaAnalysis.position (object)
    if (typeof navamsa.lagnaAnalysis.navamsaLagna === 'string') {
      navamsaLagna = {
        sign: navamsa.lagnaAnalysis.navamsaLagna,
        significance: navamsa.lagnaAnalysis.significance || ''
      };
    } else if (navamsa.lagnaAnalysis.position) {
      navamsaLagna = {
        sign: navamsa.lagnaAnalysis.position.sign || navamsa.lagnaAnalysis.navamsaLagna,
        lord: navamsa.lagnaAnalysis.position.ruler || navamsa.lagnaAnalysis.lord,
        degree: navamsa.lagnaAnalysis.position.degree,
        house: navamsa.lagnaAnalysis.position.house,
        significance: navamsa.lagnaAnalysis.significance || ''
      };
    } else {
      navamsaLagna = navamsa.lagnaAnalysis;
    }
  } else if (navamsa.navamsaLagna) {
    // Handle both string and object formats
    if (typeof navamsa.navamsaLagna === 'string') {
      navamsaLagna = { 
        sign: navamsa.navamsaLagna,
        significance: navamsa.significance || ''
      };
    } else if (typeof navamsa.navamsaLagna === 'object' && navamsa.navamsaLagna !== null) {
      navamsaLagna = navamsa.navamsaLagna;
    }
  }
  
  // Extract lord from different possible locations
  if (!navamsaLagna.lord && navamsaLagna.sign) {
    // Try to get lord from sign if not already present
    const signLords = {
      'ARIES': 'Mars', 'TAURUS': 'Venus', 'GEMINI': 'Mercury', 'CANCER': 'Moon',
      'LEO': 'Sun', 'VIRGO': 'Mercury', 'LIBRA': 'Venus', 'SCORPIO': 'Mars',
      'SAGITTARIUS': 'Jupiter', 'CAPRICORN': 'Saturn', 'AQUARIUS': 'Saturn', 'PISCES': 'Jupiter'
    };
    navamsaLagna.lord = signLords[navamsaLagna.sign.toUpperCase()] || navamsaLagna.lord;
  }
  
  // CRITICAL: Extract planetary strengths - handle multiple nested structures
  // Check various possible locations in the API response
  let planetaryStrengths = {};
  
  // First check direct location
  if (navamsa.planetaryStrengths && typeof navamsa.planetaryStrengths === 'object' && !Array.isArray(navamsa.planetaryStrengths)) {
    planetaryStrengths = navamsa.planetaryStrengths;
  }
  // Check in lagnaAnalysis
  else if (navamsa.lagnaAnalysis?.planetaryStrengths && typeof navamsa.lagnaAnalysis.planetaryStrengths === 'object' && !Array.isArray(navamsa.lagnaAnalysis.planetaryStrengths)) {
    planetaryStrengths = navamsa.lagnaAnalysis.planetaryStrengths;
  }
  // Check in planetaryAnalysis
  else if (navamsa.planetaryAnalysis?.planetaryStrengths && typeof navamsa.planetaryAnalysis.planetaryStrengths === 'object' && !Array.isArray(navamsa.planetaryAnalysis.planetaryStrengths)) {
    planetaryStrengths = navamsa.planetaryAnalysis.planetaryStrengths;
  }
  // Check if planets are directly at root level with strength data
  else if (navamsa.planets && typeof navamsa.planets === 'object' && !Array.isArray(navamsa.planets)) {
    // Extract planetary strengths from planets object structure
    Object.entries(navamsa.planets).forEach(([planet, planetData]) => {
      if (planetData && typeof planetData === 'object' && !Array.isArray(planetData)) {
        const strength = planetData.strength || planetData.totalStrength || planetData.value;
        const dignity = planetData.dignity || planetData.dignityStatus || 'Neutral';
        const house = planetData.house || planetData.housePosition || planetData.houseNumber;
        const grade = planetData.grade || '';
        
        if (strength !== undefined || dignity || house || grade) {
          planetaryStrengths[planet] = {
            totalStrength: strength,
            strength: strength,
            value: strength,
            dignity: dignity,
            dignityStatus: dignity,
            house: house,
            housePosition: house,
            houseNumber: house,
            grade: grade,
            ...planetData
          };
        }
      }
    });
  }
  
  // Filter out invalid entries from planetaryStrengths
  const validPlanetaryStrengths = {};
  Object.entries(planetaryStrengths).forEach(([planet, strengthData]) => {
    // Only include if it has at least one valid property
    if (strengthData && typeof strengthData === 'object' && !Array.isArray(strengthData)) {
      const hasValidData = strengthData.strength !== undefined || 
                          strengthData.totalStrength !== undefined || 
                          strengthData.value !== undefined ||
                          strengthData.dignity ||
                          strengthData.house ||
                          strengthData.grade;
      if (hasValidData) {
        validPlanetaryStrengths[planet] = strengthData;
      }
    }
  });
  planetaryStrengths = validPlanetaryStrengths;
  
  const marriageIndications = navamsa.marriageIndications || {};
  const spiritualIndications = navamsa.spiritualIndications || {};
  const vargottamaPlanets = navamsa.vargottamaPlanets || [];
  const yogaFormations = navamsa.yogaFormations || [];
  const overallAnalysis = navamsa.overallAnalysis || navamsa.summary || {};
  
  // Extract navamsa chart data for visualization
  const navamsaChartData = navamsa.chart || navamsa.navamsaChart || null;

  // Planet name formatting - handle lowercase keys from API
  const formatPlanetName = (planet) => {
    if (!planet) return '';
    // Handle lowercase planet names from API (sun, moon, etc.)
    const planetMap = {
      'sun': 'Sun', 'moon': 'Moon', 'mars': 'Mars', 'mercury': 'Mercury',
      'jupiter': 'Jupiter', 'venus': 'Venus', 'saturn': 'Saturn',
      'rahu': 'Rahu', 'ketu': 'Ketu'
    };
    const lowercase = planet.toLowerCase();
    return planetMap[lowercase] || planet.charAt(0).toUpperCase() + planet.slice(1).toLowerCase();
  };

  return (
    <div className="space-y-8">
      {/* Enhanced Header Section */}
      <div className="card-sacred group hover:shadow-xl transition-all duration-500">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-third-eye-chakra to-crown-chakra rounded-full flex items-center justify-center text-3xl animate-glow">
            🔄
          </div>
          <div>
            <h3 className="text-3xl font-bold text-primary group-hover:text-saffron transition-colors duration-300">
              Navamsa Chart (D9) Analysis
            </h3>
            <p className="text-secondary text-lg">Marriage, spirituality, inner strength, and soul purpose</p>
          </div>
        </div>
      </div>

      {/* Navamsa Chart Visualization */}
      {navamsaChartData && (
        <div className="card-cosmic group hover:shadow-xl transition-all duration-500">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-saffron to-gold rounded-full flex items-center justify-center text-white text-xl">
              📊
            </div>
            <h4 className="text-2xl font-bold text-primary group-hover:text-saffron transition-colors duration-300">
              Navamsa Chart Visualization
            </h4>
          </div>
          <VedicChartDisplay 
            chartData={navamsaChartData} 
            chartType="Navamsa (D9)"
          />
        </div>
      )}

      <div className="space-y-8">
        {/* Chart Info */}
        {chartInfo.name && (
          <div className="card-cosmic group hover:shadow-xl transition-all duration-500">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-saffron to-gold rounded-full flex items-center justify-center text-white text-xl">
                📊
              </div>
              <h4 className="text-2xl font-bold text-primary group-hover:text-saffron transition-colors duration-300">
                Chart Information
              </h4>
            </div>
            <div className="space-y-3">
              <div className="text-lg font-semibold text-primary">{chartInfo.name}</div>
              {chartInfo.description && (
                <p className="text-secondary leading-relaxed">{chartInfo.description}</p>
              )}
              {chartInfo.significance && (
                <div className="bg-white/5 p-4 rounded-lg">
                  <div className="text-sm font-semibold text-primary mb-2">Significance:</div>
                  <p className="text-secondary">{chartInfo.significance}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Navamsa Lagna */}
        {navamsaLagna.sign && (
          <div className="card-cosmic group hover:shadow-xl transition-all duration-500">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-jupiter to-saffron rounded-full flex items-center justify-center text-white text-xl">
                🌟
              </div>
              <h4 className="text-2xl font-bold text-primary group-hover:text-saffron transition-colors duration-300">
                Navamsa Lagna (Inner Spiritual Nature)
              </h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="card-vedic group hover:transform hover:scale-105 transition-all duration-300 hover:shadow-xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-jupiter/20 rounded-full flex items-center justify-center">
                    <span className="vedic-symbol text-jupiter">⭐</span>
                  </div>
                  <h5 className="text-lg font-semibold text-primary">Navamsa Lagna Sign</h5>
                </div>
                <div className="text-3xl font-bold text-saffron">{navamsaLagna.sign}</div>
                <div className="text-sm text-secondary">Your inner spiritual nature</div>
              </div>

              {navamsaLagna.lord && navamsaLagna.lord !== 'Unknown' && (
                <div className="card-vedic group hover:transform hover:scale-105 transition-all duration-300 hover:shadow-xl">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-saffron/20 rounded-full flex items-center justify-center">
                      <span className="vedic-symbol text-saffron">👑</span>
                    </div>
                    <h5 className="text-lg font-semibold text-primary">Navamsa Lagna Lord</h5>
                  </div>
                  <div className="text-3xl font-bold text-saffron">{formatPlanetName(navamsaLagna.lord)}</div>
                  <div className="text-sm text-secondary">Ruler of inner self</div>
                </div>
              )}

              {navamsaLagna.house !== undefined && (
                <div className="card-vedic group hover:transform hover:scale-105 transition-all duration-300 hover:shadow-xl">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gold/20 rounded-full flex items-center justify-center">
                      <span className="vedic-symbol text-gold">📍</span>
                    </div>
                    <h5 className="text-lg font-semibold text-primary">House Position</h5>
                  </div>
                  <div className="text-3xl font-bold text-saffron">House {navamsaLagna.house}</div>
                  <div className="text-sm text-secondary">Spiritual foundation</div>
                </div>
              )}
            </div>

            {navamsaLagna.significance && (
              <div className="mt-6 bg-white/5 p-4 rounded-lg border-t border-white/10">
                <p className="text-secondary leading-relaxed">{navamsaLagna.significance}</p>
              </div>
            )}

            {navamsaLagna.characteristics && Array.isArray(navamsaLagna.characteristics) && navamsaLagna.characteristics.length > 0 && (
              <div className="mt-6 bg-white/5 p-4 rounded-lg border-t border-white/10">
                <h5 className="text-lg font-semibold text-primary mb-3">Spiritual Characteristics:</h5>
                <ul className="space-y-2">
                  {navamsaLagna.characteristics.map((char, index) => (
                    <li key={index} className="flex items-start gap-2 text-secondary">
                      <span className="text-saffron mt-1">•</span>
                      <span>{char}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Vargottama Planets */}
        {vargottamaPlanets.length > 0 && (
          <div className="card-cosmic group hover:shadow-xl transition-all duration-500">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-gold to-saffron rounded-full flex items-center justify-center text-white text-xl">
                ⭐
              </div>
              <h4 className="text-2xl font-bold text-primary group-hover:text-saffron transition-colors duration-300">
                Vargottama Planets
              </h4>
              <span className="ml-auto text-base font-normal text-muted">
                {vargottamaPlanets.length} planet{vargottamaPlanets.length !== 1 ? 's' : ''}
              </span>
            </div>
            <p className="text-secondary mb-4">Planets in same sign in both D1 and D9 charts - Enhanced strength and stability</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {vargottamaPlanets.map((planet, index) => {
                const planetName = typeof planet === 'object' && planet !== null ? (planet.planet || planet.name || '') : planet;
                const planetSign = typeof planet === 'object' && planet !== null ? (planet.sign || '') : '';
                return (
                  <div key={index} className="card-vedic group hover:transform hover:scale-[1.02] transition-all duration-300 hover:shadow-lg border border-white/10">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-gold to-saffron rounded-full flex items-center justify-center text-white font-bold">
                        {formatPlanetName(planetName).charAt(0)}
                      </div>
                      <div>
                        <div className="text-lg font-bold text-primary">{formatPlanetName(planetName)}</div>
                        {planetSign && (
                          <div className="text-sm text-secondary">Sign: <span className="font-semibold text-saffron">{planetSign}</span></div>
                        )}
                      </div>
                    </div>
                    <div className="bg-white/5 p-3 rounded-lg">
                      <div className="text-sm text-secondary">Enhanced strength and stability</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Planetary Strengths */}
        {Object.keys(planetaryStrengths).length > 0 && (
          <div className="card-cosmic group hover:shadow-xl transition-all duration-500">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-exalted to-friendly rounded-full flex items-center justify-center text-white text-xl">
                💪
              </div>
              <h4 className="text-2xl font-bold text-primary group-hover:text-saffron transition-colors duration-300">
                Planetary Strengths in D9
              </h4>
              <span className="ml-auto text-base font-normal text-muted">
                {Object.keys(planetaryStrengths).length} planet{Object.keys(planetaryStrengths).length !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(planetaryStrengths).map(([planet, strength]) => {
                // Handle both numeric strength values and strength objects - ensure it's always an object
                const strengthObj = typeof strength === 'object' && strength !== null && !Array.isArray(strength) 
                  ? strength 
                  : { totalStrength: typeof strength === 'number' ? strength : 0 };
                
                // Extract all possible field names for each property
                const strengthValue = strengthObj.totalStrength !== undefined ? strengthObj.totalStrength 
                  : (strengthObj.strength !== undefined ? strengthObj.strength 
                  : (strengthObj.value !== undefined ? strengthObj.value 
                  : (typeof strength === 'number' ? strength : 0)));
                
                const dignity = strengthObj.dignity || strengthObj.dignityStatus || strengthObj.dignityGrade || 'Neutral';
                const house = strengthObj.housePosition !== undefined ? strengthObj.housePosition 
                  : (strengthObj.house !== undefined ? strengthObj.house 
                  : (strengthObj.houseNumber !== undefined ? strengthObj.houseNumber : ''));
                const grade = strengthObj.grade || strengthObj.quality || strengthObj.assessment || '';

                // Skip if no valid data at all
                if (strengthValue === 0 && !dignity && !house && !grade) {
                  return null;
                }

                return (
                  <div key={planet} className="card-vedic group hover:transform hover:scale-[1.02] transition-all duration-300 hover:shadow-lg border border-white/10 rounded-lg overflow-hidden">
                    <div className="bg-gradient-to-br from-white/5 to-white/10 p-5">
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="w-14 h-14 rounded-full flex items-center justify-center bg-gradient-to-br from-saffron to-gold flex-shrink-0 shadow-lg">
                            <span className="text-white text-lg font-bold">
                              {formatPlanetName(planet).charAt(0)}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h5 className="text-xl font-bold text-primary mb-1 break-words leading-tight">
                              {formatPlanetName(planet)}
                            </h5>
                            {strengthValue > 0 && (
                              <div className="text-sm text-secondary">
                                Strength: <span className="font-semibold text-saffron">{strengthValue}/10</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="bg-white/5 p-4 rounded-lg space-y-3 border-t border-white/10">
                        {strengthValue > 0 && (
                          <div className="w-full bg-white/10 rounded-full h-2.5 mb-2">
                            <div
                              className="bg-gradient-to-r from-saffron to-gold h-2.5 rounded-full transition-all duration-300"
                              style={{ width: `${Math.min((strengthValue / 10) * 100, 100)}%` }}
                            ></div>
                          </div>
                        )}
                        
                        <div className="grid grid-cols-1 gap-2 text-sm">
                          {dignity && dignity !== 'Unknown' && dignity !== 'Neutral' && (
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-primary min-w-[80px]">Dignity:</span>
                              <span className="text-secondary">{dignity}</span>
                            </div>
                          )}
                          
                          {house && (
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-primary min-w-[80px]">House:</span>
                              <span className="text-secondary">{house}</span>
                            </div>
                          )}
                          
                          {grade && (
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-primary min-w-[80px]">Grade:</span>
                              <span className="text-secondary">{grade}</span>
                            </div>
                          )}
                        </div>
                        
                        {strengthObj.effects && Array.isArray(strengthObj.effects) && strengthObj.effects.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-white/10">
                            <div className="text-xs font-semibold text-primary mb-2">Effects:</div>
                            <ul className="space-y-1">
                              {strengthObj.effects.map((effect, idx) => {
                                const effectText = typeof effect === 'object' && effect !== null
                                  ? (effect.description || effect.text || effect.name || String(effect))
                                  : String(effect);
                                return (
                                  <li key={idx} className="text-xs text-secondary flex items-start gap-1">
                                    <span className="text-saffron mt-0.5">•</span>
                                    <span>{effectText}</span>
                                  </li>
                                );
                              })}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Marriage Indications */}
        {Object.keys(marriageIndications).length > 0 && (
          <div className="card-cosmic group hover:shadow-xl transition-all duration-500">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-friendly to-exalted rounded-full flex items-center justify-center text-white text-xl">
                💒
              </div>
              <h4 className="text-2xl font-bold text-primary group-hover:text-saffron transition-colors duration-300">
                Marriage & Partnership Analysis
              </h4>
            </div>
            <div className="space-y-4">
              {marriageIndications.marriageProspects && (
                <div className="card-vedic group hover:shadow-lg transition-all duration-300 p-5">
                  <h5 className="text-lg font-semibold text-primary mb-3 flex items-center gap-2">
                    <span className="vedic-symbol text-saffron">💍</span>
                    Marriage Prospects
                  </h5>
                  <p className="text-secondary leading-relaxed">{marriageIndications.marriageProspects}</p>
                </div>
              )}

              {marriageIndications.spouseCharacteristics && Array.isArray(marriageIndications.spouseCharacteristics) && marriageIndications.spouseCharacteristics.length > 0 && (
                <div className="card-vedic group hover:shadow-lg transition-all duration-300 p-5">
                  <h5 className="text-lg font-semibold text-primary mb-3 flex items-center gap-2">
                    <span className="vedic-symbol text-saffron">👫</span>
                    Spouse Characteristics
                  </h5>
                  <ul className="space-y-2">
                    {marriageIndications.spouseCharacteristics.map((char, index) => (
                      <li key={index} className="flex items-start gap-2 text-secondary">
                        <span className="text-saffron mt-1">•</span>
                        <span>{char}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {marriageIndications.marriageTiming && (
                <div className="card-vedic group hover:shadow-lg transition-all duration-300 p-5">
                  <h5 className="text-lg font-semibold text-primary mb-3 flex items-center gap-2">
                    <span className="vedic-symbol text-saffron">⏰</span>
                    Marriage Timing Indications
                  </h5>
                  <p className="text-secondary leading-relaxed">{marriageIndications.marriageTiming}</p>
                </div>
              )}

              {marriageIndications.relationshipHarmony && (
                <div className="card-vedic group hover:shadow-lg transition-all duration-300 p-5">
                  <h5 className="text-lg font-semibold text-primary mb-3 flex items-center gap-2">
                    <span className="vedic-symbol text-saffron">❤️</span>
                    Relationship Harmony
                  </h5>
                  <p className="text-secondary leading-relaxed">{marriageIndications.relationshipHarmony}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Spiritual Indications */}
        {Object.keys(spiritualIndications).length > 0 && (
          <div className="card-cosmic group hover:shadow-xl transition-all duration-500">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-third-eye-chakra to-crown-chakra rounded-full flex items-center justify-center text-white text-xl">
                🕉️
              </div>
              <h4 className="text-2xl font-bold text-primary group-hover:text-saffron transition-colors duration-300">
                Spiritual Indications
              </h4>
            </div>
            <div className="space-y-4">
              {spiritualIndications.spiritualInclination && (
                <div className="card-vedic group hover:shadow-lg transition-all duration-300 p-5">
                  <h5 className="text-lg font-semibold text-primary mb-3 flex items-center gap-2">
                    <span className="vedic-symbol text-saffron">🧘</span>
                    Spiritual Inclination
                  </h5>
                  <p className="text-secondary leading-relaxed">{spiritualIndications.spiritualInclination}</p>
                </div>
              )}

              {spiritualIndications.dharmaPath && (
                <div className="card-vedic group hover:shadow-lg transition-all duration-300 p-5">
                  <h5 className="text-lg font-semibold text-primary mb-3 flex items-center gap-2">
                    <span className="vedic-symbol text-saffron">🛤️</span>
                    Dharma Path
                  </h5>
                  <p className="text-secondary leading-relaxed">{spiritualIndications.dharmaPath}</p>
                </div>
              )}

              {spiritualIndications.spiritualPractices && Array.isArray(spiritualIndications.spiritualPractices) && spiritualIndications.spiritualPractices.length > 0 && (
                <div className="card-vedic group hover:shadow-lg transition-all duration-300 p-5">
                  <h5 className="text-lg font-semibold text-primary mb-3 flex items-center gap-2">
                    <span className="vedic-symbol text-saffron">📿</span>
                    Recommended Spiritual Practices
                  </h5>
                  <ul className="space-y-2">
                    {spiritualIndications.spiritualPractices.map((practice, index) => (
                      <li key={index} className="flex items-start gap-2 text-secondary">
                        <span className="text-saffron mt-1">•</span>
                        <span>{practice}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Yoga Formations */}
        {yogaFormations.length > 0 && (
          <div className="card-cosmic group hover:shadow-xl transition-all duration-500">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-friendly to-exalted rounded-full flex items-center justify-center text-white text-xl">
                🧘
              </div>
              <h4 className="text-2xl font-bold text-primary group-hover:text-saffron transition-colors duration-300">
                Yoga Formations in D9
              </h4>
              <span className="ml-auto text-base font-normal text-muted">
                {yogaFormations.length} yoga{yogaFormations.length !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {yogaFormations.map((yoga, index) => {
                const yogaObj = typeof yoga === 'object' && yoga !== null ? yoga : { name: yoga };
                return (
                  <div key={index} className="card-vedic group hover:transform hover:scale-[1.02] transition-all duration-300 hover:shadow-lg border border-white/10">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-friendly to-exalted rounded-full flex items-center justify-center text-white font-bold">
                        🧘
                      </div>
                      <h5 className="text-lg font-bold text-primary">{yogaObj.name || 'Yoga Formation'}</h5>
                    </div>
                    <div className="bg-white/5 p-4 rounded-lg space-y-2">
                      {yogaObj.description && (
                        <p className="text-secondary leading-relaxed text-sm">{yogaObj.description}</p>
                      )}
                      {yogaObj.planets && Array.isArray(yogaObj.planets) && (
                        <div className="text-sm">
                          <span className="font-semibold text-primary">Planets: </span>
                          <span className="text-secondary">{yogaObj.planets.map(p => formatPlanetName(p)).join(', ')}</span>
                        </div>
                      )}
                      {yogaObj.effects && (
                        <div className="text-sm">
                          <span className="font-semibold text-primary">Effects: </span>
                          <span className="text-secondary">{yogaObj.effects}</span>
                        </div>
                      )}
                      {yogaObj.strength && (
                        <div className="text-sm">
                          <span className="font-semibold text-primary">Strength: </span>
                          <span className="text-secondary">{yogaObj.strength}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Overall Analysis */}
        {(overallAnalysis.summary || overallAnalysis.strengths || overallAnalysis.challenges || overallAnalysis.recommendations) && (
          <div className="card-cosmic group hover:shadow-xl transition-all duration-500">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-jupiter to-saffron rounded-full flex items-center justify-center text-white text-xl">
                📋
              </div>
              <h4 className="text-2xl font-bold text-primary group-hover:text-saffron transition-colors duration-300">
                Overall Navamsa Analysis
              </h4>
            </div>
            <div className="space-y-4">
              {overallAnalysis.summary && (
                <div className="card-vedic group hover:shadow-lg transition-all duration-300 p-5">
                  <SummaryDisplay summary={overallAnalysis.summary} title="Summary" />
                </div>
              )}

              {overallAnalysis.strengths && Array.isArray(overallAnalysis.strengths) && overallAnalysis.strengths.length > 0 && (
                <div className="card-vedic group hover:shadow-lg transition-all duration-300 p-5">
                  <h5 className="text-lg font-semibold text-primary mb-3 flex items-center gap-2">
                    <span className="vedic-symbol text-exalted">✨</span>
                    Strengths
                  </h5>
                  <ul className="space-y-2">
                    {overallAnalysis.strengths.map((strength, index) => (
                      <li key={index} className="flex items-start gap-2 text-secondary">
                        <span className="text-exalted mt-1">•</span>
                        <span>{strength}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {overallAnalysis.challenges && Array.isArray(overallAnalysis.challenges) && overallAnalysis.challenges.length > 0 && (
                <div className="card-vedic group hover:shadow-lg transition-all duration-300 p-5">
                  <h5 className="text-lg font-semibold text-primary mb-3 flex items-center gap-2">
                    <span className="vedic-symbol text-enemy">⚠️</span>
                    Challenges
                  </h5>
                  <ul className="space-y-2">
                    {overallAnalysis.challenges.map((challenge, index) => (
                      <li key={index} className="flex items-start gap-2 text-secondary">
                        <span className="text-enemy mt-1">•</span>
                        <span>{challenge}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {overallAnalysis.recommendations && Array.isArray(overallAnalysis.recommendations) && overallAnalysis.recommendations.length > 0 && (
                <div className="card-vedic group hover:shadow-lg transition-all duration-300 p-5">
                  <h5 className="text-lg font-semibold text-primary mb-3 flex items-center gap-2">
                    <span className="vedic-symbol text-saffron">💡</span>
                    Recommendations
                  </h5>
                  <ul className="space-y-2">
                    {overallAnalysis.recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start gap-2 text-secondary">
                        <span className="text-saffron mt-1">•</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Display when no data available */}
        {!navamsaLagna.sign && Object.keys(marriageIndications).length === 0 && Object.keys(planetaryStrengths).length === 0 && (
          <div className="card-cosmic text-center">
            <div className="text-6xl mb-4">🔄</div>
            <p className="text-lg text-secondary">Navamsa analysis will be available once comprehensive data is loaded.</p>
          </div>
        )}
      </div>
    </div>
  );
};

const DashaDisplay = ({ data }) => {
  if (!data) return (
    <div className="card-vedic text-center">
      <div className="text-muted">⏳</div>
      <p className="text-muted">No Dasha periods data available</p>
    </div>
  );

  // Handle the actual API data structure
  const dasha = data.dasha || data.analysis || data;
  const currentDasha = dasha.currentDasha || dasha.current_dasha || {};
  const antardashas = dasha.antardashas || [];
  const dashaSequence = dasha.dasha_sequence || dasha.dashaSequence || [];
  const timeline = dasha.timeline || [];
  const upcomingDashas = dasha.upcomingDashas || [];
  const recommendations = dasha.recommendations || [];
  const summary = dasha.summary || {};
  const transitIntegration = dasha.transitIntegration || {};

  return (
    <div className="card-vedic">
      <div className="section-header-vedic">
        <h3 className="section-title-vedic">⏳ Dasha Periods Analysis</h3>
        <p className="section-subtitle-vedic">Timeline of planetary influences and life events</p>
      </div>

      <div className="space-vedic">
        {/* Summary */}
        {summary.description && (
          <div className="dasha-summary-section">
            <h4 className="section-title">📋 Dasha System Overview</h4>
            <p className="summary-description">{summary.description}</p>
            {summary.currentPhase && (
              <div className="current-phase">
                <strong>Current Life Phase:</strong> {summary.currentPhase}
              </div>
            )}
          </div>
        )}

        {/* Current Dasha */}
        {currentDasha.planet && (
          <div className="current-dasha-section">
            <h4 className="section-title">🌟 Current Mahadasha</h4>
            <div className="dasha-card current">
              <div className="dasha-header">
                <div className="dasha-planet">{currentDasha.planet}</div>
                <div className="dasha-period">
                  {currentDasha.startDate} - {currentDasha.endDate}
                </div>
              </div>

              {currentDasha.remainingPeriod && (
                <div className="remaining-period">
                  <strong>Remaining:</strong> {currentDasha.remainingPeriod}
                </div>
              )}

              {currentDasha.characteristics && (
                <div className="dasha-characteristics">
                  <h5>Key Characteristics:</h5>
                  <ul>
                    {currentDasha.characteristics.map((char, index) => (
                      <li key={index}>{char}</li>
                    ))}
                  </ul>
                </div>
              )}

              {currentDasha.effects && (
                <div className="dasha-effects">
                  <h5>Effects:</h5>
                  <p>{currentDasha.effects}</p>
                </div>
              )}

              {currentDasha.opportunities && (
                <div className="dasha-opportunities">
                  <h5>Opportunities:</h5>
                  <ul>
                    {currentDasha.opportunities.map((opp, index) => (
                      <li key={index}>{opp}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Antardashas */}
        {antardashas.length > 0 && (
          <div className="antardashas-section">
            <h4 className="section-title">📅 Antardasha Periods</h4>
            <div className="antardashas-grid">
              {antardashas.map((antardasha, index) => (
                <div key={index} className={`antardasha-card ${antardasha.status === 'current' ? 'current' : ''}`}>
                  <div className="antardasha-header">
                    <div className="antardasha-planet">{antardasha.planet}</div>
                    <div className="antardasha-period">
                      {antardasha.startDate} - {antardasha.endDate}
                    </div>
                  </div>

                  {antardasha.status === 'current' && (
                    <div className="current-indicator">Currently Active</div>
                  )}

                  {antardasha.themes && (
                    <div className="antardasha-themes">
                      <strong>Themes:</strong> {antardasha.themes.join(', ')}
                    </div>
                  )}

                  {antardasha.predictions && (
                    <div className="antardasha-predictions">
                      <p>{antardasha.predictions}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Timeline */}
        {timeline.length > 0 && (
          <div className="dasha-timeline-section">
            <h4 className="section-title">⏰ Life Events Timeline</h4>
            <div className="timeline-container">
              {timeline.map((event, index) => (
                <div key={index} className="timeline-item">
                  <div className="timeline-marker"></div>
                  <div className="timeline-content">
                    <div className="timeline-period">{event.period}</div>
                    <div className="timeline-dates">{event.startDate} - {event.endDate}</div>
                    <div className="timeline-description">{event.description}</div>
                    {event.significance && (
                      <div className="timeline-significance">
                        <strong>Significance:</strong> {event.significance}
                      </div>
                    )}
                    {event.keyEvents && event.keyEvents.length > 0 && (
                      <div className="timeline-events">
                        <strong>Key Events:</strong>
                        <ul>
                          {event.keyEvents.map((ke, i) => (
                            <li key={i}>{ke}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upcoming Dashas */}
        {upcomingDashas.length > 0 && (
          <div className="upcoming-dashas-section">
            <h4 className="section-title">🔮 Upcoming Mahadashas</h4>
            <div className="upcoming-dashas-grid">
              {upcomingDashas.map((upcoming, index) => (
                <div key={index} className="upcoming-dasha-card">
                  <div className="upcoming-header">
                    <div className="upcoming-planet">{upcoming.planet}</div>
                    <div className="upcoming-start">Begins: {upcoming.startDate}</div>
                  </div>

                  <div className="upcoming-duration">
                    Duration: {upcoming.duration} years
                  </div>

                  {upcoming.generalThemes && (
                    <div className="upcoming-themes">
                      <strong>General Themes:</strong>
                      <ul>
                        {upcoming.generalThemes.map((theme, i) => (
                          <li key={i}>{theme}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {upcoming.preparation && (
                    <div className="upcoming-preparation">
                      <strong>Preparation:</strong> {upcoming.preparation}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Transit Integration */}
        {Object.keys(transitIntegration).length > 0 && (
          <div className="transit-integration-section">
            <h4 className="section-title">🌍 Transit Integration</h4>
            {transitIntegration.currentTransits && (
              <div className="current-transits">
                <h5>Current Important Transits:</h5>
                <ul>
                  {transitIntegration.currentTransits.map((transit, index) => (
                    <li key={index}>{transit}</li>
                  ))}
                </ul>
              </div>
            )}

            {transitIntegration.dashaTransitCombination && (
              <div className="dasha-transit-combo">
                <h5>Dasha-Transit Combination Effects:</h5>
                <p>{transitIntegration.dashaTransitCombination}</p>
              </div>
            )}
          </div>
        )}

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <div className="dasha-recommendations-section">
            <h4 className="section-title">💡 Dasha Period Recommendations</h4>
            <div className="recommendations-list">
              {recommendations.map((rec, index) => (
                <div key={index} className="recommendation-item">
                  <span className="rec-icon">🎯</span>
                  <div className="rec-content">
                    <div className="rec-title">{rec.title || rec.category}</div>
                    <div className="rec-description">{rec.description || rec.text || rec}</div>
                    {rec.timing && (
                      <div className="rec-timing">Best timing: {rec.timing}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Dasha Sequence (if available) */}
        {dashaSequence.length > 0 && (
          <div className="dasha-sequence-section">
            <h4 className="section-title">📊 Complete Dasha Sequence</h4>
            <div className="sequence-timeline">
              {dashaSequence.map((seq, index) => (
                <div key={index} className={`sequence-item ${seq.status === 'current' ? 'current' : seq.status === 'completed' ? 'completed' : 'upcoming'}`}>
                  <div className="sequence-number">{index + 1}</div>
                  <div className="sequence-planet">{seq.planet}</div>
                  <div className="sequence-period">{seq.period || `${seq.startDate} - ${seq.endDate}`}</div>
                  <div className="sequence-age">Age {seq.startAge} - {seq.endAge}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Display when no data available */}
        {!currentDasha.planet && antardashas.length === 0 && timeline.length === 0 && (
          <div className="text-center text-muted">
            <p>Dasha analysis will be available once comprehensive data is loaded.</p>
            <pre className="text-xs mt-2 bg-gray-100 p-2 rounded">
              Available data: {String(Object.keys(dasha), null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

const PreliminaryDisplay = ({ data }) => {
  if (!data) return (
    <div className="card-cosmic text-center animate-pulse">
      <div className="text-6xl mb-4 animate-float">📋</div>
      <p className="text-muted text-lg">No preliminary analysis data available</p>
    </div>
  );

  const preliminary = data.analysis || data.preliminary || data;

  return (
    <div className="space-y-8">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-saffron/20 via-gold/20 to-white rounded-xl p-8 border-2 border-saffron/30 shadow-xl">
        <div className="flex items-center gap-4 mb-2">
          <div className="w-16 h-16 bg-gradient-to-br from-saffron to-gold rounded-full flex items-center justify-center text-3xl animate-glow">
            📋
          </div>
          <div>
            <h3 className="text-3xl font-bold text-primary">Preliminary Analysis</h3>
            <p className="text-secondary mt-1">Initial chart assessment and overview</p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Handle summary as either string or object */}
        {preliminary.summary && (
          <div className="bg-gradient-to-br from-saffron/10 via-gold/10 to-white rounded-xl p-6 border border-saffron/20 shadow-lg">
            <SummaryDisplay summary={preliminary.summary} title="Chart Overview" compact={false} />
          </div>
        )}

        {preliminary.keyPlacements && Array.isArray(preliminary.keyPlacements) && (
          <div className="bg-gradient-to-r from-blue/10 to-cyan/10 rounded-xl p-6 border border-blue/20 shadow-lg">
            <h4 className="text-xl font-bold text-primary mb-4 flex items-center gap-2">
              <span className="text-2xl">🪐</span>
              Key Planetary Placements
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {preliminary.keyPlacements.map((placement, index) => (
                <div key={index} className="bg-white/50 backdrop-blur-sm p-4 rounded-lg border border-blue/20 hover:border-blue/40 transition-all duration-300 hover:shadow-md">
                  <div className="font-bold text-lg text-primary mb-2">{placement.planet}</div>
                  <div className="text-sm text-secondary space-y-1">
                    <div>Sign: <span className="font-semibold text-saffron">{placement.sign}</span></div>
                    <div>House: <span className="font-semibold text-primary">House {placement.house}</span></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {preliminary.strengths && Array.isArray(preliminary.strengths) && preliminary.strengths.length > 0 && (
          <div className="bg-gradient-to-r from-green/10 to-emerald/10 rounded-xl p-6 border border-green/20 shadow-lg">
            <h4 className="text-xl font-bold text-primary mb-4 flex items-center gap-2">
              <span className="text-2xl">💪</span>
              Chart Strengths
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {preliminary.strengths.map((strength, index) => (
                <div key={index} className="bg-white/50 backdrop-blur-sm p-4 rounded-lg border border-green/20 hover:border-green/40 transition-all duration-300">
                  <div className="flex items-start gap-3">
                    <span className="text-xl">✨</span>
                    <span className="text-secondary leading-relaxed flex-1">{typeof strength === 'object' ? String(strength) : strength}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {preliminary.challenges && Array.isArray(preliminary.challenges) && preliminary.challenges.length > 0 && (
          <div className="bg-gradient-to-r from-orange/10 to-red/10 rounded-xl p-6 border border-orange/20 shadow-lg">
            <h4 className="text-xl font-bold text-primary mb-4 flex items-center gap-2">
              <span className="text-2xl">⚡</span>
              Areas for Growth
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {preliminary.challenges.map((challenge, index) => (
                <div key={index} className="bg-white/50 backdrop-blur-sm p-4 rounded-lg border border-orange/20 hover:border-orange/40 transition-all duration-300">
                  <div className="flex items-start gap-3">
                    <span className="text-xl">⚠️</span>
                    <span className="text-secondary leading-relaxed flex-1">{typeof challenge === 'object' ? String(challenge) : challenge}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {preliminary.recommendations && Array.isArray(preliminary.recommendations) && preliminary.recommendations.length > 0 && (
          <div className="bg-gradient-to-r from-purple/10 to-pink/10 rounded-xl p-6 border border-purple/20 shadow-lg">
            <h4 className="text-xl font-bold text-primary mb-4 flex items-center gap-2">
              <span className="text-2xl">🎯</span>
              Initial Recommendations
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {preliminary.recommendations.map((rec, index) => (
                <div key={index} className="bg-white/50 backdrop-blur-sm p-4 rounded-lg border border-purple/20 hover:border-purple/40 transition-all duration-300">
                  <div className="flex items-start gap-3">
                    <span className="text-xl">💡</span>
                    <span className="text-secondary leading-relaxed flex-1">{typeof rec === 'object' ? String(rec) : rec}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Handle status object properly */}
        {preliminary.status && typeof preliminary.status === 'object' && (
          <div className="bg-gradient-to-br from-saffron/10 via-gold/10 to-white rounded-xl p-6 border border-saffron/20 shadow-lg">
            <h4 className="text-xl font-bold text-primary mb-4 flex items-center gap-2">
              <span className="text-2xl">📊</span>
              Analysis Status
            </h4>
            <SummaryDisplay summary={preliminary.status} title="" compact={false} />
          </div>
        )}

        
      </div>
    </div>
  );
};

const ComprehensiveDisplay = ({ data }) => {
  if (!data) return (
    <div className="card-cosmic text-center animate-pulse">
      <div className="text-6xl mb-4 animate-float">📊</div>
      <p className="text-muted text-lg">No comprehensive analysis data available</p>
    </div>
  );

  const comprehensive = data.analysis || data.comprehensive || data;

  return (
    <div className="space-y-8">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-saffron/20 via-gold/20 to-white rounded-xl p-8 border-2 border-saffron/30 shadow-xl">
        <div className="flex items-center gap-4 mb-2">
          <div className="w-16 h-16 bg-gradient-to-br from-saffron to-gold rounded-full flex items-center justify-center text-3xl animate-glow">
            📊
          </div>
          <div>
            <h3 className="text-3xl font-bold text-primary">Comprehensive Analysis</h3>
            <p className="text-secondary mt-1">Complete 8-section astrological assessment</p>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        {/* Analysis Status Overview */}
        {comprehensive.sections?.section1?.summary && (
          <div className="bg-gradient-to-br from-saffron/10 via-gold/10 to-white rounded-xl p-6 border border-saffron/20 shadow-lg">
            <h4 className="text-xl font-bold text-primary mb-4 flex items-center gap-2">
              <span className="text-2xl">📊</span>
              Analysis Status Overview
            </h4>
            <SummaryDisplay summary={comprehensive.sections.section1.summary} compact={false} />
          </div>
        )}

        {/* Sections Overview */}
        {comprehensive.sections && typeof comprehensive.sections === 'object' && (
          <div className="sections-overview-enhanced">
            <h4 className="text-2xl font-bold text-primary mb-6 flex items-center gap-3">
              <span className="text-3xl">📚</span>
              Analysis Sections Overview
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(comprehensive.sections).map(([sectionKey, section]) => {
                const sectionNumber = sectionKey.replace('section', '');
                const sectionIcons = {
                  '1': '📋',
                  '2': '🌅',
                  '3': '🏠',
                  '4': '🔗',
                  '5': '🎯',
                  '6': '🔄',
                  '7': '⏳',
                  '8': '📊'
                };
                
                return (
                  <div 
                    key={sectionKey} 
                    className="group bg-white rounded-xl p-6 border-2 border-sacred/20 hover:border-saffron/60 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div className="text-3xl group-hover:scale-110 transition-transform">
                        {sectionIcons[sectionNumber] || '📄'}
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-lg text-primary mb-1">
                          {section.name || sectionKey.replace(/([A-Z])/g, ' $1').trim()}
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {section.questions?.length > 0 && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                              <span>💡</span>
                              {section.questions.length} insights
                            </span>
                          )}
                          {section.analyses && Object.keys(section.analyses).length > 0 && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-semibold">
                              <span>🔍</span>
                              {Object.keys(section.analyses).length} analyses
                            </span>
                          )}
                          {section.houses && Object.keys(section.houses).length > 0 && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                              <span>🏠</span>
                              {Object.keys(section.houses).length} houses
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    {section.summary && typeof section.summary === 'object' && sectionKey === 'section1' && (
                      <div className="mt-4 pt-4 border-t border-sacred/20">
                        <SummaryDisplay summary={section.summary} title="" compact={true} />
                      </div>
                    )}
                    {section.summary && typeof section.summary === 'string' && (
                      <div className="mt-3 pt-3 border-t border-sacred/20">
                        <p className="text-sm text-secondary leading-relaxed line-clamp-2">
                          {section.summary}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {comprehensive.overallTheme && (
          <div className="bg-gradient-to-r from-purple/10 to-pink/10 rounded-xl p-6 border border-purple/20 shadow-lg">
            <h4 className="text-xl font-bold text-primary mb-3 flex items-center gap-2">
              <span className="text-2xl">🌟</span>
              Life Theme
            </h4>
            <p className="text-secondary leading-relaxed text-lg">{comprehensive.overallTheme}</p>
          </div>
        )}

        {comprehensive.keyInsights && Array.isArray(comprehensive.keyInsights) && comprehensive.keyInsights.length > 0 && (
          <div className="bg-gradient-to-r from-blue/10 to-cyan/10 rounded-xl p-6 border border-blue/20 shadow-lg">
            <h4 className="text-xl font-bold text-primary mb-4 flex items-center gap-2">
              <span className="text-2xl">🔑</span>
              Key Insights
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {comprehensive.keyInsights.map((insight, index) => (
                <div key={index} className="bg-white/50 backdrop-blur-sm p-4 rounded-lg border border-blue/20 hover:border-blue/40 transition-all duration-300">
                  <div className="flex items-start gap-3">
                    <span className="text-xl">💎</span>
                    <span className="text-secondary leading-relaxed flex-1">{insight}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {comprehensive.lifeAreas && typeof comprehensive.lifeAreas === 'object' && Object.keys(comprehensive.lifeAreas).length > 0 && (
          <div className="bg-gradient-to-r from-green/10 to-emerald/10 rounded-xl p-6 border border-green/20 shadow-lg">
            <h4 className="text-xl font-bold text-primary mb-4 flex items-center gap-2">
              <span className="text-2xl">🏗️</span>
              Life Areas Assessment
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(comprehensive.lifeAreas).map(([area, assessment]) => (
                <div key={area} className="bg-white/50 backdrop-blur-sm p-5 rounded-lg border border-green/20 hover:border-green/40 transition-all duration-300 hover:shadow-md">
                  <div className="font-bold text-lg text-primary mb-2">{area}</div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="text-2xl font-bold text-saffron">{assessment.rating}/10</div>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all ${
                          assessment.rating >= 8 ? 'bg-green-500' : assessment.rating >= 6 ? 'bg-yellow-500' : 'bg-orange-500'
                        }`}
                        style={{ width: `${(assessment.rating / 10) * 100}%` }}
                      />
                    </div>
                  </div>
                  {assessment.summary && (
                    <div className="text-sm text-secondary leading-relaxed">
                      {typeof assessment.summary === 'string' ? assessment.summary : <SummaryDisplay summary={assessment.summary} title="" compact={true} />}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Callout */}
        <div className="bg-gradient-to-r from-saffron/5 to-gold/5 rounded-xl p-6 border border-saffron/20 text-center">
          <p className="text-secondary leading-relaxed">
            For detailed section-by-section analysis, visit the{' '}
            <strong className="text-primary">8-Section Comprehensive Analysis</strong> page.
          </p>
        </div>
      </div>
    </div>
  );
};

// ===== MAIN COMPONENT =====

const AnalysisPage = () => {
  const navigate = useNavigate();
  useChart(); // Using context for future enhancements
  const {
    isLoading,
    error,
    setLoading,
    setError,
    activeSection,
    setActiveSection
  } = useAnalysis();

  const [analysisData, setAnalysisData] = useState({});
  const [activeHouse, setActiveHouse] = useState(1);
  const [loadingStages, setLoadingStages] = useState({});

  // Load analysis data on component mount using the data layer
  useEffect(() => {
    let mounted = true;
    let hasRun = false;

    const initializeDataLoading = async () => {
      // Prevent multiple concurrent calls
      if (hasRun || !mounted) {
        return;
      }

      // Ensure activeSection is set to lagna as default if not already set
      if (!activeSection) {
        setActiveSection('lagna');
      }

      try {
        setLoading(true);
        setError(null);

        const birthStamp = UIDataSaver.getBirthData();
        if (!birthStamp || !birthStamp.data) {
          const friendlyMessage = 'Please generate a chart first.';
          sessionStorage.setItem('analysisRedirectMessage', friendlyMessage);
          const errorObj = {
            message: friendlyMessage,
            code: 'BIRTH_DATA_REQUIRED',
            action: 'navigate_chart',
            requiresNavigation: true
          };
          setError(errorObj);
          setTimeout(() => {
            navigate('/chart');
          }, 500);
          return;
        }

        // Use the data layer to load comprehensive analysis
        const result = await ResponseDataToUIDisplayAnalyser.loadFromComprehensiveAnalysis();

        if (result.success) {
          setAnalysisData(result.data);

          // Verify state update worked
          setTimeout(() => {
          }, 100);
        } else {
          console.error('❌ AnalysisPage: Failed to load data:', result.error);
          
          // PRODUCTION: Handle BIRTH_DATA_REQUIRED error with proper user guidance
          if (result.error?.code === 'BIRTH_DATA_REQUIRED') {
            const errorObj = {
              message: result.error.userMessage || result.error.message || 'Birth data is required for analysis. Please fill out the birth data form first.',
              code: result.error.code,
              action: result.error.action || 'navigate_home',
              requiresNavigation: true
            };
            setError(errorObj);
            // CRITICAL FIX: Navigate only once, prevent retry loop
            setTimeout(() => {
              navigate('/');
            }, 2000);
            return; // Exit early to prevent further processing
          } else {
            // CRITICAL FIX: Ensure error is always a user-friendly message
            const errorMessage = typeof result.error === 'string' 
              ? result.error 
              : result.error?.message || result.error?.details || 'Failed to load analysis data. Please try again or generate your birth chart first.';
            setError({
              message: errorMessage,
              code: result.error?.code || 'ANALYSIS_LOAD_FAILED',
              action: 'navigate_home'
            });
          }
        }
      } catch (error) {
        console.error('❌ AnalysisPage: Error during initialization:', error);
        
        // PRODUCTION: Handle birth data required error
        if (error.code === 'BIRTH_DATA_REQUIRED') {
          const errorObj = {
            message: error.userMessage || 'Birth data is required for analysis. Please fill out the birth data form first.',
            code: error.code,
            action: error.action || 'navigate_home',
            requiresNavigation: true
          };
          setError(errorObj);
          // CRITICAL FIX: Navigate only once, prevent retry loop
          setTimeout(() => {
            navigate('/');
          }, 2000);
          return; // Exit early to prevent further processing
        } else {
          // CRITICAL FIX: Ensure error is always a user-friendly message
          const errorMessage = error.message || error.toString() || 'Failed to load analysis data. Please try again or generate your birth chart first.';
          setError({
            message: errorMessage,
            code: error.code || 'ANALYSIS_INIT_ERROR',
            action: 'navigate_home'
          });
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    // Prevent multiple concurrent calls
    const loadData = async () => {
      if (!hasRun && mounted) {
        hasRun = true;
        await initializeDataLoading();
      }
    };
    
    loadData();
    
    return () => {
      mounted = false;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array for mount-only execution - dependencies handled internally

  // FIXED: Define all analysis endpoints using correct API paths
  const analysisEndpoints = useMemo(() => ({
    lagna: { url: '/api/v1/analysis/comprehensive', label: 'Lagna Analysis', icon: '🌅', note: 'Data extracted from comprehensive analysis' },
    preliminary: { url: '/api/v1/analysis/preliminary', label: 'Preliminary', icon: '📋' },
    houses: { url: '/api/v1/analysis/houses', label: 'Houses Analysis', icon: '🏠' },
    aspects: { url: '/api/v1/analysis/aspects', label: 'Planetary Aspects', icon: '🔗' },
    arudha: { url: '/api/v1/analysis/arudha', label: 'Arudha Padas', icon: '🎯' },
    navamsa: { url: '/api/v1/analysis/navamsa', label: 'Navamsa Chart', icon: '🔄' },
    dasha: { url: '/api/v1/analysis/dasha', label: 'Dasha Periods', icon: '⏳' },
    comprehensive: { url: '/api/v1/analysis/comprehensive', label: 'Full Analysis', icon: '📊' }
  }), []);

  // Main tabs configuration
  const mainTabs = useMemo(() => [
    { key: 'lagna', label: 'Lagna Analysis', icon: '🌅' },
    { key: 'houses', label: 'Houses (1-12)', icon: '🏠', hasSubTabs: true },
    { key: 'aspects', label: 'Planetary Aspects', icon: '🔗' },
    { key: 'arudha', label: 'Arudha Padas', icon: '🎯' },
    { key: 'navamsa', label: 'Navamsa Chart', icon: '🔄' },
    { key: 'dasha', label: 'Dasha Periods', icon: '⏳' },
    { key: 'preliminary', label: 'Preliminary', icon: '📋' },
    { key: 'comprehensive', label: 'Full Analysis', icon: '📊' }
  ], []);

  // House sub-tabs (1-12)
  const houseSubTabs = useMemo(() =>
    Array.from({length: 12}, (_, i) => ({
      key: `house${i + 1}`,
      number: i + 1,
      label: `House ${i + 1}`,
      endpoint: `/api/v1/chart/analysis/house/${i + 1}`,
      description: {
        1: "Self & Personality", 2: "Wealth & Family", 3: "Courage & Siblings",
        4: "Home & Mother", 5: "Children & Intelligence", 6: "Health & Service",
        7: "Marriage & Partnership", 8: "Longevity & Transformation", 9: "Fortune & Religion",
        10: "Career & Reputation", 11: "Gains & Friends", 12: "Loss & Spirituality"
      }[i + 1]
    })), []
  );

  // Individual analysis data fetching following ComprehensiveAnalysisPage pattern
  // Note: This function is kept for reference but logic now handled by ResponseDataToUIDisplayAnalyser
  // eslint-disable-next-line no-unused-vars
  const fetchIndividualAnalysis = useCallback(async (analysisType) => {
    try {
      setLoading(true);
      setError(null);

      // 1. Check cached data first (following ComprehensiveAnalysisPage pattern)
      const cachedData = UIDataSaver.getIndividualAnalysis(analysisType);

      if (cachedData && cachedData.analysis) {
        const processedData = ResponseDataToUIDisplayAnalyser[`process${analysisType.charAt(0).toUpperCase() + analysisType.slice(1)}Analysis`]?.(cachedData) ||
                             ResponseDataToUIDisplayAnalyser.processGenericAnalysis(cachedData, analysisType);

        setAnalysisData(prev => ({ ...prev, [analysisType]: processedData }));
        setLoading(false);
        return;
      }

      // 2. Get birth data validation (following ComprehensiveAnalysisPage pattern)
      const birthStamp = UIDataSaver.getBirthData();
      const birthData = birthStamp?.data || null;
      if (!birthData) {
        console.error('❌ No birth data found, redirecting to chart');
        sessionStorage.setItem('analysisRedirectMessage', 'Please generate a chart first.');
        navigate('/chart');
        return;
      }


      // 3. Call individual analysis API
      const endpointUrl = analysisEndpoints[analysisType]?.url;
      if (!endpointUrl) {
        throw new Error(`No endpoint defined for ${analysisType}`);
      }

      const response = await fetch(endpointUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(birthData) // Required for API calls - not in UI
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      const apiData = await response.json();

      // 4. Process data with ResponseDataToUIDisplayAnalyser
      const processMethod = `process${analysisType.charAt(0).toUpperCase() + analysisType.slice(1)}Analysis`;
      const processedData = ResponseDataToUIDisplayAnalyser[processMethod]?.(apiData) ||
                           ResponseDataToUIDisplayAnalyser.processGenericAnalysis(apiData, analysisType);

      if (!processedData) {
        throw new Error(`Failed to process ${analysisType} API response`);
      }

      // 5. Save to UIDataSaver using new API pattern
      UIDataSaver.saveApiAnalysisResponse(analysisType, apiData);

      setAnalysisData(prev => ({ ...prev, [analysisType]: processedData }));

    } catch (err) {
      console.error(`❌ Error fetching ${analysisType} analysis:`, err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [navigate, analysisEndpoints, setError, setLoading]);

  // Load comprehensive analysis and extract individual sections
  // Note: This function is kept for reference but logic now handled by ResponseDataToUIDisplayAnalyser
  // eslint-disable-next-line no-unused-vars
  const loadFromComprehensiveAnalysis = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);


      // 1. Try to get comprehensive analysis data first
      const comprehensiveData = UIDataSaver.getComprehensiveAnalysis();

      if (comprehensiveData && comprehensiveData.sections) {

        // Extract individual analysis types from comprehensive sections
        const extractedData = {};

        // SECTION 1: Birth Data Collection and Chart Casting
        if (comprehensiveData.sections.section1) {
          extractedData.preliminary = {
            analysis: comprehensiveData.sections.section1,
            success: true
          };
        }

        // SECTION 2: Preliminary Chart Analysis: Lagna, Luminaries, and Overall Patterns
        if (comprehensiveData.sections.section2) {
          // Extract lagna from section2.analyses.lagna and format it properly
          if (comprehensiveData.sections.section2.analyses?.lagna) {
            const rawLagnaData = comprehensiveData.sections.section2.analyses.lagna;

            // Transform the data structure to match what LagnaDisplay expects
            const lagnaSign = rawLagnaData.lagnaSign || rawLagnaData.lagna || {};
            const lagnaLord = rawLagnaData.lagnaLord || rawLagnaData.lord || {};
            const currentPosition = lagnaLord.currentPosition || lagnaLord.position || {};
            
            // Ensure characteristics is an array
            let characteristics = lagnaSign.characteristics;
            if (!Array.isArray(characteristics)) {
              if (typeof characteristics === 'string') {
                characteristics = [characteristics];
              } else if (characteristics && typeof characteristics === 'object') {
                characteristics = Object.values(characteristics);
              } else {
                characteristics = [];
              }
            }

            // Extract description from various possible locations
            const description = rawLagnaData.description || 
                              rawLagnaData.interpretation || 
                              rawLagnaData.analysis ||
                              lagnaSign.description ||
                              lagnaSign.interpretation ||
                              'Lagna analysis data available';

            const formattedLagnaData = {
              analysis: {
                sign: lagnaSign.sign || lagnaSign.name || rawLagnaData.sign,
                signLord: lagnaSign.ruler || lagnaSign.lord || lagnaLord.name || rawLagnaData.signLord,
                element: lagnaSign.element || rawLagnaData.element,
                characteristics: characteristics,
                description: description,
                degree: currentPosition.degree || lagnaLord.degree || rawLagnaData.degree,
                nakshatra: currentPosition.nakshatra || lagnaLord.nakshatra || rawLagnaData.nakshatra,
                // Include the full raw data for comprehensive access
                fullData: rawLagnaData
              },
              success: true
            };

            extractedData.lagna = formattedLagnaData;
          } else if (comprehensiveData.sections.section2) {
            // Extract lagna data from section2 structure with format handling
            const section2 = comprehensiveData.sections.section2;
            const formattedLagnaData = {
              analysis: {
                sign: section2.sign || section2.lagnaSign?.sign || section2.lagna?.sign,
                signLord: section2.signLord || section2.ruler || section2.lord,
                element: section2.element || section2.lagnaSign?.element,
                description: section2.description || section2.interpretation || section2.analysis || 'Lagna analysis available',
                degree: section2.degree || section2.lagnaLord?.currentPosition?.degree,
                nakshatra: section2.nakshatra || section2.lagnaLord?.currentPosition?.nakshatra,
                characteristics: Array.isArray(section2.characteristics) ? section2.characteristics : 
                                (section2.lagnaSign?.characteristics ? (Array.isArray(section2.lagnaSign.characteristics) ? section2.lagnaSign.characteristics : [section2.lagnaSign.characteristics]) : []),
                fullData: section2
              },
              success: true
            };
            extractedData.lagna = formattedLagnaData;
          }
        }

        // SECTION 3: House-by-House Examination (1st-12th Bhavas)
        if (comprehensiveData.sections.section3) {
          // Extract houses from section3.houses and format properly
          if (comprehensiveData.sections.section3.houses) {
            const rawHousesData = comprehensiveData.sections.section3.houses;

            // Format houses data for HouseDisplay component
            const formattedHousesData = {
              analysis: rawHousesData,
              success: true
            };

            extractedData.houses = formattedHousesData;
          } else if (comprehensiveData.sections.section3) {
            // Extract houses data from section3 structure
            extractedData.houses = { analysis: comprehensiveData.sections.section3, success: true };
          }
        }

        // SECTION 4: Planetary Aspects and Interrelationships
        if (comprehensiveData.sections.section4) {
          // Extract aspects from section4.aspects
          const aspectsData = {
            analysis: {
              aspects: comprehensiveData.sections.section4.aspects,
              patterns: comprehensiveData.sections.section4.patterns,
              yogas: comprehensiveData.sections.section4.yogas,
              // Include full section for comprehensive access
              fullSection: comprehensiveData.sections.section4
            },
            success: true
          };
          extractedData.aspects = aspectsData;
        }

        // SECTION 5: Arudha Lagna Analysis (Perception & Public Image)
        if (comprehensiveData.sections.section5) {
          // Extract arudha from section5.arudhaAnalysis
          const arudhaData = {
            analysis: comprehensiveData.sections.section5.arudhaAnalysis || comprehensiveData.sections.section5,
            success: true
          };
          extractedData.arudha = arudhaData;
        }

        // SECTION 6: Navamsa Chart Analysis (D9) - Soul and Marriage
        if (comprehensiveData.sections.section6) {
          // Extract navamsa from section6.navamsaAnalysis
          const navamsaData = {
            analysis: comprehensiveData.sections.section6.navamsaAnalysis || comprehensiveData.sections.section6,
            success: true
          };
          extractedData.navamsa = navamsaData;
        }

        // SECTION 7: Dasha Analysis: Timeline of Life Events
        if (comprehensiveData.sections.section7) {
          // Extract dasha from section7.dashaAnalysis
          const dashaData = {
            analysis: comprehensiveData.sections.section7.dashaAnalysis || comprehensiveData.sections.section7,
            success: true
          };
          extractedData.dasha = dashaData;
        }

        // SECTION 8: Synthesis: From Analysis to Comprehensive Report
        if (comprehensiveData.sections.section8) {
          // Extract comprehensive synthesis
          const comprehensiveAnalysisData = {
            analysis: comprehensiveData.sections.section8,
            success: true
          };
          extractedData.comprehensive = comprehensiveAnalysisData;
        }

        setAnalysisData(extractedData);
        setLoading(false);
        return;
      }

      // 2. Try to get individual analysis data from UIDataSaver for ALL endpoints
      const individualData = {};
      const analysisTypes = ['lagna', 'houses', 'aspects', 'arudha', 'navamsa', 'dasha', 'preliminary', 'comprehensive'];

      // Load ALL available analysis types in parallel
      const loadPromises = analysisTypes.map(async (type) => {
        try {
          const data = UIDataSaver.getIndividualAnalysis(type);
          if (data && (data.analysis || data.success)) {
            individualData[type] = data;
            return { type, data, success: true };
          } else {
            return { type, data: null, success: false };
          }
        } catch (error) {
          return { type, data: null, success: false, error: error.message };
        }
      });

      await Promise.all(loadPromises);

      // 3. If we have individual data, use it
      if (Object.keys(individualData).length > 0) {
        setAnalysisData(individualData);
        setLoading(false);
        return;
      }

      // 4. Try to get data from session storage directly
      try {
        const sessionKeys = Object.keys(sessionStorage);
        const analysisDataFromSession = {};


        sessionKeys.forEach(key => {
          if (key.includes('jyotish_api_analysis_')) {
            try {
              const data = JSON.parse(sessionStorage.getItem(key));
              if (data && (data.analysis || data.success)) {
                // Extract analysis type from key: jyotish_api_analysis_TYPE_timestamp
                const keyParts = key.split('_');
                const analysisType = keyParts[3]; // Position after jyotish_api_analysis_

                if (analysisType && ['lagna', 'houses', 'aspects', 'arudha', 'navamsa', 'dasha', 'preliminary', 'comprehensive'].includes(analysisType)) {
                  analysisDataFromSession[analysisType] = data;
                } else if (key.includes('_comprehensive_')) {
                  // Handle comprehensive analysis specially
                  if (data.analysis?.sections) {
                    const sections = data.analysis.sections;
                    if (sections.section1) analysisDataFromSession.preliminary = { analysis: sections.section1, success: true };
                    if (sections.section2) {
                      // Extract lagna from section2.analyses.lagna
                      if (sections.section2.analyses?.lagna) {
                        analysisDataFromSession.lagna = { analysis: sections.section2.analyses.lagna, success: true };
                      } else {
                        analysisDataFromSession.lagna = { analysis: sections.section2, success: true };
                      }
                    }
                    if (sections.section3) analysisDataFromSession.houses = { analysis: sections.section3.houses || sections.section3, success: true };
                    if (sections.section4) analysisDataFromSession.aspects = { analysis: sections.section4.aspects || sections.section4, success: true };
                    if (sections.section5) analysisDataFromSession.arudha = { analysis: sections.section5.arudhaAnalysis || sections.section5, success: true };
                    if (sections.section6) analysisDataFromSession.navamsa = { analysis: sections.section6.navamsaAnalysis || sections.section6, success: true };
                    if (sections.section7) analysisDataFromSession.dasha = { analysis: sections.section7.dashaAnalysis || sections.section7, success: true };
                    // Include comprehensive data itself
                    analysisDataFromSession.comprehensive = data;
                  }
                }
              }
            } catch (err) {
            }
          }
        });

        if (Object.keys(analysisDataFromSession).length > 0) {
          setAnalysisData(analysisDataFromSession);
          setLoading(false);
          return;
        }
      } catch (err) {
      }

      // 5. No analysis data found - show error state
      setError({
        message: 'Analysis data is not available. Please generate your birth chart first by filling out the birth data form.',
        code: 'NO_ANALYSIS_DATA',
        action: 'navigate_home'
      });
      setAnalysisData({}); // Set empty object so page renders
      setLoading(false);

    } catch (err) {
      console.error('❌ Error loading analysis data:', err);
      setError(err.message);
      setLoading(false);
    }
  }, [setError, setLoading]);

  // Fetch all analysis data with loading stages tracking (FIXED: Using data layer)
  const fetchAllAnalysisData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Initialize loading stages for all analysis types
      const stages = {};
      Object.keys(analysisEndpoints).forEach(type => {
        stages[type] = 'pending';
      });
      setLoadingStages(stages);

      // Try comprehensive analysis first using data layer
      const comprehensiveResult = await ResponseDataToUIDisplayAnalyser.loadFromComprehensiveAnalysis();

      if (comprehensiveResult.success) {
        setAnalysisData(comprehensiveResult.data);

        // Mark all loaded types as completed
        // PRODUCTION: Only set status strings, never objects
        const completedStages = {};
        Object.keys(comprehensiveResult.data).forEach(type => {
          // Only set status for valid analysis endpoint keys (not data objects)
          if (analysisEndpoints[type]) {
            completedStages[type] = 'completed';
          }
        });
        setLoadingStages(prev => ({ ...prev, ...completedStages }));
      } else {

        // Fetch individual analyses using data layer
        for (const analysisType of Object.keys(analysisEndpoints)) {
          try {
            setLoadingStages(prev => ({ ...prev, [analysisType]: 'loading' }));

            const result = await ResponseDataToUIDisplayAnalyser.fetchIndividualAnalysis(analysisType);

            if (result.success) {
              setAnalysisData(prev => ({ ...prev, [analysisType]: result.data }));
              setLoadingStages(prev => ({ ...prev, [analysisType]: 'completed' }));
            } else {
              console.error(`Failed to fetch ${analysisType}:`, result.error);
              setLoadingStages(prev => ({ ...prev, [analysisType]: 'error' }));
            }
          } catch (error) {
            console.error(`Failed to fetch ${analysisType}:`, error);
            setLoadingStages(prev => ({ ...prev, [analysisType]: 'error' }));
          }
        }
      }

    } catch (error) {
      console.error('Error fetching all analysis data:', error);
      setError(error);
    } finally {
      setLoading(false);
    }
  }, [analysisEndpoints, setError, setLoading]);

    // Handle tab switching - use already loaded comprehensive data
  const handleTabChange = (tabKey) => {
    setActiveSection(tabKey);

    // Log available data for debugging
    if (analysisData[tabKey]) {
    } else {
    }
  };

  // Progressive loading with Vedic-themed spinner
  if (isLoading) {
    return (
      <div className="min-h-screen bg-vedic-bg flex items-center justify-center p-4">
        <div className="text-center">
          <VedicLoadingSpinner
            symbol="mandala"
            size="large"
            text="Calculating cosmic influences..."
          />
          <div className="mt-6 space-y-2">
            {Object.entries(loadingStages).map(([stage, status]) => {
              // PRODUCTION: Ensure status is always a string, never an object
              const statusValue = typeof status === 'string' ? status : 
                                  (typeof status === 'object' && status !== null && status.status) ? status.status :
                                  'pending';
              
              return (
                <div key={stage} className="flex items-center justify-center space-x-2">
                  <span className={`w-3 h-3 rounded-full ${
                    statusValue === 'completed' ? 'bg-success' :
                    statusValue === 'loading' ? 'bg-warning animate-pulse' :
                    statusValue === 'error' ? 'bg-error' : 'bg-neutral'
                  }`} />
                  <span className="text-sm text-muted capitalize">
                    {analysisEndpoints[stage]?.label || stage}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Error state with Vedic styling
  if (error) {
    return (
      <div className="min-h-screen bg-vedic-bg flex items-center justify-center p-4">
        <div className="card-vedic max-w-md w-full text-center">
          <ErrorMessage
            message={error.message || error}
            type="error"
            size="large"
            onRetry={() => fetchAllAnalysisData()}
          />
        </div>
      </div>
    );
  }

  // No data state
  if (!analysisData || Object.keys(analysisData).length === 0) {
    // Only show empty state if we're not loading and have actually tried to load data
    // Give loadFromComprehensiveAnalysis a chance to run first
    if (!isLoading) {
      return (
        <div className="min-h-screen bg-vedic-bg flex items-center justify-center p-4">
          <div className="card-vedic max-w-md w-full text-center">
            <div className="text-warning text-4xl mb-4">📊</div>
            <h2 className="text-xl font-bold text-primary mb-4">No Analysis Data Available</h2>
            <p className="text-muted mb-4">
              Analysis data not found. Please ensure you have generated a birth chart or comprehensive analysis first.
            </p>
            <div className="space-y-2">
              <button
                onClick={() => navigate('/comprehensive-analysis')}
                className="btn-vedic btn-primary w-full"
              >
                Generate Comprehensive Analysis
              </button>
              <button
                onClick={() => navigate('/')}
                className="btn-vedic btn-secondary w-full"
              >
                Create Birth Chart
              </button>
              <button
                onClick={() => fetchAllAnalysisData()}
                className="btn-vedic btn-outline w-full"
              >
                🔄 Reload Analysis Data
              </button>
            </div>
          </div>
        </div>
      );
    } else {
      // Still loading, show loading state
      return (
        <div className="min-h-screen bg-vedic-bg flex items-center justify-center p-4">
          <div className="text-center">
            <VedicLoadingSpinner
              symbol="mandala"
              size="large"
              text="Loading analysis data..."
            />
          </div>
        </div>
      );
    }
  }

  // Render current tab content
  const renderTabContent = () => {
    // Helper function to show no data message
    const NoDataMessage = ({ analysisType }) => (
      <div className="no-data-message text-center py-8">
        <h3 className="text-lg font-semibold text-gray-600 mb-2">
          📊 {analysisType} Analysis
        </h3>
        <p className="text-gray-500 mb-4">
          Analysis data is being loaded from the comprehensive API response...
        </p>
        <div className="text-sm text-gray-400">
          Available data: {Object.keys(analysisData).join(', ') || 'None'}
        </div>
      </div>
    );

    switch (activeSection) {
      case 'lagna':
        return analysisData.lagna ?
          <LagnaDisplay data={analysisData.lagna?.analysis || analysisData.lagna} /> :
          <NoDataMessage analysisType="Lagna" />;

      case 'houses':
        return (
          <div className="space-y-4">
            {/* House sub-tabs */}
            <div className="tabs-vedic">
              <div className="tab-list">
                {houseSubTabs.map((house) => (
                  <button
                    key={house.key}
                    onClick={() => {
                      setActiveHouse(house.number);
                    }}
                    className={`tab-vedic flex flex-col items-center gap-1 ${activeHouse === house.number ? 'active' : ''}`}
                  >
                    <span className="font-bold text-base">{house.number}</span>
                    <span className="text-xs text-center whitespace-normal">{house.description}</span>
                  </button>
                ))}
              </div>
            </div>

            {analysisData.houses ? (
              <HouseDisplay
                houseNumber={activeHouse}
                data={analysisData.houses?.analysis?.[`house${activeHouse}`] ||
                     analysisData.houses?.[`house${activeHouse}`] ||
                     analysisData.houses?.data?.[`house${activeHouse}`]}
              />
            ) : (
              <NoDataMessage analysisType="Houses" />
            )}
          </div>
        );

            case 'aspects':

        return analysisData.aspects ?
          <AspectsDisplay data={analysisData.aspects?.analysis || analysisData.aspects} /> :
          <NoDataMessage analysisType="Planetary Aspects" />;

      case 'arudha':
        return analysisData.arudha ?
          <ArudhaDisplay data={analysisData.arudha?.analysis || analysisData.arudha} /> :
          <NoDataMessage analysisType="Arudha Padas" />;

      case 'navamsa':
        return analysisData.navamsa ?
          <NavamsaDisplay data={analysisData.navamsa?.analysis || analysisData.navamsa} /> :
          <NoDataMessage analysisType="Navamsa Chart" />;

      case 'dasha':
        return analysisData.dasha ?
          <DashaDisplay data={analysisData.dasha?.analysis || analysisData.dasha} /> :
          <NoDataMessage analysisType="Dasha Periods" />;

      case 'preliminary':
        return analysisData.preliminary ?
          <PreliminaryDisplay data={analysisData.preliminary?.analysis || analysisData.preliminary} /> :
          <NoDataMessage analysisType="Preliminary" />;

      case 'comprehensive':
        return analysisData.comprehensive ?
          <ComprehensiveDisplay data={analysisData.comprehensive?.analysis || analysisData.comprehensive} /> :
          <NoDataMessage analysisType="Comprehensive" />;

      default:
        return analysisData.lagna ?
          <LagnaDisplay data={analysisData.lagna?.analysis || analysisData.lagna} /> :
          <NoDataMessage analysisType="Lagna (Default)" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sacred-white via-white to-sacred-cream bg-cosmic-pattern">
      {/* Enhanced Background Pattern */}
      <div className="fixed inset-0 opacity-5 pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23FF9933' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
      </div>

      <div className="relative z-10">
        <div className="container mx-auto px-6 py-12">
          <div className="max-w-7xl mx-auto">
            {/* Enhanced Header Section */}
            <div className="text-center mb-12 float-cosmic">
              {/* Birth Time Rectification Component */}
              <div className="mb-8">
                <BirthTimeRectification 
                  onRectificationComplete={(rectifiedData, results) => {
                    // Update analysis data if rectification was successful
                    if (rectifiedData) {
                      // Trigger re-analysis with rectified time
                      fetchAllAnalysisData();
                    }
                  }}
                  showOptional={true}
                />
              </div>
              
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-vedic-saffron to-vedic-gold rounded-full mb-6 shadow-lg animate-pulse">
                <span className="text-3xl vedic-symbol symbol-mandala text-cosmic-glow"></span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-vedic-saffron via-vedic-gold to-vedic-maroon bg-clip-text text-transparent mb-4 text-cosmic-glow">
                Comprehensive Vedic Analysis
              </h1>
              <p className="text-lg text-secondary max-w-2xl mx-auto leading-relaxed">
                Complete astrological analysis with all perspectives - Discover the cosmic influences shaping your destiny
              </p>
              
              {/* Enhanced Progress Indicator */}
              <div className="mt-8 max-w-md mx-auto">
                <div className="flex justify-between text-sm text-secondary mb-2">
                  <span>Analysis Progress</span>
                  <span>{Object.keys(analysisData).length} sections loaded</span>
                </div>
                <div className="progress-vedic-premium">
                  <div 
                    className="progress-bar-vedic-premium" 
                    style={{ width: `${(Object.keys(analysisData).length / Object.keys(analysisEndpoints).length) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Enhanced Main Tab Navigation */}
            <div className="mb-8">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gold/20 overflow-hidden">
                <div className="tabs-vedic-enhanced">
                  <div className="tab-list-enhanced">
                    {mainTabs.map((tab) => (
                      <button
                        key={tab.key}
                        onClick={(event) => {
                          event.preventDefault();
                          event.stopPropagation();
                          handleTabChange(tab.key);
                        }}
                        className={`tab-vedic-premium group ${activeSection === tab.key ? 'active' : ''}`}
                        data-tab={tab.key}
                        data-analysis-type={tab.key}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xl transition-transform group-hover:scale-110">{tab.icon}</span>
                          <span className="font-medium">{tab.label}</span>
                          {loadingStages[tab.key] && (() => {
                            // PRODUCTION: Ensure status is always a string, never an object
                            const statusValue = typeof loadingStages[tab.key] === 'string' ? loadingStages[tab.key] :
                                                (typeof loadingStages[tab.key] === 'object' && loadingStages[tab.key] !== null && loadingStages[tab.key].status) ? loadingStages[tab.key].status :
                                                'pending';
                            
                            return (
                              <span className={`badge-vedic-sm ${
                                statusValue === 'completed' ? 'badge-complete' :
                                statusValue === 'loading' ? 'badge-pending' :
                                statusValue === 'error' ? 'badge-error' : 'badge-neutral'
                              }`}>
                                {statusValue === 'loading' ? '⏳' : 
                                 statusValue === 'completed' ? '✓' : 
                                 statusValue === 'error' ? '✗' : '○'}
                              </span>
                            );
                          })()}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Tab Content Container */}
            <div className="card-cosmic-enhanced">
              <div className="p-8 md:p-12">
                {renderTabContent()}
              </div>
            </div>

            {/* Enhanced Action Buttons */}
            <div className="mt-12 flex flex-col sm:flex-row justify-center gap-6">
              <button
                onClick={() => navigate('/chart')}
                className="btn-vedic-premium group"
              >
                <span className="vedic-symbol symbol-mandala mr-2 transition-transform"></span>
                View Birth Chart
              </button>
              <button
                onClick={() => navigate('/comprehensive-analysis')}
                className="btn-vedic-premium group"
              >
                <span className="vedic-symbol symbol-chakra mr-2 group-hover:scale-110 transition-transform"></span>
                Deep Analysis Report
              </button>
              <button
                onClick={() => navigate('/birth-time-rectification')}
                className="btn-vedic-premium group bg-gradient-to-r from-saffron to-gold hover:from-saffron-light hover:to-gold-light"
              >
                <span className="mr-2">🔮</span>
                Birth Time Rectification
              </button>
              <button
                onClick={() => fetchAllAnalysisData()}
                className="btn-vedic-premium group"
              >
                <span className="vedic-symbol mr-2 transition-transform">🔄</span>
                Refresh Analysis
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Error Handling UI */}
      {error && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
          <div className="card-cosmic max-w-md w-full p-8 relative z-10">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center text-white text-2xl mb-4">
                ⚠️
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Analysis Not Available</h2>
            </div>
            
            <p className="text-white/90 text-center mb-6 leading-relaxed">
              {error.message || 'Analysis data is not available. Please generate your birth chart first by filling out the birth data form.'}
            </p>

            {error.action === 'navigate_home' && (
              <div className="space-y-4">
                <div className="bg-white/10 rounded-lg p-4 border border-white/20">
                  <p className="text-white/80 text-sm mb-3">To proceed with analysis:</p>
                  <ol className="text-white/90 text-sm space-y-2 list-decimal list-inside">
                    <li>Fill out your birth data form</li>
                    <li>Click "Generate Vedic Chart"</li>
                    <li>Return here to view your complete analysis</li>
                  </ol>
                </div>
                
                <button
                  onClick={() => navigate('/')}
                  className="btn-vedic-premium w-full"
                >
                  <span className="flex items-center justify-center space-x-2">
                    <span className="vedic-symbol symbol-om">🕉️</span>
                    <span>Go to Birth Data Form</span>
                  </span>
                </button>
              </div>
            )}

            <button
              onClick={() => {
                setError(null);
                if (error.action !== 'navigate_home') {
                  window.location.reload();
                }
              }}
              className="btn-secondary w-full mt-4"
            >
              {error.action === 'navigate_home' ? 'Dismiss' : 'Try Again'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalysisPage;
