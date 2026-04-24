import type { ReactNode } from "react";
import type { ApiResult } from "@/types";
import JsonApiCard from "./JsonApiCard";

// Shell-only sender — used by cards whose server-side proxy hasn't been
// wired yet. Returns a synthetic 501 payload so the UI renders consistently.
export const stubSend = (): Promise<ApiResult> =>
  Promise.resolve({
    status: 501,
    data: {
      info: "Shell only — define the request body and wire the server proxy, then replace onSend.",
    },
  });

// Minimal card builder for un-wired endpoints. `body` may be any JSON-able
// value; it is serialized into the editor pre-fill so you can tweak it.
export const shellCard =
  (
    title: string,
    method: string,
    path: string,
    body: unknown,
    description?: string,
  ): (() => ReactNode) =>
  () => (
    <JsonApiCard
      title={title}
      method={method}
      path={path}
      description={description}
      initialBody={
        typeof body === "string" ? body : JSON.stringify(body, null, 2)
      }
      onSend={stubSend}
    />
  );
