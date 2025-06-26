import React, { useState, useRef, useEffect } from 'react';
import { motion, PanInfo, useSpring, useTransform } from 'framer-motion';
import {
  OmIcon,
  MandalaIcon,
  SunIcon,
  MoonIcon,
  StarIcon,
  Card,
  Button
} from '../ui';
import { cn } from '../../lib/utils';

const MobileOptimizedChart = ({
  chartData,
  isLoading = false,
  className,
  onPlanetSelect,
  onHouseSelect
}) => {
  const [selectedPlanet, setSelectedPlanet] = useState(null);
  const [selectedHouse, setSelectedHouse] = useState(null);
  const [chartScale, setChartScale] = useState(1);
  const [chartPosition, setChartPosition] = useState({ x: 0, y: 0 });
  const [isGestureActive, setIsGestureActive] = useState(false);

  const chartRef = useRef(null);
  const x = useSpring(chartPosition.x);
  const y = useSpring(chartPosition.y);
  const scale = useSpring(chartScale);

  // Mock chart data if not provided
  const defaultChartData = {
    houses: [
      { id: 1, name: 'Lagna', planets: ['Su'], sign: 'Aries' },
      { id: 2, name: '2nd House', planets: ['Mo'], sign: 'Taurus' },
      { id: 3, name: '3rd House', planets: [], sign: 'Gemini' },
      { id: 4, name: '4th House', planets: ['Ma'], sign: 'Cancer' },
      { id: 5, name: '5th House', planets: ['Me'], sign: 'Leo' },
      { id: 6, name: '6th House', planets: [], sign: 'Virgo' },
      { id: 7, name: '7th House', planets: ['Ve'], sign: 'Libra' },
      { id: 8, name: '8th House', planets: ['Ju'], sign: 'Scorpio' },
      { id: 9, name: '9th House', planets: [], sign: 'Sagittarius' },
      { id: 10, name: '10th House', planets: ['Sa'], sign: 'Capricorn' },
      { id: 11, name: '11th House', planets: ['Ra'], sign: 'Aquarius' },
      { id: 12, name: '12th House', planets: ['Ke'], sign: 'Pisces' }
    ]
  };

  const data = chartData || defaultChartData;

  const planetIcons = {
    'Su': SunIcon,
    'Mo': MoonIcon,
    'Ma': StarIcon,
    'Me': StarIcon,
    'Ve': StarIcon,
    'Ju': StarIcon,
    'Sa': StarIcon,
    'Ra': StarIcon,
    'Ke': StarIcon
  };

  const planetColors = {
    'Su': 'text-orange-500',
    'Mo': 'text-gray-400',
    'Ma': 'text-red-500',
    'Me': 'text-green-500',
    'Ve': 'text-pink-500',
    'Ju': 'text-yellow-500',
    'Sa': 'text-purple-500',
    'Ra': 'text-indigo-500',
    'Ke': 'text-teal-500'
  };

  const handlePlanetClick = (planet, house) => {
    setSelectedPlanet(planet);
    setSelectedHouse(house);
    onPlanetSelect?.(planet, house);

    // Haptic feedback for mobile
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
  };

  const handleHouseClick = (house) => {
    setSelectedHouse(house);
    onHouseSelect?.(house);

    if (navigator.vibrate) {
      navigator.vibrate(30);
    }
  };

  const handlePan = (event, info) => {
    if (isGestureActive) {
      setChartPosition({
        x: chartPosition.x + info.delta.x,
        y: chartPosition.y + info.delta.y
      });
    }
  };

  const handlePinch = (event) => {
    event.preventDefault();
    if (event.touches?.length === 2) {
      const touch1 = event.touches[0];
      const touch2 = event.touches[1];
      const distance = Math.sqrt(
        Math.pow(touch2.clientX - touch1.clientX, 2) +
        Math.pow(touch2.clientY - touch1.clientY, 2)
      );

      // Simple pinch zoom (would need more sophisticated implementation for production)
      setChartScale(Math.max(0.5, Math.min(2, distance / 200)));
    }
  };

  useEffect(() => {
    const chartElement = chartRef.current;
    if (chartElement) {
      chartElement.addEventListener('touchstart', () => setIsGestureActive(true));
      chartElement.addEventListener('touchend', () => setIsGestureActive(false));
      chartElement.addEventListener('touchmove', handlePinch, { passive: false });

      return () => {
        chartElement.removeEventListener('touchstart', () => setIsGestureActive(true));
        chartElement.removeEventListener('touchend', () => setIsGestureActive(false));
        chartElement.removeEventListener('touchmove', handlePinch);
      };
    }
  }, []);

  const renderHouse = (house, index) => {
    const angle = (index * 30) - 90; // 30 degrees per house, starting from top
    const radius = 120;
    const x = Math.cos(angle * Math.PI / 180) * radius;
    const y = Math.sin(angle * Math.PI / 180) * radius;

    const isSelected = selectedHouse?.id === house.id;

    return (
      <motion.div
        key={house.id}
        className={cn(
          'absolute w-16 h-16 rounded-lg border-2 cursor-pointer',
          'flex flex-col items-center justify-center text-xs',
          'transition-all duration-300 touch-manipulation',
          isSelected
            ? 'border-saffron bg-saffron/20 shadow-lg scale-110'
            : 'border-gray-300 bg-white/80 hover:border-saffron/50'
        )}
        style={{
          left: `calc(50% + ${x}px - 2rem)`,
          top: `calc(50% + ${y}px - 2rem)`,
        }}
        whileTap={{ scale: 0.95 }}
        onClick={() => handleHouseClick(house)}
        layout
      >
        <div className="font-bold text-earth-brown">{house.id}</div>
        <div className="text-[10px] text-wisdom-gray">{house.sign.slice(0, 3)}</div>

        {/* Planets in house */}
        <div className="flex flex-wrap justify-center gap-1 mt-1">
          {house.planets.map((planet, idx) => {
            const PlanetIcon = planetIcons[planet] || StarIcon;
            return (
              <motion.div
                key={`${planet}-${idx}`}
                className={cn(
                  'w-3 h-3 cursor-pointer',
                  planetColors[planet] || 'text-gray-500'
                )}
                whileTap={{ scale: 1.2 }}
                onClick={(e) => {
                  e.stopPropagation();
                  handlePlanetClick(planet, house);
                }}
              >
                <PlanetIcon size={12} />
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    );
  };

  if (isLoading) {
    return (
      <Card className="p-8 text-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="inline-block mb-4"
        >
          <MandalaIcon size={48} className="text-saffron" />
        </motion.div>
        <p className="text-wisdom-gray">Generating your cosmic chart...</p>
      </Card>
    );
  }

  return (
    <div className={cn('w-full max-w-md mx-auto', className)}>
      <Card className="p-6">
        {/* Chart Header */}
        <div className="text-center mb-6">
          <h3 className="font-accent text-xl font-bold text-earth-brown mb-2">
            Birth Chart
          </h3>
          <div className="font-vedic text-saffron">जन्म कुंडली</div>
        </div>

        {/* Interactive Chart */}
        <motion.div
          ref={chartRef}
          className="relative w-80 h-80 mx-auto touch-pan-x touch-pan-y"
          drag
          onPan={handlePan}
          style={{ x, y, scale }}
          whileDrag={{ cursor: 'grabbing' }}
        >
          {/* Center Om Symbol */}
          <motion.div
            className="absolute inset-1/2 transform -translate-x-1/2 -translate-y-1/2"
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          >
            <OmIcon size={32} className="text-saffron" />
          </motion.div>

          {/* Chart Border */}
          <div className="absolute inset-4 border-2 border-cosmic-purple rounded-full opacity-20" />
          <div className="absolute inset-8 border border-saffron rounded-full opacity-30" />

          {/* Houses */}
          {data.houses.map((house, index) => renderHouse(house, index))}

          {/* Aspect Lines (simplified for mobile) */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
            <defs>
              <pattern id="starPattern" patternUnits="userSpaceOnUse" width="4" height="4">
                <circle cx="2" cy="2" r="0.5" fill="currentColor" />
              </pattern>
            </defs>
            {/* Example aspect lines */}
            <line x1="50%" y1="50%" x2="80%" y2="20%" stroke="url(#starPattern)" strokeWidth="1" />
            <line x1="50%" y1="50%" x2="20%" y2="80%" stroke="url(#starPattern)" strokeWidth="1" />
          </svg>
        </motion.div>

        {/* Chart Controls */}
        <div className="flex justify-center space-x-4 mt-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setChartScale(1);
              setChartPosition({ x: 0, y: 0 });
            }}
          >
            Reset View
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setChartScale(Math.min(2, chartScale + 0.2))}
          >
            Zoom In
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setChartScale(Math.max(0.5, chartScale - 0.2))}
          >
            Zoom Out
          </Button>
        </div>

        {/* Selection Info */}
        {(selectedPlanet || selectedHouse) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-4 bg-saffron/10 rounded-lg border border-saffron/20"
          >
            {selectedPlanet && (
              <div className="mb-2">
                <span className="font-semibold text-earth-brown">Planet: </span>
                <span className="text-saffron">{selectedPlanet}</span>
              </div>
            )}
            {selectedHouse && (
              <div>
                <span className="font-semibold text-earth-brown">House: </span>
                <span className="text-saffron">
                  {selectedHouse.name} ({selectedHouse.sign})
                </span>
              </div>
            )}
          </motion.div>
        )}

        {/* Mobile Instructions */}
        <div className="mt-4 text-xs text-wisdom-gray text-center space-y-1">
          <p>Tap planets and houses for details</p>
          <p>Drag to move • Pinch to zoom</p>
          <p>Touch and hold for planet information</p>
        </div>
      </Card>
    </div>
  );
};

export default MobileOptimizedChart;
