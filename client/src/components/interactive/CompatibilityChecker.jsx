import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, Button, Select } from '../ui';
import { VedicLoadingSpinner } from '../ui/loading/VedicLoadingSpinner';

const CompatibilityChecker = ({ onAnalysisComplete }) => {
  const [person1, setPerson1] = useState({
    name: '',
    sign: 'aries',
    birthDate: ''
  });
  const [person2, setPerson2] = useState({
    name: '',
    sign: 'aries',
    birthDate: ''
  });
  const [compatibility, setCompatibility] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const zodiacSigns = [
    { value: 'aries', label: 'Aries', sanskrit: 'मेष', symbol: '♈', element: 'Fire', ruler: 'Mars' },
    { value: 'taurus', label: 'Taurus', sanskrit: 'वृष', symbol: '♉', element: 'Earth', ruler: 'Venus' },
    { value: 'gemini', label: 'Gemini', sanskrit: 'मिथुन', symbol: '♊', element: 'Air', ruler: 'Mercury' },
    { value: 'cancer', label: 'Cancer', sanskrit: 'कर्क', symbol: '♋', element: 'Water', ruler: 'Moon' },
    { value: 'leo', label: 'Leo', sanskrit: 'सिंह', symbol: '♌', element: 'Fire', ruler: 'Sun' },
    { value: 'virgo', label: 'Virgo', sanskrit: 'कन्या', symbol: '♍', element: 'Earth', ruler: 'Mercury' },
    { value: 'libra', label: 'Libra', sanskrit: 'तुला', symbol: '♎', element: 'Air', ruler: 'Venus' },
    { value: 'scorpio', label: 'Scorpio', sanskrit: 'वृश्चिक', symbol: '♏', element: 'Water', ruler: 'Mars' },
    { value: 'sagittarius', label: 'Sagittarius', sanskrit: 'धनु', symbol: '♐', element: 'Fire', ruler: 'Jupiter' },
    { value: 'capricorn', label: 'Capricorn', sanskrit: 'मकर', symbol: '♑', element: 'Earth', ruler: 'Saturn' },
    { value: 'aquarius', label: 'Aquarius', sanskrit: 'कुम्भ', symbol: '♒', element: 'Air', ruler: 'Saturn' },
    { value: 'pisces', label: 'Pisces', sanskrit: 'मीन', symbol: '♓', element: 'Water', ruler: 'Jupiter' }
  ];

  const getSignData = (signValue) => zodiacSigns.find(sign => sign.value === signValue);

  const calculateCompatibility = (sign1, sign2) => {
    const person1Data = getSignData(sign1);
    const person2Data = getSignData(sign2);

    // Element compatibility
    const elementCompatibility = {
      'Fire': { 'Fire': 85, 'Earth': 60, 'Air': 90, 'Water': 45 },
      'Earth': { 'Fire': 60, 'Earth': 80, 'Air': 55, 'Water': 85 },
      'Air': { 'Fire': 90, 'Earth': 55, 'Air': 75, 'Water': 60 },
      'Water': { 'Fire': 45, 'Earth': 85, 'Air': 60, 'Water': 90 }
    };

    // Ruler compatibility
    const rulerCompatibility = {
      'Sun': { 'Moon': 70, 'Mars': 80, 'Mercury': 75, 'Jupiter': 85, 'Venus': 60, 'Saturn': 40 },
      'Moon': { 'Sun': 70, 'Mars': 50, 'Mercury': 65, 'Jupiter': 80, 'Venus': 85, 'Saturn': 45 },
      'Mars': { 'Sun': 80, 'Moon': 50, 'Mercury': 60, 'Jupiter': 75, 'Venus': 65, 'Saturn': 55 },
      'Mercury': { 'Sun': 75, 'Moon': 65, 'Mars': 60, 'Jupiter': 70, 'Venus': 80, 'Saturn': 65 },
      'Jupiter': { 'Sun': 85, 'Moon': 80, 'Mars': 75, 'Mercury': 70, 'Venus': 75, 'Saturn': 60 },
      'Venus': { 'Sun': 60, 'Moon': 85, 'Mars': 65, 'Mercury': 80, 'Jupiter': 75, 'Saturn': 70 },
      'Saturn': { 'Sun': 40, 'Moon': 45, 'Mars': 55, 'Mercury': 65, 'Jupiter': 60, 'Venus': 70 }
    };

    const elementScore = elementCompatibility[person1Data.element]?.[person2Data.element] || 50;
    const rulerScore = rulerCompatibility[person1Data.ruler]?.[person2Data.ruler] || 50;

    // Specific sign combinations (some classic matches)
    const signSpecificBonus = {
      'aries-leo': 15, 'aries-sagittarius': 12, 'aries-gemini': 10,
      'taurus-virgo': 15, 'taurus-capricorn': 12, 'taurus-cancer': 10,
      'gemini-libra': 15, 'gemini-aquarius': 12, 'gemini-aries': 10,
      'cancer-scorpio': 15, 'cancer-pisces': 12, 'cancer-taurus': 10,
      'leo-aries': 15, 'leo-sagittarius': 12, 'leo-gemini': 8,
      'virgo-taurus': 15, 'virgo-capricorn': 12, 'virgo-cancer': 8,
      'libra-gemini': 15, 'libra-aquarius': 12, 'libra-leo': 10,
      'scorpio-cancer': 15, 'scorpio-pisces': 12, 'scorpio-virgo': 8,
      'sagittarius-aries': 12, 'sagittarius-leo': 12, 'sagittarius-libra': 8,
      'capricorn-taurus': 12, 'capricorn-virgo': 12, 'capricorn-scorpio': 8,
      'aquarius-gemini': 12, 'aquarius-libra': 12, 'aquarius-sagittarius': 8,
      'pisces-cancer': 12, 'pisces-scorpio': 12, 'pisces-capricorn': 6
    };

    const combinationKey1 = `${sign1}-${sign2}`;
    const combinationKey2 = `${sign2}-${sign1}`;
    const specificBonus = signSpecificBonus[combinationKey1] || signSpecificBonus[combinationKey2] || 0;

    const totalScore = Math.min(100, Math.round((elementScore + rulerScore) / 2 + specificBonus));

    return {
      overall: totalScore,
      element: elementScore,
      ruler: rulerScore,
      specific: specificBonus,
      category: totalScore >= 80 ? 'Excellent' : totalScore >= 65 ? 'Good' : totalScore >= 50 ? 'Fair' : 'Challenging',
      description: getCompatibilityDescription(totalScore, person1Data, person2Data)
    };
  };

  const getCompatibilityDescription = (score, person1Data, person2Data) => {
    if (score >= 80) {
      return {
        summary: "A harmonious and deeply compatible match with excellent potential for lasting happiness.",
        strengths: [
          "Natural understanding and communication",
          "Complementary energies and goals",
          "Strong emotional and intellectual connection",
          "Mutual support and growth"
        ],
        challenges: [
          "May become too comfortable and lack growth challenges",
          "Need to maintain individual identities"
        ],
        advice: "This is a naturally flowing relationship. Focus on maintaining excitement and individual growth while enjoying your strong bond."
      };
    } else if (score >= 65) {
      return {
        summary: "A promising match with good compatibility and potential for a strong relationship.",
        strengths: [
          "Good communication and understanding",
          "Shared values and interests",
          "Balanced give and take",
          "Potential for mutual growth"
        ],
        challenges: [
          "May need to work on some areas of communication",
          "Different approaches to certain life aspects"
        ],
        advice: "Focus on open communication and appreciating each other's differences. With effort, this can be a very fulfilling relationship."
      };
    } else if (score >= 50) {
      return {
        summary: "A workable match that requires understanding and compromise from both partners.",
        strengths: [
          "Opportunity for significant personal growth",
          "Can learn much from each other",
          "Potential for deep transformation"
        ],
        challenges: [
          "Different communication styles",
          "May have conflicting priorities",
          "Requires patience and understanding"
        ],
        advice: "Success depends on mutual respect, patience, and willingness to understand each other's perspectives. Focus on finding common ground."
      };
    } else {
      return {
        summary: "A challenging match that requires significant effort and understanding to work.",
        strengths: [
          "Opportunities for profound personal growth",
          "Can push each other to evolve",
          "Potential for transformation"
        ],
        challenges: [
          "Very different approaches to life",
          "Communication difficulties",
          "Conflicting values or goals"
        ],
        advice: "This relationship requires exceptional commitment, understanding, and compromise. Consider whether you're both willing to put in the significant effort required."
      };
    }
  };

  const analyzeCompatibility = async () => {
    if (!person1.name || !person2.name) {
      alert('Please enter names for both people');
      return;
    }

    setIsAnalyzing(true);
    try {
      // Simulate analysis time
      await new Promise(resolve => setTimeout(resolve, 2000));

      const result = calculateCompatibility(person1.sign, person2.sign);
      setCompatibility(result);
      setShowResults(true);

      if (onAnalysisComplete) {
        onAnalysisComplete(result);
      }
    } catch (error) {
      console.error('Error analyzing compatibility:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetAnalysis = () => {
    setShowResults(false);
    setCompatibility(null);
    setPerson1({ name: '', sign: 'aries', birthDate: '' });
    setPerson2({ name: '', sign: 'aries', birthDate: '' });
  };

  const renderCompatibilityMeter = (score) => {
    const getColor = (score) => {
      if (score >= 80) return '#4CAF50';
      if (score >= 65) return '#8BC34A';
      if (score >= 50) return '#FFC107';
      return '#FF5722';
    };

    return (
      <div className="relative w-32 h-32 mx-auto">
        <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
          {/* Background circle */}
          <circle
            cx="60"
            cy="60"
            r="50"
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="8"
            className="dark:stroke-dark-border"
          />
          {/* Progress circle */}
          <motion.circle
            cx="60"
            cy="60"
            r="50"
            fill="none"
            stroke={getColor(score)}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 50}`}
            initial={{ strokeDashoffset: 2 * Math.PI * 50 }}
            animate={{ strokeDashoffset: 2 * Math.PI * 50 * (1 - score / 100) }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, duration: 0.3 }}
              className="text-2xl font-bold text-earth-brown dark:text-dark-text-primary"
            >
              {score}%
            </motion.div>
            <div className="text-xs text-wisdom-gray dark:text-dark-text-secondary">
              {compatibility?.category}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card className="overflow-hidden">
      <div className="p-6">
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">💕</div>
          <h2 className="font-accent text-2xl text-earth-brown dark:text-dark-text-primary mb-2">
            Compatibility Checker
          </h2>
          <p className="text-wisdom-gray dark:text-dark-text-secondary">
            Discover the cosmic harmony between two souls
          </p>
        </div>

        <AnimatePresence mode="wait">
          {!showResults ? (
            <motion.div
              key="input"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-8"
            >
              {/* Person 1 */}
              <div className="bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20 rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <div className="w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center text-white font-bold mr-3">
                    1
                  </div>
                  <h3 className="font-medium text-earth-brown dark:text-dark-text-primary">
                    First Person
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-wisdom-gray dark:text-dark-text-secondary mb-2">
                      Name
                    </label>
                    <input
                      type="text"
                      value={person1.name}
                      onChange={(e) => setPerson1(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-200 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-cosmic-purple focus:border-transparent bg-white dark:bg-dark-surface text-earth-brown dark:text-dark-text-primary"
                      placeholder="Enter name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-wisdom-gray dark:text-dark-text-secondary mb-2">
                      Zodiac Sign
                    </label>
                    <select
                      value={person1.sign}
                      onChange={(e) => setPerson1(prev => ({ ...prev, sign: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-200 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-cosmic-purple focus:border-transparent bg-white dark:bg-dark-surface text-earth-brown dark:text-dark-text-primary"
                    >
                      {zodiacSigns.map(sign => (
                        <option key={sign.value} value={sign.value}>
                          {sign.symbol} {sign.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Person 2 */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold mr-3">
                    2
                  </div>
                  <h3 className="font-medium text-earth-brown dark:text-dark-text-primary">
                    Second Person
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-wisdom-gray dark:text-dark-text-secondary mb-2">
                      Name
                    </label>
                    <input
                      type="text"
                      value={person2.name}
                      onChange={(e) => setPerson2(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-200 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-cosmic-purple focus:border-transparent bg-white dark:bg-dark-surface text-earth-brown dark:text-dark-text-primary"
                      placeholder="Enter name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-wisdom-gray dark:text-dark-text-secondary mb-2">
                      Zodiac Sign
                    </label>
                    <select
                      value={person2.sign}
                      onChange={(e) => setPerson2(prev => ({ ...prev, sign: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-200 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-cosmic-purple focus:border-transparent bg-white dark:bg-dark-surface text-earth-brown dark:text-dark-text-primary"
                    >
                      {zodiacSigns.map(sign => (
                        <option key={sign.value} value={sign.value}>
                          {sign.symbol} {sign.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Analyze Button */}
              <div className="text-center">
                <Button
                  variant="cosmic"
                  size="lg"
                  onClick={analyzeCompatibility}
                  disabled={isAnalyzing || !person1.name || !person2.name}
                  className="px-8 py-3"
                >
                  {isAnalyzing ? (
                    <div className="flex items-center space-x-2">
                      <VedicLoadingSpinner size="small" />
                      <span>Analyzing Cosmic Harmony...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <span>🔮</span>
                      <span>Analyze Compatibility</span>
                    </div>
                  )}
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Header with names and signs */}
              <div className="text-center">
                <div className="flex items-center justify-center space-x-4 mb-4">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-pink-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mb-2">
                      {getSignData(person1.sign)?.symbol}
                    </div>
                    <div className="font-medium text-earth-brown dark:text-dark-text-primary">
                      {person1.name}
                    </div>
                    <div className="text-sm text-wisdom-gray dark:text-dark-text-secondary">
                      {getSignData(person1.sign)?.label}
                    </div>
                  </div>

                  <div className="text-4xl">💕</div>

                  <div className="text-center">
                    <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mb-2">
                      {getSignData(person2.sign)?.symbol}
                    </div>
                    <div className="font-medium text-earth-brown dark:text-dark-text-primary">
                      {person2.name}
                    </div>
                    <div className="text-sm text-wisdom-gray dark:text-dark-text-secondary">
                      {getSignData(person2.sign)?.label}
                    </div>
                  </div>
                </div>
              </div>

              {/* Compatibility Score */}
              <div className="text-center">
                {renderCompatibilityMeter(compatibility?.overall || 0)}
                <h3 className="font-accent text-xl text-earth-brown dark:text-dark-text-primary mt-4 mb-2">
                  {compatibility?.category} Match
                </h3>
              </div>

              {/* Detailed Analysis */}
              <div className="space-y-4">
                <div className="bg-gradient-to-br from-vedic-gold/10 to-solar-orange/10 dark:from-vedic-gold/20 dark:to-solar-orange/20 rounded-lg p-4">
                  <h4 className="font-medium text-earth-brown dark:text-dark-text-primary mb-2">
                    Overall Assessment
                  </h4>
                  <p className="text-wisdom-gray dark:text-dark-text-secondary text-sm leading-relaxed">
                    {compatibility?.description?.summary}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                    <h4 className="font-medium text-earth-brown dark:text-dark-text-primary mb-3 flex items-center">
                      <span className="text-green-500 mr-2">✓</span>
                      Strengths
                    </h4>
                    <ul className="space-y-1">
                      {compatibility?.description?.strengths?.map((strength, index) => (
                        <li key={index} className="text-sm text-wisdom-gray dark:text-dark-text-secondary flex items-start">
                          <span className="text-green-500 mr-2 mt-0.5">•</span>
                          {strength}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
                    <h4 className="font-medium text-earth-brown dark:text-dark-text-primary mb-3 flex items-center">
                      <span className="text-yellow-500 mr-2">⚠</span>
                      Areas to Work On
                    </h4>
                    <ul className="space-y-1">
                      {compatibility?.description?.challenges?.map((challenge, index) => (
                        <li key={index} className="text-sm text-wisdom-gray dark:text-dark-text-secondary flex items-start">
                          <span className="text-yellow-500 mr-2 mt-0.5">•</span>
                          {challenge}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-cosmic-purple/10 to-stellar-blue/10 dark:from-cosmic-purple/20 dark:to-stellar-blue/20 rounded-lg p-4">
                  <h4 className="font-medium text-earth-brown dark:text-dark-text-primary mb-2 flex items-center">
                    <span className="text-cosmic-purple mr-2">💡</span>
                    Cosmic Advice
                  </h4>
                  <p className="text-wisdom-gray dark:text-dark-text-secondary text-sm leading-relaxed">
                    {compatibility?.description?.advice}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-center space-x-4 pt-4">
                <Button
                  variant="secondary"
                  onClick={resetAnalysis}
                >
                  New Analysis
                </Button>
                <Button
                  variant="cosmic"
                  onClick={() => window.print()}
                >
                  Save Results
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Card>
  );
};

export default CompatibilityChecker;
