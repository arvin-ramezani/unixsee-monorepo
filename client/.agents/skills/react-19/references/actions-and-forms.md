# Actions and forms

## Choose the submission model

Use a function Action when:

- The operation is a mutation or submission.
- Pending state should participate in a Transition.
- Errors should integrate with the render tree.
- The framework can execute the Action in the correct client or server environment.
- Progressive enhancement is required and a Server Function is available.

Keep `onSubmit` when:

- The interaction is entirely local and synchronous.
- Direct access to the submit event is required.
- The project’s form library owns submission and validation.
- The operation is not improved by Action semantics.

## `useActionState`

Use `useActionState` when an Action returns state that the component must render.

```tsx
import { useActionState } from "react";

type SaveState =
  | { status: "idle" }
  | { status: "error"; message: string }
  | { status: "success" };

async function saveProfile(
  previousState: SaveState,
  formData: FormData,
): Promise<SaveState> {
  const displayName = String(formData.get("displayName") ?? "").trim();

  if (!displayName) {
    return { status: "error", message: "Display name is required." };
  }

  await updateProfile({ displayName });

  return { status: "success" };
}

export function ProfileForm() {
  const [state, submitAction, isPending] = useActionState(saveProfile, {
    status: "idle",
  });

  return (
    <form action={submitAction}>
      <label htmlFor="displayName">Display name</label>
      <input id="displayName" name="displayName" required />
      {state.status === "error" ? (
        <p role="alert">{state.message}</p>
      ) : null}
      <button disabled={isPending} type="submit">
        {isPending ? "Saving…" : "Save"}
      </button>
    </form>
  );
}
```

Rules:

- Treat the first Action argument as the previous state.
- Return serializable state when the Action crosses a server boundary.
- Model expected validation failures as state, not thrown exceptions.
- Throw unexpected failures only when an Error Boundary should handle them.
- Keep authorization and authoritative validation in the server mutation.

## `useFormStatus`

`useFormStatus` reads the status of the nearest parent form submission. The component calling it must render inside that form.

```tsx
import { useFormStatus } from "react-dom";

export function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button disabled={pending} type="submit">
      {pending ? "Submitting…" : "Submit"}
    </button>
  );
}
```

Do not call `useFormStatus` in the same component that returns the form and expect it to observe that form. Extract a child component.

## `useOptimistic`

Use optimistic state when the likely success path should be visible immediately and rollback is understandable.

```tsx
import { startTransition, useOptimistic } from "react";

type Message = {
  id: string;
  body: string;
  pending?: boolean;
};

export function MessageList({
  messages,
  sendMessage,
}: {
  messages: Message[];
  sendMessage: (body: string) => Promise<void>;
}) {
  const [optimisticMessages, addOptimisticMessage] = useOptimistic(
    messages,
    (currentMessages, body: string) => [
      ...currentMessages,
      {
        id: `pending-${currentMessages.length}`,
        body,
        pending: true,
      },
    ],
  );

  function handleSend(body: string) {
    startTransition(async () => {
      addOptimisticMessage(body);
      await sendMessage(body);
    });
  }

  return (
    <>
      <ul>
        {optimisticMessages.map((message) => (
          <li aria-busy={message.pending} key={message.id}>
            {message.body}
          </li>
        ))}
      </ul>
      <Composer onSend={handleSend} />
    </>
  );
}
```

Rules:

- Make optimistic state clearly distinguishable when confusion is possible.
- Preserve a recovery path for failure.
- Do not optimistically show irreversible success for high-risk operations.
- Keep optimistic updates inside an Action or Transition.

## Native form behavior

- A function passed to `action` or `formAction` receives `FormData`.
- Function Actions submit with POST semantics.
- Successful Actions reset uncontrolled form controls.
- Controlled controls reset only when their state changes.
- Use `requestFormReset` for an explicit manual reset.
- Buttons inside forms should declare `type="button"` unless they submit.
- Preserve labels, descriptions, error associations, keyboard flow, and focus recovery.
