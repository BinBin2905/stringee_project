# Stringee Call Data Flow — Reference

Tài liệu trao đổi dữ liệu giữa repo `BinBin2905/stringee_project` và Stringee Cloud cho mọi luồng outbound / inbound. Mọi tên type đều khớp với code trong repo (`server/src/types/*`, `pcc-server/src/types/*`); mọi tên field/endpoint khớp với docs Stringee.

---

## 0. Bốn kênh giao tiếp

Mọi tương tác Stringee–Server có thể quy về 4 dạng:

| # | Kênh | Khởi xướng | Phương thức | Vai trò |
|---|---|---|---|---|
| ① | **Webhook IN** | Stringee | GET / POST → server | Stringee hỏi server "phải làm gì" hoặc thông báo trạng thái |
| ② | **Webhook RESPONSE** | Server | (HTTP response của ①) | Server trả SCCO / JSON cho Stringee |
| ③ | **REST OUT** | Server | GET / POST / PUT / DELETE → Stringee | Server chủ động gọi API quản trị / điều khiển cuộc gọi |
| ④ | **REST RESPONSE** | Stringee | (HTTP response của ③) | Stringee trả kết quả cho server |

Auth headers:
- ① (webhook IN) — không cần auth (Stringee là caller). Bạn nên verify nguồn bằng allowlist IP / shared secret nếu prod.
- ③ (REST OUT) — header `X-STRINGEE-AUTH: <JWT>`, JWT phải có `cty:"stringee-api;v=1"` ở header và `rest_api:true` (Call API) hoặc `icc_api`-token cho một số PCC API trong payload.

---

## 1. OUTBOUND — User app khởi tạo cuộc gọi

### 1.1 App → App  /  App → Phone (Call API basic)

Đây là luồng `client/` đang dùng (chưa qua PCC). User cầm Web SDK gọi `makeCall()`.

```
Lifelines:    Client SDK    My Server         Stringee Cloud      Receiver (app or PSTN)

  ┌─────────────┐                                                           
  │ makeCall(   │ ─── signaling (WebRTC/SIP) ──→  Stringee                  
  │   from,     │                                                           
  │   to,       │                                                           
  │   custom)   │                                                           
  └─────────────┘                                                           
                                                                            
                  ① GET /project_answer_url?from=&to=                       
                     &fromInternal=true&userId=&projectId=&callId=&custom=  
                  ←─────────────────────────────── Stringee                 
                                                                            
                  ② 200 OK · body = SCCO[]                                  
                     [{action:"record", eventUrl, format:"mp3"},            
                      {action:"connect", from:Party, to:Party,              
                       peerToPeerCall:false, customData?, ...}]             
                  ─────────────────────────────→ Stringee                   
                                                                            
                                                  Stringee ───── ring ────→ Receiver
                                                                            
                  ③ POST /project_event_url                                 
                     EventWebhookBody {call_status:"started", ...}          
                  ←─────────────────────────────── Stringee                 
                                                                            
                  ③ POST {call_status:"ringing"}    ← Stringee              
                  ③ POST {call_status:"answered"}   ← Stringee              
                                                                            
                                                  ── media (WebRTC P2P or RTP via cloud) ──
                                                                            
                  ③ POST {call_status:"ended",                              
                          duration, endCallCause, ...}  ← Stringee          
                                                                            
                  ④ POST record.eventUrl  (recording đã upload)             
                     RecordCompletedEvent {recordingUrl, fileSize, format}  
                  ←─────────────────────────────── Stringee                 
                  ⚠️ HIỆN ĐANG TRÙNG /project_event_url — handler không phân biệt
```

**Wire details — gì gửi gì nhận:**

| Bước | Chiều | Type khai báo trong repo | Code |
|---|---|---|---|
| ① | Stringee → Server (query) | `AnswerWebhookQuery` (`server/types/stringee.ts:125`) hoặc narrow → `AnswerUrlParamsAppCall` | `webhooks.ts:46` |
| ② | Server → Stringee (response body) | `SccoAction[]` | `webhooks.ts:18` (`buildScco`) |
| ③ | Stringee → Server (POST body) | `EventWebhookBody` | `webhooks.ts:54, 69` |
| ④ | Stringee → Server (POST body) | **chưa khai báo type** — cần `RecordCompletedEvent` | (đang dùng chung handler ③) |

**SCCO bắt buộc/khuyến nghị cho luồng này:**

```ts
// Tối thiểu (chưa record, chưa fail handling):
[{
  action: "connect",
  from: { type: "internal", number: from, alias: from },
  to:   { type: toIsExternal ? "external" : "internal", number: to, alias: to },
}]

// Best practice (có record, có fail handling, có custom data):
[
  { action: "record", eventUrl: "https://you.com/recording-done",
    format: "mp3", recordStereo: true },
  {
    action: "connect",
    from: { type: "internal", number: from, alias: from },
    to:   { type: "external", number: to, alias: to },
    customData: customFromMakeCall,             // pipe through
    peerToPeerCall: false,                      // mandatory if record
    timeout: 30,                                // ringing timeout (sec)
    continueOnFail: true,                       // fire onFail webhook
    onFailEventUrl: "https://you.com/connect-failed",
    maxConnectTime: -1,
  },
]
```

---

### 1.2 Server-initiated callout (Call API REST)

Server tự gọi qua API Stringee (vd: campaign dialer). Repo expose `/admin/make-call` proxy.

```
Lifelines:    My Server                      Stringee Cloud           Caller leg     Callee leg
                                                                                       
  ① POST api.stringee.com/v1/call2/callout                                             
     body: MakeCalloutRequest                                                          
     {from:Party, to:Party[],                                                          
      actions?:SccoAction[],                                                           
      answer_url?:string}                                                              
     header: X-STRINGEE-AUTH:<JWT rest_api:true>                                       
  ─────────────────────────────────────────→                                          
                                                                                       
  ② 200 OK · MakeCalloutResponse                                                      
     StringeeResponse<{callId?:string}>                                                
     {r:0, message:"...", data:{callId:"call-vn-..."}}                                 
  ←─────────────────────────────────────────                                          
                                                                                       
                                              Stringee dials caller leg ─────→ Caller  
                                              Caller answers                           
                                                                                       
  (nếu KHÔNG kèm `actions` trong body, Stringee GET answer_url để biết SCCO)           
                                                                                       
  ① GET answer_url?...                                                                
  ←─────────────────────────────────────────                                          
                                                                                       
  ② 200 OK · SCCO (như 1.1)                                                           
  ─────────────────────────────────────────→                                          
                                                                                       
                                                                       ── connect ───→ Callee
                                                                                       
  ③ POST event_url events (started → ringing → answered → ended)                      
  ←─────────────────────────────────────────                                          
```

**Các REST OUT bổ sung trong repo:**

| Endpoint | Method | Body | Khi dùng |
|---|---|---|---|
| `/v1/call2/putactions` | POST | `{callId, actions:SccoAction[]}` | Inject SCCO mới giữa cuộc gọi (vd: chuyển từ talk sang connect) |
| `/v1/call2/stop` | POST | `{callId}` | Kết thúc cưỡng bức |
| `/v1/call2/transfer` | POST | `TransferCallRequest {callId, fromUserId, to:Party}` | Chuyển cuộc gọi sang user/số khác |
| `/v1/call2/adduser` | POST | `{callId, ...}` | Thêm người vào conference |
| `/v1/call/log` | GET | (query: `version=2&limit=&sort_by=&search_after[]=`) | Lịch sử cuộc gọi |
| `/v1/call/recording/{id}` | GET | — | Tải file ghi âm (binary stream) |

Tất cả khai báo ở `server/src/routes/admin.ts` — table `ENDPOINTS`.

---

### 1.3 PCC Callout (agent → customer)

Đặc thù PCC: dial agent trước, agent nhấc, mới ghép sang customer. Repo expose `/admin/pcc/calls/callout`.

```
Lifelines:  Agent UI / Admin    My Server         Stringee PCC          Agent App         Customer

  ⓪ POST /admin/pcc/calls/callout                                                         
     CalloutRequest                                                                       
  ─────────────────────────→                                                              
                                                                                           
                            ① POST icc-api.stringee.com/v1/call/callout                   
                               body: CalloutRequest                                       
                               {agentUserId, toAgentFromNumberDisplay,                    
                                toAgentFromNumberDisplayAlias,                            
                                toCustomerFromNumber, customerNumber}                     
                            ─────────────────────────→                                   
                                                                                           
                            ② CalloutResponse {r, message, callId}                       
                            ←─────────────────────────                                   
                                                                                           
                                              Stringee → Agent App: incomingcall          
                                                       (SDK event)                        
                                                                                           
                                              Agent picks up                              
                                                                                           
                            ① GET callout_answer_url?from=&to=&callId=&customerNumber=  ← Stringee
                                                                                           
                            ② 200 OK · SCCO[]                                            
                               buildCalloutScco(q):                                       
                               [{action:"connect",                                        
                                 from:{type:"external",number:agent#,alias:agent#},       
                                 to:{type:"external",number:customer#,alias:customer#},   
                                 peerToPeerCall:false}]                                   
                            ─────────────────────────→                                   
                                                                                           
                                              Stringee dials customer ─────────────────→ Customer
                                                                                           
                            ③ POST pccEventUrl (PccEventBody) ← Stringee                 
```

**Trong repo:**
- Step ⓪ đăng ký ở `pcc-server/src/routes/pcc.ts` (`fastify.post(.../callout)`).
- Step ① proxy qua `pcc-server/src/services/stringeeClient.ts`.
- Step ① (callout_answer) đăng ký ở `pcc-server/src/routes/webhooks.ts:42`, `buildCalloutScco`.
- Step ③ đăng ký ở `pcc-server/src/routes/webhooks.ts:38`, đẩy vào `eventLog`.

**SCCO khuyến nghị cho callout_answer_url:**
```ts
[
  { action: "record", eventUrl: env.recordingEventUrl, format: "mp3" },
  { action: "connect",
    from: { type: "external", number: q.from, alias: q.from },
    to:   { type: "external", number: customer, alias: customer },
    peerToPeerCall: false,
    timeout: 45,
    continueOnFail: true,
    onFailEventUrl: env.calloutFailUrl },
]
```

---

## 2. INBOUND — Khách hàng gọi đến

### 2.1 Phone → App  /  Phone → Phone (Call API basic, không PCC)

```
Lifelines:    PSTN Caller       Stringee Cloud         My Server                 Internal User App

  Customer dials Stringee Number ─────────────→                                                    
                                                                                                   
                                  ① GET Number's answer_url                                       
                                     ?from=PSTN_NUM&to=STRINGEE_NUM                                
                                     &fromInternal=false&uuid=...                                  
                                  ─────────────────────────→                                      
                                                                                                   
                                                          Server logic:                            
                                                          getFirstFreeUser() → routedUser          
                                                          setUserBusy(routedUser, 1800s)           
                                                                                                   
                                  ② 200 OK · SCCO[]                                               
                                     [{action:"record", eventUrl, format:"mp3"},                  
                                      {action:"connect",                                           
                                       from:{type:"external", number:caller#, alias:caller#},      
                                       to:{type:"internal",  number:routedUser, alias:routedUser}, 
                                       peerToPeerCall:false}]                                      
                                  ←─────────────────────────                                      
                                                                                                   
                                  Stringee → User App: incomingcall (WebRTC) ───────────────────→ 
                                                                                                   
                                                                       App.answer()                
                                                                                                   
                                  ③ POST /event_url {call_status:"answered", from, to, ...}      
                                  ─────────────────────────→                                      
                                                                                                   
              ── media (RTP via Stringee since peerToPeerCall:false) ──                            
                                                                                                   
                                  ③ POST {call_status:"ended", duration, ...}                    
                                  ─────────────────────────→                                      
                                                          setUserFree(to.number)                   
                                                                                                   
                                  ④ POST record.eventUrl (recording uploaded)                    
                                     RecordCompletedEvent                                          
                                  ─────────────────────────→  ⚠️ chung handler với ③             
```

**Khác biệt phone-to-phone:**
- Step ②: `to.type = "external"`, `to.number = forwardPhone`. `from.number` vẫn là PSTN caller, `alias` vẫn caller#.

**Wire details:**

| Bước | Chiều | Type | Code |
|---|---|---|---|
| ① | Stringee → Server (query) | `AnswerUrlParamsPhoneCall` (`server/types/stringee.ts`) | `webhooks.ts:60` |
| ② | Server → Stringee (response) | `SccoAction[]` | `webhooks.ts:18` (`buildScco` với `routedUser`) |
| ③ | Stringee → Server (POST body) | `EventWebhookBody` | `webhooks.ts:69` |
| ④ | Stringee → Server (POST body) | **chưa khai báo** | (chung handler ③) |

---

### 2.2 PCC Inbound (Number bật PCC)

PCC-enabled Number có `answer_url` cố định = `http://v2.stringee.com:8282/answer_url` (Stringee tự xử lý IVR/Queue). Server bạn KHÔNG phải trả SCCO cho luồng này. Thay vào đó server tham gia qua 4 webhook khác.

```
Lifelines:  PSTN Customer    Stringee PCC engine       My Server                Agent App

  Customer dials PCC Number ─────────────→                                                
                                                                                          
                          (Stringee PCC tự xử lý answer_url)                              
                                                                                          
                                          ① GET get_customer_info_url                    
                                             ?from=CUST#&to=PCC#&project=ID               
                                          ─────────────────→                              
                                                                                          
                                          ② 200 OK · CustomerInfo JSON                   
                                             {name?, email?, phone?, notes?,              
                                              [k:string]:unknown}                         
                                             → forwarded to agent as                      
                                             StringeeCall.customDataFromYourServer        
                                          ←─────────────────                              
                                                                                          
                          (Stringee chạy IVR — TTS prompts, key collection.               
                           IVR tree được cấu hình trước qua REST CRUD vào                 
                           /v1/ivrtree, /v1/ivrnode, /v1/ivrkeypress.)                    
                                                                                          
                          Stringee chọn Queue → Group(s) (default routing)                
                          HOẶC nếu Queue.get_list_agents_url được set:                    
                                                                                          
                                          ① POST queue.get_list_agents_url               
                                             body: CustomRoutingRequest                   
                                             {queueId, calls[], projectId}                
                                          ─────────────────→                              
                                                                                          
                                          ② 200 OK · CustomRoutingResponse               
                                             {version:2,                                  
                                              calls:[{callId, agents:[                    
                                                {stringee_user_id,                        
                                                 phone_number?,                           
                                                 routing_type:1|2,                        
                                                 answer_timeout}]}]}                      
                                          ←─────────────────  ⚠️ chưa có route trong repo
                                                                                          
                          Stringee dials chosen agent ──────────────────────────────────→ 
                                                                                          
                                                                  Agent picks up          
                                                                                          
                                          ③ POST pcc.event_url (PccEventBody) ← Stringee 
                                             {call_status, from, to, project_id, ...}     
                                                                                          
                                          ⚠️ Nếu connect_failed (continueOnFail trong SCCO PCC)
                                          ③ POST onFailEventUrl (ConnectFailEvent)        
```

**Wire details:**

| Bước | Chiều | Type | Code |
|---|---|---|---|
| ① get_customer_info | Stringee → Server (query) | `GetCustomerInfoQuery` | `pcc-server/webhooks.ts:30` |
| ② get_customer_info | Server → Stringee (body) | `CustomerInfo` | (cùng handler) |
| ① get_list_agents | Stringee → Server (POST body) | `CustomRoutingRequest` | **chưa có route** |
| ② get_list_agents | Server → Stringee (body) | `CustomRoutingResponse` (version BẮT BUỘC = 2) | **chưa có route** |
| ③ event | Stringee → Server (POST body) | `PccEventBody` | `pcc-server/webhooks.ts:38` (đẩy vào `eventLog` ring buffer) |

---

## 3. Webhook IN — Reference Table

Tất cả endpoint Stringee gọi đến server bạn, đầy đủ.

| # | Webhook | Method | Cấu hình tại | Trigger | Query/Body type | Server PHẢI trả |
|---|---|---|---|---|---|---|
| 1 | Project answer_url | GET | Dashboard → Project | App-initiated call (app→app, app→phone) | `AnswerUrlParamsAppCall` | `SCCO[]` |
| 2 | Number answer_url | GET | Dashboard → Number | PSTN-initiated call (phone→app, phone→phone) | `AnswerUrlParamsPhoneCall` | `SCCO[]` |
| 3 | Project event_url | POST | Dashboard → Project | Call status change (app-init) | `EventWebhookBody` | `200 OK` (body bất kỳ) |
| 4 | Number event_url | POST | Dashboard → Number | Call status change (PSTN-init) | `EventWebhookBody` | `200 OK` |
| 5 | record.eventUrl | POST | Trong SCCO `{action:"record",eventUrl}` | File ghi âm upload xong | **`RecordCompletedEvent`** (chưa có type trong repo) | `200 OK` |
| 6 | recordMessage.eventUrl | POST | SCCO `{action:"recordMessage",eventUrl}` | Voicemail ghi xong | tương tự record | `200 OK` |
| 7 | input.eventUrl | POST | SCCO `{action:"input",eventUrl}` | DTMF thu được hoặc timeout | `DtmfInputEvent` / `SccoInputResult` | `SCCO[]` (action kế tiếp) |
| 8 | onFailEventUrl | POST | SCCO `{action:"connect",continueOnFail:true,onFailEventUrl}` | Nhánh connect fail (busy/no-answer/...) | `ConnectFailEvent` | `200 OK` |
| 9 | PCC get_customer_info_url | GET | PCC Call Settings | PCC inbound — lookup khách | `GetCustomerInfoQuery` | `CustomerInfo` JSON |
| 10 | PCC event_url | POST | PCC Call Settings | PCC call status (mọi thay đổi) | `PccEventBody` | `200 OK` |
| 11 | PCC callout_answer_url | GET | PCC Call Settings | PCC callout — agent đã nhấc | `CalloutAnswerQuery` | `SCCO[]` (bridge sang customer) |
| 12 | Queue get_list_agents_url | POST | Queue (custom routing) | Stringee hỏi danh sách agent priority | `CustomRoutingRequest` | `CustomRoutingResponse` (`version:2`) |

**Trạng thái implementation trong repo:**

| # | Webhook | Trạng thái | Ghi chú |
|---|---|---|---|
| 1 | Project answer_url | ✅ implemented | `webhooks.ts:46` |
| 2 | Number answer_url | ✅ implemented | `webhooks.ts:60` |
| 3, 4 | event_url | ✅ implemented | log + setUserFree |
| 5 | record.eventUrl | ⚠️ trùng URL với #3, không phân biệt được payload — **mất `recordingUrl`** |
| 6 | recordMessage.eventUrl | ❌ unused | repo chưa có IVR voicemail |
| 7 | input.eventUrl | ❌ unused | repo chưa có IVR custom |
| 8 | onFailEventUrl | ❌ **NOT IMPLEMENTED** | type `ConnectFailEvent` đã có, chưa register route |
| 9 | PCC get_customer_info_url | ✅ implemented (mock) | trả "Unknown caller" — cần wire CRM |
| 10 | PCC event_url | ✅ implemented | đẩy vào in-memory `eventLog` |
| 11 | PCC callout_answer_url | ✅ implemented | `buildCalloutScco` |
| 12 | Queue get_list_agents_url | ❌ **NOT IMPLEMENTED** | type đã có, chưa register route |

---

## 4. REST OUT — Reference Table

### 4.1 Call API · base `https://api.stringee.com`

Auth: `X-STRINGEE-AUTH: <JWT>` với JWT payload `{rest_api: true}`.

| Endpoint | Method | Request body | Response | Repo proxy route |
|---|---|---|---|---|
| `/v1/call2/callout` | POST | `MakeCalloutRequest` `{from:Party, to:Party[], actions?:SccoAction[], answer_url?}` | `MakeCalloutResponse` `StringeeResponse<{callId?}>` | `/admin/make-call` |
| `/v1/call2/putactions` | POST | `{callId, actions:SccoAction[]}` | `StringeeResponse` | `/admin/put-actions` |
| `/v1/call2/stop` | POST | `{callId}` | `StringeeResponse` | `/admin/stop-call` |
| `/v1/call2/transfer` | POST | `TransferCallRequest` `{callId, fromUserId, to:Party}` | `TransferCallResponse` | `/admin/transfer-call` |
| `/v1/call2/adduser` | POST | `{callId, ...}` | `StringeeResponse` | `/admin/add-participant` |
| `/v1/call2/setvideofloor` | POST | `{callId, ...}` | `StringeeResponse` | `/admin/force-video-floor` |
| `/v1/user/sendcustommessage` | POST | `{to, msg}` | `StringeeResponse` | `/admin/send-message` |
| `/v1/call/log` | GET | (query) `version=2&limit=&sort_by=&search_after[]=` | `StringeeResponse<{calls[],search_after,totalCalls}>` | `/admin/call-log` |
| `/v1/call/recording/{recordId}` | GET | — | binary (mp3/wav/mp4) | `/admin/recording/:recordId` (proxyBinary) |

Toàn bộ khai báo trong `server/src/routes/admin.ts` (table `ENDPOINTS`) + service `stringeeProxy.ts`.

### 4.2 PCC API · base `https://icc-api.stringee.com`

Auth tương tự (`X-STRINGEE-AUTH`). Một số endpoint xử lý token đặc biệt — xem `pcc-server/src/services/tokenService.ts`.

#### Agent
| Endpoint | Method | Body | Response |
|---|---|---|---|
| `/v1/agent` | POST | `CreateAgentRequest` | `CreateAgentResponse` |
| `/v1/agent` | GET | (query `ListAgentsQuery`) | `ListAgentsResponse` (paginated) |
| `/v1/agent/{id}` | PUT | `UpdateAgentRequest` | `UpdateAgentResponse` |
| `/v1/agent/{id}` | DELETE | — | `DeleteAgentResponse` |

#### Group / Junctions
| Endpoint | Method | Body | Response |
|---|---|---|---|
| `/v1/group` | POST | `CreateGroupRequest` | `CreateGroupResponse` |
| `/v1/group` | GET | `ListGroupsQuery` | `ListGroupsResponse` |
| `/v1/group/{id}` | PUT/DELETE | `UpdateGroupRequest` / — | `UpdateGroupResponse` / `DeleteGroupResponse` |
| `/v1/manage-agents-in-group` | POST | `AddAgentToGroupRequest {agent_id,group_id}` | `AddAgentToGroupResponse` |
| `/v1/manage-agents-in-group` | GET | `?group=` | `ListGroupAgentsResponse` |
| `/v1/manage-agents-in-group` | DELETE | (body) `RemoveAgentFromGroupRequest` | `RemoveAgentFromGroupResponse` |
| `/v1/routing-call-to-groups` | POST | `AddGroupToQueueRequest {queue_id,group_id,primary_group}` | `AddGroupToQueueResponse` |
| `/v1/routing-call-to-groups/{id}` | PUT/DELETE | `UpdateGroupRoutingRequest` / — | resp |

#### Queue
| Endpoint | Method | Body | Response |
|---|---|---|---|
| `/v1/queue` | POST | `CreateQueueRequest` | `CreateQueueResponse` |
| `/v1/queue` | GET | `ListQueuesQuery` | `ListQueuesResponse` |
| `/v1/queue/{id}` | PUT/DELETE | `UpdateQueueRequest` / — | resp |

#### Number
| Endpoint | Method | Body | Response |
|---|---|---|---|
| `/v1/number` | POST | `CreateNumberRequest` | `CreateNumberResponse` |
| `/v1/number` | GET | `ListNumbersQuery` | `ListNumbersResponse` |
| `/v1/number/{id}` | PUT/DELETE | `UpdateNumberRequest` / — | resp |

#### IVR
| Endpoint | Method | Body | Response |
|---|---|---|---|
| `/v1/ivrtree` | POST/GET/PUT/DELETE | `CreateIvrTreeRequest` / `ListIvrTreesQuery` / `UpdateIvrTreeRequest` / — | resp |
| `/v1/ivrnode` | POST/GET/PUT/DELETE | `CreateIvrNodeRequest` / `ListIvrNodesQuery {tree?}` / `UpdateIvrNodeRequest` / — | resp |
| `/v1/ivrkeypress` | POST/GET/PUT/DELETE | `CreateIvrKeypressRequest` / `ListIvrKeypressesQuery {node}` / `UpdateIvrKeypressRequest` / — | resp |

#### Other
| Endpoint | Method | Body | Response |
|---|---|---|---|
| `/v1/blacklistnumber` | POST/GET/PUT/DELETE | `CreateBlacklistNumberRequest` / ... | resp |
| `/v1/ipphonecommon` | POST/GET/PUT/DELETE | `CreateSipAccountRequest` / ... | `*SipAccountResponse` (envelope dùng `msg` thay `message`) |
| `/v1/callsettings` | GET/PUT | — / `UpdateCallSettingsRequest` | `GetCallSettingsResponse` / `UpdateCallSettingsResponse` |
| `/v1/call/callout` | POST | `CalloutRequest` (PCC version) | `CalloutResponse` |
| `/v1/call/transfer` | POST | `TransferCallRequest` (PCC version) | `TransferCallResponse` |
| `/v1/greetingfile` (Call API host) | GET | — | `ListGreetingFilesResponse` |
| `/v1/greetingfile/upload` (Call API host) | POST | multipart | `UploadGreetingFileResponse` |

Tất cả khai báo ở `pcc-server/src/services/stringeeApi.ts` + `pcc-server/src/routes/pcc.ts`.

---

## 5. Cheat sheet — "Tôi nhận gì / phải trả gì?"

### Khi nhận từ Stringee (① Webhook IN)

```
┌─────────────────────────────────────────────────────────────────────┐
│ Endpoint type     │ Bạn nhận               │ Bạn phải trả          │
├─────────────────────────────────────────────────────────────────────┤
│ answer_url        │ Query string           │ SCCO[] JSON body       │
│                   │ (AnswerUrl*Params)     │                        │
│ event_url         │ POST JSON body         │ 200 OK (body bất kỳ)  │
│                   │ (EventWebhookBody)     │                        │
│ record.eventUrl   │ POST JSON body         │ 200 OK                 │
│                   │ (RecordCompletedEvent) │                        │
│ input.eventUrl    │ POST JSON body         │ SCCO[] (action tiếp)   │
│                   │ (DtmfInputEvent)       │                        │
│ onFailEventUrl    │ POST JSON body         │ 200 OK                 │
│                   │ (ConnectFailEvent)     │                        │
│ get_customer_info │ Query string           │ JSON object            │
│                   │ (GetCustomerInfoQuery) │ (CustomerInfo)         │
│ get_list_agents   │ POST JSON body         │ JSON object            │
│                   │ (CustomRoutingRequest) │ (CustomRoutingResponse,│
│                   │                        │  version: 2 BẮT BUỘC)  │
│ callout_answer    │ Query string           │ SCCO[] (connect→cust)  │
│                   │ (CalloutAnswerQuery)   │                        │
└─────────────────────────────────────────────────────────────────────┘
```

### Khi gọi Stringee (③ REST OUT)

```
┌─────────────────────────────────────────────────────────────────────┐
│ Mọi request Call API:                                              │
│   URL    : https://api.stringee.com/<path>                          │
│   Header : X-STRINGEE-AUTH: <JWT>                                   │
│   JWT.header  : {typ:"JWT", alg:"HS256",                            │
│                   cty:"stringee-api;v=1"}        ← BẮT BUỘC         │
│   JWT.payload : {jti, iss, exp, rest_api: true}                     │
│   Body   : JSON theo từng endpoint                                  │
│                                                                     │
│ Mọi request PCC API:                                                │
│   URL    : https://icc-api.stringee.com/<path>   ← KHÁC base URL    │
│   Header : X-STRINGEE-AUTH: <JWT> (rest_api:true)                   │
│   Body   : JSON theo từng endpoint                                  │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 6. Các điểm bạn ĐANG can thiệp khi gửi cho Stringee (chuẩn hoá lại)

Trong code repo bạn, các điểm xử lý/biến đổi data trước khi gửi cho Stringee:

### 6.1 Build SCCO trong webhook response

**`server/src/routes/webhooks.ts` — `buildScco`** (cho Project answer_url + Number answer_url):
- Input: `(from, to, fromInternal, routedUser?)`
- Output: `[record, connect]` SCCO array
- Các quyết định business nội tại:
  - `to.type` được pick: nếu có `routedUser` → internal; nếu `to` là số → external; ngược lại internal
  - `from.number` được rewrite cho app-to-phone → `env.stringeeHotline`
  - `record.eventUrl` được build từ env

**`pcc-server/src/routes/webhooks.ts` — `buildCalloutScco`** (cho PCC callout_answer_url):
- Input: `CalloutAnswerQuery`
- Output: `[connect]` SCCO array — `from.type` & `to.type` đều `external` (callout là agent_phone → customer_phone)

### 6.2 Build CustomerInfo response

**`pcc-server/src/routes/webhooks.ts` — handler `getCustomerInfoUrl`**:
- Input: `GetCustomerInfoQuery {from, to, project}`
- Output (placeholder): `{name:"Unknown caller", phone:from, notes:"..."}` — đây là chỗ để wire CRM

### 6.3 Proxy REST request

**`server/src/services/stringeeProxy.ts` — `proxyTo`**:
- Inject header `X-STRINGEE-AUTH` từ `generateRestApiToken`
- Inject `Content-Type: application/json` nếu có body
- Forward `body` (JSON.stringify) hoặc `query` (raw string)
- Trả về `ProxyResult<T> {status, body}`

**`pcc-server/src/services/stringeeClient.ts`**: tương tự nhưng với `pccApiBase`.

### 6.4 Build JWT

**`server/src/services/tokenService.ts`**:
- `generateClientToken(userId, ttl)` → JWT cho Web SDK
  - Header: `{typ:"JWT", alg:"HS256", cty:"stringee-api;v=1"}`
  - Payload: `{jti, iss, exp, userId}` (không có `icc_api`)
- `generateRestApiToken(ttl)` → JWT cho REST OUT
  - Header: same
  - Payload: `{jti, iss, exp, rest_api:true}`

**`pcc-server/src/services/tokenService.ts`**: thêm
- `generateClientToken(userId, ttl)` — payload có `{userId, icc_api:true}` (BẮT BUỘC cho PCC agent)
- `generatePccApiToken(ttl)` — `{rest_api:true}` (PCC dùng cùng claim)

---

## 7. Khoảng trống đáng chú ý (so với spec đầy đủ)

| Hạng mục | Tình trạng | Mức độ |
|---|---|---|
| `RecordCompletedEvent` type | ❌ chưa có; payload từ `record.eventUrl` đang lọt vào `EventWebhookBody` handler không có discriminator | 🔴 |
| `onFailEventUrl` route | ❌ type `ConnectFailEvent` có sẵn, chưa register Fastify handler | 🔴 |
| `Queue.get_list_agents_url` route | ❌ type `CustomRoutingRequest/Response` có sẵn, chưa register | 🟠 |
| `recordMessage` / `input` SCCO actions | ❌ type có, chưa dùng (repo chưa làm IVR custom) | 🟡 |
| `customData` pipe-through | ❌ `custom` query bị drop, không gắn vào `connect.customData` | 🔴 |
| `continueOnFail` + `onFailEventUrl` trong SCCO | ❌ chưa set | 🟠 |
| `timeout` trong SCCO connect | ❌ chưa set (default 60s — quá dài) | 🟠 |
| `recordStereo` | ❌ chưa set (default mono) | 🟡 |
| Persistent storage cho events / recordings | ❌ in-memory only (`eventLog`, không lưu recordingUrl) | 🟠 |
| CRM lookup trong `get_customer_info_url` | ❌ trả mock "Unknown caller" | 🟠 |

(Chi tiết phân tích các điểm này đã trình bày ở câu hỏi trước.)

---

## Tham chiếu chéo file

```
server/
├── routes/
│   ├── auth.ts        ← POST /api/token  (issue Web SDK JWT)
│   ├── admin.ts       ← /admin/* (proxy REST OUT to api.stringee.com)
│   └── webhooks.ts    ← Project & Number answer_url + event_url
├── services/
│   ├── tokenService.ts    ← JWT generation
│   ├── stringeeProxy.ts   ← fetch() to api.stringee.com
│   └── presenceService.ts ← in-memory user busy state
└── types/
    ├── stringee.ts   ← all Call API domain types
    └── api.ts        ← ProxyResult / StringeeEndpoint

pcc-server/
├── routes/
│   ├── auth.ts        ← POST /api/token (with icc_api:true)
│   ├── admin.ts       ← /admin/pcc-token (debug) + /admin/pcc/events/recent
│   ├── pcc.ts         ← /admin/pcc/* (proxy CRUD to icc-api.stringee.com)
│   └── webhooks.ts    ← get_customer_info / event_url / callout_answer_url
├── services/
│   ├── tokenService.ts        ← JWT generation
│   ├── stringeeApi.ts         ← per-resource StringeeResource instances
│   ├── stringeeClient.ts      ← fetch() to icc-api.stringee.com
│   ├── stringeeResource.ts    ← generic CRUD wrapper
│   └── eventLog.ts            ← in-memory ring buffer for live events
└── types/
    └── *.ts          ← per-domain (agent, queue, group, ivr*, ...)
```
