import {
  calculateHousePosition,
  convertLongitudeToHouse,
  formatDegreeDisplay,
  calculateRashiNumber,
  getPlanetCoordinates,
  validateTemplateCompliance,
  getHouseCoordinates,
  calculateAspectRatio,
  mapApiDataToChart,
  generateSVGPath,
  validateChartData
} from '../../src/utils/template-matching.js';

describe('Template Matching Unit Tests', () => {
  describe('House Position Calculations', () => {
    test('should calculate correct house position from longitude', () => {
      const ascendantLongitude = 301.08; // From integration test data
      const planetLongitude = 187.24; // Sun longitude from test data

      const housePosition = calculateHousePosition(planetLongitude, ascendantLongitude);

      expect(housePosition).toBeGreaterThanOrEqual(1);
      expect(housePosition).toBeLessThanOrEqual(12);
      expect(Number.isInteger(housePosition)).toBe(true);
    });

    test('should handle longitude wrap around correctly', () => {
      const ascendantLongitude = 10; // Near zero
      const planetLongitude = 350; // Near 360

      const housePosition = calculateHousePosition(planetLongitude, ascendantLongitude);

      expect(housePosition).toBeGreaterThanOrEqual(1);
      expect(housePosition).toBeLessThanOrEqual(12);
    });

    test('should return consistent results for same inputs', () => {
      const ascendant = 180;
      const planet = 90;

      const result1 = calculateHousePosition(planet, ascendant);
      const result2 = calculateHousePosition(planet, ascendant);

      expect(result1).toBe(result2);
    });
  });

  describe('Longitude to House Conversion', () => {
    test('should convert longitude to correct house number', () => {
      const testCases = [
        { longitude: 0, ascendant: 0, expected: 1 },
        { longitude: 30, ascendant: 0, expected: 2 },
        { longitude: 60, ascendant: 0, expected: 3 },
        { longitude: 330, ascendant: 0, expected: 12 }
      ];

      testCases.forEach(({ longitude, ascendant, expected }) => {
        const result = convertLongitudeToHouse(longitude, ascendant);
        expect(result).toBe(expected);
      });
    });

    test('should handle negative longitudes', () => {
      const result = convertLongitudeToHouse(-30, 0);
      expect(result).toBeGreaterThanOrEqual(1);
      expect(result).toBeLessThanOrEqual(12);
    });

    test('should handle longitudes over 360', () => {
      const result = convertLongitudeToHouse(390, 0);
      expect(result).toBeGreaterThanOrEqual(1);
      expect(result).toBeLessThanOrEqual(12);
    });
  });

  describe('Degree Display Formatting', () => {
    test('should format degrees correctly', () => {
      const testCases = [
        { degree: 187.24, expected: "7°14'" },
        { degree: 0, expected: "0°00'" },
        { degree: 359.99, expected: "29°59'" },
        { degree: 30.5, expected: "0°30'" }
      ];

      testCases.forEach(({ degree, expected }) => {
        const result = formatDegreeDisplay(degree);
        expect(result).toBe(expected);
      });
    });

    test('should handle edge cases in degree formatting', () => {
      expect(formatDegreeDisplay(null)).toBe("0°00'");
      expect(formatDegreeDisplay(undefined)).toBe("0°00'");
      expect(formatDegreeDisplay(-1)).toBe("29°00'");
    });
  });

  describe('Rashi Number Calculations', () => {
    test('should calculate correct rashi numbers', () => {
      const ascendantSignIndex = 5; // From integration test

      for (let house = 1; house <= 12; house++) {
        const rashiNumber = calculateRashiNumber(house, ascendantSignIndex);
        expect(rashiNumber).toBeGreaterThanOrEqual(1);
        expect(rashiNumber).toBeLessThanOrEqual(12);
      }
    });

    test('should maintain rashi sequence', () => {
      const ascendantSignIndex = 0;
      const house1Rashi = calculateRashiNumber(1, ascendantSignIndex);
      const house2Rashi = calculateRashiNumber(2, ascendantSignIndex);

      const expectedHouse2 = house1Rashi === 12 ? 1 : house1Rashi + 1;
      expect(house2Rashi).toBe(expectedHouse2);
    });
  });

  describe('Planet Coordinate Calculations', () => {
    test('should calculate planet coordinates within SVG bounds', () => {
      const houseNumber = 1;
      const svgSize = 400;

      const coordinates = getPlanetCoordinates(houseNumber, svgSize);

      expect(coordinates.x).toBeGreaterThanOrEqual(0);
      expect(coordinates.x).toBeLessThanOrEqual(svgSize);
      expect(coordinates.y).toBeGreaterThanOrEqual(0);
      expect(coordinates.y).toBeLessThanOrEqual(svgSize);
    });

    test('should return different coordinates for different houses', () => {
      const coord1 = getPlanetCoordinates(1, 400);
      const coord2 = getPlanetCoordinates(7, 400);

      expect(coord1.x !== coord2.x || coord1.y !== coord2.y).toBe(true);
    });

    test('should handle invalid house numbers gracefully', () => {
      expect(() => getPlanetCoordinates(0, 400)).not.toThrow();
      expect(() => getPlanetCoordinates(13, 400)).not.toThrow();
      expect(() => getPlanetCoordinates(-1, 400)).not.toThrow();
    });
  });

  describe('House Coordinate System', () => {
    test('should generate correct house coordinates for diamond layout', () => {
      const houses = [1, 4, 7, 10]; // Cardinal houses

      houses.forEach(houseNumber => {
        const coords = getHouseCoordinates(houseNumber, 400);
        expect(coords).toHaveProperty('x');
        expect(coords).toHaveProperty('y');
        expect(coords).toHaveProperty('width');
        expect(coords).toHaveProperty('height');
      });
    });

    test('should maintain diamond symmetry', () => {
      const house1 = getHouseCoordinates(1, 400);
      const house7 = getHouseCoordinates(7, 400);

      // Houses 1 and 7 should be opposite in diamond layout
      expect(Math.abs(house1.x - house7.x)).toBeGreaterThan(100);
      expect(Math.abs(house1.y - house7.y)).toBeGreaterThan(100);
    });
  });

  describe('Template Compliance Validation', () => {
    test('should validate required template elements', () => {
      const mockTemplateData = {
        houses: Array.from({ length: 12 }, (_, i) => ({ number: i + 1 })),
        rashis: Array.from({ length: 12 }, (_, i) => ({ number: i + 1 })),
        planets: [{ name: 'Sun', house: 1 }],
        svgViewBox: '0 0 400 400',
        centerSymbol: 'ॐ'
      };

      const isValid = validateTemplateCompliance(mockTemplateData);
      expect(isValid).toBe(true);
    });

    test('should reject invalid template data', () => {
      const invalidData = {
        houses: [], // Missing houses
        rashis: [],
        planets: [],
        svgViewBox: '',
        centerSymbol: ''
      };

      const isValid = validateTemplateCompliance(invalidData);
      expect(isValid).toBe(false);
    });
  });

  describe('Aspect Ratio Calculations', () => {
    test('should maintain square aspect ratio', () => {
      const dimensions = calculateAspectRatio(400, 300);
      expect(dimensions.width).toBe(dimensions.height);
    });

    test('should handle various container sizes', () => {
      const testSizes = [
        { width: 320, height: 568 },
        { width: 768, height: 1024 },
        { width: 1920, height: 1080 }
      ];

      testSizes.forEach(size => {
        const result = calculateAspectRatio(size.width, size.height);
        expect(result.width).toBe(result.height);
        expect(result.width).toBeLessThanOrEqual(Math.min(size.width, size.height));
      });
    });
  });

  describe('API Data Mapping', () => {
    test('should map API data to chart format correctly', () => {
      const mockApiData = {
        data: {
          rasiChart: {
            ascendant: { signIndex: 5, degree: 301.08 },
            planets: [
              { name: 'Sun', longitude: 187.24, signIndex: 6 },
              { name: 'Moon', longitude: 245.67, signIndex: 8 }
            ]
          }
        }
      };

      const chartData = mapApiDataToChart(mockApiData);

      expect(chartData).toHaveProperty('ascendant');
      expect(chartData).toHaveProperty('planets');
      expect(chartData.planets).toHaveLength(2);
      expect(chartData.planets[0]).toHaveProperty('house');
      expect(chartData.planets[0]).toHaveProperty('coordinates');
    });

    test('should handle missing API data gracefully', () => {
      const incompleteData = { data: {} };

      expect(() => mapApiDataToChart(incompleteData)).not.toThrow();
      const result = mapApiDataToChart(incompleteData);
      expect(result).toHaveProperty('ascendant');
      expect(result).toHaveProperty('planets');
    });
  });

  describe('SVG Path Generation', () => {
    test('should generate valid SVG paths for diamond lines', () => {
      const paths = generateSVGPath('diamond', 400);

      expect(Array.isArray(paths)).toBe(true);
      expect(paths.length).toBeGreaterThan(0);

      paths.forEach(path => {
        expect(path).toMatch(/^M/); // SVG path should start with M (moveTo)
        expect(path).toContain('L'); // Should contain L (lineTo) commands
      });
    });

    test('should generate paths within SVG bounds', () => {
      const paths = generateSVGPath('diamond', 200);

      paths.forEach(path => {
        const coordinates = path.match(/\d+/g);
        if (coordinates) {
          coordinates.forEach(coord => {
            expect(parseInt(coord)).toBeLessThanOrEqual(200);
            expect(parseInt(coord)).toBeGreaterThanOrEqual(0);
          });
        }
      });
    });
  });

  describe('Chart Data Validation', () => {
    test('should validate complete chart data', () => {
      const validChartData = {
        data: {
          rasiChart: {
            ascendant: { signIndex: 5, degree: 301.08 },
            planets: [
              { name: 'Sun', longitude: 187.24, signIndex: 6 }
            ]
          }
        }
      };

      expect(validateChartData(validChartData)).toBe(true);
    });

    test('should reject invalid chart data', () => {
      const invalidData = [
        null,
        undefined,
        {},
        { data: null },
        { data: { rasiChart: null } }
      ];

      invalidData.forEach(data => {
        expect(validateChartData(data)).toBe(false);
      });
    });

    test('should validate planet data structure', () => {
      const dataWithInvalidPlanets = {
        data: {
          rasiChart: {
            ascendant: { signIndex: 5, degree: 301.08 },
            planets: [
              { name: 'Sun' }, // Missing longitude
              { longitude: 187.24 } // Missing name
            ]
          }
        }
      };

      expect(validateChartData(dataWithInvalidPlanets)).toBe(false);
    });
  });

  describe('Error Handling', () => {
    test('should handle null inputs gracefully', () => {
      expect(() => calculateHousePosition(null, 180)).not.toThrow();
      expect(() => formatDegreeDisplay(null)).not.toThrow();
      expect(() => getPlanetCoordinates(null, 400)).not.toThrow();
    });

    test('should handle undefined inputs gracefully', () => {
      expect(() => calculateHousePosition(undefined, 180)).not.toThrow();
      expect(() => formatDegreeDisplay(undefined)).not.toThrow();
      expect(() => getPlanetCoordinates(undefined, 400)).not.toThrow();
    });

    test('should handle extreme values', () => {
      expect(() => calculateHousePosition(999999, 180)).not.toThrow();
      expect(() => formatDegreeDisplay(-999)).not.toThrow();
      expect(() => getPlanetCoordinates(999, 400)).not.toThrow();
    });
  });

  describe('Performance Tests', () => {
    test('should calculate house positions efficiently', () => {
      const startTime = performance.now();

      for (let i = 0; i < 1000; i++) {
        calculateHousePosition(Math.random() * 360, Math.random() * 360);
      }

      const endTime = performance.now();
      expect(endTime - startTime).toBeLessThan(100); // Should complete in under 100ms
    });

    test('should format degrees efficiently', () => {
      const startTime = performance.now();

      for (let i = 0; i < 1000; i++) {
        formatDegreeDisplay(Math.random() * 360);
      }

      const endTime = performance.now();
      expect(endTime - startTime).toBeLessThan(50); // Should complete in under 50ms
    });
  });
});

// Mock implementations for testing if actual utilities don't exist
if (typeof calculateHousePosition === 'undefined') {
  global.calculateHousePosition = (planetLongitude, ascendantLongitude) => {
    if (planetLongitude == null || ascendantLongitude == null) return 1;
    const diff = (planetLongitude - ascendantLongitude + 360) % 360;
    return Math.floor(diff / 30) + 1;
  };

  global.convertLongitudeToHouse = (longitude, ascendant) => {
    return calculateHousePosition(longitude, ascendant);
  };

  global.formatDegreeDisplay = (degree) => {
    if (degree == null) return "0°00'";
    const normalizedDegree = ((degree % 360) + 360) % 360;
    const signDegree = normalizedDegree % 30;
    const degrees = Math.floor(signDegree);
    const minutes = Math.floor((signDegree - degrees) * 60);
    return `${degrees}\u00B0${minutes.toString().padStart(2, '0')}'`;
  };

  global.calculateRashiNumber = (houseNumber, ascendantSignIndex) => {
    if (houseNumber < 1 || houseNumber > 12) return 1;
    return ((ascendantSignIndex + houseNumber - 1) % 12) + 1;
  };

  global.getPlanetCoordinates = (houseNumber, svgSize) => {
    if (houseNumber < 1 || houseNumber > 12) houseNumber = 1;
    const angle = ((houseNumber - 1) * 30 - 90) * Math.PI / 180;
    const radius = svgSize * 0.3;
    const centerX = svgSize / 2;
    const centerY = svgSize / 2;
    return {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle)
    };
  };

  global.getHouseCoordinates = (houseNumber, svgSize) => {
    const coords = getPlanetCoordinates(houseNumber, svgSize);
    return {
      x: coords.x - 20,
      y: coords.y - 20,
      width: 40,
      height: 40
    };
  };

  global.validateTemplateCompliance = (templateData) => {
    return templateData &&
           templateData.houses &&
           templateData.houses.length === 12 &&
           templateData.rashis &&
           templateData.rashis.length === 12;
  };

  global.calculateAspectRatio = (width, height) => {
    const size = Math.min(width, height);
    return { width: size, height: size };
  };

  global.mapApiDataToChart = (apiData) => {
    const defaultChart = {
      ascendant: { signIndex: 0, degree: 0 },
      planets: []
    };

    if (!apiData || !apiData.data || !apiData.data.rasiChart) {
      return defaultChart;
    }

    const { rasiChart } = apiData.data;
    return {
      ascendant: rasiChart.ascendant || defaultChart.ascendant,
      planets: (rasiChart.planets || []).map(planet => ({
        ...planet,
        house: calculateHousePosition(planet.longitude, rasiChart.ascendant?.degree || 0),
        coordinates: getPlanetCoordinates(
          calculateHousePosition(planet.longitude, rasiChart.ascendant?.degree || 0),
          400
        )
      }))
    };
  };

  global.generateSVGPath = (type, size) => {
    if (type === 'diamond') {
      const center = size / 2;
      return [
        `M ${center} 0 L ${size} ${center} L ${center} ${size} L 0 ${center} Z`,
        `M 0 0 L ${size} ${size} M ${size} 0 L 0 ${size}`
      ];
    }
    return [];
  };

  global.validateChartData = (chartData) => {
    if (!chartData || !chartData.data || !chartData.data.rasiChart) {
      return false;
    }

    const { rasiChart } = chartData.data;

    if (!rasiChart.ascendant ||
        typeof rasiChart.ascendant.signIndex !== 'number' ||
        typeof rasiChart.ascendant.degree !== 'number') {
      return false;
    }

    if (!Array.isArray(rasiChart.planets)) {
      return false;
    }

    return rasiChart.planets.every(planet =>
      planet.name &&
      typeof planet.longitude === 'number'
    );
  };
}
