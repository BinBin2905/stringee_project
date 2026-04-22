import type { FC } from "react";

type Props = { connected: boolean };

const StringeeHeader: FC<Props> = ({ connected }) => (
  <header className="border-b border-gray-200 px-6 py-4">
    <div className="mx-auto flex max-w-xl items-center justify-between">
      <div className="flex items-center gap-2.5">
        <div
          className={`h-2 w-2 rounded-full ${connected ? "bg-black" : "bg-gray-300"}`}
        />
        <span className="text-xs font-semibold uppercase tracking-widest">
          Stringee Client
        </span>
      </div>
      <span className="text-[11px] tracking-wide text-gray-400">
        {connected ? "CONNECTED" : "DISCONNECTED"}
      </span>
    </div>
  </header>
);

export default StringeeHeader;
