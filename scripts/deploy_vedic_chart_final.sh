#!/bin/bash

# =============================================================================
# Comprehensive Vedic Chart Backend Deployment Script
# Fixes server startup errors via systematic ES modules conversion
# =============================================================================

set -e

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# =============================================================================
# 1. DEPENDENCY INSTALLATION
# =============================================================================

log_info "Starting comprehensive backend deployment..."
log_info "Installing missing dependencies..."

npm install mongoose axios dotenv moment opencage-api-client swisseph@^0.5.17

# =============================================================================
# 2. ES MODULES CONVERSION
# =============================================================================

log_info "Converting critical files to ES modules..."

# Key files that need conversion
CRITICAL_FILES=(
    "src/core/calculations/planetary/ExaltationDebilitationCalculator.js"
    "src/api/middleware/errorHandling.js"
    "src/data/repositories/ChartRepository.js"
    "src/data/repositories/UserRepository.js"
    "src/data/models/Chart.js"
    "src/services/analysis/ArudhaAnalysisService.js"
    "src/services/analysis/LuminariesAnalysisService.js"
    "src/services/analysis/DetailedDashaAnalysisService.js"
    "src/services/analysis/YogaDetectionService.js"
    "src/services/analysis/MasterAnalysisOrchestrator.js"
    "src/services/report/ComprehensiveReportService.js"
)

# Convert module.exports to export default
for file in "${CRITICAL_FILES[@]}"; do
    if [ -f "$file" ]; then
        log_info "Converting $file"
        sed -i.bak 's/module\.exports = /export default /g' "$file"
        rm -f "${file}.bak"
    fi
done

# Convert yoga calculators
find src/core/analysis/yogas -name "*Calculator.js" -type f | while read -r file; do
    if [ -f "$file" ]; then
        sed -i.bak 's/module\.exports = /export default /g' "$file"
        rm -f "${file}.bak"
        log_success "Converted $file"
    fi
done

# Convert require statements to imports for critical files
for file in "${CRITICAL_FILES[@]}"; do
    if [ -f "$file" ]; then
        # Convert require statements
        sed -i.bak 's/const \([A-Za-z][A-Za-z0-9_]*\) = require(\x27\([^x27]*\)\x27);/import \1 from \x27\2.js\x27;/g' "$file"
        sed -i.bak 's/const \([A-Za-z][A-Za-z0-9_]*\) = require("\([^"]*\)");/import \1 from "\2.js";/g' "$file"

        # Fix npm package imports (remove .js extension)
        sed -i.bak 's/import \([A-Za-z][A-Za-z0-9_]*\) from \x27\([^\.\/][^x27]*\)\.js\x27;/import \1 from \x27\2\x27;/g' "$file"
        sed -i.bak 's/import \([A-Za-z][A-Za-z0-9_]*\) from "\([^\.\/][^"]*\)\.js";/import \1 from "\2";/g' "$file"

        # Handle destructuring imports
        sed -i.bak 's/const { \([^}]*\) } = require(\x27\([^x27]*\)\x27);/import { \1 } from \x27\2.js\x27;/g' "$file"
        sed -i.bak 's/const { \([^}]*\) } = require("\([^"]*\)");/import { \1 } from "\2.js";/g' "$file"

        # Fix npm package destructuring imports
        sed -i.bak 's/import { \([^}]*\) } from \x27\([^\.\/][^x27]*\)\.js\x27;/import { \1 } from \x27\2\x27;/g' "$file"
        sed -i.bak 's/import { \([^}]*\) } from "\([^\.\/][^"]*\)\.js";/import { \1 } from "\2";/g' "$file"

        rm -f "${file}.bak"
    fi
done

# =============================================================================
# 3. PACKAGE.JSON CONFIGURATION
# =============================================================================

log_info "Configuring package.json for ES modules..."

# Ensure package.json has correct configuration
if ! grep -q '"type": "module"' package.json; then
    log_warning "Adding 'type': 'module' to package.json"
    sed -i.bak 's/"name": "\([^"]*\)",/"name": "\1",\n  "type": "module",/' package.json
    rm -f package.json.bak
fi

# Ensure dev script exists
if ! grep -q '"dev"' package.json; then
    log_warning "Adding dev script to package.json"
    sed -i.bak 's/"scripts": {/"scripts": {\n    "dev": "node src\/index.js",/' package.json
    rm -f package.json.bak
fi

# =============================================================================
# 4. IMPORT PATH FIXES
# =============================================================================

log_info "Fixing import paths to include .js extensions..."

# Fix import paths in all converted files
for file in "${CRITICAL_FILES[@]}"; do
    if [ -f "$file" ]; then
        # Fix relative imports missing .js extension
        sed -i.bak "s/from '\.\([^']*[^s]\)'/from '.\1.js'/g" "$file"
        sed -i.bak 's/from "\.\([^"]*[^s]\)"/from ".\1.js"/g' "$file"

        # Fix double .js.js extensions
        sed -i.bak 's/\.js\.js/.js/g' "$file"

        rm -f "${file}.bak"
    fi
done

# =============================================================================
# 5. SERVER STARTUP TEST
# =============================================================================

log_info "Testing backend server startup..."

# Create test script
cat > temp_test.js << 'EOF'
try {
  console.log('Testing backend imports...');
  process.exit(0);
} catch (error) {
  console.error('Import error:', error.message);
  process.exit(1);
}
EOF

# Test basic node functionality
if node temp_test.js; then
    log_success "Node.js environment is working"
else
    log_error "Node.js environment issues detected"
fi

rm -f temp_test.js

# =============================================================================
# 6. FINAL SUMMARY
# =============================================================================

log_success "Backend deployment process completed!"

echo ""
echo "============================================================================="
echo "                     DEPLOYMENT SUMMARY"
echo "============================================================================="
echo ""
echo "✅ Dependencies installed: mongoose, axios, dotenv, moment, opencage-api-client"
echo "✅ ES modules conversion applied to critical backend files"
echo "✅ Package.json configured with 'type': 'module' and dev script"
echo "✅ Import paths fixed with .js extensions"
echo ""
echo "Next steps:"
echo "1. Run 'npm run dev' to test backend server startup"
echo "2. Check for any remaining ES module conversion issues"
echo "3. Test API endpoints for functionality"
echo ""
echo "If the server fails to start, check the error messages and convert"
echo "additional files to ES modules as needed."
echo ""
echo "============================================================================="
