import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    // Repository conventions enforced mechanically at `error`: hardcoded
    // Persian strings and negative JSX conditionals fail `npm run lint` and
    // CI. Canonical rules: docs/engineering/nextjs.md (localization) and
    // docs/engineering/ui.md#jsx-conditionals (positive-only JSX).
    files: ["src/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          // No hardcoded user-facing strings: all copy belongs in
          // src/messages/{en,fa}.json, read via next-intl t()/common().
          selector:
            "JSXText[value=/[\\u0600-\\u06FF]/], Literal[value=/[\\u0600-\\u06FF]/], TemplateElement[value.raw=/[\\u0600-\\u06FF]/]",
          message:
            "Hardcoded Persian string. Move user-facing text to src/messages/{en,fa}.json and read it with next-intl t()/common(). See docs/engineering/nextjs.md#routing-and-localization.",
        },
        {
          // Positive-only JSX: `{condition && <Component />}`, never
          // `{condition ? <Component /> : null}`.
          selector:
            "JSXExpressionContainer > ConditionalExpression[alternate.raw='null']",
          message:
            "Use positive-only JSX `{condition && <Component />}` instead of `{condition ? <Component /> : null}`. See docs/engineering/ui.md#jsx-conditionals.",
        },
      ],
    },
  },
]);

export default eslintConfig;
