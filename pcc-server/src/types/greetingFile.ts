// Greeting / hold music files uploaded to the Call API. Used by the
// Queue resource (`wait_greeting`, `hold_greeting` reference the
// `filename` returned here).
// developer.stringee.com/docs/rest-api-reference/Greeting-File.

import type { PccBaseResponse } from "./common.js";

export interface GreetingFile {
  sid: string;
  filename: string;
  desc1: string | null;
  created: number;
}

export interface ListGreetingFilesResponse extends PccBaseResponse {
  data: {
    greeting_files: GreetingFile[];
    total: string;
  };
}

export interface UploadGreetingFileResponse extends PccBaseResponse {
  filename: string;
  fileSid: string;
}

export type DeleteGreetingFileResponse = PccBaseResponse;
