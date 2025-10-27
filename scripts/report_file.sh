#!/bin/bash

# Create the comprehensive deployment and testing script
script_content = '''#!/bin/bash

# =============================================================================
# JYOTISH SHASTRA - VEDIC CHART DEPLOYMENT & TESTING SCRIPT
# =============================================================================
# This script copies generated files to correct locations and runs comprehensive tests
# Author: Vedic Chart Testing Suite
# Date: $(date +"%Y-%m-%d %H:%M:%S")
# =============================================================================

set -e  # Exit on any error

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
NC='\033[0m' # No Color

# Configuration
DOWNLOADS_DIR="/Users/vicd/downloads"
PROJECT_ROOT="$(pwd)"
LOG_FILE="$PROJECT_ROOT/deployment_test_log_$(date +%Y%m%d_%H%M%S).log"

# ASCII Art Header
print_header() {
    echo -e "${CYAN}"
    echo "╔════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╗"
    echo "║                                    JYOTISH SHASTRA - VEDIC CHART TESTING SUITE                                        ║"
    echo "║                                          Deployment & Testing Script                                                  ║"
    echo "╚════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

# Logging function
log() {
    echo -e \$1" | tee -a "$LOG_FILE"
}

# Progress bar function
show_progress() {
    local current\$1
    local total\$2
    local width=50
    local percentage=$((current * 100 / total))
    local completed=$((current * width / total))
    local remaining=$((width - completed))

    printf "\r["
    printf "%*s" $completed | tr ' ' '='
    printf "%*s" $remaining | tr ' ' '-'
    printf "] %d%% (%d/%d)" $percentage $current $total
}

# File mapping configuration
declare -A FILE_MAPPINGS=(
    # Frontend Components
    ["VedicChartDisplay_corrected.jsx"]="client/src/components/charts/VedicChartDisplay.jsx"
    ["InteractiveVedicChart_enhanced.jsx"]="client/src/components/charts/InteractiveVedicChart.jsx"
    ["VedicRechartsWrapper_updated.jsx"]="client/src/components/charts/VedicRechartsWrapper.jsx"

    # Test Files
    ["VedicChartDisplay.test.js"]="tests/unit/components/VedicChartDisplay.test.js"
    ["InteractiveVedicChart.test.js"]="tests/unit/components/InteractiveVedicChart.test.js"
    ["vedic-chart-e2e.spec.js"]="tests/e2e/vedic-chart-e2e.spec.js"

    # Validation Tools
    ["VedicChartValidator.js"]="client/src/utils/VedicChartValidator.js"
    ["VisualComparisonTool.js"]="client/src/utils/VisualComparisonTool.js"
    ["AutomatedTestRunner.js"]="tests/utils/AutomatedTestRunner.js"

    # Test Data
    ["vedic_chart_test_data.json"]="tests/test-data/vedic_chart_test_data.json"
    ["generate_chart_api_response_data.json"]="tests/test-data/generate_chart_api_response_data.json"

    # Configuration Files
    ["jest.config.js"]="jest.config.js"
    ["cypress.config.js"]="cypress.config.js"

    # Enhanced Components
    ["PlanetaryPositionCalculator.js"]="client/src/utils/PlanetaryPositionCalculator.js"
    ["VedicSymbolRenderer.js"]="client/src/components/charts/VedicSymbolRenderer.js"
    ["HouseLayoutManager.js"]="client/src/utils/HouseLayoutManager.js"
)

# Check prerequisites
check_prerequisites() {
    log "${BLUE}[INFO] Checking prerequisites...${NC}"

    # Check if downloads directory exists
    if [ ! -d "$DOWNLOADS_DIR" ]; then
        log "${RED}[ERROR] Downloads directory not found: $DOWNLOADS_DIR${NC}"
        exit 1
    fi

    # Check if project directories exist
    local required_dirs=("client/src/components/charts" "tests/unit" "tests/e2e" "tests/test-data" "tests/utils" "client/src/utils")
    for dir in "${required_dirs[@]}"; do
        if [ ! -d "$PROJECT_ROOT/$dir" ]; then
            log "${YELLOW}[WARN] Creating missing directory: $dir${NC}"
            mkdir -p "$PROJECT_ROOT/$dir"
        fi
    done

    # Check Node.js and npm
    if ! command -v node &> /dev/null; then
        log "${RED}[ERROR] Node.js is not installed${NC}"
        exit 1
    fi

    if ! command -v npm &> /dev/null; then
        log "${RED}[ERROR] npm is not installed${NC}"
        exit 1
    fi

    log "${GREEN}[SUCCESS] Prerequisites check completed${NC}"
}

# Copy files to correct locations
copy_files() {
    log "${BLUE}[INFO] Starting file deployment...${NC}"

    local total_files=${#FILE_MAPPINGS[@]}
    local current_file=0
    local copied_files=0
    local skipped_files=0

    for source_file in "${!FILE_MAPPINGS[@]}"; do
        current_file=$((current_file + 1))
        show_progress $current_file $total_files

        local source_path="$DOWNLOADS_DIR/$source_file"
        local dest_path="$PROJECT_ROOT/${FILE_MAPPINGS[$source_file]}"
        local dest_dir=$(dirname "$dest_path")

        if [ -f "$source_path" ]; then
            # Create destination directory if it doesn't exist
            mkdir -p "$dest_dir"

            # Check if destination file exists and is different
            if [ -f "$dest_path" ]; then
                if ! cmp -s "$source_path" "$dest_path"; then
                    # Create backup of existing file
                    cp "$dest_path" "${dest_path}.backup.$(date +%Y%m%d_%H%M%S)"
                    cp "$source_path" "$dest_path"
                    copied_files=$((copied_files + 1))
                    log "\n${GREEN}[COPIED] $source_file -> ${FILE_MAPPINGS[$source_file]}${NC}"
                else
                    skipped_files=$((skipped_files + 1))
                    log "\n${YELLOW}[SKIPPED] $source_file (identical)${NC}"
                fi
            else
                cp "$source_path" "$dest_path"
                copied_files=$((copied_files + 1))
                log "\n${GREEN}[COPIED] $source_file -> ${FILE_MAPPINGS[$source_file]}${NC}"
            fi
        else
            log "\n${RED}[MISSING] $source_file not found in downloads${NC}"
        fi
    done

    echo ""
    log "${GREEN}[SUCCESS] File deployment completed: $copied_files copied, $skipped_files skipped${NC}"
}

# Install dependencies
install_dependencies() {
    log "${BLUE}[INFO] Installing/updating dependencies...${NC}"

    # Frontend dependencies
    cd "$PROJECT_ROOT/client"
    if [ -f "package.json" ]; then
        npm install --silent

        # Install additional testing dependencies if not present
        local test_deps=("@testing-library/react" "@testing-library/jest-dom" "@testing-library/user-event" "cypress" "jest-environment-jsdom")
        for dep in "${test_deps[@]}"; do
            if ! npm list "$dep" &> /dev/null; then
                npm install --save-dev "$dep" --silent
            fi
        done
    fi

    # Root dependencies
    cd "$PROJECT_ROOT"
    if [ -f "package.json" ]; then
        npm install --silent
    fi

    log "${GREEN}[SUCCESS] Dependencies installed${NC}"
}

# Run comprehensive tests
run_tests() {
    log "${BLUE}[INFO] Starting comprehensive test suite...${NC}"

    # Create test results directory
    local results_dir="$PROJECT_ROOT/test-results"
    mkdir -p "$results_dir"

    # Test results storage
    local unit_results="$results_dir/unit_test_results.json"
    local e2e_results="$results_dir/e2e_test_results.json"
    local validation_results="$results_dir/validation_results.json"

    echo "{"
    echo "  \"testSuite\": \"Jyotish Shastra Vedic Chart Testing\","
    echo "  \"timestamp\": \"$(date -Iseconds)\","
    echo "  \"results\": {"

    # Unit Tests
    log "${CYAN}[TEST] Running Unit Tests...${NC}"
    cd "$PROJECT_ROOT/client"
    if npm test -- --watchAll=false --coverage --json --outputFile="$unit_results" &> /dev/null; then
        echo "    \"unitTests\": {"
        echo "      \"status\": \"PASSED\","
        echo "      \"details\": \"All unit tests passed successfully\""
        echo "    },"
        log "${GREEN}[PASS] Unit tests completed successfully${NC}"
    else
        echo "    \"unitTests\": {"
        echo "      \"status\": \"FAILED\","
        echo "      \"details\": \"Some unit tests failed - check logs\""
        echo "    },"
        log "${RED}[FAIL] Unit tests failed${NC}"
    fi

    # E2E Tests (if Cypress is configured)
    log "${CYAN}[TEST] Running E2E Tests...${NC}"
    if [ -f "$PROJECT_ROOT/cypress.config.js" ]; then
        if npx cypress run --headless --reporter json --reporter-options "output=$e2e_results" &> /dev/null; then
            echo "    \"e2eTests\": {"
            echo "      \"status\": \"PASSED\","
            echo "      \"details\": \"All E2E tests passed successfully\""
            echo "    },"
            log "${GREEN}[PASS] E2E tests completed successfully${NC}"
        else
            echo "    \"e2eTests\": {"
            echo "      \"status\": \"FAILED\","
            echo "      \"details\": \"Some E2E tests failed - check logs\""
            echo "    },"
            log "${RED}[FAIL] E2E tests failed${NC}"
        fi
    else
        echo "    \"e2eTests\": {"
        echo "      \"status\": \"SKIPPED\","
        echo "      \"details\": \"Cypress not configured\""
        echo "    },"
        log "${YELLOW}[SKIP] E2E tests skipped (Cypress not configured)${NC}"
    fi

    # Validation Tests
    log "${CYAN}[TEST] Running Chart Validation...${NC}"
    cd "$PROJECT_ROOT"
    if node tests/utils/AutomatedTestRunner.js > "$validation_results" 2>&1; then
        echo "    \"validationTests\": {"
        echo "      \"status\": \"PASSED\","
        echo "      \"details\": \"Chart validation completed successfully\""
        echo "    }"
        log "${GREEN}[PASS] Chart validation completed successfully${NC}"
    else
        echo "    \"validationTests\": {"
        echo "      \"status\": \"FAILED\","
        echo "      \"details\": \"Chart validation failed - check logs\""
        echo "    }"
        log "${RED}[FAIL] Chart validation failed${NC}"
    fi

    echo "  }"
    echo "}"

    log "${GREEN}[SUCCESS] Test suite completed${NC}"
}

# Generate comprehensive test report
generate_report() {
    log "${BLUE}[INFO] Generating comprehensive test report...${NC}"

    local report_file="$PROJECT_ROOT/VEDIC_CHART_TEST_REPORT_$(date +%Y%m%d_%H%M%S).txt"

    cat > "$report_file" <
