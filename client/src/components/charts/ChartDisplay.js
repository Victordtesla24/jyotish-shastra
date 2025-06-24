import React from 'react';
import BirthDataAnalysis from '../BirthDataAnalysis';
import ComprehensiveAnalysisDisplay from '../reports/ComprehensiveAnalysisDisplay';
import BasicAnalysisDisplay from '../reports/BasicAnalysisDisplay';

const ChartDisplay = ({ chartData, analysisType, useComprehensive }) => {
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
};

export default ChartDisplay;
