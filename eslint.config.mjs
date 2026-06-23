import coreWebVitals from "eslint-config-next/core-web-vitals";
import typescript from "eslint-config-next/typescript";

const eslintConfig = [
  {
    // Mirror tsconfig "exclude": archived planning docs + vendored example
    // components are not application source and should not be linted.
    ignores: ["archive/**", "spec/**"],
  },
  ...coreWebVitals,
  ...typescript,
  {
    // The React Compiler-aware rules in eslint-plugin-react-hooks@6 (bundled with
    // Next 16) flag many pre-existing patterns. These are surfaced as warnings to
    // be triaged incrementally rather than blocking lint/CI. See upgrade notes.
    rules: {
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/error-boundaries": "warn",
      "react-hooks/preserve-manual-memoization": "warn",
      "react-hooks/immutability": "warn",
      "react-hooks/purity": "warn",
    },
  },
];

export default eslintConfig;
