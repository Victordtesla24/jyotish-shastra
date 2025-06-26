#!/usr/bin/env bash

PATTERNS=("TODO" "FIXME" "XXX" "HACK" "BUG"
    "Simplified" "Placeholder" "mock" "fake" "dummy" "stub" "temporary"
    "Additional helper methods would be implemented here"
    "Simplified check" "full implementation would"
    "would need full" "simplified version"
    "In practice, this would" "would need full implementation"
    "In a production environment" "simulate" "for now"
    "This would be replaced with actual" "placeholder for actual"
    "In a real implementation" "return 0"
    "typically" "sample" "Demo" "demo")

ROOT_DIR="$(pwd)"
echo "Project Root: $ROOT_DIR"

EXCLUDE_DIRS=(
  "node_modules"
  "client/node_modules"
  "venv"
  ".venv"
  "logs"
  ".vscode"
  ".cursor"
  ".clinerules"
  ".github"
  "coverage"
  "dist"
  "build"
  "out"
  "target"
  ".git"
  ".gitignore"
  "docs"
  "user-docs"
  "cypress"
  ".env"
  ".DS_Store"
  ".cursor-rules"
  ".txt"
)
SCRIPT_NAME="$(basename "$0")"

# Target file extensions as specified in requirements
ALLOWED_EXTENSIONS=("sh" "js" "jsx" "ts" "tsx" "py" "css" "html" "json" "test" "tsx")
TEST_FILE_PATTERNS=("*.test.js" "*.test.ts" "*.test.tsx")

# Build find command with proper exclusion and file filtering
find_cmd=(find .)

# Build exclusion part with wildcard patterns to catch nested directories
if [ "${#EXCLUDE_DIRS[@]}" -gt 0 ]; then
    find_cmd+=( \( )
    for d in "${EXCLUDE_DIRS[@]}"; do
        find_cmd+=( -path "*/$d" -o -path "./$d" -o )
    done
    # Remove last -o and close exclusion group
    unset 'find_cmd[${#find_cmd[@]}-1]'
    find_cmd+=( \) -prune -o )
fi

# Include only target file types
find_cmd+=( \( )
for ext in "${ALLOWED_EXTENSIONS[@]}"; do
    find_cmd+=( -name "*.$ext" -o )
done
# Add test file patterns
for pattern in "${TEST_FILE_PATTERNS[@]}"; do
    find_cmd+=( -name "$pattern" -o )
done
# Remove last -o and close group
unset 'find_cmd[${#find_cmd[@]}-1]'
find_cmd+=( \) )

# Exclude this script itself and ensure files only
find_cmd+=( ! -name "$SCRIPT_NAME" -type f -print )

mapfile -t IN_SCOPE_FILES < <("${find_cmd[@]}")

declare -A ext_count=()
for file in "${IN_SCOPE_FILES[@]}"; do
    filename="${file##*/}"
    if [[ "$filename" == *.* ]]; then
        ext="${filename##*.}"
    else
        ext="no_extension"
    fi
    ext_count["$ext"]=$((ext_count["$ext"]+1))
done

# Enhanced progress display function
show_progress() {
    local current=$1
    local total=$2
    local percent=$((current * 100 / total))
    local bar_length=30
    local filled=$((percent * bar_length / 100))
    local empty=$((bar_length - filled))

    printf "\r["
    printf "%*s" "$filled" "" | tr ' ' '█'
    printf "%*s" "$empty" "" | tr ' ' '░'
    printf "] %3d%% (%d/%d)" "$percent" "$current" "$total"
}

echo ""
echo "=== JYOTISH SHASTRA - FAKE CODE DETECTION REPORT ==="
echo "Project: $ROOT_DIR"
echo "Scan Date: $(date '+%Y-%m-%d %H:%M:%S')"
echo ""
echo "FILE INVENTORY:"
total_files=${#IN_SCOPE_FILES[@]}
declare -A type_groups=()
for ext in "${!ext_count[@]}"; do
    count=${ext_count[$ext]}
    case "$ext" in
        js|jsx|ts|tsx) type_groups["JavaScript/TypeScript"]=$((type_groups["JavaScript/TypeScript"] + count)) ;;
        py) type_groups["Python"]=$((type_groups["Python"] + count)) ;;
        css|html) type_groups["CSS/HTML"]=$((type_groups["CSS/HTML"] + count)) ;;
        sh) type_groups["Shell Scripts"]=$((type_groups["Shell Scripts"] + count)) ;;
        json) type_groups["JSON"]=$((type_groups["JSON"] + count)) ;;
        *) type_groups["Other"]=$((type_groups["Other"] + count)) ;;
    esac
done

for group in "JavaScript/TypeScript" "Python" "CSS/HTML" "Shell Scripts" "JSON" "Other"; do
    count=${type_groups["$group"]:-0}
    if [ "$count" -gt 0 ]; then
        printf "├── %s: %d files\n" "$group" "$count"
    fi
done
echo "└── Total: $total_files files"
echo ""

declare -A file_count=()
declare -A pattern_count=()
total_count=0
detection_results=()

total=${#IN_SCOPE_FILES[@]}
if [ "$total" -eq 0 ]; then
    echo "No files to scan."
else
    echo "SCANNING PROGRESS:"
    i=0
    for file in "${IN_SCOPE_FILES[@]}"; do
        i=$((i+1))
        show_progress "$i" "$total"

        for pattern in "${PATTERNS[@]}"; do
            while IFS=':' read -r fname line content; do
                # Clean up content and determine file type
                clean_content=$(echo "$content" | sed 's/^[[:space:]]*//' | sed 's/[[:space:]]*$//')
                if [[ "$fname" == *.* ]]; then
                    ext="${fname##*.}"
                else
                    ext="no_ext"
                fi

                # Store detection result
                detection_results+=("$fname:$line:$clean_content:$ext:$pattern")
                file_count["$fname"]=$((file_count["$fname"]+1))
                pattern_count["$pattern"]=$((pattern_count["$pattern"]+1))
                total_count=$((total_count+1))
            done < <(grep -nH -E "$pattern" "$file" 2>/dev/null)
        done
    done
    printf "\n"
    echo "✓ Scan completed: $i files processed"
fi

echo ""
if [ ${#file_count[@]} -eq 0 ]; then
    echo "SCAN RESULTS:"
    echo "✓ No fake code patterns detected in $total_files files"
    echo ""
    echo "RECOMMENDATION:"
    echo "✓ Codebase appears clean - no immediate action required"
else
    echo "DETECTION RESULTS:"
    echo "┌─ High Priority Issues ($total_count detections across ${#file_count[@]} files)"

    # Show top 10 detections with details
    detection_count=0
    for result in "${detection_results[@]}"; do
        if [ "$detection_count" -lt 10 ]; then
            IFS=':' read -r fname line content ext pattern <<< "$result"
            printf "├─ %s:%s [%s] %s\n" "$fname" "$line" "$pattern" "$content"
            detection_count=$((detection_count+1))
        fi
    done

    if [ "$total_count" -gt 10 ]; then
        echo "└─ ... and $((total_count - 10)) more detections"
    else
        echo "└─ End of detections"
    fi

    echo ""
    echo "PATTERN FREQUENCY ANALYSIS:"
    for pattern in "${!pattern_count[@]}"; do
        count=${pattern_count[$pattern]}
        printf "├── %s: %d occurrences\n" "$pattern" "$count"
    done | sort -rn -t':' -k2

    echo ""
    echo "FILES WITH MOST ISSUES:"
    for fname in "${!file_count[@]}"; do
        echo "${file_count[$fname]}|$fname"
    done | sort -rn -t'|' -k1 | head -5 | while IFS='|' read -r cnt fname; do
        printf "├── %s: %d issues\n" "$fname" "$cnt"
    done

    echo ""
    echo "RECOMMENDATIONS:"
    echo "✓ Review $total_count fake code instances across ${#file_count[@]} files"

    # Priority recommendations based on patterns found
    if [ "${pattern_count[mock]:-0}" -gt 0 ] || [ "${pattern_count[fake]:-0}" -gt 0 ] || [ "${pattern_count[dummy]:-0}" -gt 0 ]; then
        echo "✓ Priority: Address mock implementations in core modules"
    fi
    if [ "${pattern_count[TODO]:-0}" -gt 0 ] || [ "${pattern_count[FIXME]:-0}" -gt 0 ]; then
        echo "✓ Priority: Complete pending TODO/FIXME items"
    fi
    if [ "${pattern_count[Placeholder]:-0}" -gt 0 ] || [ "${pattern_count[temporary]:-0}" -gt 0 ]; then
        echo "✓ Priority: Replace placeholder implementations"
    fi

    # Estimate cleanup time
    estimated_hours=$((total_count / 60))
    if [ "$estimated_hours" -lt 1 ]; then
        estimated_hours=1
    fi
    echo "✓ Estimated cleanup time: $estimated_hours-$((estimated_hours + 1)) hours"
fi

echo ""
echo "=== SCAN COMPLETE ==="
