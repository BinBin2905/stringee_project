interface TokenPayload {
  jti: string;
  iss: string;
  exp: number;
  iat: number;
  userId?: string;
  rest_api?: boolean;
}

interface SavedToken {
  token: string;
  userId: string;
  record: boolean;
  recordFormat: RecordFormat;
  recordStereo: boolean;
  savedAt: number;
}

interface SCCORecord {
  action: "record";
  eventUrl: string;
  format: RecordFormat;
  recordStereo: boolean;
}

interface SCCOConnect {
  action: "connect";
  from: { type: "internal" | "external"; number: string; alias: string };
  to: { type: "internal" | "external"; number: string; alias: string };
  peerToPeerCall?: boolean;
  timeout: number;
}

type SCCOAction = SCCORecord | SCCOConnect;
type RecordFormat = "mp3" | "wav";

type CallMediaOptions = {
  remoteMedia?: HTMLMediaElement | null;
  localMedia?: HTMLMediaElement | null;
  onSignalingState?: (state: SignalingState) => void;
  onCallResponse?: (res: CallResponse) => void;
};

type MakeCallOptions = CallMediaOptions & {
  from: string;
  to: string;
  isVideo?: boolean;
};

type IncomingCallInfo = {
  from: string;
  to: string;
  callId?: string;
};

export type {
  TokenPayload,
  SavedToken,
  SCCORecord,
  SCCOConnect,
  SCCOAction,
  RecordFormat,
  CallMediaOptions,
  MakeCallOptions,
  IncomingCallInfo,
};
