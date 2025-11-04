module.exports = {
    plugins: ["boundaries"],
    settings: {
      "boundaries/elements": [
        { type: "ui", pattern: "client/src/**" },
        { type: "api", pattern: "src/api/**" },
        { type: "services", pattern: "src/services/**" },
        { type: "core", pattern: "src/core/**" },
        { type: "data", pattern: "src/data/**" }
      ]
    },
    rules: {
      "boundaries/element-types": ["error", {
        default: "disallow",
        rules: [
          { from: "ui", allow: ["ui","services"] },
          { from: "services", allow: ["services","core","data"] },
          { from: "api", allow: ["api","services"] },
          { from: "core", allow: ["core"] },
          { from: "data", allow: ["data"] }
        ]
      }]
    }
  };
  