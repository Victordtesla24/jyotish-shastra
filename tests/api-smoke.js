const axios = require("axios");

const B = process.env.BASE_URL_BACKEND || "http://localhost:3001";

(async () => {
  // Health
  const health = await axios.get(`${B}/api/v1/health`);
  if (!health.data || health.data.status !== "healthy") {
    throw new Error("Health check failed");
  }

  // Render SVG (minimal valid payload)
  const payload = {
    dateOfBirth: "1990-01-01",
    timeOfBirth: "10:30",
    latitude: 18.5204,
    longitude: 73.8567,
    timezone: "Asia/Kolkata",
    width: 600,
    includeData: false
  };
  const r = await axios.post(`${B}/api/v1/chart/render/svg`, payload);
  if (!r.data?.success || typeof r.data?.data?.svg !== "string") {
    throw new Error("render/svg did not return SVG");
  }

  console.log("✅ API smoke passed");
})();
