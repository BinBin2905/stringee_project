import type { FC } from "react";
import type { RecordFormat } from "@/types";

type Props = {
  record: boolean;
  onToggle: () => void;
  format: RecordFormat;
  onFormatChange: (v: RecordFormat) => void;
  stereo: boolean;
  onStereoChange: (v: boolean) => void;
};

const RecordingCard: FC<Props> = (p) => (
  <div className="card bg-base-100 border border-base-300 shadow-sm">
    <div className="card-body gap-3">
      <div className="flex items-center justify-between">
        <h2 className="card-title text-base">Recording</h2>
        <input
          type="checkbox"
          className="toggle toggle-primary toggle-sm"
          checked={p.record}
          onChange={p.onToggle}
          aria-label="Toggle recording"
        />
      </div>

      {p.record && (
        <div className="flex flex-wrap gap-4">
          <div>
            <div className="label py-1">
              <span className="label-text text-xs uppercase tracking-wider">
                Format
              </span>
            </div>
            <div className="join">
              {(["mp3", "wav"] as RecordFormat[]).map((f) => (
                <button
                  key={f}
                  className={`btn btn-sm join-item ${
                    p.format === f ? "btn-primary" : "btn-outline"
                  }`}
                  onClick={() => p.onFormatChange(f)}
                >
                  {f.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="label py-1">
              <span className="label-text text-xs uppercase tracking-wider">
                Stereo
              </span>
            </div>
            <input
              type="checkbox"
              className="toggle toggle-sm"
              checked={p.stereo}
              onChange={(e) => p.onStereoChange(e.target.checked)}
            />
          </div>
        </div>
      )}
    </div>
  </div>
);

export default RecordingCard;
