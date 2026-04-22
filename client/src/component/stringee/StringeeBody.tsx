import type { FC, KeyboardEvent, RefObject } from "react";
import {
  IconKey,
  IconPhone,
  IconMic,
  IconCopy,
  IconCheck,
  IconTrash,
  IconAlert,
} from "@/component/icons/svgComponent";
import type {
  TokenPayload,
  SCCOAction,
  RecordFormat,
} from "@/api/types/ITypes";

type CallingStatus = "Calling" | "Ringing" | "Answered" | "Ended";

type Props = {
  // server + user + token fetch
  serverUrl: string;
  onServerUrlChange: (v: string) => void;
  userId: string;
  onUserIdChange: (v: string) => void;
  loading: boolean;
  error: string;
  fetchToken: () => void;
  onKeyDown: (e: KeyboardEvent<HTMLInputElement>) => void;

  // recording
  record: boolean;
  onToggleRecord: () => void;
  recordFormat: RecordFormat;
  onRecordFormatChange: (v: RecordFormat) => void;
  recordStereo: boolean;
  onRecordStereoChange: (v: boolean) => void;

  // token
  token: string | null;
  tokenInfo: TokenPayload | null;
  isExpired: boolean;
  copied: boolean;
  onCopyToken: () => void;
  onClearToken: () => void;
  infoRows: [string, string, boolean?][];

  // call
  callee: string;
  onCalleeChange: (v: string) => void;
  callReady: boolean;
  inCall: boolean;
  callStatus: CallingStatus | string;
  incomingCall: StringeeCall | null;
  onMakeCall: () => void;
  onAnswer: () => void;
  onReject: () => void;
  onHangup: () => void;
  buildSCCO: () => SCCOAction[];
  remoteAudioRef: RefObject<HTMLAudioElement | null>;
};

const StringeeBody: FC<Props> = (props: Props) => (
  <>
    {/* ── Server URL ── */}
    <div>
      <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-widest text-gray-400">
        Server URL
      </label>
      <input
        type="text"
        value={props.serverUrl}
        onChange={(e) => props.onServerUrlChange(e.target.value)}
        placeholder="http://localhost:3000"
        className="w-full rounded border border-gray-300 bg-white px-3 py-2 font-mono text-sm text-black outline-none transition focus:border-black"
      />
    </div>

    {/* ── User ID + Submit ── */}
    <div>
      <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-widest text-gray-400">
        User ID
      </label>
      <div className="flex gap-2">
        <input
          type="text"
          value={props.userId}
          onChange={(e) => props.onUserIdChange(e.target.value)}
          onKeyDown={props.onKeyDown}
          placeholder="agent_01"
          disabled={props.loading}
          className="flex-1 rounded border border-gray-300 bg-white px-3 py-2 font-mono text-sm text-black outline-none transition focus:border-black disabled:opacity-50"
        />
        <button
          onClick={props.fetchToken}
          disabled={props.loading || !props.userId.trim()}
          className="flex items-center gap-1.5 whitespace-nowrap rounded bg-black px-4 py-2 text-xs font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {props.loading ? (
            <>
              <span className="h-3 w-3 animate-spin rounded-full border-[1.5px] border-gray-500 border-t-white" />
              <span>Đang lấy...</span>
            </>
          ) : (
            <>
              <IconKey />
              <span>Lấy Token</span>
            </>
          )}
        </button>
      </div>

      {props.error && (
        <div className="mt-2 flex items-center gap-2 rounded border border-gray-200 bg-gray-50 px-3 py-2">
          <IconAlert />
          <span className="text-xs text-gray-500">{props.error}</span>
        </div>
      )}
    </div>

    {/* ── Recording Options ── */}
    <div className="rounded-md border border-gray-200 p-5">
      <div
        className={`flex items-center justify-between ${props.record ? "mb-4" : ""}`}
      >
        <div className="flex items-center gap-2">
          <IconMic />
          <span className="text-xs font-semibold uppercase tracking-widest">
            Ghi âm cuộc gọi
          </span>
        </div>

        <button
          onClick={props.onToggleRecord}
          className={`relative h-5.5 w-10 rounded-full transition-colors ${props.record ? "bg-black" : "bg-gray-300"}`}
          aria-label="Toggle recording"
        >
          <div
            className={`absolute top-0.75 h-4 w-4 rounded-full bg-white shadow transition-[left] ${props.record ? "left-5.25" : "left-0.75"}`}
          />
        </button>
      </div>

      {props.record && (
        <div className="flex gap-8">
          <div>
            <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-widest text-gray-400">
              Format
            </label>
            <div className="flex gap-1">
              {(["mp3", "wav"] as RecordFormat[]).map((fmt) => (
                <button
                  key={fmt}
                  onClick={() => props.onRecordFormatChange(fmt)}
                  className={`rounded border px-3 py-1 text-xs transition ${
                    props.recordFormat === fmt
                      ? "border-black bg-black text-white"
                      : "border-gray-300 bg-white text-gray-600 hover:border-gray-400"
                  }`}
                >
                  {fmt.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-widest text-gray-400">
              Stereo
            </label>
            <div className="flex gap-1">
              {[false, true].map((val) => (
                <button
                  key={String(val)}
                  onClick={() => props.onRecordStereoChange(val)}
                  className={`rounded border px-3 py-1 text-xs transition ${
                    props.recordStereo === val
                      ? "border-black bg-black text-white"
                      : "border-gray-300 bg-white text-gray-600 hover:border-gray-400"
                  }`}
                >
                  {val ? "ON" : "OFF"}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>

    {/* ── Token Display ── */}
    {props.token && (
      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">
            Token
          </label>
          <div className="flex gap-1">
            <button
              onClick={props.onCopyToken}
              className="flex items-center gap-1 rounded border border-gray-200 px-2 py-0.5 text-[11px] text-gray-600 transition hover:border-gray-400"
            >
              {props.copied ? <IconCheck /> : <IconCopy />}
              {props.copied ? "Đã copy" : "Copy"}
            </button>
            <button
              onClick={props.onClearToken}
              className="flex items-center rounded border border-gray-200 px-2 py-0.5 text-gray-400 transition hover:border-gray-400 hover:text-gray-600"
            >
              <IconTrash />
            </button>
          </div>
        </div>

        <div className="max-h-24 overflow-auto break-all rounded border border-gray-200 bg-gray-50 p-3 font-mono text-[11px] leading-relaxed text-gray-600">
          {props.token}
        </div>

        {props.tokenInfo && (
          <div className="mt-2 grid grid-cols-2 overflow-hidden rounded border border-gray-200">
            {props.infoRows.map(([label, value, expired]) => (
              <div
                key={label}
                className="border-b border-r border-gray-200 px-3 py-2 last:border-r-0 nth-2:border-r-0 nth-last-[-n+2]:border-b-0"
              >
                <div className="text-[10px] uppercase tracking-widest text-gray-400">
                  {label}
                </div>
                <div
                  className={`mt-0.5 text-xs ${expired ? "text-red-600" : "text-black"}`}
                >
                  {value}
                </div>
              </div>
            ))}
          </div>
        )}

        <div>
          <label className="mb-1 mt-3 block text-[10px] font-semibold uppercase tracking-widest text-gray-400">
            Callee ID
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={props.callee}
              onChange={(e) => props.onCalleeChange(e.target.value)}
              onKeyDown={props.onKeyDown}
              placeholder="callee"
              disabled={props.loading}
              className="flex-1 rounded border border-gray-300 bg-white px-3 py-2 font-mono text-sm text-black outline-none transition focus:border-black disabled:opacity-50"
            />
          </div>
        </div>

        {props.isExpired && (
          <div className="mt-2 flex items-center gap-1.5 rounded border border-gray-200 bg-gray-50 px-3 py-1.5 text-[11px] text-gray-400">
            <IconAlert />
            Token đã hết hạn — nhấn "Lấy Token" để tạo mới
          </div>
        )}
      </div>
    )}

    {/* ── Ready to Call ── */}
    {props.callReady && !props.isExpired && (
      <div className="rounded-md border border-black p-5">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <IconPhone />
            <span className="text-xs font-semibold uppercase tracking-widest">
              Sẵn sàng gọi
            </span>
          </div>
          <span
            className={`rounded px-2 py-0.5 text-[10px] tracking-wide ${
              props.record ? "bg-black text-white" : "bg-gray-100 text-gray-500"
            }`}
          >
            {props.record
              ? `REC ${props.recordFormat.toUpperCase()}${props.recordStereo ? " STEREO" : ""}`
              : "NO REC"}
          </span>
        </div>

        <div>
          <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-widest text-gray-400">
            SCCO sẽ được gửi
          </label>
          <pre className="max-h-56 overflow-auto rounded border border-gray-200 bg-gray-50 p-3 font-mono text-[11px] leading-relaxed text-gray-600">
            {JSON.stringify(props.buildSCCO(), null, 2)}
          </pre>
        </div>

        {(props.inCall || props.callStatus) && (
          <div className="mt-3 flex items-center justify-between rounded border border-gray-200 bg-gray-50 px-3 py-2 text-[11px] text-gray-600">
            <span className="uppercase tracking-widest text-gray-400">
              Status
            </span>
            <span>{props.callStatus || "—"}</span>
          </div>
        )}

        {props.inCall || props.callStatus == "Answered" ? (
          <button
            onClick={props.onHangup}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded bg-red-600 py-2.5 text-xs font-semibold uppercase tracking-widest text-white transition hover:bg-red-700"
          >
            <IconPhone />
            Hang up
          </button>
        ) : props.incomingCall ? (
          <div className="mt-3 space-y-2">
            <div className="rounded border border-gray-200 bg-gray-50 px-3 py-2 text-[11px] text-gray-600">
              Incoming call from{" "}
              <span className="font-semibold text-black">
                {props.incomingCall.from}
              </span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={props.onAnswer}
                className="flex flex-1 items-center justify-center gap-2 rounded bg-green-500 py-2.5 text-xs font-semibold uppercase tracking-widest text-white transition hover:bg-green-600"
              >
                <IconPhone />
                Answer
              </button>
              <button
                onClick={props.onReject}
                className="flex flex-1 items-center justify-center gap-2 rounded bg-red-600 py-2.5 text-xs font-semibold uppercase tracking-widest text-white transition hover:bg-red-700"
              >
                <IconPhone />
                Reject
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={props.onMakeCall}
            disabled={!props.callee.trim()}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded bg-black py-2.5 text-xs font-semibold uppercase tracking-widest text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <IconPhone />
            Make Call
          </button>
        )}

        {/* Hidden remote audio sink — SDK writes the remote MediaStream here */}
        <audio
          ref={props.remoteAudioRef}
          autoPlay
          playsInline
          className="hidden"
        />
      </div>
    )}
  </>
);

export default StringeeBody;
