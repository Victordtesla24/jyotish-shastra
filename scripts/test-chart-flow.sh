#!/bin/bash

# test_chart_flow.sh
# End-to-end test script for the Jyotish Shastra API.
#
# USAGE:
# 1. Make sure the backend server is running.
# 2. Make sure you have jq installed: `brew install jq` or `sudo apt-get install jq`
# 3. Run from the project root: `bash scripts/test-chart-flow.sh`

# --- Configuration ---
BASE_URL="http://localhost:3001/api/v1"
CHART_GEN_ENDPOINT="$BASE_URL/chart/generate"
COMPREHENSIVE_ENDPOINT="$BASE_URL/analysis/comprehensive"
CONTENT_TYPE="Content-Type: application/json"

# --- Test Data ---
# Using data from cURL-data-testing.md
BIRTH_DATA=$(cat <<EOF
{
  "dateOfBirth": "1985-10-24",
  "timeOfBirth": "14:30",
  "latitude": 18.5204,
  "longitude": 73.8567,
  "timezone": "Asia/Kolkata",
  "gender": "male"
}
EOF
)

# --- Helper Functions ---
function print_header() {
    echo "======================================================================="
    echo " $1"
    echo "======================================================================="
}

function print_success() {
    echo "✅ SUCCESS: $1"
}

function print_error() {
    echo "❌ ERROR: $1"
    exit 1
}

# --- Test Execution ---

# 1. Test Chart Generation
print_header "Step 1: Testing Chart Generation (emulates 'Generate Chart')"
echo "URL: $CHART_GEN_ENDPOINT"
echo "Data: $BIRTH_DATA"

CHART_RESPONSE=$(curl -s -X POST "$CHART_GEN_ENDPOINT" -H "$CONTENT_TYPE" -d "$BIRTH_DATA")

if [ -z "$CHART_RESPONSE" ]; then
    print_error "No response from chart generation endpoint."
fi

# Validate success and extract analysisId
SUCCESS=$(echo "$CHART_RESPONSE" | jq -r '.success')

if [ "$SUCCESS" != "true" ]; then
    print_error "Chart generation failed. Response: $CHART_RESPONSE"
fi

print_success "Chart generated successfully."
echo "Chart data received, UI should display the North Indian chart correctly."
echo ""


# 2. Test Comprehensive Analysis Endpoint (Simulating "View Analysis" click)
print_header "Step 2: Testing Comprehensive Analysis (emulates 'View Analysis')"
echo "URL: $COMPREHENSIVE_ENDPOINT"
# Note: The comprehensive endpoint can take the same birth data
ANALYSIS_DATA=$(cat <<EOF
{
  "birthData": $BIRTH_DATA
}
EOF
)

echo "Data: $ANALYSIS_DATA"

ANALYSIS_RESPONSE=$(curl -s -X POST "$COMPREHENSIVE_ENDPOINT" -H "$CONTENT_TYPE" -d "$ANALYSIS_DATA")

if [ -z "$ANALYSIS_RESPONSE" ]; then
    print_error "No response from comprehensive analysis endpoint."
fi

# Validate success and check for all 8 analysis sections
ANALYSIS_SUCCESS=$(echo "$ANALYSIS_RESPONSE" | jq -r '.success')
SECTIONS_COUNT=$(echo "$ANALYSIS_RESPONSE" | jq -r '.analysis.sections | keys | length')

if [ "$ANALYSIS_SUCCESS" != "true" ]; then
    print_error "Comprehensive analysis failed. Response: $ANALYSIS_RESPONSE"
fi

print_success "Comprehensive analysis endpoint returned success."

if [ "$SECTIONS_COUNT" == "8" ]; then
    print_success "Response contains all 8 analysis sections."
else
    print_error "Expected 8 analysis sections, but found $SECTIONS_COUNT. Response: $ANALYSIS_RESPONSE"
fi

echo ""
print_header "All tests passed successfully!"
echo "The 'View Analysis' and 'Generate Full Report' buttons should now navigate correctly on the UI."
