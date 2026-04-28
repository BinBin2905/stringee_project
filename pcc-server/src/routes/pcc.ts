import type { FastifyInstance, FastifyReply } from "fastify";
import { pcc, pccClient } from "../services/stringeeApi.js";
import type { StringeeResource } from "../services/stringeeResource.js";
import type {
  AddAgentToGroupRequest,
  AddAgentToGroupResponse,
  AddGroupToQueueRequest,
  AddGroupToQueueResponse,
  Agent,
  BlacklistNumber,
  CalloutRequest,
  CalloutResponse,
  CreateAgentRequest,
  CreateAgentResponse,
  CreateBlacklistNumberRequest,
  CreateBlacklistNumberResponse,
  CreateGroupRequest,
  CreateGroupResponse,
  CreateIvrKeypressRequest,
  CreateIvrKeypressResponse,
  CreateIvrNodeRequest,
  CreateIvrNodeResponse,
  CreateIvrTreeRequest,
  CreateIvrTreeResponse,
  CreateNumberRequest,
  CreateNumberResponse,
  CreateQueueRequest,
  CreateQueueResponse,
  CreateSipAccountRequest,
  CreateSipAccountResponse,
  DeleteAgentResponse,
  DeleteBlacklistNumberResponse,
  DeleteGroupResponse,
  DeleteGroupRoutingResponse,
  DeleteIvrKeypressResponse,
  DeleteIvrNodeResponse,
  DeleteIvrTreeResponse,
  DeleteNumberResponse,
  DeleteQueueResponse,
  DeleteSipAccountResponse,
  Group,
  GroupRouting,
  IvrKeypress,
  IvrNode,
  IvrTree,
  ListAgentsQuery,
  ListAgentsResponse,
  ListBlacklistNumbersQuery,
  ListBlacklistNumbersResponse,
  ListGroupAgentsQuery,
  ListGroupAgentsResponse,
  ListGroupRoutingsQuery,
  ListGroupRoutingsResponse,
  ListGroupsQuery,
  ListGroupsResponse,
  ListIvrKeypressesQuery,
  ListIvrKeypressesResponse,
  ListIvrNodesQuery,
  ListIvrNodesResponse,
  ListIvrTreesQuery,
  ListIvrTreesResponse,
  ListNumbersQuery,
  ListNumbersResponse,
  ListQueuesQuery,
  ListQueuesResponse,
  ListSipAccountsQuery,
  ListSipAccountsResponse,
  PccNumber,
  ProxyResult,
  Queue,
  RemoveAgentFromGroupRequest,
  RemoveAgentFromGroupResponse,
  SipAccount,
  TransferCallRequest,
  TransferCallResponse,
  UpdateAgentRequest,
  UpdateAgentResponse,
  UpdateBlacklistNumberRequest,
  UpdateBlacklistNumberResponse,
  UpdateGroupRequest,
  UpdateGroupResponse,
  UpdateGroupRoutingRequest,
  UpdateGroupRoutingResponse,
  UpdateIvrKeypressRequest,
  UpdateIvrKeypressResponse,
  UpdateIvrNodeRequest,
  UpdateIvrNodeResponse,
  UpdateIvrTreeRequest,
  UpdateIvrTreeResponse,
  UpdateNumberRequest,
  UpdateNumberResponse,
  UpdateQueueRequest,
  UpdateQueueResponse,
  UpdateSipAccountRequest,
  UpdateSipAccountResponse,
} from "../types/index.js";

const send = <T>(reply: FastifyReply, r: ProxyResult<T>): FastifyReply =>
  reply.code(r.status).send(r.body);

const rawQuery = (url: string): string =>
  url.includes("?") ? url.slice(url.indexOf("?") + 1) : "";

// Bundle of request/response shapes for a flat REST resource so the
// generic mount() helper can wire all five CRUD verbs at once without
// having to spell eight type parameters at every call site.
interface CrudTypes {
  Entity: unknown;
  ListQuery: unknown;
  ListResponse: unknown;
  CreateBody: unknown;
  CreateResponse: unknown;
  UpdateBody: unknown;
  UpdateResponse: unknown;
  DeleteResponse: unknown;
}

// Reply is intentionally omitted from the per-route generics: Fastify's
// typed `reply.send` collapses to `never` when the Reply slot is an
// unbounded generic, and the helper still returns the upstream body
// verbatim. Body / Querystring / Params remain fully typed.
function mount<T extends CrudTypes>(
  fastify: FastifyInstance,
  slug: string,
  resource: StringeeResource,
): void {
  fastify.get<{ Querystring: T["ListQuery"] }>(
    `/${slug}`,
    async (req, reply) =>
      send(reply, await resource.list<T["ListResponse"]>(rawQuery(req.url))),
  );
  fastify.post<{ Body: T["CreateBody"] }>(
    `/${slug}`,
    async (req, reply) =>
      send(reply, await resource.create<T["CreateResponse"]>(req.body)),
  );
  fastify.get<{ Params: { id: string } }>(
    `/${slug}/:id`,
    async (req, reply) =>
      send(reply, await resource.get<T["Entity"]>(req.params.id)),
  );
  fastify.put<{ Params: { id: string }; Body: T["UpdateBody"] }>(
    `/${slug}/:id`,
    async (req, reply) =>
      send(
        reply,
        await resource.update<T["UpdateResponse"]>(req.params.id, req.body),
      ),
  );
  fastify.delete<{ Params: { id: string } }>(
    `/${slug}/:id`,
    async (req, reply) =>
      send(reply, await resource.remove<T["DeleteResponse"]>(req.params.id)),
  );
}

export default async function pccRoutes(fastify: FastifyInstance) {
  mount<{
    Entity: Agent;
    ListQuery: ListAgentsQuery;
    ListResponse: ListAgentsResponse;
    CreateBody: CreateAgentRequest;
    CreateResponse: CreateAgentResponse;
    UpdateBody: UpdateAgentRequest;
    UpdateResponse: UpdateAgentResponse;
    DeleteResponse: DeleteAgentResponse;
  }>(fastify, "agents", pcc.agent);

  mount<{
    Entity: Group;
    ListQuery: ListGroupsQuery;
    ListResponse: ListGroupsResponse;
    CreateBody: CreateGroupRequest;
    CreateResponse: CreateGroupResponse;
    UpdateBody: UpdateGroupRequest;
    UpdateResponse: UpdateGroupResponse;
    DeleteResponse: DeleteGroupResponse;
  }>(fastify, "groups", pcc.group);

  mount<{
    Entity: Queue;
    ListQuery: ListQueuesQuery;
    ListResponse: ListQueuesResponse;
    CreateBody: CreateQueueRequest;
    CreateResponse: CreateQueueResponse;
    UpdateBody: UpdateQueueRequest;
    UpdateResponse: UpdateQueueResponse;
    DeleteResponse: DeleteQueueResponse;
  }>(fastify, "queues", pcc.queue);

  mount<{
    Entity: PccNumber;
    ListQuery: ListNumbersQuery;
    ListResponse: ListNumbersResponse;
    CreateBody: CreateNumberRequest;
    CreateResponse: CreateNumberResponse;
    UpdateBody: UpdateNumberRequest;
    UpdateResponse: UpdateNumberResponse;
    DeleteResponse: DeleteNumberResponse;
  }>(fastify, "numbers", pcc.number);

  mount<{
    Entity: IvrTree;
    ListQuery: ListIvrTreesQuery;
    ListResponse: ListIvrTreesResponse;
    CreateBody: CreateIvrTreeRequest;
    CreateResponse: CreateIvrTreeResponse;
    UpdateBody: UpdateIvrTreeRequest;
    UpdateResponse: UpdateIvrTreeResponse;
    DeleteResponse: DeleteIvrTreeResponse;
  }>(fastify, "ivr-trees", pcc.ivrTree);

  mount<{
    Entity: IvrNode;
    ListQuery: ListIvrNodesQuery;
    ListResponse: ListIvrNodesResponse;
    CreateBody: CreateIvrNodeRequest;
    CreateResponse: CreateIvrNodeResponse;
    UpdateBody: UpdateIvrNodeRequest;
    UpdateResponse: UpdateIvrNodeResponse;
    DeleteResponse: DeleteIvrNodeResponse;
  }>(fastify, "ivr-nodes", pcc.ivrNode);

  mount<{
    Entity: IvrKeypress;
    ListQuery: ListIvrKeypressesQuery;
    ListResponse: ListIvrKeypressesResponse;
    CreateBody: CreateIvrKeypressRequest;
    CreateResponse: CreateIvrKeypressResponse;
    UpdateBody: UpdateIvrKeypressRequest;
    UpdateResponse: UpdateIvrKeypressResponse;
    DeleteResponse: DeleteIvrKeypressResponse;
  }>(fastify, "ivr-keypresses", pcc.ivrKeypress);

  mount<{
    Entity: SipAccount;
    ListQuery: ListSipAccountsQuery;
    ListResponse: ListSipAccountsResponse;
    CreateBody: CreateSipAccountRequest;
    CreateResponse: CreateSipAccountResponse;
    UpdateBody: UpdateSipAccountRequest;
    UpdateResponse: UpdateSipAccountResponse;
    DeleteResponse: DeleteSipAccountResponse;
  }>(fastify, "sip-accounts", pcc.sipAccount);

  mount<{
    Entity: BlacklistNumber;
    ListQuery: ListBlacklistNumbersQuery;
    ListResponse: ListBlacklistNumbersResponse;
    CreateBody: CreateBlacklistNumberRequest;
    CreateResponse: CreateBlacklistNumberResponse;
    UpdateBody: UpdateBlacklistNumberRequest;
    UpdateResponse: UpdateBlacklistNumberResponse;
    DeleteResponse: DeleteBlacklistNumberResponse;
  }>(fastify, "blacklist-numbers", pcc.blacklist);

  // Group-routing: standard CRUD on /:id, but list/create take typed bodies
  // distinct enough to deserve explicit handlers.
  fastify.get<{
    Querystring: ListGroupRoutingsQuery;
    Reply: ListGroupRoutingsResponse;
  }>("/group-routings", async (req, reply) =>
    send(
      reply,
      await pcc.groupRouting.list<ListGroupRoutingsResponse>(rawQuery(req.url)),
    ),
  );
  fastify.post<{ Body: AddGroupToQueueRequest; Reply: AddGroupToQueueResponse }>(
    "/group-routings",
    async (req, reply) =>
      send(reply, await pcc.groupRouting.create<AddGroupToQueueResponse>(req.body)),
  );
  fastify.get<{ Params: { id: string }; Reply: GroupRouting }>(
    "/group-routings/:id",
    async (req, reply) =>
      send(reply, await pcc.groupRouting.get<GroupRouting>(req.params.id)),
  );
  fastify.put<{
    Params: { id: string };
    Body: UpdateGroupRoutingRequest;
    Reply: UpdateGroupRoutingResponse;
  }>("/group-routings/:id", async (req, reply) =>
    send(
      reply,
      await pcc.groupRouting.update<UpdateGroupRoutingResponse>(
        req.params.id,
        req.body,
      ),
    ),
  );
  fastify.delete<{ Params: { id: string }; Reply: DeleteGroupRoutingResponse }>(
    "/group-routings/:id",
    async (req, reply) =>
      send(
        reply,
        await pcc.groupRouting.remove<DeleteGroupRoutingResponse>(req.params.id),
      ),
  );

  // Group-agent: POST/GET/DELETE only; DELETE takes a body, not a URL ID.
  fastify.post<{
    Body: AddAgentToGroupRequest;
    Reply: AddAgentToGroupResponse;
  }>("/group-agents", async (req, reply) =>
    send(reply, await pcc.groupAgent.create<AddAgentToGroupResponse>(req.body)),
  );
  fastify.get<{
    Querystring: ListGroupAgentsQuery;
    Reply: ListGroupAgentsResponse;
  }>("/group-agents", async (req, reply) =>
    send(
      reply,
      await pcc.groupAgent.list<ListGroupAgentsResponse>(rawQuery(req.url)),
    ),
  );
  fastify.delete<{
    Body: RemoveAgentFromGroupRequest;
    Reply: RemoveAgentFromGroupResponse;
  }>("/group-agents", async (req, reply) =>
    send(
      reply,
      await pccClient.request<RemoveAgentFromGroupResponse>(
        "DELETE",
        "/v1/manage-agents-in-group",
        { body: req.body },
      ),
    ),
  );

  // Outbound calls.
  fastify.post<{ Body: CalloutRequest; Reply: CalloutResponse }>(
    "/calls/callout",
    async (req, reply) =>
      send(
        reply,
        await pccClient.request<CalloutResponse>("POST", "/v1/call/callout", {
          body: req.body,
        }),
      ),
  );
  fastify.post<{ Body: TransferCallRequest; Reply: TransferCallResponse }>(
    "/calls/transfer",
    async (req, reply) =>
      send(
        reply,
        await pccClient.request<TransferCallResponse>(
          "POST",
          "/v1/call/transfer",
          { body: req.body },
        ),
      ),
  );

  // Legacy convenience routes the existing client UI calls. The Stringee
  // API has no nested-path equivalents, so each one folds the URL params
  // into the documented flat-resource payload before forwarding.
  fastify.post<{
    Params: { groupId: string; queueId: string };
    Body: { primary_group?: 0 | 1; priority?: 0 | 1 } | null;
    Reply: AddGroupToQueueResponse;
  }>("/groups/:groupId/queues/:queueId", async (req, reply) => {
    const incoming = (req.body ?? {}) as {
      primary_group?: 0 | 1;
      priority?: 0 | 1;
    };
    const body: AddGroupToQueueRequest = {
      group_id: req.params.groupId,
      queue_id: req.params.queueId,
      primary_group: incoming.primary_group ?? incoming.priority ?? 1,
    };
    return send(
      reply,
      await pcc.groupRouting.create<AddGroupToQueueResponse>(body),
    );
  });
  fastify.delete<{
    Params: { groupId: string; queueId: string };
    Reply: RemoveAgentFromGroupResponse;
  }>("/groups/:groupId/queues/:queueId", async (req, reply) =>
    send(
      reply,
      await pccClient.request<RemoveAgentFromGroupResponse>(
        "DELETE",
        "/v1/manage-agents-in-group",
        {
          body: {
            group_id: req.params.groupId,
            agent_id: req.params.queueId,
          },
        },
      ),
    ),
  );

  fastify.post<{
    Params: { treeId: string };
    Body: Omit<CreateIvrNodeRequest, "tree">;
    Reply: CreateIvrNodeResponse;
  }>("/ivr-trees/:treeId/nodes", async (req, reply) =>
    send(
      reply,
      await pcc.ivrNode.create<CreateIvrNodeResponse>({
        ...req.body,
        tree: req.params.treeId,
      }),
    ),
  );
  fastify.post<{
    Params: { nodeId: string };
    Body: Omit<CreateIvrKeypressRequest, "node">;
    Reply: CreateIvrKeypressResponse;
  }>("/ivr-nodes/:nodeId/keypresses", async (req, reply) =>
    send(
      reply,
      await pcc.ivrKeypress.create<CreateIvrKeypressResponse>({
        ...req.body,
        node: req.params.nodeId,
      }),
    ),
  );
}
