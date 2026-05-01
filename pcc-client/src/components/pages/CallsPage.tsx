import { useState, type FC } from "react";
import OutboundCall from "@/components/pcc/OutboundCall";
import InboundRouting from "@/components/pcc/InboundRouting";

type Tab = "outbound" | "inbound";

const CallsPage: FC = () => {
  const [tab, setTab] = useState<Tab>("outbound");

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-4">
      <header>
        <h1 className="text-2xl font-semibold">Calls</h1>
        <p className="text-sm text-base-content/60">
          Place outbound calls and inspect how an inbound number is routed.
        </p>
      </header>
      <div role="tablist" className="tabs tabs-boxed bg-base-100 w-fit">
        <button
          role="tab"
          className={`tab ${tab === "outbound" ? "tab-active" : ""}`}
          onClick={() => setTab("outbound")}
        >
          Outbound
        </button>
        <button
          role="tab"
          className={`tab ${tab === "inbound" ? "tab-active" : ""}`}
          onClick={() => setTab("inbound")}
        >
          Inbound Routing
        </button>
      </div>
      {tab === "outbound" ? <OutboundCall /> : <InboundRouting />}
    </div>
  );
};

export default CallsPage;
