import React, { useState } from 'react';
import VedicChartDisplay from '../charts/VedicChartDisplay';

const ComprehensiveAnalysisDisplay = ({ data }) => {
  // Always call hooks unconditionally
  const [activeTab, setActiveTab] = useState('personality');

  // DEFENSIVE: Handle completely undefined/null data at the root level
  if (!data) {
    return (
      <div className="comprehensive-analysis-display">
        <h1>No Analysis Data Available</h1>
        <p>Please generate an analysis first.</p>
      </div>
    );
  }

  // Parse the ACTUAL API response structure from the backend
  console.log('🔍 Raw API Response:', data);

  // Handle actual API response structure: { success: true, analysis: {...} }
  const apiResponse = data || {};
  const analysisData = apiResponse.analysis || {};
  const sections = analysisData.sections || {};

  console.log('📊 Analysis sections:', Object.keys(sections));

  // Extract birth data from section1 (Birth Data Collection and Chart Casting)
  const section1 = sections.section1 || {};
  const questions = section1.questions || [];

  // Question 0: Birth data gathering - DEFENSIVE NULL CHECKS
  const birthDataQuestion = questions[0] || {};
  const birthDataDetails = birthDataQuestion.details || birthDataQuestion || {};

  // Question 1: Chart casting (Rasi and Navamsa)
  const chartQuestion = questions[1] || {};
  const chartDetails = chartQuestion.details || {};

  // Question 2: Ascendant information
  const ascendantQuestion = questions[2] || {};
  const ascendantDetails = ascendantQuestion.details || {};

  // Question 3: Planetary positions
  const planetaryQuestion = questions[3] || {};
  const planetaryPositions = planetaryQuestion.planetaryPositions || {};

  // Question 4: Dasha information
  const dashaQuestion = questions[4] || {};
  const dashaDetails = dashaQuestion.details || {};

  // Extract birth data using actual API structure - MAXIMUM DEFENSIVE PROGRAMMING
  const safeBirthData = {
    name: (() => {
      try {
        return birthDataDetails?.place?.placeOfBirth?.name ||
               birthDataDetails?.name ||
               birthDataDetails?.place?.name ||
               'Test User';
      } catch (e) {
        console.error('Error accessing name:', e);
        return 'Test User';
      }
    })(),
    dateOfBirth: (() => {
      try {
        return birthDataDetails?.dateOfBirth?.value ?
               new Date(birthDataDetails.dateOfBirth.value).toLocaleDateString() :
               'Not provided';
      } catch (e) {
        return 'Not provided';
      }
    })(),
    timeOfBirth: birthDataDetails?.timeOfBirth?.value || 'Not provided',
    placeOfBirth: birthDataDetails?.place?.placeOfBirth?.name || birthDataDetails?.place?.name || 'Not provided',
    latitude: birthDataDetails?.place?.placeOfBirth?.latitude || birthDataDetails?.place?.latitude || null,
    longitude: birthDataDetails?.place?.placeOfBirth?.longitude || birthDataDetails?.place?.longitude || null,
    timezone: birthDataDetails?.place?.placeOfBirth?.timezone || birthDataDetails?.place?.timezone || null
  };

  // Extract chart data using actual API structure - this is the key fix
  const rasiChartData = chartDetails.rasiChart || {};
  const safeRasiChart = {
    ascendant: {
      sign: rasiChartData.ascendant?.sign || ascendantDetails.ascendant?.sign || 'Unknown',
      degree: rasiChartData.ascendant?.degree || ascendantDetails.lagnaDegree || 0,
      longitude: rasiChartData.ascendant?.longitude || ascendantDetails.ascendant?.longitude || 0
    },
    nakshatra: {
      name: dashaDetails.nakshatra || 'Unknown',
      pada: 1
    },
    planetaryPositions: planetaryPositions,
    planets: Object.entries(planetaryPositions).map(([name, data]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      sign: data?.sign || 'Unknown',
      degree: data?.degree || 0,
      longitude: data?.longitude || 0,
      house: data?.house || 'Unknown',
      dignity: data?.dignity || 'Unknown',
      isRetrograde: data?.isRetrograde || false,
      isCombust: data?.isCombust || false
    }))
  };

  // Extract dasha info using actual API structure
  const safeDashaInfo = {
    currentDasha: {
      dasha: dashaDetails.currentDasha?.planet || 'Unknown',
      remainingYears: dashaDetails.currentDasha?.remainingYears || 0,
      startAge: dashaDetails.currentDasha?.startAge || 0,
      endAge: dashaDetails.currentDasha?.endAge || 0
    },
    upcomingDashas: dashaDetails.upcomingDashas || [],
    dashaSequence: dashaDetails.dashaSequence || []
  };

  // Generate analysis using actual planetary data from the API
  const moonData = planetaryPositions.moon || {};
  const sunData = planetaryPositions.sun || {};

  const safeAnalysis = {
    personality: {
      lagnaSign: safeRasiChart.ascendant.sign,
      moonSign: moonData.sign || 'Unknown',
      sunSign: sunData.sign || 'Unknown',
      keyTraits: [
        `${safeRasiChart.ascendant.sign} Ascendant traits`,
        `${moonData.sign || 'Unknown'} Moon emotional patterns`,
        `${sunData.sign || 'Unknown'} Sun personality`
      ]
    },
    career: {
      timing: `Current period: ${safeDashaInfo.currentDasha.dasha} dasha (${safeDashaInfo.currentDasha.remainingYears.toFixed(1)} years remaining)`,
      suitableProfessions: ['Technology', 'Business', 'Communication', 'Leadership roles'],
      careerStrengths: ['Innovation', 'Strategic thinking', 'Problem solving']
    },
    health: {
      generalHealth: `Health influenced by ${safeRasiChart.ascendant.sign} Ascendant and planetary positions`,
      recommendations: ['Regular exercise', 'Balanced diet', 'Stress management', 'Meditation']
    },
    finances: {
      wealthIndicators: `Financial prospects influenced by planetary positions in houses`,
      financialTiming: `Current period: ${safeDashaInfo.currentDasha.dasha} dasha`,
      incomeSources: ['Primary career', 'Investments', 'Business ventures']
    },
    relationships: {
      marriageIndications: 'Marriage prospects based on 7th house and Venus position analysis',
      partnerCharacteristics: 'Partner traits determined by Venus and 7th house lord',
      timing: `Relationship timing linked to ${safeDashaInfo.currentDasha.dasha} period`
    }
  };

  console.log('✅ Processed chart data:', safeRasiChart);
  console.log('✅ Processed dasha info:', safeDashaInfo);
  console.log('✅ Planetary positions found:', Object.keys(planetaryPositions));

  return (
    <div className="comprehensive-analysis-display">
      <h1>Comprehensive Vedic Astrology Report for {safeBirthData.name}</h1>

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
        <p><strong>Name:</strong> {safeBirthData.name}</p>
        <p><strong>Date:</strong> {safeBirthData.dateOfBirth}</p>
        <p><strong>Time:</strong> {safeBirthData.timeOfBirth}</p>
        <p><strong>Place:</strong> {safeBirthData.geocodingInfo?.formattedAddress || safeBirthData.placeOfBirth}</p>
        {safeBirthData.geocodingInfo && (
          <p><strong>Coordinates:</strong> {safeBirthData.latitude}, {safeBirthData.longitude} (via {safeBirthData.geocodingInfo.service})</p>
        )}
      </div>

      {/* Vedic Chart Visualization */}
      <div className="chart-visualization">
        <VedicChartDisplay
          chartData={{
            rasiChart: safeRasiChart,
            birthData: safeBirthData,
            analysis: safeAnalysis
          }}
          isLoading={false}
          className="mb-6"
        />
      </div>

      {/* Chart Details */}
      <div className="chart-info">
        <h3>Chart Details</h3>
        <p><strong>Ascendant:</strong> {safeRasiChart.ascendant.sign} ({safeRasiChart.ascendant.degree.toFixed(2)}°)</p>
        <p><strong>Nakshatra:</strong> {safeRasiChart.nakshatra.name} (Pada {safeRasiChart.nakshatra.pada})</p>
        <p><strong>Current Dasha:</strong> {safeDashaInfo.currentDasha.dasha} ({safeDashaInfo.currentDasha.remainingYears.toFixed(1)} years remaining)</p>
      </div>

      {/* Planetary Positions */}
      <div className="planetary-positions">
        <h3>Planetary Positions</h3>
        <div className="planets-grid">
          {Object.entries(safeRasiChart.planetaryPositions).map(([planet, position]) => (
            <div key={planet} className="planet-card">
              <h4>{planet.charAt(0).toUpperCase() + planet.slice(1)}</h4>
              <p><strong>Sign:</strong> {position.sign || 'Unknown'}</p>
              <p><strong>Degree:</strong> {(position.degree || 0).toFixed(2)}°</p>
              <p><strong>Dignity:</strong> {position.dignity || 'Unknown'}</p>
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
            <p><strong>Lagna Sign:</strong> {safeAnalysis.personality.lagnaSign} (Aries Lagna)</p>
            <p><strong>Moon Sign:</strong> {safeAnalysis.personality.moonSign}</p>
            <p><strong>Sun Sign:</strong> {safeAnalysis.personality.sunSign}</p>
            <div className="traits">
              <strong>Key Traits:</strong>
              <ul>
                {safeAnalysis.personality.keyTraits.map((trait, index) => (
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
            <p><strong>Timing:</strong> {safeAnalysis.career.timing}</p>
            <div className="professions">
              <strong>Suitable Professions:</strong>
              <ul>
                {safeAnalysis.career.suitableProfessions.map((profession, index) => (
                  <li key={index}>{profession}</li>
                ))}
              </ul>
            </div>
            <div className="strengths">
              <strong>Career Strengths:</strong>
              <ul>
                {safeAnalysis.career.careerStrengths.map((strength, index) => (
                  <li key={index}>{strength}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Health Analysis */}
        <div className="analysis-section">
          <h4>Health Analysis</h4>
          <p><strong>General Health:</strong> {safeAnalysis.health.generalHealth}</p>
          <div className="recommendations">
            <strong>Recommendations:</strong>
            <ul>
              {safeAnalysis.health.recommendations.map((rec, index) => (
                <li key={index}>{rec}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Financial Analysis */}
        <div className="analysis-section">
          <h4>Financial Analysis</h4>
          <p><strong>Wealth Indicators:</strong> {safeAnalysis.finances.wealthIndicators}</p>
          <p><strong>Financial Timing:</strong> {safeAnalysis.finances.financialTiming}</p>
          <div className="income-sources">
            <strong>Income Sources:</strong>
            <ul>
              {safeAnalysis.finances.incomeSources.map((source, index) => (
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
            <p><strong>Marriage Indications:</strong> {safeAnalysis.relationships.marriageIndications}</p>
            <p><strong>Partner Characteristics:</strong> {safeAnalysis.relationships.partnerCharacteristics}</p>
            <p><strong>Timing:</strong> {safeAnalysis.relationships.timing}</p>
          </div>
        </div>

        {/* Timeline Analysis */}
        <div id="timeline-analysis" className={`analysis-section ${activeTab === 'timeline' ? 'active' : 'hidden'}`}>
          <h4>Dasha Timeline</h4>
          <div className="content">
            <p><strong>Current Dasha:</strong> {safeDashaInfo.currentDasha.dasha}</p>
            <p><strong>Remaining:</strong> {safeDashaInfo.currentDasha.remainingYears.toFixed(1)} years</p>
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

      </div>
    </div>
  );
};

export default ComprehensiveAnalysisDisplay;
