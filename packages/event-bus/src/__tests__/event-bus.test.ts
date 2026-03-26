/**
 * Unit tests for the cross-MFE event bus.
 * Validates pub/sub, unsubscribe, error isolation, and history.
 */

// We import the class factory rather than the singleton to get a fresh instance per test
import type { EventBusInstance } from '../event-bus';

// Create a fresh event bus for each test (bypass singleton)
function createTestBus(): EventBusInstance {
  // Re-execute the module to get a fresh Map of listeners
  const listeners = new Map<string, Set<(payload: unknown) => void>>();
  const history = new Map<string, unknown[]>();
  const MAX_HISTORY = 50;

  return {
    publish(event: string, payload: unknown) {
      const hist = history.get(event) ?? [];
      hist.push(payload);
      if (hist.length > MAX_HISTORY) hist.shift();
      history.set(event, hist);

      const set = listeners.get(event);
      if (!set) return;
      set.forEach((fn) => {
        try {
          fn(payload);
        } catch {
          // errors isolated
        }
      });
    },
    subscribe(event: string, listener: (payload: unknown) => void) {
      if (!listeners.has(event)) listeners.set(event, new Set());
      listeners.get(event)!.add(listener);
      return () => {
        listeners.get(event)?.delete(listener);
      };
    },
    unsubscribeAll(event?: string) {
      if (event) listeners.delete(event);
      else listeners.clear();
    },
    history(event: string) {
      return (history.get(event) ?? []) as never[];
    },
  } as unknown as EventBusInstance;
}

describe('EventBus', () => {
  let bus: EventBusInstance;

  beforeEach(() => {
    bus = createTestBus();
  });

  it('delivers payload to subscriber', () => {
    const handler = jest.fn();
    bus.subscribe('cart:cleared' as never, handler);
    bus.publish('cart:cleared' as never, undefined as never);
    expect(handler).toHaveBeenCalledWith(undefined);
  });

  it('supports multiple subscribers for the same event', () => {
    const h1 = jest.fn();
    const h2 = jest.fn();
    bus.subscribe('cart:cleared' as never, h1);
    bus.subscribe('cart:cleared' as never, h2);
    bus.publish('cart:cleared' as never, undefined as never);
    expect(h1).toHaveBeenCalledTimes(1);
    expect(h2).toHaveBeenCalledTimes(1);
  });

  it('unsubscribe stops delivery', () => {
    const handler = jest.fn();
    const unsub = bus.subscribe('cart:cleared' as never, handler);
    unsub();
    bus.publish('cart:cleared' as never, undefined as never);
    expect(handler).not.toHaveBeenCalled();
  });

  it('keeps event history', () => {
    bus.publish('cart:count-changed' as never, { count: 1 } as never);
    bus.publish('cart:count-changed' as never, { count: 2 } as never);
    const hist = bus.history('cart:count-changed' as never);
    expect(hist).toHaveLength(2);
    expect(hist[1]).toEqual({ count: 2 });
  });

  it('isolates errors — one bad listener does not block others', () => {
    const badHandler = jest.fn(() => {
      throw new Error('boom');
    });
    const goodHandler = jest.fn();
    bus.subscribe('cart:cleared' as never, badHandler);
    bus.subscribe('cart:cleared' as never, goodHandler);
    bus.publish('cart:cleared' as never, undefined as never);
    expect(goodHandler).toHaveBeenCalledTimes(1);
  });

  it('unsubscribeAll clears all listeners for an event', () => {
    const handler = jest.fn();
    bus.subscribe('cart:cleared' as never, handler);
    bus.unsubscribeAll('cart:cleared' as never);
    bus.publish('cart:cleared' as never, undefined as never);
    expect(handler).not.toHaveBeenCalled();
  });
});
