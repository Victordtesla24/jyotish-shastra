/**
 * AnalysisContext - Analysis navigation and section management
 * Manages comprehensive analysis state, section navigation, and progress tracking
 */

import React, { createContext, useContext, useReducer, useCallback } from 'react';

// Initial state for analysis context
const initialState = {
  currentAnalysis: null,
  analysisHistory: [],
  activeSection: 'lagna',
  navigationState: {
    visitedSections: ['lagna'],
    completedSections: [],
    currentProgress: 0,
    totalSections: 8
  },
  isLoading: false,
  error: null,
  sectionData: {},
  analysisMetadata: {
    generatedAt: null,
    analysisType: 'comprehensive',
    culturalFormatting: true
  }
};

// Available analysis sections - matching UI tab keys for consistent navigation
const ANALYSIS_SECTIONS = [
  'preliminary', // Birth Data Collection and Chart Casting
  'lagna',       // Lagna and Luminaries
  'houses',      // House Analysis (1-12)
  'aspects',     // Planetary Aspects and Influences
  'arudha',      // Arudha Padas (Perception & Public Image)
  'navamsa',     // Navamsa Chart Analysis (D9)
  'dasha',       // Dasha Analysis (Timeline)
  'comprehensive' // Synthesis and Overall Assessment
];

// Action types for analysis state management
const AnalysisActionTypes = {
  SET_CURRENT_ANALYSIS: 'SET_CURRENT_ANALYSIS',
  ADD_TO_HISTORY: 'ADD_TO_HISTORY',
  CLEAR_HISTORY: 'CLEAR_HISTORY',
  SET_ACTIVE_SECTION: 'SET_ACTIVE_SECTION',
  UPDATE_NAVIGATION_STATE: 'UPDATE_NAVIGATION_STATE',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  SET_SECTION_DATA: 'SET_SECTION_DATA',
  MARK_SECTION_COMPLETED: 'MARK_SECTION_COMPLETED',
  CLEAR_ERROR: 'CLEAR_ERROR',
  UPDATE_METADATA: 'UPDATE_METADATA'
};

// Analysis reducer for state management
function analysisReducer(state, action) {
  switch (action.type) {
    case AnalysisActionTypes.SET_CURRENT_ANALYSIS:
      return {
        ...state,
        currentAnalysis: action.payload,
        isLoading: false,
        error: null,
        analysisMetadata: {
          ...state.analysisMetadata,
          generatedAt: new Date().toISOString()
        }
      };

    case AnalysisActionTypes.ADD_TO_HISTORY:
      const newHistory = [...state.analysisHistory];
      const existingIndex = newHistory.findIndex(
        analysis => analysis.id === action.payload.id
      );

      if (existingIndex >= 0) {
        newHistory[existingIndex] = action.payload;
      } else {
        newHistory.unshift(action.payload);
        if (newHistory.length > 5) { // Limit to 5 analyses
          newHistory.pop();
        }
      }

      return {
        ...state,
        analysisHistory: newHistory
      };

    case AnalysisActionTypes.CLEAR_HISTORY:
      return {
        ...state,
        analysisHistory: []
      };

    case AnalysisActionTypes.SET_ACTIVE_SECTION:
      const newVisitedSections = [...new Set([...state.navigationState.visitedSections, action.payload])];
      const progress = Math.round((newVisitedSections.length / ANALYSIS_SECTIONS.length) * 100);

      return {
        ...state,
        activeSection: action.payload,
        navigationState: {
          ...state.navigationState,
          visitedSections: newVisitedSections,
          currentProgress: progress
        }
      };

    case AnalysisActionTypes.UPDATE_NAVIGATION_STATE:
      return {
        ...state,
        navigationState: {
          ...state.navigationState,
          ...action.payload
        }
      };

    case AnalysisActionTypes.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
        error: action.payload ? null : state.error
      };

    case AnalysisActionTypes.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        isLoading: false
      };

    case AnalysisActionTypes.SET_SECTION_DATA:
      return {
        ...state,
        sectionData: {
          ...state.sectionData,
          [action.payload.section]: action.payload.data
        }
      };

    case AnalysisActionTypes.MARK_SECTION_COMPLETED:
      const newCompletedSections = [...new Set([...state.navigationState.completedSections, action.payload])];

      return {
        ...state,
        navigationState: {
          ...state.navigationState,
          completedSections: newCompletedSections
        }
      };

    case AnalysisActionTypes.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };

    case AnalysisActionTypes.UPDATE_METADATA:
      return {
        ...state,
        analysisMetadata: {
          ...state.analysisMetadata,
          ...action.payload
        }
      };

    default:
      return state;
  }
}

// Create analysis context
const AnalysisContext = createContext({
  // State
  currentAnalysis: null,
  analysisHistory: [],
  activeSection: 'lagnaLuminaries',
  navigationState: {},
  isLoading: false,
  error: null,
  sectionData: {},
  analysisMetadata: {},

  // Actions
  setCurrentAnalysis: () => {},
  addToHistory: () => {},
  clearHistory: () => {},
  setActiveSection: () => {},
  updateNavigationState: () => {},
  setLoading: () => {},
  setError: () => {},
  setSectionData: () => {},
  markSectionCompleted: () => {},
  clearError: () => {},
  updateMetadata: () => {},
  navigateToSection: () => {},
  getNextSection: () => {},
  getPreviousSection: () => {}
});

// Analysis provider component
export const AnalysisProvider = ({ children }) => {
  const [state, dispatch] = useReducer(analysisReducer, initialState);

  // Action creators
  const setCurrentAnalysis = useCallback((analysis) => {
    dispatch({ type: AnalysisActionTypes.SET_CURRENT_ANALYSIS, payload: analysis });

    // Automatically add to history if it has an ID
    if (analysis && analysis.id) {
      dispatch({ type: AnalysisActionTypes.ADD_TO_HISTORY, payload: analysis });
    }
  }, []);

  const addToHistory = useCallback((analysis) => {
    dispatch({ type: AnalysisActionTypes.ADD_TO_HISTORY, payload: analysis });
  }, []);

  const clearHistory = useCallback(() => {
    dispatch({ type: AnalysisActionTypes.CLEAR_HISTORY });
  }, []);

  const setActiveSection = useCallback((section) => {
    if (ANALYSIS_SECTIONS.includes(section)) {
      dispatch({ type: AnalysisActionTypes.SET_ACTIVE_SECTION, payload: section });
    }
  }, []);

  const updateNavigationState = useCallback((navigationUpdates) => {
    dispatch({ type: AnalysisActionTypes.UPDATE_NAVIGATION_STATE, payload: navigationUpdates });
  }, []);

  const setLoading = useCallback((loading) => {
    dispatch({ type: AnalysisActionTypes.SET_LOADING, payload: loading });
  }, []);

  const setError = useCallback((error) => {
    dispatch({ type: AnalysisActionTypes.SET_ERROR, payload: error });
  }, []);

  const setSectionData = useCallback((section, data) => {
    dispatch({
      type: AnalysisActionTypes.SET_SECTION_DATA,
      payload: { section, data }
    });
  }, []);

  const markSectionCompleted = useCallback((section) => {
    dispatch({ type: AnalysisActionTypes.MARK_SECTION_COMPLETED, payload: section });
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: AnalysisActionTypes.CLEAR_ERROR });
  }, []);

  const updateMetadata = useCallback((metadata) => {
    dispatch({ type: AnalysisActionTypes.UPDATE_METADATA, payload: metadata });
  }, []);

  // Complex navigation actions
  const navigateToSection = useCallback((section) => {
    if (ANALYSIS_SECTIONS.includes(section)) {
      setActiveSection(section);
      return true;
    }
    return false;
  }, [setActiveSection]);

  const getNextSection = useCallback(() => {
    const currentIndex = ANALYSIS_SECTIONS.indexOf(state.activeSection);
    if (currentIndex < ANALYSIS_SECTIONS.length - 1) {
      return ANALYSIS_SECTIONS[currentIndex + 1];
    }
    return null;
  }, [state.activeSection]);

  const getPreviousSection = useCallback(() => {
    const currentIndex = ANALYSIS_SECTIONS.indexOf(state.activeSection);
    if (currentIndex > 0) {
      return ANALYSIS_SECTIONS[currentIndex - 1];
    }
    return null;
  }, [state.activeSection]);

  const navigateToNext = useCallback(() => {
    const nextSection = getNextSection();
    if (nextSection) {
      navigateToSection(nextSection);
      return true;
    }
    return false;
  }, [getNextSection, navigateToSection]);

  const navigateToPrevious = useCallback(() => {
    const previousSection = getPreviousSection();
    if (previousSection) {
      navigateToSection(previousSection);
      return true;
    }
    return false;
  }, [getPreviousSection, navigateToSection]);

  // Helper functions
  const isSectionVisited = useCallback((section) => {
    return state.navigationState.visitedSections.includes(section);
  }, [state.navigationState.visitedSections]);

  const isSectionCompleted = useCallback((section) => {
    return state.navigationState.completedSections.includes(section);
  }, [state.navigationState.completedSections]);

  const getSectionProgress = useCallback(() => {
    return {
      visited: state.navigationState.visitedSections.length,
      completed: state.navigationState.completedSections.length,
      total: ANALYSIS_SECTIONS.length,
      percentage: state.navigationState.currentProgress
    };
  }, [state.navigationState]);

  // Context value
  const contextValue = {
    // State
    currentAnalysis: state.currentAnalysis,
    analysisHistory: state.analysisHistory,
    activeSection: state.activeSection,
    navigationState: state.navigationState,
    isLoading: state.isLoading,
    error: state.error,
    sectionData: state.sectionData,
    analysisMetadata: state.analysisMetadata,
    availableSections: ANALYSIS_SECTIONS,

    // Actions
    setCurrentAnalysis,
    addToHistory,
    clearHistory,
    setActiveSection,
    updateNavigationState,
    setLoading,
    setError,
    setSectionData,
    markSectionCompleted,
    clearError,
    updateMetadata,
    navigateToSection,
    getNextSection,
    getPreviousSection,
    navigateToNext,
    navigateToPrevious,

    // Helper functions
    isSectionVisited,
    isSectionCompleted,
    getSectionProgress
  };

  return (
    <AnalysisContext.Provider value={contextValue}>
      {children}
    </AnalysisContext.Provider>
  );
};

// Custom hook to use analysis context
export const useAnalysis = () => {
  const context = useContext(AnalysisContext);
  if (!context) {
    throw new Error('useAnalysis must be used within an AnalysisProvider');
  }
  return context;
};

// Export context for direct access if needed
export { AnalysisContext, ANALYSIS_SECTIONS };
export default AnalysisContext;
