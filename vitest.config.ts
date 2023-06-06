import { react } from "./support/test/react.cjs";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react(), tsconfigPaths()],

  test: {
    include: ["./app/**/*.test.{ts,tsx}"],
    environment: "jsdom",
    setupFiles: ["./support/test/setup.ts"],
    coverage: {
      include: ["app/**/*.{ts,tsx}"],
      all: true,
    },
  },
});
