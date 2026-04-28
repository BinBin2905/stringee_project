import { useState, type FC } from "react";
import JsonApiCard from "../JsonApiCard";
import ActionForm from "./ActionForm";
import type { ActionSpec } from "./specs";

type Props = {
  spec: ActionSpec;
};

// Toggles between the structured form (Table) and a raw JSON card.
// Both hit the same write endpoint via spec.send.
const DualEditor: FC<Props> = ({ spec }) => {
  const [mode, setMode] = useState<"table" | "json">("table");

  return (
    <div className="space-y-3">
      <div className="join">
        <button
          className={`btn btn-xs join-item ${
            mode === "table" ? "btn-primary" : "btn-outline"
          }`}
          onClick={() => setMode("table")}
        >
          Table edit
        </button>
        <button
          className={`btn btn-xs join-item ${
            mode === "json" ? "btn-primary" : "btn-outline"
          }`}
          onClick={() => setMode("json")}
        >
          JSON edit
        </button>
      </div>
      {mode === "table" ? (
        <ActionForm spec={spec} />
      ) : (
        <JsonApiCard
          title={spec.title}
          method={spec.method}
          path={spec.restPath}
          initialBody={JSON.stringify(spec.initialBody, null, 2)}
          onSend={(b) => spec.send(b)}
        />
      )}
    </div>
  );
};

export default DualEditor;
