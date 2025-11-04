const { globby } = require("globby");
const fs = require("fs");

const banned = [
  /\bmock\b/i, /\bplaceholder\b/i, /\bfallback\b/i,
  /__mocks__/i, /\bMockAdapter\b/, /\bmsw\b/
];

(async () => {
  const files = await globby([
    "client/src/**/*.{ts,tsx,js,jsx}",
    "src/**/*.{ts,tsx,js,jsx}"
  ], {
    ignore: ["**/__tests__/**","**/test/**","**/__mocks__/**","**/fixtures/**","**/scripts/**"]
  });

  const hits = [];
  for (const f of files) {
    const txt = fs.readFileSync(f, "utf8");
    for (const re of banned) {
      if (re.test(txt)) hits.push({ file: f, pattern: re.toString() });
    }
  }
  if (hits.length) {
    console.error("❌ Banned mock/placeholder code detected in prod paths:");
    hits.forEach(h => console.error(` - ${h.file}  (${h.pattern})`));
    process.exit(1);
  } else {
    console.log("✅ No mocks/placeholders in prod paths.");
  }
})();
