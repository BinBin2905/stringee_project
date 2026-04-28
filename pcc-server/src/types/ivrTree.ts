import type { PccBaseResponse, PccListQuery } from "./common.js";

export interface IvrTree {
  id: string;
  account: number;
  project: number;
  tree_name: string;
  root_node?: string;
}

export interface CreateIvrTreeRequest {
  tree_name: string;
}

export interface CreateIvrTreeResponse extends PccBaseResponse {
  ivrTreeID?: string;
}

export type ListIvrTreesQuery = PccListQuery;

export interface ListIvrTreesResponse extends PccBaseResponse {
  data: {
    totalCount: string;
    totalPages: number;
    currentPage: number;
    limit: number;
    ivrTrees: IvrTree[];
  };
}

export interface UpdateIvrTreeRequest {
  tree_name: string;
}

export interface UpdateIvrTreeResponse extends PccBaseResponse {
  ivrTreeID?: string;
}

export type DeleteIvrTreeResponse = PccBaseResponse;
