// renderChart.js
// Normalized 1000×1000 spec: origin top-left; x→right, y→down

const fs = require("fs");

// --- 1) Paste the spec here (or require from a JSON file) ---
const spec = {
  canvas: { width: 1000, height: 1000 },
  lines: {
    outer_square: [
      [[0,0],[1000,0]], [[1000,0],[1000,1000]],
      [[1000,1000],[0,1000]], [[0,1000],[0,0]]
    ],
    diamond: [
      [[500,0],[1000,500]], [[1000,500],[500,1000]],
      [[500,1000],[0,500]], [[0,500],[500,0]]
    ],
    square_diagonals: [
      [[0,0],[1000,1000]], [[1000,0],[0,1000]]
    ]
  },
  slot_order_clockwise: [
    "outer_top","outer_top_right","outer_right","outer_bottom_right",
    "outer_bottom","outer_bottom_left","outer_left","outer_top_left",
    "inner_top","inner_right","inner_bottom","inner_left"
  ],
  slots: [
    { slot_index:0, slot_name:"outer_top", x:500.0, y:80.0 },
    { slot_index:1, slot_name:"outer_top_right", x:797.0, y:203.0 },
    { slot_index:2, slot_name:"outer_right", x:920.0, y:500.0 },
    { slot_index:3, slot_name:"outer_bottom_right", x:797.0, y:797.0 },
    { slot_index:4, slot_name:"outer_bottom", x:500.0, y:920.0 },
    { slot_index:5, slot_name:"outer_bottom_left", x:203.0, y:797.0 },
    { slot_index:6, slot_name:"outer_left", x:80.0, y:500.0 },
    { slot_index:7, slot_name:"outer_top_left", x:203.0, y:203.0 },
    { slot_index:8, slot_name:"inner_top", x:500.0, y:280.0 },
    { slot_index:9, slot_name:"inner_right", x:720.0, y:500.0 },
    { slot_index:10, slot_name:"inner_bottom", x:500.0, y:720.0 },
    { slot_index:11, slot_name:"inner_left", x:280.0, y:500.0 }
  ]
};

// --- 2) Utility: scale a line or point from 1000-space to target ---
function scalePoint([x, y], k) { return [x * k, y * k]; }
function lineToSVG([[x1,y1],[x2,y2]], k) {
  const [X1, Y1] = scalePoint([x1,y1], k);
  const [X2, Y2] = scalePoint([x2,y2], k);
  return `<line x1="${X1}" y1="${Y1}" x2="${X2}" y2="${Y2}" stroke="black" stroke-width="${1.5*k}" />`;
}

// --- 3) Core render ---
/**
 * placements: {
 *   ascSlotIndex: number,                   // where House 1 (Lagna) should appear (0..11)
 *   rasiByHouse: { [houseNum: number]: string },   // 1..12 → "1..12" or "Ar..Pi"
 *   planetsByHouse: { [houseNum: number]: string[] } // e.g., {1:["Su","Mo"], 2:["Me"], ...}
 * }
 */
function renderChartSVG({ width=800, placements }) {
  const k = width / 1000;
  const height = width; // square
  const lines = [
    ...spec.lines.outer_square.map(seg => lineToSVG(seg, k)),
    ...spec.lines.diamond.map(seg => lineToSVG(seg, k)),
    ...spec.lines.square_diagonals.map(seg => lineToSVG(seg, k)),
  ].join("\n");

  // map house → slotIndex (clockwise rotation from ascSlotIndex)
  const order = spec.slot_order_clockwise;
  const houseToSlot = {};
  for (let h=1; h<=12; h++) {
    houseToSlot[h] = (placements.ascSlotIndex + (h-1)) % 12;
  }

  // text elements (rasi + stacked planets)
  const texts = [];
  for (let h=1; h<=12; h++) {
    const sIdx = houseToSlot[h];
    const slot = spec.slots[sIdx];
    const [X, Y] = scalePoint([slot.x, slot.y], k);

    const rasi = placements.rasiByHouse?.[h] ?? `${h}`;
    const planets = placements.planetsByHouse?.[h] ?? [];

    // Rāśi number/name
    texts.push(
      `<text x="${X}" y="${Y}" font-family="monospace" font-size="${16*k}" text-anchor="middle" dominant-baseline="central">${rasi}</text>`
    );

    // Stack planets below (4px * k per line)
    planets.forEach((p, i) => {
      const dy = (18 + i*14) * k;
      texts.push(
        `<text x="${X}" y="${Y + dy}" font-family="monospace" font-size="${12*k}" text-anchor="middle" dominant-baseline="central">${p}</text>`
      );
    });
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  ${lines}
  ${texts.join("\n  ")}
</svg>`;
}

// --- 4) Example usage ---
const example = {
  width: 900,
  placements: {
    ascSlotIndex: 0, // put House 1 at "outer_top" (S0). Change to rotate.
    rasiByHouse: { 1:"Ar",2:"Ta",3:"Ge",4:"Cn",5:"Le",6:"Vi",7:"Li",8:"Sc",9:"Sg",10:"Cp",11:"Aq",12:"Pi" },
    planetsByHouse: {
      1:["Asc","Su"], 2:["Mo"], 3:["Me","Ke"], 4:["Ve"], 5:["Ma"], 6:[],
      7:["Ju"], 8:["Sa"], 9:[], 10:[], 11:["Ra"], 12:[]
    }
  }
};

const svg = renderChartSVG(example);
fs.writeFileSync("chart.svg", svg, "utf8");
console.log("Wrote chart.svg");
