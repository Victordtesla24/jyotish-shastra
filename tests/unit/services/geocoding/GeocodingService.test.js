const GeocodingService = require('../../../../src/services/geocoding/GeocodingService.js');
const axios = require('axios');

jest.mock('axios');

describe('GeocodingService', () => {
    let service;

    beforeEach(() => {
        service = new GeocodingService();
        service.apiKey = 'test-api-key'; // Set a dummy API key for testing
    });

    it('should return coordinates for a valid location', async () => {
        const mockResponse = {
            data: {
                results: [{
                    geometry: { lat: 28.6139, lng: 77.2090 },
                    formatted: 'New Delhi, Delhi, India'
                }]
            }
        };
        axios.get.mockResolvedValue(mockResponse);

        const locationData = { city: 'New Delhi', country: 'India' };
        const result = await service.geocodeLocation(locationData);

        expect(result).toEqual({
            latitude: 28.6139,
            longitude: 77.2090,
            service_used: 'opencage',
            accuracy: 'high',
            formatted_address: 'New Delhi, Delhi, India'
        });
    });

    it('should throw an error if the location is not found', async () => {
        const mockResponse = { data: { results: [] } };
        axios.get.mockResolvedValue(mockResponse);

        const locationData = { city: 'NonExistentCity', country: 'Nowhere' };
        await expect(service.geocodeLocation(locationData)).rejects.toThrow('Location not found');
    });

    it('should throw an error if the API key is not configured', async () => {
        service.apiKey = null;
        const locationData = { city: 'New Delhi', country: 'India' };
        await expect(service.geocodeLocation(locationData)).rejects.toThrow('Geocoding API key not configured');
    });

    it('should handle API errors gracefully', async () => {
        axios.get.mockRejectedValue(new Error('Network Error'));
        const locationData = { city: 'New Delhi', country: 'India' };
        await expect(service.geocodeLocation(locationData)).rejects.toThrow('Geocoding API error: Network Error');
    });
});
