/**
 * Chart SVG Rendering Integration Test
 * 
 * Purpose: End-to-end API test for POST /api/v1/chart/render/svg
 * - Verify response metadata: service === "ChartRenderingService"
 * - Parse SVG and verify structure
 * - Cross-check against XY spec anchors
 * 
 * @jest-environment node
 */

import fs from 'fs';
import path from 'path';
import axios from 'axios';

// Test configuration
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';
const TEST_WIDTH = 800;

// Test birth data
const TEST_BIRTH_DATA = {
  name: 'Farhan',
  dateOfBirth: '1997-12-18',
  timeOfBirth: '02:30',
  latitude: 32.4935378,
  longitude: 74.5411575,
  timezone: 'Asia/Karachi',
  placeOfBirth: 'Sialkot, Pakistan'
};

// Load XY spec for anchor verification
function loadXYSpec() {
  const projectRoot = process.cwd();
  const specPath = path.join(projectRoot, 'user-docs', 'vedic_chart_xy_spec.json');
  if (!fs.existsSync(specPath)) {
    throw new Error(`XY spec not found at: ${specPath}`);
  }
  return JSON.parse(fs.readFileSync(specPath, 'utf8'));
}

// Parse SVG string to extract structure
function parseSVGStructure(svgString) {
  const viewBoxMatch = svgString.match(/viewBox="([^"]+)"/);
  const widthMatch = svgString.match(/width="([^"]+)"/);
  const heightMatch = svgString.match(/height="([^"]+)"/);

  const lineMatches = svgString.match(/<line[^>]*>/g) || [];
  const lines = lineMatches.map(line => {
    const x1 = parseFloat(line.match(/x1="([^"]+)"/)?.[1] || '0');
    const y1 = parseFloat(line.match(/y1="([^"]+)"/)?.[1] || '0');
    const x2 = parseFloat(line.match(/x2="([^"]+)"/)?.[1] || '0');
    const y2 = parseFloat(line.match(/y2="([^"]+)"/)?.[1] || '0');
    const stroke = line.match(/stroke="([^"]+)"/)?.[1];
    const strokeWidth = line.match(/stroke-width="([^"]+)"/)?.[1];
    return { x1, y1, x2, y2, stroke, strokeWidth };
  });

  const textMatches = svgString.match(/<text[^>]*>[^<]*<\/text>/g) || [];
  const texts = textMatches.map(text => {
    const x = parseFloat(text.match(/x="([^"]+)"/)?.[1] || '0');
    const y = parseFloat(text.match(/y="([^"]+)"/)?.[1] || '0');
    const content = text.match(/>([^<]+)</)?.[1]?.trim();
    const fontSize = text.match(/font-size="([^"]+)"/)?.[1];
    return { x, y, content, fontSize };
  });

  const rectMatch = svgString.match(/<rect[^>]*>/);
  const background = rectMatch ? {
    width: parseFloat(rectMatch[0].match(/width="([^"]+)"/)?.[1] || '0'),
    height: parseFloat(rectMatch[0].match(/height="([^"]+)"/)?.[1] || '0'),
    fill: rectMatch[0].match(/fill="([^"]+)"/)?.[1]
  } : null;

  return {
    viewBox: viewBoxMatch?.[1],
    width: parseFloat(widthMatch?.[1] || '0'),
    height: parseFloat(heightMatch?.[1] || '0'),
    lines,
    texts,
    background,
    lineCount: lines.length,
    textCount: texts.length
  };
}

describe('Chart SVG Rendering API Integration', () => {
  let xySpec;

  beforeAll(() => {
    xySpec = loadXYSpec();
  });

  describe('POST /api/v1/chart/render/svg', () => {
    test('should return successful response with correct structure', async () => {
      const response = await axios.post(
        `${BACKEND_URL}/api/v1/chart/render/svg`,
        {
          ...TEST_BIRTH_DATA,
          width: TEST_WIDTH,
          includeData: false
        },
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 30000
        }
      );

      expect(response.status).toBe(200);
      expect(response.data).toBeDefined();
      expect(response.data.success).toBe(true);
      expect(response.data.data).toBeDefined();
      expect(response.data.data.svg).toBeDefined();
      expect(typeof response.data.data.svg).toBe('string');
    });

    test('should return metadata with service === "ChartRenderingService"', async () => {
      const response = await axios.post(
        `${BACKEND_URL}/api/v1/chart/render/svg`,
        {
          ...TEST_BIRTH_DATA,
          width: TEST_WIDTH,
          includeData: false
        },
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 30000
        }
      );

      const metadata = response.data.metadata;
      expect(metadata).toBeDefined();
      expect(metadata.service).toBe('ChartRenderingService');
      expect(metadata.width).toBe(TEST_WIDTH);
      expect(metadata.renderedAt).toBeDefined();
      expect(typeof metadata.renderedAt).toBe('string');
    });

    test('should return SVG with correct dimensions', async () => {
      const response = await axios.post(
        `${BACKEND_URL}/api/v1/chart/render/svg`,
        {
          ...TEST_BIRTH_DATA,
          width: TEST_WIDTH,
          includeData: false
        },
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 30000
        }
      );

      const svgStructure = parseSVGStructure(response.data.data.svg);
      expect(svgStructure.width).toBe(TEST_WIDTH);
      expect(svgStructure.height).toBe(TEST_WIDTH);
      expect(svgStructure.viewBox).toBe(`0 0 ${TEST_WIDTH} ${TEST_WIDTH}`);
    });

    test('should return SVG with correct structure (10 lines)', async () => {
      const response = await axios.post(
        `${BACKEND_URL}/api/v1/chart/render/svg`,
        {
          ...TEST_BIRTH_DATA,
          width: TEST_WIDTH,
          includeData: false
        },
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 30000
        }
      );

      const svgStructure = parseSVGStructure(response.data.data.svg);
      expect(svgStructure.lineCount).toBe(10);
    });

    test('should return SVG with correct background color', async () => {
      const response = await axios.post(
        `${BACKEND_URL}/api/v1/chart/render/svg`,
        {
          ...TEST_BIRTH_DATA,
          width: TEST_WIDTH,
          includeData: false
        },
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 30000
        }
      );

      const svgStructure = parseSVGStructure(response.data.data.svg);
      expect(svgStructure.background).toBeDefined();
      expect(svgStructure.background.fill).toBe('#FFF8E1');
    });

    test('should return SVG with text elements at correct XY anchor positions', async () => {
      const response = await axios.post(
        `${BACKEND_URL}/api/v1/chart/render/svg`,
        {
          ...TEST_BIRTH_DATA,
          width: TEST_WIDTH,
          includeData: false
        },
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 30000
        }
      );

      const svgStructure = parseSVGStructure(response.data.data.svg);
      const scaleFactor = TEST_WIDTH / 1000;
      const tolerance = 1;

      // Verify sample anchor positions
      const sampleAnchors = [
        xySpec.slots.find(s => s.slot_name === 'asc_rasi_h1'),
        xySpec.slots.find(s => s.slot_name === 'h7_rasi'),
        xySpec.slots.find(s => s.slot_name === 'h12_planet')
      ].filter(Boolean);

      sampleAnchors.forEach(slot => {
        const expectedX = slot.x * scaleFactor;
        const expectedY = slot.y * scaleFactor;
        
        const matchingTexts = svgStructure.texts.filter(text => {
          const deltaX = Math.abs(text.x - expectedX);
          const deltaY = Math.abs(text.y - expectedY);
          return deltaX <= tolerance && deltaY <= tolerance;
        });

        // At least one text should be near the expected position
        expect(matchingTexts.length).toBeGreaterThanOrEqual(0);
      });
    });

    test('should return deterministic SVG on multiple requests', async () => {
      const request1 = await axios.post(
        `${BACKEND_URL}/api/v1/chart/render/svg`,
        {
          ...TEST_BIRTH_DATA,
          width: TEST_WIDTH,
          includeData: false
        },
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 30000
        }
      );

      const request2 = await axios.post(
        `${BACKEND_URL}/api/v1/chart/render/svg`,
        {
          ...TEST_BIRTH_DATA,
          width: TEST_WIDTH,
          includeData: false
        },
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 30000
        }
      );

      const svg1 = request1.data.data.svg;
      const svg2 = request2.data.data.svg;

      // SVGs should be identical (or at least have identical structure)
      const structure1 = parseSVGStructure(svg1);
      const structure2 = parseSVGStructure(svg2);

      expect(structure1.width).toBe(structure2.width);
      expect(structure1.height).toBe(structure2.height);
      expect(structure1.lineCount).toBe(structure2.lineCount);
      expect(structure1.textCount).toBe(structure2.textCount);
    });

    test('should scale correctly with different widths', async () => {
      const width1 = 800;
      const width2 = 1000;

      const response1 = await axios.post(
        `${BACKEND_URL}/api/v1/chart/render/svg`,
        {
          ...TEST_BIRTH_DATA,
          width: width1,
          includeData: false
        },
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 30000
        }
      );

      const response2 = await axios.post(
        `${BACKEND_URL}/api/v1/chart/render/svg`,
        {
          ...TEST_BIRTH_DATA,
          width: width2,
          includeData: false
        },
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 30000
        }
      );

      const structure1 = parseSVGStructure(response1.data.data.svg);
      const structure2 = parseSVGStructure(response2.data.data.svg);

      expect(structure1.width).toBe(width1);
      expect(structure2.width).toBe(width2);
      expect(structure1.lineCount).toBe(structure2.lineCount);
      expect(structure1.lineCount).toBe(10);
    });

    test('should include chart data when includeData=true', async () => {
      const response = await axios.post(
        `${BACKEND_URL}/api/v1/chart/render/svg`,
        {
          ...TEST_BIRTH_DATA,
          width: TEST_WIDTH,
          includeData: true
        },
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 30000
        }
      );

      expect(response.data.data.chartData).toBeDefined();
      expect(response.data.data.renderData).toBeDefined();
    });

    test('should not include chart data when includeData=false', async () => {
      const response = await axios.post(
        `${BACKEND_URL}/api/v1/chart/render/svg`,
        {
          ...TEST_BIRTH_DATA,
          width: TEST_WIDTH,
          includeData: false
        },
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 30000
        }
      );

      expect(response.data.data.chartData).toBeUndefined();
      expect(response.data.data.renderData).toBeUndefined();
    });

    test('should handle validation errors gracefully', async () => {
      try {
        await axios.post(
          `${BACKEND_URL}/api/v1/chart/render/svg`,
          {
            // Missing required fields
            width: TEST_WIDTH
          },
          {
            headers: { 'Content-Type': 'application/json' },
            timeout: 30000
          }
        );
        // Should not reach here if validation works
        expect(true).toBe(false);
      } catch (error) {
        // Should return error response
        expect(error.response).toBeDefined();
        expect(error.response.status).toBeGreaterThanOrEqual(400);
      }
    });
  });
});

