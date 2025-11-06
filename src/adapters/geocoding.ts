/**
 * Geocoding Utilities
 * 
 * Utilities for calculating geocoding precision from OpenCage bounding boxes.
 * Used for M5 (Geocoding Precision) metric validation.
 * 
 * Key Insight: OpenCage 'confidence' is NOT spatial accuracy - it's data quality.
 * Actual spatial precision comes from bbox diagonal calculation.
 */

import { GeocodingPrecision, GeocodingResult } from '../types/metrics';

/**
 * Calculate Haversine distance between two geographic coordinates
 * Returns distance in meters
 * 
 * @param lat1 - Latitude of point 1 in degrees
 * @param lon1 - Longitude of point 1 in degrees
 * @param lat2 - Latitude of point 2 in degrees
 * @param lon2 - Longitude of point 2 in degrees
 * @returns Distance in meters
 */
export function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000; // Earth radius in meters
  
  // Convert degrees to radians
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  // Haversine formula
  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
           Math.cos(φ1) * Math.cos(φ2) *
           Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}

/**
 * Calculate diagonal distance of a bounding box in meters
 * Uses Haversine formula for accuracy across the globe
 * 
 * @param bbox - Bounding box [minLat, minLon, maxLat, maxLon]
 * @returns Diagonal distance in meters
 */
export function bboxDiagonalMeters(
  bbox: [number, number, number, number]
): number {
  const [minLat, minLon, maxLat, maxLon] = bbox;
  
  // Calculate diagonal from SW corner to NE corner
  return haversineDistance(minLat, minLon, maxLat, maxLon);
}

/**
 * Extract geocoding precision from OpenCage response
 * 
 * @param opencageResponse - OpenCage API response object
 * @returns GeocodingPrecision object with bbox analysis
 */
export function extractGeocodingPrecision(
  opencageResponse: any
): GeocodingPrecision {
  // Extract bbox from OpenCage response
  // Format: southwest_lat, southwest_lng, northeast_lat, northeast_lng
  let bbox: [number, number, number, number];
  
  if (opencageResponse.bounds) {
    // Standard OpenCage format
    bbox = [
      opencageResponse.bounds.southwest.lat,
      opencageResponse.bounds.southwest.lng,
      opencageResponse.bounds.northeast.lat,
      opencageResponse.bounds.northeast.lng
    ];
  } else if (opencageResponse.geometry && opencageResponse.geometry.bounds) {
    // Alternative format
    bbox = [
      opencageResponse.geometry.bounds.southwest.lat,
      opencageResponse.geometry.bounds.southwest.lng,
      opencageResponse.geometry.bounds.northeast.lat,
      opencageResponse.geometry.bounds.northeast.lng
    ];
  } else if (opencageResponse.bbox) {
    // Array format [minLon, minLat, maxLon, maxLat] - reorder to our format
    bbox = [
      opencageResponse.bbox[1], // minLat
      opencageResponse.bbox[0], // minLon
      opencageResponse.bbox[3], // maxLat
      opencageResponse.bbox[2]  // maxLon
    ];
  } else {
    // No bounding box available - use point with zero size
    const lat = opencageResponse.geometry?.lat || 0;
    const lon = opencageResponse.geometry?.lng || 0;
    bbox = [lat, lon, lat, lon];
  }

  // Calculate diagonal
  const diagonalMeters = bboxDiagonalMeters(bbox);
  
  // Extract confidence (remember: this is data quality, not spatial precision)
  const confidence = opencageResponse.confidence || 0;
  
  // Determine threshold (default: 1000m for Vedic astrology birth location)
  const threshold = 1000;
  const withinThreshold = diagonalMeters <= threshold;
  
  // Generate warning if precision is poor
  let warning: string | null = null;
  if (diagonalMeters > 10000) {
    warning = `Very low precision: ${Math.round(diagonalMeters)}m bbox diagonal. Consider more specific location.`;
  } else if (diagonalMeters > 5000) {
    warning = `Low precision: ${Math.round(diagonalMeters)}m bbox diagonal. Birth time rectification may be less accurate.`;
  } else if (diagonalMeters > 1000) {
    warning = `Moderate precision: ${Math.round(diagonalMeters)}m bbox diagonal. Acceptable for most BTR calculations.`;
  }

  return {
    bbox,
    diagonalMeters,
    confidence,
    withinThreshold,
    threshold,
    warning
  };
}

/**
 * Parse GeocodingResult to GeocodingPrecision
 * Convenience function for working with typed GeocodingResult objects
 * 
 * @param geocodingResult - Typed GeocodingResult object
 * @returns GeocodingPrecision analysis
 */
export function analyzeGeocodingResult(
  geocodingResult: GeocodingResult
): GeocodingPrecision {
  let bbox: [number, number, number, number];

  if (geocodingResult.bbox) {
    // Already have bbox array
    bbox = geocodingResult.bbox;
  } else if (geocodingResult.bounds) {
    // Convert bounds object to bbox array
    bbox = [
      geocodingResult.bounds.southwest.lat,
      geocodingResult.bounds.southwest.lng,
      geocodingResult.bounds.northeast.lat,
      geocodingResult.bounds.northeast.lng
    ];
  } else {
    // No bounds - use point location
    const lat = geocodingResult.geometry.lat;
    const lng = geocodingResult.geometry.lng;
    bbox = [lat, lng, lat, lng];
  }

  const diagonalMeters = bboxDiagonalMeters(bbox);
  const threshold = 1000; // meters
  const withinThreshold = diagonalMeters <= threshold;

  let warning: string | null = null;
  if (diagonalMeters > 10000) {
    warning = `Very low precision: ${Math.round(diagonalMeters)}m. Consider more specific location.`;
  } else if (diagonalMeters > 5000) {
    warning = `Low precision: ${Math.round(diagonalMeters)}m. BTR accuracy may be reduced.`;
  } else if (diagonalMeters > 1000) {
    warning = `Moderate precision: ${Math.round(diagonalMeters)}m. Acceptable for BTR.`;
  }

  return {
    bbox,
    diagonalMeters,
    confidence: geocodingResult.confidence,
    withinThreshold,
    threshold,
    warning
  };
}

/**
 * Calculate area of bounding box in square meters
 * Useful for additional precision analysis
 * 
 * @param bbox - Bounding box [minLat, minLon, maxLat, maxLon]
 * @returns Area in square meters
 */
export function bboxAreaSquareMeters(
  bbox: [number, number, number, number]
): number {
  const [minLat, minLon, maxLat, maxLon] = bbox;
  
  // Calculate width and height using Haversine
  const width = haversineDistance(minLat, minLon, minLat, maxLon);
  const height = haversineDistance(minLat, minLon, maxLat, minLon);
  
  return width * height;
}

/**
 * Categorize geocoding precision for human-readable reporting
 * 
 * @param diagonalMeters - Bounding box diagonal in meters
 * @returns Precision category and description
 */
export function categorizePrecision(diagonalMeters: number): {
  category: 'excellent' | 'good' | 'moderate' | 'poor' | 'very-poor';
  description: string;
} {
  if (diagonalMeters <= 100) {
    return {
      category: 'excellent',
      description: 'Street-level precision (<100m) - ideal for birth time rectification'
    };
  } else if (diagonalMeters <= 500) {
    return {
      category: 'good',
      description: 'Neighborhood-level precision (100-500m) - good for BTR'
    };
  } else if (diagonalMeters <= 1000) {
    return {
      category: 'moderate',
      description: 'District-level precision (500-1000m) - acceptable for BTR'
    };
  } else if (diagonalMeters <= 5000) {
    return {
      category: 'poor',
      description: 'City-level precision (1-5km) - BTR accuracy may be reduced'
    };
  } else {
    return {
      category: 'very-poor',
      description: 'Regional precision (>5km) - consider more specific location'
    };
  }
}

/**
 * Validate coordinates are within valid ranges
 * 
 * @param lat - Latitude in degrees
 * @param lon - Longitude in degrees
 * @returns true if valid, false otherwise
 */
export function validateCoordinates(lat: number, lon: number): boolean {
  return lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180;
}

/**
 * Format coordinates for display
 * 
 * @param lat - Latitude in degrees
 * @param lon - Longitude in degrees
 * @param precision - Decimal places (default: 6)
 * @returns Formatted string
 */
export function formatCoordinates(
  lat: number,
  lon: number,
  precision: number = 6
): string {
  const latDir = lat >= 0 ? 'N' : 'S';
  const lonDir = lon >= 0 ? 'E' : 'W';
  return `${Math.abs(lat).toFixed(precision)}°${latDir}, ${Math.abs(lon).toFixed(precision)}°${lonDir}`;
}
