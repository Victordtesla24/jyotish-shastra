# **API Validation Guide**

This guide provides comprehensive documentation for all API endpoints, including required fields, validation rules, and examples for the Jyotish Shastra platform.

## **Overview**

This document provides comprehensive validation requirements for all API endpoints in the Jyotish Shastra platform. All validation has been standardized to ensure consistency across endpoints.

## Standardized Validation Rules

### Common Requirements

All endpoints that accept birth data require the following **core fields**:

- `dateOfBirth`: Date in YYYY-MM-DD format (between 1800-2100)
- `timeOfBirth`: Time in HH:MM or HH:MM:SS format (24-hour format)
- **Location**: Either coordinates OR place information (see details below)

### Optional Fields (All Endpoints)

- `name`: Person's name (1-100 characters) - **OPTIONAL for all endpoints**
- `gender`: One of 'male', 'female', 'other', 'prefer_not_to_say'

### Location Requirements

You can provide location information in any of these formats:

#### Option 1: Flat Coordinates
```json
{
  "latitude": 18.5204,
  "longitude": 73.8567,
  "timezone": "Asia/Kolkata"
}
```

#### Option 2: Nested Place Object
```json
{
  "placeOfBirth": {
    "name": "Pune, Maharashtra, India",
    "latitude": 18.5204,
    "longitude": 73.8567,
    "timezone": "Asia/Kolkata"
  }
}
```

#### Option 3: Place Name Only (for geocoding)
```json
{
  "placeOfBirth": "Pune, Maharashtra, India"
}
```

## Endpoint-Specific Validation

### Chart Generation Endpoints

#### POST /v1/chart/generate
**Purpose**: Generate birth chart
**Validation Schema**: `chartGenerationSchema`

**Required Fields**:
- `dateOfBirth`
- `timeOfBirth`
- Location (coordinates or place)

**Optional Fields**:
- `name` (OPTIONAL)
- `includeNavamsa` (default: true)
- `includeDivisionalCharts` (default: ['D1', 'D9'])
- `includeYogas` (default: true)
- `includeAspects` (default: true)
- `includeDasha` (default: true)

**Example Request**:
```json
{
  "dateOfBirth": "1985-03-15",
  "timeOfBirth": "08:30",
  "latitude": 18.5204,
  "longitude": 73.8567,
  "timezone": "Asia/Kolkata"
}
```

#### POST /v1/chart/generate/comprehensive
**Purpose**: Generate chart with enhanced analysis
**Validation Schema**: `chartGenerationSchema`

Same requirements as `/v1/chart/generate`

### Analysis Endpoints

All analysis endpoints use the **same standardized validation schema** (`analysisSchema`).

#### POST /v1/analysis/comprehensive
**Purpose**: Complete expert-level analysis
**Validation Schema**: `comprehensiveAnalysisSchema`

**Required**: Either `birthData` OR `chartId` (not both)

**birthData Requirements**:
- `dateOfBirth`
- `timeOfBirth`
- Location (coordinates or place)
- `name` (OPTIONAL)

**Example Request**:
```json
{
  "birthData": {
    "dateOfBirth": "1985-03-15",
    "timeOfBirth": "08:30",
    "placeOfBirth": {
      "name": "Pune, Maharashtra, India",
      "latitude": 18.5204,
      "longitude": 73.8567,
      "timezone": "Asia/Kolkata"
    }
  }
}
```

#### Individual Analysis Endpoints

All use the same `analysisSchema`:

- **POST /v1/analysis/houses** - House analysis
- **POST /v1/analysis/aspects** - Planetary aspects
- **POST /v1/analysis/arudha** - Arudha Lagna analysis
- **POST /v1/analysis/navamsa** - Navamsa chart analysis
- **POST /v1/analysis/dasha** - Dasha timeline analysis
- **POST /v1/analysis/birth-data** - Birth data validation

**Required Fields** (all endpoints):
- `dateOfBirth`
- `timeOfBirth`
- Location (coordinates or place)

**Optional Fields** (all endpoints):
- `name` (OPTIONAL - consistent across all analysis endpoints)

**Example Request** (works for all individual analysis endpoints):
```json
{
  "dateOfBirth": "1985-03-15",
  "timeOfBirth": "08:30",
  "latitude": 18.5204,
  "longitude": 73.8567,
  "timezone": "Asia/Kolkata"
}
```

## Validation Error Format

All endpoints return validation errors in a standardized format:

```json
{
  "success": false,
  "error": "Validation failed",
  "details": [
    {
      "field": "dateOfBirth",
      "message": "Date of birth is required and cannot be empty",
      "providedValue": null
    }
  ],
  "suggestions": [
    "Please provide a valid birth date in YYYY-MM-DD format"
  ],
  "helpText": "Please check the provided birth data and try again. All required fields must be properly formatted."
}
```

## Common Validation Rules

### Date Format
- **Format**: YYYY-MM-DD
- **Range**: 1800-01-01 to 2100-12-31
- **Future dates**: Not allowed

### Time Format
- **Accepted formats**:
  - "HH:MM" (e.g., "14:30")
  - "HH:MM:SS" (e.g., "14:30:00")
- **Format**: 24-hour format
- **Range**: 00:00 to 23:59

### Coordinates
- **Latitude**: -90° to 90° (decimal degrees)
- **Longitude**: -180° to 180° (decimal degrees)
- **Precision**: Up to 6 decimal places

### Timezone
- **IANA format**: "Asia/Kolkata", "America/New_York"
- **UTC offset**: "+05:30", "-05:00"
- **Standard**: "UTC", "GMT"

### Name (Optional for all endpoints)
- **Length**: 1-100 characters
- **Format**: Any valid string, automatically trimmed

## Testing Examples

### Valid Request Examples

#### Minimal Required Data
```json
{
  "dateOfBirth": "1985-03-15",
  "timeOfBirth": "08:30",
  "latitude": 18.5204,
  "longitude": 73.8567,
  "timezone": "Asia/Kolkata"
}
```

#### Complete Data with Optional Fields
```json
{
  "name": "Test Person",
  "dateOfBirth": "1985-03-15",
  "timeOfBirth": "08:30:00",
  "placeOfBirth": {
    "name": "Pune, Maharashtra, India",
    "latitude": 18.5204,
    "longitude": 73.8567,
    "timezone": "Asia/Kolkata",
    "city": "Pune",
    "country": "India"
  },
  "gender": "male"
}
```

### Error Examples

#### Missing Required Field
```json
{
  "timeOfBirth": "08:30",
  "latitude": 18.5204,
  "longitude": 73.8567,
  "timezone": "Asia/Kolkata"
}
```
**Error**: Missing `dateOfBirth`

#### Invalid Time Format
```json
{
  "dateOfBirth": "1985-03-15",
  "timeOfBirth": "8:30 AM",
  "latitude": 18.5204,
  "longitude": 73.8567,
  "timezone": "Asia/Kolkata"
}
```
**Error**: Invalid time format (must be 24-hour format)

## Standardization Benefits

1. **Consistency**: All analysis endpoints have identical validation requirements
2. **Flexibility**: Name field is optional across all endpoints
3. **User-Friendly**: Clear error messages with helpful suggestions
4. **Backwards Compatible**: Supports multiple location input formats
5. **Testing Friendly**: Predictable validation behavior across all endpoints

## Recent Validation Updates & Fixes (2024)

### Critical Validation Standardization

Following comprehensive API testing and validation protocol implementation, the following standardization improvements have been completed:

#### Updated Validation Functions

##### Dasha Analysis Validation
**Function**: `validateDashaAnalysis()`
**Schema**: `analysisRequiredSchema` (updated to use directly)

**BEFORE** (Inconsistent):
```javascript
// Used validateHouseAnalysis with name required by default
function validateDashaAnalysis(data, isStandardization = false) {
  return validateHouseAnalysis(data, isStandardization);
}
```

**AFTER** (Standardized):
```javascript
// Direct use of analysisRequiredSchema with name optional
function validateDashaAnalysis(data, isStandardization = true) {
  const { error, value } = analysisRequiredSchema.validate(data, {
    abortEarly: false,
    allowUnknown: true,
    stripUnknown: false
  });
  // ... error handling with descriptive messages
}
```

##### Navamsa Analysis Validation
**Function**: `validateNavamsaAnalysis()`
**Schema**: `analysisRequiredSchema` (updated to use directly)

Same standardization applied as Dasha analysis for consistency.

#### Schema Improvements

##### Core Schema: `analysisRequiredSchema`
```javascript
const analysisRequiredSchema = Joi.object({
  name: nameSchema.optional(), // ✅ Explicitly optional for all endpoints
  dateOfBirth: dateSchema,     // Required
  timeOfBirth: timeSchema,     // Required
  latitude: latitudeSchema.optional(),
  longitude: longitudeSchema.optional(),
  timezone: timezoneSchema.optional(),
  placeOfBirth: Joi.alternatives().try(
    Joi.object({
      name: placeNameSchema.optional(),
      latitude: latitudeSchema,
      longitude: longitudeSchema,
      timezone: timezoneSchema
    }),
    Joi.string().min(2).max(100)
  ).optional(),
  gender: genderSchema
});
```

### Validation Testing Results

#### Comprehensive Endpoint Testing
All endpoints tested with standardized birth data:
- **Date**: 1985-10-24
- **Time**: 14:30
- **Location**: Pune (18.5204°N, 73.8567°E)
- **Timezone**: Asia/Kolkata

#### Test Results Summary

```bash
✅ POST /api/v1/analysis/dasha
   ├── WITHOUT name field: success: true ✅
   ├── WITH name field: success: true ✅
   └── Response: Calculated Vimshottari periods (no hardcoded data)

✅ POST /api/v1/analysis/navamsa
   ├── WITHOUT name field: success: true ✅
   ├── WITH name field: success: true ✅
   └── Response: D9 chart analysis with proper integration

✅ POST /api/v1/analysis/houses
   ├── WITHOUT name field: success: true ✅
   ├── WITH name field: success: true ✅
   └── Response: House-by-house analysis maintained

✅ POST /api/v1/analysis/comprehensive
   ├── WITHOUT name field: success: true ✅
   ├── WITH name field: success: true ✅
   └── Response: Full 8-section analysis working

✅ POST /api/v1/chart/generate
   ├── WITHOUT name field: success: true ✅
   ├── WITH name field: success: true ✅
   └── Response: Swiss Ephemeris calculations accurate
```

### Updated Error Handling

#### Enhanced Error Messages
All validation functions now provide descriptive error messages:

```json
{
  "success": false,
  "error": "Validation failed",
  "details": [
    {
      "field": "dateOfBirth",
      "message": "Date of birth is required and cannot be empty",
      "providedValue": null
    }
  ],
  "suggestions": [
    "Date format should be YYYY-MM-DD (e.g., 1985-03-15)"
  ],
  "helpText": "Dasha analysis requires birth date, time, and location information."
}
```

#### Context-Specific Help Text
Each analysis endpoint provides specific help text:
- **Dasha Analysis**: "Dasha analysis requires birth date, time, and location information."
- **Navamsa Analysis**: "Navamsa analysis requires birth date, time, and location information."
- **House Analysis**: "House analysis requires birth date, time, and location information."
- **Comprehensive Analysis**: "Comprehensive analysis requires birth data and analysis configuration."

### Validation Schema Hierarchy

#### Current Schema Structure
```
analysisRequiredSchema (Core - name optional)
├── validateDashaAnalysis() → Uses directly
├── validateNavamsaAnalysis() → Uses directly
├── validateHouseAnalysis() → Uses comprehensiveAnalysisSchema
├── validateAspectAnalysis() → Delegates to validateHouseAnalysis
├── validateArudhaAnalysis() → Delegates to validateHouseAnalysis
└── validateComprehensiveAnalysis() → Uses comprehensiveAnalysisSchema
```

#### Schema Standardization Benefits
1. **Predictable Behavior**: All analysis endpoints behave identically
2. **Reduced Complexity**: Fewer validation paths to maintain
3. **Clear Documentation**: Consistent field requirements across endpoints
4. **Testing Efficiency**: Single validation pattern to test
5. **User Experience**: No confusion about required vs optional fields

### API Response Standardization

#### Consistent Success Responses
All endpoints now return consistent success response format:

```json
{
  "success": true,
  "analysis": {
    "section": "[Analysis Type]",
    "[analysisType]Analysis": {
      // Calculated analysis data (no hardcoded content)
    },
    "message": "[Analysis type] analysis completed successfully"
  }
}
```

#### Dasha Analysis Response (Fixed)
**BEFORE** (Hardcoded):
```json
{
  "analysis": {
    "dashaAnalysis": {
      "dasha_sequence": [
        { "dasha": "Sun", "duration": 6, "completed": true }
        // Static hardcoded data
      ]
    }
  }
}
```

**AFTER** (Calculated):
```json
{
  "analysis": {
    "dashaAnalysis": {
      "dasha_sequence": [
        {
          "planet": "Saturn",
          "startAge": 34,
          "endAge": 53,
          "period": 19,
          "isCurrent": true,
          "remainingYears": 13.7
        }
        // Real calculated Vimshottari periods
      ],
      "currentDasha": {
        "mahadasha": "Saturn",
        "antardasha": "Mercury",
        // Actual calculated current period data
      }
    }
  }
}
```

### Timezone Handling Validation

#### IST Preservation Verified
All validation tests confirm proper timezone handling:

```json
{
  "dateOfBirth": "1985-10-24",
  "timeOfBirth": "14:30",
  "timezone": "Asia/Kolkata"
}
```

**Validation Results**:
- ✅ Timezone preserved in calculations
- ✅ No unwanted conversions to other timezones
- ✅ Swiss Ephemeris receives correct UTC offset (+05:30)
- ✅ Birth time accuracy maintained for house calculations

### Location Validation Enhancements

#### Multiple Format Support Confirmed
All these formats pass validation and work correctly:

#### Format 1: Direct Coordinates
```json
{
  "dateOfBirth": "1985-10-24",
  "timeOfBirth": "14:30",
  "latitude": 18.5204,
  "longitude": 73.8567,
  "timezone": "Asia/Kolkata"
}
```

#### Format 2: Nested Place Object
```json
{
  "dateOfBirth": "1985-10-24",
  "timeOfBirth": "14:30",
  "placeOfBirth": {
    "name": "Pune, Maharashtra, India",
    "latitude": 18.5204,
    "longitude": 73.8567,
    "timezone": "Asia/Kolkata"
  }
}
```

#### Format 3: Place Name for Geocoding
```json
{
  "dateOfBirth": "1985-10-24",
  "timeOfBirth": "14:30",
  "placeOfBirth": "Pune, Maharashtra, India"
}
```

### Quality Assurance Validation

#### Comprehensive Testing Coverage
- **Unit Tests**: All validation functions tested individually
- **Integration Tests**: API endpoints tested with various input combinations
- **Error Path Testing**: Invalid inputs tested for proper error handling
- **Schema Validation**: All validation schemas tested for consistency

#### Performance Impact Assessment
- **Validation Speed**: No degradation in validation performance
- **Memory Usage**: Minimal overhead from schema improvements
- **Response Time**: API response times maintained
- **Error Processing**: Enhanced error messages with negligible overhead

### Migration Guide for Existing Clients

#### For API Consumers
**No Breaking Changes**: All existing API calls continue to work without modification.

**Optional Improvements**:
- Remove `name` field from requests if not needed (reduces payload size)
- Use any of the three location formats (coordinates, nested object, or place name)
- Expect more descriptive error messages for debugging

#### For Developers
**Updated Validation Patterns**:
```javascript
// New pattern for analysis endpoints
const result = validateDashaAnalysis(requestData);
// Uses analysisRequiredSchema directly with name optional

// Existing pattern still works
const result = validateHouseAnalysis(requestData, true);
// Passing isStandardization=true makes name optional
```

This comprehensive validation standardization ensures consistent, reliable, and user-friendly API behavior across all endpoints while maintaining full backwards compatibility.
