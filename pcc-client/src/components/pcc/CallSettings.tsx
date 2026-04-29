import { useEffect, useState, type FC } from "react";
import { pccCallSettings } from "@/api/pcc";
import { toast } from "@/lib/toast";
import type { CallSettings, UpdateCallSettingsRequest } from "@/types";

type Form = Required<UpdateCallSettingsRequest>;

const EMPTY: Form = {
  get_customer_info_url: "",
  get_customer_info_timeout: 0,
  event_url: "",
  callout_answer_url: "",
};

// Description column copy lifted from the Stringee Call Settings dashboard.
const DESCRIPTIONS: Record<keyof Form, string> = {
  get_customer_info_url:
    "Stringee sends a GET request to this URL to get customer's info. When the client receives an incoming call, this info will be passed to the customDataFromYourServer field of the StringeeCall instance.",
  get_customer_info_timeout:
    "The timeout (in seconds) that Stringee will wait for the result of the GET request sent to get_customer_info_url.",
  event_url:
    "Stringee sends calls' events to this URL (on Your Server). These events will help you store call logs, make call reports.",
  callout_answer_url:
    "Stringee fetches an SCCO from this URL when bridging an outbound callout (agent → customer).",
};

const fromSettings = (s: CallSettings | undefined): Form =>
  s
    ? {
        get_customer_info_url: s.get_customer_info_url ?? "",
        get_customer_info_timeout: s.get_customer_info_timeout ?? 0,
        event_url: s.event_url ?? "",
        callout_answer_url: s.callout_answer_url ?? "",
      }
    : EMPTY;

interface RowProps {
  label: string;
  field: keyof Form;
  value: string | number;
  editing: boolean;
  onChange: (v: string) => void;
}

const Row: FC<RowProps> = ({ label, field, value, editing, onChange }) => (
  <tr className="border-b border-base-200 last:border-0">
    <td className="py-3 pr-4 align-top text-sm font-medium w-56 text-right">
      {label}:
    </td>
    <td className="py-3 pr-4 align-top w-[28rem]">
      {editing ? (
        <input
          type={field === "get_customer_info_timeout" ? "number" : "url"}
          className="input input-sm input-bordered w-full font-mono text-xs"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <span className="text-sm font-mono text-warning break-all">
          {value === "" || value === 0 ? (
            <em className="text-base-content/40">— not set —</em>
          ) : (
            value
          )}
        </span>
      )}
    </td>
    <td className="py-3 pl-4 text-xs text-base-content/60 italic">
      {DESCRIPTIONS[field]}
    </td>
  </tr>
);

const CallSettingsPanel: FC = () => {
  const [form, setForm] = useState<Form>(EMPTY);
  const [saved, setSaved] = useState<Form>(EMPTY);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = async (): Promise<void> => {
    setLoading(true);
    const res = await pccCallSettings.get();
    setLoading(false);
    if (res.status >= 200 && res.status < 300 && res.data?.callSetting) {
      const next = fromSettings(res.data.callSetting);
      setForm(next);
      setSaved(next);
    } else {
      toast.error(`Failed to load call settings (status ${res.status})`);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const set = (k: keyof Form) => (v: string) =>
    setForm((p) => ({
      ...p,
      [k]: k === "get_customer_info_timeout" ? Number(v) || 0 : v,
    }));

  const submit = async (): Promise<void> => {
    setSaving(true);
    const body: UpdateCallSettingsRequest = {};
    (Object.keys(form) as (keyof Form)[]).forEach((k) => {
      if (form[k] !== saved[k]) {
        // @ts-expect-error narrow union assignment via key index
        body[k] = form[k];
      }
    });
    if (Object.keys(body).length === 0) {
      setSaving(false);
      setEditing(false);
      return;
    }
    const res = await pccCallSettings.update(body);
    setSaving(false);
    if (res.status >= 200 && res.status < 300 && res.data?.r === 0) {
      toast.success("Call settings updated");
      setSaved(form);
      setEditing(false);
    } else {
      toast.error(
        `Update failed: ${res.data?.message ?? `status ${res.status}`}`,
      );
    }
  };

  const cancel = (): void => {
    setForm(saved);
    setEditing(false);
  };

  return (
    <div className="bg-base-100 border border-base-300 rounded-box">
      <header className="flex items-center justify-between px-6 py-4 border-b border-base-200">
        <h2 className="text-lg font-semibold">Call settings</h2>
        <div className="flex gap-2">
          {editing ? (
            <>
              <button
                className="btn btn-ghost btn-sm"
                onClick={cancel}
                disabled={saving}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary btn-sm"
                onClick={submit}
                disabled={saving}
              >
                {saving ? "Saving…" : "Save"}
              </button>
            </>
          ) : (
            <button
              className="btn btn-outline btn-sm"
              onClick={() => setEditing(true)}
              disabled={loading}
            >
              ✏️ Update
            </button>
          )}
        </div>
      </header>
      {loading ? (
        <div className="p-6 text-sm text-base-content/60">Loading…</div>
      ) : (
        <table className="w-full">
          <tbody>
            <Row
              label="Get customer info URL"
              field="get_customer_info_url"
              value={form.get_customer_info_url}
              editing={editing}
              onChange={set("get_customer_info_url")}
            />
            <Row
              label="Get customer info timeout"
              field="get_customer_info_timeout"
              value={form.get_customer_info_timeout}
              editing={editing}
              onChange={set("get_customer_info_timeout")}
            />
            <Row
              label="Event URL"
              field="event_url"
              value={form.event_url}
              editing={editing}
              onChange={set("event_url")}
            />
            <Row
              label="Callout answer URL"
              field="callout_answer_url"
              value={form.callout_answer_url}
              editing={editing}
              onChange={set("callout_answer_url")}
            />
          </tbody>
        </table>
      )}
    </div>
  );
};

export default CallSettingsPanel;
