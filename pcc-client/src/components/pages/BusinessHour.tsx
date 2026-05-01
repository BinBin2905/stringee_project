import { useState, type FC } from "react";
import * as Icon from "@/components/Icons";

// Mirrors the Stringee dashboard "Business Hour" panel — local-only state
// for now (no backend route yet). The toggle and Details link are wired
// to console handlers; replace with real API when ready.
const BusinessHour: FC = () => {
  const [enabled, setEnabled] = useState(true);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Business Hour</h1>

      <button className="btn btn-success btn-sm gap-1 text-white shadow-sm">
        <span className="text-lg leading-none">+</span>
        Add Business Hour
      </button>

      <div className="border-t border-base-200 pt-4">
        <div className="flex items-center gap-4 py-2">
          <Icon.AlarmClock className="size-6 text-blue-400 shrink-0" />
          <span className="text-sm flex-1 max-w-[180px]">Default</span>

          <button
            type="button"
            onClick={() => setEnabled((v) => !v)}
            className="inline-flex items-center rounded-full border border-base-300 overflow-hidden text-xs font-semibold select-none"
            aria-pressed={enabled}
          >
            <span
              className={`px-3 py-1 transition-colors ${
                enabled
                  ? "bg-base-200 text-base-content/40"
                  : "bg-base-300 text-base-content"
              }`}
            >
              OFF
            </span>
            <span
              className={`px-3 py-1 transition-colors ${
                enabled
                  ? "bg-blue-500 text-white"
                  : "bg-base-200 text-base-content/40"
              }`}
            >
              ON
            </span>
          </button>

          <button
            type="button"
            className="text-blue-500 text-sm hover:underline"
            onClick={() => console.log("BusinessHour: details clicked")}
          >
            Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default BusinessHour;
