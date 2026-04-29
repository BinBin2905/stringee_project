import type { PccBaseResponse, PccListQuery } from "./common";

export interface Group {
  id: string;
  account: number;
  project: number;
  name: string;
  number_of_agent?: number;
}

export interface CreateGroupRequest {
  name: string;
}

export interface CreateGroupResponse extends PccBaseResponse {
  groupID?: string;
}

export type ListGroupsQuery = PccListQuery;

export interface ListGroupsResponse extends PccBaseResponse {
  data: {
    totalGroups: string;
    totalPages: number;
    currentPage: number;
    limit: number;
    groups: Group[];
  };
}

export interface UpdateGroupRequest {
  name: string;
}

export type UpdateGroupResponse = PccBaseResponse;
export type DeleteGroupResponse = PccBaseResponse;

// ─── Group ↔ Agent ──────────────────────────────────────────────────────

export interface GroupAgent {
  account: number;
  project: number;
  agent_id: string;
  group_id: string;
}

export interface AddAgentToGroupRequest {
  agent_id: string;
  group_id: string;
}

export interface AddAgentToGroupResponse extends PccBaseResponse {
  agentID?: string;
  groupID?: string;
}

export interface ListGroupAgentsQuery {
  group: string;
}

export interface ListGroupAgentsResponse extends PccBaseResponse {
  data: {
    totalCount: string;
    totalPages: number;
    currentPage: number;
    limit: number;
    groupAgents: GroupAgent[];
  };
}

export type RemoveAgentFromGroupRequest = AddAgentToGroupRequest;
export type RemoveAgentFromGroupResponse = PccBaseResponse;

// ─── Group routing (group ↔ queue) ──────────────────────────────────────

// 1 = primary (direct routing target), 0 = secondary (fallback only).
export type PrimaryGroup = 0 | 1;

export interface GroupRouting {
  id: string;
  account: number;
  project: number;
  queue_id: string;
  group_id: string;
  primary_group: PrimaryGroup;
}

export interface AddGroupToQueueRequest {
  queue_id: string;
  group_id: string;
  primary_group: PrimaryGroup;
}

export interface AddGroupToQueueResponse extends PccBaseResponse {
  groupRoutingID?: string;
}

export interface ListGroupRoutingsQuery {
  queue: string;
}

export interface ListGroupRoutingsResponse extends PccBaseResponse {
  data: {
    totalCount: string;
    totalPages: number;
    currentPage: number;
    limit: number;
    groupRoutings: GroupRouting[];
  };
}

export interface UpdateGroupRoutingRequest {
  primary_group: PrimaryGroup;
}

export type UpdateGroupRoutingResponse = PccBaseResponse;
export type DeleteGroupRoutingResponse = PccBaseResponse;
