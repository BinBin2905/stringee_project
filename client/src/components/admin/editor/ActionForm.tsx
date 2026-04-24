import { useState, type FC } from "react";
import type { ApiResult } from "@/types";
import ConfirmModal from "../ConfirmModal";
import FieldInput from "./FieldInput";
import { bodyFromForm, formFromBody, isErr, type FormState } from "./model";
import type { ActionSpec } from "./specs";

// Single-shot form editor for an ActionSpec (POST, no list).
// Fill → Review → Confirm modal → send.
const ActionForm: FC<{ spec: ActionSpec }> = ({ spec }) => {
  const [form, setForm] = useState<FormState>(() =>
    formFromBody(spec.fields, spec.initialBody),
  );
  const [error, setError] = useState("");
  const [pending, setPending] = useState<Record<string, unknown> | null>(null);
  const [busy, setBusy] = useState(false);
  const [lastResult, setLastResult] = useState<ApiResult | null>(null);

  const stage = (): void => {
    const r = bodyFromForm(spec.fields, form);
    if (isErr(r)) {
      setError(r.error);
      return;
    }
    setError("");
    setPending(r.value);
  };

  const run = async (): Promise<void> => {
    if (!pending) return;
    setBusy(true);
    const res = await spec.send(pending);
    setLastResult(res);
    setBusy(false);
    setPending(null);
  };

  return (
    <div className="card bg-base-100 border border-base-300 shadow-sm">
      <div className="card-body gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="badge badge-neutral">{spec.method}</span>
          <h3 className="card-title text-base">{spec.title}</h3>
          <code className="text-xs text-base-content/60 ml-auto">
            {spec.restPath}
          </code>
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
          <button className="btn btn-primary btn-sm" onClick={stage}>
            Review…
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

        {lastResult && (
          <pre className="bg-base-200 rounded-box p-3 text-xs overflow-auto max-h-64">
            {JSON.stringify(lastResult.data, null, 2)}
          </pre>
        )}
      </div>

      <ConfirmModal
        open={!!pending}
        title="Confirm send"
        body={
          pending && (
            <>
              <div className="text-xs text-base-content/60 mb-1">
                {spec.method} {spec.restPath}
              </div>
              <pre className="bg-base-200 rounded-box p-2 text-xs overflow-auto max-h-60">
                {JSON.stringify(pending, null, 2)}
              </pre>
            </>
          )
        }
        confirmLabel="Send"
        busy={busy}
        onConfirm={run}
        onCancel={() => setPending(null)}
      />
    </div>
  );
};

export default ActionForm;
