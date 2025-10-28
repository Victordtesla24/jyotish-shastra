import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

// Import Vedic design system
import '../styles/vedic-design-system.css';

// Import UI components with Vedic design
import { VedicLoadingSpinner, ErrorMessage, Skeleton } from '../components/ui';
// Note: Progressive loading with skeleton states implemented for better UX

// Import contexts
import { useChart } from '../contexts/ChartContext';
import { useAnalysis } from '../contexts/AnalysisContext';

// Import singleton data flow components
import UIDataSaver from '../components/forms/UIDataSaver';
import ResponseDataToUIDisplayAnalyser from '../components/analysis/ResponseDataToUIDisplayAnalyser';

// ===== SPECIALIZED DISPLAY COMPONENTS (ENHANCED) =====

const LagnaDisplay = ({ data }) => {
  if (!data) return (
    <div className="card-vedic text-center">
      <div className="text-muted">🌅</div>
      <p className="text-muted">No Lagna analysis data available</p>
    </div>
  );

  const lagna = data.analysis || data.lagna || data;

  return (
    <div className="card-vedic">
      <div className="section-header-vedic">
        <h3 className="section-title-vedic">🌅 Lagna Analysis (Ascendant)</h3>
        <p className="section-subtitle-vedic">The foundation of your personality and life path</p>
      </div>

      <div className="space-vedic">
        {lagna.sign && (
          <div className="insight-card">
            <div className="insight-label">Ascendant Sign</div>
            <div className="insight-value">{lagna.sign}</div>
            {lagna.signLord && (
              <div className="insight-detail">Ruled by {lagna.signLord}</div>
            )}
            {lagna.element && (
              <div className="insight-detail">Element: {lagna.element}</div>
            )}
          </div>
        )}

        {lagna.degree && (
          <div className="insight-card">
            <div className="insight-label">Exact Degree</div>
            <div className="insight-value">{lagna.degree}</div>
            <div className="insight-detail">Precise ascendant position</div>
          </div>
        )}

        {lagna.nakshatra && (
          <div className="insight-card">
            <div className="insight-label">Nakshatra</div>
            <div className="insight-value">{lagna.nakshatra}</div>
            {lagna.nakshatraPada && (
              <div className="insight-detail">Pada: {lagna.nakshatraPada}</div>
            )}
          </div>
        )}

        {lagna.description && (
          <div className="interpretation-vedic">
            <h4 className="interpretation-title">Lagna Interpretation</h4>
            <p className="interpretation-text">{lagna.description}</p>
          </div>
        )}

        {lagna.characteristics && Array.isArray(lagna.characteristics) && (
          <div className="characteristics-vedic">
            <h4 className="characteristics-title">Key Characteristics</h4>
            <div className="characteristics-grid">
              {lagna.characteristics.map((char, index) => (
                <div key={index} className="characteristic-item">
                  <span className="characteristic-icon">✨</span>
                  <span className="characteristic-text">{char}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {lagna.strengths && Array.isArray(lagna.strengths) && (
          <div className="strengths-vedic">
            <h4 className="strengths-title">Strengths</h4>
            <div className="strength-list">
              {lagna.strengths.map((strength, index) => (
                <div key={index} className="strength-item">
                  <span className="strength-icon">💪</span>
                  <span>{typeof strength === 'object' ? JSON.stringify(strength) : strength}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {lagna.challenges && Array.isArray(lagna.challenges) && (
          <div className="challenges-vedic">
            <h4 className="challenges-title">Areas for Growth</h4>
            <div className="challenge-list">
              {lagna.challenges.map((challenge, index) => (
                <div key={index} className="challenge-item">
                  <span className="challenge-icon">⚡</span>
                  <span>{typeof challenge === 'object' ? JSON.stringify(challenge) : challenge}</span>
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
                  <span className="characteristic-text">{typeof trait === 'object' ? JSON.stringify(trait) : trait}</span>
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

        {/* Fallback display for any data we receive */}
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
  console.log('🔗 AspectsDisplay received data:', data);
  console.log('🔗 AspectsDisplay data type:', typeof data);
  console.log('🔗 AspectsDisplay data keys:', data ? Object.keys(data) : 'null');

  if (!data) {
    console.log('🔗 AspectsDisplay: No data provided');
    return (
      <div className="card-vedic text-center">
        <div className="text-muted">🔗</div>
        <p className="text-muted">No planetary aspects data available</p>
      </div>
    );
  }

  // Handle the actual API data structure
  const aspects = data.aspects || data.analysis || data;
  console.log('🔗 AspectsDisplay aspects object:', aspects);
  console.log('🔗 AspectsDisplay aspects keys:', aspects ? Object.keys(aspects) : 'null');

  const allAspects = aspects.allAspects || aspects.majorAspects || [];
  const patterns = aspects.patterns || [];
  const yogas = aspects.yogas || [];

  console.log('🔗 AspectsDisplay extracted data:', {
    allAspectsLength: allAspects.length,
    patternsLength: patterns.length,
    yogasLength: yogas.length,
    allAspects,
    patterns,
    yogas
  });

  // Categorize aspects by nature
  const beneficAspects = allAspects.filter(aspect => aspect.nature === 'benefic');
  const maleficAspects = allAspects.filter(aspect => aspect.nature === 'malefic');
  const majorAspects = allAspects.slice(0, 10); // Show first 10 as major aspects

  return (
    <div className="card-vedic">
      <div className="section-header-vedic">
        <h3 className="section-title-vedic">🔗 Planetary Aspects</h3>
        <p className="section-subtitle-vedic">Cosmic relationships influencing your life</p>
      </div>

      <div className="space-vedic">
        {/* All Aspects Overview */}
        {allAspects.length > 0 && (
          <div className="aspects-section">
            <h4 className="aspects-title">Planetary Aspects Overview</h4>
            <div className="aspects-stats">
              <div className="stat-item">
                <span className="stat-number">{allAspects.length}</span>
                <span className="stat-label">Total Aspects</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{beneficAspects.length}</span>
                <span className="stat-label">Benefic Aspects</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{maleficAspects.length}</span>
                <span className="stat-label">Challenging Aspects</span>
              </div>
            </div>
          </div>
        )}

        {/* Major Aspects */}
        {majorAspects.length > 0 && (
          <div className="aspects-section">
            <h4 className="aspects-title">Major Aspects</h4>
            <div className="aspects-grid">
              {majorAspects.map((aspect, index) => (
                <div key={index} className="aspect-card">
                  <div className="aspect-header">
                    <span className="aspect-planets">
                      {aspect.source} → {aspect.target?.planet || aspect.to}
                    </span>
                    <span className={`aspect-type ${aspect.nature?.toLowerCase()}`}>
                      {aspect.type}
                    </span>
                  </div>
                  <div className="aspect-details">
                    <div className="aspect-strength">Strength: {aspect.strength}/10</div>
                    {aspect.houseDistance && (
                      <div className="aspect-distance">House Distance: {aspect.houseDistance}</div>
                    )}
                  </div>
                  {aspect.description && (
                    <div className="aspect-description">{aspect.description}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Benefic Aspects */}
        {beneficAspects.length > 0 && (
          <div className="aspects-section">
            <h4 className="aspects-title positive">✨ Beneficial Aspects</h4>
            <div className="aspects-list positive">
              {beneficAspects.map((aspect, index) => (
                <div key={index} className="aspect-item positive">
                  <span className="aspect-icon">🌟</span>
                  <span className="aspect-detail">
                    {aspect.source} {aspect.type} aspect to {aspect.target?.planet || aspect.to}
                  </span>
                  <span className="aspect-strength">Strength: {aspect.strength}/10</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Challenging Aspects */}
        {maleficAspects.length > 0 && (
          <div className="aspects-section">
            <h4 className="aspects-title challenging">⚡ Challenging Aspects</h4>
            <div className="aspects-list challenging">
              {maleficAspects.map((aspect, index) => (
                <div key={index} className="aspect-item challenging">
                  <span className="aspect-icon">⚠️</span>
                  <span className="aspect-detail">
                    {aspect.source} {aspect.type} aspect to {aspect.target?.planet || aspect.to}
                  </span>
                  <span className="aspect-strength">Strength: {aspect.strength}/10</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Patterns */}
        {patterns.length > 0 && (
          <div className="patterns-section">
            <h4 className="patterns-title">🔄 Aspect Patterns</h4>
            <div className="patterns-grid">
              {patterns.map((pattern, index) => (
                <div key={index} className="pattern-card">
                  <div className="pattern-name">{pattern.name || pattern.type}</div>
                  <div className="pattern-description">{pattern.description}</div>
                  {pattern.planets && (
                    <div className="pattern-planets">Planets: {pattern.planets.join(', ')}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Yogas */}
        {yogas.length > 0 && (
          <div className="yogas-vedic">
            <h4 className="yogas-title">🕉️ Planetary Yogas</h4>
            <div className="yogas-grid">
              {yogas.map((yoga, index) => (
                <div key={index} className="yoga-card">
                  <div className="yoga-name">{yoga.name}</div>
                  {yoga.planets && (
                    <div className="yoga-planets">{yoga.planets.join(', ')}</div>
                  )}
                  <div className="yoga-effect">{yoga.effect || yoga.description}</div>
                  {yoga.strength && (
                    <div className="yoga-strength">Strength: {yoga.strength}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Fallback if no data found */}
        {allAspects.length === 0 && patterns.length === 0 && yogas.length === 0 && (
          <div className="text-center text-muted">
            <p>Planetary aspects analysis will be available once comprehensive data is loaded.</p>
            <pre className="text-xs mt-2 bg-gray-100 p-2 rounded">
              Data structure: {JSON.stringify(Object.keys(aspects), null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

const ArudhaDisplay = ({ data }) => {
  if (!data) return (
    <div className="card-vedic text-center">
      <div className="text-muted">🎯</div>
      <p className="text-muted">No Arudha Padas data available</p>
    </div>
  );

  // Handle the actual API data structure
  const arudha = data.arudha || data.analysis || data;
  const arudhaLagna = arudha.arudhaLagna || {};
  const arudhaPadas = arudha.arudhaPadas || {};
  const imageStability = arudha.imageStability || {};
  const publicImageFactors = arudha.publicImageFactors || [];
  const recommendations = arudha.recommendations || [];
  const reputationCycles = arudha.reputationCycles || [];

  return (
    <div className="card-vedic">
      <div className="section-header-vedic">
        <h3 className="section-title-vedic">🎯 Arudha Padas Analysis</h3>
        <p className="section-subtitle-vedic">Public image, perception, and social reputation</p>
      </div>

      <div className="space-vedic">
        {/* Arudha Lagna */}
        {arudhaLagna.lagnaSign && (
          <div className="arudha-lagna-section">
            <h4 className="section-title">🌟 Arudha Lagna (Public Image)</h4>
            <div className="insight-cards-grid">
              <div className="insight-card primary">
                <div className="insight-label">Arudha Lagna Sign</div>
                <div className="insight-value">{arudhaLagna.lagnaSign}</div>
                <div className="insight-detail">How the world perceives you</div>
              </div>

              {arudhaLagna.lagnaLord && (
                <div className="insight-card">
                  <div className="insight-label">Arudha Lagna Lord</div>
                  <div className="insight-value">{arudhaLagna.lagnaLord}</div>
                  <div className="insight-detail">Ruler of your public image</div>
                </div>
              )}

              {arudhaLagna.lagnaLordPosition?.sign && (
                <div className="insight-card">
                  <div className="insight-label">AL Lord Position</div>
                  <div className="insight-value">
                    {arudhaLagna.lagnaLordPosition.sign} (House {arudhaLagna.lagnaLordPosition.house})
                  </div>
                  <div className="insight-detail">Image stability factor</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Arudha Padas */}
        {Object.keys(arudhaPadas).length > 0 && (
          <div className="arudha-padas-section">
            <h4 className="section-title">🏠 Arudha Padas (House Perceptions)</h4>
            <div className="padas-grid">
              {Object.entries(arudhaPadas).map(([house, pada]) => (
                <div key={house} className="pada-item">
                  <div className="pada-house">A{house}</div>
                  <div className="pada-sign">
                    {typeof pada === 'object' ? (pada.sign || JSON.stringify(pada)) : pada}
                  </div>
                  <div className="pada-meaning">
                    {house === '1' && 'Self-image'}
                    {house === '2' && 'Wealth image'}
                    {house === '4' && 'Home image'}
                    {house === '5' && 'Creative image'}
                    {house === '7' && 'Partnership image'}
                    {house === '10' && 'Career image'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Image Stability */}
        {Object.keys(imageStability).length > 0 && (
          <div className="image-stability-section">
            <h4 className="section-title">⚖️ Image Stability Analysis</h4>
            <div className="stability-metrics">
              {imageStability.stabilityScore && (
                <div className="metric-item">
                  <div className="metric-label">Stability Score</div>
                  <div className="metric-value">{imageStability.stabilityScore}/10</div>
                </div>
              )}
              {imageStability.stabilityFactors && Array.isArray(imageStability.stabilityFactors) && (
                <div className="stability-factors">
                  <h5>Stability Factors:</h5>
                  <ul>
                    {imageStability.stabilityFactors.map((factor, index) => (
                      <li key={index}>{typeof factor === 'object' ? JSON.stringify(factor) : factor}</li>
                    ))}
                  </ul>
                </div>
              )}
              {imageStability.volatilityFactors && Array.isArray(imageStability.volatilityFactors) && (
                <div className="volatility-factors">
                  <h5>Volatility Factors:</h5>
                  <ul>
                    {imageStability.volatilityFactors.map((factor, index) => (
                      <li key={index}>{typeof factor === 'object' ? JSON.stringify(factor) : factor}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Public Image Factors */}
        {publicImageFactors.length > 0 && (
          <div className="public-image-section">
            <h4 className="section-title">👥 Public Image Factors</h4>
            <div className="image-factors-grid">
              {publicImageFactors.map((factor, index) => (
                <div key={index} className="factor-card">
                  <div className="factor-title">
                    {typeof factor === 'object' ? (factor.type || factor.name || 'Factor') : factor}
                  </div>
                  <div className="factor-description">
                    {typeof factor === 'object' ? (factor.description || '') : ''}
                  </div>
                  {factor.influence && (
                    <div className="factor-influence">Influence: {factor.influence}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reputation Cycles */}
        {reputationCycles.length > 0 && (
          <div className="reputation-cycles-section">
            <h4 className="section-title">🔄 Reputation Cycles</h4>
            <div className="cycles-timeline">
              {reputationCycles.map((cycle, index) => (
                <div key={index} className="cycle-item">
                  <div className="cycle-period">
                    {typeof cycle === 'object' ? (cycle.period || cycle.phase || 'Period') : cycle}
                  </div>
                  <div className="cycle-description">
                    {typeof cycle === 'object' ? (cycle.description || '') : ''}
                  </div>
                  {cycle.characteristics && Array.isArray(cycle.characteristics) && (
                    <div className="cycle-characteristics">
                      {cycle.characteristics.map((char, i) => (
                        <span key={i} className="cycle-trait">
                          {typeof char === 'object' ? JSON.stringify(char) : char}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <div className="recommendations-section">
            <h4 className="section-title">💡 Image Enhancement Recommendations</h4>
            <div className="recommendations-list">
              {recommendations.map((rec, index) => (
                <div key={index} className="recommendation-item">
                  <span className="rec-icon">✨</span>
                  <span className="rec-text">
                    {typeof rec === 'object' ? (rec.text || JSON.stringify(rec)) : rec}
                  </span>
                  {rec.category && (
                    <span className="rec-category">{rec.category}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Fallback for debugging */}
        {!arudhaLagna.lagnaSign && Object.keys(arudhaPadas).length === 0 && (
          <div className="text-center text-muted">
            <p>Arudha analysis will be available once comprehensive data is loaded.</p>
            <pre className="text-xs mt-2 bg-gray-100 p-2 rounded">
              Available data: {JSON.stringify(Object.keys(arudha), null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

const NavamsaDisplay = ({ data }) => {
  if (!data) return (
    <div className="card-vedic text-center">
      <div className="text-muted">🔄</div>
      <p className="text-muted">No Navamsa chart data available</p>
    </div>
  );

  // Handle the actual API data structure
  const navamsa = data.navamsa || data.analysis || data;
  const chartInfo = navamsa.chartInfo || {};
  const navamsaLagna = navamsa.navamsaLagna || {};
  const marriageIndications = navamsa.marriageIndications || {};
  const spiritualIndications = navamsa.spiritualIndications || {};
  const planetaryStrengths = navamsa.planetaryStrengths || {};
  const planetaryAnalysis = navamsa.planetaryAnalysis || {};
  const vargottamaPlanets = navamsa.vargottamaPlanets || [];
  const yogaFormations = navamsa.yogaFormations || [];
  const overallAnalysis = navamsa.overallAnalysis || {};

  return (
    <div className="card-vedic">
      <div className="section-header-vedic">
        <h3 className="section-title-vedic">🔄 Navamsa Chart (D9) Analysis</h3>
        <p className="section-subtitle-vedic">Marriage, spirituality, inner strength, and soul purpose</p>
      </div>

      <div className="space-vedic">
        {/* Chart Info */}
        {chartInfo.description && (
          <div className="chart-info-section">
            <h4 className="section-title">📊 Chart Information</h4>
            <p className="chart-description">{chartInfo.description}</p>
            {chartInfo.significance && (
              <div className="chart-significance">
                <strong>Significance:</strong> {chartInfo.significance}
              </div>
            )}
          </div>
        )}

        {/* Navamsa Lagna */}
        {navamsaLagna.sign && (
          <div className="navamsa-lagna-section">
            <h4 className="section-title">🌟 Navamsa Lagna</h4>
            <div className="insight-cards-grid">
              <div className="insight-card primary">
                <div className="insight-label">Navamsa Lagna Sign</div>
                <div className="insight-value">{navamsaLagna.sign}</div>
                <div className="insight-detail">Your inner spiritual nature</div>
              </div>

              {navamsaLagna.lord && (
                <div className="insight-card">
                  <div className="insight-label">Navamsa Lagna Lord</div>
                  <div className="insight-value">{navamsaLagna.lord}</div>
                  <div className="insight-detail">Ruler of inner self</div>
                </div>
              )}
            </div>

            {navamsaLagna.characteristics && (
              <div className="lagna-characteristics">
                <h5>Spiritual Characteristics:</h5>
                <ul>
                  {navamsaLagna.characteristics.map((char, index) => (
                    <li key={index}>{char}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Vargottama Planets */}
        {vargottamaPlanets.length > 0 && (
          <div className="vargottama-section">
            <h4 className="section-title">⭐ Vargottama Planets</h4>
            <p className="section-subtitle">Planets in same sign in both D1 and D9 charts</p>
            <div className="vargottama-grid">
              {vargottamaPlanets.map((planet, index) => (
                <div key={index} className="vargottama-item">
                  <div className="planet-name">{planet.planet || planet}</div>
                  <div className="vargottama-sign">{planet.sign}</div>
                  <div className="vargottama-effect">Enhanced strength and stability</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Planetary Strengths */}
        {Object.keys(planetaryStrengths).length > 0 && (
          <div className="planetary-strengths-section">
            <h4 className="section-title">💪 Planetary Strengths in D9</h4>
            <div className="planet-strengths-grid">
              {Object.entries(planetaryStrengths).map(([planet, strength]) => {
                // Handle both numeric strength values and strength objects
                const strengthValue = typeof strength === 'object' ?
                  (strength.totalStrength || strength.grade || strength.value || 0) :
                  strength;
                const strengthDisplay = typeof strengthValue === 'string' ?
                  strengthValue :
                  `${strengthValue}`;

                return (
                  <div key={planet} className="planet-strength-item">
                    <span className="planet-name">{planet}</span>
                    <div className="strength-details">
                      {typeof strength === 'object' ? (
                        <>
                          {strength.totalStrength && (
                            <div className="strength-metric">
                              <span className="metric-label">Strength:</span>
                              <span className="metric-value">{strength.totalStrength}/10</span>
                              <div className="strength-bar">
                                <div
                                  className="strength-fill"
                                  style={{ width: `${(strength.totalStrength / 10) * 100}%` }}
                                ></div>
                              </div>
                            </div>
                          )}
                          {strength.dignity && (
                            <div className="dignity-info">
                              <span className="dignity-label">Dignity:</span>
                              <span className="dignity-value">{strength.dignity}</span>
                            </div>
                          )}
                          {strength.housePosition && (
                            <div className="house-info">
                              <span className="house-label">House:</span>
                              <span className="house-value">{strength.housePosition}</span>
                            </div>
                          )}
                          {strength.grade && (
                            <div className="grade-info">
                              <span className="grade-label">Grade:</span>
                              <span className="grade-value">{strength.grade}</span>
                            </div>
                          )}
                          {strength.effects && Array.isArray(strength.effects) && (
                            <div className="effects-list">
                              <span className="effects-label">Effects:</span>
                              <ul>
                                {strength.effects.map((effect, idx) => (
                                  <li key={idx}>{effect}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="strength-bar">
                          <div
                            className="strength-fill"
                            style={{ width: `${Math.min((strengthValue / 10) * 100, 100)}%` }}
                          ></div>
                          <span className="strength-value">{strengthDisplay}/10</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Marriage Indications */}
        {Object.keys(marriageIndications).length > 0 && (
          <div className="marriage-section">
            <h4 className="section-title">💒 Marriage & Partnership Analysis</h4>

            {marriageIndications.marriageProspects && (
              <div className="marriage-prospects">
                <h5>Marriage Prospects:</h5>
                <p>{marriageIndications.marriageProspects}</p>
              </div>
            )}

            {marriageIndications.spouseCharacteristics && (
              <div className="spouse-characteristics">
                <h5>Spouse Characteristics:</h5>
                <ul>
                  {marriageIndications.spouseCharacteristics.map((char, index) => (
                    <li key={index}>{char}</li>
                  ))}
                </ul>
              </div>
            )}

            {marriageIndications.marriageTiming && (
              <div className="marriage-timing">
                <h5>Marriage Timing Indications:</h5>
                <p>{marriageIndications.marriageTiming}</p>
              </div>
            )}

            {marriageIndications.relationshipHarmony && (
              <div className="relationship-harmony">
                <h5>Relationship Harmony:</h5>
                <p>{marriageIndications.relationshipHarmony}</p>
              </div>
            )}
          </div>
        )}

        {/* Spiritual Indications */}
        {Object.keys(spiritualIndications).length > 0 && (
          <div className="spiritual-section">
            <h4 className="section-title">🕉️ Spiritual Indications</h4>

            {spiritualIndications.spiritualInclination && (
              <div className="spiritual-inclination">
                <h5>Spiritual Inclination:</h5>
                <p>{spiritualIndications.spiritualInclination}</p>
              </div>
            )}

            {spiritualIndications.dharmaPath && (
              <div className="dharma-path">
                <h5>Dharma Path:</h5>
                <p>{spiritualIndications.dharmaPath}</p>
              </div>
            )}

            {spiritualIndications.spiritualPractices && (
              <div className="spiritual-practices">
                <h5>Recommended Spiritual Practices:</h5>
                <ul>
                  {spiritualIndications.spiritualPractices.map((practice, index) => (
                    <li key={index}>{practice}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Yoga Formations */}
        {yogaFormations.length > 0 && (
          <div className="yoga-formations-section">
            <h4 className="section-title">🧘 Yoga Formations in D9</h4>
            <div className="yogas-grid">
              {yogaFormations.map((yoga, index) => (
                <div key={index} className="yoga-card">
                  <div className="yoga-name">{yoga.name}</div>
                  <div className="yoga-description">{yoga.description}</div>
                  {yoga.planets && (
                    <div className="yoga-planets">Planets: {yoga.planets.join(', ')}</div>
                  )}
                  {yoga.effects && (
                    <div className="yoga-effects">Effects: {yoga.effects}</div>
                  )}
                  {yoga.strength && (
                    <div className="yoga-strength">Strength: {yoga.strength}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Overall Analysis */}
        {overallAnalysis.summary && (
          <div className="overall-analysis-section">
            <h4 className="section-title">📋 Overall Navamsa Analysis</h4>
            <p className="analysis-summary">{overallAnalysis.summary}</p>

            {overallAnalysis.strengths && (
              <div className="analysis-strengths">
                <h5>Strengths:</h5>
                <ul>
                  {overallAnalysis.strengths.map((strength, index) => (
                    <li key={index}>{strength}</li>
                  ))}
                </ul>
              </div>
            )}

            {overallAnalysis.challenges && (
              <div className="analysis-challenges">
                <h5>Challenges:</h5>
                <ul>
                  {overallAnalysis.challenges.map((challenge, index) => (
                    <li key={index}>{challenge}</li>
                  ))}
                </ul>
              </div>
            )}

            {overallAnalysis.recommendations && (
              <div className="analysis-recommendations">
                <h5>Recommendations:</h5>
                <ul>
                  {overallAnalysis.recommendations.map((rec, index) => (
                    <li key={index}>{rec}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Fallback for debugging */}
        {!navamsaLagna.sign && Object.keys(marriageIndications).length === 0 && (
          <div className="text-center text-muted">
            <p>Navamsa analysis will be available once comprehensive data is loaded.</p>
            <pre className="text-xs mt-2 bg-gray-100 p-2 rounded">
              Available data: {JSON.stringify(Object.keys(navamsa), null, 2)}
            </pre>
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

        {/* Fallback for debugging */}
        {!currentDasha.planet && antardashas.length === 0 && timeline.length === 0 && (
          <div className="text-center text-muted">
            <p>Dasha analysis will be available once comprehensive data is loaded.</p>
            <pre className="text-xs mt-2 bg-gray-100 p-2 rounded">
              Available data: {JSON.stringify(Object.keys(dasha), null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

const PreliminaryDisplay = ({ data }) => {
  if (!data) return (
    <div className="card-vedic text-center">
      <div className="text-muted">📋</div>
      <p className="text-muted">No preliminary analysis data available</p>
    </div>
  );

  const preliminary = data.analysis || data.preliminary || data;

  return (
    <div className="card-vedic">
      <div className="section-header-vedic">
        <h3 className="section-title-vedic">📋 Preliminary Analysis</h3>
        <p className="section-subtitle-vedic">Initial chart assessment and overview</p>
      </div>

      <div className="space-vedic">
        {preliminary.summary && (
          <div className="summary-vedic">
            <h4 className="summary-title">Chart Overview</h4>
            <p className="summary-text">{preliminary.summary}</p>
          </div>
        )}

        {preliminary.keyPlacements && Array.isArray(preliminary.keyPlacements) && (
          <div className="placements-vedic">
            <h4 className="placements-title">🪐 Key Planetary Placements</h4>
            <div className="placements-grid">
              {preliminary.keyPlacements.map((placement, index) => (
                <div key={index} className="placement-item">
                  <span className="placement-planet">{placement.planet}</span>
                  <span className="placement-sign">{placement.sign}</span>
                  <span className="placement-house">House {placement.house}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {preliminary.strengths && Array.isArray(preliminary.strengths) && (
          <div className="chart-strengths-vedic">
            <h4 className="strengths-title">💪 Chart Strengths</h4>
            <div className="strengths-list">
              {preliminary.strengths.map((strength, index) => (
                <div key={index} className="strength-item">
                  <span className="strength-icon">✨</span>
                  <span>{typeof strength === 'object' ? JSON.stringify(strength) : strength}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {preliminary.challenges && Array.isArray(preliminary.challenges) && (
          <div className="chart-challenges-vedic">
            <h4 className="challenges-title">⚡ Areas for Growth</h4>
            <div className="challenges-list">
              {preliminary.challenges.map((challenge, index) => (
                <div key={index} className="challenge-item">
                  <span className="challenge-icon">⚠️</span>
                  <span>{typeof challenge === 'object' ? JSON.stringify(challenge) : challenge}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {preliminary.recommendations && Array.isArray(preliminary.recommendations) && (
          <div className="recommendations-vedic">
            <h4 className="recommendations-title">🎯 Initial Recommendations</h4>
            <div className="recommendations-list">
              {preliminary.recommendations.map((rec, index) => (
                <div key={index} className="recommendation-item">
                  <span className="recommendation-icon">💡</span>
                  <span>{typeof rec === 'object' ? JSON.stringify(rec) : rec}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Handle status object properly */}
        {preliminary.status && typeof preliminary.status === 'object' && (
          <div className="status-section-vedic">
            <h4 className="status-title">📊 Analysis Status</h4>
            <div className="status-grid">
              {Object.entries(preliminary.status).map(([key, value]) => (
                <div key={key} className="status-item">
                  <div className="status-label">{key}</div>
                  <div className="status-value">
                    {typeof value === 'boolean' ? (value ? '✅' : '❌') :
                     typeof value === 'object' ? JSON.stringify(value) : value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const ComprehensiveDisplay = ({ data }) => {
  if (!data) return (
    <div className="card-vedic text-center">
      <div className="text-muted">📊</div>
      <p className="text-muted">No comprehensive analysis data available</p>
    </div>
  );

  const comprehensive = data.analysis || data.comprehensive || data;

  return (
    <div className="card-vedic">
      <div className="section-header-vedic">
        <h3 className="section-title-vedic">📊 Comprehensive Analysis</h3>
        <p className="section-subtitle-vedic">Complete 8-section astrological assessment</p>
      </div>

      <div className="space-vedic">
        {comprehensive.sections && typeof comprehensive.sections === 'object' && (
          <div className="sections-overview-vedic">
            <h4 className="sections-title">Analysis Sections Overview</h4>
            <div className="sections-grid">
              {Object.entries(comprehensive.sections).map(([sectionKey, section]) => (
                <div key={sectionKey} className="section-summary-card">
                  <div className="section-name">{section.name || sectionKey}</div>
                  <div className="section-status">
                    {section.questions?.length > 0 && (
                      <span className="section-metric">{section.questions.length} insights</span>
                    )}
                    {section.analyses && Object.keys(section.analyses).length > 0 && (
                      <span className="section-metric">{Object.keys(section.analyses).length} analyses</span>
                    )}
                  </div>
                  {section.summary && (
                    <div className="section-preview">{section.summary}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {comprehensive.overallTheme && (
          <div className="theme-vedic">
            <h4 className="theme-title">🌟 Life Theme</h4>
            <p className="theme-text">{comprehensive.overallTheme}</p>
          </div>
        )}

        {comprehensive.keyInsights && Array.isArray(comprehensive.keyInsights) && (
          <div className="insights-vedic">
            <h4 className="insights-title">🔑 Key Insights</h4>
            <div className="insights-list">
              {comprehensive.keyInsights.map((insight, index) => (
                <div key={index} className="insight-item">
                  <span className="insight-icon">💎</span>
                  <span>{insight}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {comprehensive.lifeAreas && typeof comprehensive.lifeAreas === 'object' && (
          <div className="life-areas-vedic">
            <h4 className="life-areas-title">🏗️ Life Areas Assessment</h4>
            <div className="life-areas-grid">
              {Object.entries(comprehensive.lifeAreas).map(([area, assessment]) => (
                <div key={area} className="life-area-card">
                  <div className="area-name">{area}</div>
                  <div className="area-rating" data-rating={assessment.rating}>
                    {assessment.rating}/10
                  </div>
                  <div className="area-summary">{assessment.summary}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="comprehensive-action">
          <p className="action-text">
            For detailed section-by-section analysis, visit the
            <strong> 8-Section Comprehensive Analysis</strong> page.
          </p>
            </div>
      </div>
        </div>
      );
};

// ===== MAIN COMPONENT =====

const AnalysisPage = () => {
  const navigate = useNavigate();
  const { currentChart } = useChart();
  const {
    currentAnalysis,
    setCurrentAnalysis,
    isLoading,
    error,
    setLoading,
    setError,
    activeSection,
    setActiveSection,
    setSectionData
  } = useAnalysis();

  const [analysisData, setAnalysisData] = useState({});
  const [activeHouse, setActiveHouse] = useState(1);
  const [loadingStages, setLoadingStages] = useState({});

  // Load analysis data on component mount using the data layer
  useEffect(() => {
    const initializeDataLoading = async () => {
      console.log('🎯 AnalysisPage: Initializing data loading...');

      // Ensure activeSection is set to lagna as default if not already set
      if (!activeSection) {
        console.log('🔧 AnalysisPage: Setting activeSection to lagna (was:', activeSection, ')');
        setActiveSection('lagna');
      }

      try {
        setLoading(true);
        setError(null);

        // Use the data layer to load comprehensive analysis
        const result = await ResponseDataToUIDisplayAnalyser.loadFromComprehensiveAnalysis();

                if (result.success) {
          console.log('✅ AnalysisPage: Data loaded successfully from', result.source);
          console.log('📊 AnalysisPage: Available data sections:', Object.keys(result.data));
          console.log('🔍 AnalysisPage: Data structure preview:', {
            hasLagna: !!result.data.lagna,
            hasHouses: !!result.data.houses,
            hasAspects: !!result.data.aspects,
            dataKeys: Object.keys(result.data)
          });

          setAnalysisData(result.data);

          // Verify state update worked
          setTimeout(() => {
            console.log('🔍 AnalysisPage: State updated - analysisData keys:', Object.keys(result.data));
          }, 100);
        } else {
          console.error('❌ AnalysisPage: Failed to load data:', result.error);
          setError(result.error);
        }
      } catch (error) {
        console.error('❌ AnalysisPage: Error during initialization:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    initializeDataLoading();
  }, []); // Empty dependency array for mount-only execution

  // Define all analysis endpoints
  const analysisEndpoints = useMemo(() => ({
    lagna: { url: '/api/v1/chart/analysis/lagna', label: 'Lagna Analysis', icon: '🌅' },
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
  const fetchIndividualAnalysis = useCallback(async (analysisType) => {
    try {
      setLoading(true);
      setError(null);

      // 1. Check cached data first (following ComprehensiveAnalysisPage pattern)
      const cachedData = UIDataSaver.getIndividualAnalysis(analysisType);

      if (cachedData && cachedData.analysis) {
        console.log(`✅ Using cached ${analysisType} analysis from UIDataSaver`);
        const processedData = ResponseDataToUIDisplayAnalyser[`process${analysisType.charAt(0).toUpperCase() + analysisType.slice(1)}Analysis`]?.(cachedData) ||
                             ResponseDataToUIDisplayAnalyser.processGenericAnalysis(cachedData, analysisType);

        setAnalysisData(prev => ({ ...prev, [analysisType]: processedData }));
        setLoading(false);
        return;
      }

      // 2. Get birth data validation (following ComprehensiveAnalysisPage pattern)
      const birthData = UIDataSaver.getBirthData();
      if (!birthData) {
        console.error('❌ No birth data found, redirecting to home');
        navigate('/');
        return;
      }

      console.log(`🔄 Fetching ${analysisType} analysis from API...`);

      // 3. Call individual analysis API
      const endpointUrl = analysisEndpoints[analysisType]?.url;
      if (!endpointUrl) {
        throw new Error(`No endpoint defined for ${analysisType}`);
      }

      const response = await fetch(endpointUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(birthData)
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      const apiData = await response.json();
      console.log(`✅ ${analysisType} analysis API response received`);

      // 4. Process data with ResponseDataToUIDisplayAnalyser
      const processMethod = `process${analysisType.charAt(0).toUpperCase() + analysisType.slice(1)}Analysis`;
      const processedData = ResponseDataToUIDisplayAnalyser[processMethod]?.(apiData) ||
                           ResponseDataToUIDisplayAnalyser.processGenericAnalysis(apiData, analysisType);

      if (!processedData) {
        throw new Error(`Failed to process ${analysisType} API response`);
      }

      // 5. Save to UIDataSaver using new API pattern
      UIDataSaver.saveApiAnalysisResponse(analysisType, apiData);
      console.log(`💾 ${analysisType} analysis saved to UIDataSaver`);

      setAnalysisData(prev => ({ ...prev, [analysisType]: processedData }));

    } catch (err) {
      console.error(`❌ Error fetching ${analysisType} analysis:`, err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [navigate, analysisEndpoints]);

  // Load comprehensive analysis and extract individual sections
  const loadFromComprehensiveAnalysis = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔄 Loading analysis data for ALL endpoints...');

      // 1. Try to get comprehensive analysis data first
      const comprehensiveData = UIDataSaver.getComprehensiveAnalysis();
      console.log('🔍 Comprehensive data check:', {
        hasData: !!comprehensiveData,
        hasSections: !!comprehensiveData?.sections,
        keys: comprehensiveData ? Object.keys(comprehensiveData) : [],
        sectionKeys: comprehensiveData?.sections ? Object.keys(comprehensiveData.sections) : []
      });

      if (comprehensiveData && comprehensiveData.sections) {
        console.log('✅ Using comprehensive analysis data for individual sections');

        // Extract individual analysis types from comprehensive sections
        const extractedData = {};

        // SECTION 1: Birth Data Collection and Chart Casting
        if (comprehensiveData.sections.section1) {
          extractedData.preliminary = {
            analysis: comprehensiveData.sections.section1,
            success: true
          };
          console.log('✅ Extracted preliminary data from section1');
        }

        // SECTION 2: Preliminary Chart Analysis: Lagna, Luminaries, and Overall Patterns
        if (comprehensiveData.sections.section2) {
          // Extract lagna from section2.analyses.lagna and format it properly
          if (comprehensiveData.sections.section2.analyses?.lagna) {
            const rawLagnaData = comprehensiveData.sections.section2.analyses.lagna;

            // Transform the data structure to match what LagnaDisplay expects
            const formattedLagnaData = {
              analysis: {
                sign: rawLagnaData.lagnaSign?.sign,
                signLord: rawLagnaData.lagnaSign?.ruler,
                element: rawLagnaData.lagnaSign?.element,
                characteristics: rawLagnaData.lagnaSign?.characteristics,
                degree: rawLagnaData.lagnaLord?.currentPosition?.degree,
                nakshatra: rawLagnaData.lagnaLord?.currentPosition?.nakshatra,
                // Include the full raw data for comprehensive access
                fullData: rawLagnaData
              },
              success: true
            };

            extractedData.lagna = formattedLagnaData;
            console.log('✅ Extracted lagna data from section2');
          } else {
            // Fallback to entire section2 if specific lagna data not found
            extractedData.lagna = { analysis: comprehensiveData.sections.section2, success: true };
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
            console.log('✅ Extracted houses data from section3:', Object.keys(rawHousesData));
          } else {
            // Fallback to entire section3 if specific houses data not found
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
          console.log('✅ Extracted aspects data from section4');
        }

        // SECTION 5: Arudha Lagna Analysis (Perception & Public Image)
        if (comprehensiveData.sections.section5) {
          // Extract arudha from section5.arudhaAnalysis
          const arudhaData = {
            analysis: comprehensiveData.sections.section5.arudhaAnalysis || comprehensiveData.sections.section5,
            success: true
          };
          extractedData.arudha = arudhaData;
          console.log('✅ Extracted arudha data from section5');
        }

        // SECTION 6: Navamsa Chart Analysis (D9) - Soul and Marriage
        if (comprehensiveData.sections.section6) {
          // Extract navamsa from section6.navamsaAnalysis
          const navamsaData = {
            analysis: comprehensiveData.sections.section6.navamsaAnalysis || comprehensiveData.sections.section6,
            success: true
          };
          extractedData.navamsa = navamsaData;
          console.log('✅ Extracted navamsa data from section6');
        }

        // SECTION 7: Dasha Analysis: Timeline of Life Events
        if (comprehensiveData.sections.section7) {
          // Extract dasha from section7.dashaAnalysis
          const dashaData = {
            analysis: comprehensiveData.sections.section7.dashaAnalysis || comprehensiveData.sections.section7,
            success: true
          };
          extractedData.dasha = dashaData;
          console.log('✅ Extracted dasha data from section7');
        }

        // SECTION 8: Synthesis: From Analysis to Comprehensive Report
        if (comprehensiveData.sections.section8) {
          // Extract comprehensive synthesis
          const comprehensiveAnalysisData = {
            analysis: comprehensiveData.sections.section8,
            success: true
          };
          extractedData.comprehensive = comprehensiveAnalysisData;
          console.log('✅ Extracted comprehensive data from section8');
        }

        setAnalysisData(extractedData);
        console.log('📊 Analysis data loaded from comprehensive analysis:', Object.keys(extractedData));
        setLoading(false);
        return;
      }

      // 2. Try to get individual analysis data from UIDataSaver for ALL endpoints
      console.log('🔍 Checking for individual analysis data for ALL endpoints...');
      const individualData = {};
      const analysisTypes = ['lagna', 'houses', 'aspects', 'arudha', 'navamsa', 'dasha', 'preliminary', 'comprehensive'];

      // Load ALL available analysis types in parallel
      const loadPromises = analysisTypes.map(async (type) => {
        try {
          const data = UIDataSaver.getIndividualAnalysis(type);
          if (data && (data.analysis || data.success)) {
            individualData[type] = data;
            console.log(`✅ Found ${type} analysis data from UIDataSaver`);
            return { type, data, success: true };
          } else {
            console.log(`⚠️ No ${type} analysis data found in UIDataSaver`);
            return { type, data: null, success: false };
          }
        } catch (error) {
          console.log(`⚠️ Could not load ${type} analysis:`, error.message);
          return { type, data: null, success: false, error: error.message };
        }
      });

      await Promise.all(loadPromises);

      // 3. If we have individual data, use it
      if (Object.keys(individualData).length > 0) {
        setAnalysisData(individualData);
        console.log('📊 Analysis data loaded from individual sources:', Object.keys(individualData));
        setLoading(false);
        return;
      }

      // 4. Try to get data from session storage directly as fallback for ALL endpoints
      console.log('🔍 Checking session storage directly for ALL endpoints...');
      try {
        const sessionKeys = Object.keys(sessionStorage);
        const analysisDataFromSession = {};

        console.log('📝 All sessionStorage keys:', sessionKeys);

        sessionKeys.forEach(key => {
          if (key.includes('jyotish_api_analysis_')) {
            try {
              const data = JSON.parse(sessionStorage.getItem(key));
              if (data && (data.analysis || data.success)) {
                // Extract analysis type from key: jyotish_api_analysis_TYPE_timestamp
                const keyParts = key.split('_');
                const analysisType = keyParts[3]; // Position after jyotish_api_analysis_

                if (analysisType && ['lagna', 'houses', 'aspects', 'arudha', 'navamsa', 'dasha', 'preliminary', 'comprehensive'].includes(analysisType)) {
                  console.log(`✅ Found ${analysisType} analysis in session storage:`, key);
                  analysisDataFromSession[analysisType] = data;
                } else if (key.includes('_comprehensive_')) {
                  // Handle comprehensive analysis specially
                  if (data.analysis?.sections) {
                    console.log('✅ Found comprehensive data in session storage');
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
              console.log(`⚠️ Error parsing session data for ${key}:`, err.message);
            }
          }
        });

        if (Object.keys(analysisDataFromSession).length > 0) {
          setAnalysisData(analysisDataFromSession);
          console.log('📊 Analysis data loaded from session storage:', Object.keys(analysisDataFromSession));
          setLoading(false);
          return;
        }
      } catch (err) {
        console.log('⚠️ Error reading session storage:', err.message);
      }

      // 5. Fallback: show empty state but don't redirect
      console.log('❌ No analysis data found for any endpoints, showing empty state');
      setAnalysisData({}); // Set empty object so page renders
      setLoading(false);

    } catch (err) {
      console.error('❌ Error loading analysis data:', err);
      setError(err.message);
      setLoading(false);
    }
  }, [navigate]);

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
        console.log('✅ Comprehensive data loaded from', comprehensiveResult.source);
        setAnalysisData(comprehensiveResult.data);

        // Mark all loaded types as completed
        const completedStages = {};
        Object.keys(comprehensiveResult.data).forEach(type => {
          completedStages[type] = 'completed';
        });
        setLoadingStages(prev => ({ ...prev, ...completedStages }));
      } else {
        console.log('No comprehensive data found, fetching individual analyses...');

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
  }, [analysisEndpoints]);

    // Handle tab switching - use already loaded comprehensive data
  const handleTabChange = (tabKey) => {
    console.log(`🔄 AnalysisPage: Switching to ${tabKey} tab`);
    setActiveSection(tabKey);

    // Log available data for debugging
    if (analysisData[tabKey]) {
      console.log(`✅ AnalysisPage: ${tabKey} data is available`);
    } else {
      console.log(`⚠️ AnalysisPage: ${tabKey} data not found. Available data:`, Object.keys(analysisData));
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
            {Object.entries(loadingStages).map(([stage, status]) => (
              <div key={stage} className="flex items-center justify-center space-x-2">
                <span className={`w-3 h-3 rounded-full ${
                  status === 'completed' ? 'bg-success' :
                  status === 'loading' ? 'bg-warning animate-pulse' :
                  status === 'error' ? 'bg-error' : 'bg-neutral'
                }`} />
                <span className="text-sm text-muted capitalize">
                  {analysisEndpoints[stage]?.label || stage}
                </span>
              </div>
            ))}
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
    console.log(`🎯 AnalysisPage: renderTabContent called for activeSection: ${activeSection}`);
    console.log(`🎯 AnalysisPage: analysisData keys:`, Object.keys(analysisData));
    console.log(`🎯 AnalysisPage: Rendering content for ${activeSection}`, {
      hasData: !!analysisData[activeSection],
      dataStructure: analysisData[activeSection] ? Object.keys(analysisData[activeSection]) : null
    });

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
                      console.log(`🏠 AnalysisPage: Switching to house ${house.number}`);
                      setActiveHouse(house.number);
                    }}
                    className={`tab-vedic ${activeHouse === house.number ? 'active' : ''}`}
                  >
                    <span>{house.number}</span>
                    <span className="text-xs">{house.description}</span>
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
        console.log('🔗 renderTabContent: aspects case triggered');
        console.log('🔗 renderTabContent: analysisData.aspects exists?', !!analysisData.aspects);
        console.log('🔗 renderTabContent: analysisData.aspects structure:', analysisData.aspects);
        console.log('🔗 renderTabContent: data being passed to AspectsDisplay:', analysisData.aspects?.analysis || analysisData.aspects);

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
    <div className="min-h-screen bg-vedic-bg">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header with Vedic styling */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-primary mb-2">
              📊 Comprehensive Vedic Analysis
            </h1>
            <p className="text-muted">
              Complete astrological analysis with all perspectives
            </p>
          </div>

          {/* Main Tab Navigation with Vedic design */}
          <div className="mb-6">
            <div className="tabs-vedic">
              <div className="tab-list">
                {mainTabs.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      handleTabChange(tab.key);
                    }}
                    className={`tab-vedic ${activeSection === tab.key ? 'active' : ''}`}
                    data-tab={tab.key}
                    data-analysis-type={tab.key}
                  >
                    <span>{tab.icon}</span>
                    <span>{tab.label}</span>
                    {/* Assuming loadingStages is defined elsewhere or will be added */}
                    {/* {loadingStages[tab.key] && (
                      <span className={`badge-vedic ${
                        loadingStages[tab.key] === 'completed' ? 'badge-success' :
                        loadingStages[tab.key] === 'loading' ? 'badge-warning' :
                        loadingStages[tab.key] === 'error' ? 'badge-error' : 'badge-neutral'
                      }`}>
                        {loadingStages[tab.key]}
                      </span>
                    )} */}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Tab Content */}
          <div className="space-y-6">
            {renderTabContent()}
          </div>

          {/* Action Buttons with Vedic styling */}
          <div className="mt-8 flex justify-center space-x-4">
            <button
              onClick={() => navigate('/chart')}
              className="btn-vedic btn-secondary"
            >
              View Chart
            </button>
            <button
              onClick={() => navigate('/comprehensive-analysis')}
              className="btn-vedic btn-primary"
            >
              8-Section Analysis
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisPage;
