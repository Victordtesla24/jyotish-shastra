# Errors in Vercel Deployment

## Gemerate Chart API: 
```bash
2025-10-31T09:40:24.592Z [info] [dotenv@17.0.1] injecting env (0) from .env – [tip] encrypt with dotenvx: https://dotenvx.com
2025-10-31T09:40:24.592Z [info] ⚠️  Chart generation will use limited calculations without Swiss Ephemeris
2025-10-31T09:40:24.592Z [info] ⚠️  Chart generation will use limited calculations without Swiss Ephemeris
2025-10-31T09:40:24.592Z [info] ⚠️  Chart generation will use limited calculations without Swiss Ephemeris
2025-10-31T09:40:24.592Z [info] ⚠️  astronomicalConstants: swisseph not available: Cannot find package 'swisseph' imported from /var/task/src/utils/constants/astronomicalConstants.js
2025-10-31T09:40:24.593Z [info] ⚠️  AscendantCalculator: swisseph not available: Cannot find package 'swisseph' imported from /var/task/src/core/calculations/chart-casting/AscendantCalculator.js
2025-10-31T09:40:24.593Z [info] ⚠️  Swiss Ephemeris (swisseph) not available: Cannot find package 'swisseph' imported from /var/task/src/services/chart/ChartGenerationService.js
2025-10-31T09:40:24.593Z [info] 📝 Chart calculations will be limited. Some features may not work.
2025-10-31T09:40:24.593Z [info] ⚠️  sunrise: swisseph not available: Cannot find package 'swisseph' imported from /var/task/src/core/calculations/astronomy/sunrise.js
2025-10-31T09:40:24.593Z [info] ⚠️  gulika: swisseph not available: Cannot find package 'swisseph' imported from /var/task/src/core/calculations/rectification/gulika.js
2025-10-31T09:40:24.629Z [info] 🚀 CHART GENERATION SERVICE - Starting comprehensive chart generation...
2025-10-31T09:40:24.633Z [info] 📊 Input Birth Data: {
  "name": "Farhan",
  "dateOfBirth": "1997-12-18T00:00:00.000Z",
  "timeOfBirth": "00:00",
  "latitude": 32.493538,
  "longitude": 74.541158,
  "timezone": "Asia/Karachi",
  "gender": "male"
}
2025-10-31T09:40:24.633Z [info] 🔍 Step 1: Validating birth data...
2025-10-31T09:40:24.635Z [info] ✅ Birth data validation passed
2025-10-31T09:40:24.635Z [info] 🔍 Step 2: Processing location data...
2025-10-31T09:40:24.636Z [info] ✅ Location data processed: {
  latitude: 32.493538,
  longitude: 74.541158,
  geocodingInfo: {
    service: 'user_provided',
    accuracy: 'high',
    formattedAddress: 'undefined, undefined, undefined'
  }
}
2025-10-31T09:40:24.636Z [info] 🔍 Step 3: Generating Rasi chart...
2025-10-31T09:40:24.638Z [info] 📝 Using pure JavaScript Julian Day calculation (swisseph unavailable)
2025-10-31T09:40:24.638Z [warning] ⚠️  AscendantCalculator: Swiss Ephemeris not available - calculations disabled
2025-10-31T09:40:24.638Z [info] 📝 AscendantCalculator: Using pure JavaScript ascendant calculation (swisseph unavailable)
2025-10-31T09:40:24.639Z [error] ❌ CHART GENERATION SERVICE - Error during chart generation: Error: Failed to generate Rasi chart: Failed to get planetary positions: Swiss Ephemeris calculations are not available in this serverless environment
    at ChartGenerationService.generateRasiChart (file:///var/task/src/services/chart/ChartGenerationService.js:357:13)
    at process.processTicksAndRejections (node:internal/process/task_queues:105:5)
    at async ChartGenerationService.generateComprehensiveChart (file:///var/task/src/services/chart/ChartGenerationService.js:170:25)
    at async ChartController.generateChart (file:///var/task/src/api/controllers/ChartController.js:115:25)
2025-10-31T09:40:24.639Z [error] ❌ Error stack: Error: Failed to generate Rasi chart: Failed to get planetary positions: Swiss Ephemeris calculations are not available in this serverless environment
    at ChartGenerationService.generateRasiChart (file:///var/task/src/services/chart/ChartGenerationService.js:357:13)
    at process.processTicksAndRejections (node:internal/process/task_queues:105:5)
    at async ChartGenerationService.generateComprehensiveChart (file:///var/task/src/services/chart/ChartGenerationService.js:170:25)
    at async ChartController.generateChart (file:///var/task/src/api/controllers/ChartController.js:115:25)
2025-10-31T09:40:24.639Z [error] Chart generation error: Error: Failed to generate comprehensive chart: Failed to generate Rasi chart: Failed to get planetary positions: Swiss Ephemeris calculations are not available in this serverless environment
    at ChartGenerationService.generateComprehensiveChart (file:///var/task/src/services/chart/ChartGenerationService.js:221:13)
    at process.processTicksAndRejections (node:internal/process/task_queues:105:5)
    at async ChartController.generateChart (file:///var/task/src/api/controllers/ChartController.js:115:25)
2025-10-31T09:40:24.644Z [info] 202.14.193.189 - - [31/Oct/2025:09:40:24 +0000] "POST /api/v1/chart/generate HTTP/1.1" 500 367 "-" "curl/8.7.1"
```

## Generate Comprehensive Chart API Error:
```bash
2025-10-31T09:21:04.624Z [info] 🚀 CHART GENERATION SERVICE - Starting comprehensive chart generation...
2025-10-31T09:21:04.624Z [info] 📊 Input Birth Data: {
  "dateOfBirth": "1997-12-18T00:00:00.000Z",
  "timeOfBirth": "00:00",
  "name": "Farhan",
  "latitude": 32.493538,
  "longitude": 74.541158,
  "timezone": "Asia/Karachi",
  "placeOfBirth": "Sialkot",
  "gender": "male"
}
2025-10-31T09:21:04.624Z [info] 🔍 Step 1: Validating birth data...
2025-10-31T09:21:04.624Z [info] ✅ Birth data validation passed
2025-10-31T09:21:04.624Z [info] 🔍 Step 2: Processing location data...
2025-10-31T09:21:04.624Z [info] ✅ Location data processed: {
  latitude: 32.493538,
  longitude: 74.541158,
  geocodingInfo: {
    service: 'user_provided',
    accuracy: 'high',
    formattedAddress: 'Sialkot'
  }
}
2025-10-31T09:21:04.624Z [info] 🔍 Step 3: Generating Rasi chart...
2025-10-31T09:21:04.624Z [error] ❌ CHART GENERATION SERVICE - Error during chart generation: Error: Failed to generate Rasi chart: Failed to calculate Julian Day: Swiss Ephemeris calculations are not available in this serverless environment
    at ChartGenerationService.generateRasiChart (file:///var/task/src/services/chart/ChartGenerationService.js:355:13)
    at ChartGenerationService.generateComprehensiveChart (file:///var/task/src/services/chart/ChartGenerationService.js:168:36)
    at process.processTicksAndRejections (node:internal/process/task_queues:105:5)
    at async ChartController.generateChart (file:///var/task/src/api/controllers/ChartController.js:115:25)
2025-10-31T09:21:04.624Z [error] ❌ Error stack: Error: Failed to generate Rasi chart: Failed to calculate Julian Day: Swiss Ephemeris calculations are not available in this serverless environment
    at ChartGenerationService.generateRasiChart (file:///var/task/src/services/chart/ChartGenerationService.js:355:13)
    at ChartGenerationService.generateComprehensiveChart (file:///var/task/src/services/chart/ChartGenerationService.js:168:36)
    at process.processTicksAndRejections (node:internal/process/task_queues:105:5)
    at async ChartController.generateChart (file:///var/task/src/api/controllers/ChartController.js:115:25)
2025-10-31T09:21:04.624Z [error] Chart generation error: Error: Failed to generate comprehensive chart: Failed to generate Rasi chart: Failed to calculate Julian Day: Swiss Ephemeris calculations are not available in this serverless environment
    at ChartGenerationService.generateComprehensiveChart (file:///var/task/src/services/chart/ChartGenerationService.js:219:13)
    at process.processTicksAndRejections (node:internal/process/task_queues:105:5)
    at async ChartController.generateChart (file:///var/task/src/api/controllers/ChartController.js:115:25)
2025-10-31T09:21:04.625Z [info] 202.14.193.189 - - [31/Oct/2025:09:21:04 +0000] "POST /api/v1/chart/generate HTTP/1.1" 500 364 "https://jjyotish-shastra.vercel.app/" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
```

## swisseph not available error:
```bash
2025-10-31T09:37:32.265Z [info] [dotenv@17.0.1] injecting env (0) from .env – [tip] encrypt with dotenvx: https://dotenvx.com
2025-10-31T09:37:32.265Z [info] ⚠️  Chart generation will use limited calculations without Swiss Ephemeris
2025-10-31T09:37:32.265Z [info] ⚠️  Chart generation will use limited calculations without Swiss Ephemeris
2025-10-31T09:37:32.265Z [info] ⚠️  Chart generation will use limited calculations without Swiss Ephemeris
2025-10-31T09:37:32.265Z [info] ⚠️  astronomicalConstants: swisseph not available: Cannot find package 'swisseph' imported from /var/task/src/utils/constants/astronomicalConstants.js
2025-10-31T09:37:32.265Z [info] ⚠️  AscendantCalculator: swisseph not available: Cannot find package 'swisseph' imported from /var/task/src/core/calculations/chart-casting/AscendantCalculator.js
2025-10-31T09:37:32.265Z [info] ⚠️  Swiss Ephemeris (swisseph) not available: Cannot find package 'swisseph' imported from /var/task/src/services/chart/ChartGenerationService.js
2025-10-31T09:37:32.265Z [info] 📝 Chart calculations will be limited. Some features may not work.
2025-10-31T09:37:32.265Z [info] ⚠️  sunrise: swisseph not available: Cannot find package 'swisseph' imported from /var/task/src/core/calculations/astronomy/sunrise.js
2025-10-31T09:37:32.265Z [info] ⚠️  gulika: swisseph not available: Cannot find package 'swisseph' imported from /var/task/src/core/calculations/rectification/gulika.js
2025-10-31T09:37:32.343Z [info] 🚀 CHART GENERATION SERVICE - Starting comprehensive chart generation...
2025-10-31T09:37:32.346Z [info] 📊 Input Birth Data: {
  "name": "Farhan",
  "dateOfBirth": "1997-12-18T00:00:00.000Z",
  "timeOfBirth": "00:00",
  "latitude": 32.493538,
  "longitude": 74.541158,
  "timezone": "Asia/Karachi",
  "gender": "male"
}
2025-10-31T09:37:32.346Z [info] 🔍 Step 1: Validating birth data...
2025-10-31T09:37:32.348Z [info] ✅ Birth data validation passed
2025-10-31T09:37:32.348Z [info] 🔍 Step 2: Processing location data...
2025-10-31T09:37:32.349Z [info] ✅ Location data processed: {
  latitude: 32.493538,
  longitude: 74.541158,
  geocodingInfo: {
    service: 'user_provided',
    accuracy: 'high',
    formattedAddress: 'undefined, undefined, undefined'
  }
}
2025-10-31T09:37:32.349Z [info] 🔍 Step 3: Generating Rasi chart...
2025-10-31T09:37:32.352Z [info] 📝 Using pure JavaScript Julian Day calculation (swisseph unavailable)
2025-10-31T09:37:32.352Z [warning] ⚠️  AscendantCalculator: Swiss Ephemeris not available - calculations disabled
2025-10-31T09:37:32.353Z [error] ❌ CHART GENERATION SERVICE - Error during chart generation: Error: Failed to generate Rasi chart: Failed to calculate Ascendant: Swiss Ephemeris not initialized. Cannot calculate ascendant.
    at ChartGenerationService.generateRasiChart (file:///var/task/src/services/chart/ChartGenerationService.js:357:13)
    at process.processTicksAndRejections (node:internal/process/task_queues:105:5)
    at async ChartGenerationService.generateComprehensiveChart (file:///var/task/src/services/chart/ChartGenerationService.js:170:25)
    at async ChartController.generateChart (file:///var/task/src/api/controllers/ChartController.js:115:25)
2025-10-31T09:37:32.353Z [error] ❌ Error stack: Error: Failed to generate Rasi chart: Failed to calculate Ascendant: Swiss Ephemeris not initialized. Cannot calculate ascendant.
    at ChartGenerationService.generateRasiChart (file:///var/task/src/services/chart/ChartGenerationService.js:357:13)
    at process.processTicksAndRejections (node:internal/process/task_queues:105:5)
    at async ChartGenerationService.generateComprehensiveChart (file:///var/task/src/services/chart/ChartGenerationService.js:170:25)
    at async ChartController.generateChart (file:///var/task/src/api/controllers/ChartController.js:115:25)
2025-10-31T09:37:32.353Z [error] Chart generation error: Error: Failed to generate comprehensive chart: Failed to generate Rasi chart: Failed to calculate Ascendant: Swiss Ephemeris not initialized. Cannot calculate ascendant.
    at ChartGenerationService.generateComprehensiveChart (file:///var/task/src/services/chart/ChartGenerationService.js:221:13)
    at process.processTicksAndRejections (node:internal/process/task_queues:105:5)
    at async ChartController.generateChart (file:///var/task/src/api/controllers/ChartController.js:115:25)
2025-10-31T09:37:32.359Z [info] 202.14.193.189 - - [31/Oct/2025:09:37:32 +0000] "POST /api/v1/chart/generate HTTP/1.1" 500 346 "-" "curl/8.7.1"
```

## Generate Comprehensive Chart Service Error:
```bash
2025-10-31T09:40:24.592Z [info] [dotenv@17.0.1] injecting env (0) from .env – [tip] encrypt with dotenvx: https://dotenvx.com
2025-10-31T09:40:24.592Z [info] ⚠️  Chart generation will use limited calculations without Swiss Ephemeris
2025-10-31T09:40:24.592Z [info] ⚠️  Chart generation will use limited calculations without Swiss Ephemeris
2025-10-31T09:40:24.592Z [info] ⚠️  Chart generation will use limited calculations without Swiss Ephemeris
2025-10-31T09:40:24.592Z [info] ⚠️  astronomicalConstants: swisseph not available: Cannot find package 'swisseph' imported from /var/task/src/utils/constants/astronomicalConstants.js
2025-10-31T09:40:24.593Z [info] ⚠️  AscendantCalculator: swisseph not available: Cannot find package 'swisseph' imported from /var/task/src/core/calculations/chart-casting/AscendantCalculator.js
2025-10-31T09:40:24.593Z [info] ⚠️  Swiss Ephemeris (swisseph) not available: Cannot find package 'swisseph' imported from /var/task/src/services/chart/ChartGenerationService.js
2025-10-31T09:40:24.593Z [info] 📝 Chart calculations will be limited. Some features may not work.
2025-10-31T09:40:24.593Z [info] ⚠️  sunrise: swisseph not available: Cannot find package 'swisseph' imported from /var/task/src/core/calculations/astronomy/sunrise.js
2025-10-31T09:40:24.593Z [info] ⚠️  gulika: swisseph not available: Cannot find package 'swisseph' imported from /var/task/src/core/calculations/rectification/gulika.js
2025-10-31T09:40:24.629Z [info] 🚀 CHART GENERATION SERVICE - Starting comprehensive chart generation...
2025-10-31T09:40:24.633Z [info] 📊 Input Birth Data: {
  "name": "Farhan",
  "dateOfBirth": "1997-12-18T00:00:00.000Z",
  "timeOfBirth": "00:00",
  "latitude": 32.493538,
  "longitude": 74.541158,
  "timezone": "Asia/Karachi",
  "gender": "male"
}
2025-10-31T09:40:24.633Z [info] 🔍 Step 1: Validating birth data...
2025-10-31T09:40:24.635Z [info] ✅ Birth data validation passed
2025-10-31T09:40:24.635Z [info] 🔍 Step 2: Processing location data...
2025-10-31T09:40:24.636Z [info] ✅ Location data processed: {
  latitude: 32.493538,
  longitude: 74.541158,
  geocodingInfo: {
    service: 'user_provided',
    accuracy: 'high',
    formattedAddress: 'undefined, undefined, undefined'
  }
}
2025-10-31T09:40:24.636Z [info] 🔍 Step 3: Generating Rasi chart...
2025-10-31T09:40:24.638Z [info] 📝 Using pure JavaScript Julian Day calculation (swisseph unavailable)
2025-10-31T09:40:24.638Z [warning] ⚠️  AscendantCalculator: Swiss Ephemeris not available - calculations disabled
2025-10-31T09:40:24.638Z [info] 📝 AscendantCalculator: Using pure JavaScript ascendant calculation (swisseph unavailable)
2025-10-31T09:40:24.639Z [error] ❌ CHART GENERATION SERVICE - Error during chart generation: Error: Failed to generate Rasi chart: Failed to get planetary positions: Swiss Ephemeris calculations are not available in this serverless environment
    at ChartGenerationService.generateRasiChart (file:///var/task/src/services/chart/ChartGenerationService.js:357:13)
    at process.processTicksAndRejections (node:internal/process/task_queues:105:5)
    at async ChartGenerationService.generateComprehensiveChart (file:///var/task/src/services/chart/ChartGenerationService.js:170:25)
    at async ChartController.generateChart (file:///var/task/src/api/controllers/ChartController.js:115:25)
2025-10-31T09:40:24.639Z [error] ❌ Error stack: Error: Failed to generate Rasi chart: Failed to get planetary positions: Swiss Ephemeris calculations are not available in this serverless environment
    at ChartGenerationService.generateRasiChart (file:///var/task/src/services/chart/ChartGenerationService.js:357:13)
    at process.processTicksAndRejections (node:internal/process/task_queues:105:5)
    at async ChartGenerationService.generateComprehensiveChart (file:///var/task/src/services/chart/ChartGenerationService.js:170:25)
    at async ChartController.generateChart (file:///var/task/src/api/controllers/ChartController.js:115:25)
2025-10-31T09:40:24.639Z [error] Chart generation error: Error: Failed to generate comprehensive chart: Failed to generate Rasi chart: Failed to get planetary positions: Swiss Ephemeris calculations are not available in this serverless environment
    at ChartGenerationService.generateComprehensiveChart (file:///var/task/src/services/chart/ChartGenerationService.js:221:13)
    at process.processTicksAndRejections (node:internal/process/task_queues:105:5)
    at async ChartController.generateChart (file:///var/task/src/api/controllers/ChartController.js:115:25)
2025-10-31T09:40:24.644Z [info] 202.14.193.189 - - [31/Oct/2025:09:40:24 +0000] "POST /api/v1/chart/generate HTTP/1.1" 500 367 "-" "curl/8.7.1"
```
