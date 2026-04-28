import type { PccBaseResponse } from "./common.js";

// 1 = higher-priority group (calls fall through to lower priority on
// unavailability), 0 = lower priority.
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
