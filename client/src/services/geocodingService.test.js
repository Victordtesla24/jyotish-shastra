import geocodingService from './geocodingService';

describe('GeocodingService', () => {
  beforeEach(() => {
    global.fetch.mockClear();
  });

  test('successfully geocodes a location', async () => {
    const mockResponse = {
      results: [{
        formatted: 'Pune, Maharashtra, India',
        geometry: {
          lat: 18.5204,
          lng: 73.8567
        },
        components: {
          city: 'Pune',
          state: 'Maharashtra',
          country: 'India'
        },
        annotations: {
          timezone: {
            name: 'Asia/Kolkata'
          }
        },
        confidence: 9
      }]
    };

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    });

    const result = await geocodingService.geocodeLocation('Pune, India');

    expect(result).toEqual({
      success: true,
      formatted: 'Pune, Maharashtra, India',
      latitude: 18.5204,
      longitude: 73.8567,
      components: {
        city: 'Pune',
        state: 'Maharashtra',
        country: 'India'
      },
      timezone: 'Asia/Kolkata',
      confidence: 9
    });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('https://api.opencagedata.com/geocode/v1/json')
    );
  });

  test('handles location not found', async () => {
    const mockResponse = {
      results: []
    };

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    });

    const result = await geocodingService.geocodeLocation('NonexistentPlace');

    expect(result).toEqual({
      success: false,
      error: 'Location not found',
      suggestions: expect.arrayContaining([
        expect.stringContaining('Add state/country for better accuracy')
      ])
    });
  });

  test('handles API error', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 403
    });

    const result = await geocodingService.geocodeLocation('Pune');

    expect(result).toEqual({
      success: false,
      error: 'Geocoding API error: 403',
      suggestions: expect.any(Array)
    });
  });

  test('handles network error', async () => {
    global.fetch.mockRejectedValueOnce(new Error('Network error'));

    const result = await geocodingService.geocodeLocation('Pune');

    expect(result).toEqual({
      success: false,
      error: 'Network error',
      suggestions: expect.any(Array)
    });
  });

  test('throws error for empty location', async () => {
    await expect(geocodingService.geocodeLocation('')).rejects.toThrow('Location is required for geocoding');
  });

  test('throws error when API key is not configured', async () => {
    // Temporarily remove the API key
    const originalKey = process.env.REACT_APP_GEOCODING_API_KEY;
    delete process.env.REACT_APP_GEOCODING_API_KEY;

    await expect(geocodingService.geocodeLocation('Pune')).rejects.toThrow('Geocoding API key is not configured');

    // Restore the API key
    process.env.REACT_APP_GEOCODING_API_KEY = originalKey;
  });

  test('validateCoordinates returns true for valid coordinates', () => {
    expect(geocodingService.validateCoordinates(18.5204, 73.8567)).toBe(true);
    expect(geocodingService.validateCoordinates(-90, -180)).toBe(true);
    expect(geocodingService.validateCoordinates(90, 180)).toBe(true);
    expect(geocodingService.validateCoordinates(0, 0)).toBe(true);
  });

  test('validateCoordinates returns false for invalid coordinates', () => {
    expect(geocodingService.validateCoordinates(91, 73)).toBe(false);
    expect(geocodingService.validateCoordinates(18, 181)).toBe(false);
    expect(geocodingService.validateCoordinates(-91, 73)).toBe(false);
    expect(geocodingService.validateCoordinates(18, -181)).toBe(false);
    expect(geocodingService.validateCoordinates('18', '73')).toBe(false);
    expect(geocodingService.validateCoordinates(null, 73)).toBe(false);
  });

  test('formatLocation returns formatted location string', () => {
    const geocodingResult = {
      success: true,
      components: {
        city: 'Pune',
        state: 'Maharashtra',
        country: 'India'
      },
      formatted: 'Pune, Maharashtra, India'
    };

    expect(geocodingService.formatLocation(geocodingResult)).toBe('Pune, Maharashtra, India');
  });

  test('formatLocation handles missing components', () => {
    const geocodingResult = {
      success: true,
      components: {
        town: 'Small Town',
        country: 'India'
      },
      formatted: 'Small Town, India'
    };

    expect(geocodingService.formatLocation(geocodingResult)).toBe('Small Town, India');
  });

  test('formatLocation returns empty string for failed geocoding', () => {
    const geocodingResult = {
      success: false
    };

    expect(geocodingService.formatLocation(geocodingResult)).toBe('');
  });

  test('generateLocationSuggestions provides helpful suggestions', () => {
    const suggestions = geocodingService.generateLocationSuggestions('Mumbai');

    expect(suggestions).toContain('Add state/country for better accuracy (e.g., "Mumbai, Maharashtra, India")');
    expect(suggestions).toContain('Try adding more details (e.g., "City, State, Country")');
  });

  test('generateLocationSuggestions handles location with commas', () => {
    const suggestions = geocodingService.generateLocationSuggestions('Mumbai, India');

    expect(suggestions).not.toContain('Add state/country for better accuracy (e.g., "Mumbai, Maharashtra, India")');
    expect(suggestions).toContain('Try adding more details (e.g., "City, State, Country")');
  });
});
