## Version

Target Next.js 16.3, React 19, and App Router.

Use current framework APIs and conventions. Do not rely on patterns from older Next.js versions.

## Rules

- Prefer Server Components.
- Use Client Components only when required.
- Use Server Actions when server-side mutations are introduced.
- Use `proxy.ts` where Next.js 16 requires request interception.
- Never introduce `middleware.ts` for new functionality.
- Follow current App Router conventions.
- Verify unfamiliar or version-sensitive APIs before implementing them.
- Do not guess when framework behavior is uncertain.

## Tailwind

Use Tailwind CSS v4 conventions.

Do not introduce Tailwind v3 configuration patterns into the project.
