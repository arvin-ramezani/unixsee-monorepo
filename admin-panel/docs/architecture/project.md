# docs/architecture/project.md

## Project Structure

```text
src/
├── app/
├── components/
├── hooks/
├── lib/
│   └── data/
├── stores/
└── types/
```

## Boundaries

The current phase is UI-only.

Do not add:

- API integration
- Database access
- Authentication
- Authorization
- Backend services

Future backend integration must follow the project's architecture decisions.

## Feature Organization

Feature components belong under:

```text
src/components/tickets/
src/components/websites/
src/components/users/
```

Shared primitives belong under:

```text
src/components/ui/
```

Do not place feature-specific components in `components/ui/`.
