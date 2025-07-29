#!/bin/bash

# =============================================================================
# Backend Server Startup Verification Script
# Ensures npm commands run from correct directory and server starts properly
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
# 1. DIRECTORY VERIFICATION
# =============================================================================

log_info "Verifying correct working directory..."

REQUIRED_DIR="/Users/Shared/cursor/jyotish-shastra"
CURRENT_DIR=$(pwd)

if [ "$CURRENT_DIR" != "$REQUIRED_DIR" ]; then
    log_error "Wrong directory! Currently in: $CURRENT_DIR"
    log_info "Changing to correct directory: $REQUIRED_DIR"
    cd "$REQUIRED_DIR" || {
        log_error "Failed to change to project directory"
        exit 1
    }
fi

log_success "Working directory verified: $REQUIRED_DIR"

# =============================================================================
# 2. PACKAGE.JSON VERIFICATION
# =============================================================================

log_info "Verifying package.json exists..."

if [ ! -f "package.json" ]; then
    log_error "package.json not found in current directory!"
    log_error "This indicates you're in the wrong directory"
    exit 1
fi

log_success "package.json found"

# =============================================================================
# 3. BACKEND ENTRY POINT VERIFICATION
# =============================================================================

log_info "Verifying backend entry point..."

if [ ! -f "src/index.js" ]; then
    log_error "Backend entry point src/index.js not found!"
    exit 1
fi

log_success "Backend entry point verified: src/index.js"

# =============================================================================
# 4. DEPENDENCY CHECK
# =============================================================================

log_info "Checking if node_modules exists..."

if [ ! -d "node_modules" ]; then
    log_warning "node_modules not found, running npm install..."
    npm install
    log_success "Dependencies installed"
else
    log_success "Dependencies already installed"
fi

# =============================================================================
# 5. BACKEND SERVER STARTUP TEST
# =============================================================================

log_info "Testing backend server startup..."

# Start server in background
npm run dev &
SERVER_PID=$!

# Wait for server to start
sleep 5

# Test health endpoint
if curl -s http://localhost:3001/health > /dev/null; then
    log_success "Backend server is responding!"
    log_success "Health endpoint: http://localhost:3001/health"
else
    log_error "Backend server is not responding"
    kill $SERVER_PID 2>/dev/null || true
    exit 1
fi

# Stop test server
kill $SERVER_PID 2>/dev/null || true
log_info "Test server stopped"

# =============================================================================
# 6. STARTUP INSTRUCTIONS
# =============================================================================

echo ""
log_success "Backend server verification completed successfully!"
echo ""
echo "To start the backend server:"
echo "  1. cd /Users/Shared/cursor/jyotish-shastra/"
echo "  2. npm run dev (for development) or npm start (for production)"
echo "  3. Verify health: curl http://localhost:3001/health"
echo ""
echo "Expected health response:"
echo '  {"status":"healthy","timestamp":"...","uptime":...,"environment":"development"}'
echo ""
log_warning "CRITICAL: Always ensure you're in the project root directory before running npm commands!"

exit 0
