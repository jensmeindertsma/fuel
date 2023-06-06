import eslint from "@eslint/js";
import typescriptPlugin from "@typescript-eslint/eslint-plugin";
import typescriptParser from "@typescript-eslint/parser";
import importPlugin from "eslint-plugin-import";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import simpleImportSortPlugin from "eslint-plugin-simple-import-sort";

// Hats off to the ESLint team for this new configuration system, it's dope!
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

  {
    files: ["support/test/react.cjs"],
    languageOptions: {
      sourceType: "module",
    },
  },

  {
    files: ["**/*.js", "**/*.jsx", "**/*.ts", "**/*.tsx"],
    plugins: {
      import: importPlugin,
      "simple-import-sort": simpleImportSortPlugin,
      "react-hooks": reactHooksPlugin,
    },
    rules: {
      "import/first": "warn",
      "import/newline-after-import": "warn",
      "import/no-duplicates": "warn",
      "simple-import-sort/imports": [
        "warn",
        {
          // No grouping, only alphabetical sorting.
          groups: [],
        },
      ],
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
    },
  },
];
