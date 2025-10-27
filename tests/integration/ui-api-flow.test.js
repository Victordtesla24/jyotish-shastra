/**
 * Integration test for UI to API flow
 * Verifies the actual production implementation
 */

import UIToAPIDataInterpreter from '../../client/src/components/forms/UIToAPIDataInterpreter.js';

describe('UI to API Data Flow Integration', () => {
  let interpreter;

  beforeEach(() => {
    interpreter = new UIToAPIDataInterpreter();
  });

  test('validates and formats birth data correctly', () => {
    const birthData = {
      name: 'Test User',
      dateOfBirth: '1990-01-01',
      timeOfBirth: '12:00',
      latitude: 19.054999,
      longitude: 72.8692035,
      timezone: 'Asia/Kolkata',
      gender: 'male'
    };

    // Test validation
    const validationResult = interpreter.validateInput(birthData);
    console.log('Validation result:', validationResult);

    expect(validationResult.isValid).toBe(true);
    expect(validationResult.validatedData).toBeDefined();

    // Test formatting
    const formattedData = interpreter.formatForAPI(validationResult.validatedData, 'analysis');
    console.log('Formatted data:', formattedData);

    expect(formattedData.apiRequest).toBeDefined();
    expect(formattedData.apiRequest.formatted).toBe(true);
  });

  test('handles validation errors correctly', () => {
    const invalidData = {
      name: 'Test User',
      // Missing required fields
    };

    const validationResult = interpreter.validateInput(invalidData);
    console.log('Validation errors:', validationResult.errors);

    expect(validationResult.isValid).toBe(false);
    expect(validationResult.errors.length).toBeGreaterThan(0);
  });
});
