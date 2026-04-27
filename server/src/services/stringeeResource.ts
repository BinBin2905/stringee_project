import type { StringeeClient } from "./stringeeClient.js";
import type { ProxyResult } from "../types/api.js";

// Generic REST resource: list / get / create / update / remove.
// Subclassing is rarely needed — instantiate per resource path. For nested
// paths (e.g. /v1/group/{id}/queue/{qid}) use `sub()`.
export class StringeeResource {
  constructor(
    private readonly client: StringeeClient,
    public readonly path: string,
  ) {}

  list<T = unknown>(query?: string): Promise<ProxyResult<T>> {
    return this.client.request<T>("GET", this.path, query ? { query } : {});
  }

  get<T = unknown>(id: string): Promise<ProxyResult<T>> {
    return this.client.request<T>("GET", `${this.path}/${encodeURIComponent(id)}`);
  }

  create<T = unknown>(body: unknown): Promise<ProxyResult<T>> {
    return this.client.request<T>("POST", this.path, { body });
  }

  update<T = unknown>(id: string, body: unknown): Promise<ProxyResult<T>> {
    return this.client.request<T>("PUT", `${this.path}/${encodeURIComponent(id)}`, {
      body,
    });
  }

  remove<T = unknown>(id: string): Promise<ProxyResult<T>> {
    return this.client.request<T>(
      "DELETE",
      `${this.path}/${encodeURIComponent(id)}`,
    );
  }

  // Compose a child resource: pcc.group.sub(groupId, "queue") → /v1/group/{id}/queue
  sub(id: string, suffix: string): StringeeResource {
    const tail = suffix.replace(/^\//, "");
    return new StringeeResource(
      this.client,
      `${this.path}/${encodeURIComponent(id)}/${tail}`,
    );
  }
}
