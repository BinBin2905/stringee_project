/**
 * Stringee API — TypeScript Types & Interfaces
 * Generated from: https://developer.stringee.com/docs
 * Covers: Authentication, PCC REST API, Call API, SCCO, Client SDK (JS)
 */

// ============================================================
// SECTION 1: AUTHENTICATION & JWT
// ============================================================

/** Header bắt buộc cho mọi JWT token Stringee */
export interface StringeeJWTHeader {
  typ: "JWT";
  alg: "HS256";
  cty: "stringee-api;v=1"; // BẮT BUỘC — thiếu sẽ bị reject
}

/** Token dành cho Client SDK (StringeeClient.connect) */
export interface StringeeClientTokenPayload {
  jti: string;        // Format: "{apiKeySid}-{timestamp}"
  iss: string;        // API Key SID (bắt đầu bằng SK...)
  exp: number;        // Unix timestamp (giây)
  userId: string;     // User ID của người dùng
  icc_api?: true;     // BẮT BUỘC nếu agent PCC nhận cuộc gọi qua SDK
}

/** Token dành cho REST API (server-to-server HTTP calls) */
export interface StringeeRestApiTokenPayload {
  jti: string;
  iss: string;
  exp: number;
  rest_api: true;     // BẮT BUỘC
}

// ============================================================
// SECTION 2: COMMON TYPES
// ============================================================

/** Kết quả trả về chung của mọi API */
export interface StringeeBaseResponse {
  r: number;          // 0 = success, khác 0 = error
  message?: string;
}

/** Pagination params dùng cho các GET list API */
export interface StringeePaginationParams {
  page?: number;      // Default: 1
  limit?: number;     // Default: 50
}

// ============================================================
// SECTION 3: PCC — AGENT
// ============================================================

/** Trạng thái do agent tự đặt */
export type AgentManualStatus = "AVAILABLE" | "NOT AVAILABLE" | "BUSY" | string;

/** Trạng thái do hệ thống quản lý */
export enum AgentSystemStatus {
  IN_CALL = 0,    // Đang trong cuộc gọi
  AVAILABLE = 1,  // Rảnh
  ACW = 2,        // After Call Work (wrap-up)
}

/** Kiểu routing cuộc gọi đến agent */
export enum AgentRoutingType {
  APP_OR_SIP = 1,   // Route đến App/SIP Phone
  PHONE_NUMBER = 2, // Route đến số điện thoại agent
}

/** Body để tạo agent — POST /v1/agent */
export interface CreateAgentBody {
  name: string;
  stringee_user_id: string;           // Phải khớp với userId trong JWT token
  manual_status?: AgentManualStatus;
  routing_type?: AgentRoutingType;
  phone_number?: string;               // Bắt buộc khi routing_type = 2
}

/** Body để cập nhật agent — PUT /v1/agent/{id} */
export interface UpdateAgentBody {
  name?: string;
  stringee_user_id?: string;
  manual_status?: AgentManualStatus;
  routing_type?: AgentRoutingType;
  phone_number?: string;
  system_status?: string;              // "0" | "1" | "2"
  webhook_status?: string;             // "0" | "1" | "2"
}

/** Agent object trả về từ API */
export interface AgentObject {
  id: string;                          // Format: AG_xxx
  project: number;
  account: number;
  name: string;
  stringee_user_id: string;
  manual_status: AgentManualStatus | null;
  system_status: AgentSystemStatus;
  device_status: number;
  last_time_pickup: number;
  last_time_support_call_ended: number;
}

/** Response khi tạo agent */
export interface CreateAgentResponse extends StringeeBaseResponse {
  project: number;
  agentID: string;
}

/** Response khi lấy danh sách agent */
export interface GetAgentsResponse extends StringeeBaseResponse {
  agents: AgentObject[];
}

// ============================================================
// SECTION 4: PCC — GROUP
// ============================================================

/** Body để tạo group — POST /v1/group */
export interface CreateGroupBody {
  name: string;
}

/** Group object trả về từ API */
export interface GroupObject {
  id: string;                          // Format: GR_xxx
  account: number;
  project: number;
  name: string;
  number_of_agent: number;
}

/** Response khi tạo group */
export interface CreateGroupResponse extends StringeeBaseResponse {
  project: number;
  groupID: string;
}

/** Response khi lấy danh sách group */
export interface GetGroupsResponse extends StringeeBaseResponse {
  groups: GroupObject[];
}

// ============================================================
// SECTION 5: PCC — AGENTS IN GROUP
// ============================================================

/** Body để thêm/xóa agent khỏi group */
export interface ManageAgentInGroupBody {
  agent_id: string;
  group_id: string;
}

/** GroupAgent object trả về */
export interface GroupAgentObject {
  account: number;
  project: number;
  agent_id: string;
  group_id: string;
}

/** Response khi add agent vào group */
export interface AddAgentToGroupResponse extends StringeeBaseResponse {
  project: number;
  agentID: string;
  groupID: string;
}

/** Response khi lấy danh sách agent trong group */
export interface GetGroupAgentsResponse extends StringeeBaseResponse {
  groupAgents: GroupAgentObject[];
}

// ============================================================
// SECTION 6: PCC — QUEUE
// ============================================================

/** Chế độ lịch làm việc cho queue */
export enum QueueScheduleMode {
  ALWAYS = 1,             // Luôn route
  BUSINESS_HOURS = 2,     // Theo business hours
}

/** Điều kiện routing theo trạng thái online */
export enum QueueCondRouting {
  ONLINE_APP_WEB = 1,         // Route khi online Web/App
  ONLINE_APP_WEB_OR_SIP = 2,  // Route khi online Web/App hoặc SIP
}

/** Body để tạo queue — POST /v1/queue */
export interface CreateQueueBody {
  name: string;                         // Bắt buộc
  record_calls?: boolean;               // Default: true
  agent_wrap_up_after_calls?: boolean;  // Default: true
  wrap_up_time_limit?: number;          // Giây. Default: 10
  schedule?: QueueScheduleMode;         // Default: 1
  wait_agent_answer_timeout?: number;   // Giây, min 3. Default: 15
  wait_greeting?: string;               // Tên file greeting đã upload
  hold_greeting?: string;               // Tên file hold music
  maximum_queue_size?: number;          // Coming soon
  maximum_queue_wait_time?: number;     // Giây, Coming soon
  from_number_callout_to_agent?: string; // Số gọi khi callout tới agent
  get_list_agents_url?: string;         // Webhook custom agent routing
  cond_routing?: QueueCondRouting;      // Default: 1
}

/** Body để cập nhật queue — PUT /v1/queue/{id} */
export type UpdateQueueBody = Partial<CreateQueueBody>;

/** Queue object trả về từ API */
export interface QueueObject {
  id: string;                            // Format: QU_xxx
  account: number;
  project: number;
  name: string;
  agent_wrap_up_after_calls: number;     // 0 | 1
  wrap_up_time_limit: number;
  schedule: QueueScheduleMode;
  wait_greeting: string;
  hold_greeting: string;
  wait_agent_answer_timeout: number;
  record_calls: number;                  // 0 | 1
}

/** Response khi tạo queue */
export interface CreateQueueResponse extends StringeeBaseResponse {
  project: number;
  queueID: string;
}

/** Response khi lấy danh sách queue */
export interface GetQueuesResponse extends StringeeBaseResponse {
  queues: QueueObject[];
}

// ============================================================
// SECTION 7: PCC — GROUP ROUTING
// ============================================================

/** Body để gán group vào queue — POST /v1/routing-call-to-groups */
export interface CreateGroupRoutingBody {
  queue_id: string;
  group_id: string;
  primary_group: 0 | 1;  // 1 = ưu tiên cao, 0 = backup
}

/** GroupRouting object */
export interface GroupRoutingObject {
  id: string;                            // Format: GR_RO_xxx
  account: number;
  project: number;
  queue_id: string;
  group_id: string;
  primary_group: 0 | 1;
}

/** Response khi tạo group routing */
export interface CreateGroupRoutingResponse extends StringeeBaseResponse {
  project: number;
  groupRoutingID: string;
}

/** Response khi lấy danh sách group routing */
export interface GetGroupRoutingsResponse extends StringeeBaseResponse {
  groupRoutings: GroupRoutingObject[];
}

// ============================================================
// SECTION 8: PCC — NUMBER MANAGEMENT
// ============================================================

/** Body để thêm số — POST /v1/number */
export interface CreateNumberBody {
  number: string;                        // Số đã mua từ Dashboard
  nickname?: string;
  allow_outbound_calls: boolean;
  enable_ivr: boolean;
  ivr_menu?: string;                     // IVR Tree ID (khi enable_ivr=true)
  queue_id?: string;                     // Queue ID (khi enable_ivr=false)
  record_outbound_calls?: boolean;
}

/** Number object trả về */
export interface NumberObject {
  id: string;                            // Format: NU_xxx
  account: number;
  project: number;
  number: string;
  nickname: string;
  allow_outbound_calls: number;          // 0 | 1
  enable_ivr: number;                    // 0 | 1
  ivr_menu: string;
  queue_id: string;
}

/** Response khi tạo number */
export interface CreateNumberResponse extends StringeeBaseResponse {
  project: number;
  numberID: string;
}

// ============================================================
// SECTION 9: PCC — IVR TREE
// ============================================================

/** Body để tạo IVR tree — POST /v1/ivrtree */
export interface CreateIvrTreeBody {
  tree_name: string;
}

/** IVR Tree object */
export interface IvrTreeObject {
  id: string;                            // Format: TR_xxx
  account: number;
  project: number;
  tree_name: string;
  root_node: string;
}

/** Response khi tạo IVR tree */
export interface CreateIvrTreeResponse extends StringeeBaseResponse {
  project: number;
  ivrTreeID: string;
}

// ============================================================
// SECTION 10: PCC — IVR NODE
// ============================================================

/** Chế độ phát âm thanh của node */
export type IvrNodePlayMode = "talk" | "play";

/** Giọng đọc TTS (tiếng Việt) */
export type IvrVoice =
  | "female"
  | "male"
  | "hatieumai"
  | "ngoclam"
  | "banmai"
  | "leminh"
  | "myan"
  | "lannhi"
  | "sg_male_xuankien_vdts_48k-hsmm"
  | "sg_female_xuanhong_vdts_48k-hsmm"
  | "hn_male_xuantin_vdts_48k-hsmm"
  | "hn_female_thutrang_phrase_48k-hsmm";

/** Body để tạo IVR node — POST /v1/ivrnode */
export interface CreateIvrNodeBody {
  tree: string;                          // IVR Tree ID
  node_name: string;
  node_play_mode: IvrNodePlayMode;
  node_play_content: string;             // Nội dung TTS hoặc tên file
  bargeIn?: boolean;                     // Default: true
  loop_count?: number;                   // Default: 1
  sched?: number;                        // Delay ms. Default: 0
  voice?: IvrVoice;
  speed?: -3 | -2 | -1 | 0 | 1 | 2 | 3; // Default: 0
  keypress_timeout?: number;             // Giây. Default: 5
}

/** IVR Node object */
export interface IvrNodeObject {
  id: string;                            // Format: NO_xxx
  account: number;
  project: number;
  tree: string;
  node_name: string;
  node_play_mode: IvrNodePlayMode;
  node_play_content: string;
  bargeIn: number;                       // 0 | 1
  loop_count: number;
  sched: number;
  voice: IvrVoice;
  speed: number;
  keypress_timeout: number;
  isRootNode: boolean;
}

/** Response khi tạo IVR node */
export interface CreateIvrNodeResponse extends StringeeBaseResponse {
  project: number;
  ivrNodeID: string;
  isRootNode: boolean;
}

// ============================================================
// SECTION 11: PCC — IVR KEYPRESS
// ============================================================

/** Hành động khi bấm phím trong IVR */
export enum IvrKeypressAction {
  VOICEMAIL = 1,           // Chuyển đến voicemail (Coming soon)
  ROUTE_TO_QUEUE = 2,      // Route đến queue
  FORWARD_TO_PHONE = 3,    // Chuyển tiếp đến số điện thoại
  NEXT_NODE = 4,           // Di đến node tiếp theo
  SEND_SMS = 5,            // Gửi SMS (Coming soon)
  END_CALL = 6,            // Kết thúc cuộc gọi
}

/** Phím bấm hợp lệ */
export type IvrNodeKey =
  | "0" | "1" | "2" | "3" | "4"
  | "5" | "6" | "7" | "8" | "9"
  | "*" | "#"
  | "EMPTY_KEY"    // Timeout — không bấm phím
  | "INVALID_KEY"; // Bấm phím không hợp lệ

/** Body để tạo keypress — POST /v1/ivrkeypress */
export interface CreateIvrKeypressBody {
  node: string;                          // IVR Node ID
  node_key: IvrNodeKey;
  action: IvrKeypressAction;
  next_node?: string;                    // Bắt buộc khi action = 4
  queue_id?: string;                     // Bắt buộc khi action = 2
  from_number_callout_to_agent?: string; // Dùng khi action = 3
  to_phone_number?: string;              // Bắt buộc khi action = 3
  sms?: string;                          // Dùng khi action = 5
}

/** IVR Keypress object */
export interface IvrKeypressObject {
  id: string;                            // Format: NO_KE_xxx
  account: number;
  project: number;
  tree: string;
  node: string;
  node_key: IvrNodeKey;
  action: IvrKeypressAction;
  next_node: string | null;
  queue_id: string | null;
  to_phone_number: string | null;
  sms: string | null;
}

/** Response khi tạo keypress */
export interface CreateIvrKeypressResponse extends StringeeBaseResponse {
  project: number;
  ivrNodeKeyID: string;
}

// ============================================================
// SECTION 12: PCC — BLACKLIST
// ============================================================

export interface CreateBlacklistNumberBody {
  number: string;
  ivr_blocked?: 0 | 1;
  queue_blocked?: 0 | 1;
}

export interface BlacklistNumberObject {
  id: string;
  account: number;
  project: number;
  number: string;
  ivr_blocked: 0 | 1;
  queue_blocked: 0 | 1;
}

export interface CreateBlacklistResponse extends StringeeBaseResponse {
  project: number;
  blacklistNumberID: string;
}

// ============================================================
// SECTION 13: PCC — CALL SETTINGS
// ============================================================

export interface CallSettingObject {
  account: number;
  project: number;
  get_customer_info_url: string | null;
  get_customer_info_timeout: number;     // ms. Default: 2000
  event_url: string | null;
  callout_answer_url: string | null;
}

export interface UpdateCallSettingsBody {
  get_customer_info_url?: string;
  get_customer_info_timeout?: number;
  event_url?: string;
  callout_answer_url?: string;
}

export interface GetCallSettingsResponse extends StringeeBaseResponse {
  callSetting: CallSettingObject;
}

// ============================================================
// SECTION 14: PCC — SIP ACCOUNT (PCC)
// ============================================================

export interface CreatePccSipAccountBody {
  user_name: string;
  password: string;
  stringee_user_id?: string;
  extension: number;
}

export interface PccSipAccountObject {
  username: string;
  project: number;
  password: string;
  stringee_user_id: string;
  extension: string;
}

// ============================================================
// SECTION 15: PCC — CALLOUT
// ============================================================

/** Body gọi agent trước, rồi kết nối khách — POST /v1/call/callout */
export interface CalloutBody {
  agentUserId: string;
  toAgentFromNumberDisplay: string;
  toAgentFromNumberDisplayAlias: string;
  toCustomerFromNumber: string;
  customerNumber: string;
}

// ============================================================
// SECTION 16: PCC — TRANSFER CALL
// ============================================================

export type TransferType = "blind" | "attended";
export type TransferToType = "internal" | "external";

export interface TransferCallBody {
  callId: string;
  to: {
    type: TransferToType;
    number: string;   // User ID (internal) hoặc SĐT (external)
    alias: string;
  };
  transferType?: TransferType;  // Default: "blind"
}

// ============================================================
// SECTION 17: PCC — CUSTOM AGENT ROUTING
// ============================================================

/** Cuộc gọi Stringee gửi đến get_list_agents_url */
export interface CustomRoutingCallItem {
  callId: string;
  from: string;
  to: string;
}

/** Body Stringee POST đến get_list_agents_url */
export interface CustomRoutingRequest {
  queueId: string;
  calls: CustomRoutingCallItem[];
  projectId: number;
}

/** Agent trong danh sách custom routing */
export interface CustomRoutingAgent {
  stringee_user_id: string;
  phone_number?: string;
  routing_type: AgentRoutingType;
  answer_timeout: number;           // Giây
}

/** Response server phải trả về cho Stringee */
export interface CustomRoutingResponse {
  version: 2;                       // BẮT BUỘC = 2
  calls: {
    callId: string;
    agents: CustomRoutingAgent[];   // Sắp xếp theo thứ tự ưu tiên
  }[];
}

// ============================================================
// SECTION 18: SCCO ACTIONS
// ============================================================

export type SccoActionType =
  | "connect"
  | "record"
  | "recordMessage"
  | "talk"
  | "play"
  | "stream"
  | "input";

export type SccoEndpointType = "internal" | "external";

export interface SccoEndpoint {
  type: SccoEndpointType;
  number: string;
  alias: string;
}

/** SCCO: connect — kết nối cuộc gọi */
export interface SccoConnectAction {
  action: "connect";
  from: SccoEndpoint;
  to: SccoEndpoint;
  customData?: string;
  continueOnFail?: boolean;
  onFailEventUrl?: string;
  timeout?: number;           // Giây. Default: 60
  maxConnectTime?: number;    // Giây. -1 = không giới hạn
  peerToPeerCall?: boolean;   // Default: true (không qua server Stringee)
}

/** SCCO: record — ghi âm */
export interface SccoRecordAction {
  action: "record";
  eventUrl?: string;
  format?: "mp3" | "wav";     // Default: mp3
  recordStereo?: boolean;
}

/** SCCO: recordMessage — ghi tin nhắn thoại */
export interface SccoRecordMessageAction {
  action: "recordMessage";
  eventUrl?: string;
  format?: "mp3" | "wav";
  endOnKey?: string;          // Default: "#"
  timeout?: number;
  beepStart?: boolean;
}

/** SCCO: talk — text-to-speech */
export interface SccoTalkAction {
  action: "talk";
  text: string;
  voice?: IvrVoice;           // Default: "female"
  speed?: number;             // -3 đến 3. Default: 0
  bargeIn?: boolean;          // Default: true
  loop?: number;              // Default: 1
  silenceTime?: number;       // ms. Default: 0
  answerCall?: boolean;       // Default: true
  continueWhilePlay?: boolean; // Default: false
}

/** SCCO: play — phát file đã upload */
export interface SccoPlayAction {
  action: "play";
  fileName: string;
  bargeIn?: boolean;
  loop?: number;
  silenceTime?: number;
  answerCall?: boolean;
  continueWhilePlay?: boolean;
}

/** SCCO: stream — phát file từ URL */
export interface SccoStreamAction {
  action: "stream";
  fileName: string;           // URL file mp3/wav
  bargeIn?: boolean;
  loop?: number;
  silenceTime?: number;
  answerCall?: boolean;
  continueWhilePlay?: boolean;
}

/** SCCO: input — thu thập DTMF */
export interface SccoInputAction {
  action: "input";
  eventUrl: string;
  timeOut?: number;           // Giây. Default: 5
  submitOnHash?: boolean;     // Default: false
  customField?: string;
  maxDigits?: number;
}

/** Union type cho tất cả SCCO actions */
export type SccoAction =
  | SccoConnectAction
  | SccoRecordAction
  | SccoRecordMessageAction
  | SccoTalkAction
  | SccoPlayAction
  | SccoStreamAction
  | SccoInputAction;

/** Mảng SCCO trả về từ answer_url */
export type SCCO = SccoAction[];

// ============================================================
// SECTION 19: CALL EVENTS (WEBHOOK)
// ============================================================

export type CallStatus =
  | "created"
  | "started"
  | "ringing"
  | "answered"
  | "ended"
  | "agentEnded";

export type CallCreatedReason =
  | "CLIENT_MAKE_CALL"
  | "EXTERNAL_CALL_IN"
  | "SERVER_CALL_OUT_BY_MAKE_CALL_TO_APP_BEFORE"
  | "SERVER_CALL_OUT_BY_MAKE_CALL_TO_EXTERNAL_BEFORE";

export type EndCallCause =
  | "USER_END_CALL"
  | "CAN_NOT_MAKE_CALL"
  | "MAX_CONNECT_TIME"
  | string; // SIP codes như "486 Busy Here", "480 Temporarily Unavailable"

export type CallType = "IVR" | "CALL" | "CONFERENCE";

export interface CallEventEndpoint {
  number: string;
  alias: string;
  is_online?: boolean;
  type?: SccoEndpointType;
}

/** Webhook payload từ event_url */
export interface CallEvent {
  call_status: CallStatus;
  project_id: number;
  request_from_user_id?: string;
  account_sid?: string;
  timestamp_ms: number;
  from: CallEventEndpoint;
  to: CallEventEndpoint;
  type: "stringee_call";
  call_id: string;
  clientCustomData?: string;
  // Chỉ có khi call_status = "ended":
  callCreatedReason?: CallCreatedReason;
  endCallCause?: EndCallCause;
  endedBy?: "EXTERNAL" | "INTERNAL";
  callType?: CallType;
  duration?: number;        // Giây
  answerDuration?: number;  // Giây
}

/** Body Stringee POST đến onFailEventUrl khi connect thất bại */
export interface ConnectFailEvent {
  call_status: "connect_failed";
  project_id: number;
  agent_status: "ended";
  call_id: string;
  from: CallEventEndpoint;
  to: CallEventEndpoint;
  start_time: number;
}

/** Body Stringee POST đến input eventUrl (DTMF) */
export interface DtmfInputEvent {
  time: string;
  dtmf: string;
  call_id: string;
  customField?: string;
  timeout: boolean;
}

// ============================================================
// SECTION 20: ANSWER URL PARAMS
// ============================================================

/** Query params Stringee gửi đến answer_url (app-to-app, app-to-phone) */
export interface AnswerUrlParamsAppCall {
  from: string;
  to: string;
  custom?: string;
  fromInternal: "true";
  userId: string;
  projectId: number;
  callId: string;
}

/** Query params Stringee gửi đến answer_url (phone-to-app) */
export interface AnswerUrlParamsPhoneCall {
  from: string;
  to: string;
  fromInternal: "false";
  uuid: string;
}

// ============================================================
// SECTION 21: CLIENT SDK — StringeeCallState
// ============================================================

export enum StringeeCallState {
  INIT = 0,
  CALLING = 1,
  RINGING = 2,
  ANSWERED = 3,
  CONNECTED = 4,
  BUSY = 5,
  ENDED = 6,
}

// ============================================================
// SECTION 22: CLIENT SDK — makeCall Error Codes
// ============================================================

export enum MakeCallErrorCode {
  SUCCESS = 0,
  ANSWER_URL_EMPTY = 1,
  ANSWER_URL_SCCO_INCORRECT = 2,
  TO_TYPE_INVALID = 3,
  FROM_NUMBER_NOT_FOUND = 4,
  FROM_NUMBER_NOT_BELONG_ACCOUNT = 5,
  SIP_TRUNK_NOT_FOUND = 6,
  SIP_TRUNK_NOT_BELONG_ACCOUNT = 7,
  NOT_ENOUGH_MONEY = 8,
}

// ============================================================
// SECTION 23: CLIENT SDK — Chat Types
// ============================================================

export enum MessageType {
  TEXT = 1,
  PHOTO = 2,
  VIDEO = 3,
  AUDIO = 4,
  FILE = 5,
  LINK = 6,
  CONVERSATION_CREATED = 7,
  CONVERSATION_RENAMED = 8,
  FILE_ALT = 9,
  CONTACT = 10,
  STICKER = 11,
  NOTIFICATION = 100,
}

export enum MessageState {
  INITIALIZE = 0,
  SENDING = 1,
  SENT = 2,
  DELIVERED = 3,
  READ = 4,
}

// ============================================================
// SECTION 24: GREETING FILE
// ============================================================

export interface GreetingFileObject {
  sid: string;
  filename: string;
  desc1: string | null;
  created: number;
}

export interface GetGreetingFilesResponse extends StringeeBaseResponse {
  data: {
    greeting_files: GreetingFileObject[];
    total: string;
  };
}

export interface UploadGreetingFileResponse extends StringeeBaseResponse {
  filename: string;
  fileSid: string;
}

// ============================================================
// SECTION 25: SIP PHONE (Call API — không phải PCC)
// ============================================================

export interface CreateSipPhoneBody {
  username: string;
  password: string;
}

export interface CreateSipPhoneResponse extends StringeeBaseResponse {
  sipusername: string;  // Format: {projectId}_{username}
}

export interface SipPhoneObject {
  username: string;
  extension: string | null;
  email_address: string | null;
}

export interface UpdateSipPhoneBody {
  password: string;
  extension?: number;
}

// ============================================================
// SECTION 26: API ENDPOINTS REFERENCE
// ============================================================

/**
 * Tất cả base URLs của Stringee API
 */
export const STRINGEE_API = {
  /** Call API & Greeting File */
  CALL_API: "https://api.stringee.com",

  /** PCC REST API */
  PCC_API: "https://icc-api.stringee.com",

  /** SIP Domain */
  SIP_DOMAIN: "v2.stringee.com:15060",

  /** PCC Answer URL (set cho Number khi enable PCC) */
  PCC_ANSWER_URL: "http://v2.stringee.com:8282/answer_url",

  /** PCC Event URL (set cho Number khi enable PCC) */
  PCC_EVENT_URL: "http://v2.stringee.com:8282/event_url",

  /** PCC Answer URL (set cho Project khi enable PCC) */
  PCC_PROJECT_ANSWER_URL: "http://v2.stringee.com:8282/project_answer_url",

  /** PCC Event URL (set cho Project khi enable PCC) */
  PCC_PROJECT_EVENT_URL: "http://v2.stringee.com:8282/project_event_url",
} as const;

/**
 * PCC REST API endpoints
 */
export const PCC_ENDPOINTS = {
  // Agent
  AGENT: "/v1/agent",
  AGENT_BY_ID: (id: string) => `/v1/agent/${id}`,

  // Group
  GROUP: "/v1/group",
  GROUP_BY_ID: (id: string) => `/v1/group/${id}`,

  // Agents in Group
  MANAGE_AGENTS_IN_GROUP: "/v1/manage-agents-in-group",

  // Queue
  QUEUE: "/v1/queue",
  QUEUE_BY_ID: (id: string) => `/v1/queue/${id}`,

  // Group Routing
  GROUP_ROUTING: "/v1/routing-call-to-groups",
  GROUP_ROUTING_BY_ID: (id: string) => `/v1/routing-call-to-groups/${id}`,

  // Number
  NUMBER: "/v1/number",
  NUMBER_BY_ID: (id: string) => `/v1/number/${id}`,

  // IVR Tree
  IVR_TREE: "/v1/ivrtree",
  IVR_TREE_BY_ID: (id: string) => `/v1/ivrtree/${id}`,

  // IVR Node
  IVR_NODE: "/v1/ivrnode",
  IVR_NODE_BY_ID: (id: string) => `/v1/ivrnode/${id}`,

  // IVR Keypress
  IVR_KEYPRESS: "/v1/ivrkeypress",
  IVR_KEYPRESS_BY_ID: (id: string) => `/v1/ivrkeypress/${id}`,

  // Blacklist
  BLACKLIST_NUMBER: "/v1/blacklistnumber",
  BLACKLIST_NUMBER_BY_ID: (id: string) => `/v1/blacklistnumber/${id}`,

  // Call Settings
  CALL_SETTINGS: "/v1/callsettings",

  // SIP Account (PCC)
  SIP_ACCOUNT_PCC: "/v1/ipphonecommon",
  SIP_ACCOUNT_PCC_BY_USERNAME: (username: string) => `/v1/ipphonecommon/${username}`,

  // Callout
  CALLOUT: "/v1/call/callout",

  // Transfer
  TRANSFER: "/v1/call/transfer",
} as const;
