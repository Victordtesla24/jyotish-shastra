#!/usr/bin/env bash
##############################################################################
#  count-files.sh - Fixed Version
#
#  Tree-style file inventory with proper directory exclusion
#  Works on macOS BSD tools and Linux GNU tools
#  Properly excludes vendor/build directories at any depth
##############################################################################
set -euo pipefail

# ---------------------------------------------------------------------------
# 1. CONFIGURATION
# ---------------------------------------------------------------------------
EXCLUDE_DIRS=(
  "node_modules"
  "client/node_modules"
  "venv"
  ".venv"
  "logs"
  ".vscode"
  ".cursor"
  ".clinerules"
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

# Pick the best available awk
AWK_CMD=$(command -v gawk 2>/dev/null || command -v awk)

# ---------------------------------------------------------------------------
# 2. BUILD EXCLUSION LOGIC
# ---------------------------------------------------------------------------
build_find_excludes() {
  local excludes=()
  for dir in "${EXCLUDE_DIRS[@]}"; do
    excludes+=(-path "*/$dir" -prune -o)
    excludes+=(-name "$dir" -prune -o)
  done
  printf '%s ' "${excludes[@]}"
}

# ---------------------------------------------------------------------------
# 3. MAIN SCRIPT
# ---------------------------------------------------------------------------
echo "Building file inventory (excluding: ${EXCLUDE_DIRS[*]})"

# Use eval to properly expand the exclusion arguments
# shellcheck disable=SC2016
eval "find . $(build_find_excludes) -type f -print" | "$AWK_CMD" '
BEGIN {
    FS = "/"
    total_files = 0
}

# Main processing block to gather data
{
    gsub(/^\.\//, "", $0)
    if ($0 == "") next

    filepath = $0
    total_files++

    num_parts = split(filepath, parts, "/")
    filename = parts[num_parts]

    directory = "."
    if (num_parts > 1) {
        directory = parts[1]
        for (i = 2; i < num_parts; i++) {
            directory = directory "/" parts[i]
        }
    }

    ext_pos = match(filename, /\.[^.]+$/)
    extension = ext_pos ? substr(filename, ext_pos) : "no_ext"

    dir_files[directory]++
    dir_exts[directory, extension]++
    all_extensions[extension] = 1

    # Store directory hierarchy
    if (directory != ".") {
        current_path = ""
        for (i = 1; i < num_parts; i++) {
            parent = (i == 1) ? "." : current_path
            current_path = (i == 1) ? parts[i] : current_path "/" parts[i]
            children[parent, current_path] = 1
        }
    }
}

# Helper to sort an array and return a space-separated string
function get_sorted_keys_str(arr,    local_keys, n, i, j, temp, result) {
    n = 0
    for (key in arr) local_keys[++n] = key

    for (i = 1; i <= n; i++) {
        for (j = i + 1; j <= n; j++) {
            if (local_keys[i] > local_keys[j]) {
                temp = local_keys[i]; local_keys[i] = local_keys[j]; local_keys[j] = temp
            }
        }
    }

    result = ""
    for (i = 1; i <= n; i++) {
        result = result (i > 1 ? " " : "") local_keys[i]
    }
    return result
}

# Recursive print function
function print_dir(dir, prefix,    # Local variables
                   display_name, parts, file_count,
                   child_list_str, child_list, num_children, i,
                   ext_list_str, ext_list, num_exts, j, ext_name, count,
                   is_last, ext_display_str, current_children, current_exts) {

    split(dir, parts, "/")
    display_name = parts[length(parts)]

    file_count = dir_files[dir] ? dir_files[dir] : 0

    delete current_exts
    for (ext_key in dir_exts) {
        split(ext_key, parts, SUBSEP)
        if (parts[1] == dir) current_exts[parts[2]] = 1
    }
    ext_list_str = get_sorted_keys_str(current_exts)
    num_exts = split(ext_list_str, ext_list, " ")
    if (ext_list_str == "") num_exts = 0

    ext_display_str = ""
    if (file_count > 0) {
        for (i = 1; i <= num_exts; i++) {
            ext_display_str = ext_display_str (i > 1 ? ", " : "") "\"" ext_list[i] "\""
        }
    } else {
        ext_display_str = "\"empty dir\""
    }

    printf "%s (Total files: %d | File types: %s)\n", display_name, file_count, ext_display_str

    delete current_children
    for (child_key in children) {
        split(child_key, parts, SUBSEP)
        if (parts[1] == dir) current_children[parts[2]] = 1
    }
    child_list_str = get_sorted_keys_str(current_children)
    num_children = split(child_list_str, child_list, " ")
    if (child_list_str == "") num_children = 0

    for (i = 1; i <= num_children; i++) {
        is_last = (i == num_children) && (num_exts == 0)
        printf "%s%s", prefix, (is_last ? "└── " : "├── ")
        print_dir(child_list[i], prefix (is_last ? "    " : "│   "))
    }

    for (j = 1; j <= num_exts; j++) {
        is_last = (j == num_exts)
        ext_name = ext_list[j]
        count = dir_exts[dir, ext_name]
        printf "%s%s\"%s\": %d file%s\n", prefix, (is_last ? "└── " : "├── "), ext_name, count, (count > 1 ? "s" : "")
    }
}

END {
    print "## FILE COUNTS:"

    # Print root header
    all_ext_str = get_sorted_keys_str(all_extensions)
    split(all_ext_str, all_ext_list, " ")
    ext_display_str = ""
    for (i = 1; i <= length(all_ext_list); i++) {
        ext_display_str = ext_display_str (i > 1 ? ", " : "") "\"" all_ext_list[i] "\""
    }
    printf ". (Total files: %d | File types: %s)\n", total_files, ext_display_str

    # Get root children and extensions
    delete root_children
    for (child_key in children) {
        split(child_key, parts, SUBSEP)
        if (parts[1] == ".") root_children[parts[2]] = 1
    }
    root_child_str = get_sorted_keys_str(root_children)
    num_root_children = split(root_child_str, root_child_list, " ")
    if (root_child_str == "") num_root_children = 0

    delete root_exts
    for (ext_key in dir_exts) {
        split(ext_key, parts, SUBSEP)
        if (parts[1] == ".") root_exts[parts[2]] = 1
    }
    root_ext_str = get_sorted_keys_str(root_exts)
    num_root_exts = split(root_ext_str, root_ext_list, " ")
    if (root_ext_str == "") num_root_exts = 0

    # Print root children
    total_items = num_root_children + num_root_exts
    item_count = 0
    for (i = 1; i <= num_root_children; i++) {
        item_count++
        is_last = (item_count == total_items)
        printf "%s", (is_last ? "└── " : "├── ")
        print_dir(root_child_list[i], (is_last ? "    " : "│   "))
    }

    # Print root extensions
    for (j = 1; j <= num_root_exts; j++) {
        item_count++
        is_last = (item_count == total_items)
        ext_name = root_ext_list[j]
        count = dir_exts[".", ext_name]
        printf "%s\"%s\": %d file%s\n", (is_last ? "└── " : "├── "), ext_name, count, (count > 1 ? "s" : "")
    }

    # Print final summary
    printf "└── \"Total Files\": %d files\n", total_files
}
'
