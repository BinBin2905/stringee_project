import type { IntBool, PccBaseResponse, PccListQuery } from "./common.js";

export interface BlacklistNumber {
  id: string;
  account: number;
  project: number;
  number: string;
  ivr_blocked: IntBool;
  queue_blocked: IntBool;
}

export interface CreateBlacklistNumberRequest {
  number: string;
  ivr_blocked?: boolean;
  queue_blocked?: boolean;
}

export interface CreateBlacklistNumberResponse extends PccBaseResponse {
  blacklistNumberID?: string;
}

export type ListBlacklistNumbersQuery = PccListQuery;

export interface ListBlacklistNumbersResponse extends PccBaseResponse {
  data: {
    totalCount: string;
    totalPages: number;
    currentPage: number;
    limit: number;
    blacklistNumbers: BlacklistNumber[];
  };
}

export interface UpdateBlacklistNumberRequest {
  number: string;
  ivr_blocked?: boolean;
  queue_blocked?: boolean;
}

export type UpdateBlacklistNumberResponse = PccBaseResponse;

export type DeleteBlacklistNumberResponse = PccBaseResponse;
