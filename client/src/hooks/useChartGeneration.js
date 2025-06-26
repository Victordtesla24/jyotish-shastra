import { useMutation } from 'react-query';
import chartService from '../services/chartService';

export const useChartGeneration = () => {
  const mutation = useMutation(({ birthData, analysisType, useComprehensive }) => {
    if (analysisType === 'birth-data') {
      return chartService.analyzeBirthData(birthData);
    }
    if (useComprehensive) {
      return chartService.generateComprehensiveChart(birthData);
    }
    return chartService.generateChart(birthData);
  });

  return {
    generateChart: mutation.mutate,
    data: mutation.data,
    isLoading: mutation.isLoading,
    error: mutation.error,
  };
};
