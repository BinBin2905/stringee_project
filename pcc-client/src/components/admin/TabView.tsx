import { useState, type FC, type ReactNode } from "react";

export type Tab = {
  key: string;
  label: string;
  render: () => ReactNode;
};

type Props = {
  tabs: Tab[];
  size?: "md" | "sm";
};

const TabView: FC<Props> = ({ tabs, size = "md" }) => {
  const [active, setActive] = useState<string>(tabs[0].key);
  const current = tabs.find((t) => t.key === active) ?? tabs[0];
  const tabClass = size === "sm" ? "tab tab-sm" : "tab";

  return (
    <div className="space-y-3">
      <div role="tablist" className="tabs tabs-box flex-wrap">
        {tabs.map((t) => (
          <button
            key={t.key}
            role="tab"
            className={`${tabClass} ${active === t.key ? "tab-active" : ""}`}
            onClick={() => setActive(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>
      {current.render()}
    </div>
  );
};

export default TabView;
