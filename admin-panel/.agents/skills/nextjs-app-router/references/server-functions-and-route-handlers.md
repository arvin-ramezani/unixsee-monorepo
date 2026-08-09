# Server Functions, Actions, and Route Handlers

## Server Functions

A Server Function is an async function marked with `"use server"`.

Dedicated file:

```tsx
"use server"

export async function createProduct(formData: FormData) {
  const input = parseProductInput(formData)
  const session = await requireSession()

  await productService.create(session.user.id, input)
}
```

Only export async Server Functions from a file whose top-level directive is `"use server"`.

## Security

Treat Server Functions as public mutation endpoints.

Every Server Function must:

1. Authenticate the caller where required.
2. Authorize the requested operation.
3. Validate all arguments and `FormData`.
4. Avoid trusting hidden fields, client role values, prices, ownership, or resource IDs.
5. Return safe serializable results.
6. Avoid exposing stack traces or internal objects.
7. Apply rate limits or idempotency where required.

Proxy checks do not replace mutation authorization.

## Expected errors

Return typed expected errors. Throw unexpected failures for framework error handling and observability.

Call `redirect()` after successful work and outside `try/catch` blocks that would accidentally catch the redirect signal.

## Sequential dispatch

Client-triggered Server Actions are dispatched sequentially. Do not design high-throughput parallel fetching around many Action calls.

For independent parallel server work, execute it inside one Server Function or use server-side data fetching.

## Route Handlers

Use `route.ts` when an HTTP contract is required:

```tsx
export async function POST(request: Request) {
  const payload = await request.json()
  const input = parseWebhook(payload)

  await processWebhook(input)

  return Response.json({ received: true }, { status: 202 })
}
```

Rules:

- Use Web APIs by default.
- Use `NextRequest` or `NextResponse` only when their additional features are needed.
- Validate content type and body size.
- Authenticate and authorize application endpoints.
- Verify webhook signatures before processing.
- Return explicit status codes.
- Avoid leaking internal errors.
- Do not define `page.tsx` and `route.ts` in the same segment.
- Do not call Route Handlers from Server Components for internal data access.
