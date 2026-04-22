import type { FC } from "react";

const StringeeFooter: FC = () => (
  <div className="border-t border-gray-100 pt-4 text-[11px] leading-relaxed text-gray-300">
    <p>
      Token lưu tại{" "}
      <code className="rounded bg-gray-50 px-1 py-px text-gray-400">
        localStorage → stringee_token:&lt;userId&gt;
      </code>
    </p>
    <p className="mt-1">
      User đang chọn (theo tab):{" "}
      <code className="rounded bg-gray-50 px-1 py-px text-gray-400">
        sessionStorage → stringee_active_user
      </code>
    </p>
    <p className="mt-1">
      Endpoint:{" "}
      <code className="rounded bg-gray-50 px-1 py-px text-gray-400">
        POST /api/token
      </code>
    </p>
  </div>
);

export default StringeeFooter;
