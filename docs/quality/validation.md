# Validation

## Automated validation

There are currently no automated tests and no workspace scripts.

When per-app tooling exists, run lint/build from that app's folder (or the
documented workspace command). Typical commands once available:

```powershell
npm run lint
npm run build
```

Do not invent unavailable scripts.

Never claim validation passed unless it actually ran.

Document new scripts in this file and in [`../architecture/monorepo.md`](../architecture/monorepo.md)
when tooling lands.

## Manual validation

When relevant for UI work in `admin-panel/` or `client/`, verify:

- responsive behavior
- RTL behavior
- empty states
- error states
- interactive states
- accessibility
- visual consistency
- hydration issues

## Dependencies

Do not add dependencies unless required.

Prefer existing dependencies and native React/Next.js (or NestJS) capabilities
inside the owning app. Do not create a shared package solely to add a
dependency.

## Related

- Documentation standards: [`documentation.md`](./documentation.md)
- UI-only phase: [`../architecture/decisions/0003-ui-only-phase-boundaries.md`](../architecture/decisions/0003-ui-only-phase-boundaries.md)
