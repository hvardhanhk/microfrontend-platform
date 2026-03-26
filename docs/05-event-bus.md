# Event Bus (Cross-MFE Communication)

## Overview

The **Event Bus** is a custom type-safe publish/subscribe system that enables communication between independently developed microfrontends. It's the primary mechanism for loose coupling — MFEs don't import each other directly; they communicate through events.

## Architecture

```
┌───────────────────────────────────────────────────────┐
│                   globalThis                          │
│    __PLATFORM_EVENT_BUS__ (singleton EventBusImpl)    │
│                                                       │
│    listeners: Map<EventName, Set<Listener>>           │
│    eventHistory: Map<EventName, unknown[]>  (max 50)  │
└───────────────────────────────────────────────────────┘
        ▲                           │
        │ subscribe()               │ publish()
        │                           ▼
   ┌─────────┐              ┌──────────┐
   │ Cart MFE │              │ Products │
   │          │              │   MFE    │
   └─────────┘              └──────────┘
```

## Implementation

### Core: EventBusImpl

**File:** `packages/event-bus/src/event-bus.ts`

```typescript
class EventBusImpl implements EventBusInstance {
  private listeners = new Map<EventName, Set<Listener<never>>>();
  private eventHistory = new Map<EventName, unknown[]>();
  private static readonly MAX_HISTORY = 50;

  publish<E extends EventName>(event: E, payload: EventPayload<E>): void {
    // 1. Persist to bounded history (max 50 per event type)
    // 2. Notify all listeners with error isolation
  }

  subscribe<E extends EventName>(event: E, listener: Listener<E>): () => void {
    // Returns unsubscribe function for cleanup
  }

  history<E extends EventName>(event: E): EventPayload<E>[] {
    // Returns past events for replay
  }
}
```

### Design Decisions

| Decision                     | Rationale                                                     |
| ---------------------------- | ------------------------------------------------------------- |
| **Singleton on globalThis**  | Survives across webpack chunks and Module Federation remotes  |
| **Map + Set for listeners**  | O(1) add/delete operations                                   |
| **Bounded history (50)**     | Enables replay without unbounded memory growth                |
| **Error isolation**          | One failing listener doesn't crash others (try/catch each)    |
| **Unsubscribe return value** | Clean integration with React's `useEffect` cleanup pattern    |

### React Hook: useEventBus

**File:** `packages/event-bus/src/use-event-bus.ts`

```typescript
export function useEventBus<E extends EventName>(
  event: E,
  handler: (payload: EventPayload<E>) => void,
  options?: { replayLast?: boolean }
): { publish: (payload: EventPayload<E>) => void };
```

Features:
- **Auto-unsubscribe on unmount** via `useEffect` cleanup
- **Stable handler ref** via `useRef` — no re-subscriptions on handler changes
- **`replayLast` option**: Immediately fires the handler with the most recent event payload. Critical for MFEs that mount after an event has already occurred (e.g., Cart MFE mounts after a product was added)
- **Returns `publish`** function for the specific event type

### Type Safety via EventMap

**File:** `packages/types/src/events.ts`

Every event name and its payload type is registered in the `EventMap` interface:

```typescript
export interface EventMap {
  "auth:login": { user: User };
  "auth:logout": undefined;
  "cart:item-added": { item: CartItem };
  "cart:count-changed": { count: number };
  "product:add-to-cart": AddToCartPayload;
  "notification:show": { type: "success" | "error"; message: string };
  // ...
}
```

Publishing with the wrong payload shape is a **compile-time error**:

```typescript
// ✅ Correct
EventBus.publish("cart:count-changed", { count: 5 });

// ❌ TypeScript error: Property 'count' is missing
EventBus.publish("cart:count-changed", { total: 5 });
```

## Usage Examples

### Publishing (Products MFE → Cart MFE)

```typescript
// products-mfe.tsx
import { useCartStore } from "@platform/shared-state";

const addItem = useCartStore((s) => s.addItem);
// addItem() internally publishes 'cart:item-added' and 'cart:count-changed'
addItem({ id: product.id, product, quantity: 1, addedAt: new Date().toISOString() });
```

### Subscribing with Replay (Cart MFE)

```typescript
// cart-mfe.tsx (prior pattern — now uses Zustand directly)
useEventBus(
  "product:add-to-cart",
  (payload) => {
    console.log("Product added:", payload.productId);
  },
  { replayLast: true }
);
```

### Auth Events (App Shell)

```typescript
// user-mfe.tsx — Sign Out
EventBus.publish("auth:logout", undefined);
```

## Communication with Other Technologies

| Technology   | How Event Bus Interacts                                              |
| ------------ | -------------------------------------------------------------------- |
| TypeScript   | `EventMap` enforces compile-time type safety on all events           |
| Zustand      | Stores publish events (`cart:item-added`, `auth:login`) on mutations |
| React        | `useEventBus` hook integrates with component lifecycle               |
| Feature Flags | `ABTest` component publishes impression events via EventBus         |

## Key Files

| File                                       | Purpose                          |
| ------------------------------------------ | -------------------------------- |
| `packages/event-bus/src/event-bus.ts`      | Core EventBusImpl singleton      |
| `packages/event-bus/src/use-event-bus.ts`  | React hook for subscribe/publish |
| `packages/types/src/events.ts`             | EventMap type registry           |
