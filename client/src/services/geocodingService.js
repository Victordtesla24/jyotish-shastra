/**
 * Enhanced Geocoding Service with Multi-Service Fallback Architecture
 * Implements robust fallback system for Vedic astrology coordinate precision
 */

const BACKEND_GEOCODING_URL = 'http://localhost:3001/api/v1/geocoding/location';

class GeocodingService {
  constructor() {
    // Define fallback services in order of preference
    this.fallbackServices = [
      'backend',
      'opencage', 
      'nominatim'
    ];
    
    // Rate limiting for OpenStreetMap Nominatim
    this.lastNominatimCall = 0;
    this.NOMINATIM_DELAY = 1000; // 1 second between requests
  }

  /**
   * Geocode a location string to coordinates with multi-service fallback
   * @param {string} location - Location string (e.g., "Pune, Maharashtra, India")
   * @returns {Promise<Object>} - Geocoding result with coordinates
   */
  async geocodeLocation(location) {
    if (!location || location.trim() === '') {
      throw new Error('Location is required for geocoding');
    }

    // Try each service in order until one succeeds
    for (const service of this.fallbackServices) {
      try {
        const result = await this.geocodeWithService(location, service);
        if (result.success) {
          console.log(`✅ Geocoding successful using ${service} service`);
          return {
            ...result,
            service_used: service
          };
        }
      } catch (error) {
        console.warn(`⚠️ ${service} geocoding failed:`, error.message);
        continue;
      }
    }

    // All services failed
    return {
      success: false,
      error: 'All geocoding services failed',
      formatted: 'Unknown location',
      latitude: 19.0760, // Default to Mumbai
      longitude: 72.8777,
      timezone: 'Asia/Kolkata',
      confidence: 'low'
    };
  }

  /**
   * Geocode using specific service
   * @param {string} location - Location string
   * @param {string} service - Service name ('backend', 'opencage', 'nominatim')
   * @returns {Promise<Object>} - Geocoding result
   */
  async geocodeWithService(location, service) {
    switch (service) {
      case 'backend':
        return this.geocodeWithBackend(location);
      case 'opencage':
        return this.geocodeWithOpenCage(location);
      case 'nominatim':
        return this.geocodeWithNominatim(location);
      default:
        throw new Error(`Unknown geocoding service: ${service}`);
    }
  }

  /**
   * Backend geocoding service
   * @param {string} location - Location string
   * @returns {Promise<Object>} - Geocoding result
   */
  async geocodeWithBackend(location) {
    const response = await fetch(BACKEND_GEOCODING_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ placeOfBirth: location })
    });

    if (!response.ok) {
      throw new Error(`Backend API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.success && data.data) {
      return {
        success: true,
        formatted: data.data.formatted_address || location,
        latitude: data.data.latitude,
        longitude: data.data.longitude,
        timezone: data.data.timezone || 'UTC',
        confidence: data.data.accuracy || 'high'
      };
    } else {
      throw new Error('Backend geocoding failed');
    }
  }

  /**
   * OpenCage geocoding service fallback
   * @param {string} location - Location string
   * @returns {Promise<Object>} - Geocoding result
   */
  async geocodeWithOpenCage(location) {
    // Try to get API key from environment or use demo key for development
    const apiKey = process.env.REACT_APP_OPENCAGE_API_KEY || 'demo_key_temporary_until_you_get_real_key';
    
    if (apiKey === 'demo_key_temporary_until_you_get_real_key') {
      // Return demo coordinates for common Indian cities
      const demoLocations = this.getDemoCoordinates(location);
      if (demoLocations) {
        return demoLocations;
      }
      
      throw new Error('Demo coordinates not available for this location. Please provide OpenCage API key.');
    }

    try {
      const response = await fetch(`https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(location)}&key=${apiKey}&limit=1`);
      
      if (!response.ok) {
        throw new Error(`OpenCage API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.results && data.results.length > 0) {
        const result = data.results[0];
        return {
          success: true,
          formatted: result.formatted,
          latitude: result.geometry.lat,
          longitude: result.geometry.lng,
          timezone: result.annotations.timezone?.name || 'UTC',
          confidence: result.confidence || 'medium'
        };
      } else {
        throw new Error('No results found in OpenCage');
      }
    } catch (error) {
      throw new Error(`OpenCage service failed: ${error.message}`);
    }
  }

  /**
   * OpenStreetMap Nominatim geocoding service (with rate limiting)
   * @param {string} location - Location string
   * @returns {Promise<Object>} - Geocoding result
   */
  async geocodeWithNominatim(location) {
    // Rate limiting: 1 second between requests
    const now = Date.now();
    if (now - this.lastNominatimCall < this.NOMINATIM_DELAY) {
      const delay = this.NOMINATIM_DELAY - (now - this.lastNominatimCall);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    this.lastNominatimCall = Date.now();

    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}&limit=1&addressdetails=1`, {
        headers: {
          'User-Agent': 'VedicAstrologyApp/1.0' // Required by Nominatim usage policy
        }
      });

      if (!response.ok) {
        throw new Error(`Nominatim API error: ${response.status}`);
      }

      const data = await response.json();

      if (data && data.length > 0) {
        const result = data[0];
        return {
          success: true,
          formatted: result.display_name,
          latitude: parseFloat(result.lat),
          longitude: parseFloat(result.lon),
          timezone: 'UTC', // Nominatim doesn't provide timezone
          confidence: result.importance > 0.8 ? 'high' : result.importance > 0.5 ? 'medium' : 'low'
        };
      } else {
        throw new Error('No results found in Nominatim');
      }
    } catch (error) {
      throw new Error(`Nominatim service failed: ${error.message}`);
    }
  }

  /**
   * Get demo coordinates for common Indian cities
   * @param {string} location - Location string
   * @returns {Object|null} Demo coordinates or null if not found
   */
  getDemoCoordinates(location) {
    const demoLocations = {
      'mumbai': {
        success: true,
        formatted: 'Mumbai, Maharashtra, India',
        latitude: 19.0760,
        longitude: 72.8777,
        timezone: 'Asia/Kolkata',
        confidence: 'high'
      },
      'pune': {
        success: true,
        formatted: 'Pune, Maharashtra, India',
        latitude: 18.5204,
        longitude: 73.8567,
        timezone: 'Asia/Kolkata',
        confidence: 'high'
      },
      'delhi': {
        success: true,
        formatted: 'New Delhi, Delhi, India',
        latitude: 28.6139,
        longitude: 77.2090,
        timezone: 'Asia/Kolkata',
        confidence: 'high'
      },
      'bangalore': {
        success: true,
        formatted: 'Bangalore, Karnataka, India',
        latitude: 12.9716,
        longitude: 77.5946,
        timezone: 'Asia/Kolkata',
        confidence: 'high'
      },
      'hyderabad': {
        success: true,
        formatted: 'Hyderabad, Telangana, India',
        latitude: 17.3850,
        longitude: 78.4867,
        timezone: 'Asia/Kolkata',
        confidence: 'high'
      },
      'kolkata': {
        success: true,
        formatted: 'Kolkata, West Bengal, India',
        latitude: 22.5726,
        longitude: 88.3639,
        timezone: 'Asia/Kolkata',
        confidence: 'high'
      },
      'chennai': {
        success: true,
        formatted: 'Chennai, Tamil Nadu, India',
        latitude: 13.0827,
        longitude: 80.2707,
        timezone: 'Asia/Kolkata',
        confidence: 'high'
      }
    };

    const locationKey = location.toLowerCase().split(',')[0].trim();
    return demoLocations[locationKey] || demoLocations['mumbai'];
  }
}

export default GeocodingService;
