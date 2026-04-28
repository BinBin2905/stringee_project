import { useCallback, useState, type FC } from "react";
import { adminApi } from "@/api/admin";
import { toast } from "@/lib/toast";
import type { StringeeResponse } from "@/types";

type CallRecord = Record<string, unknown> & {
  id?: string;
  uuid?: string;
  from_number?: string;
  to_number?: string;
  from_alias?: string;
  to_alias?: string;
  start_time?: number;
  start_time_datetime?: string;
  answer_duration?: number;
  recorded?: number;
  record_path?: string;
  video_call?: number;
};

type CallLogData = {
  calls?: CallRecord[];
  search_after?: [number | string, string];
  totalCalls?: number;
};

type Cursor = [number | string, string] | null;
const FORMATS = ["mp3", "mp4", "wav"] as const;

const fmtDuration = (sec?: number): string => {
  if (sec == null) return "—";
  return `${Math.floor(sec / 60)}m ${sec % 60}s`;
};

const fmtTime = (ms?: number): string =>
  ms ? new Date(ms).toLocaleString() : "—";

const buildQuery = (limit: number, cursor: Cursor): string => {
  const p = new URLSearchParams();
  p.set("version", "2");
  p.set("limit", String(limit));
  p.set("sort_by", "start_time");
  p.set("sort_order", "desc");
  if (cursor) {
    p.append("search_after[]", String(cursor[0]));
    p.append("search_after[]", String(cursor[1]));
  }
  return p.toString();
};

const CallLogCard: FC = () => {
  const [limit, setLimit] = useState(20);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [calls, setCalls] = useState<CallRecord[]>([]);
  const [page, setPage] = useState(0);
  const [stack, setStack] = useState<Cursor[]>([null]);
  const [next, setNext] = useState<Cursor>(null);
  const [total, setTotal] = useState<number | null>(null);
  const [selected, setSelected] = useState<CallRecord | null>(null);
  const [modalFormat, setModalFormat] = useState("mp3");

  const load = useCallback(
    async (cursor: Cursor) => {
      setLoading(true);
      setError("");
      try {
        const res = await adminApi.callLog(buildQuery(limit, cursor));
        if (res.status < 200 || res.status >= 300) {
          const msg = `HTTP ${res.status}`;
          setError(msg);
          setCalls([]);
          setNext(null);
          toast.error(`Call log — ${msg}`);
          return;
        }
        const body = res.data as StringeeResponse<CallLogData>;
        if (body?.r !== 0) {
          const msg = body?.message ?? "Unknown error";
          setError(msg);
          setCalls([]);
          setNext(null);
          toast.error(`Call log — ${msg}`);
          return;
        }
        setCalls(body.data?.calls ?? []);
        setNext(body.data?.search_after ?? null);
        setTotal(body.data?.totalCalls ?? null);
      } catch (err) {
        const msg = (err as Error).message;
        setError(msg);
        toast.error(`Call log — ${msg}`);
      } finally {
        setLoading(false);
      }
    },
    [limit],
  );

  const fetchFirst = async (): Promise<void> => {
    setPage(0);
    setStack([null]);
    await load(null);
  };

  const goNext = async (): Promise<void> => {
    if (!next) return;
    setStack((s) => [...s, next]);
    setPage((p) => p + 1);
    await load(next);
  };

  const goPrev = async (): Promise<void> => {
    if (page === 0) return;
    const newStack = stack.slice(0, -1);
    const prev = newStack[newStack.length - 1] ?? null;
    setStack(newStack);
    setPage((p) => p - 1);
    await load(prev);
  };

  const openDetails = (c: CallRecord): void => {
    setSelected(c);
    setModalFormat("mp3");
  };

  return (
    <div className="card bg-base-100 border border-base-300 shadow-sm">
      <div className="card-body gap-4">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="badge badge-neutral">GET</span>
          <h3 className="card-title text-base">Call log</h3>
          <code className="text-xs text-base-content/60 ml-auto">
            /v1/call/log
          </code>
        </div>

        <div className="flex items-end gap-3 flex-wrap">
          <label className="form-control">
            <div className="label py-1">
              <span className="label-text text-xs">Page size</span>
            </div>
            <input
              type="number"
              min={1}
              max={1000}
              className="input input-bordered input-sm w-24"
              value={limit}
              onChange={(e) =>
                setLimit(Math.max(1, Math.min(1000, Number(e.target.value))))
              }
            />
          </label>
          <button
            className="btn btn-primary btn-sm"
            disabled={loading}
            onClick={fetchFirst}
          >
            {loading ? (
              <span className="loading loading-spinner loading-xs" />
            ) : (
              "Fetch"
            )}
          </button>
          {total != null && (
            <span className="badge badge-outline ml-auto">Total: {total}</span>
          )}
        </div>

        {error && (
          <div role="alert" className="alert alert-error text-xs py-2">
            <span>{error}</span>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="table table-zebra table-sm">
            <thead>
              <tr>
                <th>Start</th>
                <th>From</th>
                <th>To</th>
                <th>Duration</th>
                <th>Rec</th>
                <th>Video</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {calls.length === 0 && !loading && (
                <tr>
                  <td colSpan={7} className="text-center text-base-content/50">
                    No records — click Fetch.
                  </td>
                </tr>
              )}
              {calls.map((c) => (
                <tr
                  key={c.id ?? c.uuid ?? Math.random()}
                  className="hover cursor-pointer"
                  onClick={() => openDetails(c)}
                >
                  <td className="whitespace-nowrap">
                    {c.start_time_datetime ?? fmtTime(c.start_time)}
                  </td>
                  <td>{c.from_alias || c.from_number || "—"}</td>
                  <td>{c.to_alias || c.to_number || "—"}</td>
                  <td>{fmtDuration(c.answer_duration)}</td>
                  <td>
                    <span
                      className={`badge badge-sm ${c.recorded ? "badge-success" : "badge-ghost"}`}
                    >
                      {c.recorded ? "yes" : "no"}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`badge badge-sm ${c.video_call ? "badge-info" : "badge-ghost"}`}
                    >
                      {c.video_call ? "video" : "audio"}
                    </span>
                  </td>
                  <td>
                    <button className="btn btn-ghost btn-xs">Details</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="join">
          <button
            className="btn btn-outline btn-sm join-item"
            disabled={loading || page === 0}
            onClick={goPrev}
          >
            ‹ Prev
          </button>
          <button className="btn btn-ghost btn-sm join-item no-animation">
            Page {page + 1}
          </button>
          <button
            className="btn btn-outline btn-sm join-item"
            disabled={loading || !next}
            onClick={goNext}
          >
            Next ›
          </button>
        </div>
      </div>

      {selected && (
        <dialog className="modal modal-open">
          <div className="modal-box max-w-3xl">
            <button
              className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
              onClick={() => setSelected(null)}
            >
              ✕
            </button>
            <h3 className="font-bold text-lg mb-3">Call details</h3>
            <div className="stats stats-vertical sm:stats-horizontal bg-base-200 w-full mb-3">
              <div className="stat py-2 px-3">
                <div className="stat-title text-[10px]">Start</div>
                <div className="stat-value text-sm">
                  {selected.start_time_datetime ?? fmtTime(selected.start_time)}
                </div>
              </div>
              <div className="stat py-2 px-3">
                <div className="stat-title text-[10px]">Duration</div>
                <div className="stat-value text-sm">
                  {fmtDuration(selected.answer_duration)}
                </div>
              </div>
              <div className="stat py-2 px-3">
                <div className="stat-title text-[10px]">From → To</div>
                <div className="stat-value text-sm">
                  {String(selected.from_alias ?? selected.from_number ?? "—")}{" "}
                  →{" "}
                  {String(selected.to_alias ?? selected.to_number ?? "—")}
                </div>
              </div>
            </div>

            <div className="text-xs mb-3">
              <span className="text-base-content/60">ID: </span>
              <code className="break-all">
                {String(selected.id ?? selected.uuid ?? "—")}
              </code>
            </div>

            {selected.record_path && (
              <div className="flex flex-col gap-1 mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-base-content/60">
                    Recording:
                  </span>
                  <select
                    className="select select-bordered select-xs"
                    value={modalFormat}
                    onChange={(e) => setModalFormat(e.target.value)}
                  >
                    {FORMATS.map((f) => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                  </select>
                  <a
                    className="btn btn-primary btn-xs"
                    href={adminApi.recordingUrl(
                      String(selected.id ?? ""),
                      modalFormat,
                    )}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Download
                  </a>
                </div>
                <code className="text-xs text-base-content/50 break-all">
                  {String(selected.record_path)}
                </code>
              </div>
            )}

            <div className="collapse collapse-arrow bg-base-200">
              <input type="checkbox" />
              <div className="collapse-title text-sm font-medium">
                Raw JSON
              </div>
              <div className="collapse-content">
                <pre className="text-xs overflow-auto max-h-80">
                  {JSON.stringify(selected, null, 2)}
                </pre>
              </div>
            </div>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button onClick={() => setSelected(null)}>close</button>
          </form>
        </dialog>
      )}
    </div>
  );
};

export default CallLogCard;
