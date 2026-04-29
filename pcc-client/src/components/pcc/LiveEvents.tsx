import { useEffect, useRef, useState, type FC } from "react";
import { adminApi, type RecordedPccEvent } from "@/api/admin";
import { toast } from "@/lib/toast";

// Polls /admin/pcc/events/recent every 2s and renders the live event
// stream pcc-server captures from /pcc/event-url. Newest first.

const POLL_MS = 2000;

const fmtTs = (ms: number): string => {
  const d = new Date(ms);
  return `${d.toLocaleTimeString()}.${String(d.getMilliseconds()).padStart(3, "0")}`;
};

const statusBadge = (s: string | undefined): string => {
  if (!s) return "badge-ghost";
  if (s === "ended" || s === "agentEnded") return "badge-neutral";
  if (s === "answered") return "badge-success";
  if (s === "ringing" || s === "started") return "badge-info";
  if (s === "connect_failed") return "badge-error";
  return "badge-primary";
};

const LiveEvents: FC = () => {
  const [events, setEvents] = useState<RecordedPccEvent[]>([]);
  const [paused, setPaused] = useState(false);
  const sinceRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    const tick = async (): Promise<void> => {
      if (cancelled || paused) return;
      const res = await adminApi.recentEvents(sinceRef.current);
      if (cancelled) return;
      const fresh = res.data?.events ?? [];
      if (fresh.length > 0) {
        sinceRef.current = Math.max(...fresh.map((e) => e.id));
        setEvents((prev) => [...fresh, ...prev].slice(0, 200));
      }
    };
    void tick();
    const id = setInterval(tick, POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [paused]);

  const clear = async (): Promise<void> => {
    const res = await adminApi.clearEvents();
    if (res.status >= 200 && res.status < 300) {
      sinceRef.current = undefined;
      setEvents([]);
      toast.info("Event log cleared");
    } else {
      toast.error(`Clear failed (status ${res.status})`);
    }
  };

  return (
    <div className="space-y-3">
      <div className="bg-base-100 border border-base-300 rounded-box p-3 flex items-center gap-2">
        <span className="badge badge-primary badge-sm">Live</span>
        <span className="text-xs text-base-content/60">
          Polling /admin/pcc/events/recent every {POLL_MS}ms
        </span>
        <div className="flex-1" />
        <button
          className="btn btn-ghost btn-xs"
          onClick={() => setPaused((p) => !p)}
        >
          {paused ? "Resume" : "Pause"}
        </button>
        <button className="btn btn-ghost btn-xs" onClick={() => void clear()}>
          Clear
        </button>
      </div>

      {events.length === 0 ? (
        <div className="bg-base-100 border border-base-300 rounded-box p-6 text-sm text-base-content/60 italic">
          Waiting for events… make a call and watch them stream in here.
        </div>
      ) : (
        <ul className="space-y-2">
          {events.map((e) => (
            <li
              key={e.id}
              className="bg-base-100 border border-base-300 rounded-box p-3"
            >
              <header className="flex items-center gap-2 text-xs">
                <span className={`badge badge-sm ${statusBadge(e.body.call_status)}`}>
                  {e.body.call_status ?? "unknown"}
                </span>
                <span className="text-base-content/50">{fmtTs(e.receivedAt)}</span>
                {e.body.call_id && (
                  <span className="font-mono text-[10px] text-base-content/40 truncate">
                    {e.body.call_id}
                  </span>
                )}
              </header>
              <div className="text-xs mt-1 grid grid-cols-2 gap-x-4 gap-y-0.5">
                {e.body.from?.number && (
                  <span>
                    <span className="text-base-content/50">from </span>
                    <span className="font-mono">{e.body.from.number}</span>
                    {e.body.from.alias && e.body.from.alias !== e.body.from.number && (
                      <span className="text-base-content/40"> ({e.body.from.alias})</span>
                    )}
                  </span>
                )}
                {e.body.to?.number && (
                  <span>
                    <span className="text-base-content/50">to </span>
                    <span className="font-mono">{e.body.to.number}</span>
                    {e.body.to.alias && e.body.to.alias !== e.body.to.number && (
                      <span className="text-base-content/40"> ({e.body.to.alias})</span>
                    )}
                  </span>
                )}
                {e.body.duration !== undefined && (
                  <span>
                    <span className="text-base-content/50">duration </span>
                    {e.body.duration}s
                  </span>
                )}
                {e.body.answerDuration !== undefined && (
                  <span>
                    <span className="text-base-content/50">talk </span>
                    {e.body.answerDuration}s
                  </span>
                )}
                {e.body.endCallCause && (
                  <span>
                    <span className="text-base-content/50">cause </span>
                    {e.body.endCallCause}
                  </span>
                )}
                {e.body.endedBy && (
                  <span>
                    <span className="text-base-content/50">ended by </span>
                    {e.body.endedBy}
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default LiveEvents;
