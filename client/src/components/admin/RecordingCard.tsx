import { useState, type FC } from "react";
import { adminApi } from "@/api/admin";

const FORMATS = ["mp3", "mp4", "wav"] as const;

const RecordingCard: FC = () => {
  const [recordId, setRecordId] = useState("");
  const [format, setFormat] = useState<(typeof FORMATS)[number]>("mp3");

  return (
    <div className="card bg-base-100 border border-base-300 shadow-sm">
      <div className="card-body gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="badge badge-neutral">GET</span>
          <h3 className="card-title text-base">Download recording</h3>
          <code className="text-xs text-base-content/60 ml-auto">
            /v1/call/recording/:id
          </code>
        </div>

        <div className="flex flex-wrap gap-3 items-end">
          <label className="form-control flex-1 min-w-64">
            <div className="label py-1">
              <span className="label-text text-xs">Record ID</span>
            </div>
            <input
              className="input input-bordered input-sm font-mono"
              placeholder="call-vn-1-..."
              value={recordId}
              onChange={(e) => setRecordId(e.target.value)}
            />
          </label>
          <label className="form-control">
            <div className="label py-1">
              <span className="label-text text-xs">Format</span>
            </div>
            <select
              className="select select-bordered select-sm"
              value={format}
              onChange={(e) =>
                setFormat(e.target.value as (typeof FORMATS)[number])
              }
            >
              {FORMATS.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <a
            className={`btn btn-primary btn-sm ${!recordId ? "btn-disabled" : ""}`}
            href={recordId ? adminApi.recordingUrl(recordId, format) : "#"}
            target="_blank"
            rel="noreferrer"
          >
            Download
          </a>
          {recordId && (
            <code className="text-xs text-base-content/60 break-all">
              {adminApi.recordingUrl(recordId, format)}
            </code>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecordingCard;
