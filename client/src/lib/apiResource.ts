import type { ApiClient } from "./apiClient";
import type { ApiResult } from "@/types";

// Generic REST resource: list / get / create / update / remove + sub() for
// nested paths. Mirrors server/src/services/stringeeResource.ts.
export class ApiResource {
  private readonly client: ApiClient;
  readonly path: string;

  constructor(client: ApiClient, path: string) {
    this.client = client;
    this.path = path;
  }

  list<T = unknown>(query?: string): Promise<ApiResult<T>> {
    return this.client.request<T>("GET", this.path, undefined, query);
  }
  get<T = unknown>(id: string): Promise<ApiResult<T>> {
    return this.client.request<T>("GET", `${this.path}/${encodeURIComponent(id)}`);
  }
  create<T = unknown>(body: unknown): Promise<ApiResult<T>> {
    return this.client.request<T>("POST", this.path, body);
  }
  update<T = unknown>(id: string, body: unknown): Promise<ApiResult<T>> {
    return this.client.request<T>(
      "PUT",
      `${this.path}/${encodeURIComponent(id)}`,
      body,
    );
  }
  remove<T = unknown>(id: string): Promise<ApiResult<T>> {
    return this.client.request<T>(
      "DELETE",
      `${this.path}/${encodeURIComponent(id)}`,
    );
  }

  // Compose a child resource: pcc.group.sub(groupId, "queues") → /groups/{id}/queues
  sub(id: string, suffix: string): ApiResource {
    const tail = suffix.replace(/^\//, "");
    return new ApiResource(
      this.client,
      `${this.path}/${encodeURIComponent(id)}/${tail}`,
    );
  }
}
