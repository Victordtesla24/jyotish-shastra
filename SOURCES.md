# BTR Accuracy & Metrics - Authoritative Sources

**Last Updated**: 2025-11-06T13:12:00+11:00

This document lists all authoritative sources and standards used in BTR (Birth Time Rectification) calculations, validation, and accuracy metrics.

---

## Astronomical Ephemeris

### JPL Horizons API
- **URL**: https://ssd.jpl.nasa.gov/horizons/
- **Purpose**: Planetary position validation for M1 ephemeris accuracy metric
- **API Version**: Horizons Web-Service API (REST)
- **Data Provenance**: DE440/DE441 JPL Development Ephemeris
- **Citation**: Giorgini, J.D., et al. (1996). "JPL's On-Line Solar System Data Service"
- **Query Parameters**:
  - Observer: `@399` (geocentric)
  - Quantities: `1` (astrometric position)
  - Time scale: TT (Terrestrial Time)
- **Usage in Project**: Fixture-based validation (`fixtures/horizons/*.json`)
- **Validation Thresholds**:
  - Sun: ≤0.01° longitude difference
  - Moon: ≤0.05° longitude difference
  - Other planets: ≤0.10° longitude difference

---

## Time Scale Standards

### IERS Delta-T Data
- **URL**: https://www.iers.org/
- **Purpose**: TT-UT1 time scale conversions for accurate astronomical calculations
- **Data Source**: International Earth Rotation Service Bulletin A archives
- **Coverage**: 1973-2023 (historical measurements)
- **Estimation Method**: Polynomial approximation for pre-1973 dates
- **File Location**: `src/adapters/data/deltaT_iers.json`
- **Update Frequency**: Annually (as IERS publishes new data)
- **Reference**: McCarthy & Petit (2004), "IERS Conventions 2003", IERS Technical Note 32

### IAU Time Scale Conventions
- **Standard**: IAU Resolution B1 (2006) - "On the re-definition of Terrestrial Time TT"
- **Definitions**:
  - **TT (Terrestrial Time)**: Ideal time scale for ephemeris calculations
  - **UT1 (Universal Time)**: Time scale based on Earth's rotation
  - **UTC (Coordinated Universal Time)**: Civil time standard with leap seconds
- **Conversions**:
  - TT = UTC + ΔT (where ΔT ≈ 69.2s in 2020)
  - UT1 ≈ UTC + DUT1 (DUT1 from IERS Bulletin A)
- **Implementation**: `src/adapters/timeScales.ts`
- **Reference**: https://www.iau.org/static/resolutions/IAU2006_Resol1.pdf

---

## Vedic Astrology Standards

### Brihat Parashara Hora Shastra (BPHS)
- **Primary Text**: Maharishi Parashara (circa 1500 BCE - 500 CE)
- **Translation**: Multiple translations available
  - R. Santhanam (1984) - English translation
  - Girish Chand Sharma (1996) - English commentary
- **Relevant Chapters for BTR**:
  - **Chapter 80**: Ayurdaya (Longevity) - Praanapada calculation
  - **Chapter 81**: Birth time rectification principles
  - **Upagraha Section**: Gulika (Mandi) determination
- **Core Formulas Implemented**:
  - **Praanapada**: Ascendant + (Moon - Sun) for daytime births
  - **Gulika**: Time-based calculation using weekday lords
  - **Nisheka (Conception Time)**: 273 days + tithi correction
- **Sidereal System**: Lahiri Ayanamsa (default in Swiss Ephemeris)

### Ayanamsa Standards
- **Primary**: Lahiri (Chitrapaksha) Ayanamsa
  - Value at J2000.0: 23°51'10.5"
  - Annual precession rate: ~50.27" per year
- **Swiss Ephemeris Code**: `SE$SIDM_LAHIRI` (mode 1)
- **Reference**: N.C. Lahiri (1955), "Report of the Calendar Reform Committee"

---

## Software Libraries

### Swiss Ephemeris Library
- **Package**: `swisseph` (npm) version ^2.10.3-b-1
- **Official Site**: https://www.astro.com/swisseph/
- **Purpose**: High-precision sidereal planetary position calculations
- **Ephemeris Files Used**:
  - `seas_18.se1` - Asteroid ephemeris
  - `semo_18.se1` - Moon ephemeris
  - `sepl_18.se1` - Planetary ephemeris
- **File Location**: `ephemeris/*.se1`
- **Precision**: Sub-arcsecond accuracy for modern dates
- **Coordinate System**: ICRS (International Celestial Reference System)
- **License**: Swiss Ephemeris License (free for non-commercial use)
- **Documentation**: https://www.astro.com/swisseph/swephprg.htm

### Node.js Ecosystem
- **moment-timezone** (^0.5.43)
  - Purpose: Timezone conversions (civil time → UTC)
  - IANA timezone database integration
- **axios** (devDependency)
  - Purpose: HTTP client for JPL Horizons API (record mode only)
- **jest** (^29.7.0)
  - Purpose: Test framework for validation suites

---

## Geocoding Services

### OpenCage Geocoding API
- **URL**: https://opencagedata.com/api
- **Purpose**: Location coordinate precision validation (M5 metric)
- **API Documentation**: https://opencagedata.com/api#forward
- **Precision Method**: Bounding box diagonal calculation
  - Returns bbox: `[minLat, minLon, maxLat, maxLon]`
  - Diagonal calculated via Haversine formula
  - Threshold: ≤1000 meters for acceptable precision
- **Confidence Score**: OpenCage confidence (0-10 scale)
- **Implementation**: `src/adapters/geocoding.ts`
- **Data Sources**: OpenStreetMap, government databases, commercial datasets

---

## Validation Methodologies

### M1: Ephemeris Positional Accuracy
- **Reference**: JPL Horizons DE440/DE441 ephemeris (authoritative source)
- **Method**: Direct comparison of calculated vs. JPL positions
- **Time Scale**: All calculations in TT (Terrestrial Time)
- **Test Epochs**: J2000.0 (JD 2451545.0) as primary reference
- **Fixtures**: `fixtures/horizons/*.json` (pre-recorded API responses)

### M2: Cross-Method Convergence
- **Threshold**: ≤3 minutes maximum spread between methods
- **Statistical Measure**: Median Absolute Deviation (MAD)
- **Methods Compared**:
  - Praanapada rectification
  - Gulika-based rectification
  - Ascendant-based rectification
  - Moon phase rectification

### M3: Ensemble Confidence Score
- **Method**: Weighted average of individual method scores
- **Threshold**: ≥0.7 (70% confidence)
- **Weights**: Empirically derived from validation cases
- **Reference**: Ensemble learning principles (Boosting/Bagging)

### M4: Event-Fit Agreement
- **Threshold**: ≥75% of life events align with predicted dashas
- **Dasha System**: Vimshottari Dasha (120-year cycle)
- **Reference**: BPHS Chapter on Dasha predictions

### M5: Geocoding Precision
- **Threshold**: ≤1000 meters bbox diagonal
- **Method**: Haversine distance formula for great-circle distance
- **Earth Radius**: 6,371,000 meters (mean radius)

---

## Standards Compliance

### Time Scales
- **IAU/IERS Conventions**: Full compliance with IAU 2006 resolutions
- **Leap Seconds**: UTC leap second handling via moment-timezone
- **Historical Dates**: ΔT estimation for dates outside IERS coverage

### Coordinate Systems
- **ICRS**: International Celestial Reference System (J2000.0 epoch)
- **Sidereal Zodiac**: Lahiri Ayanamsa (tropical → sidereal conversion)
- **Geocentric Coordinates**: All calculations from Earth center (@399 in Horizons)

### Astrological Calculations
- **Traditional Methods**: BPHS formulas preserved exactly
- **No Approximations**: Full precision calculations (no rounding until display)
- **House Systems**: Placidus (primary), others configurable

---

## Data Provenance

### Fixtures & Test Data
- **fixtures/horizons/*.json**: Recorded 2025-11-06, JPL Horizons API v4.0
- **fixtures/btr/*.json**: Curated test cases with known outcomes
- **src/adapters/data/deltaT_iers.json**: IERS Bulletin A data (2020-2023)

### Golden Case Reference
- **Location**: Pune, Maharashtra, India
- **Birth Data**: 24-10-1985, 02:30 AM → Expected rectification to 14:30 local
- **Coordinates**: 18.5204°N, 73.8567°E (±100m precision)
- **Timezone**: Asia/Kolkata (UTC+5:30, no DST)

---

## Citation Format

When citing this implementation:

```
Jyotish Shastra BTR Accuracy Metrics System (2025)
  - Ephemeris: Swiss Ephemeris v2.10.3 + JPL DE440/DE441
  - Time Scales: IAU 2006 + IERS Bulletin A (1973-2023)
  - Vedic Standards: BPHS (Parashara) + Lahiri Ayanamsa
  - Validation: 48 comprehensive tests (SC-1 through SC-7)
  - Source Code: https://github.com/[your-repo]/jyotish-shastra
```

---

## Updates & Maintenance

- **ΔT Data**: Updated annually when IERS publishes new measurements
- **Ephemeris Files**: Swiss Ephemeris updates as needed (decadal)
- **Horizons Fixtures**: Re-recorded when API version changes
- **BPHS References**: Standard translations (no anticipated changes)

**Maintained by**: Jyotish Shastra Development Team  
**Last Review**: 2025-11-06  
**Next Review**: 2026-11-06 (annual)