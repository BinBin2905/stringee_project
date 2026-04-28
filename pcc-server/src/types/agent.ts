import type { PccBaseResponse, PccListQuery } from "./common.js";

// 1 = App/SIP, 2 = agent's phone number.
export type AgentRoutingType = 1 | 2;

// 0 = in call, 1 = not in call, 2 = after-call work.
export type AgentSystemStatus = 0 | 1 | 2;

export interface Agent {
  id: string;
  account: number;
  project: number;
  name: string;
  stringee_user_id: string;
  manual_status?: string;
  system_status?: AgentSystemStatus;
  device_status?: number;
  last_time_pickup?: number;
  last_time_support_call_ended?: number;
  routing_type?: AgentRoutingType;
  phone_number?: string;
}

export interface CreateAgentRequest {
  name: string;
  stringee_user_id: string;
  manual_status?: string;
  routing_type?: AgentRoutingType;
  phone_number?: string;
}

export interface CreateAgentResponse extends PccBaseResponse {
  agentID?: string;
}

export type ListAgentsQuery = PccListQuery;

export interface ListAgentsResponse extends PccBaseResponse {
  data: {
    totalAgents: string;
    totalPages: number;
    currentPage: number;
    limit: number;
    agents: Agent[];
  };
}

export interface UpdateAgentRequest {
  name?: string;
  stringee_user_id?: string;
  manual_status?: string;
  routing_type?: AgentRoutingType;
  phone_number?: string;
  system_status?: AgentSystemStatus | string;
  webhook_status?: AgentSystemStatus | string;
}

export type UpdateAgentResponse = PccBaseResponse;

export type DeleteAgentResponse = PccBaseResponse;
