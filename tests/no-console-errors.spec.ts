import { test, expect } from "@playwright/test";

test("no console errors on key routes", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
  });

  for (const route of ["/", "/health"]) {
    await page.goto(`${process.env.BASE_URL_FRONTEND || "http://localhost:3002"}${route}`, { waitUntil: "networkidle" });
  }

  expect(errors).toEqual([]);
});
