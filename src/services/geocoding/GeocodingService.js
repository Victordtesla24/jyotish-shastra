/**
 * Geocoding Service
 * Handles conversion of place names to geographic coordinates
 * Integrates with OpenCage geocoding API
 */
import geocode from 'opencage-api-client';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

class GeocodingService {
  constructor() {
    this.apiKey = process.env.GEOCODING_API_KEY;
    this.apiUrl = 'https://api.opencagedata.com/geocode/v1/json';

    // Validate API key in non-test environments
    if (process.env.NODE_ENV !== 'test' && (!this.apiKey || this.apiKey === 'YOUR_OPENCAGE_API_KEY')) {
      throw new Error('GEOCODING_API_KEY is not configured. Please set it in your .env file.');
    }

    this.geocoder = geocode;
  }

  /**
   * Geocode a location to get latitude and longitude
   * @param {Object} locationData - Location details
   * @returns {Object} Geocoded location data
   * @throws {Error} If geocoding fails and no fallback is available
   */
  async geocodeLocation(locationData) {
    const { city, state, country, placeOfBirth } = locationData;
    const query = placeOfBirth || `${city}, ${state}, ${country}`;

    console.log('🌍 Geocoding request for:', query);

    // Check if API key is available
    if (!this.apiKey || this.apiKey === 'YOUR_OPENCAGE_API_KEY') {
      throw new Error('Geocoding API key is not configured or invalid');
    }

    // Production logic with enhanced error handling
    try {
      console.log('🔍 Calling OpenCage API...');
      const response = await this.geocoder.geocode({ q: query, key: this.apiKey });

      console.log('📡 OpenCage API response structure:', {
        hasResults: !!response?.results,
        resultsLength: response?.results?.length || 0
      });

      if (response && Array.isArray(response.results) && response.results.length > 0) {
        const { geometry, components, formatted, annotations } = response.results[0];
        const { lat, lng } = geometry;
        const timezone = annotations?.timezone?.name || '';

        console.log('✅ Geocoding successful:', { lat, lng, timezone, formatted });

        return {
          latitude: lat,
          longitude: lng,
          timezone: timezone,
          service_used: 'opencage',
          accuracy: 'high',
          formatted_address: formatted
        };
      } else {
        throw new Error('No geocoding results found for the provided location');
      }
    } catch (error) {
      console.error('❌ Geocoding API Error:', error.message);

      // Enhance error messages for better client handling
      if (error.response?.status === 401 || error.response?.status === 403) {
        throw new Error('Geocoding service authentication failed - invalid API key');
      } else if (error.response?.status === 429) {
        throw new Error('Geocoding service rate limit exceeded - please try again later');
      } else {
        throw new Error(`Geocoding service error: ${error.message}`);
      }
    }
  }

  /**
   * Validate coordinates
   * @param {number} latitude - Latitude
   * @param {number} longitude - Longitude
   * @returns {boolean} True if valid
   */
  validateCoordinates(latitude, longitude) {
    return latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180;
  }
}

export default GeocodingService;
