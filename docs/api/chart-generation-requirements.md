# Vedic Birth Chart (Kundli) Generation: Internal Engine & Implementation

This document provides a comprehensive overview of the internal chart generation engine used in this project. It details the architecture, key components, and implementation of the `ChartGenerationService`, which is responsible for all Vedic astrology calculations.

## 1. Core Technology: Node.js and Swiss Ephemeris

The backend is built on **Node.js** and utilizes the `swisseph` library for high-precision astronomical calculations. This library is a JavaScript port of the official Swiss Ephemeris, which is trusted by professional astrologers worldwide for its accuracy.

**Key Features:**
- **High-Precision Calculations:** Based on NASA's JPL ephemerides for accurate planetary positions.
- **Vedic Astrology Support:** Configured to use the **Lahiri Ayanamsa**, the standard for Vedic astrology.
- **Comprehensive Functionality:** Provides calculations for planetary positions, house cusps, ascendant, and other astrological factors.

## 2. Chart Generation Service (`ChartGenerationService.js`)

The `ChartGenerationService` is the central component responsible for orchestrating the entire chart generation process. It integrates geocoding, astronomical calculations, and analysis to produce a complete and accurate Vedic birth chart.

### Key Responsibilities:
- **Geocoding:** Converts location names (city, country) into precise geographic coordinates (latitude and longitude) using the `GeocodingService`.
- **Julian Day Calculation:** Converts the user's birth date, time, and timezone into the Julian Day number required by the Swiss Ephemeris.
- **Rasi (D1) Chart Generation:** Calculates the positions of all planets, the ascendant (Lagna), and house cusps for the main birth chart.
- **Navamsa (D9) Chart Generation:** Calculates the Navamsa chart, which is crucial for analyzing marriage, partnerships, and the inner self.
- **Dasha Calculations:** Determines the Vimshottari Dasha periods based on the Moon's nakshatra at birth.
- **Analysis Integration:** Provides the foundational chart data needed for all higher-level analysis services.

### Implementation Example

The following code demonstrates how to use the `ChartGenerationService` to generate a comprehensive birth chart.

```javascript
const ChartGenerationService = require('../services/chart/ChartGenerationService');

async function generateChart() {
  const birthData = {
    dateOfBirth: '1990-04-15',
    timeOfBirth: '14:30:00',
    placeOfBirth: 'New Delhi, India',
    // Optional: Provide coordinates to bypass geocoding
    // latitude: 28.6139,
    // longitude: 77.2090,
    timezone: '+05:30'
  };

  try {
    const chartService = new ChartGenerationService();
    const comprehensiveChart = await chartService.generateComprehensiveChart(birthData);

    console.log(JSON.stringify(comprehensiveChart, null, 2));
  } catch (error) {
    console.error('Error generating chart:', error.message);
  }
}

generateChart();
```

## 3. Output Data Structure

The `generateComprehensiveChart` method returns a detailed JSON object containing the complete birth chart data. The structure is as follows:

```json
{
  "birthData": {
    "dateOfBirth": "1990-04-15",
    "timeOfBirth": "14:30:00",
    "placeOfBirth": "New Delhi, India",
    "latitude": 28.6139,
    "longitude": 77.2090,
    "timezone": "+05:30",
    "geocodingInfo": {
      "service": "user_provided",
      "accuracy": "high",
      "formattedAddress": "New Delhi, India"
    }
  },
  "rasiChart": {
    "ascendant": {
      "longitude": 157.3,
      "sign": "Virgo",
      "signId": 6,
      "degree": 7.3
    },
    "planets": [
      {
        "name": "Sun",
        "longitude": 2.5,
        "degree": 2.5,
        "sign": "Aries",
        "signId": 1,
        "isRetrograde": false,
        "isCombust": false,
        "dignity": "exalted"
      }
      // ... other planets
    ],
    "housePositions": [
      {
        "houseNumber": 1,
        "degree": 157.3,
        "sign": "Virgo",
        "signId": 6
      }
      // ... other houses
    ]
  },
  "navamsaChart": {
    "ascendant": {
      "longitude": 248.9,
      "sign": "Sagittarius",
      "signId": 9,
      "degree": 8.9
    },
    "planets": [
      {
        "name": "Sun",
        "longitude": 0,
        "sign": "Aries",
        "signId": 1,
        "degree": 0
      }
      // ... other planets in Navamsa
    ]
  },
  "dashaInfo": {
    "birthDasha": "venus",
    "currentDasha": {
      "dasha": "jupiter",
      "startAge": 25,
      "endAge": 41,
      "remainingYears": 5.5
    }
  },
  "analysis": {
    // ... comprehensive analysis results
  }
}
```

## 4. Frontend Chart Visualization

The frontend of the application is built with **React** and uses modern JavaScript libraries for rendering the birth charts.

### Chart Visualization Libraries

- **D3.js:** A powerful and flexible library used for creating highly customized and interactive SVG-based chart visualizations. It allows for precise control over the rendering of the zodiac, houses, planets, and aspects.
- **Fabric.js:** Used for creating and manipulating chart elements on an HTML5 canvas. It provides an object model for managing shapes, text, and images, making it suitable for building dynamic and interactive chart interfaces.

These libraries are used to create the North Indian, South Indian, and circular chart styles displayed in the user interface. They consume the JSON data generated by the backend `ChartGenerationService` to render the final visualizations.
