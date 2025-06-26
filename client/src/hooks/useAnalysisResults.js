import { useState, useCallback } from 'react';
import analysisService from '../services/analysisService';

export const useAnalysisResults = () => {
  const [analysisResults, setAnalysisResults] = useState({
    lagna: null,
    houses: null,
    aspects: null,
    dasha: null,
    navamsa: null,
    arudha: null,
    yogas: null,
    luminaries: null
  });
  const [loading, setLoading] = useState({});
  const [errors, setErrors] = useState({});

  const analyzeLagna = useCallback(async (chartId) => {
    setLoading(prev => ({ ...prev, lagna: true }));
    setErrors(prev => ({ ...prev, lagna: null }));

    try {
      const result = await analysisService.analyzeLagna(chartId);
      setAnalysisResults(prev => ({ ...prev, lagna: result }));
      return result;
    } catch (error) {
      setErrors(prev => ({ ...prev, lagna: error.message }));
      throw error;
    } finally {
      setLoading(prev => ({ ...prev, lagna: false }));
    }
  }, []);

  const analyzeHouses = useCallback(async (chartId) => {
    setLoading(prev => ({ ...prev, houses: true }));
    setErrors(prev => ({ ...prev, houses: null }));

    try {
      const result = await analysisService.analyzeHouses(chartId);
      setAnalysisResults(prev => ({ ...prev, houses: result }));
      return result;
    } catch (error) {
      setErrors(prev => ({ ...prev, houses: error.message }));
      throw error;
    } finally {
      setLoading(prev => ({ ...prev, houses: false }));
    }
  }, []);

  const analyzeAspects = useCallback(async (chartId) => {
    setLoading(prev => ({ ...prev, aspects: true }));
    setErrors(prev => ({ ...prev, aspects: null }));

    try {
      const result = await analysisService.analyzeAspects(chartId);
      setAnalysisResults(prev => ({ ...prev, aspects: result }));
      return result;
    } catch (error) {
      setErrors(prev => ({ ...prev, aspects: error.message }));
      throw error;
    } finally {
      setLoading(prev => ({ ...prev, aspects: false }));
    }
  }, []);

  const analyzeDasha = useCallback(async (chartId) => {
    setLoading(prev => ({ ...prev, dasha: true }));
    setErrors(prev => ({ ...prev, dasha: null }));

    try {
      const result = await analysisService.analyzeDasha(chartId);
      setAnalysisResults(prev => ({ ...prev, dasha: result }));
      return result;
    } catch (error) {
      setErrors(prev => ({ ...prev, dasha: error.message }));
      throw error;
    } finally {
      setLoading(prev => ({ ...prev, dasha: false }));
    }
  }, []);

  const clearAnalysis = useCallback(() => {
    setAnalysisResults({
      lagna: null,
      houses: null,
      aspects: null,
      dasha: null,
      navamsa: null,
      arudha: null,
      yogas: null,
      luminaries: null
    });
    setLoading({});
    setErrors({});
  }, []);

  const isAnyLoading = Object.values(loading).some(Boolean);
  const hasAnyError = Object.values(errors).some(Boolean);

  return {
    analysisResults,
    loading,
    errors,
    isAnyLoading,
    hasAnyError,
    analyzeLagna,
    analyzeHouses,
    analyzeAspects,
    analyzeDasha,
    clearAnalysis
  };
};
