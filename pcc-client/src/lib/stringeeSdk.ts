// Typings for the Stringee Softphone widget. The widget loads from
// static.stringee.com and exposes a single global object that owns the
// entire call UI; we only need to configure it, connect, and react to
// the lifecycle events documented at developer.stringee.com.

export type StringeeSoftPhoneShowMode = "full" | "min" | "none";
export type StringeeSoftPhoneArrowDisplay = "top" | "bottom" | "none";

export interface StringeeSoftPhoneFromNumber {
  alias: string;
  number: string;
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
}

export interface StringeeSoftPhone {
  init(config: StringeeSoftPhoneConfig): void;
  config(partial: Partial<StringeeSoftPhoneConfig>): void;
  connect(accessToken: string): void;
  disconnect?(): void;
  on(
    event: "displayModeChange",
    handler: (mode: StringeeSoftPhoneShowMode) => void,
  ): void;
  on(event: "requestNewToken", handler: () => void): void;
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
