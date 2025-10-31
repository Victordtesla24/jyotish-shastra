
# Production Web app deployed on Vercel Errors:

## Comprehensive Chart Generation Errors:
```bash
2025-10-31T11:08:32.136Z [info] [dotenv@17.0.1] injecting env (0) from .env – [tip] encrypt with dotenvx: https://dotenvx.com
2025-10-31T11:08:32.136Z [info] ⚠️  Chart generation will use limited calculations without Swiss Ephemeris
2025-10-31T11:08:32.136Z [info] ⚠️  Chart generation will use limited calculations without Swiss Ephemeris
2025-10-31T11:08:32.136Z [info] ⚠️  Chart generation will use limited calculations without Swiss Ephemeris
2025-10-31T11:08:32.136Z [info] ⚠️  astronomicalConstants: swisseph not available: Cannot find package 'swisseph' imported from /var/task/src/utils/constants/astronomicalConstants.js
2025-10-31T11:08:32.136Z [info] ⚠️  AscendantCalculator: swisseph not available: Cannot find package 'swisseph' imported from /var/task/src/core/calculations/chart-casting/AscendantCalculator.js
2025-10-31T11:08:32.136Z [info] ⚠️  Swiss Ephemeris (swisseph) not available: Cannot find package 'swisseph' imported from /var/task/src/services/chart/ChartGenerationService.js
2025-10-31T11:08:32.136Z [info] 📝 Chart calculations will be limited. Some features may not work.
2025-10-31T11:08:32.136Z [info] ⚠️  sunrise: swisseph not available: Cannot find package 'swisseph' imported from /var/task/src/core/calculations/astronomy/sunrise.js
2025-10-31T11:08:32.136Z [info] ⚠️  gulika: swisseph not available: Cannot find package 'swisseph' imported from /var/task/src/core/calculations/rectification/gulika.js
2025-10-31T11:08:32.201Z [info] 📝 Using pure JavaScript Julian Day calculation (swisseph unavailable)
2025-10-31T11:08:32.201Z [warning] ⚠️  AscendantCalculator: Swiss Ephemeris not available - calculations disabled
2025-10-31T11:08:32.201Z [info] 📝 AscendantCalculator: Using pure JavaScript ascendant calculation (swisseph unavailable)
2025-10-31T11:08:32.201Z [info] 📝 Using pure JavaScript planetary position calculations (swisseph unavailable)
2025-10-31T11:08:32.201Z [info] 📝 Using pure JavaScript house calculation (swisseph unavailable)
2025-10-31T11:08:32.204Z [info] 📝 Using pure JavaScript Julian Day calculation (swisseph unavailable)
2025-10-31T11:08:32.204Z [warning] ⚠️  AscendantCalculator: Swiss Ephemeris not available - calculations disabled
2025-10-31T11:08:32.204Z [info] 📝 AscendantCalculator: Using pure JavaScript ascendant calculation (swisseph unavailable)
2025-10-31T11:08:32.205Z [info] 📝 Using pure JavaScript planetary position calculations (swisseph unavailable)
2025-10-31T11:08:32.205Z [info] 📝 Using pure JavaScript house calculation (swisseph unavailable)
2025-10-31T11:08:32.205Z [info] 📝 Using pure JavaScript house calculation (swisseph unavailable)
2025-10-31T11:08:32.205Z [info] 📝 Using pure JavaScript Julian Day calculation (swisseph unavailable)
2025-10-31T11:08:32.205Z [warning] ⚠️  AscendantCalculator: Swiss Ephemeris not available - calculations disabled
2025-10-31T11:08:32.205Z [info] 📝 AscendantCalculator: Using pure JavaScript ascendant calculation (swisseph unavailable)
2025-10-31T11:08:32.205Z [info] 📝 Using pure JavaScript planetary position calculations (swisseph unavailable)
2025-10-31T11:08:32.206Z [info] 📝 Using pure JavaScript house calculation (swisseph unavailable)
2025-10-31T11:08:32.206Z [info] 📝 Using pure JavaScript Julian Day calculation (swisseph unavailable)
2025-10-31T11:08:32.206Z [warning] ⚠️  AscendantCalculator: Swiss Ephemeris not available - calculations disabled
2025-10-31T11:08:32.206Z [info] 📝 AscendantCalculator: Using pure JavaScript ascendant calculation (swisseph unavailable)
2025-10-31T11:08:32.206Z [info] 📝 Using pure JavaScript planetary position calculations (swisseph unavailable)
2025-10-31T11:08:32.210Z [info] 📝 Using pure JavaScript house calculation (swisseph unavailable)
2025-10-31T11:08:32.210Z [info] 📝 Using pure JavaScript house calculation (swisseph unavailable)
2025-10-31T11:08:32.211Z [info] 📝 Using pure JavaScript Julian Day calculation (swisseph unavailable)
2025-10-31T11:08:32.211Z [warning] ⚠️  AscendantCalculator: Swiss Ephemeris not available - calculations disabled
2025-10-31T11:08:32.211Z [info] 📝 AscendantCalculator: Using pure JavaScript ascendant calculation (swisseph unavailable)
2025-10-31T11:08:32.211Z [info] 📝 Using pure JavaScript planetary position calculations (swisseph unavailable)
2025-10-31T11:08:32.211Z [info] 📝 Using pure JavaScript house calculation (swisseph unavailable)
2025-10-31T11:08:32.212Z [info] 📝 Using pure JavaScript Julian Day calculation (swisseph unavailable)
2025-10-31T11:08:32.212Z [warning] ⚠️  AscendantCalculator: Swiss Ephemeris not available - calculations disabled
2025-10-31T11:08:32.212Z [info] 📝 AscendantCalculator: Using pure JavaScript ascendant calculation (swisseph unavailable)
2025-10-31T11:08:32.212Z [info] 📝 Using pure JavaScript planetary position calculations (swisseph unavailable)
2025-10-31T11:08:32.212Z [info] 📝 Using pure JavaScript house calculation (swisseph unavailable)
2025-10-31T11:08:32.212Z [info] 📝 Using pure JavaScript house calculation (swisseph unavailable)
2025-10-31T11:08:32.236Z [info] 120.21.76.203 - - [31/Oct/2025:11:08:32 +0000] "POST /api/v1/analysis/comprehensive HTTP/1.1" 200 217 "https://jjyotish-shastra-mgpbveb1z-vics-projects-31447d42.vercel.app/comprehensive-analysis" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
```

## Birth Chart Generation Errors
```bash
2025-10-31T11:07:34.977Z [info] 🚀 CHART GENERATION SERVICE - Starting comprehensive chart generation...
2025-10-31T11:07:34.977Z [info] 📊 Input Birth Data: {
  "dateOfBirth": "1997-12-18T00:00:00.000Z",
  "timeOfBirth": "00:00",
  "name": "Farhan",
  "latitude": 32.493538,
  "longitude": 74.541158,
  "timezone": "Asia/Karachi",
  "placeOfBirth": "Sialkot",
  "gender": "male"
}
2025-10-31T11:07:34.977Z [info] 🔍 Step 1: Validating birth data...
2025-10-31T11:07:34.979Z [info] ✅ Birth data validation passed
2025-10-31T11:07:34.979Z [info] 🔍 Step 2: Processing location data...
2025-10-31T11:07:34.980Z [info] ✅ Location data processed: {
  latitude: 32.493538,
  longitude: 74.541158,
  geocodingInfo: {
    service: 'user_provided',
    accuracy: 'high',
    formattedAddress: 'Sialkot'
  }
}
2025-10-31T11:07:34.980Z [info] 🔍 Step 3: Generating Rasi chart...
2025-10-31T11:07:34.982Z [info] 📝 Using pure JavaScript Julian Day calculation (swisseph unavailable)
2025-10-31T11:07:34.982Z [warning] ⚠️  AscendantCalculator: Swiss Ephemeris not available - calculations disabled
2025-10-31T11:07:34.982Z [info] 📝 AscendantCalculator: Using pure JavaScript ascendant calculation (swisseph unavailable)
2025-10-31T11:07:34.983Z [info] 📝 Using pure JavaScript planetary position calculations (swisseph unavailable)
2025-10-31T11:07:34.985Z [info] 📝 Using pure JavaScript house calculation (swisseph unavailable)
2025-10-31T11:07:35.042Z [info] ✅ Rasi chart generated: {
  ascendant: {
    longitude: 152.74019522278695,
    sign: 'Virgo',
    signId: 6,
    signIndex: 5,
    degree: 2.7401952227869515
  },
  planetsCount: 9,
  housesCount: 12
}
2025-10-31T11:07:35.042Z [info] 🔍 Step 4: Generating Navamsa chart...
2025-10-31T11:07:35.042Z [info] 📝 Using pure JavaScript Julian Day calculation (swisseph unavailable)
2025-10-31T11:07:35.042Z [warning] ⚠️  AscendantCalculator: Swiss Ephemeris not available - calculations disabled
2025-10-31T11:07:35.042Z [info] 📝 AscendantCalculator: Using pure JavaScript ascendant calculation (swisseph unavailable)
2025-10-31T11:07:35.042Z [info] 📝 Using pure JavaScript planetary position calculations (swisseph unavailable)
2025-10-31T11:07:35.042Z [info] 📝 Using pure JavaScript house calculation (swisseph unavailable)
2025-10-31T11:07:35.042Z [info] 📝 Using pure JavaScript house calculation (swisseph unavailable)
2025-10-31T11:07:35.042Z [info] ✅ Navamsa chart generated: {
  ascendant: {
    longitude: 270,
    sign: 'Capricorn',
    signId: 10,
    degree: 0,
    rasiSign: 'Virgo',
    rasiSignId: 6
  },
  planetsCount: 9
}
2025-10-31T11:07:35.042Z [info] 🔍 Step 5: Calculating Dasha information...
2025-10-31T11:07:35.042Z [info] ✅ Dasha info calculated: {
  birthDasha: 'Venus',
  currentDasha: {
    planet: 'Moon',
    startAge: 26,
    endAge: 36,
    period: 10,
    remainingYears: 8.13014757174183
  }
}
2025-10-31T11:07:35.042Z [info] 🔍 Step 6: Generating comprehensive analysis...
2025-10-31T11:07:35.042Z [info] ✅ Analysis generated: [
  'personality',
  'health',
  'career',
  'relationships',
  'finances',
  'spirituality',
  'timing'
]
2025-10-31T11:07:35.042Z [info] 🎉 CHART GENERATION SERVICE - Comprehensive chart generation completed successfully!
2025-10-31T11:07:35.042Z [info] 📈 Result structure: {
  hasBirthData: true,
  hasRasiChart: true,
  hasNavamsaChart: true,
  hasDashaInfo: true,
  hasAnalysis: true,
  generatedAt: '2025-10-31T11:07:34.994Z'
}
2025-10-31T11:07:35.042Z [info] 120.21.76.203 - - [31/Oct/2025:11:07:35 +0000] "POST /api/v1/chart/generate HTTP/1.1" 200 - "https://jjyotish-shastra-mgpbveb1z-vics-projects-31447d42.vercel.app/" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
```