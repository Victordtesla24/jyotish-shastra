/**
 * JPL Horizons API Type Definitions
 * 
 * TypeScript interfaces for JPL Horizons ephemeris data queries and responses.
 * Supports record/replay fixture pattern for testing without live API calls.
 */

/**
 * Horizons API Query Parameters
 * Defines the structure for querying JPL Horizons system
 */
export interface HorizonsQuery {
  target: string; // NAIF ID: '10' for Sun, '301' for Moon, '499' for Mars, etc.
  observer: string; // '@399' for geocentric, '@ssb' for solar system barycenter
  startTime: string; // ISO 8601 or JD format: '2000-01-01T12:00:00' or 'JD2451545.0'
  stopTime: string; // ISO 8601 or JD format
  step: string; // Time step: '1h', '1d', '1m', etc.
  quantities: string; // Output quantities: '1' for astrometric RA/DEC, '31' for observer range/rate
  coordType?: 'ECLIPTIC' | 'EQUATORIAL'; // Coordinate type (default: ECLIPTIC for astrology)
  refPlane?: 'FRAME' | 'BODY EQUATOR'; // Reference plane
  center?: string; // Center of motion (default: '@0' for solar system barycenter)
}

/**
 * Horizons API Response Data Point
 * Single time step result from Horizons query
 */
export interface HorizonsDataPoint {
  julianDay: number; // Julian Day Number (TT time scale)
  julianDayUTC?: number; // Julian Day Number (UTC time scale) if available
  calendar: string; // Calendar date: '2000-Jan-01 12:00:00.0000'
  longitude: number; // Ecliptic longitude in degrees (0-360)
  latitude: number; // Ecliptic latitude in degrees (-90 to +90)
  distance: number; // Distance from observer in AU
  lightTime?: number; // Light-time in minutes (optional)
  rangeRate?: number; // Range rate in km/s (optional)
}

/**
 * Horizons API Response
 * Complete response from JPL Horizons API with metadata
 */
export interface HorizonsResponse {
  query: HorizonsQuery; // Original query parameters
  apiVersion: string; // Horizons API version (e.g., '4.0')
  provenance: {
    source: 'JPL Horizons';
    url: string; // Full API URL used
    timestamp: string; // ISO 8601 timestamp of API call
    signature?: string; // Optional hash for data integrity
  };
  results: HorizonsDataPoint[];
  metadata: {
    targetName: string; // Human-readable target name (e.g., 'Sun', 'Moon')
    observerLocation: string; // Description of observer location
    timeSystem: 'TT' | 'UTC' | 'UT1'; // Time system used in results
    coordinateSystem: 'ECLIPTIC' | 'EQUATORIAL';
    referenceFrame: string; // e.g., 'ICRF/J2000.0' for equatorial
  };
}

/**
 * Horizons Fixture
 * Pre-recorded Horizons response for record/replay testing
 */
export interface HorizonsFixture {
  filename: string; // Fixture filename for identification
  query: HorizonsQuery; // Original query that produced this fixture
  response: HorizonsResponse; // Recorded response data
  recordedAt: string; // ISO 8601 timestamp of recording
  validUntil?: string; // Optional expiration date for fixture
  notes?: string; // Optional notes about this fixture (e.g., 'J2000.0 epoch')
}

/**
 * Horizons Client Configuration
 * Configuration for HorizonsClient class
 */
export interface HorizonsClientConfig {
  mode: 'replay' | 'record'; // replay: use fixtures, record: call API + save
  fixtureDir: string; // Directory path for fixture storage
  baseUrl?: string; // JPL Horizons API base URL (default: https://ssd.jpl.nasa.gov/api/horizons.api)
  timeout?: number; // API request timeout in milliseconds (default: 30000)
  cacheEnabled?: boolean; // Enable in-memory caching (default: true)
}

/**
 * Horizons Body Map
 * Mapping of common celestial bodies to their NAIF IDs
 */
export const HORIZONS_BODY_MAP: { [key: string]: string } = {
  Sun: '10',
  Moon: '301',
  Mercury: '199',
  Venus: '299',
  Mars: '499',
  Jupiter: '599',
  Saturn: '699',
  Uranus: '799',
  Neptune: '899',
  Pluto: '999',
  // Lunar nodes (calculated, not direct Horizons targets)
  Rahu: 'LUNAR_NODE_MEAN',
  Ketu: 'LUNAR_NODE_MEAN'
};

/**
 * Horizons Observer Locations
 * Common observer location codes
 */
export const HORIZONS_OBSERVERS = {
  GEOCENTRIC: '@399', // Earth center
  TOPOCENTRIC: '@399', // Earth surface (requires site coordinates)
  SSB: '@ssb', // Solar system barycenter
  SUN: '@sun' // Sun center
};

/**
 * Horizons Time Systems
 * Supported time scale systems in Horizons
 */
export type HorizonsTimeSystem = 'TT' | 'UTC' | 'UT1';

/**
 * Horizons Coordinate Systems
 * Supported coordinate reference frames
 */
export type HorizonsCoordinateSystem = 'ECLIPTIC' | 'EQUATORIAL';

/**
 * Horizons Error Response
 * Error structure from Horizons API
 */
export interface HorizonsError {
  code: string; // Error code (e.g., 'INVALID_TARGET', 'TIME_OUT_OF_RANGE')
  message: string; // Human-readable error message
  details?: {
    parameter?: string; // Which parameter caused the error
    value?: string; // Invalid value provided
    allowedRange?: string; // Range of allowed values
  };
}

/**
 * Horizons Cache Entry
 * In-memory cache structure for API responses
 */
export interface HorizonsCacheEntry {
  key: string; // Cache key (hash of query parameters)
  response: HorizonsResponse;
  cachedAt: number; // Timestamp in milliseconds
  expiresAt: number; // Expiration timestamp in milliseconds
}

/**
 * Horizons Validation Result
 * Result of fixture validation
 */
export interface HorizonsValidationResult {
  valid: boolean;
  errors: string[]; // List of validation errors
  warnings: string[]; // List of validation warnings
  fixture: HorizonsFixture;
}
