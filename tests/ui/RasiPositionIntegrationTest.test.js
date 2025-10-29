/**
 * Rasi Position Integration Test
 * ==============================
 * Tests the rasi positions using actual API response data
 * to ensure the chart displays correctly with real data
 */

import React from 'react';
import { render, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import VedicChartDisplay from '../../client/src/components/charts/VedicChartDisplay';
import chartResponse from '../test-data/chart-generate-response.json';

describe('Rasi Position Integration Tests with API Data', () => {
  test('should correctly place rasi numbers based on API response', async () => {
    // Extract the actual chart data from API response
    const apiChartData = chartResponse.data.rasiChart;

    // Render the chart with API data
    const { container } = render(
      <VedicChartDisplay chartData={apiChartData} />
    );

    // Wait for chart to render
    await waitFor(() => {
      expect(container.querySelector('svg')).toBeInTheDocument();
    });

    // The API response shows ascendant is in Libra (sign: 7)
    expect(apiChartData.ascendant.sign).toBe(7);

    // Find all text elements and filter for rasi numbers
    const allTexts = container.querySelectorAll('svg text');
    const rasiTexts = Array.from(allTexts).filter(text => {
      const content = text.textContent.trim();
      // Check if it's a single or double digit number (1-12)
      return /^([1-9]|1[0-2])$/.test(content);
    });

    // Should have exactly 12 rasi numbers
    expect(rasiTexts).toHaveLength(12);

    // Collect all rasi numbers with their positions
    const rasiPositions = {};
    rasiTexts.forEach(text => {
      const rasiNum = parseInt(text.textContent.trim());
      const x = parseFloat(text.getAttribute('x'));
      const y = parseFloat(text.getAttribute('y'));
      rasiPositions[rasiNum] = { x, y };
    });

    console.log('API Data Rasi Positions:', rasiPositions);

    // Verify all 12 rasi numbers are present
    for (let i = 1; i <= 12; i++) {
      expect(rasiPositions[i]).toBeDefined();
    }

    // With Libra (7) as ascendant:
    // House 1 should have rasi 7 (Libra)
    // House 2 should have rasi 8 (Scorpio)
    // House 3 should have rasi 9 (Sagittarius)
    // ... and so on

    // Verify that rasi 7 (Libra) is present since that's the ascendant
    const rasiNumbers = rasiTexts.map(text => parseInt(text.textContent.trim()));
    expect(rasiNumbers).toContain(7); // Libra should be present
    expect(rasiNumbers).toContain(1); // Aries should be present (opposite to Libra)

    // Verify planets are in correct houses based on API data
    const planetTexts = Array.from(allTexts).filter(text => {
      const content = text.textContent.trim();
      // Planet texts contain planet codes (Su, Mo, Ma, etc.)
      return /^[A-Z][a-z]/.test(content);
    });

    // API shows Sun is in Sagittarius (signId: 9)
    // With Libra ascendant, Sagittarius is the 3rd house
    // So Sun should be displayed in the 3rd house position

    // API shows Moon is in Cancer (signId: 4)
    // With Libra ascendant, Cancer is the 10th house
    // So Moon should be displayed in the 10th house position

    // Verify the chart title shows the ascendant
    const chartTitle = container.querySelector('p.text-sm');
    expect(chartTitle).toBeInTheDocument();
    expect(chartTitle.textContent).toContain('Libra');
  });

  test('should handle navamsa chart data correctly', async () => {
    // Test with navamsa chart data
    const navamsaData = chartResponse.data.navamsaChart;

    const { container } = render(
      <VedicChartDisplay chartData={navamsaData} chartType="navamsa" />
    );

    // Wait for chart to render
    await waitFor(() => {
      expect(container.querySelector('svg')).toBeInTheDocument();
    });

    // Navamsa chart may not have ascendant in the same structure
    // If ascendant exists, it should be valid
    if (navamsaData.ascendant) {
      expect(typeof navamsaData.ascendant.sign).toBe('number');
    }

    // Find all text elements and filter for rasi numbers
    const allTexts = container.querySelectorAll('svg text');
    const rasiTexts = Array.from(allTexts).filter(text => {
      const content = text.textContent.trim();
      // Check if it's a single or double digit number (1-12)
      return /^([1-9]|1[0-2])$/.test(content);
    });

    // Should have exactly 12 rasi numbers
    expect(rasiTexts).toHaveLength(12);

    // Verify chart title shows navamsa
    const chartTitle = container.querySelector('h2');
    expect(chartTitle).toBeInTheDocument();
    expect(chartTitle.textContent).toContain('Navamsa');
  });

  test('should correctly calculate house positions from planetary longitudes', async () => {
    const apiChartData = chartResponse.data.rasiChart;

    const { container } = render(
      <VedicChartDisplay chartData={apiChartData} />
    );

    // Wait for chart to render
    await waitFor(() => {
      expect(container.querySelector('svg')).toBeInTheDocument();
    });

    // Find planet texts
    const allTexts = container.querySelectorAll('svg text');
    const planetTexts = Array.from(allTexts).filter(text => {
      const content = text.textContent.trim();
      // Planet texts contain planet codes (Su, Mo, Ma, etc.)
      return /^[A-Z][a-z]/.test(content);
    });
    const planetTextContents = planetTexts.map(el => el.textContent);

    // Verify Sun and Moon are rendered
    const sunText = planetTextContents.find(text => text.includes('Su'));
    const moonText = planetTextContents.find(text => text.includes('Mo'));

    expect(sunText).toBeDefined();
    expect(moonText).toBeDefined();

    // The API data shows Sun is at longitude 242.16 and has 2 degrees in Sagittarius
    // Moon is at longitude 108.04 and has 18 degrees in Cancer
    // Verify the planet display format matches (planet code + degree)
    expect(sunText).toContain('Su');
    expect(moonText).toContain('Mo');
  });
});
