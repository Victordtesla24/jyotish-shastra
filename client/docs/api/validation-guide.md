# API Validation Guide

This guide provides comprehensive documentation for all API endpoints, including required fields, validation rules, and examples for the Jyotish Shastra platform.

## Overview

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
