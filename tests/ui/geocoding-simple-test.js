/**
 * Simple Geocoding Integration Test - No Puppeteer
 * Tests geocoding service directly without browser automation
 */

describe('Geocoding Simple Test', () => {
  test('backend geocoding integration', async () => {
    // Test backend service directly
    const response = await fetch('http://localhost:3001/api/v1/geocoding/location', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ placeOfBirth: 'Bangalore, Karnataka, India' })
    });
    
    expect(response.ok).toBe(true);
    const data = await response.json();
    expect(data.success).toBe(true);
    
    if (data.data) {
      expect(data.data.latitude).toBeCloseTo(12.9716, 1);
      expect(data.data.longitude).toBeCloseTo(77.5946, 1);
      expect(data.data.timezone).toBe('Asia/Kolkata');
    }
  });

  test('backend geocoding with invalid location', async () => {
    // Test backend service with invalid location
    const response = await fetch('http://localhost:3001/api/v1/geocoding/location', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ placeOfBirth: 'InvalidLocationNameThatDoesNotExist12345' })
    });
    
    expect(response.ok).toBe(false);
    const data = await response.json();
    expect(data.success).toBeUndefined(); // Should be false or undefined on error
    expect(data.error).toBeDefined();
  });

  test('backend geocoding with pune location', async () => {
    // Test backend service with pune
    const response = await fetch('http://localhost:3001/api/v1/geocoding/location', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ placeOfBirth: 'Pune, Maharashtra, India' })
    });
    
    expect(response.ok).toBe(true);
    const data = await response.json();
    expect(data.success).toBe(true);
    
    if (data.data) {
      expect(data.data.latitude).toBeCloseTo(18.5204, 1);
      expect(data.data.longitude).toBeCloseTo(73.8567, 1);
      expect(data.data.timezone).toBe('Asia/Kolkata');
      expect(data.data.service_used).toBe('opencage');
    }
  });
});
