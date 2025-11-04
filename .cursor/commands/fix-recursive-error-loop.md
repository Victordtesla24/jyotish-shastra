# fix-errors — Repeat-Until-Green Error Fix Loop

## Paste these inputs when you run this
- **Test summary output** (full, from your latest run)
- **How to run verification** (paste the exact commands you want executed)
```bash
# From repo root:
NON_INTERACTIVE=true node tests/ui/debug-manual-form-comprehensive.cjs --non-interactive
npm run test
npm run typecheck
npm run lint
npm run build
````

* **Architecture/API/UI docs** (prefer real Cursor @Docs handles; otherwise list relative paths)

```text
docs/api/chart-generation-requirements.md
docs/ui/detailed-ui-architecture.md
docs/architecture/system-architecture.md
docs/architecture/project-structure.md
docs/api/validation-guide.md
docs/api/endpoint-ui-mapping-inventory.md
docs/api/geocode-generation-requirements.md
docs/architecture/INTEGRATION_GUIDE.md
docs/architecture/user-data-flows.md
docs/api/chart-rendering-requirements.md
docs/BPHS-BTR/BPHS_Birth_Time_Rectification_Implementation_Plan.md
docs/deployment/render-deployment-guide.md
```

## Objective

Fix every error systematically, one by one, until **no errors remain**. Produce **production-grade** changes (no mocks/placeholders/fallbacks in app paths), and maintain an auditable **Error Trail**.

## Policy

* Use `.cursor/rules/` guard-rails.
* Research only with **official, indexed docs** (`@` handles) or the listed internal docs. If a needed official doc isn’t indexed, **pause and ask to add it**, then continue.

## **Working checklist**  (Must be maintained by the agent every cycle)
```markdown
* [ ] **Parse failures** → rank by dependency/criticality
* [ ] **Pick top unchecked failure**
* [ ] **Root-cause & impact trace** (end-to-end)   
* [ ] **Minimal, targeted fix plan** (no scope creep)
* [ ] **Implement fix** + add/adjust tests if coverage is insufficient
* [ ] **Verify**: **UI script**, **tests**, **typecheck**, **lint**, **production build**
* [ ] **If similar error persists** ≥3 attempts → **Research Pass (official docs only)** → revise plan
* [ ] **Append entry to** `tests/ui/test-logs/manual-form-comprehensive-error-logs-YYYY-MM-DD.md` (Must be created if missing)
* [ ] **Mark current failure done** → repeat for next
```

## Loop (repeat until all green)

1. **Collect & Rank Failures**

   * Parse test summary; build a failure checklist with hypothesised causes and dependencies.
2. **Root-Cause & Impact Analysis**

   * Trace the flow (UI → service → API → DB/cache). Identify exact files/functions/lines. Describe *why* it broke.
3. **Targeted Fix Plan (Minimal Diff)**
   ```markdown
   * Propose the smallest safe change set. Cross-check Architecture/API/UI docs and invariants.
4. **Implement Fix**

   * Edit only implicated code. Keep patterns consistent. If tests are weak, add/adjust just enough tests to prove the fix.
5. **Verification Gate (must pass)**

   * Run the verification commands provided above (UI script + tests + typecheck + lint + build).
   * If anything fails, capture fresh evidence and loop back to Step 2.
   * If the **same class of error** repeats ≥3 attempts, perform a **Research Pass**:

     * Use only official @Docs (or the provided internal docs); cite the exact section in the Error Trail.
     * Update plan accordingly, then continue at Step 4.
6. **Closure Criteria (for the current failure)**

   * The failure’s tests pass; no regressions; prod build OK; runtime paths free of mocks/placeholders/fallbacks.
   * Append Error Trail entry with: Fix Summary, Files Touched, Why It Works, Verification Evidence.
7. **Next Failure**

   * Move to the next checklist item. Do **not** declare completion until **all** failures resolved and verification passes.

## Outputs each cycle

* **Updated checklist** with current item ✔/✖
* **Diff summary** (files/lines changed)
* **Verification results** (UI script/tests/typecheck/lint/build) summarized
* **Error Trail append** (path + sections)

## Non-negotiables

* **No “green by mocking” in runtime code.**
* **No guessing contracts—align with Architecture/API/UI docs or pause to index the official doc.**   
* **No “task complete” until **everything** (UI script + tests + build) is green.**

## **One-minute sanity checklist**
- [ ] File saved as `.cursor/commands/fix-errors.md`  
- [ ] No parentheses around fenced code blocks  
- [ ] Docs list uses **either** real `@` handles **or** plain relative paths (not `@docs/...`)  
- [ ] `tests/ui/test-logs/` exists (or the agent is told to create it)  
- [ ] `npm run test|typecheck|lint|build` exist in `package.json`  

