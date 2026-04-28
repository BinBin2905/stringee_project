import type { PccBaseResponse } from "./common.js";

// `talk` = TTS, `play` = audio file URL.
export type IvrNodePlayMode = "talk" | "play";

export interface IvrNode {
  id: string;
  account: number;
  project: number;
  tree: string;
  node_name: string;
  node_play_mode: IvrNodePlayMode;
  node_play_content: string;
  bargeIn?: boolean;
  loop_count?: number;
  sched?: number;
  voice?: string;
  speed?: number;
  keypress_timeout?: number;
}

export interface CreateIvrNodeRequest {
  tree: string;
  node_name: string;
  node_play_mode: IvrNodePlayMode;
  node_play_content: string;
  bargeIn?: boolean;
  loop_count?: number;
  sched?: number;
  voice?: string;
  speed?: number;
  keypress_timeout?: number;
}

export interface CreateIvrNodeResponse extends PccBaseResponse {
  ivrNodeID?: string;
  isRootNode?: boolean;
}

export interface ListIvrNodesQuery {
  tree?: string;
}

export interface ListIvrNodesResponse extends PccBaseResponse {
  data: {
    totalCount: string;
    totalPages: number;
    currentPage: number;
    limit: number;
    ivrNodes: IvrNode[];
  };
}

export interface UpdateIvrNodeRequest {
  node_name?: string;
  node_play_mode?: IvrNodePlayMode;
  node_play_content?: string;
  bargeIn?: boolean;
  loop_count?: number;
  sched?: number;
  voice?: string;
  speed?: number;
  keypress_timeout?: number;
}

export interface UpdateIvrNodeResponse extends PccBaseResponse {
  ivrNodeID?: string;
}

export type DeleteIvrNodeResponse = PccBaseResponse;
