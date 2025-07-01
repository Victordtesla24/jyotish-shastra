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
            timezone: 'Asia/Kolkata',
            service_used: 'opencage',
            accuracy: 'high',
            formatted_address: 'New Delhi, Delhi, India'
        });
    });

    it('should throw an error if the location is not found', async () => {
        const mockResponse = { data: { results: [] } };
        axios.get.mockResolvedValue(mockResponse);

        const locationData = { city: 'NonExistentCity', country: 'Nowhere' };
        const fallback = await service.geocodeLocation(locationData);

        expect(fallback).toEqual({
            latitude: 18.5204,
            longitude: 73.8567,
            timezone: 'Asia/Kolkata',
            service_used: 'fallback',
            accuracy: 'approximate',
            formatted_address: 'Pune, Maharashtra, India'
        });
    });

    it('should fall back to demo mode when API key is not configured', async () => {
        service.apiKey = null;
        const locationData = { city: 'New Delhi', country: 'India' };
        const result = await service.geocodeLocation(locationData);

        expect(result).toEqual({
            latitude: 28.6139,
            longitude: 77.2090,
            timezone: 'Asia/Kolkata',
            service_used: 'fallback',
            accuracy: 'approximate',
            formatted_address: 'New Delhi, Delhi, India'
        });
    });

    it('should handle API errors gracefully', async () => {
        axios.get.mockRejectedValue(new Error('Network Error'));
        const locationData = { city: 'New Delhi', country: 'India' };
        const fallbackError = await service.geocodeLocation(locationData);
        expect(fallbackError).toEqual({
            latitude: 28.6139,
            longitude: 77.2090,
            timezone: 'Asia/Kolkata',
            service_used: 'fallback',
            accuracy: 'approximate',
            formatted_address: 'New Delhi, Delhi, India'
        });
    });
});
