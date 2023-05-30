import eslint from "@eslint/js";
import typescriptPlugin from "@typescript-eslint/eslint-plugin";
import typescriptParser from "@typescript-eslint/parser";
import simpleImportSort from "eslint-plugin-simple-import-sort";

export default [
  {
    // New way of specifying what used to be in `.eslintignore`
    ignores: ["node_modules", "build", "public/build"],
  },
  {
    files: ["**/*.js", "**/*.jsx"],
    rules: eslint.configs.recommended.rules,
  },
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: typescriptParser,
    },
    plugins: {
      "@typescript-eslint": typescriptPlugin,
    },
    rules: {
      ...typescriptPlugin.configs.recommended.rules,
      "@typescript-eslint/consistent-type-imports": "warn",
    },
  },

  // TODO: eslint-plugin-react-hooks
  {
    files: ["**/*.js", "**/*.jsx", "**/*.ts", "**/*.tsx"],
    plugins: {
      "simple-import-sort": simpleImportSort,
    },
    rules: {
      "simple-import-sort/imports": "warn",
    },
  },
];

// Hats off to the ESLint team for this new configuration system, it's dope!
