import React, { useState } from 'react';

const ComprehensiveAnalysisDisplay = ({ data }) => {
  const { rasiChart, dashaInfo, analysis, birthData: processedBirthData } = data;
  const [activeTab, setActiveTab] = useState('personality');

  return (
    <div className="chart-display comprehensive">
      <h1>Comprehensive Vedic Astrology Report for {processedBirthData.name}</h1>

      {/* Navigation Tabs */}
      <nav className="report-navigation">
        <button
          className={`tab ${activeTab === 'personality' ? 'active' : ''}`}
          data-target="personality"
          onClick={() => setActiveTab('personality')}
        >
          Personality
        </button>
        <button
          className={`tab ${activeTab === 'career' ? 'active' : ''}`}
          data-target="career"
          onClick={() => setActiveTab('career')}
        >
          Career
        </button>
        <button
          className={`tab ${activeTab === 'relationships' ? 'active' : ''}`}
          data-target="relationships"
          onClick={() => setActiveTab('relationships')}
        >
          Relationships
        </button>
        <button
          className={`tab ${activeTab === 'timeline' ? 'active' : ''}`}
          data-target="timeline"
          onClick={() => setActiveTab('timeline')}
        >
          Timeline
        </button>
      </nav>

      {/* Birth Information */}
      <div className="birth-info">
        <h3>Birth Details</h3>
        <p><strong>Name:</strong> {processedBirthData.name}</p>
        <p><strong>Date:</strong> {processedBirthData.dateOfBirth}</p>
        <p><strong>Time:</strong> {processedBirthData.timeOfBirth}</p>
        <p><strong>Place:</strong> {processedBirthData.geocodingInfo?.formattedAddress || processedBirthData.placeOfBirth}</p>
        {processedBirthData.geocodingInfo && (
          <p><strong>Coordinates:</strong> {processedBirthData.latitude}, {processedBirthData.longitude} (via {processedBirthData.geocodingInfo.service})</p>
        )}
      </div>

      {/* Chart Details */}
      <div className="chart-info">
        <h3>Chart Details</h3>
        <p><strong>Ascendant:</strong> {rasiChart.ascendant.sign} ({rasiChart.ascendant.degree.toFixed(2)}°)</p>
        <p><strong>Nakshatra:</strong> {rasiChart.nakshatra.name} (Pada {rasiChart.nakshatra.pada})</p>
        <p><strong>Current Dasha:</strong> {dashaInfo.currentDasha.dasha} ({dashaInfo.currentDasha.remainingYears.toFixed(1)} years remaining)</p>
      </div>

      {/* Planetary Positions */}
      <div className="planetary-positions">
        <h3>Planetary Positions</h3>
        <div className="planets-grid">
          {Object.entries(rasiChart.planetaryPositions).map(([planet, position]) => (
            <div key={planet} className="planet-card">
              <h4>{planet.charAt(0).toUpperCase() + planet.slice(1)}</h4>
              <p><strong>Sign:</strong> {position.sign}</p>
              <p><strong>Degree:</strong> {position.degree.toFixed(2)}°</p>
              <p><strong>Dignity:</strong> {position.dignity}</p>
              {position.isRetrograde && <p className="retrograde">Retrograde</p>}
              {position.isCombust && <p className="combust">Combust</p>}
            </div>
          ))}
        </div>
      </div>

      {/* Comprehensive Analysis */}
      <div className="comprehensive-analysis">
        <h3>Comprehensive Analysis</h3>

        {/* Personality Analysis */}
        <div id="personality-profile" className={`analysis-section ${activeTab === 'personality' ? 'active' : 'hidden'}`}>
          <h4>Personality Analysis</h4>
          <div className="content">
            <p><strong>Lagna Sign:</strong> {analysis.personality.lagnaSign} (Aries Lagna)</p>
            <p><strong>Moon Sign:</strong> {analysis.personality.moonSign}</p>
            <p><strong>Sun Sign:</strong> {analysis.personality.sunSign}</p>
            <div className="traits">
              <strong>Key Traits:</strong>
              <ul>
                {analysis.personality.keyTraits.map((trait, index) => (
                  <li key={index}>{trait}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Career Analysis */}
        <div id="career-analysis" className={`analysis-section ${activeTab === 'career' ? 'active' : 'hidden'}`}>
          <h4>Career Analysis</h4>
          <div className="content">
            <p><strong>10th house:</strong> The house of career and profession</p>
            <p><strong>Timing:</strong> {analysis.career.timing}</p>
            <div className="professions">
              <strong>Suitable Professions:</strong>
              <ul>
                {analysis.career.suitableProfessions.map((profession, index) => (
                  <li key={index}>{profession}</li>
                ))}
              </ul>
            </div>
            <div className="strengths">
              <strong>Career Strengths:</strong>
              <ul>
                {analysis.career.careerStrengths.map((strength, index) => (
                  <li key={index}>{strength}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Health Analysis */}
        <div className="analysis-section">
          <h4>Health Analysis</h4>
          <p><strong>General Health:</strong> {analysis.health.generalHealth}</p>
          <div className="recommendations">
            <strong>Recommendations:</strong>
            <ul>
              {analysis.health.recommendations.map((rec, index) => (
                <li key={index}>{rec}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Financial Analysis */}
        <div className="analysis-section">
          <h4>Financial Analysis</h4>
          <p><strong>Wealth Indicators:</strong> {analysis.finances.wealthIndicators}</p>
          <p><strong>Financial Timing:</strong> {analysis.finances.financialTiming}</p>
          <div className="income-sources">
            <strong>Income Sources:</strong>
            <ul>
              {analysis.finances.incomeSources.map((source, index) => (
                <li key={index}>{source}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Relationship Analysis */}
        <div id="relationship-analysis" className={`analysis-section ${activeTab === 'relationships' ? 'active' : 'hidden'}`}>
          <h4>Relationship Analysis</h4>
          <div className="content">
            <p><strong>7th house:</strong> The house of marriage and partnerships</p>
            <p><strong>Marriage Indications:</strong> {analysis.relationships.marriageIndications}</p>
            <p><strong>Partner Characteristics:</strong> {analysis.relationships.partnerCharacteristics}</p>
            <p><strong>Timing:</strong> {analysis.relationships.timing}</p>
          </div>
        </div>

        {/* Timeline Analysis */}
        <div id="timeline-analysis" className={`analysis-section ${activeTab === 'timeline' ? 'active' : 'hidden'}`}>
          <h4>Dasha Timeline</h4>
          <div className="content">
            <p><strong>Current Dasha:</strong> {dashaInfo.currentDasha.dasha}</p>
            <p><strong>Remaining:</strong> {dashaInfo.currentDasha.remainingYears.toFixed(1)} years</p>
            <div className="dasha-periods">
              <h5>Major Dasha Periods</h5>
              <div className="dasha-period">Sun Dasha: 6 years</div>
              <div className="dasha-period">Moon Dasha: 10 years</div>
              <div className="dasha-period">Mars Dasha: 7 years</div>
              <div className="dasha-period">Rahu Dasha: 18 years</div>
              <div className="dasha-period">Jupiter Dasha: 16 years</div>
              <div className="dasha-period">Saturn Dasha: 19 years</div>
              <div className="dasha-period">Mercury Dasha: 17 years</div>
              <div className="dasha-period">Ketu Dasha: 7 years</div>
              <div className="dasha-period">Venus Dasha: 20 years</div>
            </div>
          </div>
        </div>

        {/* Hidden Spiritual Analysis for internal use */}
        <div className="analysis-section hidden">
          <h4>Spiritual Analysis</h4>
          <p><strong>Spiritual Indicators:</strong> {analysis.spirituality.spiritualIndicators}</p>
          <p><strong>Spiritual Path:</strong> {analysis.spirituality.spiritualPath}</p>
        </div>
      </div>
    </div>
  );
};

export default ComprehensiveAnalysisDisplay;
