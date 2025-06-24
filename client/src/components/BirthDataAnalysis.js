import React from 'react';
import './BirthDataAnalysis.css';

const BirthDataAnalysis = ({ analysis }) => {
  if (!analysis) return null;

  const { section, timestamp, analyses, summary } = analysis;

  const renderAnalysisItem = (key, analysisItem) => (
    <div key={key} className="analysis-item">
      <h3 className="question">{analysisItem.question}</h3>
      <div className="answer">{analysisItem.answer}</div>

      {analysisItem.details && Object.keys(analysisItem.details).length > 0 && (
        <div className="details">
          <h4>Details:</h4>
          <ul>
            {Object.entries(analysisItem.details).map(([detailKey, detailValue]) => (
              <li key={detailKey}>
                <strong>{detailKey}:</strong> {typeof detailValue === 'object' ? JSON.stringify(detailValue) : detailValue}
              </li>
            ))}
          </ul>
        </div>
      )}

      {analysisItem.planetaryPositions && Object.keys(analysisItem.planetaryPositions).length > 0 && (
        <div className="planetary-positions">
          <h4>Planetary Positions:</h4>
          <div className="planets-grid">
            {Object.entries(analysisItem.planetaryPositions).map(([planet, position]) => (
              <div key={planet} className="planet-position">
                <strong>{planet}:</strong> {position.sign} ({position.degree.toFixed(2)}°) - {position.house}{getOrdinalSuffix(position.house)} house
                {position.isRetrograde && <span className="retrograde"> (R)</span>}
                {position.isCombust && <span className="combust"> (C)</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {analysisItem.dashaSequence && analysisItem.dashaSequence.length > 0 && (
        <div className="dasha-sequence">
          <h4>Dasha Sequence:</h4>
          <div className="dasha-timeline">
            {analysisItem.dashaSequence.map((dasha, index) => (
              <div key={index} className={`dasha-item ${dasha.isCurrent ? 'current' : ''}`}>
                <strong>{dasha.planet}:</strong> Age {dasha.startAge.toFixed(1)} - {dasha.endAge.toFixed(1)} ({dasha.period} years)
                {dasha.isCurrent && <span className="current-indicator"> ← Current</span>}
                {dasha.remainingYears && <span className="remaining"> ({dasha.remainingYears.toFixed(1)} years remaining)</span>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const getOrdinalSuffix = (num) => {
    const j = num % 10;
    const k = num % 100;
    if (j === 1 && k !== 11) return 'st';
    if (j === 2 && k !== 12) return 'nd';
    if (j === 3 && k !== 13) return 'rd';
    return 'th';
  };

  return (
    <div className="birth-data-analysis">
      <div className="analysis-header">
        <h2>{section}</h2>
        <p className="timestamp">Analysis performed at: {new Date(timestamp).toLocaleString()}</p>
      </div>

      <div className="summary-section">
        <h3>Summary</h3>
        <div className="summary-grid">
          <div className="summary-item">
            <strong>Status:</strong> <span className={`status ${summary.status}`}>{summary.status}</span>
          </div>
          <div className="summary-item">
            <strong>Completeness:</strong> {summary.completeness}%
          </div>
          <div className="summary-item">
            <strong>Charts Generated:</strong> {summary.chartsGenerated}
          </div>
          <div className="summary-item">
            <strong>Ascendant Calculated:</strong> {summary.ascendantCalculated ? 'Yes' : 'No'}
          </div>
          <div className="summary-item">
            <strong>Planets Calculated:</strong> {summary.planetsCalculated}/9
          </div>
          <div className="summary-item">
            <strong>Dasha Calculated:</strong> {summary.dashaCalculated ? 'Yes' : 'No'}
          </div>
          <div className="summary-item">
            <strong>Ready for Analysis:</strong> {summary.readyForAnalysis ? 'Yes' : 'No'}
          </div>
        </div>
      </div>

      <div className="analyses-section">
        <h3>Detailed Analysis</h3>

        {renderAnalysisItem('birthDetails', analyses.birthDetails)}
        {renderAnalysisItem('chartGeneration', analyses.chartGeneration)}
        {renderAnalysisItem('ascendant', analyses.ascendant)}
        {renderAnalysisItem('planetaryPositions', analyses.planetaryPositions)}
        {renderAnalysisItem('mahadasha', analyses.mahadasha)}
      </div>

      <div className="conclusion">
        <h3>Conclusion</h3>
        <p>
          {summary.readyForAnalysis
            ? "All requirements from Section 1 have been met. The birth data collection and chart casting is complete and ready for detailed astrological analysis."
            : "Some requirements from Section 1 are incomplete. Please ensure all birth details are provided for accurate analysis."
          }
        </p>
      </div>
    </div>
  );
};

export default BirthDataAnalysis;
