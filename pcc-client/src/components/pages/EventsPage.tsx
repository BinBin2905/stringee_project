import { type FC } from "react";
import LiveEvents from "@/components/pcc/LiveEvents";

const EventsPage: FC = () => (
  <div className="p-6 max-w-5xl mx-auto space-y-4">
    <header>
      <h1 className="text-2xl font-semibold">Live Events</h1>
      <p className="text-sm text-base-content/60">
        Real-time stream of PCC call events from /admin/pcc/events/recent.
      </p>
    </header>
    <LiveEvents />
  </div>
);

export default EventsPage;
