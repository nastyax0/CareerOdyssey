import globals from "globals";
import pluginJs from "@eslint/js";

/** @type {import('eslint').Linter.Config[]} */
export default [
  
  {
    languageOptions: {
      globals: {
        ...globals.browser, 
        process: "readonly", 
      },
    },
  },
  pluginJs.configs.recommended,
  {
    rules: {
      "no-undef": ["error", { "typeof": true }], 
      "@typescript-eslint/no-unused-vars": "off", 
    },
  },
];
