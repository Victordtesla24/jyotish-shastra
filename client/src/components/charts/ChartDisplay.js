import React, { useState, Suspense } from 'react';
import BirthDataAnalysis from '../BirthDataAnalysis';
import BasicAnalysisDisplay from '../reports/BasicAnalysisDisplay';
import MobileOptimizedChart from '../enhanced/MobileOptimizedChart';
import { Button } from '../ui';
import { VedicLoadingSpinner } from '../ui';

// Lazy load with error boundary to prevent chunk loading issues
const ComprehensiveAnalysisDisplay = React.lazy(() =>
  import('../reports/ComprehensiveAnalysisDisplay').catch(err => {
    console.error('Error loading ComprehensiveAnalysisDisplay:', err);
    // Return a fallback component
    return Promise.resolve({
      default: () => (
        <div className="card-cosmic text-center p-8">
          <h3 className="text-sacred-white text-xl mb-4">📊 Analysis Component Loading Error</h3>
          <p className="text-sacred-white/80 mb-6">
            There was an issue loading the analysis display. Please refresh the page to try again.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="btn-vedic"
          >
            Refresh Page
          </button>
        </div>
      )
    });
  })
);

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

        // Handle different data structures flexibly
        // chartData could be: { data: {...} } or direct chart data object
        const data = chartData.data || chartData;

        // Add defensive check for data with more flexible validation
        if (!data || (typeof data !== 'object')) {
          console.warn('Chart data is not in expected format:', chartData);
          return (
            <div className="text-center p-4">
              <div className="text-amber-600 mb-2">⚠️</div>
              <p className="text-amber-700">Chart data is being processed. Please wait a moment or try regenerating the chart.</p>
            </div>
          );
        }

        // Debug logging for data structure
        console.log('ChartDisplay received data:', {
          hasData: !!data,
          dataKeys: Object.keys(data),
          hasBirthDataAnalysis: !!data.birthDataAnalysis,
          hasAnalysis: !!data.analysis,
          hasRasiChart: !!data.rasiChart,
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
            return (
              <Suspense fallback={<VedicLoadingSpinner text="Loading comprehensive analysis..." />}>
                <ComprehensiveAnalysisDisplay data={data} />
              </Suspense>
            );
          } else {
            // Fall back to basic analysis
            return <BasicAnalysisDisplay data={data} />;
          }
        }

        if (useComprehensive && data?.analysis) {
          return (
            <Suspense fallback={<VedicLoadingSpinner text="Loading comprehensive analysis..." />}>
              <ComprehensiveAnalysisDisplay data={data} />
            </Suspense>
          );
        } else if (data) {
          return <BasicAnalysisDisplay data={data} />;
        }

        return (
          <div className="text-center p-4">
            <div className="text-blue-600 mb-2">ℹ️</div>
            <p className="text-blue-700">Chart data loaded successfully. Analysis will appear here.</p>
          </div>
        );
      })()}
    </div>
  );
};

export default ChartDisplay;
