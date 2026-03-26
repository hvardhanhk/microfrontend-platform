'use client';

import { useEffect, useCallback, useRef } from 'react';

import type { EventName, EventPayload } from '@platform/types';

import { EventBus } from './event-bus';

/**
 * React hook for subscribing to event bus events.
 * Automatically unsubscribes on unmount.
 *
 * @param event   - The event name to subscribe to
 * @param handler - Callback invoked when the event fires
 * @param options.replayLast - If true, immediately fires handler with last event payload.
 *   Useful for MFEs that mount after an event already occurred (e.g., auth:login).
 */
export function useEventBus<E extends EventName>(
  event: E,
  handler: (payload: EventPayload<E>) => void,
  options?: { replayLast?: boolean },
): { publish: (payload: EventPayload<E>) => void } {
  // Ref keeps handler stable across renders without re-subscribing
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    if (options?.replayLast) {
      const history = EventBus.history(event);
      if (history.length > 0) {
        handlerRef.current(history[history.length - 1]);
      }
    }

    const unsubscribe = EventBus.subscribe(event, (payload) => {
      handlerRef.current(payload);
    });

    return unsubscribe;
  }, [event, options?.replayLast]);

  const publish = useCallback(
    (payload: EventPayload<E>) => {
      EventBus.publish(event, payload);
    },
    [event],
  );

  return { publish };
}
