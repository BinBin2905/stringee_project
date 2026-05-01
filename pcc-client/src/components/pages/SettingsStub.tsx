import { type FC } from "react";

// Placeholder for settings sections that don't have a backend route yet
// (Greeting file, Button Call settings, Blacklist number).
const SettingsStub: FC<{ title: string; note?: string }> = ({
  title,
  note,
}) => (
  <div className="space-y-6">
    <h1 className="text-2xl font-semibold">{title}</h1>
    <div className="card bg-base-200 border border-base-300">
      <div className="card-body items-center text-center text-sm text-base-content/60">
        <p>{note ?? "Not yet wired to the PCC API."}</p>
      </div>
    </div>
  </div>
);

export default SettingsStub;
