import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: "./vitest.setup.js",
    globals: true,
    // Multi-field userEvent.type() flows and axe scans are legitimately slow
    // under jsdom, and the default 5s budget gets tight once the whole suite
    // runs its test files concurrently instead of one file in isolation.
    testTimeout: 20000,
  },
});
