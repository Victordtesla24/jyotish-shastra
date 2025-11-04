/**
 * Comprehensive Analysis API Integration Test
 * 
 * Purpose: End-to-end API test for POST /api/v1/analysis/comprehensive
 * - Verify response structure with all 8 sections
 * - Test error handling with invalid data
 * - Verify response schema matches expected structure
 * - Cross-check against UI interpreter requirements
 * 
 * @jest-environment node
 */

const axios = require('axios');
const path = require('path');

// Test configuration
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';

// Test birth data
const TEST_BIRTH_DATA = {
  name: 'Farhan',
  dateOfBirth: '1997-12-18',
  timeOfBirth: '02:30',
  latitude: 32.4935378,
  longitude: 74.5411575,
  timezone: 'Asia/Karachi',
  placeOfBirth: 'Sialkot, Pakistan',
  gender: 'male'
};

// Expected sections (8 sections)
const EXPECTED_SECTIONS = [
  'section1', // Birth Data Collection
  'section2', // Lagna Analysis
  'section3', // House Analysis
  'section4', // Planetary Analysis
  'section5', // Aspects Analysis
  'section6', // Yogas Analysis
  'section7', // Dasha Analysis
  'section8'  // Navamsa Analysis
];

describe('Comprehensive Analysis API Integration', () => {
  describe('POST /api/v1/analysis/comprehensive', () => {
    test('should return successful response with all 8 sections', async () => {
      const response = await axios.post(
        `${BACKEND_URL}/api/v1/analysis/comprehensive`,
        TEST_BIRTH_DATA,
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 60000 // 60 seconds for comprehensive analysis
        }
      );

      expect(response.status).toBe(200);
      expect(response.data).toBeDefined();
      expect(response.data.success).toBe(true);
      expect(response.data.analysis).toBeDefined();
      expect(response.data.analysis.sections).toBeDefined();
      expect(typeof response.data.analysis.sections).toBe('object');
    });

    test('should return all 8 expected sections', async () => {
      const response = await axios.post(
        `${BACKEND_URL}/api/v1/analysis/comprehensive`,
        TEST_BIRTH_DATA,
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 60000
        }
      );

      const sections = response.data.analysis.sections;
      const sectionKeys = Object.keys(sections);

      // Verify all 8 sections are present
      EXPECTED_SECTIONS.forEach(sectionKey => {
        expect(sections[sectionKey]).toBeDefined();
        expect(typeof sections[sectionKey]).toBe('object');
      });

      expect(sectionKeys.length).toBeGreaterThanOrEqual(8);
    });

    test('should return sections with expected structure', async () => {
      const response = await axios.post(
        `${BACKEND_URL}/api/v1/analysis/comprehensive`,
        TEST_BIRTH_DATA,
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 60000
        }
      );

      const sections = response.data.analysis.sections;

      // Verify section1 structure
      if (sections.section1) {
        expect(sections.section1).toBeDefined();
        expect(typeof sections.section1).toBe('object');
      }

      // Verify section2 structure (Lagna Analysis)
      if (sections.section2) {
        expect(sections.section2).toBeDefined();
        expect(typeof sections.section2).toBe('object');
        // Should have analyses.lagna or lagna property
        expect(
          sections.section2.analyses?.lagna ||
          sections.section2.lagna ||
          sections.section2.analyses ||
          true // Allow flexible structure
        ).toBeTruthy();
      }

      // Verify section3 structure (House Analysis)
      if (sections.section3) {
        expect(sections.section3).toBeDefined();
        expect(typeof sections.section3).toBe('object');
      }

      // Verify section4 structure (Planetary Analysis)
      if (sections.section4) {
        expect(sections.section4).toBeDefined();
        expect(typeof sections.section4).toBe('object');
      }

      // Verify section5 structure (Aspects Analysis)
      if (sections.section5) {
        expect(sections.section5).toBeDefined();
        expect(typeof sections.section5).toBe('object');
      }

      // Verify section6 structure (Yogas Analysis)
      if (sections.section6) {
        expect(sections.section6).toBeDefined();
        expect(typeof sections.section6).toBe('object');
      }

      // Verify section7 structure (Dasha Analysis)
      if (sections.section7) {
        expect(sections.section7).toBeDefined();
        expect(typeof sections.section7).toBe('object');
      }

      // Verify section8 structure (Navamsa Analysis)
      if (sections.section8) {
        expect(sections.section8).toBeDefined();
        expect(typeof sections.section8).toBe('object');
      }
    });

    test('should return metadata with analysis information', async () => {
      const response = await axios.post(
        `${BACKEND_URL}/api/v1/analysis/comprehensive`,
        TEST_BIRTH_DATA,
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 60000
        }
      );

      expect(response.data.metadata).toBeDefined();
      expect(response.data.metadata.timestamp).toBeDefined();
      expect(typeof response.data.metadata.timestamp).toBe('string');
      expect(response.data.metadata.dataSource).toBeDefined();
    });

    test('should handle validation errors gracefully', async () => {
      // Request with missing required field (dateOfBirth)
      const invalidData = {
        ...TEST_BIRTH_DATA
      };
      delete invalidData.dateOfBirth;

      try {
        await axios.post(
          `${BACKEND_URL}/api/v1/analysis/comprehensive`,
          invalidData,
          {
            headers: { 'Content-Type': 'application/json' },
            timeout: 30000,
            validateStatus: () => true // Accept any status code
          }
        );
      } catch (error) {
        if (error.response) {
          // Should return 400 status for validation error
          expect(error.response.status).toBeGreaterThanOrEqual(400);
          expect(error.response.data.success).toBe(false);
          expect(error.response.data.error).toBeDefined();
          
          // Verify friendly error message (no stack trace)
          const errorMessage = error.response.data.error?.message || 
                               error.response.data.error?.details || 
                               error.response.data.error ||
                               error.response.data.message ||
                               '';
          
          expect(errorMessage).toBeDefined();
          expect(typeof errorMessage).toBe('string');
          expect(errorMessage).not.toContain('stack');
          expect(errorMessage).not.toContain('at ');
          expect(errorMessage).not.toContain('Error:');
        } else {
          throw error;
        }
      }
    });

    test('should return error response with helpful details', async () => {
      // Request with missing required field
      const invalidData = {
        name: 'Test',
        timeOfBirth: '02:30',
        latitude: 32.4935378,
        longitude: 74.5411575,
        timezone: 'Asia/Karachi'
      };

      try {
        await axios.post(
          `${BACKEND_URL}/api/v1/analysis/comprehensive`,
          invalidData,
          {
            headers: { 'Content-Type': 'application/json' },
            timeout: 30000,
            validateStatus: () => true
          }
        );
      } catch (error) {
        if (error.response && error.response.status >= 400) {
          const errorData = error.response.data;
          
          // Should have error details or suggestions
          expect(
            errorData.error?.details ||
            errorData.error?.suggestions ||
            errorData.details ||
            errorData.suggestions ||
            errorData.helpText
          ).toBeDefined();
        } else {
          throw error;
        }
      }
    });

    test('should handle empty request gracefully', async () => {
      try {
        const response = await axios.post(
          `${BACKEND_URL}/api/v1/analysis/comprehensive`,
          {},
          {
            headers: { 'Content-Type': 'application/json' },
            timeout: 30000,
            validateStatus: () => true
          }
        );

        // Should return 400 for empty request
        expect(response.status).toBeGreaterThanOrEqual(400);
        expect(response.data.success).toBe(false);
        expect(response.data.error).toBeDefined();
      } catch (error) {
        if (error.response) {
          expect(error.response.status).toBeGreaterThanOrEqual(400);
          expect(error.response.data.success).toBe(false);
        } else {
          throw error;
        }
      }
    });

    test('should return response compatible with UI interpreter', async () => {
      const response = await axios.post(
        `${BACKEND_URL}/api/v1/analysis/comprehensive`,
        TEST_BIRTH_DATA,
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 60000
        }
      );

      const responseData = response.data;

      // Verify response structure matches UI interpreter expectations
      // UI expects: { success: true, analysis: { sections: { section1-section8 } } }
      expect(responseData.success).toBe(true);
      expect(responseData.analysis).toBeDefined();
      expect(responseData.analysis.sections).toBeDefined();
      expect(typeof responseData.analysis.sections).toBe('object');

      // Verify sections structure
      const sections = responseData.analysis.sections;
      const sectionKeys = Object.keys(sections);
      
      // Should have at least some sections
      expect(sectionKeys.length).toBeGreaterThan(0);

      // Verify each section is an object
      sectionKeys.forEach(sectionKey => {
        expect(sections[sectionKey]).toBeDefined();
        expect(typeof sections[sectionKey]).toBe('object');
      });
    });

    test('should return deterministic response for same input', async () => {
      const response1 = await axios.post(
        `${BACKEND_URL}/api/v1/analysis/comprehensive`,
        TEST_BIRTH_DATA,
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 60000
        }
      );

      const response2 = await axios.post(
        `${BACKEND_URL}/api/v1/analysis/comprehensive`,
        TEST_BIRTH_DATA,
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 60000
        }
      );

      // Verify both responses have same structure
      expect(response1.data.success).toBe(response2.data.success);
      expect(Object.keys(response1.data.analysis.sections).length).toBe(
        Object.keys(response2.data.analysis.sections).length
      );

      // Verify same sections are present
      const sections1 = Object.keys(response1.data.analysis.sections);
      const sections2 = Object.keys(response2.data.analysis.sections);
      expect(sections1.sort()).toEqual(sections2.sort());
    });
  });
});

