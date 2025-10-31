#!/bin/bash

# Simple and robust test summary generator
# Compatible with all bash versions

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}=== Test Summary Report Generator ===${NC}"

# Set paths
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
USER_DOCS_DIR="$PROJECT_ROOT/user-docs"
REPORT_FILE="$USER_DOCS_DIR/test-summary-report.md"
RAW_OUTPUT_FILE="$USER_DOCS_DIR/test-raw-output.txt"

# Ensure user-docs directory exists
mkdir -p "$USER_DOCS_DIR"

# Get timestamp
DATE=$(date '+%Y-%m-%d %H:%M:%S')

echo -e "${YELLOW}Running tests and capturing output...${NC}"

# Run tests and capture output
npm run test > "$RAW_OUTPUT_FILE" 2>&1
TEST_EXIT_CODE=$?

echo -e "${YELLOW}Generating test summary report...${NC}"

# Start the markdown report
cat > "$REPORT_FILE" << EOF
# Test Summary Report

**Generated on:** $DATE  
**Test Status:** $([ $TEST_EXIT_CODE -eq 0 ] && echo "${GREEN}PASSED${NC}" || echo "${RED}FAILED${NC}")

## Test Results

| Test Type | Total | Passed | Failed | Success Rate |
|-----------|-------|--------|--------|--------------|
EOF

# Parse test results
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Extract test results from Jest output
if grep -q "Test Suites:" "$RAW_OUTPUT_FILE"; then
    # Get test counts from Jest summary
    if grep -q "Tests:" "$RAW_OUTPUT_FILE"; then
        SUMMARY_LINE=$(grep "Tests:" "$RAW_OUTPUT_FILE" | tail -1)
        echo "$SUMMARY_LINE" >> /tmp/test_debug.log
        
        # Parse like: "Tests:       1 todo, 584 passed, 585 total"
        TODO_COUNT=$(echo "$SUMMARY_LINE" | sed 's/.*Tests:[[:space:]]*//' | sed 's/[[:space:]]*passed.*//' | sed 's/todo[[:space:]]*//' | sed 's/[[:space:]].*//' | tr -d ' ')
        PASSED_COUNT=$(echo "$SUMMARY_LINE" | sed 's/.*passed[[:space:]]*//' | sed 's/[[:space:]]*total.*//' | sed 's/[[:space:]].*//' | tr -d ' ')
        TOTAL_COUNT=$(echo "$SUMMARY_LINE" | sed 's/.*total[[:space:]]*//' | sed 's/[[:space:]].*//' | tr -d ' ')
        
        # Handle cases where parsing fails
        if [ -z "$TOTAL_COUNT" ]; then
            TOTAL_COUNT=$(echo "$SUMMARY_LINE" | grep -o '[0-9]* passed' | sed 's/ passed//')
            PASSED_COUNT="$TOTAL_COUNT"
        fi
        
        TOTAL_TESTS=${TOTAL_COUNT:-0}
        PASSED_TESTS=${PASSED_COUNT:-0}
        TODO_COUNT=${TODO_COUNT:-0}
        FAILED_TESTS=$((TOTAL_TESTS - PASSED_TESTS - TODO_COUNT))
    fi
else
    # Fallback: count test lines manually
    TOTAL_TESTS=$(grep -c "✓\|✗\|✔\|✘" "$RAW_OUTPUT_FILE" 2>/dev/null || echo "0")
    PASSED_TESTS=$(grep -c "✓\|✔" "$RAW_OUTPUT_FILE" 2>/dev/null || echo "0")
    FAILED_TESTS=$((TOTAL_TESTS - PASSED_TESTS))
fi

# Calculate success rate
if [ $TOTAL_TESTS -gt 0 ]; then
    if [ $((PASSED_TESTS + FAILED_TESTS)) -gt 0 ]; then
        SUCCESS_RATE=$(echo "scale=1; 100 * $PASSED_TESTS / ($PASSED_TESTS + $FAILED_TESTS)" | bc -l 2>/dev/null || echo "0")
    else
        SUCCESS_RATE="100.0"
    fi
else
    SUCCESS_RATE="0.0"
fi

# Add summary table
echo "| All Tests | $TOTAL_TESTS | $PASSED_TESTS | $FAILED_TESTS | $SUCCESS_RATE% |" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

# Categorize tests by analyzing file paths and content
UNIT_TESTS=0
INTEGRATION_TESTS=0
SYSTEM_TESTS=0
UI_TESTS=0
OTHER_TESTS=0

API_GATEWAY=0
CLIENT_LAYER=0
SERVICE_LAYER=0
CORE_LAYER=0
CALCULATIONS=0
ANALYSIS=0

# Analyze test output for categorization
while IFS= read -r line; do
    if echo "$line" | grep -q "✓\|✗\|✔\|✘.*should\|.*it"; then
        # Categorize by file path patterns
        if echo "$line" | grep -q "/unit/\|unit "; then
            UNIT_TESTS=$((UNIT_TESTS + 1))
        elif echo "$line" | grep -q "/integration/\|integration "; then
            INTEGRATION_TESTS=$((INTEGRATION_TESTS + 1))
        elif echo "$line" | grep -q "/system/\|system "; then
            SYSTEM_TESTS=$((SYSTEM_TESTS + 1))
        elif echo "$line" | grep -q "/ui/\|ui \|\|cypress"; then
            UI_TESTS=$((UI_TESTS + 1))
        else
            OTHER_TESTS=$((OTHER_TESTS + 1))
        fi
        
        # Architecture layer categorization
        if echo "$line" | grep -q "api\|endpoint\|controller\|/api/"; then
            API_GATEWAY=$((API_GATEWAY + 1))
        elif echo "$line" | grep -q "component\|form\|client"; then
            CLIENT_LAYER=$((CLIENT_LAYER + 1))
        elif echo "$line" | grep -q "service\|Service"; then
            SERVICE_LAYER=$((SERVICE_LAYER + 1))
        elif echo "$line" | grep -q "core\|Core\|/core/"; then
            CORE_LAYER=$((CORE_LAYER + 1))
        elif echo "$line" | grep -q "calculation\|Calculator\|compute"; then
            CALCULATIONS=$((CALCULATIONS + 1))
        elif echo "$line" | grep -q "analysis\|Analysis\|analyze"; then
            ANALYSIS=$((ANALYSIS + 1))
        fi
    fi
done < "$RAW_OUTPUT_FILE"

# Add detailed categorization tables
cat >> "$REPORT_FILE" << EOF

## Test Type Breakdown

| Test Type | Total | Percentage |
|-----------|-------|------------|
EOF

if [ $UNIT_TESTS -gt 0 ]; then
    UNIT_PERCENT=$(echo "scale=1; 100 * $UNIT_TESTS / $TOTAL_TESTS" | bc -l 2>/dev/null || echo "0")
    echo "| Unit Tests | $UNIT_TESTS | $UNIT_PERCENT% |" >> "$REPORT_FILE"
fi

if [ $INTEGRATION_TESTS -gt 0 ]; then
    INTEGRATION_PERCENT=$(echo "scale=1; 100 * $INTEGRATION_TESTS / $TOTAL_TESTS" | bc -l 2>/dev/null || echo "0")
    echo "| Integration Tests | $INTEGRATION_TESTS | $INTEGRATION_PERCENT% |" >> "$REPORT_FILE"
fi

if [ $SYSTEM_TESTS -gt 0 ]; then
    SYSTEM_PERCENT=$(echo "scale=1; 100 * $SYSTEM_TESTS / $TOTAL_TESTS" | bc -l 2>/dev/null || echo "0")
    echo "| System Tests | $SYSTEM_TESTS | $SYSTEM_PERCENT% |" >> "$REPORT_FILE"
fi

if [ $UI_TESTS -gt 0 ]; then
    UI_PERCENT=$(echo "scale=1; 100 * $UI_TESTS / $TOTAL_TESTS" | bc -l 2>/dev/null || echo "0")
    echo "| UI Tests | $UI_TESTS | $UI_PERCENT% |" >> "$REPORT_FILE"
fi

if [ $OTHER_TESTS -gt 0 ]; then
    OTHER_PERCENT=$(echo "scale=1; 100 * $OTHER_TESTS / $TOTAL_TESTS" | bc -l 2>/dev/null || echo "0")
    echo "| Other Tests | $OTHER_TESTS | $OTHER_PERCENT% |" >> "$REPORT_FILE"
fi

cat >> "$REPORT_FILE" << EOF

## Architecture Layer Breakdown

| Architecture Layer | Total | Percentage |
|---------------------|-------|------------|
EOF

if [ $API_GATEWAY -gt 0 ]; then
    API_PERCENT=$(echo "scale=1; 100 * $API_GATEWAY / $TOTAL_TESTS" | bc -l 2>/dev/null || echo "0")
    echo "| API Gateway | $API_GATEWAY | $API_PERCENT% |" >> "$REPORT_FILE"
fi

if [ $CLIENT_LAYER -gt 0 ]; then
    CLIENT_PERCENT=$(echo "scale=1; 100 * $CLIENT_LAYER / $TOTAL_TESTS" | bc -l 2>/dev/null || echo "0")
    echo "| Client | $CLIENT_LAYER | $CLIENT_PERCENT% |" >> "$REPORT_FILE"
fi

if [ $SERVICE_LAYER -gt 0 ]; then
    SERVICE_PERCENT=$(echo "scale=1; 100 * $SERVICE_LAYER / $TOTAL_TESTS" | bc -l 2>/dev/null || echo "0")
    echo "| Service Layer | $SERVICE_LAYER | $SERVICE_PERCENT% |" >> "$REPORT_FILE"
fi

if [ $CORE_LAYER -gt 0 ]; then
    CORE_PERCENT=$(echo "scale=1; 100 * $CORE_LAYER / $TOTAL_TESTS" | bc -l 2>/dev/null || echo "0")
    echo "| Core Layer | $CORE_LAYER | $CORE_PERCENT% |" >> "$REPORT_FILE"
fi

if [ $CALCULATIONS -gt 0 ]; then
    CALC_PERCENT=$(echo "scale=1; 100 * $CALCULATIONS / $TOTAL_TESTS" | bc -l 2>/dev/null || echo "0")
    echo "| Calculations | $CALCULATIONS | $CALC_PERCENT% |" >> "$REPORT_FILE"
fi

if [ $ANALYSIS -gt 0 ]; then
    ANALYSIS_PERCENT=$(echo "scale=1; 100 * $ANALYSIS / $TOTAL_TESTS" | bc -l 2>/dev/null || echo "0")
    echo "| Analysis | $ANALYSIS | $ANALYSIS_PERCENT% |" >> "$REPORT_FILE"
fi

# Add failed tests section if any
if [ $FAILED_TESTS -gt 0 ]; then
    echo "" >> "$REPORT_FILE"
    echo "## Failed Tests\n" >> "$REPORT_FILE"
    echo "The following tests failed during execution:\n" >> "$REPORT_FILE"
    grep -n "✗\|✘" "$RAW_OUTPUT_FILE" | head -10 | sed 's/^.*- ❌ /- ❌ /' | sed 's/^[[:space:]]*[0-9]*:✗[[:space:]]*/- ❌ /' >> "$REPORT_FILE" 2>/dev/null || echo "No specific failed tests found in output" >> "$REPORT_FILE"
fi

# Add raw output appendix
cat >> "$REPORT_FILE" << EOF

---

## Raw Test Output

<details><title>Click to expand raw test output</title>

\`\`\`
EOF

cat "$RAW_OUTPUT_FILE" >> "$REPORT_FILE"

cat >> "$REPORT_FILE" << EOF
\`\`\`
</details>
EOF

# Display summary
echo ""
echo -e "${GREEN}✅ Test summary report generated successfully!${NC}"
echo -e "${BLUE}Report saved to: $REPORT_FILE${NC}"
echo -e "${BLUE}Raw output saved to: $RAW_OUTPUT_FILE${NC}"

echo ""
echo -e "${YELLOW}=== Test Summary ===${NC}"
echo -e "Total Tests: ${BLUE}$TOTAL_TESTS${NC}"
echo -e "Passed: ${GREEN}$PASSED_TESTS${NC}"
echo -e "Failed: ${RED}$FAILED_TESTS${NC}"
echo -e "Success Rate: ${BLUE}$SUCCESS_RATE%${NC}"

echo -e "\n${YELLOW}View the full report at: $REPORT_FILE${NC}"

# Offer to open report
if command -v open >/dev/null 2>&1; then
    echo -e "\n${BLUE}Would you like to open the report? (y/n)${NC}"
    read -r response
    case "$response" in
        [Yy]|[Yy][Ee][Ss]) open "$REPORT_FILE" ;;
        *) echo "Report saved. Run 'open $REPORT_FILE' to view later." ;;
    esac
fi

exit $TEST_EXIT_CODE
