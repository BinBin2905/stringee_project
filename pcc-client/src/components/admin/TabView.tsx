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
  const itemClass = size === "sm" ? "text-xs" : "text-sm";

  return (
    <div className="flex gap-4 items-start">
      <aside className="w-56 shrink-0 sticky top-4">
        <ul
          role="tablist"
          className={`menu bg-base-100 border border-base-300 rounded-box w-full ${itemClass}`}
        >
          {tabs.map((t) => (
            <li key={t.key}>
              <button
                role="tab"
                className={active === t.key ? "menu-active" : ""}
                onClick={() => setActive(t.key)}
              >
                {t.label}
              </button>
            </li>
          ))}
        </ul>
      </aside>
      <div className="flex-1 min-w-0">{current.render()}</div>
    </div>
  );
};

export default TabView;
