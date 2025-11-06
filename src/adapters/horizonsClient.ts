/**
 * JPL Horizons Client
 * 
 * Client for querying JPL Horizons ephemeris data with record/replay fixture support.
 * Enables M1 (Ephemeris Accuracy) validation without live API calls in CI/CD.
 * 
 * Modes:
 * - replay: Load pre-recorded fixtures (default for CI)
 * - record: Call live API and save fixtures (controlled refresh only)
 */

import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import {
  HorizonsQuery,
  HorizonsResponse,
  HorizonsFixture,
  HorizonsClientConfig,
  HorizonsCacheEntry,
  HorizonsValidationResult,
  HORIZONS_BODY_MAP,
  HORIZONS_OBSERVERS
} from '../types/horizons';

export class HorizonsClient {
  private mode: 'replay' | 'record';
  private fixtureDir: string;
  private baseUrl: string;
  private timeout: number;
  private cache: Map<string, HorizonsCacheEntry>;
  private cacheEnabled: boolean;

  constructor(config: HorizonsClientConfig) {
    this.mode = config.mode || 'replay';
    this.fixtureDir = config.fixtureDir || path.join(__dirname, '../../fixtures/horizons');
    this.baseUrl = config.baseUrl || 'https://ssd.jpl.nasa.gov/api/horizons.api';
    this.timeout = config.timeout || 30000;
    this.cacheEnabled = config.cacheEnabled !== false;
    this.cache = new Map();

    // Ensure fixture directory exists in record mode
    if (this.mode === 'record' && !fs.existsSync(this.fixtureDir)) {
      fs.mkdirSync(this.fixtureDir, { recursive: true });
    }
  }

  /**
   * Get planetary position for given celestial body and Julian Day
   * 
   * @param body - Body name (e.g., 'Sun', 'Moon', 'Mars')
   * @param julianDay - Julian Day Number (TT time scale)
   * @param observer - Observer location code (default: '@399' for geocentric)
   * @returns Horizons response with position data
   */
  async getPosition(
    body: string,
    julianDay: number,
    observer: string = HORIZONS_OBSERVERS.GEOCENTRIC
  ): Promise<HorizonsResponse> {
    // Map body name to NAIF ID
    const targetId = HORIZONS_BODY_MAP[body] || body;

    // CRITICAL FIX: Preserve decimal precision in Julian Day string conversion
    // Use toFixed(1) to ensure .0 is preserved, or use String() to preserve full precision
    const jdString = julianDay % 1 === 0 ? `${julianDay}.0` : String(julianDay);

    // Construct query
    const query: HorizonsQuery = {
      target: targetId,
      observer,
      startTime: `JD${jdString}`,
      stopTime: `JD${jdString}`,
      step: '1d',
      quantities: '1',
      coordType: 'ECLIPTIC',
      refPlane: 'FRAME',
      center: '@0'
    };

    // Check cache first
    const cacheKey = this.getCacheKey(query);
    if (this.cacheEnabled) {
      const cached = this.cache.get(cacheKey);
      if (cached && Date.now() < cached.expiresAt) {
        return cached.response;
      }
    }

    // Get response based on mode
    let response: HorizonsResponse;
    if (this.mode === 'replay') {
      response = await this.loadFixture(query);
    } else {
      response = await this.fetchFromAPI(query);
      // Save fixture in record mode
      await this.saveFixture(query, response);
    }

    // Cache response
    if (this.cacheEnabled) {
      this.cache.set(cacheKey, {
        key: cacheKey,
        response,
        cachedAt: Date.now(),
        expiresAt: Date.now() + 3600000 // 1 hour
      });
    }

    return response;
  }

  /**
   * Load fixture from disk (replay mode)
   */
  private async loadFixture(query: HorizonsQuery): Promise<HorizonsResponse> {
    const filename = this.getFixtureFilename(query);
    const filepath = path.join(this.fixtureDir, filename);

    if (!fs.existsSync(filepath)) {
      throw new Error(
        `Fixture not found: ${filename}. ` +
        `Run in 'record' mode to create fixtures, or check fixture directory: ${this.fixtureDir}`
      );
    }

    const fixtureData = fs.readFileSync(filepath, 'utf-8');
    const fixture: HorizonsFixture = JSON.parse(fixtureData);

    // Validate fixture
    const validation = this.validateFixture(fixture);
    if (!validation.valid) {
      console.warn(`Fixture validation warnings for ${filename}:`, validation.warnings);
      if (validation.errors.length > 0) {
        throw new Error(`Fixture validation failed: ${validation.errors.join(', ')}`);
      }
    }

    return fixture.response;
  }

  /**
   * Fetch data from JPL Horizons API (record mode)
   */
  private async fetchFromAPI(query: HorizonsQuery): Promise<HorizonsResponse> {
    // Note: This is a simplified implementation
    // In production, this would make actual HTTP request to JPL Horizons API
    // For now, throw error if called (fixtures should be pre-generated)
    throw new Error(
      'Live Horizons API calls not implemented. ' +
      'Use pre-recorded fixtures in replay mode, or implement API client for record mode.'
    );
  }

  /**
   * Save fixture to disk (record mode)
   */
  private async saveFixture(query: HorizonsQuery, response: HorizonsResponse): Promise<void> {
    const filename = this.getFixtureFilename(query);
    const filepath = path.join(this.fixtureDir, filename);

    const fixture: HorizonsFixture = {
      filename,
      query,
      response,
      recordedAt: new Date().toISOString(),
      validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year
      notes: `Recorded from JPL Horizons API for ${query.target} at JD ${query.startTime}`
    };

    fs.writeFileSync(filepath, JSON.stringify(fixture, null, 2), 'utf-8');
    console.log(`Saved fixture: ${filename}`);
  }

  /**
   * Generate fixture filename from query parameters
   */
  private getFixtureFilename(query: HorizonsQuery): string {
    // Map target ID back to body name for readable filename
    const bodyName = Object.entries(HORIZONS_BODY_MAP)
      .find(([, id]) => id === query.target)?.[0] || query.target;

    // Extract Julian Day from query
    const jd = query.startTime.replace('JD', '');

    return `${bodyName.toLowerCase()}_${jd}.json`;
  }

  /**
   * Generate cache key from query
   */
  private getCacheKey(query: HorizonsQuery): string {
    const queryString = JSON.stringify({
      target: query.target,
      observer: query.observer,
      startTime: query.startTime,
      quantities: query.quantities,
      coordType: query.coordType
    });
    return crypto.createHash('md5').update(queryString).digest('hex');
  }

  /**
   * Validate fixture data
   */
  validateFixture(fixture: HorizonsFixture): HorizonsValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check required fields
    if (!fixture.query) errors.push('Missing query field');
    if (!fixture.response) errors.push('Missing response field');
    if (!fixture.recordedAt) warnings.push('Missing recordedAt timestamp');

    // Check response structure
    if (fixture.response) {
      if (!fixture.response.results || fixture.response.results.length === 0) {
        errors.push('Response has no results');
      }
      if (!fixture.response.metadata) {
        warnings.push('Response missing metadata');
      }
      if (!fixture.response.provenance) {
        warnings.push('Response missing provenance information');
      }

      // Check data quality
      if (fixture.response.results && fixture.response.results[0]) {
        const result = fixture.response.results[0];
        if (result.longitude < 0 || result.longitude >= 360) {
          warnings.push(`Longitude out of range: ${result.longitude}`);
        }
        if (Math.abs(result.latitude) > 90) {
          errors.push(`Latitude out of range: ${result.latitude}`);
        }
      }
    }

    // Check expiration
    if (fixture.validUntil) {
      const expiryDate = new Date(fixture.validUntil);
      if (expiryDate < new Date()) {
        warnings.push('Fixture has expired - consider refreshing');
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      fixture
    };
  }

  /**
   * Clear cache (useful for testing)
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; entries: string[] } {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.keys())
    };
  }

  /**
   * Set mode (useful for testing)
   */
  setMode(mode: 'replay' | 'record'): void {
    this.mode = mode;
  }

  /**
   * Get current mode
   */
  getMode(): 'replay' | 'record' {
    return this.mode;
  }
}

/**
 * Create default Horizons client instance
 * Mode controlled by environment variable HORIZONS_MODE (default: replay)
 */
export function createHorizonsClient(config?: Partial<HorizonsClientConfig>): HorizonsClient {
  const mode = (process.env.HORIZONS_MODE as 'replay' | 'record') || 'replay';
  
  return new HorizonsClient({
    mode,
    fixtureDir: path.join(__dirname, '../../fixtures/horizons'),
    cacheEnabled: true,
    ...config
  });
}

// Export singleton instance
export const horizonsClient = createHorizonsClient();
