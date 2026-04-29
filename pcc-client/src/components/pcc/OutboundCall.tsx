import { useEffect, useState, type FC } from "react";
import { adminApi } from "@/api/admin";
import { pcc } from "@/api/pcc";
import { toast } from "@/lib/toast";
import type {
  Agent,
  ApiResult,
  CalloutRequest,
  CalloutResponse,
  ListAgentsResponse,
  ListNumbersResponse,
  PccNumber,
} from "@/types";

// Outbound dialing flow per
// developer.stringee.com/docs/rest-api-reference/Make-call-to-an-agent-then-connect-the-call-to-a-phone:
// proxy POSTs to /v1/call/callout, Stringee dials the agent first, then
// bridges to the customer.

interface FormState {
  agentUserId: string;
  toAgentFromNumberDisplay: string;
  toAgentFromNumberDisplayAlias: string;
  toCustomerFromNumber: string;
  customerNumber: string;
}

const EMPTY: FormState = {
  agentUserId: "",
  toAgentFromNumberDisplay: "",
  toAgentFromNumberDisplayAlias: "",
  toCustomerFromNumber: "",
  customerNumber: "",
};

const OutboundCall: FC = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [numbers, setNumbers] = useState<PccNumber[]>([]);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<ApiResult<CalloutResponse> | null>(null);

  useEffect(() => {
    void (async () => {
      const [a, n] = await Promise.all([
        pcc.agent.list("page=1&limit=50") as Promise<
          ApiResult<ListAgentsResponse>
        >,
        pcc.number.list("page=1&limit=50") as Promise<
          ApiResult<ListNumbersResponse>
        >,
      ]);
      if (a.status >= 200 && a.status < 300) {
        setAgents(a.data?.data?.agents ?? []);
      }
      if (n.status >= 200 && n.status < 300) {
        setNumbers((n.data?.data?.numbers ?? []).filter((x) => x.allow_outbound_calls));
      }
    })();
  }, []);

  const set = <K extends keyof FormState>(k: K) =>
    (v: FormState[K]) =>
      setForm((p) => ({ ...p, [k]: v }));

  const submit = async (): Promise<void> => {
    if (
      !form.agentUserId ||
      !form.toAgentFromNumberDisplay ||
      !form.customerNumber
    ) {
      toast.warning("Agent, hotline, and customer number are required");
      return;
    }
    setSubmitting(true);
    setResult(null);
    const body: CalloutRequest = {
      agentUserId: form.agentUserId,
      toAgentFromNumberDisplay: form.toAgentFromNumberDisplay,
      toAgentFromNumberDisplayAlias:
        form.toAgentFromNumberDisplayAlias || form.toAgentFromNumberDisplay,
      toCustomerFromNumber:
        form.toCustomerFromNumber || form.toAgentFromNumberDisplay,
      customerNumber: form.customerNumber,
    };
    const res = (await adminApi.callout(body)) as ApiResult<CalloutResponse>;
    setResult(res);
    setSubmitting(false);
    if (res.status >= 200 && res.status < 300 && res.data?.r === 0) {
      toast.success(
        `Callout queued${res.data.callId ? ` — ${res.data.callId}` : ""}`,
      );
    } else {
      toast.error(
        `Callout failed: ${res.data?.message ?? res.data?.msg ?? `status ${res.status}`}`,
      );
    }
  };

  return (
    <div className="bg-base-100 border border-base-300 rounded-box p-6 space-y-4">
      <header>
        <h2 className="text-lg font-semibold">Outbound Call (agent → customer)</h2>
        <p className="text-xs text-base-content/60">
          Stringee dials the agent first using the chosen hotline, then bridges
          to the customer.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Field label="Agent" hint="stringee_user_id of the agent to dial">
          <select
            className="select select-sm select-bordered w-full"
            value={form.agentUserId}
            onChange={(e) => set("agentUserId")(e.target.value)}
          >
            <option value="">— select agent —</option>
            {agents.map((a) => (
              <option key={a.id} value={a.stringee_user_id}>
                {a.name} · {a.stringee_user_id}
              </option>
            ))}
          </select>
        </Field>

        <Field
          label="Hotline shown to agent"
          hint="toAgentFromNumberDisplay — must allow outbound calls"
        >
          <select
            className="select select-sm select-bordered w-full"
            value={form.toAgentFromNumberDisplay}
            onChange={(e) => set("toAgentFromNumberDisplay")(e.target.value)}
          >
            <option value="">— select number —</option>
            {numbers.map((n) => (
              <option key={n.id} value={n.number}>
                {n.number}
                {n.nickname ? ` · ${n.nickname}` : ""}
              </option>
            ))}
          </select>
        </Field>

        <Field
          label="Alias (optional)"
          hint="toAgentFromNumberDisplayAlias — falls back to the hotline"
        >
          <input
            type="text"
            className="input input-sm input-bordered w-full"
            value={form.toAgentFromNumberDisplayAlias}
            onChange={(e) =>
              set("toAgentFromNumberDisplayAlias")(e.target.value)
            }
            placeholder="Support hotline"
          />
        </Field>

        <Field
          label="Caller-id shown to customer (optional)"
          hint="toCustomerFromNumber — falls back to the agent hotline"
        >
          <input
            type="text"
            className="input input-sm input-bordered w-full"
            value={form.toCustomerFromNumber}
            onChange={(e) => set("toCustomerFromNumber")(e.target.value)}
            placeholder="Same as hotline"
          />
        </Field>

        <Field label="Customer number" hint="customerNumber — destination phone">
          <input
            type="tel"
            className="input input-sm input-bordered w-full font-mono"
            value={form.customerNumber}
            onChange={(e) => set("customerNumber")(e.target.value)}
            placeholder="+8412..."
          />
        </Field>
      </div>

      <div className="flex justify-end gap-2">
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => {
            setForm(EMPTY);
            setResult(null);
          }}
        >
          Reset
        </button>
        <button
          className="btn btn-primary btn-sm"
          onClick={submit}
          disabled={submitting}
        >
          {submitting ? "Dialing…" : "📞 Place call"}
        </button>
      </div>

      {result && (
        <pre className="bg-base-200 text-xs p-3 rounded-md overflow-auto">
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  );
};

const Field: FC<{
  label: string;
  hint?: string;
  children: React.ReactNode;
}> = ({ label, hint, children }) => (
  <label className="form-control">
    <div className="label py-1">
      <span className="label-text text-xs font-medium">{label}</span>
    </div>
    {children}
    {hint && (
      <div className="label py-0">
        <span className="label-text-alt text-[10px] text-base-content/50">
          {hint}
        </span>
      </div>
    )}
  </label>
);

export default OutboundCall;
