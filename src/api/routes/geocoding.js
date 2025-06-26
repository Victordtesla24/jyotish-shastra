const express = require('express');
const GeocodingController = require('../controllers/GeocodingController');

const router = express.Router();
const geocodingController = new GeocodingController();

/**
 * @route POST /location
 * @description Geocodes a location string to coordinates.
 * @access Public
 */
router.post('/location', geocodingController.geocode.bind(geocodingController));

/**
 * @route GET /validate
 * @description Validates coordinates for accuracy.
 * @access Public
 */
router.get('/validate', geocodingController.validateCoordinates.bind(geocodingController));

module.exports = router;
