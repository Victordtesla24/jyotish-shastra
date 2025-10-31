#!/bin/bash

# Test Summary Generator Script (compatible with all bash versions)
# Generates comprehensive test summary report with test execution results

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Comprehensive Test Summary Generator ===${NC}"

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
USER_DOCS_DIR="$PROJECT_ROOT/user-docs"

# Ensure user-docs directory exists
mkdir -p "$USER_DOCS_DIR"

# Timestamp for report
date=$(date +"%Y-%m-%d %H:%M:%S")
TIMESTAMP="$date"
REPORT_FILE="$USER_DOCS_DIR/test-summary-report.md"
RAW_OUTPUT_FILE="$USER_DOCS_DIR/test-raw-output.txt"

echo -e "${YELLOW}Running tests and capturing output...${NC}"

# Run tests and capture both stdout and stderr
if npm run test > >(tee "$RAW_OUTPUT_FILE") 2>&1; then
    TEST_EXIT_CODE=0
    STATUS_COLOR="$GREEN"
    STATUS_TEXT="PASSED"
else
    TEST_EXIT_CODE=$?
    STATUS_COLOR="$RED"
    STATUS_TEXT="FAILED"
fi

echo -e "${YELLOW}Processing test results...${NC}"

# Start generating the markdown report
cat > "$REPORT_FILE" << EOF
# Test Summary Report

**Generated on:** $TIMESTAMP  
**Test Status:** $STATUS_COLOR$STATUS_TEXT${NC}  

## Executive Summary

| Test Type | Total | Passed | Failed | Skipped | Success Rate |
|-----------|-------|--------|--------|---------|--------------|
EOF

# Use temporary files instead of associative arrays for compatibility
UNIT_TESTS="/tmp/unit_tests_$$_tmp"
INTEGRATION_TESTS="/tmp/integration_tests_$$_tmp"
SYSTEM_TESTS="/tmp/system_tests_$$_tmp"
UI_TESTS="/tmp/ui_tests_$$_tmp"
OTHER_TESTS="/tmp/other_tests_$$_tmp"

API_GATEWAY="/tmp/api_gateway_$$_tmp"
CLIENT_LAYER="/tmp/client_layer_$$_tmp"
DATA_LAYER="/tmp/data_layer_$$_tmp"
SERVICE_LAYER="/tmp/service_layer_$$_tmp"
CORE_LAYER="/tmp/core_layer_$$_tmp"
CALCULATIONS="/tmp/calculations_$$_tmp"
ANALYSIS="/tmp/analysis_$$_tmp"
REPORTS="/tmp/reports_$$_tmp"
OTHER_LAYER="/tmp/other_layer_$$_tmp"

# Clean up temp files on exit
cleanup() {
    rm -f "$UNIT_TESTS" "$INTEGRATION_TESTS" "$SYSTEM_TESTS" "$UI_TESTS" "$OTHER_TESTS"
    rm -f "$API_GATEWAY" "$CLIENT_LAYER" "$DATA_LAYER" "$SERVICE_LAYER" "$CORE_LAYER"
    rm -f "$CALCULATIONS" "$ANALYSIS" "$REPORTS" "$OTHER_LAYER" "$ALL_TESTS"
}
trap cleanup EXIT

# Function to categorize tests
categorize_test() {
    local test_line="$1"
    local test_name=$(echo "$test_line" | sed -E 's/^[✓✗✅❌✔×[:space:]]*//' | sed 's/ (.*)$//' | sed 's/should /should /')
    local status="passed"
    if [[ "$test_line" =~ ^(✗|❌|×) ]]; then
        status="failed"
    fi
    local time=""
    if echo "$test_line" | grep -q -E '\([[:space:]]*[0-9]+[[:space:]]*ms[)]'; then
        time=$(echo "$test_line" | grep -o '[0-9]* ms')
    fi
    
    # Determine test type
    local test_type="Other Tests"
    local test_layer="Other"
    
    # Extract path information from context (this is simplified - for full accuracy, use the Node.js version)
    if echo "$test_line" | grep -q -i "unit\|/unit/"; then
        test_type="Unit Tests"
    elif echo "$test_line" | grep -q -i "integration\|/integration/"; then
        test_type="Integration Tests"
    elif echo "$test_line" | grep -q -i "system\|/system/"; then
        test_type="System Tests"
    elif echo "$test_line" | grep -q -i "ui\|cypress\|/ui/"; then
        test_type="UI Tests"
    fi
    
    # Determine architecture layer
    if echo "$test_line" | grep -q -i -E "api|endpoint|controller|/api/"; then
        test_layer="API Gateway"
    elif echo "$test_line" | grep -q -i -E "component|form|client|ui"; then
        test_layer="Client"
    elif echo "$test_line" | grep -q -i -E "data|model|mongoose"; then
        test_layer="Data"
    elif echo "$test_line" | grep -q -i -E "service|/services/"; then
        test_layer="Service Layer"
    elif echo "$test_line" | grep -q -i -E "core|/core/"; then
        test_layer="Core Layer"
    elif echo "$test_line" | grep -q -i -E "calculation|calculator"; then
        test_layer="Calculations"
    elif echo "$test_line" | grep -q -i -E "analysis|analyzer"; then
        test_layer="Analysis"
    elif echo "$test_line" | grep -q -i -E "report|synthesis"; then
        test_layer="Reports"
    fi
    
    # Add to appropriate temp files
    case "$test_type" in
        "Unit Tests") echo "$test_name|$status|$time|$test_layer" >> "$UNIT_TESTS" ;;
        "Integration Tests") echo "$test_name|$status|$time|$test_layer" >> "$INTEGRATION_TESTS" ;;
        "System Tests") echo "$test_name|$status|$time|$test_layer" >> "$SYSTEM_TESTS" ;;
        "UI Tests") echo "$test_name|$status|$time|$test_layer" >> "$UI_TESTS" ;;
        *) echo "$test_name|$status|$time|$test_layer" >> "$OTHER_TESTS" ;;
    esac
    
    case "$test_layer" in
        "API Gateway") echo "$test_name|$status|$time|$test_type" >> "$API_GATEWAY" ;;
        "Client") echo "$test_name|$status|$time|$test_type" >> "$CLIENT_LAYER" ;;
        "Data") echo "$test_name|$status|$time|$test_type" >> "$DATA_LAYER" ;;
        "Service Layer") echo "$test_name|$status|$time|$test_type" >> "$SERVICE_LAYER" ;;
        "Core Layer") echo "$test_name|$status|$time|$test_type" >> "$CORE_LAYER" ;;
        "Calculations") echo "$test_name|$status|$time|$test_type" >> "$CALCULATIONS" ;;
        "Analysis") echo "$test_name|$status|$time|$test_type" >> "$ANALYSIS" ;;
        "Reports") echo "$test_name|$status|$time|$test_type" >> "$REPORTS" ;;
        *) echo "$test_name|$status|$time|$test_type" >> "$OTHER_LAYER" ;;
    esac
}

# Function to count tests by status
count_tests() {
    local test_file="$1"
    local passed=0 failed=0 total=0
    
    if [[ -f "$test_file" ]]; then
        while IFS='|' read -r test_name status time layer; do
            ((total++))
            if [[ "$status" == "passed" ]]; then
                ((passed++))
            else
                ((failed++))
            fi
        done < "$test_file"
    fi
    
    echo "$total $passed $failed"
}

# Process test output
echo "Processing test results from raw output..."
while IFS= read -r line; do
    # Look for test result lines
    if [[ "$line" =~ ^[[:space:]]*[✓✗✅❌✔×][[:space:]]+should ]]; then
        categorize_test "$line"
    fi
done < "$RAW_OUTPUT_FILE"

# Calculate totals
function write_summary_row() {
    local test_type="$1"
    local -n test_array=$2
    read total passed failed <<< $(count_tests test_array)
    local success_rate=0
    if [[ $((passed + failed)) -gt 0 ]]; then
        success_rate=$(echo "scale=1; $passed * 100 / ($passed + $failed)" | bc)
    fi
    echo "| $test_type | $total | $passed | $failed | 0 | $success_rate% |" >> "$REPORT_FILE"
}

# Add summary rows to report
write_summary_row "Unit Tests" "$UNIT_TESTS"
write_summary_row "Integration Tests" "$INTEGRATION_TESTS"
write_summary_row "System Tests" "$SYSTEM_TESTS"
write_summary_row "UI Tests" "$UI_TESTS"
write_summary_row "Other Tests" "$OTHER_TESTS"

# Add architecture layer summary
cat >> "$REPORT_FILE" << EOF

## Architecture Layer Summary

| Architecture Layer | Total | Passed | Failed | Skipped | Coverage |
|---------------------|-------|--------|--------|---------|----------|
EOF

function write_layer_row() {
    local layer_name="$1"
    local -n layer_array=$2
    read total passed failed <<< $(count_tests layer_array)
    local executed=$((passed + failed))
    local coverage=0
    if [[ $total -gt 0 ]]; then
        coverage=$(echo "scale=1; $executed * 100 / $total" | bc)
    fi
    echo "| $layer_name | $total | $passed | $failed | 0 | $coverage% |" >> "$REPORT_FILE"
}

write_layer_row "API Gateway" "$API_GATEWAY"
write_layer_row "Client" "$CLIENT_LAYER"
write_layer_row "Data" "$DATA_LAYER"
write_layer_row "Service Layer" "$SERVICE_LAYER"
write_layer_row "Core Layer" "$CORE_LAYER"
write_layer_row "Calculations" "$CALCULATIONS"
write_layer_row "Analysis" "$ANALYSIS"
write_layer_row "Reports" "$REPORTS"
write_layer_row "Other" "$OTHER_LAYER"

# Function to write detailed test breakdown
write_test_details() {
    local section_title="$1"
    local test_file="$2"
    
    if [[ ! -f "$test_file" ]] || [[ ! -s "$test_file" ]]; then
        return
    fi
    
    printf "\n### %s\n\n" "$section_title" >> "$REPORT_FILE"
    printf "| Test Name | Status | Time | Layer |\n" >> "$REPORT_FILE"
    printf "|-----------|--------|------|-------|\n" >> "$REPORT_FILE"
    
    # Sort tests alphabetically by name
    sort "$test_file" | while IFS='|' read -r test_name status time layer; do
        # shellcheck disable=SC2034
        test_array=""
        # shellcheck disable=SC2034
        layer_array=""
        status_icon="✅"
        if [[ "$status" == "failed" ]]; then
            status_icon="❌"
        fi
        
        printf "| %s | %s %s | %s | %s |\n" "$test_name" "$status_icon" "$status" "$time" "$layer" >> "$REPORT_FILE"
    done
    printf "\n" >> "$REPORT_FILE"
}

# Add detailed breakdown by test type
echo -e "\n## Detailed Test Results\n" >> "$REPORT_FILE"
write_test_details "Unit Tests" "$UNIT_TESTS"
write_test_details "Integration Tests" "$INTEGRATION_TESTS"
write_test_details "System Tests" "$SYSTEM_TESTS"
write_test_details "UI Tests" "$UI_TESTS"
write_test_details "Other Tests" "$OTHER_TESTS"

# Add architecture layer details
echo -e "\n## Architecture Layer Detailed View\n" >> "$REPORT_FILE"

write_layer_details() {
    local layer_name="$1"
    local layer_file="$2"
    
    if [[ ! -f "$layer_file" ]] || [[ ! -s "$layer_file" ]]; then
        return
    fi
    
    printf "\n### %s\n\n" "$layer_name" >> "$REPORT_FILE"
    printf "| Test Name | Test Type | Status | Time |\n" >> "$REPORT_FILE"
    printf "|-----------|-----------|--------|------|\n" >> "$REPORT_FILE"
    
    sort "$layer_file" | while IFS='|' read -r test_name status time test_type; do
        # shellcheck disable=SC2034
        test_array=""
        # shellcheck disable=SC2034
        layer_array=""
        status_icon="✅"
        if [[ "$status" == "failed" ]]; then
            status_icon="❌"
        fi
        
        printf "| %s | %s | %s | %s |\n" "$test_name" "$test_type" "$status_icon" "$time" >> "$REPORT_FILE"
    done
    printf "\n" >> "$REPORT_FILE"
}

write_layer_details "API Gateway" "$API_GATEWAY"
write_layer_details "Client" "$CLIENT_LAYER"
write_layer_details "Data" "$DATA_LAYER"
write_layer_details "Service Layer" "$SERVICE_LAYER"
write_layer_details "Core Layer" "$CORE_LAYER"
write_layer_details "Calculations" "$CALCULATIONS"
write_layer_details "Analysis" "$ANALYSIS"
write_layer_details "Reports" "$REPORTS"
write_layer_details "Other" "$OTHER_LAYER"

# Add final summary
echo -e "\n## Final Summary\n\n" >> "$REPORT_FILE"

# Calculate totals
ALL_TESTS="/tmp/all_tests_$$_tmp"

# Combine all test files
cat "$UNIT_TESTS" "$INTEGRATION_TESTS" "$SYSTEM_TESTS" "$UI_TESTS" "$OTHER_TESTS" > "$ALL_TESTS" 2>/dev/null || true

total_unit=$(count_tests "$UNIT_TESTS" | cut -d' ' -f1)
total_integration=$(count_tests "$INTEGRATION_TESTS" | cut -d' ' -f1)
total_system=$(count_tests "$SYSTEM_TESTS" | cut -d' ' -f1)
total_ui=$(count_tests "$UI_TESTS" | cut -d' ' -f1)
total_other=$(count_tests "$OTHER_TESTS" | cut -d' ' -f1)

total_tests=$((total_unit + total_integration + total_system + total_ui + total_other))

# Count passed and failed
IFS=' ' read -r total_passed total_failed << EOF
$(count_tests "$ALL_TESTS")
EOF

success_rate=0
if [[ $((total_passed + total_failed)) -gt 0 ]]; then
    success_rate=$(echo "scale=2; $total_passed * 100 / ($total_passed + $total_failed)" | bc)
fi

echo "- **Total Tests**: $total_tests" >> "$REPORT_FILE"
echo "- **Passed**: $total_passed" >> "$REPORT_FILE"
echo "- **Failed**: $total_failed" >> "$REPORT_FILE"
echo "- **Success Rate**: $success_rate%" >> "$REPORT_FILE"

# If there are failed tests, list them
if [[ $total_failed -gt 0 ]]; then
    {
        printf "\n### Failed Tests\n\n"
        printf "The following tests failed during execution:\n\n"
        sort "$ALL_TESTS" | while IFS='|' read -r test_name status time layer; do
            if [[ "$status" == "failed" ]]; then
                printf "- ❌ %s\n" "$test_name"
            fi
        done
        printf "\n"
    } >> "$REPORT_FILE"
fi

# Add raw test output appendix
{
    printf "\n---\n\n## Raw Test Output\n\n"
    printf '<details><title>Click to expand raw test output</title>\n'
    printf "\n"
    printf "```\n"
    cat "$RAW_OUTPUT_FILE"
    printf "```\n"
    printf "</details>\n"
} >> "$REPORT_FILE"

echo -e "\n${GREEN}✅ Test summary report generated successfully!${NC}"
echo -e "${BLUE}Report saved to: $REPORT_FILE${NC}"
echo -e "${BLUE}Raw output saved to: $RAW_OUTPUT_FILE${NC}"

# Show summary in console
echo
echo -e "${YELLOW}=== Quick Summary ===${NC}"
echo -e "Total Tests: $total_tests"
printf "Passed: %s%s%s\n" "$GREEN" "$total_passed" "$NC"
printf "Failed: %s%s%s\n" "$RED" "$total_failed" "$NC"
printf "Success Rate: %s%s%s\n" "$BLUE" "$success_rate%" "$NC"

echo -e "\n${YELLOW}View the full report at: $REPORT_FILE${NC}"

# Offer to open the report
if command -v open &> /dev/null; then
    echo -e "\n${BLUE}Would you like to open the report? (y/n)${NC}"
    read -r response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        open "$REPORT_FILE"
    fi
fi

exit $TEST_EXIT_CODE
