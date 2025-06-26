import { useState, useEffect, useCallback } from 'react';
import chartService from '../services/chartService';

const useChartData = (chartId = null) => {
  const [chartData, setChartData] = useState(null);
  const [navamsaData, setNavamsaData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userCharts, setUserCharts] = useState([]);

  const loadChart = useCallback(async (id) => {
    if (!id) return;

    setLoading(true);
    setError(null);

    try {
      const chart = await chartService.getChart(id);
      setChartData(chart);

      // Also load navamsa data
      const navamsa = await chartService.getNavamsaChart(id);
      setNavamsaData(navamsa);
    } catch (err) {
      setError(err.message);
      console.error('Error loading chart:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const generateChart = useCallback(async (birthData) => {
    setLoading(true);
    setError(null);

    try {
      const newChart = await chartService.generateChart(birthData);
      setChartData(newChart);

      // Load navamsa for the new chart
      if (newChart.id) {
        const navamsa = await chartService.getNavamsaChart(newChart.id);
        setNavamsaData(navamsa);
      }

      return newChart;
    } catch (err) {
      setError(err.message);
      console.error('Error generating chart:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const loadUserCharts = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const charts = await chartService.getUserCharts();
      setUserCharts(charts);
    } catch (err) {
      setError(err.message);
      console.error('Error loading user charts:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateChart = useCallback(async (id, updateData) => {
    setLoading(true);
    setError(null);

    try {
      const updatedChart = await chartService.updateChart(id, updateData);
      setChartData(updatedChart);
      return updatedChart;
    } catch (err) {
      setError(err.message);
      console.error('Error updating chart:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteChart = useCallback(async (id) => {
    setLoading(true);
    setError(null);

    try {
      await chartService.deleteChart(id);
      setUserCharts(prev => prev.filter(chart => chart.id !== id));

      if (chartData && chartData.id === id) {
        setChartData(null);
        setNavamsaData(null);
      }
    } catch (err) {
      setError(err.message);
      console.error('Error deleting chart:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [chartData]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const clearChartData = useCallback(() => {
    setChartData(null);
    setNavamsaData(null);
  }, []);

  // Load chart if chartId is provided
  useEffect(() => {
    if (chartId) {
      loadChart(chartId);
    }
  }, [chartId, loadChart]);

  return {
    chartData,
    navamsaData,
    userCharts,
    loading,
    error,
    generateChart,
    loadChart,
    loadUserCharts,
    updateChart,
    deleteChart,
    clearError,
    clearChartData
  };
};

export default useChartData;
