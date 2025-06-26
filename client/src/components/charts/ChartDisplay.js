import React, { useState } from 'react';
import BirthDataAnalysis from '../BirthDataAnalysis';
import ComprehensiveAnalysisDisplay from '../reports/ComprehensiveAnalysisDisplay';
import BasicAnalysisDisplay from '../reports/BasicAnalysisDisplay';
import MobileOptimizedChart from '../enhanced/MobileOptimizedChart';
import { Button } from '../ui';

const ChartDisplay = ({ chartData, analysisType, useComprehensive }) => {
  const [viewMode, setViewMode] = useState('analysis'); // 'analysis' or 'interactive'

  const handlePlanetSelect = (planet, house) => {
    console.log('Planet selected:', planet, 'in house:', house);
  };

  const handleHouseSelect = (house) => {
    console.log('House selected:', house);
  };

  // Always render the wrapper with chart-display class for E2E test consistency
  return (
    <div className="chart-display">
      {chartData && (
        <div className="mb-4 flex flex-col sm:flex-row gap-2">
          <Button
            variant={viewMode === 'analysis' ? 'default' : 'outline'}
            onClick={() => setViewMode('analysis')}
            className="flex-1"
          >
            📊 Analysis View
          </Button>
          <Button
            variant={viewMode === 'interactive' ? 'default' : 'outline'}
            onClick={() => setViewMode('interactive')}
            className="flex-1"
          >
            🎯 Interactive Chart
          </Button>
        </div>
      )}

      {(() => {
        if (!chartData) {
          return null;
        }

        const { data } = chartData;

        // Show interactive chart view
        if (viewMode === 'interactive') {
          return (
            <MobileOptimizedChart
              chartData={data}
              onPlanetSelect={handlePlanetSelect}
              onHouseSelect={handleHouseSelect}
              className="w-full"
            />
          );
        }

        // Show analysis views
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
