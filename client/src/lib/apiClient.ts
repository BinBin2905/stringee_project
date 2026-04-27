import axios from "axios";
import { http } from "./http";
import type { ApiResult } from "@/types";

export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

// Thin OOP wrapper over the shared axios instance. Returns { status, data }
// for both success AND error responses so callers don't need try/catch.
// Mirrors server/src/services/stringeeClient.ts.
export class ApiClient {
  readonly basePath: string;

  constructor(basePath: string = "") {
    this.basePath = basePath;
  }

  async request<T = unknown>(
    method: HttpMethod,
    path: string,
    body?: unknown,
    query?: string,
  ): Promise<ApiResult<T>> {
    const qs = query ? `?${query.replace(/^\?/, "")}` : "";
    try {
      const res = await http.request<T>({
        url: `${this.basePath}${path}${qs}`,
        method,
        data: body,
      });
      return { status: res.status, data: res.data };
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        return { status: err.response.status, data: err.response.data as T };
      }
      return {
        status: 0,
        data: { error: (err as Error).message } as unknown as T,
      };
    }
  }
}
