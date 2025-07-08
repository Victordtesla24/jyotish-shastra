#!/usr/bin/env bash
# -----------------------------------------------------------------------------
# create_kundli_project.sh
# -----------------------------------------------------------------------------
# Bootstraps the full "Kundli Web" project in the target directory so that you
# can immediately run `npm install && npm start` to view the dynamic Vedic
# horoscope chart in the browser.
#
# Usage:
#   chmod +x create_kundli_project.sh
#   ./create_kundli_project.sh   # writes to default BASE_DIR below
#
# NOTES
# -----
# • Adjust BASE_DIR if you need a different location.
# • The script EXPECTS that `kundli-template.png` (the diamond‑shaped blank chart
#   background) is sitting in the same directory as this script. It will be
#   copied into the project under public/images/.
# -----------------------------------------------------------------------------

set -euo pipefail

# ----------------------------------------
# 1. Constants & helpers
# ----------------------------------------
BASE_DIR="/Users/Shared/cursor/jyotish-shastra/tests/temp-chart-generation-proj"

abort() {
  echo "Error: $1" >&2
  exit 1
}

# ----------------------------------------
# 2. Directory scaffold
# ----------------------------------------
mkdir -p "$BASE_DIR" || abort "Cannot create $BASE_DIR"
cd "$BASE_DIR"

printf "Creating folder structure …\n"
mkdir -p public/{css,js,images} \
         node_modules \
         api

# ----------------------------------------
# 3. package.json
# ----------------------------------------
cat > package.json <<'JSON'
{
  "name": "kundli-web-project",
  "version": "1.0.0",
  "description": "Simple Node + vanilla‑JS app that renders a dynamic Vedic Kundli chart",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "author": "Vik (generated via ChatGPT)",
  "license": "MIT",
  "dependencies": {
    "express": "^4.19.2"
  },
  "devDependencies": {
    "nodemon": "^3.1.0"
  }
}
JSON

# ----------------------------------------
# 4. Express server
# ----------------------------------------
cat > server.js <<'JS'
import express from "express";
import { readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 4000;

// 1️⃣  API endpoint – returns the birth data JSON
app.get("/api/kundli", (_req, res) => {
  const data = readFileSync(path.join(__dirname, "sample-test-data.json"), "utf8");
  res.type("application/json").send(data);
});

// 2️⃣  Static front‑end assets
app.use(express.static(path.join(__dirname, "public")));

app.listen(PORT, () => {
  console.log(`➡️  Kundli app running at http://localhost:${PORT}`);
});
JS

# ----------------------------------------
# 5. Sample test data
# ----------------------------------------
cat > sample-test-data.json <<'JSON'
{
  "ascendant": "AQ",          "ascDeg": 1,
  "planets": [
    { "name": "Mo",  "sign": "PI", "deg": 19, "dig": "Deb" },
    { "name": "Ra",  "sign": "AR", "deg": 15, "dig": "--"  },
    { "name": "Ju",  "sign": "SG", "deg": 14, "dig": "Ex"  },
    { "name": "Sa",  "sign": "SC", "deg": 3,  "dig": "--"  },
    { "name": "Su",  "sign": "AQ", "deg": 7,  "dig": "--"  },
    { "name": "Me",  "sign": "AQ", "deg": 26, "dig": "--" },
    { "name": "Ve",  "sign": "CP", "deg": 16, "dig": "--" },
    { "name": "Ma",  "sign": "CP", "deg": 4,  "dig": "--" },
    { "name": "Ke",  "sign": "LI", "deg": 15, "dig": "--" }
  ]
}
JSON

# ----------------------------------------
# 6. Front‑end HTML
# ----------------------------------------
cat > public/index.html <<'HTML'
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Dynamic Vedic Kundli</title>
  <link rel="stylesheet" href="/css/styles.css" />
</head>
<body>
  <main class="wrapper">
    <h1>🪐 Vedic Lagna Chart</h1>

    <section id="chart-wrapper">
      <!-- Base diamond image -->
      <img id="chart-bg" src="/images/kundli-template.png" alt="Kundli template" />

      <!-- Planet & sign overlays will be injected here -->
      <div id="overlays"></div>
    </section>
  </main>

  <script src="/js/app.js" defer></script>
</body>
</html>
HTML

# ----------------------------------------
# 7. CSS
# ----------------------------------------
cat > public/css/styles.css <<'CSS'
:root {
  --bg: #fef7e1;
  --accent: #6b46c1; /* violet */
  --planet: #e53e3e; /* red‑orange */
  --text: #1a202c;
}
* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: system-ui, -apple-system, sans-serif;
  background: var(--bg);
  color: var(--text);
  line-height: 1.5;
  padding: 2rem;
}
.wrapper { max-width: 540px; margin: 0 auto; text-align: center; }
#chart-wrapper {
  position: relative;
  width: 512px;
  margin: 2rem auto;
}
#chart-bg {
  width: 100%;
  height: auto;
  display: block;
}
#overlays {
  position: absolute;
  inset: 0;
  pointer-events: none;
}
.label {
  position: absolute;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--accent);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}
.label .deg { font-size: 0.7rem; color: var(--planet); }
.label .dig { font-size: 0.6rem; color: #718096; }
CSS

# ----------------------------------------
# 8. Front‑end JavaScript
# ----------------------------------------
cat > public/js/app.js <<'JS'
// Fetch the horoscope data and overlay positions on the chart
fetch("/api/kundli")
  .then((res) => res.json())
  .then(drawChart)
  .catch(console.error);

/**
 * Coordinates for each sign in the diamond chart.
 * Positions are given as percentage offsets from the chart wrapper (0‑100).
 */
const POSITIONS = {
  AR: [12, 18],  // Aries – top‑left triangle
  TA: [28, 35],
  GE: [12, 78],
  CN: [28, 65],
  LE: [48, 50],
  VI: [48, 85],
  LI: [70, 65],
  SC: [70, 35],
  SG: [85, 18],
  CP: [85, 78],
  AQ: [48, 15],
  PI: [28, 15]
};

const ZODIAC_GLYPHS = {
  AR: "\u2648",
  TA: "\u2649",
  GE: "\u264A",
  CN: "\u264B",
  LE: "\u264C",
  VI: "\u264D",
  LI: "\u264E",
  SC: "\u264F",
  SG: "\u2650",
  CP: "\u2651",
  AQ: "\u2652",
  PI: "\u2653"
};

function drawChart(data) {
  const container = document.getElementById("overlays");
  container.innerHTML = ""; // clear

  // Ascendant marker
  placeLabel(container, data.ascendant, data.ascDeg, "As");

  // Planets
  data.planets.forEach(p => {
    placeLabel(container, p.sign, p.deg, p.name, p.dig);
  });
}

function placeLabel(container, sign, degree, text, dignity = "") {
  const [topPct, leftPct] = POSITIONS[sign] || [50, 50];

  const label = document.createElement("div");
  label.className = "label";
  label.style.top = `${topPct}%`;
  label.style.left = `${leftPct}%`;
  label.innerHTML = `
    <span class="glyph">${ZODIAC_GLYPHS[sign]}</span>
    <span class="txt">${text}</span>
    <span class="deg">${degree}\u00B0</span>
    <span class="dig">${dignity}</span>`;
  container.appendChild(label);
}
JS

# ----------------------------------------
# 9. nodemon config (optional dev convenience)
# ----------------------------------------
cat > nodemon.json <<'JSON'
{
  "watch": ["server.js", "sample-test-data.json"],
  "ext": "js,json",
  "exec": "node server.js"
}
JSON

# ----------------------------------------
# 10. Copy template image (if present)
# ----------------------------------------
if [[ -f "$(dirname "$0")/kundli-template.png" ]]; then
  cp "$(dirname "$0")/kundli-template.png" public/images/
  echo "✔️  Copied kundli-template.png into public/images/"
else
  echo "⚠️  kundli-template.png not found next to the script. Place it in public/images manually."
fi

# ----------------------------------------
# 11. README
# ----------------------------------------
cat > README.md <<'MD'
# Kundli Web Project

This project was auto‑generated by `create_kundli_project.sh`. It displays a dynamic Vedic Lagna chart by overlaying planet/sign labels on a fixed diamond chart template.

```bash
npm install       # install Express + Nodemon
npm run dev       # development – restarts on file changes
open http://localhost:4000
```
MD

# ----------------------------------------
# 12. Done
# ----------------------------------------
printf "\n✅  Project scaffold complete at %s\n" "$BASE_DIR"
