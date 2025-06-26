import React, { useState, useRef, useEffect } from 'react';
import { motion, useSpring } from 'framer-motion';
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

  // Convert chart data to house-based format
  const convertChartDataToHouses = () => {
    if (!chartData?.rasiChart) {
      return [];
    }

    const houses = [];

    // Create 12 houses
    for (let i = 1; i <= 12; i++) {
      const house = {
        id: i,
        name: i === 1 ? 'Lagna' : `${i}${getOrdinalSuffix(i)} House`,
        planets: [],
        sign: ''
      };

      // Get house sign from housePositions if available
      if (chartData.rasiChart.housePositions) {
        const housePosition = chartData.rasiChart.housePositions.find(h => h.houseNumber === i);
        house.sign = housePosition?.sign || '';
      }

      // Add ascendant to house 1
      if (i === 1 && chartData.rasiChart.ascendant) {
        house.planets.push('As');
      }

             // Find planets in this house
       if (chartData.rasiChart.planets && chartData.rasiChart.ascendant) {
         const ascendantLongitude = chartData.rasiChart.ascendant.longitude;

         chartData.rasiChart.planets.forEach(planet => {
           const planetLongitude = planet.longitude;

           // Calculate house number based on longitude difference
           let diff = planetLongitude - ascendantLongitude;

           // Normalize the difference to be between 0 and 360
           while (diff < 0) diff += 360;
           while (diff >= 360) diff -= 360;

           // Calculate which house (1-12) the planet is in
           const calculatedHouse = Math.floor(diff / 30) + 1;

           if (calculatedHouse === i) {
             // Convert planet names to abbreviations
             const planetAbbr = getPlanetAbbreviation(planet.name || planet.Name);
             house.planets.push(planetAbbr);
           }
         });
       }

      houses.push(house);
    }

    return houses;
  };

  const getPlanetAbbreviation = (planetName) => {
    const abbreviations = {
      'Sun': 'Su',
      'Moon': 'Mo',
      'Mars': 'Ma',
      'Mercury': 'Me',
      'Jupiter': 'Ju',
      'Venus': 'Ve',
      'Saturn': 'Sa',
      'Rahu': 'Ra',
      'Ketu': 'Ke'
    };
    return abbreviations[planetName] || planetName?.slice(0, 2) || '??';
  };

  const getOrdinalSuffix = (num) => {
    const j = num % 10;
    const k = num % 100;
    if (j === 1 && k !== 11) return 'st';
    if (j === 2 && k !== 12) return 'nd';
    if (j === 3 && k !== 13) return 'rd';
    return 'th';
  };

  const data = { houses: convertChartDataToHouses() };

  const planetIcons = {
    'Su': SunIcon,
    'Mo': MoonIcon,
    'Ma': StarIcon,
    'Me': StarIcon,
    'Ve': StarIcon,
    'Ju': StarIcon,
    'Sa': StarIcon,
    'Ra': StarIcon,
    'Ke': StarIcon,
    'As': OmIcon
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
    'Ke': 'text-teal-500',
    'As': 'text-blue-600'
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
        <h3 className="text-lg font-semibold text-earth-brown mb-2">Generating Chart...</h3>
        <p className="text-wisdom-gray">Calculating planetary positions</p>
      </Card>
    );
  }

  if (!chartData?.rasiChart) {
    console.warn('MobileOptimizedChart: Missing rasiChart data:', chartData);
    return (
      <Card className="p-8 text-center">
        <div className="text-6xl mb-4">📊</div>
        <h3 className="text-lg font-semibold text-earth-brown mb-2">Chart Layout Template</h3>
        <p className="text-wisdom-gray">Generate a birth chart to see your planetary positions</p>

      </Card>
    );
  }

  if (data.houses.length === 0) {
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
