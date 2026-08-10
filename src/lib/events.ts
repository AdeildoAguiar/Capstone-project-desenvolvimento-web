import { AppEvent } from '../types';

/**
 * A device-wide activity log shared by every account. It's the closest a
 * client-only app can get to the server-side table an admin dashboard would
 * normally read. Kept small (most recent 2000 events).
 */
const EVENTS_KEY = 'biblio_events';
const MAX_EVENTS = 2000;

export function getEvents(): AppEvent[] {
  try {
    const raw = localStorage.getItem(EVENTS_KEY);
    return raw ? (JSON.parse(raw) as AppEvent[]) : [];
  } catch {
    return [];
  }
}

export function saveEvents(events: AppEvent[]) {
  const trimmed = events.slice(-MAX_EVENTS);
  localStorage.setItem(EVENTS_KEY, JSON.stringify(trimmed));
  // Let listeners in the same tab (e.g. the admin page) react immediately.
  window.dispatchEvent(new CustomEvent('biblio:events'));
}

export function logEvent(event: Omit<AppEvent, 'id' | 'at'> & { at?: string }) {
  const full: AppEvent = {
    id: crypto.randomUUID(),
    at: event.at ?? new Date().toISOString(),
    ...event,
  };
  saveEvents([...getEvents(), full]);
  return full;
}
