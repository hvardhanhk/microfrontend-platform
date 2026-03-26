import type { EventMap, EventName, EventPayload } from '@platform/types';

type Listener<E extends EventName> = (payload: EventPayload<E>) => void;

export interface EventBusInstance {
  publish<E extends EventName>(event: E, payload: EventPayload<E>): void;
  subscribe<E extends EventName>(event: E, listener: Listener<E>): () => void;
  unsubscribeAll(event?: EventName): void;
  history<E extends EventName>(event: E): EventPayload<E>[];
}

/**
 * Type-safe, singleton event bus for cross-MFE communication.
 *
 * Design decisions:
 * - Map<Set> for O(1) add/delete of listeners
 * - Bounded history (last 50 events) so late-mounting MFEs can replay
 *   events they missed during hydration
 * - subscribe() returns an unsubscribe fn for easy useEffect cleanup
 * - Errors in one listener don't break other listeners
 */
class EventBusImpl implements EventBusInstance {
  private listeners = new Map<EventName, Set<Listener<never>>>();
  private eventHistory = new Map<EventName, unknown[]>();
  private static readonly MAX_HISTORY = 50;

  publish<E extends EventName>(event: E, payload: EventPayload<E>): void {
    // Persist to history
    const history = this.eventHistory.get(event) ?? [];
    history.push(payload);
    if (history.length > EventBusImpl.MAX_HISTORY) {
      history.shift();
    }
    this.eventHistory.set(event, history);

    // Notify listeners
    const set = this.listeners.get(event);
    if (!set) return;

    set.forEach((listener) => {
      try {
        (listener as Listener<E>)(payload);
      } catch (error) {
        console.error(`[EventBus] Error in listener for "${event}":`, error);
      }
    });
  }

  subscribe<E extends EventName>(event: E, listener: Listener<E>): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    const set = this.listeners.get(event)!;
    set.add(listener as Listener<never>);

    // Return unsubscribe function
    return () => {
      set.delete(listener as Listener<never>);
      if (set.size === 0) this.listeners.delete(event);
    };
  }

  unsubscribeAll(event?: EventName): void {
    if (event) {
      this.listeners.delete(event);
    } else {
      this.listeners.clear();
    }
  }

  history<E extends EventName>(event: E): EventPayload<E>[] {
    return (this.eventHistory.get(event) ?? []) as EventPayload<E>[];
  }
}

/**
 * Singleton — attached to globalThis so it survives across chunks/MFEs
 * loaded in the same window. Critical for Module Federation scenarios
 * where each remote has its own module scope.
 */
const GLOBAL_KEY = '__PLATFORM_EVENT_BUS__';

function getGlobalEventBus(): EventBusInstance {
  if (typeof globalThis !== 'undefined') {
    const g = globalThis as unknown as Record<string, EventBusInstance>;
    if (!g[GLOBAL_KEY]) {
      g[GLOBAL_KEY] = new EventBusImpl();
    }
    return g[GLOBAL_KEY];
  }
  return new EventBusImpl();
}

export const EventBus = getGlobalEventBus();
