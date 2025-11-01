# API Curl Commands Reference

This document contains comprehensive curl commands for all API endpoints exposed by the Vedic Astrology backend implementation.

## **Available API Endpoints**:
  - "health":"/health"
  - "chart":"generate":"POST /v1/chart/generate"
  - "generateComprehensive":"POST /v1/chart/generate/comprehensive"
  - "analysis":
      - "lagna":"POST /v1/chart/analysis/lagna"
      - "house":"POST /v1/chart/analysis/house/:houseNumber"
      - "comprehensive":"POST /v1/chart/analysis/comprehensive"
      - "comprehensive":"POST /v1/analysis/comprehensive"
      - "birthData":"POST /v1/analysis/birth-data"
      - "preliminary":"POST /v1/analysis/preliminary"
      - "houses":"POST /v1/analysis/houses"
      - "aspects":"POST /v1/analysis/aspects"
      - "arudha":"POST /v1/analysis/arudha"
      - "navamsa":"POST /v1/analysis/navamsa"
      - "dasha":"POST /v1/analysis/dasha"
  - "get":"GET /v1/analysis/:analysisId"
  - "userHistory":"GET /v1/analysis/user/:userId"
  - "delete":"DELETE /v1/analysis/:analysisId"
  - "progress":"GET /v1/analysis/progress/:analysisId"
  - "geocoding":
       - "location":"POST /geocoding/location","timezone":"POST /geocoding/timezone"
       - "validate":"GET /geocoding/validate"

## Birth Data Used in Examples
```json
{
  "name": "Farhan",
  "dateOfBirth": "1997-12-18",
  "timeOfBirth": "02:30",
  "latitude": 32.4935378,
  "longitude": 74.5411575,
  "timezone": "Asia/Karachi",
  "gender": "male",
  "placeOfBirth": "Sialkot, Pakistan"
}
```

## Base URL
```
http://localhost:3001
```

---

## Health & Information Endpoints

### 1. Health Check
```bash
curl -X GET http://localhost:3001/api/v1/health | jq .
```

### 2. API Information
```bash
curl -X GET http://localhost:3001/api/ | jq .
```

---

## Geocoding Endpoints

### 3. Geocode Location (POST)
```bash
curl -X POST http://localhost:3001/api/v1/geocoding/location \
  -H "Content-Type: application/json" \
  -d '{
      "placeOfBirth": "Sialkot, Pakistan"
  }' | jq .
```

### 4. Get Coordinates (GET)
```bash
curl -X GET "http://localhost:3001/api/v1/geocoding/coordinates?location=Sialkot%2C%20Pakistan" | jq .
```

### 5. Validate Coordinates
```bash
curl -X GET "http://localhost:3001/api/v1/geocoding/validate?latitude=32.4935378&longitude=74.5411575" | jq .
```

---

## Chart Generation Endpoints

### 6. Generate Basic Chart
```bash
curl -X POST https://jjyotish-shastra-backend.onrender.com/api/v1/chart/generate \
  -H "Content-Type: application/json" \
  -d '{
      "name": "Farhan",
      "dateOfBirth": "1997-12-18",
      "timeOfBirth": "02:30",
      "latitude": 32.4935378,
      "longitude": 74.5411575,
      "timezone": "Asia/Karachi",
      "gender": "male"
  }' | jq . > farhan-birth-chart.json
```

### 7. Generate Comprehensive Chart
```bash
curl -X POST http://localhost:3001/api/v1/chart/generate/comprehensive \
  -H "Content-Type: application/json" \
  -d '{
      "name": "Farhan",
      "dateOfBirth": "1997-12-18",
      "timeOfBirth": "02:30",
      "latitude": 32.4935378,
      "longitude": 74.5411575,
      "timezone": "Asia/Karachi",
      "gender": "male",
      "placeOfBirth": "Sialkot, Pakistan"
  }' | jq . > farhan-comprehensive-chart.json
```

### 8. Birth Data Analysis
```bash
curl -X POST http://localhost:3001/api/v1/chart/analysis/birth-data \
  -H "Content-Type: application/json" \
  -d '{
      "name": "Farhan",
      "dateOfBirth": "1997-12-18",
      "timeOfBirth": "02:30",
      "latitude": 32.4935378,
      "longitude": 74.5411575,
      "timezone": "Asia/Karachi",
      "gender": "male"
  }' | jq . > farhan-birth-data.json
```

### 9. Get Chart by ID
```bash
# Replace {chartId} with actual chart ID from generate response
curl -X GET http://localhost:3001/api/v1/chart/{chartId} | jq .
```

### 10. Get Navamsa Chart by ID
```bash
# Replace {chartId} with actual chart ID from generate response
curl -X GET http://localhost:3001/api/v1/chart/{chartId}/navamsa | jq .
```

### 11. Lagna Analysis
```bash
curl -X POST http://localhost:3001/api/v1/chart/analysis/lagna \
  -H "Content-Type: application/json" \
  -d '{
      "name": "Farhan",
      "dateOfBirth": "1997-12-18",
      "timeOfBirth": "02:30",
      "latitude": 32.4935378,
      "longitude": 74.5411575,
      "timezone": "Asia/Karachi",
      "gender": "male"
  }' | jq .
```

### 12. House Analysis (Individual Houses 1-12)
```bash
# House 1 Analysis
curl -X POST http://localhost:3001/api/v1/chart/analysis/house/1 \
  -H "Content-Type: application/json" \
  -d '{
      "name": "Farhan",
      "dateOfBirth": "1997-12-18",
      "timeOfBirth": "02:30",
      "latitude": 32.4935378,
      "longitude": 74.5411575,
      "timezone": "Asia/Karachi",
      "gender": "male"
  }' | jq . > farhan-house-1.json

# House 7 Analysis (Marriage House)
curl -X POST http://localhost:3001/api/v1/chart/analysis/house/7 \
  -H "Content-Type: application/json" \
  -d '{
      "name": "Farhan",
      "dateOfBirth": "1997-12-18",
      "timeOfBirth": "02:30",
      "latitude": 32.4935378,
      "longitude": 74.5411575,
      "timezone": "Asia/Karachi",
      "gender": "male"
  }' | jq . > farhan-house-7.json

# House 10 Analysis (Career House)
curl -X POST http://localhost:3001/api/v1/chart/analysis/house/10 \
  -H "Content-Type: application/json" \
  -d '{
      "name": "Farhan",
      "dateOfBirth": "1997-12-18",
      "timeOfBirth": "02:30",
      "latitude": 32.4935378,
      "longitude": 74.5411575,
      "timezone": "Asia/Karachi",
      "gender": "male"
  }' | jq . > farhan-house-10.json
```

### 13. Chart Comprehensive Analysis
```bash
curl -X POST http://localhost:3001/api/v1/chart/analysis/comprehensive \
  -H "Content-Type: application/json" \
  -d '{
      "name": "Farhan",
      "dateOfBirth": "1997-12-18",
      "timeOfBirth": "02:30",
      "latitude": 32.4935378,
      "longitude": 74.5411575,
      "timezone": "Asia/Karachi",
      "gender": "male"
  }' | jq . > farhan-comprehensive-analysis.json
```

---

## Analysis Endpoints

### 14. Comprehensive Analysis
```bash
curl -X POST http://localhost:3001/api/v1/analysis/comprehensive \
  -H "Content-Type: application/json" \
  -d '{
      "name": "Farhan",
      "dateOfBirth": "1997-12-18",
      "timeOfBirth": "02:30",
      "latitude": 32.4935378,
      "longitude": 74.5411575,
      "timezone": "Asia/Karachi",
      "gender": "male"
  }' | jq . > farhan-comprehensive-analysis.json
```

### 15. Birth Data Validation
```bash
curl -X POST http://localhost:3001/api/v1/analysis/birth-data \
  -H "Content-Type: application/json" \
  -d '{
      "name": "Farhan",
      "dateOfBirth": "1997-12-18",
      "timeOfBirth": "02:30",
      "latitude": 32.4935378,
      "longitude": 74.5411575,
      "timezone": "Asia/Karachi",
      "gender": "male"
  }' | jq . > farhan-birth-data.json
```

### 16. Preliminary Analysis
```bash
curl -X POST http://localhost:3001/api/v1/analysis/preliminary \
  -H "Content-Type: application/json" \
  -d '{
      "name": "Farhan",
      "dateOfBirth": "1997-12-18",
      "timeOfBirth": "02:30",
      "latitude": 32.4935378,
      "longitude": 74.5411575,
      "timezone": "Asia/Karachi",
      "gender": "male"
  }' | jq . > farhan-preliminary-analysis.json
```

### 17. Houses Analysis
```bash
curl -X POST http://localhost:3001/api/v1/analysis/houses \
  -H "Content-Type: application/json" \
  -d '{
      "name": "Farhan",
      "dateOfBirth": "1997-12-18",
      "timeOfBirth": "02:30",
      "latitude": 32.4935378,
      "longitude": 74.5411575,
      "timezone": "Asia/Karachi",
      "gender": "male"
  }' | jq . > farhan-houses-analysis.json
```

### 18. Aspects Analysis
```bash
curl -X POST http://localhost:3001/api/v1/analysis/aspects \
  -H "Content-Type: application/json" \
  -d '{
      "name": "Farhan",
      "dateOfBirth": "1997-12-18",
      "timeOfBirth": "02:30",
      "latitude": 32.4935378,
      "longitude": 74.5411575,
      "timezone": "Asia/Karachi",
      "gender": "male"
  }' | jq . > farhan-aspects-analysis.json
```

### 19. Arudha Analysis
```bash
curl -X POST http://localhost:3001/api/v1/analysis/arudha \
  -H "Content-Type: application/json" \
  -d '{
      "name": "Farhan",
      "dateOfBirth": "1997-12-18",
      "timeOfBirth": "02:30",
      "latitude": 32.4935378,
      "longitude": 74.5411575,
      "timezone": "Asia/Karachi",
      "gender": "male"
  }' | jq . > farhan-arudha-analysis.json
```

### 20. Navamsa Analysis
```bash
curl -X POST http://localhost:3001/api/v1/analysis/navamsa \
  -H "Content-Type: application/json" \
  -d '{
      "name": "Farhan",
      "dateOfBirth": "1997-12-18",
      "timeOfBirth": "02:30",
      "latitude": 32.4935378,
      "longitude": 74.5411575,
      "timezone": "Asia/Karachi",
      "gender": "male"
  }' | jq . > farhan-navamsa-analysis.json
```

### 21. Dasha Analysis
```bash
curl -X POST http://localhost:3001/api/v1/analysis/dasha \
  -H "Content-Type: application/json" \
  -d '{
      "name": "Farhan",
      "dateOfBirth": "1997-12-18",
      "timeOfBirth": "02:30",
      "latitude": 32.4935378,
      "longitude": 74.5411575,
      "timezone": "Asia/Karachi",
      "gender": "male"
  }' | jq . > farhan-dasha-analysis.json
```

### 22. Get Analysis by ID
```bash
# Replace {analysisId} with actual analysis ID from analysis response
curl -X GET http://localhost:3001/api/v1/analysis/{analysisId} | jq . > farhan-analysis.json
```

### 23. Get User Analysis History (Requires Authentication)
```bash
# Replace {userId} with actual user ID and {authToken} with valid JWT token
curl -X GET http://localhost:3001/api/v1/analysis/user/{userId} \
  -H "Authorization: Bearer {authToken}" | jq . > farhan-user-analysis-history.json
```

### 24. Delete Analysis (Requires Authentication)
```bash
# Replace {analysisId} with actual analysis ID and {authToken} with valid JWT token
curl -X DELETE http://localhost:3001/api/v1/analysis/{analysisId} \
  -H "Authorization: Bearer {authToken}" | jq . > farhan-analysis-deleted.json
```

### 25. Get Analysis Progress
```bash
# Replace {analysisId} with actual analysis ID from analysis response
curl -X GET http://localhost:3001/api/v1/analysis/progress/{analysisId} | jq . > farhan-analysis-progress.json
```

---

## Client Error Logging

### 26. Log Client Error
```bash
curl -X POST http://localhost:3001/api/log-client-error \
  -H "Content-Type: application/json" \
  -d '{
      "timestamp": "'$(date -Iseconds)'",
      "message": "Test client error from curl",
      "stack": "Error: Test error\n    at testFunction (test.js:1:1)",
      "url": "http://localhost:3002/test",
      "userAgent": "curl/7.68.0",
      "componentStack": "TestComponent"
  }' | jq .
```

---

## Birth Time Rectification Endpoints

### 27. BTR Test Endpoint
```bash
curl -X GET http://localhost:3001/api/v1/rectification/test | jq .
```

### 28. BTR Methods Information
```bash
curl -X POST http://localhost:3001/api/v1/rectification/methods \
  -H "Content-Type: application/json" \
  -d '{}' | jq .
```

### 29. BTR Quick Validation
```bash
curl -X POST http://localhost:3001/api/v1/rectification/quick \
  -H "Content-Type: application/json" \
  -d '{
      "birthData": {
          "dateOfBirth": "1997-12-18",
          "timeOfBirth": "02:30",
          "latitude": 32.4935378,
          "longitude": 74.5411575,
          "timezone": "Asia/Karachi",
          "placeOfBirth": "Sialkot, Pakistan"
      },
      "proposedTime": "02:30"
  }' | jq .
```

### 30. BTR Full Analysis
```bash
curl -X POST http://localhost:3001/api/v1/rectification/analyze \
  -H "Content-Type: application/json" \
  -d '{
      "birthData": {
          "dateOfBirth": "1997-12-18",
          "timeOfBirth": "02:30",
          "latitude": 32.4935378,
          "longitude": 74.5411575,
          "timezone": "Asia/Karachi",
          "placeOfBirth": "Sialkot, Pakistan"
      },
      "options": {
          "methods": ["praanapada", "moon", "gulika"]
      }
  }' | jq .
```

### 31. BTR Analysis with Life Events
```bash
curl -X POST http://localhost:3001/api/v1/rectification/with-events \
  -H "Content-Type: application/json" \
  -d '{
      "birthData": {
          "dateOfBirth": "1997-12-18",
          "timeOfBirth": "02:30",
          "latitude": 32.4935378,
          "longitude": 74.5411575,
          "timezone": "Asia/Karachi",
          "placeOfBirth": "Sialkot, Pakistan"
      },
      "lifeEvents": [
          {"date": "2015-06-01", "description": "Marriage"},
          {"date": "2020-01-15", "description": "Job promotion"}
      ],
      "options": {
          "methods": ["praanapada", "moon", "gulika", "events"]
      }
  }' | jq .
```

---

## Advanced Usage Examples

### Sequential Analysis Workflow
```bash
# 1. First geocode the location
LOCATION_DATA=$(curl -s -X POST http://localhost:3001/api/v1/geocoding/location \
  -H "Content-Type: application/json" \
  -d '{"placeOfBirth": "Sialkot, Pakistan"}')

# 2. Generate chart with geocoded data
CHART_DATA=$(curl -s -X POST http://localhost:3001/api/v1/chart/generate \
  -H "Content-Type: application/json" \
  -d '{
      "name": "Farhan",
      "dateOfBirth": "1997-12-18",
      "timeOfBirth": "02:30",
      "latitude": 32.4935378,
      "longitude": 74.5411575,
      "timezone": "Asia/Karachi",
      "gender": "male"
  }')

# 3. Perform comprehensive analysis
curl -X POST http://localhost:3001/api/v1/analysis/comprehensive \
  -H "Content-Type: application/json" \
  -d '{
      "name": "Farhan",
      "dateOfBirth": "1997-12-18",
      "timeOfBirth": "02:30",
      "latitude": 32.4935378,
      "longitude": 74.5411575,
      "timezone": "Asia/Karachi",
      "gender": "male"
  }' | jq .
```

### Standardization Test Headers
For endpoints that support standardization testing, add the header:
```bash
curl -X POST http://localhost:3001/api/v1/analysis/comprehensive \
  -H "Content-Type: application/json" \
  -H "x-test-type: standardization" \
  -d '{
      "dateOfBirth": "1997-12-18",
      "timeOfBirth": "02:30",
      "latitude": 32.4935378,
      "longitude": 74.5411575,
      "timezone": "Asia/Karachi",
      "gender": "male"
  }' | jq .
```

### Technical Validation Test Headers
For technical validation testing:
```bash
curl -X POST http://localhost:3001/api/v1/analysis/comprehensive \
  -H "Content-Type: application/json" \
  -H "x-test-type: technical-validation" \
  -d '{
      "name": "Farhan",
      "dateOfBirth": "1997-12-18",
      "timeOfBirth": "02:30",
      "latitude": 32.4935378,
      "longitude": 74.5411575,
      "timezone": "Asia/Karachi",
      "gender": "male"
  }' | jq .
```

---

## Error Handling Examples

### Invalid Birth Data
```bash
curl -X POST http://localhost:3001/api/v1/chart/generate \
  -H "Content-Type: application/json" \
  -d '{
      "name": "Test",
      "dateOfBirth": "invalid-date",
      "timeOfBirth": "25:99",
      "latitude": "invalid",
      "longitude": "invalid"
  }' | jq .
```

### Missing Required Fields
```bash
curl -X POST http://localhost:3001/api/v1/chart/generate \
  -H "Content-Type: application/json" \
  -d '{
      "name": "Test"
  }' | jq .
```

---

## Notes

1. **Authentication**: Some endpoints require authentication (marked with "Requires Authentication"). You'll need to implement authentication and provide a valid JWT token.

2. **Response Format**: All responses are in JSON format. Using `| jq .` formats the output for better readability.

3. **Error Handling**: The API provides detailed error messages and validation suggestions for invalid requests.

4. **Test Headers**: Use special headers like `x-test-type: standardization` for testing scenarios where name field is optional.

5. **ID Placeholders**: Replace `{chartId}`, `{analysisId}`, `{userId}`, and `{authToken}` with actual values from previous responses.

6. **Environment**: All commands assume the backend server is running on `localhost:3001`.
