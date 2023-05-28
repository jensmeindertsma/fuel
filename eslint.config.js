import typescriptParser from "@typescript-eslint/parser";
import typescriptPlugin from "@typescript-eslint/eslint-plugin";
import eslint from "@eslint/js";

export default [
  {
    // New way of specifying what used to be in `.eslintignore`
    ignores: ["node_modules", "build"],
  },
  {
    files: ["**/*.js" /* TODO: jsx */],
    rules: eslint.configs.recommended.rules,
  },
  {
    files: ["**/*.ts" /* TODO: tsx */],
    languageOptions: {
      parser: typescriptParser,
    },
    plugins: {
      "@typescript-eslint": typescriptPlugin,
    },
    rules: typescriptPlugin.configs.recommended.rules,
  },
];

// Hats off to the ESLint team for this new configuration system, it's dope!
