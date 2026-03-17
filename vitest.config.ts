import react from "@vitejs/plugin-react-swc";
import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./"),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        ".next/",
        "vitest.setup.ts",
        "vitest.config.ts",
        "**/*.d.ts",
        "**/*.config.*",
        "**/dist/",
      ],
    },
  },
});
