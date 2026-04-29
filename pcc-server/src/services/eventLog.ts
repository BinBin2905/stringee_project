import type { PccEventBody } from "../types/scco.js";

// Tiny in-memory ring buffer for inbound `event_url` payloads. The pcc
// admin UI polls this to render a live event feed without us needing
// websockets or external storage. Newest first, capped to keep memory
// flat across long dev sessions.

const MAX = 200;

export interface RecordedPccEvent {
  id: number;
  receivedAt: number;
  body: PccEventBody;
}

let buffer: RecordedPccEvent[] = [];
let nextId = 1;

export const eventLog = {
  push(body: PccEventBody): RecordedPccEvent {
    const entry: RecordedPccEvent = {
      id: nextId++,
      receivedAt: Date.now(),
      body,
    };
    buffer = [entry, ...buffer].slice(0, MAX);
    return entry;
  },

  // `since` returns only events with id > since, used by the UI for
  // incremental polling.
  recent(since?: number): RecordedPccEvent[] {
    if (since === undefined) return buffer;
    return buffer.filter((e) => e.id > since);
  },

  clear(): void {
    buffer = [];
  },
};
