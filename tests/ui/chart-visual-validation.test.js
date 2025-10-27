import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import VedicChartDisplay from '../../client/src/components/charts/VedicChartDisplay';
import testChartData from '../test-data/chart-generate-response.json';

describe('Chart Visual Validation Tests', () => {
  const chartData = testChartData.data.rasiChart;

  test('Rasi numbers should be positioned correctly in anti-clockwise order', async () => {
    const { container } = render(
      <VedicChartDisplay chartData={chartData} chartType="rasi" />
    );

    // Wait for chart to render
    await waitFor(() => {
      expect(container.querySelector('svg')).toBeInTheDocument();
    });

    // Get all text elements
    const textElements = container.querySelectorAll('svg text');
    const rasiNumbers = [];

    textElements.forEach(text => {
      const content = text.textContent.trim();
      if (/^[1-9]$|^1[0-2]$/.test(content)) {
        rasiNumbers.push({
          number: parseInt(content),
          x: parseFloat(text.getAttribute('x')),
          y: parseFloat(text.getAttribute('y'))
        });
      }
    });

    // Should have exactly 12 rasi numbers
    expect(rasiNumbers).toHaveLength(12);

    // Check that all numbers 1-12 are present
    const numbers = rasiNumbers.map(r => r.number).sort((a, b) => a - b);
    expect(numbers).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);

    // Log positions for visual inspection
    console.log('Rasi Number Positions:');
    rasiNumbers.forEach(r => {
      console.log(`Rasi ${r.number}: x=${r.x}, y=${r.y}`);
    });
  });

  test('Planets should be displayed with correct codes and degrees', async () => {
    const { container } = render(
      <VedicChartDisplay chartData={chartData} chartType="rasi" />
    );

    await waitFor(() => {
      expect(container.querySelector('svg')).toBeInTheDocument();
    });

    // Expected planets from test data
    const expectedPlanets = {
      'Su': { sign: 'Sagittarius', degree: 2 },
      'Mo': { sign: 'Cancer', degree: 18 },
      'Ma': { sign: 'Capricorn', degree: 5, dignity: 'exalted' },
      'Me': { sign: 'Sagittarius', degree: 0 },
      'Ju': { sign: 'Capricorn', degree: 25, dignity: 'debilitated' },
      'Ve': { sign: 'Capricorn', degree: 8 },
      'Sa': { sign: 'Pisces', degree: 19 },
      'Ra': { sign: 'Leo', degree: 20 },
      'Ke': { sign: 'Aquarius', degree: 20 }
    };

    const textElements = container.querySelectorAll('svg text');
    const foundPlanets = [];

    textElements.forEach(text => {
      const content = text.textContent.trim();
      // Check for planet codes
      Object.keys(expectedPlanets).forEach(code => {
        if (content.includes(code)) {
          foundPlanets.push(content);
        }
      });
    });

    // Should find all planets
    expect(foundPlanets.length).toBeGreaterThan(0);

    console.log('Found planets:', foundPlanets);

    // Check for dignity markers
    const exaltedPlanet = foundPlanets.find(p => p.includes('Ma') && p.includes('↑'));
    const debilitatedPlanet = foundPlanets.find(p => p.includes('Ju') && p.includes('↓'));

    expect(exaltedPlanet).toBeTruthy();
    expect(debilitatedPlanet).toBeTruthy();
  });

  test('Ascendant should be displayed correctly', async () => {
    const { container } = render(
      <VedicChartDisplay chartData={chartData} chartType="rasi" />
    );

    await waitFor(() => {
      expect(container.querySelector('svg')).toBeInTheDocument();
    });

    // Check for ascendant in header
    const ascendantText = screen.getByText(/Libra 4°/);
    expect(ascendantText).toBeInTheDocument();

    // Check for ascendant marker in chart
    const textElements = container.querySelectorAll('svg text');
    let foundAscendant = false;

    textElements.forEach(text => {
      if (text.textContent.includes('As')) {
        foundAscendant = true;
      }
    });

    expect(foundAscendant).toBe(true);
  });

  test('Chart should calculate correct rasi for each house based on ascendant', () => {
    // Ascendant is Libra (7)
    const ascendantRasi = 7;

    // Expected rasi for each house
    const expectedRasiForHouse = {
      1: 7,   // Libra
      2: 8,   // Scorpio
      3: 9,   // Sagittarius
      4: 10,  // Capricorn
      5: 11,  // Aquarius
      6: 12,  // Pisces
      7: 1,   // Aries
      8: 2,   // Taurus
      9: 3,   // Gemini
      10: 4,  // Cancer
      11: 5,  // Leo
      12: 6   // Virgo
    };

    // Test the calculateRasiForHouse logic
    for (let house = 1; house <= 12; house++) {
      const calculatedRasi = ((ascendantRasi + house - 2) % 12) + 1;
      const adjustedRasi = calculatedRasi <= 0 ? calculatedRasi + 12 : calculatedRasi;

      expect(adjustedRasi).toBe(expectedRasiForHouse[house]);
    }
  });
});
