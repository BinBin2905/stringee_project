import { useState, type FC, type ReactNode } from "react";
import { adminApi, type EndpointKey } from "@/api/admin";
import JsonApiCard from "./JsonApiCard";
import CallLogCard from "./CallLogCard";
import RecordingCard from "./RecordingCard";

// One row per tab. `render` receives the current index — allows each card
// to be lazy-rendered only when its tab is active.
type Tab = {
  key: string;
  label: string;
  render: () => ReactNode;
};

const postCard = (
  title: string,
  endpoint: Extract<EndpointKey, `${string}`>,
  path: string,
  body: unknown,
  description?: string,
): (() => ReactNode) => () => (
  <JsonApiCard
    title={title}
    method="POST"
    path={path}
    description={description}
    initialBody={JSON.stringify(body, null, 2)}
    onSend={(b) => adminApi.post(endpoint, b)}
  />
);

const TABS: Tab[] = [
  {
    key: "token",
    label: "REST Token",
    render: () => (
      <JsonApiCard
        title="Generate REST API token"
        method="GET"
        path="/admin/rest-token"
        description="Short-lived JWT the server signs and uses internally for every REST proxy call. Useful for debugging."
        initialBody="{}"
        onSend={() => adminApi.restToken()}
      />
    ),
  },
  {
    key: "make-call",
    label: "Make Call",
    render: postCard(
      "Make outbound call",
      "make-call",
      "/v1/call2/callout",
      {
        from: { type: "external", number: "STRINGEE_NUMBER", alias: "STRINGEE_NUMBER" },
        to: [{ type: "external", number: "TO_NUMBER", alias: "TO_NUMBER" }],
        actions: [{ action: "talk", text: "Hello from Stringee admin" }],
      },
    ),
  },
  {
    key: "put-actions",
    label: "Put SCCO",
    render: postCard(
      "Put actions (SCCO) on active call",
      "put-actions",
      "/v1/call2/putactions",
      {
        callId: "YOUR_CALL_ID",
        actions: [
          {
            action: "connect",
            from: { type: "external", number: "SOURCE_NUMBER" },
            to: { type: "internal", number: "USER_ID" },
          },
        ],
      },
    ),
  },
  {
    key: "stop-call",
    label: "Stop Call",
    render: postCard("Stop call", "stop-call", "/v1/call2/stop", {
      callId: "YOUR_CALL_ID",
    }),
  },
  {
    key: "transfer",
    label: "Transfer",
    render: postCard("Transfer call", "transfer-call", "/v1/call2/transfer", {
      callId: "YOUR_CALL_ID",
      fromUserId: "user1",
      to: { type: "internal", number: "user2", alias: "user2" },
    }),
  },
  {
    key: "add-participant",
    label: "Add Participant",
    render: postCard(
      "Add participant",
      "add-participant",
      "/v1/call2/adduser",
      {
        callId: "YOUR_CALL_ID",
        from: { type: "external", number: "STRINGEE_NUMBER", alias: "STRINGEE_NUMBER" },
        to: { type: "internal", number: "user1", alias: "user1" },
        spyCall: false,
      },
    ),
  },
  {
    key: "force-video",
    label: "Force Video Floor",
    render: postCard(
      "Force video floor",
      "force-video-floor",
      "/v1/call2/setvideofloor",
      { callId: "YOUR_CALL_ID", userId: "user1" },
    ),
  },
  {
    key: "send-message",
    label: "Send Custom Message",
    render: postCard(
      "Send custom message to user",
      "send-message",
      "/v1/user/sendcustommessage",
      { from: "system", toUser: "user1", message: { a: "Hello!" } },
    ),
  },
  { key: "call-log", label: "Call Log", render: () => <CallLogCard /> },
  { key: "recording", label: "Recording", render: () => <RecordingCard /> },
];

const AdminPage: FC = () => {
  const [active, setActive] = useState<string>(TABS[0].key);
  const current = TABS.find((t) => t.key === active) ?? TABS[0];

  return (
    <main className="mx-auto max-w-4xl px-4 py-6 space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Stringee Admin</h1>
        <p className="text-sm text-base-content/60">
          Mini admin panel for the Stringee Call REST API (dev).
        </p>
      </div>

      <div role="tablist" className="tabs tabs-box flex-wrap">
        {TABS.map((t) => (
          <button
            key={t.key}
            role="tab"
            className={`tab ${active === t.key ? "tab-active" : ""}`}
            onClick={() => setActive(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {current.render()}
    </main>
  );
};

export default AdminPage;
