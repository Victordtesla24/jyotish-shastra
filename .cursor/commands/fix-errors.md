# fix-errors — Repeat-Until-Green Loop

## Paste when you run
- **Test summary output** (latest, full)
- **How to run verification** (exact commands)
- **STRICTLY NO NEW UNNECESSARY DOCUMENTATION CREATION ALLOWED**

```shell
# From repo root:
NON_INTERACTIVE=true node tests/ui/debug-manual-form-comprehensive.cjs --non-interactive
npm run test
npm run typecheck
npm run lint
npm run build
```
```markdown
# Architecture/API/UI docs (prefer real Cursor @Docs; else relative paths)
 * docs/api/chart-generation-requirements.md
 * docs/ui/detailed-ui-architecture.md
 * docs/architecture/system-architecture.md
 * docs/architecture/project-structure.md
 * docs/api/validation-guide.md
 * docs/api/endpoint-ui-mapping-inventory.md
 * docs/api/geocode-generation-requirements.md
 * docs/architecture/INTEGRATION_GUIDE.md
 * docs/architecture/user-data-flows.md
 * docs/api/chart-rendering-requirements.md
 * docs/BPHS-BTR/BPHS_Birth_Time_Rectification_Implementation_Plan.md
 * docs/deployment/render-deployment-guide.md
```

# Objective
 * Fix errors until none remain. Ship production-grade changes (no mocks/placeholders/fallbacks in runtime paths). Maintain an auditable Error Trail. * **STRICTLY NO NEW UNNECESSARY DOCUMENTATION CREATION ALLOWED**

# Policy
Use .cursor/rules/ guard-rails.
Research only via official indexed @Docs or the list above. If a required official doc isn’t indexed, pause and ask to add it, then continue.

## Working checklist (agent updates every cycle)
* [ ] Parse failures → rank by dependency/criticality
* [ ] Pick top unchecked failure
* [ ] Root-cause & impact trace (end-to-end)
* [ ] Minimal, targeted fix plan (no scope creep)
* [ ] Implement fix + add/adjust tests if coverage is insufficient
* [ ] Verify: UI script, tests, typecheck, lint, build
* [ ] If same class persists ≥3 attempts → Research Pass (official docs only) → revise plan
* [ ] Append to tests/ui/test-logs/manual-form-comprehensive-error-logs-YYYY-MM-DD.md (create if missing)
* [ ] Mark current failure done → repeat

## Loop (repeat until all green)
 * Collect & Rank FailuresParse test summary; build a failure checklist with hypothesised causes/dependencies.
 * Root-Cause & ImpactTrace flow (UI → service → API → DB/cache). Identify files/functions/lines. State why it broke.
 * Targeted Fix Plan (minimal diff)* Propose the smallest safe change set; respect Architecture/API/UI invariants.
 * Implement FixEdit only implicated code. Keep patterns consistent. If tests are weak, add just enough to prove the fix.

## Verification Gate (must pass)
 * Run the commands above (UI script + tests + typecheck + lint + build).
 * If anything fails, capture fresh evidence and return to Step 2.
 * If the same class repeats ≥3 times, run a Research Pass using only official @Docs (or provided internals); cite the exact section in the Error Trail; update plan; resume at Step 4.

## Closure (for current failure)
 * Failure’s tests pass, no regressions, prod build OK, runtime paths free of mocks/placeholders/fallbacks.
 * Append Error Trail entry: Fix Summary, Files Touched, Why It Works, Verification Evidence.

## Next Failure
 * Move to the next checklist item. Do not declare complete until all failures resolved and verification passes.

## Outputs each cycle
 * Updated checklist (current item ✔/✖)
 * Diff summary (files/lines changed)
 * Verification results (UI script/tests/typecheck/lint/build) — brief
 * Error Trail append (path + sections)

# Non-negotiables
 * No “green by mocking” in runtime code.
 * No guessing contracts—align with Architecture/API/UI docs or pause to index the official doc.
 * No “task complete” until everything (UI script + tests + build) is green.

# One-minute sanity checklist
 * Saved as .cursor/commands/fix-errors.md
 * No parentheses around fenced code blocks
 * Docs list uses real @ handles or plain relative paths (not @docs/...)
 * tests/ui/test-logs/ exists (or agent is told to create it)
 * npm run test|typecheck|lint|build exist in package.json

--- End Command ---