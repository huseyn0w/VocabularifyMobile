import { useSyncExternalStore } from "react";

/**
 * A counter that goes up whenever something outside the deck moves the deck.
 *
 * The Progress screen can restart a level or jump to a saved spot, and it
 * lives in the Settings tab while the deck lives in Home. Both tabs stay
 * mounted, so the deck has to be told that the position it holds in state is
 * no longer the one in storage.
 *
 * A module-level counter rather than a context: nothing here is per-subtree,
 * every consumer wants the same number, and `useIsFocused` would tie the Home
 * screen to a navigation container it does not otherwise need - which is also
 * what its tests would then have to build.
 */
let revision = 0;
const listeners = new Set<() => void>();

/** Call after writing a deck position from outside the deck. */
export function markDeckMoved(): void {
  revision += 1;
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

const read = () => revision;

export function useDeckRevision(): number {
  return useSyncExternalStore(subscribe, read, read);
}

/** Test seam: resets the counter and drops every listener. */
export function resetDeckSignal(): void {
  revision = 0;
  listeners.clear();
}
