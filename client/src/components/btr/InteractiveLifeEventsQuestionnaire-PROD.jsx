import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, Button, Alert, LoadingSpinner } from '../ui';
import axios from 'axios';

const InteractiveLifeEventsQuestionnairePROD = ({ onComplete, onProgressUpdate }) => {
  // Production grade state management - explicit initialization
  const [currentStep, setCurrentStep] = useState('categories');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [answers, setAnswers] = useState({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [completedCategories, setCompletedCategories] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [apiConnectionStatus, setApiConnectionStatus] = useState('connected');

  // Enhanced question categories with MCP format support - wrapped in useMemo
  const questionCategories = useMemo(() => ({
    education: {
      title: "Educational Milestones",
      icon: "🎓",
      color: "blue",
      description: "Academic achievements and learning journey",
      questions: [
        {
          id: "edu_1",
          text: "What year did you complete your highest degree?",
          type: "year",
          importance: "high",
          hint: "Include the year you graduated or received your final degree",
          bphsSignificance: "Educational completion relates to 4th house and Jupiter influences"
        },
        {
          id: "edu_2", 
          text: "Did you change your field of study during your education?",
          type: "year_with_option",
          options: ["No change", "Bachelor's degree", "Master's degree", "PhD", "Professional certification"],
          importance: "medium",
          hint: "When did you switch your major or field of study?",
          bphsSignificance: "Field changes often correlate with Saturn dasha periods"
        }
      ]
    },
    career: {
      title: "Career Progress",
      icon: "💼",
      color: "green",
      description: "Professional journey and work milestones",
      questions: [
        {
          id: "car_1",
          text: "When did you start your first significant job?",
          type: "year",
          importance: "high",
          hint: "Your first long-term or career-oriented position",
          bphsSignificance: "Career start often aligns with 10th house activations"
        },
        {
          id: "car_2",
          text: "When did you receive your most significant promotion?",
          type: "year",
          importance: "high",
          hint: "Major career advancement or recognition",
          bphsSignificance: "Promotions relate to Sun dasha and Rajyoga periods"
        }
      ]
    },
    marriage: {
      title: "Relationship Milestones",
      icon: "💑", 
      color: "pink",
      description: "Significant relationship and family events",
      questions: [
        {
          id: "mar_1",
          text: "When did you get married (or enter committed partnership)?",
          type: "year",
          importance: "high",
          hint: "Include marriage or long-term commitment ceremony date",
          bphsSignificance: "Marriage timing relates to 7th house and Venus-Jupiter conjunctions"
        }
      ]
    },
    health: {
      title: "Health Events",
      icon: "🏥",
      color: "red",
      description: "Significant health-related events", 
      questions: [
        {
          id: "hel_1",
          text: "Did you experience any major health events?",
          type: "year_with_option",
          options: ["Major Surgery", "Chronic Illness", "Accident", "Recovery", "No major events"],
          importance: "medium",
          hint: "Include year if applicable",
          bphsSignificance: "Health events often correlate with 6th house and Mars-Saturn influences"
        }
      ]
    },
    relocation: {
      title: "Life Relocations",
      icon: "🏠",
      color: "purple",
      description: "Major moves and location changes",
      questions: [
        {
          id: "rel_1",
          text: "When did you move to a different city/country?",
          type: "year",
          importance: "medium",
          hint: "Include the year of significant relocation",
          bphsSignificance: "Relocation relates to 12th house and Rahu-Ketu periods"
        }
      ]
    },
    finance: {
      title: "Financial Milestones",
      icon: "💰",
      color: "gold",
      description: "Major financial achievements or changes",
      questions: [
        {
          id: "fin_1",
          text: "When did you achieve significant financial success?",
          type: "year",
          importance: "medium",
          hint: "Major investment return, business success, or wealth accumulation",
          bphsSignificance: "Financial gains relate to 2nd, 11th houses and Jupiter dasha"
        }
      ]
    }
  }), []);

  // API Connection Status Check - Production Grade
  useEffect(() => {
    const checkApiConnection = async () => {
      try {
        const response = await axios.get('/api/v1/health', { timeout: 5000 });
        if (response.data?.status === 'OK') {
          setApiConnectionStatus('connected');
        } else {
          throw new Error('API health check failed');
        }
      } catch (error) {
        console.error('API connection check failed:', error);
        setApiConnectionStatus('error');
        setError('Failed to connect to BTR service. Please check your internet connection and try again.');
      }
    };
    
    checkApiConnection();
  }, []); // Fixed missing dependency warning by removing apiConnectionStatus from deps

  // Progress tracking - Fixed missing dependencies warning
  useEffect(() => {
    if (onProgressUpdate) {
      const totalQuestions = Object.values(questionCategories).reduce((sum, cat) => sum + cat.questions.length, 0);
      const answeredQuestions = Object.keys(answers).length;
      const progressPercentage = totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0;
      
      onProgressUpdate({
        answeredQuestions,
        totalQuestions,
        progressPercentage,
        completedCategories: Array.from(completedCategories)
      });
    }
  }, [answers, completedCategories, onProgressUpdate, questionCategories]); // Added missing dependencies

  // Handlers for navigation
  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setCurrentStep('questions');
    setCurrentQuestionIndex(0);
  };

  const handleAnswer = (questionId, answer, date, questionText) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: {
        answer,
        date,
        questionText,
        category: selectedCategory,
        importance: questionCategories[selectedCategory].questions.find(q => q.id === questionId)?.importance
      }
    }));
  };

  const handleNextQuestion = () => {
    const currentCategory = questionCategories[selectedCategory];
    if (currentQuestionIndex < currentCategory.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      setCompletedCategories(prev => new Set([...prev, selectedCategory]));
      setCurrentStep('categories');
      setSelectedCategory(null);
    }
  };

  const handleBackToCategories = () => {
    setSelectedCategory(null);
    setCurrentStep('categories');
  };

  const handleSkipQuestion = (questionId) => {
    handleNextQuestion();
  };

  // Production grade event processing with MCP format and validation
  const handleSubmitAll = async () => {
    if (!onComplete) {
      throw new Error('onComplete callback is required for questionnaire completion');
    }

    try {
      setLoading(true);
      setError(null);

      // Validate answers before processing
      const answerEntries = Object.entries(answers);
      if (answerEntries.length === 0) {
        throw new Error('Please provide at least one life event before continuing');
      }

      // Process answers into MCP (Massively Connected Processing) format
      const formattedEvents = answerEntries
        .filter(([id, data]) => {
          // Include if has both date and answer
          if (data.date && data.answer) return true;
          
          // Also include "no event" type answers (last option in year_with_option questions)
          // These don't require dates and should be included for completeness
          const question = Object.values(questionCategories)
            .flatMap(cat => cat.questions)
            .find(q => q.id === id);
          
          if (question && question.type === 'year_with_option' && data.answer) {
            const isLastOption = question.options[question.options.length - 1] === data.answer;
            return isLastOption; // Include "No change" / "No major events" without date requirement
          }
          
          return false;
        })
        .map(([id, data]) => ({
          id: id,
          date: data.date,
          description: data.answer,
          category: data.category,
          importance: data.importance || 'medium',
          questionText: data.questionText,
          confidence: data.importance === 'high' ? 0.9 : data.importance === 'medium' ? 0.7 : 0.5,
          mcpCategory: mapToMCPCategory(data.category),
          bphsMethod: 'events-correlation',
          processedAt: new Date().toISOString()
        }))
        .sort((a, b) => {
          // Handle null dates - sort them to the end
          if (!a.date && !b.date) return 0;
          if (!a.date) return 1;
          if (!b.date) return -1;
          return new Date(a.date) - new Date(b.date); // Chronological order
        });

      if (formattedEvents.length === 0) {
        throw new Error('No valid events found. Please ensure at least one event has a date and description.');
      }

      // Update progress before completion
      onProgressUpdate({
        answeredQuestions: formattedEvents.length,
        totalQuestions: answerEntries.length,
        progressPercentage: 100,
        completedCategories: Array.from(completedCategories)
      });

      // Call onComplete with formatted data
      await onComplete(formattedEvents);

    } catch (error) {
      console.error('Life events processing failed:', error);
      setError(error.message || 'Failed to process life events. Please try again.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Helper to map categories to MCP format
  const mapToMCPCategory = (category) => {
    const mcpMappings = {
      education: 'academic-milestones',
      career: 'professional-achievements', 
      marriage: 'personal-relationships',
      health: 'medical-events',
      finance: 'financial-milestones',
      relocation: 'residence-changes'
    };
    return mcpMappings[category] || 'general-life-events';
  };

  // API Connection Status Component
  const APIConnectionStatus = () => {
    if (apiConnectionStatus === 'error') {
      return (
        <Alert type="error" className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold">🚨 Backend API Connection Error</p>
              <p className="text-sm">Unable to connect to the life events processing service.</p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => window.location.reload()}
            >
              Retry
            </Button>
          </div>
        </Alert>
      );
    }
    return null;
  };

  // Progress Bar Component
  const ProgressBar = () => {
    const totalQuestions = Object.values(questionCategories).reduce((sum, cat) => sum + cat.questions.length, 0);
    const answeredQuestions = Object.keys(answers).length;
    const progressPercentage = totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0;

    return (
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-600">
            Life Events Progress
          </span>
          <span className="text-sm text-gray-500">
            {answeredQuestions} of {totalQuestions} questions
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className="bg-gradient-to-r from-indigo-500 to-purple-600 h-3 rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>
    );
  };

  // Categories Grid Component
  const CategoriesGrid = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold text-gray-900">
          Select Life Event Categories
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Choose categories that apply to your life journey. Each event helps us determine your precise birth time using BPHS mathematical principles.
        </p>
      </div>

      <ProgressBar />

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(questionCategories).map(([key, category]) => {
          const isCompleted = completedCategories.has(key);
          const categoryAnswers = Object.values(answers).filter(a => a.category === key);
          
          return (
            <motion.div
              key={key}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => !isCompleted && handleCategorySelect(key)}
              className={`bg-white border-2 rounded-xl p-6 cursor-pointer transition-all duration-300 ${
                isCompleted 
                  ? 'border-green-400 bg-green-50' 
                  : 'border-indigo-200 hover:border-indigo-400 hover:shadow-lg'
              }`}
            >
              <div className="flex items-center space-x-4">
                <div className={`text-3xl ${isCompleted ? 'opacity-50' : ''}`}>
                  {category.icon}
                </div>
                <div className="flex-1">
                  <h3 className={`font-semibold text-lg ${isCompleted ? 'text-green-600' : 'text-gray-900'}`}>
                    {category.title}
                  </h3>
                  <p className="text-sm text-gray-600">{category.description}</p>
                  {categoryAnswers.length > 0 && (
                    <p className="text-xs text-indigo-600 mt-1">
                      {categoryAnswers.length} events added
                    </p>
                  )}
                </div>
              </div>
              
              {isCompleted && (
                <div className="flex items-center space-x-2 text-green-600">
                  <span className="text-sm">✓ Completed</span>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {Object.keys(answers).length > 0 && (
        <div className="text-center pt-6">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="cosmic"
              onClick={handleSubmitAll}
              disabled={loading}
              className="px-8 py-3 text-lg"
            >
              {loading ? (
                <span className="flex items-center gap-3">
                  <LoadingSpinner size="sm" />
                  <span>Processing Events...</span>
                </span>
              ) : (
                <span>Complete With {Object.keys(answers).length} Events</span>
              )}
            </Button>
          </motion.div>
        </div>
      )}
    </motion.div>
  );

  // Question Component
  const QuestionComponent = () => {
    const currentCategory = questionCategories[selectedCategory];
    const currentQuestion = currentCategory.questions[currentQuestionIndex];
    const currentAnswer = answers[currentQuestion.id];

    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="max-w-2xl mx-auto"
      >
        <Card className="border-2 border-indigo-200 shadow-lg">
          <div className="p-8">
            {/* Category Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{currentCategory.icon}</span>
                <h3 className="text-xl font-semibold text-gray-900">
                  {currentCategory.title}
                </h3>
              </div>
              <Button
                variant="ghost"
                onClick={handleBackToCategories}
                className="text-gray-500"
              >
                ← Back to Categories
              </Button>
            </div>

            {/* Question */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-sm font-semibold text-indigo-800">
                  {currentQuestionIndex + 1}/{currentCategory.questions.length}
                </div>
                <h4 className="text-lg font-medium text-gray-900">
                  {currentQuestion.text}
                </h4>
              </div>

              {currentQuestion.importance === 'high' && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <p className="text-sm text-amber-800">
                    ⭐ High importance for accurate birth time calculation
                  </p>
                </div>
              )}

              {/* BPHS Significance */}
              {currentQuestion.bphsSignificance && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-800">
                    📜 <strong>BPHS Significance:</strong> {currentQuestion.bphsSignificance}
                  </p>
                </div>
              )}

              {currentQuestion.hint && (
                <p className="text-sm text-gray-600 italic">{currentQuestion.hint}</p>
              )}

              {/* Answer Inputs */}
              {currentQuestion.type === 'year' && (
                <div className="space-y-4">
                  <input
                    type="date"
                    onChange={(e) => {
                      if (e.target.value) {
                        handleAnswer(currentQuestion.id, "Event occurred", e.target.value, currentQuestion.text);
                      }
                    }}
                    defaultValue={currentAnswer?.date || ''}
                    placeholder="Select date..."
                    className={`w-full px-4 py-3 rounded-lg border ${currentAnswer?.date ? 'border-indigo-400' : 'border-gray-300'} bg-white focus:outline-none focus:border-indigo-500 focus:bg-indigo-50`}
                    required
                  />
                </div>
              )}

              {currentQuestion.type === 'year_with_option' && (
                <div className="space-y-4">
                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        // Only store answer if date exists, otherwise store with null date for conditional date input to show
                        handleAnswer(currentQuestion.id, e.target.value, currentAnswer?.date || null, currentQuestion.text);
                      }
                    }}
                    defaultValue={currentAnswer?.answer || ''}
                    className={`w-full px-4 py-3 rounded-lg border ${currentAnswer?.answer ? 'border-indigo-400' : 'border-gray-300'} bg-white focus:outline-none focus:border-indigo-500 focus:bg-indigo-50`}
                  >
                    <option value="">Select option...</option>
                    {currentQuestion.options.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                  
                  {currentAnswer?.answer && currentAnswer?.answer !== currentQuestion.options[currentQuestion.options.length - 1] && (
                    <input
                      type="date"
                      onChange={(e) => {
                        if (e.target.value) {
                          handleAnswer(currentQuestion.id, currentAnswer.answer, e.target.value, currentQuestion.text);
                        }
                      }}
                      defaultValue={currentAnswer?.date || ''}
                      placeholder="When did this happen?"
                      className={`w-full px-4 py-3 rounded-lg border ${currentAnswer?.date ? 'border-indigo-400' : 'border-gray-300'} bg-white focus:outline-none focus:border-indigo-500 focus:bg-indigo-50`}
                    />
                  )}
                </div>
              )}

              {/* Navigation */}
              <div className="flex gap-3">
                <Button 
                  variant="ghost"
                  onClick={() => handleSkipQuestion(currentQuestion.id)}
                  className="text-gray-500"
                >
                  Skip
                </Button>
                <Button 
                  variant="cosmic"
                  onClick={handleNextQuestion}
                  disabled={!answers[currentQuestion.id]?.date}
                >
                  {currentQuestionIndex < currentCategory.questions.length - 1 ? 'Next' : 'Complete Category'}
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    );
  };

  // Production grade error boundary wrapper
  if (error) {
    return (
      <Alert type="error" className="m-6">
        <h3 className="font-semibold text-lg mb-2">Questionnaire Error</h3>
        <p>{error}</p>
        <Button 
          variant="secondary" 
          onClick={() => setError(null)}
          className="mt-3"
        >
          Try Again
        </Button>
      </Alert>
    );
  }

  // Main Render with loading state
  return (
    <div className="max-w-6xl mx-auto p-6">
      <APIConnectionStatus />
      
      {loading && (
        <div className="text-center py-8">
          <div className="inline-flex items-center space-x-3 text-indigo-600">
            <LoadingSpinner size="sm" />
            <span>Processing life events for BPHS analysis...</span>
          </div>
        </div>
      )}
      
      <AnimatePresence mode="wait">
        {!loading && (
          <>
            {currentStep === 'categories' && <CategoriesGrid />}
            {currentStep === 'questions' && <QuestionComponent />}
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default InteractiveLifeEventsQuestionnairePROD;
