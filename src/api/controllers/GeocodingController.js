const GeocodingService = require('../../services/geocoding/GeocodingService');

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
  async geocode(req, res, next) {
    try {
      const { placeOfBirth } = req.body;
      if (!placeOfBirth) {
        return res.status(400).json({ success: false, message: 'placeOfBirth is required' });
      }
      const locationData = await this.geocodingService.geocodeLocation({ placeOfBirth });
      res.json({ success: true, ...locationData });
    } catch (error) {
      next(error);
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

module.exports = GeocodingController;
