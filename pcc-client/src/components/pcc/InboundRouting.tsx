import { useEffect, useMemo, useState, type FC } from "react";
import { pcc, pccRouting } from "@/api/pcc";
import type {
  Agent,
  ApiResult,
  Group,
  GroupAgent,
  GroupRouting,
  IvrTree,
  ListAgentsResponse,
  ListGroupsResponse,
  ListIvrTreesResponse,
  ListNumbersResponse,
  ListQueuesResponse,
  PccNumber,
  Queue,
} from "@/types";

// Visualizes the inbound chain a PSTN call follows once it lands:
//   Number  ──▶ (IVR | Queue) ──▶ Group(s) ──▶ Agent(s)
// All segments come from PCC REST resources; we don't proxy anything
// custom — just stitch the existing data together.

const useDirectory = () => {
  const [numbers, setNumbers] = useState<PccNumber[]>([]);
  const [queues, setQueues] = useState<Queue[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [ivrTrees, setIvrTrees] = useState<IvrTree[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      const [n, q, g, a, t] = await Promise.all([
        pcc.number.list("page=1&limit=100") as Promise<
          ApiResult<ListNumbersResponse>
        >,
        pcc.queue.list("page=1&limit=100") as Promise<
          ApiResult<ListQueuesResponse>
        >,
        pcc.group.list("page=1&limit=100") as Promise<
          ApiResult<ListGroupsResponse>
        >,
        pcc.agent.list("page=1&limit=200") as Promise<
          ApiResult<ListAgentsResponse>
        >,
        pcc.ivrTree.list("page=1&limit=100") as Promise<
          ApiResult<ListIvrTreesResponse>
        >,
      ]);
      setNumbers(n.data?.data?.numbers ?? []);
      setQueues(q.data?.data?.queues ?? []);
      setGroups(g.data?.data?.groups ?? []);
      setAgents(a.data?.data?.agents ?? []);
      setIvrTrees(t.data?.data?.ivrTrees ?? []);
      setLoading(false);
    })();
  }, []);

  return { numbers, queues, groups, agents, ivrTrees, loading };
};

const InboundRouting: FC = () => {
  const dir = useDirectory();
  const [selected, setSelected] = useState<string>("");
  const [routings, setRoutings] = useState<GroupRouting[]>([]);
  const [groupAgents, setGroupAgents] = useState<Record<string, GroupAgent[]>>({});
  const [chainLoading, setChainLoading] = useState(false);

  const number = useMemo(
    () => dir.numbers.find((n) => n.id === selected),
    [selected, dir.numbers],
  );
  const queue = useMemo(
    () => (number?.queue_id ? dir.queues.find((q) => q.id === number.queue_id) : undefined),
    [number, dir.queues],
  );
  const ivrTree = useMemo(
    () =>
      number?.ivr_menu
        ? dir.ivrTrees.find((t) => t.id === number.ivr_menu)
        : undefined,
    [number, dir.ivrTrees],
  );

  // Once a queue is known, fetch its group routings and each group's agents.
  useEffect(() => {
    if (!queue) {
      setRoutings([]);
      setGroupAgents({});
      return;
    }
    void (async () => {
      setChainLoading(true);
      const routingsRes = await pccRouting.groupRoutings(queue.id);
      const list = routingsRes.data?.data?.groupRoutings ?? [];
      setRoutings(list);

      const map: Record<string, GroupAgent[]> = {};
      await Promise.all(
        list.map(async (gr) => {
          const ga = await pccRouting.groupAgents(gr.group_id);
          map[gr.group_id] = ga.data?.data?.groupAgents ?? [];
        }),
      );
      setGroupAgents(map);
      setChainLoading(false);
    })();
  }, [queue]);

  if (dir.loading) {
    return <div className="p-6 text-sm">Loading directory…</div>;
  }

  return (
    <div className="space-y-4">
      <div className="bg-base-100 border border-base-300 rounded-box p-4">
        <label className="form-control max-w-md">
          <div className="label py-1">
            <span className="label-text text-sm font-medium">Pick a number</span>
          </div>
          <select
            className="select select-sm select-bordered"
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
          >
            <option value="">— select number —</option>
            {dir.numbers.map((n) => (
              <option key={n.id} value={n.id}>
                {n.number}
                {n.nickname ? ` · ${n.nickname}` : ""}
              </option>
            ))}
          </select>
        </label>
      </div>

      {!number ? (
        <div className="text-sm text-base-content/60 italic">
          Select a number to inspect its inbound chain.
        </div>
      ) : (
        <div className="space-y-3">
          <Step
            title="① Number"
            tone="primary"
            body={
              <div className="space-y-1 text-sm">
                <Row k="Number" v={number.number} />
                {number.nickname && <Row k="Nickname" v={number.nickname} />}
                <Row
                  k="Outbound calls"
                  v={number.allow_outbound_calls ? "allowed" : "disabled"}
                />
                <Row
                  k="IVR routing"
                  v={number.enable_ivr ? "enabled" : "disabled"}
                />
              </div>
            }
          />

          {number.enable_ivr ? (
            <Step
              title="② IVR Tree"
              tone="info"
              body={
                ivrTree ? (
                  <div className="text-sm space-y-1">
                    <Row k="Tree" v={ivrTree.tree_name} />
                    <Row k="Tree id" v={ivrTree.id} />
                    {ivrTree.root_node && (
                      <Row k="Root node" v={ivrTree.root_node} />
                    )}
                    <p className="text-xs text-base-content/60 mt-2">
                      Use the IVR Tree / IVR Tree Node / IVR Keypress tabs to
                      inspect the per-key routing.
                    </p>
                  </div>
                ) : (
                  <Missing label="No IVR tree linked (set ivr_menu on the number)" />
                )
              }
            />
          ) : (
            <Step
              title="② Queue"
              tone="info"
              body={
                queue ? (
                  <div className="text-sm space-y-1">
                    <Row k="Queue" v={queue.name} />
                    <Row k="Queue id" v={queue.id} />
                    <Row k="Schedule" v={queue.schedule === 1 ? "always" : "business hours"} />
                    <Row
                      k="Wrap-up after calls"
                      v={queue.agent_wrap_up_after_calls === 1 ? "yes" : "no"}
                    />
                  </div>
                ) : (
                  <Missing label="No queue linked (set queue_id on the number)" />
                )
              }
            />
          )}

          {queue && (
            <Step
              title="③ Groups routed to this queue"
              tone="success"
              body={
                chainLoading ? (
                  <div className="text-xs">Loading groups…</div>
                ) : routings.length === 0 ? (
                  <Missing label="No group routings — calls cannot reach an agent" />
                ) : (
                  <ul className="space-y-2">
                    {routings.map((gr) => {
                      const g = dir.groups.find((x) => x.id === gr.group_id);
                      const ga = groupAgents[gr.group_id] ?? [];
                      return (
                        <li
                          key={gr.id}
                          className="border border-base-200 rounded-md p-2"
                        >
                          <div className="text-sm font-medium">
                            {g?.name ?? gr.group_id}
                            <span className="badge badge-sm badge-ghost ml-2">
                              {gr.primary_group === 1 ? "primary" : "fallback"}
                            </span>
                          </div>
                          <div className="text-xs text-base-content/60 mt-1">
                            {ga.length === 0 ? (
                              <em>No agents assigned</em>
                            ) : (
                              <span>
                                {ga.length} agent
                                {ga.length === 1 ? "" : "s"}:&nbsp;
                                {ga
                                  .map((x) => {
                                    const a = dir.agents.find(
                                      (z) => z.id === x.agent_id,
                                    );
                                    return a
                                      ? `${a.name} (${a.stringee_user_id})`
                                      : x.agent_id;
                                  })
                                  .join(", ")}
                              </span>
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )
              }
            />
          )}
        </div>
      )}
    </div>
  );
};

const Step: FC<{
  title: string;
  tone: "primary" | "info" | "success";
  body: React.ReactNode;
}> = ({ title, tone, body }) => (
  <section
    className={`bg-base-100 border-l-4 border border-base-300 rounded-box p-4 border-l-${tone}`}
  >
    <h3 className="text-sm font-semibold mb-2">{title}</h3>
    {body}
  </section>
);

const Row: FC<{ k: string; v: string }> = ({ k, v }) => (
  <div className="flex gap-2">
    <span className="text-base-content/60 w-32 shrink-0">{k}</span>
    <span className="font-mono text-xs">{v}</span>
  </div>
);

const Missing: FC<{ label: string }> = ({ label }) => (
  <div className="text-xs text-warning italic">{label}</div>
);

export default InboundRouting;
