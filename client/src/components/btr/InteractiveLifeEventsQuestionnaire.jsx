import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, Button, Alert } from '../ui';

const InteractiveLifeEventsQuestionnaire = ({ onComplete, onProgressUpdate }) => {
  // Production grade state management - explicit initialization
  const [currentStep, setCurrentStep] = useState('categories');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [answers, setAnswers] = useState({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [completedCategories, setCompletedCategories] = useState(new Set());
  const [error, setError] = useState(null);

  const questionCategories = {
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
          hint: "Include the year you graduated or received your final degree"
        },
        {
          id: "edu_2", 
          text: "Did you change your field of study during your education?",
          type: "year_with_option",
          options: ["No change", "Bachelor's degree", "Master's degree", "PhD", "Professional certification"],
          importance: "medium",
          hint: "When did you switch your major or field of study?"
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
          hint: "Your first long-term or career-oriented position"
        },
        {
          id: "car_2",
          text: "What was your most significant career change?",
          type: "year_with_option",
          options: ["First Job", "Major Promotion", "Career Change", "Started Business", "Retirement"],
          importance: "high",
          hint: "Include the year this career milestone occurred"
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
          hint: "Include marriage or long-term commitment ceremony date"
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
          hint: "Include year if applicable"
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
          text: "Did you relocate to a different city/state/country for significant reasons?",
          type: "year_with_option",
          options: ["Career move", "Family reasons", "Education", "Marriage", "Personal choice"],
          importance: "medium",
          hint: "Include year and location if applicable"
        }
      ]
    },
    finance: {
      title: "Financial Milestones",
      icon: "💰",
      color: "amber",
      description: "Significant financial events and achievements",
      questions: [
        {
          id: "fin_1",
          text: "What was your most significant financial event?",
          type: "year_with_option",
          options: ["Property Purchase", "Major Investment", "Business Profit/Loss", "Inheritance", "No major events"],
          importance: "medium",
          hint: "Include year if comfortable sharing"
        }
      ]
    }
  };

  // Notify parent of progress updates
  useEffect(() => {
    if (onProgressUpdate) {
      const totalQuestions = Object.values(questionCategories).reduce((acc, cat) => acc + cat.questions.length, 0);
      const answeredQuestions = Object.keys(answers).length;
      const progressPercentage = Math.round((answeredQuestions / totalQuestions) * 100);
      
      onProgressUpdate({
        answeredQuestions,
        totalQuestions,
        progressPercentage,
        completedCategories: Array.from(completedCategories)
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answers, completedCategories, onProgressUpdate]); // questionCategories omitted to prevent unnecessary re-renders

  const handleCategorySelect = (categoryKey) => {
    setSelectedCategory(categoryKey);
    setCurrentQuestionIndex(0);
    setCurrentStep('questions');
  };

  const handleAnswer = (questionId, answer, eventDate, eventDescription) => {
    const category = selectedCategory;
    const question = questionCategories[category].questions.find(q => q.id === questionId);
    
    setAnswers(prev => ({
      ...prev,
      [questionId]: {
        answer: eventDescription || answer,
        date: eventDate,
        category: category,
        importance: question.importance,
        questionText: question.text
      }
    }));
  };

  const handleNextQuestion = () => {
    const currentCategory = questionCategories[selectedCategory];
    const questions = currentCategory.questions;
    
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      // Category completed
      setCompletedCategories(prev => new Set([...prev, selectedCategory]));
      handleBackToCategories();
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleBackToCategories = () => {
    setSelectedCategory(null);
    setCurrentStep('categories');
  };

  const handleSkipQuestion = (questionId) => {
    // Skip this question and move to next
    handleNextQuestion();
  };

  const handleSubmitAll = () => {
    if (onComplete) {
      const formattedEvents = Object.entries(answers).map(([id, data]) => ({
        id,
        date: data.date,
        description: data.answer,
        category: data.category,
        importance: data.importance,
        questionText: data.questionText
      }));
      
      onComplete(formattedEvents);
    }
  };

  // Progress Bar Component
  const ProgressBar = () => (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-600">
          Life Events Progress
        </span>
        <span className="text-sm font-bold text-indigo-600">
          {answeredQuestions} of {totalQuestions} ({progressPercentage}%)
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3">
        <div 
          className="bg-gradient-to-r from-indigo-500 to-purple-600 h-3 rounded-full transition-all duration-500"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
    </div>
  );

  // Categories Grid Component
  const CategoriesGrid = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold text-gray-900">Life Events Categories</h2>
        <p className="text-lg text-gray-600">
          Select categories to provide life events that help improve birth time accuracy
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
              <div className="text-center space-y-3">
                <div className="text-4xl">{category.icon}</div>
                <h3 className="font-bold text-gray-900">{category.title}</h3>
                <p className="text-sm text-gray-600">{category.description}</p>
                <p className="text-xs text-gray-500">{category.questions.length} questions</p>
                
                {categoryAnswers.length > 0 && (
                  <div className="text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full">
                    {categoryAnswers.length} answered
                  </div>
                )}
                
                {isCompleted && (
                  <div className="text-green-600 font-bold flex items-center justify-center gap-2">
                    <span>✓</span> Completed
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {answeredQuestions > 0 && (
        <div className="text-center pt-6">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="cosmic"
              onClick={handleSubmitAll}
              className="px-8 py-3 text-lg"
            >
              Complete With {answeredQuestions} Events
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
        key={`${selectedCategory}-${currentQuestionIndex}`}
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        className="space-y-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="text-3xl">{currentCategory.icon}</div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">{currentCategory.title}</h3>
              <p className="text-sm text-gray-600">
                Question {currentQuestionIndex + 1} of {currentCategory.questions.length}
              </p>
            </div>
          </div>
          <Button 
            variant="ghost"
            onClick={handleBackToCategories}
            className="text-gray-600"
          >
            ← Back to Categories
          </Button>
        </div>

        <Card className="bg-white border-2 border-indigo-200 shadow-lg">
          <div className="space-y-6">
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                {currentQuestion.text}
              </h4>
              {currentQuestion.hint && (
                <p className="text-sm text-gray-600 italic">{currentQuestion.hint}</p>
              )}
            </div>

            {currentQuestion.type === 'year' && (
              <div className="space-y-4">
                <input
                  type="date"
                  onChange={(e) => {
                    if (e.target.value) {
                      handleAnswer(currentQuestion.id, "Event occurred", e.target.value, "Event occurred");
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
                      handleAnswer(currentQuestion.id, e.target.value, currentAnswer?.date || '', e.target.value);
                    }
                  }}
                  defaultValue={currentAnswer?.answer || ''}
                  className={`w-full px-4 py-3 rounded-lg border ${currentAnswer?.answer ? 'border-indigo-400' : 'border-gray-300'} bg-white focus:outline-none focus:border-indigo-500 focus:bg-indigo-50 mb-3`}
                >
                  <option value="">Select an option...</option>
                  {currentQuestion.options.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
                <input
                  type="date"
                  placeholder="When did this happen?"
                  onChange={(e) => {
                    if (e.target.value) {
                      handleAnswer(currentQuestion.id, currentAnswer?.answer || 'Event', e.target.value, currentAnswer?.answer || 'Event occurred');
                    }
                  }}
                  defaultValue={currentAnswer?.date || ''}
                  className={`w-full px-4 py-3 rounded-lg border ${currentAnswer?.date ? 'border-indigo-400' : 'border-gray-300'} bg-white focus:outline-none focus:border-indigo-500 focus:bg-indigo-50`}
                  required
                />
              </div>
            )}

            <div className="flex justify-between pt-4">
              <Button 
                variant="secondary"
                onClick={handlePreviousQuestion}
                disabled={currentQuestionIndex === 0}
              >
                Previous
              </Button>
              
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

  // Main Render
  return (
    <div className="max-w-6xl mx-auto p-6">
      <AnimatePresence mode="wait">
        {currentStep === 'categories' && <CategoriesGrid />}
        {currentStep === 'questions' && <QuestionComponent />}
      </AnimatePresence>
    </div>
  );
};

export default InteractiveLifeEventsQuestionnaire;
