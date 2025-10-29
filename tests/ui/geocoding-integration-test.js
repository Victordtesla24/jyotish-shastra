/**
 * Geocoding Integration Test
 * Tests the geocoding functionality end-to-end including frontend-backend communication
 */

describe('Geocoding Integration Test', () => {
  const baseUrl = 'http://localhost:3002';

  test('should handle backend geocoding API correctly', async () => {
    // Test backend API directly
    const response = await fetch('http://localhost:3001/api/v1/geocoding/location', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ placeOfBirth: 'Bangalore, Karnataka, India' })
    });
    
    const data = await response.json();
    expect(response.ok).toBe(true);
    expect(data.success).toBe(true);
    
    if (data.data) {
      expect(data.data.latitude).toBeCloseTo(12.9716, 1);
      expect(data.data.longitude).toBeCloseTo(77.5946, 1);
      expect(data.data.timezone).toBe('Asia/Kolkata');
      expect(data.data.service_used).toBe('opencage');
    }
  });

  test('should return error for invalid location', async () => {
    // Test backend API with invalid location
    const response = await fetch('http://localhost:3001/api/v1/geocoding/location', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ placeOfBirth: 'InvalidLocationNameThatDoesNotExist12345' })
    });
    
    const data = await response.json();
    expect(response.ok).toBe(false);
    expect(data.success).toBeUndefined();
    expect(data.error).toContain('No geocoding results found');
  });

  test('should handle network errors gracefully', async () => {
    // Test backend API with malformed request to simulate network error
    const response = await fetch('http://localhost:3001/api/v1/geocoding/location', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{ invalid json }'
    });
    
    const data = await response.json();
    expect(response.ok).toBe(false);
    expect(data.success).toBeUndefined();
  });

  test('should geocode multiple Indian cities correctly', async () => {
    const cities = [
      { name: 'Mumbai, Maharashtra, India', lat: 19.0760, lng: 72.8777 },
      { name: 'Delhi, India', lat: 28.6139, lng: 77.2090 },
      { name: 'Chennai, Tamil Nadu, India', lat: 13.0827, lng: 80.2707 },
      { name: 'Kolkata, West Bengal, India', lat: 22.5726, lng: 88.3639 }
    ];

    for (const city of cities) {
      const response = await fetch('http://localhost:3001/api/v1/geocoding/location', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ placeOfBirth: city.name })
      });
      
      const data = await response.json();
      expect(response.ok).toBe(true);
      expect(data.success).toBe(true);
      expect(data.data.latitude).toBeCloseTo(city.lat, 1);
      expect(data.data.longitude).toBeCloseTo(city.lng, 1);
      expect(data.data.timezone).toBe('Asia/Kolkata');
    }
  });
});
