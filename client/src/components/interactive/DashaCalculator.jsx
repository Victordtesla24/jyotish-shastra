import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, Button, Input } from '../ui';
import { VedicLoadingSpinner } from '../ui/loading/VedicLoadingSpinner';

const DashaCalculator = ({ birthData, onDashaSelect }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [dashaData, setDashaData] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [viewMode, setViewMode] = useState('timeline'); // 'timeline' or 'current'
  const [selectedDasha, setSelectedDasha] = useState(null);
  const timelineRef = useRef(null);

  // Dasha periods in years
  const dashaPeriods = {
    'Sun': { period: 6, color: '#FF6B35', sanskrit: 'सूर्य' },
    'Moon': { period: 10, color: '#C0C0C0', sanskrit: 'चन्द्र' },
    'Mars': { period: 7, color: '#FF4444', sanskrit: 'मंगल' },
    'Rahu': { period: 18, color: '#8B4513', sanskrit: 'राहु' },
    'Jupiter': { period: 16, color: '#FFD700', sanskrit: 'गुरु' },
    'Saturn': { period: 19, color: '#4682B4', sanskrit: 'शनि' },
    'Mercury': { period: 17, color: '#32CD32', sanskrit: 'बुध' },
    'Ketu': { period: 7, color: '#8B0000', sanskrit: 'केतु' },
    'Venus': { period: 20, color: '#FF69B4', sanskrit: 'शुक्र' }
  };

  const dashaOrder = ['Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury', 'Ketu', 'Venus'];

  // Real backend service integration - no mock calculation
  const fetchDashaFromAPI = async (birthData) => {
    const response = await fetch('/api/v1/analysis/dasha', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(birthData)
    });

    if (!response.ok) {
      throw new Error(`Dasha API error: ${response.status}`);
    }

    const data = await response.json();
    return data.analysis?.dashaAnalysis || null;
  };

  const calculateDasha = async () => {
    if (!birthData?.dateOfBirth) {
      return;
    }

    setIsCalculating(true);
    try {
      // Real API integration - no mock calculation
      const result = await fetchDashaFromAPI(birthData);
      setDashaData(result);
    } catch (error) {
      console.error('Error calculating dasha:', error);
      // Show error state instead of mock data
      setDashaData(null);
    } finally {
      setIsCalculating(false);
    }
  };

  useEffect(() => {
    if (birthData?.dateOfBirth) {
      calculateDasha();
    }
  }, [birthData, selectedDate]);

  const handleDashaClick = (dasha) => {
    setSelectedDasha(dasha);
    if (onDashaSelect) {
      onDashaSelect(dasha);
    }
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const renderTimelineView = () => {
    if (!dashaData?.timeline) return null;

    const visibleDashas = dashaData.timeline.slice(0, 15); // Show first 15 dashas
    const totalWidth = 1200;
    const dashaHeight = 60;

    return (
      <div className="overflow-x-auto">
        <div className="relative" style={{ width: totalWidth, height: visibleDashas.length * (dashaHeight + 10) }}>
          {visibleDashas.map((dasha, index) => {
            const width = (dasha.period / 20) * 200; // Scale width based on period
            const planetData = dashaPeriods[dasha.planet];

            return (
              <motion.div
                key={`${dasha.planet}-${index}`}
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`absolute cursor-pointer rounded-lg shadow-lg transition-all duration-200 hover:shadow-xl ${
                  dasha.isCurrent ? 'ring-4 ring-vedic-gold ring-opacity-50' : ''
                } ${selectedDasha?.planet === dasha.planet && selectedDasha?.startAge === dasha.startAge ? 'ring-4 ring-cosmic-purple' : ''}`}
                style={{
                  top: index * (dashaHeight + 10),
                  width: Math.max(width, 120),
                  height: dashaHeight,
                  backgroundColor: planetData.color,
                  opacity: dasha.isCurrent ? 1 : 0.8
                }}
                onClick={() => handleDashaClick(dasha)}
              >
                <div className="p-3 h-full flex items-center justify-between text-white">
                  <div>
                    <div className="font-bold text-lg">{dasha.planet}</div>
                    <div className="text-sm opacity-90">{planetData.sanskrit}</div>
                  </div>
                  <div className="text-right text-sm">
                    <div>{dasha.period} years</div>
                    <div className="opacity-90">
                      Age {Math.round(dasha.startAge)}-{Math.round(dasha.endAge)}
                    </div>
                  </div>
                </div>

                {/* Progress bar for current dasha */}
                {dasha.isCurrent && (
                  <motion.div
                    className="absolute bottom-0 left-0 h-1 bg-vedic-gold"
                    initial={{ width: 0 }}
                    animate={{ width: `${dasha.progress}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                  />
                )}

                {/* Current indicator */}
                {dasha.isCurrent && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-vedic-gold rounded-full flex items-center justify-center text-xs font-bold text-earth-brown"
                  >
                    ●
                  </motion.div>
                )}
              </motion.div>
            );
          })}

          {/* Age markers */}
          <div className="absolute top-0 left-0 w-full">
            {[0, 20, 40, 60, 80, 100].map(age => (
              <div
                key={age}
                className="absolute top-0 h-full border-l border-gray-300 dark:border-dark-border opacity-30"
                style={{ left: (age / 120) * totalWidth }}
              >
                <div className="absolute -top-6 -left-4 text-xs text-wisdom-gray dark:text-dark-text-secondary font-medium">
                  {age}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderCurrentDashaView = () => {
    if (!dashaData?.currentDasha) return null;

    const currentDasha = dashaData.currentDasha;
    const planetData = dashaPeriods[currentDasha.planet];

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Current Dasha Card */}
        <Card className="overflow-hidden">
          <div
            className="h-32 flex items-center justify-center text-white relative"
            style={{ backgroundColor: planetData.color }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/20"></div>
            <div className="relative text-center">
              <div className="text-4xl font-bold mb-2">{currentDasha.planet}</div>
              <div className="text-lg opacity-90">{planetData.sanskrit}</div>
              <div className="text-sm opacity-75">Mahadasha</div>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-earth-brown dark:text-dark-text-primary mb-1">
                  {currentDasha.period} years
                </div>
                <div className="text-sm text-wisdom-gray dark:text-dark-text-secondary">
                  Total Period
                </div>
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold text-earth-brown dark:text-dark-text-primary mb-1">
                  {currentDasha.remainingYears?.toFixed(1)} years
                </div>
                <div className="text-sm text-wisdom-gray dark:text-dark-text-secondary">
                  Remaining
                </div>
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold text-earth-brown dark:text-dark-text-primary mb-1">
                  {currentDasha.progress?.toFixed(0)}%
                </div>
                <div className="text-sm text-wisdom-gray dark:text-dark-text-secondary">
                  Complete
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-6">
              <div className="flex justify-between text-sm text-wisdom-gray dark:text-dark-text-secondary mb-2">
                <span>{formatDate(currentDasha.startDate)}</span>
                <span>{formatDate(currentDasha.endDate)}</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-dark-border rounded-full h-3">
                <motion.div
                  className="h-3 rounded-full"
                  style={{ backgroundColor: planetData.color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${currentDasha.progress}%` }}
                  transition={{ duration: 1 }}
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Upcoming Dashas */}
        <Card>
          <div className="p-6">
            <h3 className="font-accent text-xl text-earth-brown dark:text-dark-text-primary mb-4">
              Upcoming Dashas
            </h3>

            <div className="space-y-3">
              {dashaData.timeline
                .filter(dasha => dasha.startAge > dashaData.currentAge)
                .slice(0, 5)
                .map((dasha, index) => {
                  const planetData = dashaPeriods[dasha.planet];
                  return (
                    <motion.div
                      key={`upcoming-${dasha.planet}-${index}`}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-dark-border rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-dark-surface transition-colors"
                      onClick={() => handleDashaClick(dasha)}
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: planetData.color }}
                        />
                        <div>
                          <div className="font-medium text-earth-brown dark:text-dark-text-primary">
                            {dasha.planet} ({planetData.sanskrit})
                          </div>
                          <div className="text-sm text-wisdom-gray dark:text-dark-text-secondary">
                            {formatDate(dasha.startDate)} - {formatDate(dasha.endDate)}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-earth-brown dark:text-dark-text-primary">
                          {dasha.period} years
                        </div>
                        <div className="text-sm text-wisdom-gray dark:text-dark-text-secondary">
                          Age {Math.round(dasha.startAge)}-{Math.round(dasha.endAge)}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
            </div>
          </div>
        </Card>
      </motion.div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-accent text-2xl text-earth-brown dark:text-dark-text-primary mb-2">
                Dasha Calculator
              </h2>
              <p className="text-wisdom-gray dark:text-dark-text-secondary">
                Explore your planetary periods and their timing
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant={viewMode === 'current' ? 'cosmic' : 'secondary'}
                size="sm"
                onClick={() => setViewMode('current')}
              >
                Current
              </Button>
              <Button
                variant={viewMode === 'timeline' ? 'cosmic' : 'secondary'}
                size="sm"
                onClick={() => setViewMode('timeline')}
              >
                Timeline
              </Button>
            </div>
          </div>

          {/* Date Input */}
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-wisdom-gray dark:text-dark-text-secondary mb-2">
                Analysis Date
              </label>
              <input
                type="date"
                value={selectedDate.toISOString().split('T')[0]}
                onChange={(e) => setSelectedDate(new Date(e.target.value))}
                className="w-full px-3 py-2 border border-gray-200 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-cosmic-purple focus:border-transparent bg-white dark:bg-dark-surface text-earth-brown dark:text-dark-text-primary"
              />
            </div>

            {dashaData && (
              <div className="text-center">
                <div className="text-lg font-bold text-earth-brown dark:text-dark-text-primary">
                  {dashaData.currentAge.toFixed(1)}
                </div>
                <div className="text-sm text-wisdom-gray dark:text-dark-text-secondary">
                  Current Age
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Content */}
      <AnimatePresence mode="wait">
        {isCalculating ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-12"
          >
            <VedicLoadingSpinner size="large" className="mx-auto mb-4" />
            <p className="text-wisdom-gray dark:text-dark-text-secondary">
              Calculating planetary periods...
            </p>
          </motion.div>
        ) : !birthData?.dateOfBirth ? (
          <motion.div
            key="no-data"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="text-6xl mb-4">📅</div>
            <h3 className="font-accent text-xl text-earth-brown dark:text-dark-text-primary mb-2">
              Birth Data Required
            </h3>
            <p className="text-wisdom-gray dark:text-dark-text-secondary">
              Please provide birth date and time to calculate your Dasha periods.
            </p>
          </motion.div>
        ) : (
          <motion.div
            key={viewMode}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {viewMode === 'timeline' ? (
              <Card>
                <div className="p-6">
                  <h3 className="font-accent text-xl text-earth-brown dark:text-dark-text-primary mb-6">
                    Dasha Timeline
                  </h3>
                  <div className="mb-4 text-sm text-wisdom-gray dark:text-dark-text-secondary">
                    Click on any dasha period for detailed information. Current dasha is highlighted with gold border.
                  </div>
                  {renderTimelineView()}
                </div>
              </Card>
            ) : (
              renderCurrentDashaView()
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Selected Dasha Details */}
      <AnimatePresence>
        {selectedDasha && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-accent text-xl text-earth-brown dark:text-dark-text-primary">
                    {selectedDasha.planet} Dasha Details
                  </h3>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setSelectedDasha(null)}
                  >
                    ✕
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-earth-brown dark:text-dark-text-primary mb-2">
                      Period Information
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-wisdom-gray dark:text-dark-text-secondary">Duration:</span>
                        <span className="text-earth-brown dark:text-dark-text-primary">{selectedDasha.period} years</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-wisdom-gray dark:text-dark-text-secondary">Start Date:</span>
                        <span className="text-earth-brown dark:text-dark-text-primary">{formatDate(selectedDasha.startDate)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-wisdom-gray dark:text-dark-text-secondary">End Date:</span>
                        <span className="text-earth-brown dark:text-dark-text-primary">{formatDate(selectedDasha.endDate)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-wisdom-gray dark:text-dark-text-secondary">Age Range:</span>
                        <span className="text-earth-brown dark:text-dark-text-primary">
                          {Math.round(selectedDasha.startAge)} - {Math.round(selectedDasha.endAge)} years
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-earth-brown dark:text-dark-text-primary mb-2">
                      Planetary Influence
                    </h4>
                    <div className="text-sm text-wisdom-gray dark:text-dark-text-secondary">
                      <p>
                        {selectedDasha.planet} ({dashaPeriods[selectedDasha.planet].sanskrit}) dasha brings the
                        influence of this planet into your life during this period. This is a time when the
                        qualities and energies associated with {selectedDasha.planet} will be particularly
                        prominent in your experiences and personal growth.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DashaCalculator;
