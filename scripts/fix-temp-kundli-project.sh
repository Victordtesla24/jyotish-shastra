#!/usr/bin/env bash
# -----------------------------------------------------------------------------
# fix-temp-kundli-project.sh — resilient wrapper that calls fix_kundli_project.sh
# This wrapper ensures a valid shebang, creates the target directory if missing,
# and then delegates to the canonical patch script.
# -----------------------------------------------------------------------------
set -euo pipefail

# Default project path can be overridden by first CLI arg
TARGET_DIR="${1:-/Users/Shared/cursor/jyotish-shastra/tests/temp-chart-generation-proj}"

# Create the directory tree if it does not yet exist
mkdir -p "$TARGET_DIR"

# Path to the main patch script (assumes it is in the same directory as this wrapper)
SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &>/dev/null && pwd)"
MAIN_PATCH="$SCRIPT_DIR/fix_kundli_project.sh"

if [[ ! -x "$MAIN_PATCH" ]]; then
  echo "Error: $MAIN_PATCH not found or not executable." >&2
  exit 1
fi

# Delegate to the main patch script, forwarding TARGET_DIR as first arg
"$MAIN_PATCH" "$TARGET_DIR"
