#!/bin/bash

# Comprehensive Test Report Generation Script
# Aggregates results from all test sources and generates comprehensive report
# Usage: ./scripts/generate-test-report.sh [OUTPUT_DIR]

OUTPUT_DIR=${1:-"user-docs"}
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
REPORT_FILE="$OUTPUT_DIR/comprehensive-test-report-${TIMESTAMP}.md"
JSON_REPORT="$OUTPUT_DIR/comprehensive-test-report-${TIMESTAMP}.json"

echo "=========================================="
echo "Comprehensive Test Report Generation"
echo "=========================================="
echo "Output directory: $OUTPUT_DIR"
echo "Report file: $REPORT_FILE"
echo "JSON report: $JSON_REPORT"
echo "Started: $(date)"
echo ""

# Create output directory if it doesn't exist
mkdir -p "$OUTPUT_DIR"
mkdir -p logs

# Initialize report data
REPORT_DATA=$(cat <<EOF
{
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "testRunId": "${TIMESTAMP}",
  "summary": {
    "totalTests": 0,
    "passed": 0,
    "failed": 0,
    "warnings": 0,
    "successRate": 0
  },
  "sections": {
    "apiEndpoints": [],
    "uiIntegration": [],
    "browserExceptions": [],
    "renderSpecific": [],
    "defects": [],
    "recommendations": []
  }
}
EOF
)

# Function to add test result to report
add_test_result() {
  local section=$1
  local name=$2
  local status=$3
  local details=$4
  
  REPORT_DATA=$(echo "$REPORT_DATA" | jq ".sections.$section += [{
    \"name\": \"$name\",
    \"status\": \"$status\",
    \"details\": \"$details\",
    \"timestamp\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"
  }]")
}

# Function to update summary
update_summary() {
  local passed=$1
  local failed=$2
  local warnings=${3:-0}
  
  REPORT_DATA=$(echo "$REPORT_DATA" | jq ".summary.passed += $passed | .summary.failed += $failed | .summary.warnings += $warnings | .summary.totalTests += ($passed + $failed + $warnings)")
  
  local total=$(echo "$REPORT_DATA" | jq '.summary.totalTests')
  local passed=$(echo "$REPORT_DATA" | jq '.summary.passed')
  local successRate=$(awk "BEGIN {printf \"%.2f\", ($passed/$total)*100}")
  
  REPORT_DATA=$(echo "$REPORT_DATA" | jq ".summary.successRate = $successRate")
}

# Check for test result files and parse them
echo "--- Gathering Test Results ---"

# Check for Jest test results
if [ -f "coverage/coverage-summary.json" ]; then
  echo "  Found Jest coverage report"
  COVERAGE=$(jq '.total.lines.pct' coverage/coverage-summary.json 2>/dev/null || echo "0")
  add_test_result "apiEndpoints" "Jest Test Coverage" "info" "Coverage: ${COVERAGE}%"
fi

# Check for UI integration test results
for log_file in logs/ui-api-integration-*.json; do
  if [ -f "$log_file" ]; then
    echo "  Found UI-API integration test results: $log_file"
    PASSED=$(jq '.summary.passed' "$log_file" 2>/dev/null || echo "0")
    FAILED=$(jq '.summary.failed' "$log_file" 2>/dev/null || echo "0")
    TOTAL=$(jq '.summary.total' "$log_file" 2>/dev/null || echo "0")
    
    if [ "$TOTAL" -gt 0 ]; then
      add_test_result "uiIntegration" "UI-API Integration Tests" "$([ "$FAILED" -eq 0 ] && echo "passed" || echo "warning")" "Passed: $PASSED, Failed: $FAILED, Total: $TOTAL"
      update_summary "$PASSED" "$FAILED"
    fi
  fi
done

# Check for API endpoint test results (from test-all-endpoints.sh output)
if [ -f "logs/api-endpoint-tests.log" ]; then
  echo "  Found API endpoint test results"
  # Parse log file if structured
fi

# Generate Markdown report
echo ""
echo "--- Generating Markdown Report ---"

cat > "$REPORT_FILE" <<EOF
# Comprehensive Test Report

**Generated:** $(date -u +"%Y-%m-%d %H:%M:%S UTC")  
**Test Run ID:** ${TIMESTAMP}

## Executive Summary

This report aggregates results from all test sources including API endpoint tests, UI-API integration tests, browser exception tests, and Render-specific tests.

### Overall Test Summary

EOF

# Add summary from JSON data
SUMMARY_PASSED=$(echo "$REPORT_DATA" | jq '.summary.passed')
SUMMARY_FAILED=$(echo "$REPORT_DATA" | jq '.summary.failed')
SUMMARY_WARNINGS=$(echo "$REPORT_DATA" | jq '.summary.warnings')
SUMMARY_TOTAL=$(echo "$REPORT_DATA" | jq '.summary.totalTests')
SUMMARY_RATE=$(echo "$REPORT_DATA" | jq '.summary.successRate')

cat >> "$REPORT_FILE" <<EOF
- **Total Tests:** $SUMMARY_TOTAL
- **Passed:** $SUMMARY_PASSED
- **Failed:** $SUMMARY_FAILED
- **Warnings:** $SUMMARY_WARNINGS
- **Success Rate:** ${SUMMARY_RATE}%

## Test Results by Category

### API Endpoints

EOF

# Add API endpoint results
echo "$REPORT_DATA" | jq -r '.sections.apiEndpoints[] | "- **\(.name)**: \(.status) - \(.details)"' >> "$REPORT_FILE"

cat >> "$REPORT_FILE" <<EOF

### UI-API Integration

EOF

# Add UI integration results
echo "$REPORT_DATA" | jq -r '.sections.uiIntegration[] | "- **\(.name)**: \(.status) - \(.details)"' >> "$REPORT_FILE"

cat >> "$REPORT_FILE" <<EOF

### Browser Exceptions

EOF

# Add browser exception results
echo "$REPORT_DATA" | jq -r '.sections.browserExceptions[] | "- **\(.name)**: \(.status) - \(.details)"' >> "$REPORT_FILE" || echo "- No browser exceptions recorded" >> "$REPORT_FILE"

cat >> "$REPORT_FILE" <<EOF

### Render-Specific Issues

EOF

# Add Render-specific results
echo "$REPORT_DATA" | jq -r '.sections.renderSpecific[] | "- **\(.name)**: \(.status) - \(.details)"' >> "$REPORT_FILE" || echo "- No Render-specific issues recorded" >> "$REPORT_FILE"

cat >> "$REPORT_FILE" <<EOF

## Defects and Bugs

EOF

# Add defects
echo "$REPORT_DATA" | jq -r '.sections.defects[] | "- **\(.name)**: \(.details)"' >> "$REPORT_FILE" || echo "- No defects recorded" >> "$REPORT_FILE"

cat >> "$REPORT_FILE" <<EOF

## Recommendations

EOF

# Add recommendations
echo "$REPORT_DATA" | jq -r '.sections.recommendations[] | "- \(.details)"' >> "$REPORT_FILE" || echo "- No recommendations at this time" >> "$REPORT_FILE"

cat >> "$REPORT_FILE" <<EOF

## Detailed Test Data

For detailed test data, see the JSON report: \`${JSON_REPORT}\`

## Test Execution Log

\`\`\`
$(tail -100 logs/test-execution.log 2>/dev/null || echo "No execution log found")
\`\`\`

---
*Report generated by test-report-generator.sh*
EOF

# Save JSON report
echo "$REPORT_DATA" > "$JSON_REPORT"

# Summary
echo ""
echo "=========================================="
echo "Report Generation Summary"
echo "=========================================="
echo "Markdown report: $REPORT_FILE"
echo "JSON report: $JSON_REPORT"
echo "Total tests: $SUMMARY_TOTAL"
echo "Passed: $SUMMARY_PASSED"
echo "Failed: $SUMMARY_FAILED"
echo "Success rate: ${SUMMARY_RATE}%"
echo ""
echo "Completed: $(date)"

# Open report if on macOS
if [[ "$OSTYPE" == "darwin"* ]]; then
  echo ""
  read -p "Open report in default viewer? (y/n) " -n 1 -r
  echo
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    open "$REPORT_FILE"
  fi
fi

exit 0

