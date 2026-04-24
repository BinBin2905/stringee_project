import { useState, type FC } from "react";
import JsonApiCard from "../JsonApiCard";
import ActionForm from "./ActionForm";
import ResourceManager from "./ResourceManager";
import { ActionSpec, ResourceSpec, type Spec } from "./specs";

type Props = {
  spec: Spec;
  // Read-only mode for ResourceSpec (AdminPage side) — hides the form and
  // surfaces a "Manage on PCC →" link. Ignored for ActionSpec.
  readonly?: boolean;
};

// Toggles between the structured Table editor and a raw JSON card.
// The JSON side hits the spec's primary write endpoint (create / send).
const DualEditor: FC<Props> = ({ spec, readonly }) => {
  const [mode, setMode] = useState<"table" | "json">("table");

  const table =
    spec instanceof ResourceSpec ? (
      <ResourceManager spec={spec} readonly={readonly} />
    ) : spec instanceof ActionSpec ? (
      <ActionForm spec={spec} />
    ) : null;

  const json =
    spec instanceof ResourceSpec ? (
      <JsonApiCard
        title={`${spec.title} — create`}
        method="POST"
        path={spec.restPath}
        description="Raw JSON for the create (POST) endpoint. Update / Delete are in Table mode."
        initialBody={JSON.stringify(spec.exampleBody, null, 2)}
        onSend={(b) => spec.create(b)}
      />
    ) : spec instanceof ActionSpec ? (
      <JsonApiCard
        title={spec.title}
        method={spec.method}
        path={spec.restPath}
        initialBody={JSON.stringify(spec.initialBody, null, 2)}
        onSend={(b) => spec.send(b)}
      />
    ) : null;

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
      {mode === "table" ? table : json}
    </div>
  );
};

export default DualEditor;
