import GeocodingService from '../../services/geocoding/GeocodingService.js';

class GeocodingController {
  constructor() {
    this.geocodingService = new GeocodingService();
  }

  /**
   * Geocodes a location string to coordinates and timezone.
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {function} next - Express next middleware function.
   */
  async geocode(req, res, _next) {
    try {
      const { placeOfBirth } = req.body;
      if (!placeOfBirth) {
        return res.status(400).json({ success: false, message: 'placeOfBirth is required' });
      }
      const locationData = await this.geocodingService.geocodeLocation({ placeOfBirth });
      res.json({
        success: true,
        data: locationData
      });
    } catch (error) {
      // Provide clearer HTTP status codes for known geocoding errors
      const lower = error.message.toLowerCase();

      if (lower.includes('location not found') || lower.includes('no geocoding results')) {
        return res.status(404).json({
          success: false,
          message: 'Location not found',
          details: error.message
        });
      }

      if (lower.includes('api key')) {
        return res.status(503).json({
          success: false,
          message: 'Geocoding service unavailable – API key issue',
          details: error.message
        });
      }

      // Return structured error response for all other errors
      return res.status(500).json({
        success: false,
        message: 'Geocoding service error',
        details: error.message
      });
    }
  }

  /**
   * Geocodes a location from query parameter to coordinates.
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {function} next - Express next middleware function.
   */
  async getCoordinates(req, res, _next) {
    try {
      const { location } = req.query;
      if (!location) {
        return res.status(400).json({
          success: false,
          message: 'location query parameter is required'
        });
      }

      const locationData = await this.geocodingService.geocodeLocation({ placeOfBirth: location });
      res.json({
        success: true,
        data: locationData
      });
    } catch (error) {
      // Provide clearer HTTP status codes for known geocoding errors
      const lower = error.message.toLowerCase();

      if (lower.includes('location not found') || lower.includes('no geocoding results')) {
        return res.status(404).json({
          success: false,
          message: 'Location not found',
          details: error.message
        });
      }

      if (lower.includes('api key')) {
        return res.status(503).json({
          success: false,
          message: 'Geocoding service unavailable – API key issue',
          details: error.message
        });
      }

      // Return structured error response for all other errors
      return res.status(500).json({
        success: false,
        message: 'Geocoding service error',
        details: error.message
      });
    }
  }

  /**
   * Validates coordinates for accuracy and range.
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {function} next - Express next middleware function.
   */
  async validateCoordinates(req, res, next) {
    try {
      const { latitude, longitude } = req.query;

      if (!latitude || !longitude) {
        return res.status(400).json({
          success: false,
          message: 'Both latitude and longitude are required'
        });
      }

      const lat = parseFloat(latitude);
      const lng = parseFloat(longitude);

      if (isNaN(lat) || isNaN(lng)) {
        return res.status(400).json({
          success: false,
          message: 'Latitude and longitude must be valid numbers'
        });
      }

      const isValid = this.geocodingService.validateCoordinates(lat, lng);

      res.json({
        success: true,
        valid: isValid,
        latitude: lat,
        longitude: lng,
        message: isValid ? 'Coordinates are valid' : 'Coordinates are out of valid range'
      });
    } catch (error) {
      next(error);
    }
  }
}

export default GeocodingController;
