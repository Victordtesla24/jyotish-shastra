import React, { useState } from 'react';
import { useChartGeneration } from '../hooks/useChartGeneration';
import BirthDataForm from '../components/forms/BirthDataForm';
import AnalysisSelector from '../components/forms/AnalysisSelector';
import ChartDisplay from '../components/charts/ChartDisplay';
import { ChartLoader } from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import { Skeleton } from '../components/ui';
import './ChartPage.css';

const ChartPage = () => {
  const [useComprehensive, setUseComprehensive] = useState(true);
  const [analysisType, setAnalysisType] = useState('comprehensive'); // 'comprehensive', 'birth-data'
  const { generateChart, data: chartData, isLoading, error } = useChartGeneration();

  const handleSubmit = (birthData) => {
    generateChart({ birthData, analysisType, useComprehensive });
  };

  return (
    <div className="chart-page">
      <div className="chart-container">
        <h1>Generate Your Birth Chart</h1>

        <BirthDataForm onSubmit={handleSubmit} isLoading={isLoading} />

        <AnalysisSelector
          analysisType={analysisType}
          setAnalysisType={setAnalysisType}
          useComprehensive={useComprehensive}
          setUseComprehensive={setUseComprehensive}
        />

        <ErrorMessage message={error?.message} />

        {chartData?.data.birthData?.geocodingInfo && (
          <div className="geocoding-status p-4 bg-green-50 border border-green-200 rounded-xl mb-6">
            <div className="flex items-center space-x-2">
              <span className="text-green-600">✅</span>
              <p className="text-green-800 font-medium">
                {`Geocoding successful using ${chartData.data.birthData.geocodingInfo.service}`}
              </p>
            </div>
          </div>
        )}

        {isLoading ? (
          <ChartLoader progress={75} />
        ) : chartData ? (
          <ChartDisplay
            chartData={chartData}
            analysisType={analysisType}
            useComprehensive={useComprehensive}
          />
        ) : null}
      </div>
    </div>
  );
};

export default ChartPage;
