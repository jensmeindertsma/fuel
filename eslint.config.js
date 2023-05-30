import typescriptParser from "@typescript-eslint/parser";
import typescriptPlugin from "@typescript-eslint/eslint-plugin";
import eslint from "@eslint/js";

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
    },
  },

  // TODO: eslint-plugin-react-hooks
];

// Hats off to the ESLint team for this new configuration system, it's dope!
