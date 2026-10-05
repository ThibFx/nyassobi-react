// Filet de sécurité plutôt que guide de style : on garde les règles qui
// attrapent de vrais bogues (hooks mal appelés, dépendances d'effet oubliées,
// variables inutilisées) et on laisse la mise en forme au jugement de chacun.
import js from "@eslint/js";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist", "node_modules"] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  reactHooks.configs.flat.recommended,
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: { globals: globals.browser },
    rules: {
      // Règles pensées pour le React Compiler, que le projet n'utilise pas.
      "react-hooks/refs": "off",
      "react-hooks/purity": "off",
      "react-hooks/set-state-in-effect": "off",
    },
  },
);
