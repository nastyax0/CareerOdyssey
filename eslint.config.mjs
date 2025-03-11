import globals from "globals";
import pluginJs from "@eslint/js";

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    languageOptions: {
      globals: {
        ...globals.browser, // Keep existing browser globals
        process: "readonly", // Allow process as global
      },
    },
  },
  pluginJs.configs.recommended,
  {
    settings: {
      react: {
        version: "detect", // Automatically detect React version
      },
    },
    plugins: ["react"], // Add the react plugin for JSX parsing
    rules: {
      "no-undef": ["error", { typeof: true }],
      "@typescript-eslint/no-unused-vars": "off", // Disable unused-vars rule (if needed)
      "react/jsx-uses-react": "off", // Disable if using React 17+ (JSX auto-imports React)
      "react/react-in-jsx-scope": "off", // Disable for React 17+ (JSX auto imports React)
    },
  },
  {
    // TypeScript parsing rules
    parser: "@typescript-eslint/parser", // TypeScript parser for TSX files
    parserOptions: {
      ecmaVersion: 2020, // Use the latest ECMAScript version
      sourceType: "module", // Enable ES Modules
      project: "./tsconfig.json", // Make sure the TypeScript config is being used
    },
    extends: [
      "plugin:@typescript-eslint/recommended", // Use TypeScript rules
    ],
    rules: {
      "@typescript-eslint/no-explicit-any": "off", // Optional: disable "no-explicit-any" rule
    },
  },
];
