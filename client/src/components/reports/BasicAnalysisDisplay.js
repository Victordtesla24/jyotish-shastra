import React from 'react';

const BasicAnalysisDisplay = ({ data }) => {
  // Add defensive checks for data structure
  if (!data) {
    return <div>Loading chart analysis...</div>;
  }

  const { rasiChart, analysis } = data;

  // Ensure required data exists
  if (!rasiChart) {
    return <div>Chart data not available</div>;
  }

  return (
    <div className="chart-display">
      <h2>Birth Chart Analysis</h2>

      {/* Basic Chart Info */}
      {rasiChart.ascendant && (
        <div className="chart-info">
          <h3>Chart Details</h3>
          <p><strong>Ascendant:</strong> {rasiChart.ascendant.sign} ({rasiChart.ascendant.degree?.toFixed(2) || 'N/A'}°)</p>
          {rasiChart.nakshatra && (
            <p><strong>Nakshatra:</strong> {rasiChart.nakshatra.name} (Pada {rasiChart.nakshatra.pada})</p>
          )}
        </div>
      )}

      {/* Planetary Positions */}
      {rasiChart.planetaryPositions && (
        <div className="planetary-positions">
          <h3>Planetary Positions</h3>
          <div className="planets-grid">
            {Object.entries(rasiChart.planetaryPositions).map(([planet, position]) => (
              <div key={planet} className="planet-card">
                <h4>{planet.charAt(0).toUpperCase() + planet.slice(1)}</h4>
                <p><strong>Sign:</strong> {position.sign || 'N/A'}</p>
                <p><strong>Degree:</strong> {position.degree?.toFixed(2) || 'N/A'}°</p>
                {position.isRetrograde && <p className="retrograde">Retrograde</p>}
                {position.isCombust && <p className="combust">Combust</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lagna Analysis */}
      {analysis.lagna && (
        <div className="lagna-analysis">
          <h3>Lagna (Ascendant) Analysis</h3>
          <div className="analysis-section">
            <h4>Personality Traits</h4>
            <ul>
              {analysis.lagna.lagnaSign.characteristics.slice(0, 3).map((trait, index) => (
                <li key={index}>{trait}</li>
              ))}
            </ul>
          </div>
          <div className="analysis-section">
            <h4>Lagna Lord Placement</h4>
            <p><strong>Lord:</strong> {analysis.lagna.lagnaLord.planet}</p>
            <p><strong>House:</strong> {analysis.lagna.lagnaLord.house}th</p>
            <p><strong>Effects:</strong> {analysis.lagna.lagnaLord.effects[0]}</p>
          </div>
        </div>
      )}

      {/* House Analysis Summary */}
      {analysis.houses && (
        <div className="house-analysis">
          <h3>House Analysis Summary</h3>
          <div className="houses-grid">
            {Object.entries(analysis.houses).slice(0, 6).map(([houseNum, house]) => (
              <div key={houseNum} className="house-card">
                <h4>{houseNum}st House</h4>
                <p><strong>Sign:</strong> {house.houseSign.sign}</p>
                <p><strong>Lord:</strong> {house.houseLord}</p>
                <p><strong>Planets:</strong> {house.houseOccupants.join(', ') || 'None'}</p>
                {house.analysis.strengths.length > 0 && (
                  <div className="strengths">
                    <strong>Strengths:</strong>
                    <ul>
                      {house.analysis.strengths.map((strength, index) => (
                        <li key={index}>{strength}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BasicAnalysisDisplay;
