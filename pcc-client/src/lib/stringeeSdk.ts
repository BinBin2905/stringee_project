// Typings for the Stringee Softphone widget. The widget loads from
// static.stringee.com and exposes a single global object that owns the
// entire call UI; we configure it, connect, and react to the lifecycle
// events documented at developer.stringee.com.

export type StringeeSoftPhoneShowMode = "full" | "min" | "none";
export type StringeeSoftPhoneArrowDisplay = "top" | "bottom" | "none";

export interface StringeeSoftPhoneFromNumber {
  alias: string;
  number: string;
}

export interface StringeeSoftPhoneVideoSize {
  width: number;
  height: number;
}

export interface StringeeSoftPhoneConfig {
  showMode?: StringeeSoftPhoneShowMode;
  top?: number;
  left?: number;
  right?: number;
  bottom?: number;
  arrowLeft?: number;
  arrowDisplay?: StringeeSoftPhoneArrowDisplay;
  fromNumbers?: StringeeSoftPhoneFromNumber[];
  // Video — when true the widget exposes a video toggle on its dialpad.
  enableVideoCall?: boolean;
  iframeVideoCallSize?: StringeeSoftPhoneVideoSize;
  // When true, the widget asks the user to pick voice vs video at dial time.
  askCallTypeWhenMakeCall?: boolean;
  // Optional DOM container to mount the widget into. Defaults to body.
  appendToElement?: HTMLElement | string;
}

// Full event surface per the Stringee Web Softphone blog post. Each handler
// receives whatever the SDK fires (mostly opaque; we log + toast).
export type StringeeSoftPhoneSignalingState =
  | "connecting"
  | "connected"
  | "disconnected"
  | "failed"
  | string;

export interface StringeeSoftPhoneIncomingCall {
  fromNumber?: string;
  toNumber?: string;
  callId?: string;
  isVideoCall?: boolean;
  customDataFromYourServer?: string;
  [k: string]: unknown;
}

export interface StringeeSoftPhoneCallContext {
  callId?: string;
  fromNumber?: string;
  toNumber?: string;
  [k: string]: unknown;
}

// Events the widget fires. Listed in the same order as the developer blog
// (https://stringee.com/vi/blog/post/stringee-web-softphone). Handlers all
// share the same shape `(payload?) => void` for simplicity — the SDK
// passes inconsistent argument lists across versions.
export type StringeeSoftPhoneEvent =
  | "displayModeChange"
  | "requestNewToken"
  | "beforeMakeCall"
  | "incomingCall"
  | "makeOutgoingCallBtnClick"
  | "answerIncomingCallBtnClick"
  | "endCallBtnClick"
  | "declineIncomingCallBtnClick"
  | "addlocalstream"
  | "addremotestream"
  | "signalingstate"
  | "authen"
  | "disconnect"
  | "callingScreenHide"
  | "incomingScreenHide";

// One unified `on` signature (the SDK is loose about handler shape — we
// keep it permissive and narrow at the call site if we care about typing).
export interface StringeeSoftPhone {
  init(config: StringeeSoftPhoneConfig): void;
  config(partial: Partial<StringeeSoftPhoneConfig>): void;
  connect(accessToken: string): void;
  disconnect?(): void;
  on(event: StringeeSoftPhoneEvent, handler: (...args: unknown[]) => void): void;
}

declare global {
  interface Window {
    StringeeSoftPhone?: StringeeSoftPhone;
  }
}

const SOFTPHONE_URL =
  "https://static.stringee.com/web_phone/lastest/js/StringeeSoftPhone-lastest.js";
let loader: Promise<StringeeSoftPhone> | null = null;

// Lazy-load the widget on first use so the admin bundle stays lean.
export function loadSoftphone(): Promise<StringeeSoftPhone> {
  if (loader) return loader;
  loader = new Promise((resolve, reject) => {
    if (window.StringeeSoftPhone) {
      resolve(window.StringeeSoftPhone);
      return;
    }
    const script = document.createElement("script");
    script.src = SOFTPHONE_URL;
    script.async = true;
    script.onload = () => {
      if (!window.StringeeSoftPhone) {
        reject(new Error("StringeeSoftPhone loaded but global is missing"));
        return;
      }
      resolve(window.StringeeSoftPhone);
    };
    script.onerror = () =>
      reject(new Error(`Failed to load StringeeSoftPhone from ${SOFTPHONE_URL}`));
    document.head.appendChild(script);
  });
  return loader;
}
