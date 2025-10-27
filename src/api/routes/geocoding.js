import express from 'express';
import GeocodingController from '../controllers/GeocodingController.js';

const router = express.Router();
const geocodingController = new GeocodingController();

/**
 * @route POST /location
 * @description Geocodes a location string to coordinates.
 * @access Public
 */
router.post('/location', geocodingController.geocode.bind(geocodingController));

/**
 * @route GET /coordinates
 * @description Geocodes a location query parameter to coordinates.
 * @access Public
 */
router.get('/coordinates', geocodingController.getCoordinates.bind(geocodingController));

/**
 * @route GET /validate
 * @description Validates coordinates for accuracy.
 * @access Public
 */
router.get('/validate', geocodingController.validateCoordinates.bind(geocodingController));

export default router;
