0

### Directory Management Protocol

**Objective:** To organize, consolidate, and maintain the project's directory structure according to established conventions, ensuring code clarity, eliminating redundancy, and preserving functionality.

**Pre- and Post-Requisites:**
*   Utilize version control (e.g., `git stash` or branch) before initiating significant changes.
*   Follow all related protocols (`@my-error-fixing-protocols.mdc`) with absolute precision if errors arise during or after changes.

**Protocol Steps:**

1.  **Determine & Adhere to Project Structure Conventions:**
    *   Identify the established directory structure by checking:
        *   Known framework conventions (e.g., Next.js, Django, Flask).
        *   Project documentation (e.g., `README.md`, `CONTRIBUTING.md`).
        *   Existing patterns in the majority of the codebase.
        *   Configuration files (`.editorconfig`, linter configs).
    *   If conventions are unclear or conflicting, ask the user for clarification.
    *   Ensure all actions comply with VERCEL (or equivalent) deployment best practices regarding structure.

2.  **Comprehensive File Scan & Inventory:**
    *   Recursively scan the entire repository to build an inventory of files, modules, scripts, and configurations.
    *   **Exclude:** `node_modules/`, `.venv/`, `.git/`, `.cursor/`, `.vscode/`, `build/`, `dist/`, `coverage/`, and any paths listed in `.gitignore`.
3.  **Duplicate/Overlap Detection & Consolidation:**
    *   **Strict Prohibition:** ***Never*** create a new file, script, or module if an existing one serves the same or a significantly overlapping purpose. This includes files with different names but similar functionality.
    *   **Detection Heuristics:** Identify potential duplicates/overlaps by analyzing:
        *   Exact file content matches.
        *   High code similarity scores (conceptual).
        *   Similar filenames or naming patterns.
        *   Matching function/class signatures and primary exports.
        *   Similar import dependencies.
        *   Similar core logic or purpose described in comments/docs.
    *   **Consolidation:** If duplicate or overlapping code/files are found:
        *   Determine the **canonical version** (prefer established locations, more complete implementations, or ask the user if ambiguous).
        *   Carefully **merge** necessary unique functionalities into the canonical version.
        *   **Remove** the redundant file(s)/code block(s).
    *   **User Approval:** ***Always*** solicit explicit user approval before creating any new file/module if there's a moderate-to-high confidence of functional overlap with existing code, or if ambiguity exists.

4.  **Strict "No Unrequested Files" Policy:**
    *   ***Do not*** create/generate any files, scripts, or code (even with different names) ***unless***:
        a. The user has explicitly requested the creation of that specific new file/module.
        b. The AI determines creation is *critically necessary* to fulfill the user's primary request *and* no existing file can be appropriately modified, *and* this necessity is confirmed with the user.

5.  **Correct Placement, Renaming & Reference Updates:**
    *   Relocate or rename any misplaced file/directory to conform to the established project structure (identified in Step 1).
    *   **Atomically Update References:** Immediately after moving or renaming, update *all* references across the codebase, including:
        *   Code imports/exports (`import`, `require`, `export`, etc.).
        *   Configuration files (`package.json`, `tsconfig.json`, `pyproject.toml`, CI/CD pipelines, etc.).
        *   Build scripts.
        *   Documentation (`.md` files referencing file paths).
        *   Test files.

6.  **Import & Path Integrity Verification:**
    *   After any move, rename, merge, or deletion:
        *   Run linters and static analysis tools to catch path issues.
        *   Attempt to build/compile the project.
        *   If any errors (import, path, build, etc.) occur, immediately invoke the **Error Fixing Protocol** (`@my-error-fixing-protocols.mdc`), specifically using the **Recursive Import Error Fixing Algorithm** if applicable, aiming for resolution within two attempts per error.

7.  **Clean-Up of Redundant Assets:**
    *   Identify and remove orphaned, unused, or superseded files, code blocks, and configuration entries resulting from consolidation or refactoring.
    *   **Verify Removal:** Double-check (e.g., using code search, `git grep`) that no residual references exist to the deleted items anywhere in the codebase or configuration.

8.  **Preserve Functionality (Zero Regression):**
    *   Ensure that all directory management actions do not alter existing functionality.
    *   Run all relevant unit, integration, and end-to-end test suites. All existing tests must pass.
    *   If test coverage is low for affected areas, perform manual sanity checks on core workflows or ask the user to verify.

9.  **Refactoring Large or Non-Cohesive Files:**
    *   Identify files that are overly long (e.g., exceeding ~600 lines) OR exhibit low cohesion / multiple distinct responsibilities.
    *   Propose a refactoring plan to the user to break the file into smaller, single-responsibility modules/components, adhering strictly to project structure and avoiding new duplication.
    *   Proceed with refactoring only after user approval, applying steps 5-8 for each new/modified file.

10. **Final Verification & Documentation:**
    *   Perform a final run of all relevant test suites and linters to confirm project health.
    *   Record a summary of significant structural changes (moves, merges, deletions, major refactoring) in the Memory Bank or as part of the commit message(s) for traceability. Use clear, atomic commits in VCS for distinct changes.

---

> **Critical Constraints (Mandatory Adherence)**
>   - **No Functionality Change:** Functionality may not be added or removed beyond the specific goal of organization, consolidation, or approved refactoring. Focus is on structure and eliminating redundancy.
>   - **Atomicity & Verification:** Apply changes in small, logical, atomic steps (e.g., move + update refs = one step). Verify integrity (linting, tests, build) immediately after each step. Use VCS checkpoints.
>   - **User Confirmation:** **Always** confirm with the user before:
>       *   Creating any new file/module suspected of overlapping with existing functionality.
>       *   Deleting files (especially if not obvious duplicates).
>       *   Undertaking major refactoring (Rule 9).
>   - **Strict Adherence:** Follow all protocol steps precisely. Do not introduce unrelated changes.

