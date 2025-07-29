/**
 * Rasi Position Unit Test
 * =======================
 * Direct unit test for validating rasi positions in VedicChartDisplay component
 * This test validates that calculateRasiForHouse function works correctly
 * and that rasi numbers are positioned accurately based on ascendant
 */

import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import VedicChartDisplay from '../../client/src/components/charts/VedicChartDisplay';

// Mock chart data for testing
const mockChartData = {
  planets: [
    {
      name: "Sun",
      longitude: 193.25, // In Libra (7th sign)
      sign: "Libra",
      degree: 7.25,
      house: 1,
      dignity: "debilitated"
    },
    {
      name: "Moon",
      longitude: 289.5, // In Capricorn (10th sign)
      sign: "Capricorn",
      degree: 19.5,
      house: 4
    },
    {
      name: "Mars",
      longitude: 245.75, // In Sagittarius (9th sign)
      sign: "Sagittarius",
      degree: 5.75,
      house: 3
    }
  ],
  ascendant: {
    longitude: 193.0, // Libra ascendant
    sign: "Libra",
    degree: 7.0
  }
};

describe('Rasi Position Unit Tests', () => {
  test('calculateRasiForHouse should return correct rasi for each house', () => {
    // Test with Libra (7) ascendant
    const ascendantRasi = 7; // Libra

    // Expected rasi for each house with Libra ascendant
    const expectedRasis = {
      1: 7,   // House 1 = Libra (7)
      2: 8,   // House 2 = Scorpio (8)
      3: 9,   // House 3 = Sagittarius (9)
      4: 10,  // House 4 = Capricorn (10)
      5: 11,  // House 5 = Aquarius (11)
      6: 12,  // House 6 = Pisces (12)
      7: 1,   // House 7 = Aries (1)
      8: 2,   // House 8 = Taurus (2)
      9: 3,   // House 9 = Gemini (3)
      10: 4,  // House 10 = Cancer (4)
      11: 5,  // House 11 = Leo (5)
      12: 6   // House 12 = Virgo (6)
    };

    // Test the calculateRasiForHouse function by rendering component
    // and checking the rasi numbers in the SVG
    const { container } = render(
      <VedicChartDisplay chartData={mockChartData} />
    );

    // Find all text elements that contain rasi numbers
    const rasiTexts = container.querySelectorAll('svg text');
    const rasiNumbers = new Map();

    rasiTexts.forEach(text => {
      const content = text.textContent.trim();
      // Check if this is a rasi number (1-12)
      if (/^[1-9]$|^1[0-2]$/.test(content)) {
        const x = parseFloat(text.getAttribute('x'));
        const y = parseFloat(text.getAttribute('y'));
        rasiNumbers.set(content, { x, y });
      }
    });

    console.log('Found rasi numbers:', Array.from(rasiNumbers.entries()));

    // Verify that all 12 rasi numbers are present
    expect(rasiNumbers.size).toBe(12);

    // Verify each rasi number exists
    for (let i = 1; i <= 12; i++) {
      expect(rasiNumbers.has(i.toString())).toBe(true);
    }
  });

  test('should render chart with correct rasi positions', () => {
    const { container } = render(
      <VedicChartDisplay chartData={mockChartData} />
    );

    // Check that SVG is rendered
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();

    // Check that chart has correct dimensions
    expect(svg).toHaveAttribute('width', '500');
    expect(svg).toHaveAttribute('height', '500');

    // Find all rasi number text elements
    const rasiTexts = Array.from(container.querySelectorAll('svg text')).filter(text => {
      const content = text.textContent.trim();
      return /^[1-9]$|^1[0-2]$/.test(content);
    });

    // Should have exactly 12 rasi numbers
    expect(rasiTexts).toHaveLength(12);

    // Expected positions for each HOUSE (not rasi) from RASI_NUMBER_POSITIONS in VedicChartDisplay.jsx
    // These positions are where rasi numbers should appear based on house positions
    // Chart dimensions: CHART_SIZE = 500, PADDING = 60, CENTER_X = 250, CENTER_Y = 250
    const housePositions = {
      1: { x: 250, y: 160 },      // CENTER_X, PADDING + 100
      2: { x: 360, y: 140 },      // CENTER_X + 110, CENTER_Y - 110
      3: { x: 340, y: 250 },      // CHART_SIZE - PADDING - 100, CENTER_Y
      4: { x: 360, y: 360 },      // CENTER_X + 110, CENTER_Y + 110
      5: { x: 250, y: 340 },      // CENTER_X, CHART_SIZE - PADDING - 100
      6: { x: 140, y: 360 },      // CENTER_X - 110, CENTER_Y + 110
      7: { x: 160, y: 250 },      // PADDING + 100, CENTER_Y
      8: { x: 140, y: 140 },      // CENTER_X - 110, CENTER_Y - 110
      9: { x: 210, y: 210 },      // CENTER_X - 40, CENTER_Y - 40
      10: { x: 290, y: 210 },     // CENTER_X + 40, CENTER_Y - 40
      11: { x: 210, y: 290 },     // CENTER_X - 40, CENTER_Y + 40
      12: { x: 290, y: 290 }      // CENTER_X + 40, CENTER_Y + 40
    };

    // With Libra (7) ascendant, calculate which rasi should be in each house position
    const ascendantRasi = 7; // Libra
    const expectedRasiInHouse = {};
    for (let house = 1; house <= 12; house++) {
      // Calculate which rasi should be in this house
      let rasi = (ascendantRasi + house - 2) % 12 + 1;
      if (rasi <= 0) rasi += 12;
      if (rasi > 12) rasi = rasi - 12;
      expectedRasiInHouse[house] = rasi;
    }

    console.log('Expected rasi in each house:', expectedRasiInHouse);

    // Collect actual rasi text elements with their positions
    const actualRasiPositions = {};
    rasiTexts.forEach(text => {
      const rasiNum = parseInt(text.textContent.trim());
      const x = parseFloat(text.getAttribute('x'));
      const y = parseFloat(text.getAttribute('y'));

      // Find which house position this matches
      let matchedHouse = null;
      Object.entries(housePositions).forEach(([house, pos]) => {
        if (Math.abs(x - pos.x) < 1 && Math.abs(y - pos.y) < 1) {
          matchedHouse = parseInt(house);
        }
      });

      if (matchedHouse) {
        actualRasiPositions[matchedHouse] = rasiNum;
      }
    });

    console.log('Actual rasi in each house position:', actualRasiPositions);

    // Verify that each house has the correct rasi
    Object.entries(expectedRasiInHouse).forEach(([house, expectedRasi]) => {
      const actualRasi = actualRasiPositions[house];
      expect(actualRasi).toBe(expectedRasi);
    });
  });

  test('should calculate correct rasi sequence for different ascendants', () => {
    // Test with different ascendants
    const testCases = [
      {
        ascendant: 'Aries',
        ascendantRasi: 1,
        expectedHouse1: 1,
        expectedHouse7: 7
      },
      {
        ascendant: 'Cancer',
        ascendantRasi: 4,
        expectedHouse1: 4,
        expectedHouse7: 10
      },
      {
        ascendant: 'Libra',
        ascendantRasi: 7,
        expectedHouse1: 7,
        expectedHouse7: 1
      },
      {
        ascendant: 'Capricorn',
        ascendantRasi: 10,
        expectedHouse1: 10,
        expectedHouse7: 4
      }
    ];

    testCases.forEach(({ ascendant, ascendantRasi, expectedHouse1, expectedHouse7 }) => {
      const testData = {
        ...mockChartData,
        ascendant: {
          ...mockChartData.ascendant,
          sign: ascendant,
          longitude: (ascendantRasi - 1) * 30 + 15 // Middle of the sign
        }
      };

      const { container } = render(
        <VedicChartDisplay
          key={ascendant}
          chartData={testData}
        />
      );

      // Find the rasi text in house 1 position (using the correct coordinates)
      const house1Text = container.querySelector('text[x="250"][y="160"]');
      expect(house1Text).toBeInTheDocument();
      expect(house1Text.textContent).toBe(expectedHouse1.toString());

      // Find the rasi text in house 7 position (using the correct coordinates)
      const house7Text = container.querySelector('text[x="160"][y="250"]');
      expect(house7Text).toBeInTheDocument();
      expect(house7Text.textContent).toBe(expectedHouse7.toString());
    });
  });
});
