import type { PccBaseResponse, PccListQuery } from "./common.js";

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
