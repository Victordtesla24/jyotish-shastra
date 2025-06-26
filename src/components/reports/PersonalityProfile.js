/**
 * Personality Profile Component
 * Based on the 12-Step Guide to Vedic Horoscope Interpretation
 * Section A: Personality and Character Profile
 */

import React, { useState } from 'react';
import './PersonalityProfile.css';

const PersonalityProfile = ({ analysisData }) => {
  const [expandedSections, setExpandedSections] = useState({
    corePersonality: true,
    lagnaAnalysis: false,
    moonAnalysis: false,
    sunAnalysis: false,
    arudhaAnalysis: false,
    integratedProfile: false
  });

  if (!analysisData) {
    return (
      <div className="personality-profile">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading personality analysis...</p>
        </div>
      </div>
    );
  }

  const {
    lagnaAnalysis,
    moonAnalysis,
    sunAnalysis,
    arudhaAnalysis,
    integratedProfile,
    personalityTraits,
    strengthsWeaknesses,
    recommendations
  } = analysisData;

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const renderPersonalityTraits = (traits) => {
    if (!traits || traits.length === 0) return null;

    return (
      <div className="personality-traits">
        {traits.map((trait, index) => (
          <div key={index} className="trait-item">
            <span className="trait-icon">•</span>
            <span className="trait-text">{trait}</span>
          </div>
        ))}
      </div>
    );
  };

  const renderStrengthsWeaknesses = (data) => {
    if (!data) return null;

    return (
      <div className="strengths-weaknesses">
        <div className="strengths-section">
          <h4>Strengths</h4>
          <div className="strength-items">
            {data.strengths?.map((strength, index) => (
              <div key={index} className="strength-item">
                <span className="strength-icon">✓</span>
                <span>{strength}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="weaknesses-section">
          <h4>Areas for Growth</h4>
          <div className="weakness-items">
            {data.weaknesses?.map((weakness, index) => (
              <div key={index} className="weakness-item">
                <span className="weakness-icon">⚠</span>
                <span>{weakness}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderLagnaAnalysis = () => {
    if (!lagnaAnalysis) return null;

    return (
      <div className="analysis-section">
        <div className="section-header" onClick={() => toggleSection('lagnaAnalysis')}>
          <h3>Ascendant (Lagna) Analysis</h3>
          <span className={`expand-icon ${expandedSections.lagnaAnalysis ? 'expanded' : ''}`}>
            ▼
          </span>
        </div>

        {expandedSections.lagnaAnalysis && (
          <div className="section-content">
            <div className="lagna-overview">
              <div className="lagna-info">
                <span className="label">Lagna Sign:</span>
                <span className="value">{lagnaAnalysis.sign}</span>
              </div>
              <div className="lagna-info">
                <span className="label">Lagna Lord:</span>
                <span className="value">{lagnaAnalysis.lord}</span>
              </div>
              <div className="lagna-info">
                <span className="label">Strength:</span>
                <span className={`value strength-${lagnaAnalysis.strength?.grade?.toLowerCase()}`}>
                  {lagnaAnalysis.strength?.grade} ({lagnaAnalysis.strength?.score}/100)
                </span>
              </div>
            </div>

            <div className="lagna-description">
              <h4>Core Personality Traits</h4>
              <p>{lagnaAnalysis.description}</p>
            </div>

            {lagnaAnalysis.traits && (
              <div className="lagna-traits">
                <h4>Lagna-Based Characteristics</h4>
                {renderPersonalityTraits(lagnaAnalysis.traits)}
              </div>
            )}

            {lagnaAnalysis.lordPlacement && (
              <div className="lord-placement">
                <h4>Lagna Lord Placement Effects</h4>
                <p>{lagnaAnalysis.lordPlacement.description}</p>
                <div className="placement-effects">
                  {lagnaAnalysis.lordPlacement.effects?.map((effect, index) => (
                    <div key={index} className="effect-item">
                      <span className="effect-icon">→</span>
                      <span>{effect}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderMoonAnalysis = () => {
    if (!moonAnalysis) return null;

    return (
      <div className="analysis-section">
        <div className="section-header" onClick={() => toggleSection('moonAnalysis')}>
          <h3>Moon (Mind & Emotions) Analysis</h3>
          <span className={`expand-icon ${expandedSections.moonAnalysis ? 'expanded' : ''}`}>
            ▼
          </span>
        </div>

        {expandedSections.moonAnalysis && (
          <div className="section-content">
            <div className="moon-overview">
              <div className="moon-info">
                <span className="label">Moon Sign:</span>
                <span className="value">{moonAnalysis.sign}</span>
              </div>
              <div className="moon-info">
                <span className="label">House Position:</span>
                <span className="value">{moonAnalysis.house}th House</span>
              </div>
              <div className="moon-info">
                <span className="label">Nakshatra:</span>
                <span className="value">{moonAnalysis.nakshatra}</span>
              </div>
              <div className="moon-info">
                <span className="label">Emotional Strength:</span>
                <span className={`value strength-${moonAnalysis.strength?.grade?.toLowerCase()}`}>
                  {moonAnalysis.strength?.grade}
                </span>
              </div>
            </div>

            <div className="moon-description">
              <h4>Mental & Emotional Nature</h4>
              <p>{moonAnalysis.description}</p>
            </div>

            {moonAnalysis.emotionalPatterns && (
              <div className="emotional-patterns">
                <h4>Emotional Patterns</h4>
                {renderPersonalityTraits(moonAnalysis.emotionalPatterns)}
              </div>
            )}

            {moonAnalysis.mentalCharacteristics && (
              <div className="mental-characteristics">
                <h4>Mental Characteristics</h4>
                {renderPersonalityTraits(moonAnalysis.mentalCharacteristics)}
              </div>
            )}

            {moonAnalysis.compatibility && (
              <div className="emotional-compatibility">
                <h4>Emotional Compatibility Factors</h4>
                <p>{moonAnalysis.compatibility.description}</p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderSunAnalysis = () => {
    if (!sunAnalysis) return null;

    return (
      <div className="analysis-section">
        <div className="section-header" onClick={() => toggleSection('sunAnalysis')}>
          <h3>Sun (Soul & Purpose) Analysis</h3>
          <span className={`expand-icon ${expandedSections.sunAnalysis ? 'expanded' : ''}`}>
            ▼
          </span>
        </div>

        {expandedSections.sunAnalysis && (
          <div className="section-content">
            <div className="sun-overview">
              <div className="sun-info">
                <span className="label">Sun Sign:</span>
                <span className="value">{sunAnalysis.sign}</span>
              </div>
              <div className="sun-info">
                <span className="label">House Position:</span>
                <span className="value">{sunAnalysis.house}th House</span>
              </div>
              <div className="sun-info">
                <span className="label">Soul Strength:</span>
                <span className={`value strength-${sunAnalysis.strength?.grade?.toLowerCase()}`}>
                  {sunAnalysis.strength?.grade}
                </span>
              </div>
            </div>

            <div className="sun-description">
              <h4>Core Identity & Life Purpose</h4>
              <p>{sunAnalysis.description}</p>
            </div>

            {sunAnalysis.egoCharacteristics && (
              <div className="ego-characteristics">
                <h4>Ego & Self-Expression</h4>
                {renderPersonalityTraits(sunAnalysis.egoCharacteristics)}
              </div>
            )}

            {sunAnalysis.lifePurpose && (
              <div className="life-purpose">
                <h4>Life Purpose Indicators</h4>
                {renderPersonalityTraits(sunAnalysis.lifePurpose)}
              </div>
            )}

            {sunAnalysis.leadership && (
              <div className="leadership-qualities">
                <h4>Leadership & Authority</h4>
                <p>{sunAnalysis.leadership.description}</p>
                <div className="leadership-traits">
                  {sunAnalysis.leadership.traits?.map((trait, index) => (
                    <span key={index} className="leadership-trait">{trait}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderArudhaAnalysis = () => {
    if (!arudhaAnalysis) return null;

    return (
      <div className="analysis-section">
        <div className="section-header" onClick={() => toggleSection('arudhaAnalysis')}>
          <h3>Arudha Lagna (Public Image) Analysis</h3>
          <span className={`expand-icon ${expandedSections.arudhaAnalysis ? 'expanded' : ''}`}>
            ▼
          </span>
        </div>

        {expandedSections.arudhaAnalysis && (
          <div className="section-content">
            <div className="arudha-overview">
              <div className="arudha-info">
                <span className="label">Arudha Lagna:</span>
                <span className="value">{arudhaAnalysis.sign}</span>
              </div>
              <div className="arudha-info">
                <span className="label">Image Strength:</span>
                <span className={`value strength-${arudhaAnalysis.strength?.grade?.toLowerCase()}`}>
                  {arudhaAnalysis.strength?.grade}
                </span>
              </div>
            </div>

            <div className="arudha-description">
              <h4>Public Perception & Image</h4>
              <p>{arudhaAnalysis.description}</p>
            </div>

            {arudhaAnalysis.publicImage && (
              <div className="public-image">
                <h4>How Others See You</h4>
                {renderPersonalityTraits(arudhaAnalysis.publicImage)}
              </div>
            )}

            {arudhaAnalysis.imageVsReality && (
              <div className="image-vs-reality">
                <h4>Image vs Reality</h4>
                <div className="comparison">
                  <div className="reality-side">
                    <h5>True Self (Lagna)</h5>
                    <p>{arudhaAnalysis.imageVsReality.reality}</p>
                  </div>
                  <div className="image-side">
                    <h5>Public Image (Arudha)</h5>
                    <p>{arudhaAnalysis.imageVsReality.image}</p>
                  </div>
                </div>
                <div className="alignment-note">
                  <span className="alignment-icon">⚖</span>
                  <span>{arudhaAnalysis.imageVsReality.alignment}</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderIntegratedProfile = () => {
    if (!integratedProfile) return null;

    return (
      <div className="analysis-section">
        <div className="section-header" onClick={() => toggleSection('integratedProfile')}>
          <h3>Integrated Personality Profile</h3>
          <span className={`expand-icon ${expandedSections.integratedProfile ? 'expanded' : ''}`}>
            ▼
          </span>
        </div>

        {expandedSections.integratedProfile && (
          <div className="section-content">
            <div className="integrated-summary">
              <h4>Complete Personality Portrait</h4>
              <p className="integration-description">{integratedProfile.summary}</p>
            </div>

            <div className="personality-layers">
              <div className="layer body-layer">
                <h5>Body/Physical (Lagna)</h5>
                <p>{integratedProfile.layers?.body}</p>
              </div>
              <div className="layer mind-layer">
                <h5>Mind/Emotions (Moon)</h5>
                <p>{integratedProfile.layers?.mind}</p>
              </div>
              <div className="layer soul-layer">
                <h5>Soul/Purpose (Sun)</h5>
                <p>{integratedProfile.layers?.soul}</p>
              </div>
              <div className="layer image-layer">
                <h5>Public Image (Arudha)</h5>
                <p>{integratedProfile.layers?.image}</p>
              </div>
            </div>

            {renderStrengthsWeaknesses(integratedProfile.strengthsWeaknesses)}

            {integratedProfile.evolutionPath && (
              <div className="evolution-path">
                <h4>Personal Evolution Path</h4>
                <p>{integratedProfile.evolutionPath.description}</p>
                <div className="evolution-stages">
                  {integratedProfile.evolutionPath.stages?.map((stage, index) => (
                    <div key={index} className="evolution-stage">
                      <span className="stage-number">{index + 1}</span>
                      <span className="stage-description">{stage}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderRecommendations = () => {
    if (!recommendations || recommendations.length === 0) return null;

    return (
      <div className="recommendations-section">
        <h3>Personality Development Recommendations</h3>
        <div className="recommendations-grid">
          {recommendations.map((rec, index) => (
            <div key={index} className="recommendation-card">
              <div className="rec-icon">
                {rec.type === 'gemstone' && '💎'}
                {rec.type === 'mantra' && '🕉'}
                {rec.type === 'lifestyle' && '🌱'}
                {rec.type === 'spiritual' && '🙏'}
                {rec.type === 'general' && '💡'}
              </div>
              <div className="rec-content">
                <h4>{rec.title}</h4>
                <p>{rec.description}</p>
                {rec.details && (
                  <div className="rec-details">
                    {rec.details.map((detail, idx) => (
                      <span key={idx} className="detail-item">{detail}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="personality-profile">
      <div className="profile-header">
        <h2>Personality & Character Profile</h2>
        <p className="profile-subtitle">
          A comprehensive analysis combining Lagna, Moon, Sun, and Arudha Lagna insights
        </p>
      </div>

      <div className="profile-content">
        {/* Core Personality Overview */}
        <div className="analysis-section core-personality">
          <div className="section-header" onClick={() => toggleSection('corePersonality')}>
            <h3>Core Personality Overview</h3>
            <span className={`expand-icon ${expandedSections.corePersonality ? 'expanded' : ''}`}>
              ▼
            </span>
          </div>

          {expandedSections.corePersonality && (
            <div className="section-content">
              {personalityTraits && (
                <div className="core-traits">
                  <h4>Key Personality Traits</h4>
                  {renderPersonalityTraits(personalityTraits)}
                </div>
              )}

              {strengthsWeaknesses && renderStrengthsWeaknesses(strengthsWeaknesses)}
            </div>
          )}
        </div>

        {/* Detailed Analysis Sections */}
        {renderLagnaAnalysis()}
        {renderMoonAnalysis()}
        {renderSunAnalysis()}
        {renderArudhaAnalysis()}
        {renderIntegratedProfile()}

        {/* Recommendations */}
        {renderRecommendations()}
      </div>
    </div>
  );
};

export default PersonalityProfile;
