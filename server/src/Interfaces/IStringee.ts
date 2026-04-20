interface IUser {
  id: string;
}

/*
"internal": The call is from/to Client App (using Stringee SDK); "external": The call is from/to the outside of the Stringee platform	
 */
type callType = "internal" | "external";

interface IFrom_ToNumber {
  type: callType;
  number: string;
  alias: string;
}

type mediaFormat = "mp3" | "wav" | "mp4";

interface IActionRecord {
  action: "record";
  eventUrl: string;
  format: mediaFormat;
}

interface IActionConnect {
  action: "connect";
  from: IFrom_ToNumber;
  to: IFrom_ToNumber;
  customData?: string;
  continueOnFail?: boolean | false;
  onFailEventUrl?: string;
  timeout?: number | 60;
  maxConnection?: number | 60;
  peerToPeerCall?:
    | boolean
    | true; /* + true: The media stream of calls will not go through Stringee's server. The calls will be peer-to-peer calls. If the parameter "peerToPeerCall" is "true", the calls can not be recorded, even when you put action "record" before action "connect".
  + false: The media stream of calls will always go through Stringee'server. If you want the calls to be recorded, the parameter "peerToPeerCall" must be "false" and the action "record" must be placed before action "connect" in the SCCO.*/
}

type ISCCO = IActionRecord | IActionConnect;

interface IGetSCCOFromStringeeServer {
  from: string;
  to: string;
  fromInternal: boolean;
  userId: string;
  projectId: number;
  callId: string;
}

interface IOnFailEventUrl {
  call_status: string;
  project_id: string;
  timestamp_ms: number;
  from: {
    type: string;
    number: string;
    alias: string;
    is_online: boolean;
  };
  to: {
    type: string;
    number: string;
    alias: string;
    is_online: boolean;
  };
  type: string;
  call_id: string;
  agent_status: string;
  toNumber: string;
  start_time: number;
}

export type {
  IUser,
  ISCCO,
  IActionRecord,
  IActionConnect,
  mediaFormat,
  IGetSCCOFromStringeeServer,
};
