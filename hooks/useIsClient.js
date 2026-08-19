"use client";

import { useSyncExternalStore } from "react";

/* Never changes, so the store never needs to notify anyone. */
const subscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

/*
|--------------------------------------------------------------------------
| useIsClient
|--------------------------------------------------------------------------
|
| False during server rendering *and* during the first client render, then
| true. That ordering is the whole point: the first client render has to
| produce exactly the markup the server sent, or React discards the tree and
| reports a hydration mismatch.
|
| Use it to gate anything that cannot agree across the boundary — the
| visitor's local clock being the usual case, since a statically prerendered
| page is built once, hours or days before anyone loads it.
|
| useSyncExternalStore is used rather than a mounted flag set in an effect:
| it needs no state update, so it does not trip the set-state-in-effect rule
| and costs nothing on re-render.
|
*/
export function useIsClient() {
  return useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);
}
