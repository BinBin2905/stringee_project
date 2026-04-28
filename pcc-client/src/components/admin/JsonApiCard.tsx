import { useState, type FC } from "react";
import type { ApiResult } from "@/types";
import { toast } from "@/lib/toast";

type Props = {
  title: string;
  method: string;
  path: string;
  description?: string;
  initialBody: string;
  onSend: (body: unknown) => Promise<ApiResult>;
};

const parseJson = (raw: string): unknown => {
  try {
    return JSON.parse(raw);
  } catch {
    return { __invalid: true, raw };
  }
};

const JsonApiCard: FC<Props> = ({
  title,
  method,
  path,
  description,
  initialBody,
  onSend,
}) => {
  const [body, setBody] = useState(initialBody);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ApiResult | null>(null);

  const handleSend = async (): Promise<void> => {
    const parsed = parseJson(body);
    if ((parsed as { __invalid?: boolean }).__invalid) {
      toast.error(`${title} — request body is not valid JSON`);
      return;
    }
    setLoading(true);
    try {
      const res = await onSend(parsed);
      setResult(res);
      const ok = res.status >= 200 && res.status < 300;
      if (ok) toast.success(`${title} — ${res.status}`);
      else toast.error(`${title} — HTTP ${res.status || "network error"}`);
    } finally {
      setLoading(false);
    }
  };

  const statusClass = !result
    ? ""
    : result.status >= 200 && result.status < 300
      ? "badge-success"
      : "badge-error";

  return (
    <div className="card bg-base-100 border border-base-300 shadow-sm">
      <div className="card-body gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="badge badge-neutral">{method}</span>
          <h3 className="card-title text-base">{title}</h3>
          <code className="text-xs text-base-content/60 ml-auto">{path}</code>
        </div>
        {description && (
          <p className="text-xs text-base-content/70">{description}</p>
        )}

        <label className="form-control">
          <div className="label py-1">
            <span className="label-text text-xs">Request body (JSON)</span>
          </div>
          <textarea
            className="textarea textarea-bordered font-mono text-xs"
            rows={8}
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
        </label>

        <div className="flex items-center gap-2">
          <button
            className="btn btn-primary btn-sm"
            disabled={loading}
            onClick={handleSend}
          >
            {loading ? (
              <span className="loading loading-spinner loading-xs" />
            ) : (
              "Send"
            )}
          </button>
          {result && (
            <span className={`badge ${statusClass}`}>{result.status}</span>
          )}
        </div>

        {result && (
          <pre className="bg-base-200 rounded-box p-3 text-xs overflow-auto max-h-64">
            {JSON.stringify(result.data, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
};

export default JsonApiCard;
