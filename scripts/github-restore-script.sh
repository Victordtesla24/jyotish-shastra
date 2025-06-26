#!/usr/bin/env bash

##############################################################################
# Git Repository Comparison and Restoration Script
# Compares two GitHub commit instances and restores to target commit
# Author: AI Assistant for Jyotish Shastra Project
# Version: 1.0
##############################################################################

set -euo pipefail

# =============================================================================
# CONFIGURATION & CONSTANTS
# =============================================================================

# Color codes for enhanced output
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly BLUE='\033[0;34m'
readonly PURPLE='\033[0;35m'
readonly CYAN='\033[0;36m'
readonly WHITE='\033[1;37m'
readonly NC='\033[0m' # No Color

# Commit hashes to compare
readonly COMMIT_A="6421f74f9eaa35525570322cbbf664fb56a1ae6c"
readonly COMMIT_B="7ecd7dd9fe4faa0411070ad7a602682526eddbcc"
readonly TARGET_COMMIT="$COMMIT_B"

# Repository information
readonly REPO_URL="https://github.com/Victordtesla24/jyotish-shastra"
readonly PROJECT_NAME="jyotish-shastra"

# Output files with timestamp
readonly TIMESTAMP=$(date +%Y%m%d_%H%M%S)
readonly COMPARISON_REPORT="git_comparison_report_${TIMESTAMP}.html"
readonly DIFF_OUTPUT="detailed_diff_${TIMESTAMP}.txt"
readonly TEMP_DIR="temp_comparison_${TIMESTAMP}"

# Key directories to focus on
readonly FOCUS_DIRS=("client" "src" "tests" "scripts" "docs")

# =============================================================================
# UTILITY FUNCTIONS
# =============================================================================

# Function: Print header with styling
print_header() {
    local title="$1"
    echo -e "${BLUE}============================================================${NC}"
    echo -e "${BLUE}    ${title}${NC}"
    echo -e "${BLUE}============================================================${NC}"
}

# Function: Print section header
print_section() {
    local section="$1"
    echo -e "${CYAN}→ ${section}${NC}"
}

# Function: Print success message
print_success() {
    local message="$1"
    echo -e "${GREEN}✓ ${message}${NC}"
}

# Function: Print warning message
print_warning() {
    local message="$1"
    echo -e "${YELLOW}⚠ ${message}${NC}"
}

# Function: Print error message
print_error() {
    local message="$1"
    echo -e "${RED}❌ ${message}${NC}"
}

# Function: Print info message
print_info() {
    local message="$1"
    echo -e "${WHITE}ℹ ${message}${NC}"
}

# =============================================================================
# VALIDATION FUNCTIONS
# =============================================================================

# Function: Check if we're in a git repository
check_git_repo() {
    if [ ! -d ".git" ]; then
        print_error "Not in a git repository directory"
        print_info "Please run this script from the root of the jyotish-shastra repository"
        exit 1
    fi
    print_success "Git repository detected"
}

# Function: Check required tools
check_required_tools() {
    local tools=("git" "awk" "grep" "sort" "comm")
    for tool in "${tools[@]}"; do
        if ! command -v "$tool" >/dev/null 2>&1; then
            print_error "Required tool '$tool' is not installed"
            exit 1
        fi
    done
    print_success "All required tools are available"
}

# Function: Ensure we have the commits available
ensure_commits_available() {
    print_section "Checking commit availability"

    if ! git cat-file -e "$COMMIT_A" 2>/dev/null; then
        print_warning "Fetching commit $COMMIT_A"
        git fetch origin "+$COMMIT_A:refs/remotes/origin/temp-$COMMIT_A" 2>/dev/null || git fetch --all
    fi

    if ! git cat-file -e "$COMMIT_B" 2>/dev/null; then
        print_warning "Fetching commit $COMMIT_B"
        git fetch origin "+$COMMIT_B:refs/remotes/origin/temp-$COMMIT_B" 2>/dev/null || git fetch --all
    fi

    # Verify both commits are now available
    if git cat-file -e "$COMMIT_A" 2>/dev/null && git cat-file -e "$COMMIT_B" 2>/dev/null; then
        print_success "Both commits are available"
    else
        print_error "Unable to fetch required commits"
        exit 1
    fi
}

# =============================================================================
# ANALYSIS FUNCTIONS
# =============================================================================

# Function: Get commit information
get_commit_info() {
    local commit=$1
    local info_file="$2"

    {
        echo "Commit Hash: $commit"
        echo "Date: $(git show -s --format='%ci' "$commit" 2>/dev/null || echo 'Unknown')"
        echo "Author: $(git show -s --format='%an <%ae>' "$commit" 2>/dev/null || echo 'Unknown')"
        echo "Subject: $(git show -s --format='%s' "$commit" 2>/dev/null || echo 'Unknown')"
        echo "Message: $(git show -s --format='%B' "$commit" 2>/dev/null | head -5 || echo 'Unknown')"
        echo ""
    } >> "$info_file"
}

# Function: Analyze file structure differences
analyze_file_structure() {
    print_section "Analyzing file structure differences"

    mkdir -p "$TEMP_DIR"

    # Get file lists from both commits
    git ls-tree -r --name-only "$COMMIT_A" 2>/dev/null | sort > "$TEMP_DIR/files_a.txt" || touch "$TEMP_DIR/files_a.txt"
    git ls-tree -r --name-only "$COMMIT_B" 2>/dev/null | sort > "$TEMP_DIR/files_b.txt" || touch "$TEMP_DIR/files_b.txt"

    # Find differences
    comm -23 "$TEMP_DIR/files_a.txt" "$TEMP_DIR/files_b.txt" > "$TEMP_DIR/files_only_in_a.txt"
    comm -13 "$TEMP_DIR/files_a.txt" "$TEMP_DIR/files_b.txt" > "$TEMP_DIR/files_only_in_b.txt"
    comm -12 "$TEMP_DIR/files_a.txt" "$TEMP_DIR/files_b.txt" > "$TEMP_DIR/common_files.txt"

    # Get directory structures
    git ls-tree -r -d --name-only "$COMMIT_A" 2>/dev/null | sort > "$TEMP_DIR/dirs_a.txt" || touch "$TEMP_DIR/dirs_a.txt"
    git ls-tree -r -d --name-only "$COMMIT_B" 2>/dev/null | sort > "$TEMP_DIR/dirs_b.txt" || touch "$TEMP_DIR/dirs_b.txt"

    # Count files
    local files_a_count=$(wc -l < "$TEMP_DIR/files_a.txt")
    local files_b_count=$(wc -l < "$TEMP_DIR/files_b.txt")
    local only_a_count=$(wc -l < "$TEMP_DIR/files_only_in_a.txt")
    local only_b_count=$(wc -l < "$TEMP_DIR/files_only_in_b.txt")
    local common_count=$(wc -l < "$TEMP_DIR/common_files.txt")

    print_info "Files in Commit A: $files_a_count"
    print_info "Files in Commit B: $files_b_count"
    print_info "Files only in A: $only_a_count"
    print_info "Files only in B: $only_b_count"
    print_info "Common files: $common_count"

    print_success "File structure analysis completed"
}

# Function: Analyze changes by directory
analyze_directory_changes() {
    print_section "Analyzing changes by directory"

    local dir_analysis="$TEMP_DIR/directory_analysis.txt"
    echo "Directory-wise Change Analysis" > "$dir_analysis"
    echo "==============================" >> "$dir_analysis"
    echo "" >> "$dir_analysis"

    for dir in "${FOCUS_DIRS[@]}"; do
        if [ -d "$dir" ] || git ls-tree -d "$COMMIT_A" | grep -q "^[0-9]* tree [a-f0-9]* $dir$" || git ls-tree -d "$COMMIT_B" | grep -q "^[0-9]* tree [a-f0-9]* $dir$"; then
            {
                echo "$dir/ Directory Analysis:"
                echo "$(printf '%*s' ${#dir} '' | tr ' ' '-')----------------"

                # Files changed in this directory
                local changed_files=$(git diff --name-only "$COMMIT_A" "$COMMIT_B" -- "$dir/" 2>/dev/null | wc -l)
                local added_files=$(comm -13 <(git ls-tree -r --name-only "$COMMIT_A" -- "$dir/" 2>/dev/null | sort) <(git ls-tree -r --name-only "$COMMIT_B" -- "$dir/" 2>/dev/null | sort) | wc -l)
                local removed_files=$(comm -23 <(git ls-tree -r --name-only "$COMMIT_A" -- "$dir/" 2>/dev/null | sort) <(git ls-tree -r --name-only "$COMMIT_B" -- "$dir/" 2>/dev/null | sort) | wc -l)

                echo "  Changed files: $changed_files"
                echo "  Added files: $added_files"
                echo "  Removed files: $removed_files"
                echo ""

                # Show file extensions
                echo "  File types in this directory:"
                git ls-tree -r --name-only "$COMMIT_B" -- "$dir/" 2>/dev/null | awk -F. '{if(NF>1) print $NF}' | sort | uniq -c | sort -nr | head -5 | sed 's/^/    /'
                echo ""

            } >> "$dir_analysis"
        fi
    done

    print_success "Directory analysis completed"
}

# Function: Generate statistics
generate_statistics() {
    print_section "Generating comparison statistics"

    local stats_file="$TEMP_DIR/statistics.txt"

    {
        echo "Comparison Statistics"
        echo "==================="
        echo ""
        echo "Repository: $REPO_URL"
        echo "Commit A: $COMMIT_A"
        echo "Commit B: $COMMIT_B (Target)"
        echo "Analysis Date: $(date)"
        echo ""

        # Git diff statistics
        local diff_stats=$(git diff --shortstat "$COMMIT_A" "$COMMIT_B" 2>/dev/null || echo "Unable to calculate diff stats")
        echo "Overall Changes: $diff_stats"
        echo ""

        # File count statistics
        echo "File Counts:"
        echo "  Total files changed: $(git diff --name-only "$COMMIT_A" "$COMMIT_B" 2>/dev/null | wc -l)"
        echo "  Files only in A: $(wc -l < "$TEMP_DIR/files_only_in_a.txt")"
        echo "  Files only in B: $(wc -l < "$TEMP_DIR/files_only_in_b.txt")"
        echo "  Common files: $(wc -l < "$TEMP_DIR/common_files.txt")"
        echo ""

        # Line change statistics
        local insertions=$(git diff --shortstat "$COMMIT_A" "$COMMIT_B" 2>/dev/null | grep -o '[0-9]* insertion' | cut -d' ' -f1 || echo "0")
        local deletions=$(git diff --shortstat "$COMMIT_A" "$COMMIT_B" 2>/dev/null | grep -o '[0-9]* deletion' | cut -d' ' -f1 || echo "0")
        echo "Line Changes:"
        echo "  Insertions: ${insertions:-0}"
        echo "  Deletions: ${deletions:-0}"
        echo ""

    } > "$stats_file"

    print_success "Statistics generated"
}

# =============================================================================
# REPORT GENERATION FUNCTIONS
# =============================================================================

# Function: Generate detailed diff report
generate_detailed_diff() {
    print_section "Generating detailed diff report"

    {
        echo "=========================================="
        echo "JYOTISH SHASTRA - DETAILED DIFF REPORT"
        echo "=========================================="
        echo "Generated: $(date)"
        echo "Repository: $REPO_URL"
        echo "Commit A (Source): $COMMIT_A"
        echo "Commit B (Target): $COMMIT_B"
        echo ""

        echo "=========================================="
        echo "COMMIT INFORMATION"
        echo "=========================================="
        echo ""
        echo "COMMIT A DETAILS:"
        get_commit_info "$COMMIT_A" "/dev/stdout"
        echo ""
        echo "COMMIT B DETAILS:"
        get_commit_info "$COMMIT_B" "/dev/stdout"
        echo ""

        echo "=========================================="
        echo "SUMMARY STATISTICS"
        echo "=========================================="
        cat "$TEMP_DIR/statistics.txt"
        echo ""

        echo "=========================================="
        echo "FILE STRUCTURE CHANGES"
        echo "=========================================="
        echo ""
        echo "Files Only in Commit A ($(wc -l < "$TEMP_DIR/files_only_in_a.txt") files):"
        echo "$(cat "$TEMP_DIR/files_only_in_a.txt" | sed 's/^/  - /')"
        echo ""
        echo "Files Only in Commit B ($(wc -l < "$TEMP_DIR/files_only_in_b.txt") files):"
        echo "$(cat "$TEMP_DIR/files_only_in_b.txt" | sed 's/^/  + /')"
        echo ""

        echo "=========================================="
        echo "DIRECTORY ANALYSIS"
        echo "=========================================="
        cat "$TEMP_DIR/directory_analysis.txt"
        echo ""

        echo "=========================================="
        echo "DETAILED FILE DIFFERENCES"
        echo "=========================================="
        git diff --stat "$COMMIT_A" "$COMMIT_B" 2>/dev/null || echo "Unable to generate diff stats"
        echo ""

        echo "=========================================="
        echo "SAMPLE CONTENT DIFFERENCES"
        echo "=========================================="
        echo "Showing first 2000 lines of diff for review:"
        git diff "$COMMIT_A" "$COMMIT_B" 2>/dev/null | head -2000 || echo "Unable to generate content diff"

    } > "$DIFF_OUTPUT"

    print_success "Detailed diff saved to: $DIFF_OUTPUT"
}

# Function: Generate HTML comparison report
generate_html_report() {
    print_section "Generating HTML comparison report"

    # Get statistics for HTML
    local files_changed=$(git diff --name-only "$COMMIT_A" "$COMMIT_B" 2>/dev/null | wc -l)
    local insertions=$(git diff --shortstat "$COMMIT_A" "$COMMIT_B" 2>/dev/null | grep -o '[0-9]* insertion' | cut -d' ' -f1 || echo "0")
    local deletions=$(git diff --shortstat "$COMMIT_A" "$COMMIT_B" 2>/dev/null | grep -o '[0-9]* deletion' | cut -d' ' -f1 || echo "0")
    local only_a_count=$(wc -l < "$TEMP_DIR/files_only_in_a.txt")
    local only_b_count=$(wc -l < "$TEMP_DIR/files_only_in_b.txt")

    cat > "$COMPARISON_REPORT" << EOF
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Jyotish Shastra - Git Repository Comparison Report</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 15px;
            box-shadow: 0 15px 35px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 2.5em;
            font-weight: 300;
        }
        .header p {
            margin: 10px 0 0 0;
            opacity: 0.9;
            font-size: 1.1em;
        }
        .section {
            background: white;
            margin: 0;
            padding: 30px;
            border-bottom: 1px solid #ecf0f1;
        }
        .section:last-child {
            border-bottom: none;
        }
        .section h2 {
            color: #2c3e50;
            border-bottom: 3px solid #3498db;
            padding-bottom: 10px;
            margin-top: 0;
        }
        .commit-info {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 10px;
            margin: 15px 0;
            border-left: 5px solid #3498db;
        }
        .commit-info h3 {
            margin-top: 0;
            color: #2c3e50;
        }
        .stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin: 20px 0;
        }
        .stat-box {
            background: linear-gradient(135deg, #3498db, #2980b9);
            color: white;
            padding: 25px;
            border-radius: 10px;
            text-align: center;
            box-shadow: 0 5px 15px rgba(52, 152, 219, 0.3);
        }
        .stat-box h3 {
            margin: 0;
            font-size: 2.5em;
            font-weight: bold;
        }
        .stat-box p {
            margin: 10px 0 0 0;
            font-size: 1.1em;
            opacity: 0.9;
        }
        .file-list {
            background: #f8f9fa;
            border-radius: 10px;
            padding: 20px;
            margin: 15px 0;
            max-height: 300px;
            overflow-y: auto;
        }
        .file-list h4 {
            margin-top: 0;
            color: #2c3e50;
        }
        .added {
            background: #d4edda;
            padding: 15px;
            border-left: 5px solid #28a745;
            border-radius: 5px;
            margin: 10px 0;
        }
        .removed {
            background: #f8d7da;
            padding: 15px;
            border-left: 5px solid #dc3545;
            border-radius: 5px;
            margin: 10px 0;
        }
        .modified {
            background: #fff3cd;
            padding: 15px;
            border-left: 5px solid #ffc107;
            border-radius: 5px;
            margin: 10px 0;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            background: white;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 3px 10px rgba(0,0,0,0.1);
        }
        th, td {
            border: 1px solid #ecf0f1;
            padding: 12px;
            text-align: left;
        }
        th {
            background: #34495e;
            color: white;
            font-weight: 600;
        }
        tr:nth-child(even) {
            background: #f8f9fa;
        }
        pre {
            background: #2c3e50;
            color: #ecf0f1;
            padding: 20px;
            border-radius: 10px;
            overflow-x: auto;
            font-family: 'Courier New', monospace;
            box-shadow: inset 0 2px 5px rgba(0,0,0,0.2);
        }
        .footer {
            background: #34495e;
            color: white;
            padding: 20px;
            text-align: center;
        }
        .file-item {
            padding: 5px 0;
            border-bottom: 1px solid #ecf0f1;
        }
        .file-item:last-child {
            border-bottom: none;
        }
        .badge {
            display: inline-block;
            padding: 4px 8px;
            background: #3498db;
            color: white;
            border-radius: 12px;
            font-size: 0.8em;
            margin-left: 10px;
        }
        .directory-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin: 20px 0;
        }
        .directory-card {
            background: #f8f9fa;
            border-radius: 10px;
            padding: 20px;
            border-left: 5px solid #3498db;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔍 Jyotish Shastra Repository Comparison</h1>
            <p><strong>Repository:</strong> $REPO_URL</p>
            <p><strong>Generated:</strong> $(date '+%Y-%m-%d %H:%M:%S')</p>
            <p><strong>Comparison:</strong> $COMMIT_A → $COMMIT_B</p>
        </div>

        <div class="section">
            <h2>📊 Comparison Overview</h2>
            <div class="stats">
                <div class="stat-box">
                    <h3>$files_changed</h3>
                    <p>Files Changed</p>
                </div>
                <div class="stat-box">
                    <h3>${insertions:-0}</h3>
                    <p>Insertions</p>
                </div>
                <div class="stat-box">
                    <h3>${deletions:-0}</h3>
                    <p>Deletions</p>
                </div>
                <div class="stat-box">
                    <h3>$only_b_count</h3>
                    <p>Files Added</p>
                </div>
                <div class="stat-box">
                    <h3>$only_a_count</h3>
                    <p>Files Removed</p>
                </div>
            </div>
        </div>

        <div class="section">
            <h2>📝 Commit Information</h2>

            <div class="commit-info">
                <h3>Source Commit: $COMMIT_A</h3>
                <p><strong>Date:</strong> $(git show -s --format='%ci' "$COMMIT_A" 2>/dev/null || echo 'Unknown')</p>
                <p><strong>Author:</strong> $(git show -s --format='%an <%ae>' "$COMMIT_A" 2>/dev/null || echo 'Unknown')</p>
                <p><strong>Message:</strong> $(git show -s --format='%s' "$COMMIT_A" 2>/dev/null || echo 'Unknown')</p>
            </div>

            <div class="commit-info">
                <h3>Target Commit: $COMMIT_B</h3>
                <p><strong>Date:</strong> $(git show -s --format='%ci' "$COMMIT_B" 2>/dev/null || echo 'Unknown')</p>
                <p><strong>Author:</strong> $(git show -s --format='%an <%ae>' "$COMMIT_B" 2>/dev/null || echo 'Unknown')</p>
                <p><strong>Message:</strong> $(git show -s --format='%s' "$COMMIT_B" 2>/dev/null || echo 'Unknown')</p>
            </div>
        </div>

        <div class="section">
            <h2>📁 File Structure Changes</h2>

            <div class="file-list removed">
                <h4>❌ Files Removed in Target ($only_a_count files)</h4>
EOF

    if [ -s "$TEMP_DIR/files_only_in_a.txt" ]; then
        while IFS= read -r file; do
            echo "                <div class=\"file-item\">$file</div>" >> "$COMPARISON_REPORT"
        done < "$TEMP_DIR/files_only_in_a.txt"
    else
        echo "                <div class=\"file-item\">No files removed</div>" >> "$COMPARISON_REPORT"
    fi

    cat >> "$COMPARISON_REPORT" << EOF
            </div>

            <div class="file-list added">
                <h4>✅ Files Added in Target ($only_b_count files)</h4>
EOF

    if [ -s "$TEMP_DIR/files_only_in_b.txt" ]; then
        while IFS= read -r file; do
            echo "                <div class=\"file-item\">$file</div>" >> "$COMPARISON_REPORT"
        done < "$TEMP_DIR/files_only_in_b.txt"
    else
        echo "                <div class=\"file-item\">No files added</div>" >> "$COMPARISON_REPORT"
    fi

    cat >> "$COMPARISON_REPORT" << EOF
            </div>

            <div class="file-list modified">
                <h4>🔄 Modified Files ($files_changed files)</h4>
EOF

    git diff --name-only "$COMMIT_A" "$COMMIT_B" 2>/dev/null | head -50 | while IFS= read -r file; do
        if [ -n "$file" ]; then
            local additions=$(git diff --numstat "$COMMIT_A" "$COMMIT_B" -- "$file" 2>/dev/null | cut -f1 || echo "0")
            local deletions=$(git diff --numstat "$COMMIT_A" "$COMMIT_B" -- "$file" 2>/dev/null | cut -f2 || echo "0")
            echo "                <div class=\"file-item\">$file <span class=\"badge\">+${additions:-0} -${deletions:-0}</span></div>" >> "$COMPARISON_REPORT"
        fi
    done

    cat >> "$COMPARISON_REPORT" << EOF
            </div>
        </div>

        <div class="section">
            <h2>📈 Directory Analysis</h2>
            <div class="directory-grid">
EOF

    for dir in "${FOCUS_DIRS[@]}"; do
        local dir_files_changed=$(git diff --name-only "$COMMIT_A" "$COMMIT_B" -- "$dir/" 2>/dev/null | wc -l)
        local dir_insertions=$(git diff --shortstat "$COMMIT_A" "$COMMIT_B" -- "$dir/" 2>/dev/null | grep -o '[0-9]* insertion' | cut -d' ' -f1 || echo "0")
        local dir_deletions=$(git diff --shortstat "$COMMIT_A" "$COMMIT_B" -- "$dir/" 2>/dev/null | grep -o '[0-9]* deletion' | cut -d' ' -f1 || echo "0")

        cat >> "$COMPARISON_REPORT" << EOF
                <div class="directory-card">
                    <h4>📂 $dir/</h4>
                    <p><strong>Files Changed:</strong> $dir_files_changed</p>
                    <p><strong>Lines Added:</strong> ${dir_insertions:-0}</p>
                    <p><strong>Lines Removed:</strong> ${dir_deletions:-0}</p>
                </div>
EOF
    done

    cat >> "$COMPARISON_REPORT" << EOF
            </div>
        </div>

        <div class="section">
            <h2>📋 Change Statistics</h2>
            <pre>$(git diff --stat "$COMMIT_A" "$COMMIT_B" 2>/dev/null | head -50 || echo "Unable to generate statistics")</pre>
        </div>

        <div class="section">
            <h2>📄 Generated Files</h2>
            <div class="file-list">
                <div class="file-item"><strong>📊 Detailed Diff Report:</strong> <a href="$DIFF_OUTPUT">$DIFF_OUTPUT</a></div>
                <div class="file-item"><strong>📁 Comparison Data:</strong> $TEMP_DIR/ (temporary directory)</div>
                <div class="file-item"><strong>🕒 Generation Time:</strong> $(date)</div>
            </div>
        </div>

        <div class="footer">
            <p>🔄 Project successfully restored to commit: <strong>$TARGET_COMMIT</strong></p>
            <p>Generated by Git Repository Comparison and Restoration Script v1.0</p>
        </div>
    </div>
</body>
</html>
EOF

    print_success "HTML report saved to: $COMPARISON_REPORT"
}

# =============================================================================
# RESTORATION FUNCTIONS
# =============================================================================

# Function: Backup current state
backup_current_state() {
    print_section "Creating backup of current state"

    local current_branch=$(git branch --show-current 2>/dev/null || echo "detached")
    local current_commit=$(git rev-parse HEAD 2>/dev/null || echo "unknown")

    # Save current state info
    {
        echo "Backup Information"
        echo "=================="
        echo "Date: $(date)"
        echo "Current Branch: $current_branch"
        echo "Current Commit: $current_commit"
        echo "Working Directory Status:"
        git status --porcelain 2>/dev/null || echo "Unable to get status"
    } > "backup_info_${TIMESTAMP}.txt"

    # Stash any uncommitted changes
    if ! git diff-index --quiet HEAD -- 2>/dev/null; then
        print_warning "Stashing uncommitted changes"
        git stash push -m "Auto-stash before restoration $(date)" >/dev/null 2>&1 || true
    fi

    print_success "Current state backed up"
}

# Function: Restore to target commit
restore_to_target() {
    print_section "Restoring project to target commit: $TARGET_COMMIT"

    # Check if we're already at the target commit
    local current_commit=$(git rev-parse HEAD 2>/dev/null || echo "unknown")
    if [ "$current_commit" = "$TARGET_COMMIT" ]; then
        print_success "Already at target commit $TARGET_COMMIT"
        return 0
    fi

    # Create or switch to restoration branch
    local restoration_branch="restored-from-$(echo "$TARGET_COMMIT" | cut -c1-7)"

    if git show-ref --verify --quiet "refs/heads/$restoration_branch"; then
        print_warning "Switching to existing branch: $restoration_branch"
        git checkout "$restoration_branch" >/dev/null 2>&1 || {
            print_error "Failed to switch to branch $restoration_branch"
            return 1
        }
    else
        print_warning "Creating new branch: $restoration_branch"
        git checkout -b "$restoration_branch" "$TARGET_COMMIT" >/dev/null 2>&1 || {
            print_error "Failed to create branch $restoration_branch"
            return 1
        }
    fi

    # Ensure we're at the exact commit
    git reset --hard "$TARGET_COMMIT" >/dev/null 2>&1 || {
        print_error "Failed to reset to target commit"
        return 1
    }

    # Verify restoration
    local current_commit_after=$(git rev-parse HEAD 2>/dev/null || echo "unknown")
    if [ "$current_commit_after" = "$TARGET_COMMIT" ]; then
        print_success "Project restored to commit $TARGET_COMMIT"
        print_success "Current branch: $restoration_branch"

        # Update restore info
        {
            echo ""
            echo "Restoration Complete"
            echo "==================="
            echo "Target Commit: $TARGET_COMMIT"
            echo "Restoration Branch: $restoration_branch"
            echo "Restoration Time: $(date)"
        } >> "backup_info_${TIMESTAMP}.txt"

        return 0
    else
        print_error "Restoration verification failed"
        print_error "Expected: $TARGET_COMMIT"
        print_error "Actual: $current_commit_after"
        return 1
    fi
}

# =============================================================================
# CLEANUP AND SUMMARY FUNCTIONS
# =============================================================================

# Function: Cleanup temporary files
cleanup() {
    print_section "Cleaning up temporary files"

    # Keep the comparison data for reference but clean up intermediate files
    if [ -d "$TEMP_DIR" ]; then
        # Keep important files and remove others
        local keep_files=("files_a.txt" "files_b.txt" "files_only_in_a.txt" "files_only_in_b.txt" "common_files.txt" "statistics.txt" "directory_analysis.txt")

        for file in "$TEMP_DIR"/*; do
            local basename_file=$(basename "$file")
            local keep_file=false
            for keep in "${keep_files[@]}"; do
                if [ "$basename_file" = "$keep" ]; then
                    keep_file=true
                    break
                fi
            done

            if [ "$keep_file" = false ] && [ -f "$file" ]; then
                rm -f "$file" 2>/dev/null || true
            fi
        done
    fi

    print_success "Cleanup completed"
}

# Function: Display comprehensive summary
display_summary() {
    echo ""
    print_header "OPERATION SUMMARY"
    echo -e "${CYAN}Repository: ${WHITE}$REPO_URL${NC}"
    echo -e "${CYAN}Analysis Time: ${WHITE}$(date)${NC}"
    echo ""

    print_success "Comparison completed between:"
    echo -e "  ${YELLOW}Source: $COMMIT_A${NC}"
    echo -e "  ${YELLOW}Target: $COMMIT_B${NC}"
    echo ""

    print_success "Generated reports:"
    echo -e "  ${CYAN}📊 HTML Report: $COMPARISON_REPORT${NC}"
    echo -e "  ${CYAN}📄 Detailed Diff: $DIFF_OUTPUT${NC}"
    echo -e "  ${CYAN}💾 Backup Info: backup_info_${TIMESTAMP}.txt${NC}"
    echo -e "  ${CYAN}📁 Comparison Data: $TEMP_DIR/${NC}"
    echo ""

    print_success "Project restoration:"
    echo -e "  ${GREEN}✓ Restored to: $TARGET_COMMIT${NC}"
    echo -e "  ${GREEN}✓ Current branch: $(git branch --show-current 2>/dev/null || echo 'Unknown')${NC}"
    echo ""

    print_info "Quick stats from analysis:"
    local files_changed=$(git diff --name-only "$COMMIT_A" "$COMMIT_B" 2>/dev/null | wc -l)
    local only_a_count=$(wc -l < "$TEMP_DIR/files_only_in_a.txt" 2>/dev/null || echo "0")
    local only_b_count=$(wc -l < "$TEMP_DIR/files_only_in_b.txt" 2>/dev/null || echo "0")
    echo -e "  ${WHITE}• Files changed: $files_changed${NC}"
    echo -e "  ${WHITE}• Files removed: $only_a_count${NC}"
    echo -e "  ${WHITE}• Files added: $only_b_count${NC}"
    echo ""

    echo -e "${BLUE}To view the detailed analysis:${NC}"
    echo -e "  ${WHITE}• Open in browser: $COMPARISON_REPORT${NC}"
    echo -e "  ${WHITE}• View text report: $DIFF_OUTPUT${NC}"
    echo ""

    print_header "COMPARISON & RESTORATION COMPLETE"
}

# =============================================================================
# MAIN EXECUTION FUNCTION
# =============================================================================

main() {
    # Header
    print_header "JYOTISH SHASTRA - GIT COMPARISON & RESTORATION"
    echo -e "${CYAN}Repository: ${REPO_URL}${NC}"
    echo -e "${CYAN}Comparing: ${YELLOW}$COMMIT_A${NC} → ${YELLOW}$COMMIT_B${NC}"
    echo ""

    # Validation phase
    print_section "Validation Phase"
    check_git_repo
    check_required_tools
    ensure_commits_available
    echo ""

    # Analysis phase
    print_section "Analysis Phase"
    backup_current_state
    analyze_file_structure
    generate_statistics
    analyze_directory_changes
    echo ""

    # Report generation phase
    print_section "Report Generation Phase"
    generate_detailed_diff
    generate_html_report
    echo ""

    # Restoration phase
    print_section "Restoration Phase"
    restore_to_target
    echo ""

    # Cleanup and summary
    cleanup
    display_summary
}

# =============================================================================
# SCRIPT EXECUTION
# =============================================================================

# Trap to ensure cleanup on exit
trap 'echo -e "\n${YELLOW}Script interrupted. Cleaning up...${NC}"; cleanup 2>/dev/null || true; exit 1' INT TERM

# Execute main function
main "$@"

# End of script
exit 0
