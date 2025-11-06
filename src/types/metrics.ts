/**
 * BTR Metrics Type Definitions
 * 
 * TypeScript interfaces for BTR accuracy metrics (M1-M5) and related data structures.
 * These types ensure type safety across the metrics calculation and validation system.
 */

/**
 * M1: Ephemeris Positional Accuracy Metric
 * Measures angular delta between our calculations and JPL Horizons reference data
 */
export interface EphemerisAccuracyMetric {
  body: 'Sun' | 'Moon' | 'Mars' | 'Mercury' | 'Jupiter' | 'Venus' | 'Saturn';
  ourLongitude: number; // degrees (0-360)
  jplLongitude: number; // degrees (0-360)
  deltaLongitude: number; // angular difference in degrees
  withinThreshold: boolean;
  threshold: number; // threshold in degrees (Sun: 0.01, Moon: 0.05, others: 0.10)
  timeScale: 'TT' | 'UT1' | 'UTC';
  julianDay: number;
}

/**
 * M2: Cross-Method Convergence Metric
 * Measures spread between different BTR methods (Praanapada, Gulika, Moon, Events)
 */
export interface CrossMethodConvergence {
  methods: string[]; // e.g., ['Praanapada', 'Gulika', 'Moon']
  rectifiedTimes: {
    method: string;
    time: string; // ISO 8601 format
    offsetMinutes: number; // offset from median time
  }[];
  maxSpreadMinutes: number; // maximum spread between methods
  medianAbsoluteDeviation: number; // MAD statistic
  withinThreshold: boolean;
  threshold: number; // threshold in minutes (default: 3)
}

/**
 * M3: Ensemble Confidence Score
 * Weighted confidence score combining all BTR methods
 */
export interface EnsembleConfidence {
  weights: { [method: string]: number }; // method weights (sum to 1.0)
  scores: { [method: string]: number }; // individual method scores (0-1)
  weightedScore: number; // weighted average of scores
  confidence: number; // overall confidence (0-1)
  breakdown: {
    method: string;
    contribution: number; // weight × score
  }[];
}

/**
 * M4: Event-Fit Agreement Metric
 * Percentage of life events that align with dasha/varga predictions
 */
export interface EventFitAgreement {
  totalEvents: number;
  alignedEvents: number;
  percentage: number; // (alignedEvents / totalEvents) × 100
  withinThreshold: boolean;
  threshold: number; // threshold percentage (default: 75)
  mismatches: {
    event: string;
    expectedPeriod: string;
    actualPeriod: string;
    reason: string;
  }[];
}

/**
 * M5: Geocoding Precision Metric
 * Measures spatial precision of geocoding using bounding box diagonal
 */
export interface GeocodingPrecision {
  bbox: [number, number, number, number]; // [minLat, minLon, maxLat, maxLon]
  diagonalMeters: number; // bbox diagonal in meters
  confidence: number; // OpenCage confidence (bbox-based, not accuracy)
  withinThreshold: boolean;
  threshold: number; // threshold in meters (default: 1000)
  warning: string | null; // warning if bbox indicates imprecision
}

/**
 * Complete BTR Metrics Result
 * Aggregates all M1-M5 metrics for a single rectification analysis
 */
export interface BTRMetricsResult {
  timestamp: string; // ISO 8601
  chartId: string;
  birthData: {
    name: string;
    inputBirthTime: string;
    rectifiedBirthTime: string;
    placeOfBirth: string;
    coordinates: { latitude: number; longitude: number };
    timezone: string;
  };
  m1_ephemerisAccuracy: EphemerisAccuracyMetric[];
  m2_crossMethodConvergence: CrossMethodConvergence;
  m3_ensembleConfidence: EnsembleConfidence;
  m4_eventFitAgreement: EventFitAgreement;
  m5_geocodingPrecision: GeocodingPrecision;
  overallPassed: boolean; // true if all thresholds met
  failedCriteria: string[]; // list of failed metrics (e.g., ['M1: Sun', 'M2'])
  metadata: {
    metricsVersion: string;
    calculationDurationMs: number;
    horizonsMode: 'replay' | 'record';
  };
}

/**
 * Metrics Configuration
 * Defines thresholds and settings for all metrics calculations
 */
export interface MetricsConfig {
  ephemerisThresholds: {
    Sun: number;
    Moon: number;
    Mars: number;
    Mercury: number;
    Jupiter: number;
    Venus: number;
    Saturn: number;
  };
  convergenceThreshold: number; // minutes
  ensembleThreshold: number; // 0-1
  eventFitThreshold: number; // percentage
  geocodingThreshold: number; // meters
}

/**
 * Life Event for M4 Event-Fit Analysis
 */
export interface LifeEvent {
  date: string; // ISO 8601
  type: 'marriage' | 'career' | 'relocation' | 'health' | 'education' | 'other';
  description: string;
  significance: 'major' | 'minor';
}

/**
 * BTR Analysis Result (from existing BTR service)
 * Extended with life events for metrics calculation
 */
export interface BTRAnalysisResult {
  methods: {
    praanapada?: {
      rectifiedTime: string;
      confidence: number;
    };
    gulika?: {
      rectifiedTime: string;
      confidence: number;
    };
    moon?: {
      rectifiedTime: string;
      confidence: number;
    };
    events?: {
      rectifiedTime: string;
      confidence: number;
    };
  };
  ensemble: {
    recommendedTime: string;
    confidence: number;
  };
  chart: any; // RasiChart from existing types
  lifeEvents?: LifeEvent[];
}

/**
 * Rasi Chart (from existing chart types)
 * Minimal interface for metrics calculations
 */
export interface RasiChart {
  ascendant: {
    degree: number;
    sign: string;
    lord: string;
  };
  planets: {
    name: string;
    longitude: number;
    sign: string;
    house: number;
    retrograde: boolean;
  }[];
  houses: any[];
  julianDay: number;
}

/**
 * Geocoding Result (from existing geocoding service)
 */
export interface GeocodingResult {
  formatted: string;
  geometry: {
    lat: number;
    lng: number;
  };
  bounds?: {
    northeast: { lat: number; lng: number };
    southwest: { lat: number; lng: number };
  };
  confidence: number;
  bbox?: [number, number, number, number];
}
