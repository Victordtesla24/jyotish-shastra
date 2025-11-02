#!/bin/bash

# Comprehensive API Endpoint Testing Script for Production (Render)
# Tests all 31 endpoints from curl-commands.md against Render deployment
# Generates detailed test report with status codes, response structures, errors, and performance metrics

set -euo pipefail

# Configuration
RENDER_BASE_URL="https://jjyotish-shastra-backend.onrender.com/api/v1"
LOCAL_BASE_URL="http://localhost:3001/api/v1"
REPORT_DIR="docs/api"
REPORT_FILE="$REPORT_DIR/comprehensive-api-test-report-$(date +%Y-%m-%d).md"
TIMEOUT=30

# Test data
TEST_DATA='{
  "name": "Farhan",
  "dateOfBirth": "1997-12-18",
  "timeOfBirth": "02:30",
  "latitude": 32.4935378,
  "longitude": 74.5411575,
  "timezone": "Asia/Karachi",
  "gender": "male",
  "placeOfBirth": "Sialkot, Pakistan"
}'

# Statistics
declare -A STATS
STATS[TOTAL]=0
STATS[PASSED]=0
STATS[FAILED]=0
STATS[WARNINGS]=0
STATS[RENDER_FAILED]=0
STATS[LOCAL_FAILED]=0

# Create report directory
mkdir -p "$REPORT_DIR"

# Function to test an endpoint
test_endpoint() {
  local name=$1
  local method=$2
  local endpoint=$3
  local data=$4
  local environment=$5
  
  local base_url
  if [ "$environment" = "render" ]; then
    base_url="$RENDER_BASE_URL"
  else
    base_url="$LOCAL_BASE_URL"
  fi
  
  local full_url="${base_url}${endpoint}"
  
  echo "  Testing: $name ($environment)"
  
  local start_time=$(date +%s%N)
  local http_code
  local response_body
  local curl_error=""
  
  if [ "$method" = "GET" ]; then
    response=$(curl -s -w "\n%{http_code}\n%{time_total}" --max-time "$TIMEOUT" \
      -X GET "$full_url" 2>&1) || curl_error="${response:-curl failed}"
  else
    response=$(curl -s -w "\n%{http_code}\n%{time_total}" --max-time "$TIMEOUT" \
      -X POST "$full_url" \
      -H "Content-Type: application/json" \
      -d "$data" 2>&1) || curl_error="${response:-curl failed}"
  fi
  
  local end_time=$(date +%s%N)
  
  if [ -n "$curl_error" ] && [[ "$curl_error" == *"curl"* ]]; then
    echo "    ❌ CURL ERROR: $curl_error"
    echo "$name|$endpoint|$environment|ERROR|curl_error|$curl_error|0|0" >> "${REPORT_FILE}.csv"
    return 1
  fi
  
  local lines=$(echo "$response" | wc -l | tr -d ' ')
  if [ "$lines" -lt 3 ]; then
    echo "    ❌ INVALID RESPONSE"
    echo "$name|$endpoint|$environment|ERROR|invalid_response|$response|0|0" >> "${REPORT_FILE}.csv"
    return 1
  fi
  
  local response_time=$(echo "$response" | tail -n1)
  local http_code=$(echo "$response" | tail -n2 | head -n1)
  local body=$(echo "$response" | head -n-2)
  
  local duration=$(echo "scale=3; ($end_time - $start_time) / 1000000000" | bc)
  
  local status="UNKNOWN"
  local error_msg=""
  local response_valid=false
  
  # Check HTTP status code
  if [ "$http_code" -ge 200 ] && [ "$http_code" -lt 300 ]; then
    # Try to parse JSON response
    if echo "$body" | jq empty 2>/dev/null; then
      local success=$(echo "$body" | jq -r '.success // empty' 2>/dev/null)
      local error=$(echo "$body" | jq -r '.error // empty' 2>/dev/null)
      
      if [ "$success" = "true" ] || [ -n "$(echo "$body" | jq -r 'select(.status) | .status' 2>/dev/null)" ]; then
        status="PASSED"
        response_valid=true
        echo "    ✅ Status: PASSED (HTTP $http_code, ${duration}s)"
      elif [ -n "$error" ]; then
        status="FAILED"
        error_msg="$error"
        echo "    ❌ Status: FAILED - $error (HTTP $http_code, ${duration}s)"
      else
        status="WARNING"
        response_valid=true
        echo "    ⚠️  Status: WARNING - Unexpected response structure (HTTP $http_code, ${duration}s)"
      fi
    else
      status="WARNING"
      echo "    ⚠️  Status: WARNING - Non-JSON response (HTTP $http_code, ${duration}s)"
    fi
  elif [ "$http_code" -ge 400 ] && [ "$http_code" -lt 500 ]; then
    status="FAILED"
    error_msg=$(echo "$body" | jq -r '.error // .message // "Client error"' 2>/dev/null || echo "HTTP $http_code")
    echo "    ❌ Status: FAILED - $error_msg (HTTP $http_code, ${duration}s)"
  elif [ "$http_code" -ge 500 ]; then
    status="FAILED"
    error_msg=$(echo "$body" | jq -r '.error // .message // "Server error"' 2>/dev/null || echo "HTTP $http_code")
    echo "    ❌ Status: FAILED - $error_msg (HTTP $http_code, ${duration}s)"
  else
    status="UNKNOWN"
    echo "    ⚠️  Status: UNKNOWN (HTTP $http_code, ${duration}s)"
  fi
  
  # Extract response structure info
  local has_success=false
  local has_data=false
  local has_analysis=false
  local structure_info=""
  
  if [ "$response_valid" = true ]; then
    has_success=$(echo "$body" | jq -e 'has("success")' 2>/dev/null || echo "false")
    has_data=$(echo "$body" | jq -e 'has("data")' 2>/dev/null || echo "false")
    has_analysis=$(echo "$body" | jq -e 'has("analysis")' 2>/dev/null || echo "false")
    
    structure_info="success=$has_success,data=$has_data,analysis=$has_analysis"
  fi
  
  # Write to CSV
  echo "$name|$endpoint|$environment|$status|$http_code|$error_msg|$duration|$structure_info" >> "${REPORT_FILE}.csv"
  
  # Update statistics
  ((STATS[TOTAL]++))
  case "$status" in
    PASSED) ((STATS[PASSED]++)) ;;
    FAILED)
      ((STATS[FAILED]++))
      if [ "$environment" = "render" ]; then
        ((STATS[RENDER_FAILED]++))
      else
        ((STATS[LOCAL_FAILED]++))
      fi
      ;;
    WARNING) ((STATS[WARNINGS]++)) ;;
  esac
  
  return 0
}

# Initialize CSV report
echo "Endpoint Name|Path|Environment|Status|HTTP Code|Error Message|Response Time (s)|Response Structure" > "${REPORT_FILE}.csv"

# Initialize markdown report
cat > "$REPORT_FILE" << 'EOF'
# Comprehensive API Endpoint Testing Report

**Generated**: $(date)
**Target Environments**: Render Production & Localhost
**Total Endpoints Tested**: 31

## Executive Summary

TBD - Will be populated after testing

## Test Results

### Health & Information Endpoints

EOF

echo ""
echo "=========================================="
echo "Comprehensive API Endpoint Testing"
echo "Testing against: Render ($RENDER_BASE_URL) and Localhost ($LOCAL_BASE_URL)"
echo "=========================================="
echo ""

# 1. Health & Information
echo "--- Health & Information Endpoints ---"
test_endpoint "Health Check" "GET" "/health" "" "render"
test_endpoint "Health Check" "GET" "/health" "" "local"
test_endpoint "API Information" "GET" "" "" "render" || true  # May not exist
test_endpoint "API Information" "GET" "" "" "local" || true

# 2. Geocoding
echo ""
echo "--- Geocoding Endpoints ---"
test_endpoint "Geocode Location" "POST" "/geocoding/location" '{"placeOfBirth": "Sialkot, Pakistan"}' "render"
test_endpoint "Geocode Location" "POST" "/geocoding/location" '{"placeOfBirth": "Sialkot, Pakistan"}' "local"
test_endpoint "Get Coordinates" "GET" "/geocoding/coordinates?location=Sialkot%2C%20Pakistan" "" "render"
test_endpoint "Get Coordinates" "GET" "/geocoding/coordinates?location=Sialkot%2C%20Pakistan" "" "local"
test_endpoint "Validate Coordinates" "GET" "/geocoding/validate?latitude=32.4935378&longitude=74.5411575" "" "render"
test_endpoint "Validate Coordinates" "GET" "/geocoding/validate?latitude=32.4935378&longitude=74.5411575" "" "local"

# 3. Chart Generation
echo ""
echo "--- Chart Generation Endpoints ---"
test_endpoint "Generate Basic Chart" "POST" "/chart/generate" "$TEST_DATA" "render"
test_endpoint "Generate Basic Chart" "POST" "/chart/generate" "$TEST_DATA" "local"
test_endpoint "Generate Comprehensive Chart" "POST" "/chart/generate/comprehensive" "$TEST_DATA" "render"
test_endpoint "Generate Comprehensive Chart" "POST" "/chart/generate/comprehensive" "$TEST_DATA" "local"
test_endpoint "Birth Data Analysis" "POST" "/chart/analysis/birth-data" "$TEST_DATA" "render"
test_endpoint "Birth Data Analysis" "POST" "/chart/analysis/birth-data" "$TEST_DATA" "local"
test_endpoint "Lagna Analysis" "POST" "/chart/analysis/lagna" "$TEST_DATA" "render"
test_endpoint "Lagna Analysis" "POST" "/chart/analysis/lagna" "$TEST_DATA" "local"
test_endpoint "House 1 Analysis" "POST" "/chart/analysis/house/1" "$TEST_DATA" "render"
test_endpoint "House 1 Analysis" "POST" "/chart/analysis/house/1" "$TEST_DATA" "local"
test_endpoint "House 7 Analysis" "POST" "/chart/analysis/house/7" "$TEST_DATA" "render"
test_endpoint "House 7 Analysis" "POST" "/chart/analysis/house/7" "$TEST_DATA" "local"
test_endpoint "Chart Comprehensive Analysis" "POST" "/chart/analysis/comprehensive" "$TEST_DATA" "render"
test_endpoint "Chart Comprehensive Analysis" "POST" "/chart/analysis/comprehensive" "$TEST_DATA" "local"

# 4. Analysis Endpoints
echo ""
echo "--- Analysis Endpoints ---"
test_endpoint "Comprehensive Analysis" "POST" "/analysis/comprehensive" "$TEST_DATA" "render"
test_endpoint "Comprehensive Analysis" "POST" "/analysis/comprehensive" "$TEST_DATA" "local"
test_endpoint "Birth Data Validation" "POST" "/analysis/birth-data" "$TEST_DATA" "render"
test_endpoint "Birth Data Validation" "POST" "/analysis/birth-data" "$TEST_DATA" "local"
test_endpoint "Preliminary Analysis" "POST" "/analysis/preliminary" "$TEST_DATA" "render"
test_endpoint "Preliminary Analysis" "POST" "/analysis/preliminary" "$TEST_DATA" "local"
test_endpoint "Houses Analysis" "POST" "/analysis/houses" "$TEST_DATA" "render"
test_endpoint "Houses Analysis" "POST" "/analysis/houses" "$TEST_DATA" "local"
test_endpoint "Aspects Analysis" "POST" "/analysis/aspects" "$TEST_DATA" "render"
test_endpoint "Aspects Analysis" "POST" "/analysis/aspects" "$TEST_DATA" "local"
test_endpoint "Arudha Analysis" "POST" "/analysis/arudha" "$TEST_DATA" "render"
test_endpoint "Arudha Analysis" "POST" "/analysis/arudha" "$TEST_DATA" "local"
test_endpoint "Navamsa Analysis" "POST" "/analysis/navamsa" "$TEST_DATA" "render"
test_endpoint "Navamsa Analysis" "POST" "/analysis/navamsa" "$TEST_DATA" "local"
test_endpoint "Dasha Analysis" "POST" "/analysis/dasha" "$TEST_DATA" "render"
test_endpoint "Dasha Analysis" "POST" "/analysis/dasha" "$TEST_DATA" "local"

# 5. Birth Time Rectification
echo ""
echo "--- Birth Time Rectification Endpoints ---"
test_endpoint "BTR Test Endpoint" "GET" "/rectification/test" "" "render"
test_endpoint "BTR Test Endpoint" "GET" "/rectification/test" "" "local"
test_endpoint "BTR Methods Information" "POST" "/rectification/methods" "{}" "render"
test_endpoint "BTR Methods Information" "POST" "/rectification/methods" "{}" "local"
test_endpoint "BTR Quick Validation" "POST" "/rectification/quick" '{
  "birthData": {
    "dateOfBirth": "1997-12-18",
    "timeOfBirth": "02:30",
    "latitude": 32.4935378,
    "longitude": 74.5411575,
    "timezone": "Asia/Karachi",
    "placeOfBirth": "Sialkot, Pakistan"
  },
  "proposedTime": "02:30"
}' "render"
test_endpoint "BTR Quick Validation" "POST" "/rectification/quick" '{
  "birthData": {
    "dateOfBirth": "1997-12-18",
    "timeOfBirth": "02:30",
    "latitude": 32.4935378,
    "longitude": 74.5411575,
    "timezone": "Asia/Karachi",
    "placeOfBirth": "Sialkot, Pakistan"
  },
  "proposedTime": "02:30"
}' "local"
test_endpoint "BTR Full Analysis" "POST" "/rectification/analyze" '{
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
}' "render"
test_endpoint "BTR Full Analysis" "POST" "/rectification/analyze" '{
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
}' "local"
test_endpoint "BTR With Events" "POST" "/rectification/with-events" '{
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
}' "render"
test_endpoint "BTR With Events" "POST" "/rectification/with-events" '{
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
}' "local"

# Summary
echo ""
echo "=========================================="
echo "Test Summary"
echo "=========================================="
echo "Total Tests: ${STATS[TOTAL]}"
echo "Passed: ${STATS[PASSED]}"
echo "Failed: ${STATS[FAILED]}"
echo "Warnings: ${STATS[WARNINGS]}"
echo "Render Failures: ${STATS[RENDER_FAILED]}"
echo "Local Failures: ${STATS[LOCAL_FAILED]}"
echo ""
echo "Detailed report saved to: $REPORT_FILE"
echo "CSV report saved to: ${REPORT_FILE}.csv"

# Generate summary in markdown
cat >> "$REPORT_FILE" << EOF

## Summary Statistics

- **Total Tests**: ${STATS[TOTAL]}
- **Passed**: ${STATS[PASSED]}
- **Failed**: ${STATS[FAILED]}
- **Warnings**: ${STATS[WARNINGS]}
- **Render Failures**: ${STATS[RENDER_FAILED]}
- **Local Failures**: ${STATS[LOCAL_FAILED]}

## Detailed Results

See CSV file: \`${REPORT_FILE}.csv\`

EOF

echo ""
echo "✅ Testing complete!"

