import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, Button, Select } from '../ui';
import { VedicLoadingSpinner } from '../ui/loading/VedicLoadingSpinner';

const DailyHoroscopeWidget = ({ userSign, onSignChange }) => {
  const [selectedSign, setSelectedSign] = useState(userSign || 'aries');
  const [horoscope, setHoroscope] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());

  const zodiacSigns = [
    { value: 'aries', label: 'Aries', sanskrit: 'मेष', symbol: '♈', color: '#FF4444' },
    { value: 'taurus', label: 'Taurus', sanskrit: 'वृष', symbol: '♉', color: '#4CAF50' },
    { value: 'gemini', label: 'Gemini', sanskrit: 'मिथुन', symbol: '♊', color: '#FFD700' },
    { value: 'cancer', label: 'Cancer', sanskrit: 'कर्क', symbol: '♋', color: '#C0C0C0' },
    { value: 'leo', label: 'Leo', sanskrit: 'सिंह', symbol: '♌', color: '#FFAC33' },
    { value: 'virgo', label: 'Virgo', sanskrit: 'कन्या', symbol: '♍', color: '#6B8E23' },
    { value: 'libra', label: 'Libra', sanskrit: 'तुला', symbol: '♎', color: '#FFC0CB' },
    { value: 'scorpio', label: 'Scorpio', sanskrit: 'वृश्चिक', symbol: '♏', color: '#800000' },
    { value: 'sagittarius', label: 'Sagittarius', sanskrit: 'धनु', symbol: '♐', color: '#6A0DAD' },
    { value: 'capricorn', label: 'Capricorn', sanskrit: 'मकर', symbol: '♑', color: '#4682B4' },
    { value: 'aquarius', label: 'Aquarius', sanskrit: 'कुम्भ', symbol: '♒', color: '#00BFFF' },
    { value: 'pisces', label: 'Pisces', sanskrit: 'मीन', symbol: '♓', color: '#DA70D6' }
  ];

  const currentSignData = zodiacSigns.find(sign => sign.value === selectedSign);

  // Mock horoscope data - in production, this would come from an API
  const generateHoroscope = (sign, date) => {
    const horoscopes = {
      aries: {
        overall: "Today brings dynamic energy and new opportunities. Your natural leadership qualities will be in the spotlight.",
        love: "Venus favors romantic connections. Single Aries may encounter someone special.",
        career: "Mars energizes your professional sector. Take initiative on important projects.",
        health: "High energy levels support physical activities. Stay hydrated throughout the day.",
        lucky: {
          number: 7,
          color: "Red",
          time: "10:00 AM - 12:00 PM",
          direction: "East"
        },
        rating: {
          overall: 8,
          love: 7,
          career: 9,
          health: 8
        }
      },
      // Add more signs as needed - this is a simplified example
    };

    return horoscopes[sign] || {
      overall: "The cosmic energies are aligned favorably for you today. Trust your intuition and embrace new possibilities.",
      love: "Planetary alignments suggest harmony in relationships and potential for meaningful connections.",
      career: "Professional matters receive cosmic support. Focus on your goals with determination.",
      health: "Maintain balance in all aspects of life. Listen to your body's needs.",
      lucky: {
        number: Math.floor(Math.random() * 9) + 1,
        color: currentSignData?.color || "#4CAF50",
        time: "9:00 AM - 11:00 AM",
        direction: "North"
      },
      rating: {
        overall: Math.floor(Math.random() * 3) + 7,
        love: Math.floor(Math.random() * 3) + 6,
        career: Math.floor(Math.random() * 3) + 7,
        health: Math.floor(Math.random() * 3) + 7
      }
    };
  };

  const fetchHoroscope = async (sign) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      const horoscopeData = generateHoroscope(sign, currentDate);
      setHoroscope(horoscopeData);
    } catch (error) {
      console.error('Error fetching horoscope:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHoroscope(selectedSign);
  }, [selectedSign, currentDate]);

  const handleSignChange = (newSign) => {
    setSelectedSign(newSign);
    if (onSignChange) {
      onSignChange(newSign);
    }
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const renderStarRating = (rating) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <motion.div
            key={star}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: star * 0.1 }}
          >
            <svg
              className={`w-4 h-4 ${
                star <= rating ? 'text-vedic-gold' : 'text-gray-300 dark:text-dark-border'
              }`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </motion.div>
        ))}
        <span className="ml-2 text-sm text-wisdom-gray dark:text-dark-text-secondary">
          {rating}/5
        </span>
      </div>
    );
  };

  return (
    <Card className="overflow-hidden">
      {/* Header */}
      <div className="relative p-6 pb-4">
        <div className="absolute inset-0 bg-gradient-to-br from-cosmic-purple/10 to-stellar-blue/10 dark:from-cosmic-purple/20 dark:to-stellar-blue/20"></div>

        <div className="relative">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-xl text-white font-bold shadow-lg"
                style={{ backgroundColor: currentSignData?.color }}
              >
                {currentSignData?.symbol}
              </div>
              <div>
                <h2 className="font-accent text-xl text-earth-brown dark:text-dark-text-primary">
                  Daily Horoscope
                </h2>
                <p className="text-sm text-wisdom-gray dark:text-dark-text-secondary">
                  {formatDate(currentDate)}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setCurrentDate(new Date())}
                className="text-xs"
              >
                Today
              </Button>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Select
              value={selectedSign}
              onChange={handleSignChange}
              className="flex-1"
            >
              {zodiacSigns.map((sign) => (
                <option key={sign.value} value={sign.value}>
                  {sign.symbol} {sign.label} ({sign.sanskrit})
                </option>
              ))}
            </Select>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 pt-0">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-8"
            >
              <VedicLoadingSpinner size="large" className="mx-auto mb-4" />
              <p className="text-wisdom-gray dark:text-dark-text-secondary">
                Consulting the cosmic energies...
              </p>
            </motion.div>
          ) : horoscope ? (
            <motion.div
              key="horoscope"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Overall Prediction */}
              <div>
                <h3 className="font-medium text-earth-brown dark:text-dark-text-primary mb-3 flex items-center">
                  <span className="text-xl mr-2">🔮</span>
                  Overall Prediction
                </h3>
                <p className="text-wisdom-gray dark:text-dark-text-secondary leading-relaxed">
                  {horoscope.overall}
                </p>
              </div>

              {/* Categories */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-earth-brown dark:text-dark-text-primary flex items-center">
                      <span className="text-lg mr-2">💕</span>
                      Love & Relationships
                    </h4>
                    {renderStarRating(horoscope.rating.love)}
                  </div>
                  <p className="text-sm text-wisdom-gray dark:text-dark-text-secondary">
                    {horoscope.love}
                  </p>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-earth-brown dark:text-dark-text-primary flex items-center">
                      <span className="text-lg mr-2">💼</span>
                      Career & Finance
                    </h4>
                    {renderStarRating(horoscope.rating.career)}
                  </div>
                  <p className="text-sm text-wisdom-gray dark:text-dark-text-secondary">
                    {horoscope.career}
                  </p>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-4 md:col-span-2">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-earth-brown dark:text-dark-text-primary flex items-center">
                      <span className="text-lg mr-2">🌿</span>
                      Health & Wellness
                    </h4>
                    {renderStarRating(horoscope.rating.health)}
                  </div>
                  <p className="text-sm text-wisdom-gray dark:text-dark-text-secondary">
                    {horoscope.health}
                  </p>
                </div>
              </div>

              {/* Lucky Elements */}
              <div className="bg-gradient-to-br from-vedic-gold/10 to-solar-orange/10 dark:from-vedic-gold/20 dark:to-solar-orange/20 rounded-lg p-4">
                <h4 className="font-medium text-earth-brown dark:text-dark-text-primary mb-3 flex items-center">
                  <span className="text-lg mr-2">🍀</span>
                  Lucky Elements
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl mb-1">🔢</div>
                    <div className="text-xs text-wisdom-gray dark:text-dark-text-secondary mb-1">Number</div>
                    <div className="font-bold text-earth-brown dark:text-dark-text-primary">
                      {horoscope.lucky.number}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl mb-1">🎨</div>
                    <div className="text-xs text-wisdom-gray dark:text-dark-text-secondary mb-1">Color</div>
                    <div className="flex items-center justify-center space-x-1">
                      <div
                        className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                        style={{ backgroundColor: horoscope.lucky.color }}
                      ></div>
                      <span className="text-xs font-medium text-earth-brown dark:text-dark-text-primary">
                        {horoscope.lucky.color}
                      </span>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl mb-1">⏰</div>
                    <div className="text-xs text-wisdom-gray dark:text-dark-text-secondary mb-1">Time</div>
                    <div className="text-xs font-medium text-earth-brown dark:text-dark-text-primary">
                      {horoscope.lucky.time}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl mb-1">🧭</div>
                    <div className="text-xs text-wisdom-gray dark:text-dark-text-secondary mb-1">Direction</div>
                    <div className="text-xs font-medium text-earth-brown dark:text-dark-text-primary">
                      {horoscope.lucky.direction}
                    </div>
                  </div>
                </div>
              </div>

              {/* Overall Rating */}
              <div className="text-center pt-4 border-t border-gray-100 dark:border-dark-border">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <span className="text-wisdom-gray dark:text-dark-text-secondary">Today's Overall Rating:</span>
                  {renderStarRating(horoscope.rating.overall)}
                </div>
                <p className="text-xs text-wisdom-gray dark:text-dark-text-secondary">
                  Cosmic energies are {horoscope.rating.overall >= 8 ? 'highly favorable' : horoscope.rating.overall >= 6 ? 'moderately supportive' : 'challenging but growth-oriented'} for {currentSignData?.label}
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-8"
            >
              <div className="text-4xl mb-3">🌙</div>
              <p className="text-wisdom-gray dark:text-dark-text-secondary">
                Unable to fetch cosmic insights. Please try again.
              </p>
              <Button
                variant="cosmic"
                size="sm"
                onClick={() => fetchHoroscope(selectedSign)}
                className="mt-4"
              >
                Retry
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Card>
  );
};

export default DailyHoroscopeWidget;
