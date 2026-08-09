## Dummy Data

Current phase uses static data only.

Store feature data under:

```text
src/lib/data/
```

Examples:

```text
tickets-data.ts
websites-data.ts
users-data.ts
```

Prefer named constants:

```ts
export const WEBSITES = [...]
```

Do not create fake API clients or unnecessary service layers.

Dummy data should cover realistic states such as:

- empty values
- long content
- multiple statuses
- loading states
- error states
- responsive content
