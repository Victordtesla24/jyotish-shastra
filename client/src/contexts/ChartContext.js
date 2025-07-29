/**
 * ChartContext - Chart state management and history tracking
 * Manages chart generation state, history, and loading states across components
 */

import React, { createContext, useContext, useReducer, useCallback } from 'react';

// Initial state for chart context
const initialState = {
  currentChart: null,
  chartHistory: [],
  isLoading: false,
  error: null,
  generationProgress: 0,
  lastGenerated: null,
  chartType: 'birth_chart',
  preferences: {
    chartStyle: 'south_indian',
    showDivisionalCharts: true,
    showAspects: true,
    showYogas: true
  }
};

// Action types for chart state management
const ChartActionTypes = {
  SET_CURRENT_CHART: 'SET_CURRENT_CHART',
  ADD_TO_HISTORY: 'ADD_TO_HISTORY',
  CLEAR_HISTORY: 'CLEAR_HISTORY',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  SET_PROGRESS: 'SET_PROGRESS',
  UPDATE_PREFERENCES: 'UPDATE_PREFERENCES',
  REMOVE_FROM_HISTORY: 'REMOVE_FROM_HISTORY',
  CLEAR_ERROR: 'CLEAR_ERROR'
};

// Chart reducer for state management
function chartReducer(state, action) {
  switch (action.type) {
    case ChartActionTypes.SET_CURRENT_CHART:
      return {
        ...state,
        currentChart: action.payload,
        isLoading: false,
        error: null,
        lastGenerated: new Date().toISOString(),
        generationProgress: 100
      };

    case ChartActionTypes.ADD_TO_HISTORY:
      const newHistory = [...state.chartHistory];
      const existingIndex = newHistory.findIndex(
        chart => chart.id === action.payload.id
      );

      if (existingIndex >= 0) {
        // Update existing chart in history
        newHistory[existingIndex] = action.payload;
      } else {
        // Add new chart to history (limit to 10 charts)
        newHistory.unshift(action.payload);
        if (newHistory.length > 10) {
          newHistory.pop();
        }
      }

      return {
        ...state,
        chartHistory: newHistory
      };

    case ChartActionTypes.CLEAR_HISTORY:
      return {
        ...state,
        chartHistory: []
      };

    case ChartActionTypes.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
        error: action.payload ? null : state.error,
        generationProgress: action.payload ? 0 : state.generationProgress
      };

    case ChartActionTypes.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        isLoading: false,
        generationProgress: 0
      };

    case ChartActionTypes.SET_PROGRESS:
      return {
        ...state,
        generationProgress: Math.min(100, Math.max(0, action.payload))
      };

    case ChartActionTypes.UPDATE_PREFERENCES:
      return {
        ...state,
        preferences: {
          ...state.preferences,
          ...action.payload
        }
      };

    case ChartActionTypes.REMOVE_FROM_HISTORY:
      return {
        ...state,
        chartHistory: state.chartHistory.filter(
          chart => chart.id !== action.payload
        )
      };

    case ChartActionTypes.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };

    default:
      return state;
  }
}

// Create chart context
const ChartContext = createContext({
  // State
  currentChart: null,
  chartHistory: [],
  isLoading: false,
  error: null,
  generationProgress: 0,
  lastGenerated: null,
  chartType: 'birth_chart',
  preferences: {},

  // Actions
  setCurrentChart: () => {},
  addToHistory: () => {},
  clearHistory: () => {},
  setLoading: () => {},
  setError: () => {},
  setProgress: () => {},
  updatePreferences: () => {},
  removeFromHistory: () => {},
  clearError: () => {},
  generateChart: () => {},
  loadChartFromHistory: () => {}
});

// Chart provider component
export const ChartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(chartReducer, initialState);

  // Action creators
  const setCurrentChart = useCallback((chart) => {
    dispatch({ type: ChartActionTypes.SET_CURRENT_CHART, payload: chart });

    // Automatically add to history if it has an ID
    if (chart && chart.id) {
      dispatch({ type: ChartActionTypes.ADD_TO_HISTORY, payload: chart });
    }
  }, []);

  const addToHistory = useCallback((chart) => {
    dispatch({ type: ChartActionTypes.ADD_TO_HISTORY, payload: chart });
  }, []);

  const clearHistory = useCallback(() => {
    dispatch({ type: ChartActionTypes.CLEAR_HISTORY });
  }, []);

  const setLoading = useCallback((loading) => {
    dispatch({ type: ChartActionTypes.SET_LOADING, payload: loading });
  }, []);

  const setError = useCallback((error) => {
    dispatch({ type: ChartActionTypes.SET_ERROR, payload: error });
  }, []);

  const setProgress = useCallback((progress) => {
    dispatch({ type: ChartActionTypes.SET_PROGRESS, payload: progress });
  }, []);

  const updatePreferences = useCallback((preferences) => {
    dispatch({ type: ChartActionTypes.UPDATE_PREFERENCES, payload: preferences });
  }, []);

  const removeFromHistory = useCallback((chartId) => {
    dispatch({ type: ChartActionTypes.REMOVE_FROM_HISTORY, payload: chartId });
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: ChartActionTypes.CLEAR_ERROR });
  }, []);

  // Complex actions
  const generateChart = useCallback(async (birthData, options = {}) => {
    try {
      setLoading(true);
      setProgress(10);

      // This would integrate with chart generation service
      setProgress(50);

      // Simulate chart generation process
      const chart = {
        id: `chart_${Date.now()}`,
        birthData,
        generatedAt: new Date().toISOString(),
        chartType: options.chartType || 'birth_chart',
        ...options
      };

      setProgress(90);
      setCurrentChart(chart);

      return chart;
    } catch (error) {
      setError({
        message: error.message,
        code: error.code || 'CHART_GENERATION_ERROR',
        timestamp: new Date().toISOString()
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setProgress, setCurrentChart, setError]);

  const loadChartFromHistory = useCallback((chartId) => {
    const chart = state.chartHistory.find(c => c.id === chartId);
    if (chart) {
      setCurrentChart(chart);
      return chart;
    }
    return null;
  }, [state.chartHistory, setCurrentChart]);

  // Context value
  const contextValue = {
    // State
    currentChart: state.currentChart,
    chartHistory: state.chartHistory,
    isLoading: state.isLoading,
    error: state.error,
    generationProgress: state.generationProgress,
    lastGenerated: state.lastGenerated,
    chartType: state.chartType,
    preferences: state.preferences,

    // Actions
    setCurrentChart,
    addToHistory,
    clearHistory,
    setLoading,
    setError,
    setProgress,
    updatePreferences,
    removeFromHistory,
    clearError,
    generateChart,
    loadChartFromHistory
  };

  return (
    <ChartContext.Provider value={contextValue}>
      {children}
    </ChartContext.Provider>
  );
};

// Custom hook to use chart context
export const useChart = () => {
  const context = useContext(ChartContext);
  if (!context) {
    throw new Error('useChart must be used within a ChartProvider');
  }
  return context;
};

// Export context for direct access if needed
export { ChartContext };
export default ChartContext;
