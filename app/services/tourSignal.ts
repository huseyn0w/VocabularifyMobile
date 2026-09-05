import { useSyncExternalStore } from "react";

/**
 * A counter that goes up whenever the walkthrough is asked for again.
 *
 * The Settings screen offers to replay it, and it lives in the Settings tab
 * while the deck lives in Home. Both tabs stay mounted, so clearing the stored
 * flag is invisible to the Home screen: it read that flag once, on the first
 * deck it showed, and would not read it again until the app restarts.
 *
 * Same shape as [[deckSignal]] and for the same reason - a module counter
 * rather than a context or `useIsFocused`, which would tie the Home screen to
 * a navigation container it does not otherwise need.
 */
let revision = 0;
const listeners = new Set<() => void>();

/** Call after clearing the stored "tour seen" flag. */
export function requestHomeTour(): void {
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

export function useTourRequest(): number {
  return useSyncExternalStore(subscribe, read, read);
}

/** Test seam: resets the counter and drops every listener. */
export function resetTourSignal(): void {
  revision = 0;
  listeners.clear();
}
