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

        // Add defensive check for data
        if (!data) {
          console.warn('Chart data is missing data property:', chartData);
          return (
            <div className="text-center p-4">
              <p className="text-red-500">Chart data is incomplete. Please try generating the chart again.</p>
            </div>
          );
        }

        // Debug logging for data structure
        console.log('ChartDisplay received data:', {
          hasData: !!data,
          dataKeys: Object.keys(data),
          hasBirthDataAnalysis: !!data.birthDataAnalysis,
          hasAnalysis: !!data.analysis,
          analysisType,
          viewMode
        });

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
        // For birth-data analysis, check if birthDataAnalysis exists or fall back to general analysis
        if (analysisType === 'birth-data') {
          if (data.birthDataAnalysis) {
            return <BirthDataAnalysis analysis={data.birthDataAnalysis} />;
          } else if (data.analysis) {
            // Fall back to comprehensive analysis if birthDataAnalysis not available
            return <ComprehensiveAnalysisDisplay data={data} />;
          } else {
            // Fall back to basic analysis
            return <BasicAnalysisDisplay data={data} />;
          }
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
