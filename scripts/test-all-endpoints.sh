#!/bin/bash

# Comprehensive API Endpoint Testing Script
# Tests all endpoints from curl-commands.md and verifies response structure

BASE_URL="http://localhost:3001/api/v1"
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

echo "=========================================="
echo "Comprehensive API Endpoint Testing"
echo "=========================================="
echo ""

# Test results array
declare -a TEST_RESULTS
PASSED=0
FAILED=0

test_endpoint() {
  local name=$1
  local method=$2
  local endpoint=$3
  local data=$4
  
  echo "Testing: $name"
  echo "  Method: $method"
  echo "  Endpoint: $endpoint"
  
  if [ "$method" = "GET" ]; then
    response=$(curl -s -w "\n%{http_code}" -X GET "$endpoint" 2>/dev/null)
  else
    response=$(curl -s -w "\n%{http_code}" -X POST "$endpoint" \
      -H "Content-Type: application/json" \
      -d "$data" 2>/dev/null)
  fi
  
  http_code=$(echo "$response" | tail -n1)
  body=$(echo "$response" | sed '$d')
  
  if [ "$http_code" -ge 200 ] && [ "$http_code" -lt 300 ]; then
    success=$(echo "$body" | jq -r '.success // empty' 2>/dev/null)
    if [ "$success" = "true" ] || [ -n "$(echo "$body" | jq -r 'select(.status) | .status' 2>/dev/null)" ]; then
      echo "  ✅ Status: PASSED (HTTP $http_code)"
      ((PASSED++))
      TEST_RESULTS+=("✅ $name: PASSED")
    else
      echo "  ⚠️  Status: WARNING - Response structure may differ (HTTP $http_code)"
      TEST_RESULTS+=("⚠️  $name: WARNING")
    fi
  else
    echo "  ❌ Status: FAILED (HTTP $http_code)"
    ((FAILED++))
    TEST_RESULTS+=("❌ $name: FAILED (HTTP $http_code)")
  fi
  
  echo ""
}

# 1. Health & Information
echo "--- Health & Information Endpoints ---"
test_endpoint "Health Check" "GET" "$BASE_URL/health" ""
test_endpoint "API Information" "GET" "http://localhost:3001/api/" ""

# 2. Geocoding
echo "--- Geocoding Endpoints ---"
test_endpoint "Geocode Location" "POST" "$BASE_URL/geocoding/location" '{"placeOfBirth": "Sialkot, Pakistan"}'
test_endpoint "Validate Coordinates" "GET" "$BASE_URL/geocoding/validate?latitude=32.4935378&longitude=74.5411575" ""

# 3. Chart Generation
echo "--- Chart Generation Endpoints ---"
test_endpoint "Generate Basic Chart" "POST" "$BASE_URL/chart/generate" "$TEST_DATA"
test_endpoint "Generate Comprehensive Chart" "POST" "$BASE_URL/chart/generate/comprehensive" "$TEST_DATA"
test_endpoint "Birth Data Analysis" "POST" "$BASE_URL/chart/analysis/birth-data" "$TEST_DATA"
test_endpoint "Lagna Analysis" "POST" "$BASE_URL/chart/analysis/lagna" "$TEST_DATA"
test_endpoint "House 1 Analysis" "POST" "$BASE_URL/chart/analysis/house/1" "$TEST_DATA"
test_endpoint "House 7 Analysis" "POST" "$BASE_URL/chart/analysis/house/7" "$TEST_DATA"
test_endpoint "Chart Comprehensive Analysis" "POST" "$BASE_URL/chart/analysis/comprehensive" "$TEST_DATA"

# 4. Analysis Endpoints
echo "--- Analysis Endpoints ---"
test_endpoint "Comprehensive Analysis" "POST" "$BASE_URL/analysis/comprehensive" "$TEST_DATA"
test_endpoint "Birth Data Validation" "POST" "$BASE_URL/analysis/birth-data" "$TEST_DATA"
test_endpoint "Preliminary Analysis" "POST" "$BASE_URL/analysis/preliminary" "$TEST_DATA"
test_endpoint "Houses Analysis" "POST" "$BASE_URL/analysis/houses" "$TEST_DATA"
test_endpoint "Aspects Analysis" "POST" "$BASE_URL/analysis/aspects" "$TEST_DATA"
test_endpoint "Arudha Analysis" "POST" "$BASE_URL/analysis/arudha" "$TEST_DATA"
test_endpoint "Navamsa Analysis" "POST" "$BASE_URL/analysis/navamsa" "$TEST_DATA"
test_endpoint "Dasha Analysis" "POST" "$BASE_URL/analysis/dasha" "$TEST_DATA"

# 5. Birth Time Rectification
echo "--- Birth Time Rectification Endpoints ---"
test_endpoint "BTR Test Endpoint" "GET" "$BASE_URL/rectification/test" ""
test_endpoint "BTR Methods Information" "POST" "$BASE_URL/rectification/methods" "{}"
test_endpoint "BTR Quick Validation" "POST" "$BASE_URL/rectification/quick" '{
  "birthData": {
    "dateOfBirth": "1997-12-18",
    "timeOfBirth": "02:30",
    "latitude": 32.4935378,
    "longitude": 74.5411575,
    "timezone": "Asia/Karachi",
    "placeOfBirth": "Sialkot, Pakistan"
  },
  "proposedTime": "02:30"
}'
test_endpoint "BTR Full Analysis" "POST" "$BASE_URL/rectification/analyze" '{
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
}'

# Summary
echo "=========================================="
echo "Test Summary"
echo "=========================================="
echo "Passed: $PASSED"
echo "Failed: $FAILED"
echo "Total: $((PASSED + FAILED))"
echo ""
echo "Detailed Results:"
for result in "${TEST_RESULTS[@]}"; do
  echo "  $result"
done

