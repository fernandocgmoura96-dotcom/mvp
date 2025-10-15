import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom",
    include: ["**/*.test.{ts,tsx}"],
    coverage: { provider: "v8", reports: ["text", "lcov"] },
  },
});
