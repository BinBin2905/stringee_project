import { type FC } from "react";
import { Link } from "react-router";

const TILES = [
  { to: "/calls", title: "Calls", desc: "Outbound dialing & inbound routing" },
  { to: "/events", title: "Live Events", desc: "Real-time PCC event stream" },
  { to: "/settings", title: "Settings", desc: "Agents, queues, IVR, numbers" },
  { to: "/softphone", title: "Softphone ↗", desc: "Open the Stringee widget" },
];

const Dashboard: FC = () => (
  <div className="p-6 max-w-5xl mx-auto space-y-6">
    <header>
      <h1 className="text-2xl font-semibold">Stringee PCC</h1>
      <p className="text-sm text-base-content/60">
        Programmable Contact Center — agents, queues, IVR, routing, callout.
      </p>
    </header>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {TILES.map((t) => (
        <Link
          key={t.to}
          to={t.to}
          className="card bg-base-100 border border-base-300 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="card-body">
            <h3 className="card-title text-base">{t.title}</h3>
            <p className="text-sm text-base-content/60">{t.desc}</p>
          </div>
        </Link>
      ))}
    </div>
  </div>
);

export default Dashboard;
