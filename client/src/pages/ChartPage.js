import React, { useState } from 'react';
import { useChartGeneration } from '../hooks/useChartGeneration';
import BirthDataForm from '../components/forms/BirthDataForm';
import AnalysisSelector from '../components/forms/AnalysisSelector';
import ChartDisplay from '../components/charts/ChartDisplay';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
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

        {isLoading && <LoadingSpinner />}
        <ErrorMessage message={error?.message} />

        {chartData?.data.birthData?.geocodingInfo && (
          <div className="geocoding-status">
            <p>{`Geocoding successful using ${chartData.data.birthData.geocodingInfo.service}`}</p>
          </div>
        )}

        <ChartDisplay
          chartData={chartData}
          analysisType={analysisType}
          useComprehensive={useComprehensive}
        />
      </div>
    </div>
  );
};

export default ChartPage;
