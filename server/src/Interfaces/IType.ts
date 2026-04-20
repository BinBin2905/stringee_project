interface IQuerystring {
  username: string;
  password: string;
}

interface IHeaders {
  "h-Custom": string;
  host: string;
}

interface IReply {
  "2xx": { success: boolean };
  302: { url: string };
  "4xx": { error: string };
}

export type { IQuerystring, IHeaders, IReply };
