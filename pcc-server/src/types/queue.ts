import type { IntBool, PccBaseResponse, PccListQuery } from "./common.js";

// 1 = always route, 2 = business hours.
export type QueueSchedule = 1 | 2;

// 1 = web/app only, 2 = web/app/SIP.
export type QueueCondRouting = 1 | 2;

export interface Queue {
  id: string;
  account: number;
  project: number;
  name: string;
  agent_wrap_up_after_calls: IntBool;
  wrap_up_time_limit: number;
  enable_voicemail: IntBool;
  schedule: QueueSchedule;
  wait_greeting?: string | null;
  hold_greeting?: string | null;
  wait_agent_answer_timeout: number;
  record_calls: IntBool;
  maximum_queue_size?: number;
  maximum_queue_wait_time?: number;
  from_number_callout_to_agent?: string | null;
  get_list_agents_url?: string | null;
  cond_routing?: QueueCondRouting;
}

export interface CreateQueueRequest {
  name: string;
  record_calls?: boolean;
  agent_wrap_up_after_calls?: boolean;
  wrap_up_time_limit?: number;
  schedule?: QueueSchedule;
  wait_agent_answer_timeout?: number;
  wait_greeting?: string | null;
  hold_greeting?: string | null;
  maximum_queue_size?: number;
  maximum_queue_wait_time?: number;
  from_number_callout_to_agent?: string | null;
  get_list_agents_url?: string | null;
  cond_routing?: QueueCondRouting;
}

export interface CreateQueueResponse extends PccBaseResponse {
  queueID?: string;
}

export type ListQueuesQuery = PccListQuery;

export interface ListQueuesResponse extends PccBaseResponse {
  data: {
    totalCount: string;
    totalPages: number;
    currentPage: number;
    limit: number;
    queues: Queue[];
  };
}

export type UpdateQueueRequest = Partial<CreateQueueRequest>;

export type UpdateQueueResponse = PccBaseResponse;

export type DeleteQueueResponse = PccBaseResponse;
