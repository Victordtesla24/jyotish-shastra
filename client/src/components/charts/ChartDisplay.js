import React from 'react';
import BirthDataAnalysis from '../BirthDataAnalysis';
import ComprehensiveAnalysisDisplay from '../reports/ComprehensiveAnalysisDisplay';
import BasicAnalysisDisplay from '../reports/BasicAnalysisDisplay';

const ChartDisplay = ({ chartData, analysisType, useComprehensive }) => {
  // Always render the wrapper with chart-display class for E2E test consistency
  return (
    <div className="chart-display">
      {(() => {
        if (!chartData) {
          return null;
        }

        const { data } = chartData;

        if (analysisType === 'birth-data' && data.birthDataAnalysis) {
          return <BirthDataAnalysis analysis={data.birthDataAnalysis} />;
        }

        if (useComprehensive && data?.analysis) {
          return <ComprehensiveAnalysisDisplay data={data} />;
        } else if (data) {
          return <BasicAnalysisDisplay data={data} />;
        }

        return null;
      })()}
    </div>
  );
};

export default ChartDisplay;
