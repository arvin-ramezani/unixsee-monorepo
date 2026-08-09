# Next.js Engineering

> **Status:** Current
>
> **Owner:** Frontend team
>
> **Last verified:** 2026-08-04

## Component Boundaries

- Default to Server Components.
- Add `"use client"` only for browser APIs, event handlers, client hooks, or client-managed state.
- Keep client boundaries small and pass serializable data into them.
- Avoid client-side effects for state that can be derived during render.
- Do not duplicate server data in Zustand merely to avoid passing a small number of props.

## Routing and Localization

- Locale-aware application routes live below `src/app/[locale]`.
- Use navigation helpers from `src/i18n/navigation.ts` for localized links and routing.
- Keep user-facing strings in next-intl messages or typed repository-owned content with localized variants.
- Preserve Persian RTL and English LTR rendering, metadata, and navigation.
- Validate dynamic route parameters before using them to select data or construct backend calls.

## Data Loading

- Public static content should be imported from repository-owned modules or messages and rendered on the server.
- Dashboard and admin application data should be requested through typed NestJS clients.
- Keep credentials and privileged calls server-only.
- Set explicit caching behavior rather than relying on accidental framework defaults.
- Use parallel data loading when requests are independent and streaming when it materially improves the experience.
- Provide stable loading, empty, permission-denied, unavailable, and error states.

## Mutations and Forms

- Use React Hook Form and Zod for interactive client forms when they provide clear value.
- Validate again at the trusted server or API boundary; browser validation is not authoritative.
- Prefer Server Actions or Route Handlers for presentation-layer mutations only when they preserve the NestJS ownership boundary.
- Return structured, translatable errors without exposing stack traces, internal URLs, or sensitive payloads.
- Prevent duplicate submissions and expose pending state.

## Route Handlers and Proxies

- Keep handlers thin: authenticate or validate the request, call the owning service, and map the response.
- Do not reproduce backend authorization or business workflows in Next.js.
- Restrict redirect destinations and external URLs to approved values.
- Set timeouts and handle aborted upstream requests.
- Never log credentials, session tokens, or full sensitive payloads.

## Performance

- Prefer Server Components and static rendering for public content.
- Lazy-load genuinely heavy client-only UI.
- Avoid sequential fetch waterfalls and unbounded client subscriptions.
- Use framework image and font optimizations where appropriate.
- Measure before introducing caching layers, global state, memoization, or virtualization.
