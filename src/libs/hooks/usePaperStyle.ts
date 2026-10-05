'use client';

import { useCallback, useSyncExternalStore } from 'react';

/** How the writing page is drawn in the essay editor. */
export type PaperStyle = 'blank' | 'lined';

const STORAGE_KEY = 'scriverly:paper-style';
const listeners = new Set<() => void>();

function read(): PaperStyle {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === 'lined' ? 'lined' : 'blank';
  } catch {
    return 'blank'; // storage blocked (private mode, strict settings)
  }
}

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  window.addEventListener('storage', onChange); // keep other tabs in sync
  return () => {
    listeners.delete(onChange);
    window.removeEventListener('storage', onChange);
  };
}

/**
 * The writer's page-style preference. Stored in the browser, so it applies to
 * every essay on this device and needs no account round trip.
 */
export function usePaperStyle(): [PaperStyle, (style: PaperStyle) => void] {
  const style = useSyncExternalStore(subscribe, read, () => 'blank' as const);

  const setStyle = useCallback((next: PaperStyle) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Preference just won't persist
    }
    listeners.forEach(notify => notify());
  }, []);

  return [style, setStyle];
}
