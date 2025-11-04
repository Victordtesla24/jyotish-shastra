import { warn, fail, markdown, danger } from "danger";
import * as fs from "fs";

const files = danger.git.modified_files.concat(danger.git.created_files);

// Warn if src changed without tests
const changedSrc = files.filter(f => f.startsWith("src/") || f.startsWith("client/src/"));
const changedTests = files.filter(f => /(__tests__|\.test\.|tests\/)/.test(f));
if (changedSrc.length && !changedTests.length) {
  warn("Code changed without test updates. Consider adding/adjusting tests.");
}

// Docs required if routes/services touched
const touches = files.some(f =>
  f.startsWith("src/api/routes/") || f.startsWith("src/services/")
);
if (touches) {
  const must = [
    "docs/endpoint-ui-mapping-inventory.md",
    "docs/user-data-flows.md",
    "docs/system-architecture.md",
    "docs/detailed-ui-architecture.md",
    "docs/validation-guide.md"
  ];
  const updated = must.filter(m => files.includes(m));
  if (!updated.length) {
    fail("Architecture changed but docs not updated (endpoint mapping / data flows / system architecture / UI architecture / validation).");
  }
}

markdown("Automated checks complete ✅");
