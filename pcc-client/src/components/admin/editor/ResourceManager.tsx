import { useCallback, useEffect, useState, type FC } from "react";
import type { ApiResult } from "@/types";
import { toast } from "@/lib/toast";
import ConfirmModal from "../ConfirmModal";
import FieldInput from "./FieldInput";
import {
  bodyFromForm,
  emptyForm,
  formFromBody,
  isErr,
  type FormState,
} from "./model";
import type { ResourceSpec } from "./specs";

type Props = {
  spec: ResourceSpec;
};

type Pending =
  | { kind: "create"; body: Record<string, unknown> }
  | { kind: "update"; id: string; body: Record<string, unknown> }
  | { kind: "delete"; row: Record<string, unknown> }
  | null;

const dash = (v: unknown): string =>
  v === undefined || v === null || v === "" ? "—" : String(v);

const ResourceManager: FC<Props> = ({ spec }) => {
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState<FormState>(() => emptyForm(spec.fields));
  const [editId, setEditId] = useState<string | null>(null);
  const [pending, setPending] = useState<Pending>(null);
  const [busy, setBusy] = useState(false);
  const [lastResult, setLastResult] = useState<ApiResult | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    const res = await spec.list(page, 20);
    if (res.status < 200 || res.status >= 300) {
      setError(`HTTP ${res.status}`);
      setRows([]);
      toast.error(
        `${spec.title} — load failed (HTTP ${res.status || "network error"})`,
      );
    } else {
      const { rows: r, totalPages: tp } = spec.extractRows(res.data);
      setRows(r);
      setTotalPages(tp);
    }
    setLoading(false);
  }, [spec, page]);

  useEffect(() => {
    void load();
  }, [load]);

  const resetForm = (): void => {
    setForm(emptyForm(spec.fields));
    setEditId(null);
  };

  const startEdit = (row: Record<string, unknown>): void => {
    setForm(formFromBody(spec.fields, row));
    setEditId(String(row[spec.idKey] ?? ""));
  };

  const stageSubmit = (): void => {
    const r = bodyFromForm(spec.fields, form);
    if (isErr(r)) {
      setError(r.error);
      toast.warning(r.error);
      return;
    }
    setError("");
    setPending(
      editId
        ? { kind: "update", id: editId, body: r.value }
        : { kind: "create", body: r.value },
    );
  };

  const stageDelete = (row: Record<string, unknown>): void =>
    setPending({ kind: "delete", row });

  const runPending = async (): Promise<void> => {
    if (!pending) return;
    setBusy(true);
    let res: ApiResult;
    const kind = pending.kind;
    if (kind === "create") res = await spec.create(pending.body);
    else if (kind === "update")
      res = await spec.update(pending.id, pending.body);
    else res = await spec.remove(String(pending.row[spec.idKey] ?? ""));
    setLastResult(res);
    setBusy(false);
    setPending(null);
    const ok = res.status >= 200 && res.status < 300;
    const verb =
      kind === "create" ? "Created" : kind === "update" ? "Updated" : "Deleted";
    if (ok) {
      toast.success(`${verb} ${spec.name} — ${res.status}`);
      resetForm();
      void load();
    } else {
      toast.error(
        `${verb} ${spec.name} failed — HTTP ${res.status || "network error"}`,
      );
    }
  };

  const modalBody = (() => {
    if (!pending) return null;
    if (pending.kind === "delete") {
      return (
        <>
          Delete <code>{String(pending.row[spec.idKey] ?? "?")}</code>? This
          cannot be undone.
        </>
      );
    }
    const target =
      pending.kind === "create"
        ? `POST ${spec.restPath}`
        : `PUT ${spec.restPath}/${pending.id}`;
    return (
      <>
        <div className="text-xs text-base-content/60 mb-1">{target}</div>
        <pre className="bg-base-200 rounded-box p-2 text-xs overflow-auto max-h-60">
          {JSON.stringify(pending.body, null, 2)}
        </pre>
      </>
    );
  })();

  return (
    <div className="space-y-4">
      <div className="card bg-base-100 border border-base-300 shadow-sm">
        <div className="card-body gap-3">
          <div className="flex items-center gap-2">
            <span className="badge badge-neutral">
              {editId ? "PUT" : "POST"}
            </span>
            <h3 className="card-title text-base">
              {editId ? `Update ${spec.name} ${editId}` : `Create ${spec.name}`}
            </h3>
            {editId && (
              <button
                className="btn btn-ghost btn-xs ml-auto"
                onClick={resetForm}
              >
                Cancel edit
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {spec.fields.map((f) => (
              <FieldInput
                key={f.key}
                field={f}
                value={form[f.key]}
                onChange={(v) => setForm({ ...form, [f.key]: v })}
              />
            ))}
          </div>
          <div className="flex items-center gap-2">
            <button className="btn btn-primary btn-sm" onClick={stageSubmit}>
              {editId ? "Review update…" : "Review create…"}
            </button>
            {error && <span className="text-error text-xs">{error}</span>}
            {lastResult && (
              <span
                className={`badge badge-sm ml-auto ${
                  lastResult.status >= 200 && lastResult.status < 300
                    ? "badge-success"
                    : "badge-error"
                }`}
              >
                last: {lastResult.status}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="card bg-base-100 border border-base-300 shadow-sm">
        <div className="card-body gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="badge badge-neutral">GET</span>
            <h3 className="card-title text-base">{spec.title}</h3>
            <code className="text-xs text-base-content/60 ml-auto">
              {spec.restPath}
            </code>
            <button
              className="btn btn-outline btn-xs"
              onClick={() => void load()}
              disabled={loading}
            >
              {loading ? (
                <span className="loading loading-spinner loading-xs" />
              ) : (
                "Refresh"
              )}
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="table table-zebra table-sm">
              <thead>
                <tr>
                  {spec.columns.map((c) => (
                    <th key={c.key}>{c.label}</th>
                  ))}
                  <th className="w-px" />
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 && !loading && (
                  <tr>
                    <td
                      colSpan={spec.columns.length + 1}
                      className="text-center text-base-content/50"
                    >
                      No rows.
                    </td>
                  </tr>
                )}
                {rows.map((row, i) => (
                  <tr key={String(row[spec.idKey] ?? i)} className="hover">
                    {spec.columns.map((c) => (
                      <td
                        key={c.key}
                        className={c.key === "id" ? "font-mono text-xs" : ""}
                      >
                        {dash(c.render ? c.render(row) : row[c.key])}
                      </td>
                    ))}
                    <td className="whitespace-nowrap">
                      <button
                        className="btn btn-ghost btn-xs"
                        onClick={() => startEdit(row)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-ghost btn-xs text-error"
                        onClick={() => stageDelete(row)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="join">
            <button
              className="btn btn-outline btn-xs join-item"
              disabled={loading || page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              ‹ Prev
            </button>
            <button className="btn btn-ghost btn-xs join-item no-animation">
              Page {page} / {totalPages}
            </button>
            <button
              className="btn btn-outline btn-xs join-item"
              disabled={loading || page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next ›
            </button>
          </div>
        </div>
      </div>

      <ConfirmModal
        open={!!pending}
        title={
          pending?.kind === "delete"
            ? `Delete ${spec.name}?`
            : pending?.kind === "update"
              ? "Confirm update"
              : "Confirm create"
        }
        body={modalBody}
        confirmLabel={pending?.kind === "delete" ? "Delete" : "Send"}
        danger={pending?.kind === "delete"}
        busy={busy}
        onConfirm={runPending}
        onCancel={() => setPending(null)}
      />
    </div>
  );
};

export default ResourceManager;
