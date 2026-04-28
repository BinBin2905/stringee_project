import type { PccBaseResponse } from "./common.js";

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

export interface RemoveAgentFromGroupRequest {
  agent_id: string;
  group_id: string;
}

export type RemoveAgentFromGroupResponse = PccBaseResponse;
