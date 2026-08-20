# State, Effects, events, and concurrency

## State design

Prefer this order:

1. Derive during render.
2. Compute in the event that changes the data.
3. Store state only when the value must persist independently.
4. Use an Effect only when an external system must be synchronized.

Avoid:

```tsx
const [fullName, setFullName] = useState("");

useEffect(() => {
  setFullName(`${firstName} ${lastName}`);
}, [firstName, lastName]);
```

Prefer:

```tsx
const fullName = `${firstName} ${lastName}`;
```

Use functional updates for previous-state transitions:

```tsx
setItems((currentItems) => [...currentItems, nextItem]);
```

## Effects

An Effect should describe synchronization with something outside React:

- Browser APIs
- Network subscriptions
- Timers
- Observers
- Third-party widgets
- Non-React stores

The setup and cleanup should be symmetrical.

```tsx
useEffect(() => {
  const controller = new AbortController();

  void loadResults(query, controller.signal);

  return () => controller.abort();
}, [query]);
```

Do not suppress dependencies. Restructure the code:

- Move event-specific work into the event handler.
- Move derived values into render.
- Move stable constants outside the component.
- Split unrelated synchronization into separate Effects.
- Use `useEffectEvent` for non-reactive logic that must run from an Effect.

## `useEffectEvent`

Use an Effect Event to read current values without making the surrounding Effect re-synchronize for those values.

```tsx
import { useEffect, useEffectEvent } from "react";

export function ChatRoom({
  roomId,
  theme,
}: {
  roomId: string;
  theme: string;
}) {
  const handleConnected = useEffectEvent(() => {
    showNotification("Connected", theme);
  });

  useEffect(() => {
    const connection = createConnection(roomId);
    connection.on("connected", handleConnected);
    connection.connect();

    return () => connection.disconnect();
  }, [roomId]);

  return null;
}
```

Rules:

- Invoke Effect Events only from an Effect, layout Effect, insertion Effect, or another Effect Event in the same component.
- Do not pass them to children.
- Do not include them in dependency arrays.
- Do not use them to hide reactive synchronization.

## Transitions

Use a Transition for non-urgent updates that may render slowly.

```tsx
const [isPending, startTransition] = useTransition();

function selectTab(nextTab: string) {
  startTransition(() => {
    setSelectedTab(nextTab);
  });
}
```

Do not use a Transition to control text input state. Input updates must remain urgent.

Use pending state to communicate progress without replacing useful content unnecessarily.

## Deferred values

Use `useDeferredValue` when a slow subtree may lag behind an urgent value.

```tsx
const deferredQuery = useDeferredValue(query, "");
```

The second argument provides the value used for the initial render.

Do not create a new object during render and immediately pass it to `useDeferredValue`.

## Activity

Use Activity to hide UI while preserving state.

```tsx
import { Activity } from "react";

<Activity mode={isOpen ? "visible" : "hidden"}>
  <FiltersPanel />
</Activity>
```

When hidden:

- The subtree retains state.
- Effects clean up.
- Updates may continue at lower priority.

When visible again:

- The previous state is restored.
- Effects reconnect.

Use conditional rendering when state should be discarded. Use CSS visibility when Effects should remain active and the DOM should simply be hidden.
