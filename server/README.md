# stringee-backend

Backend Fastify + TypeScript cho Stringee Web integration. Phase 1: JWT token service + auth endpoint.

## Yêu cầu

- Node.js >= 18.17
- npm

## Cài đặt

```bash
npm install
cp .env.example .env
# Điền STRINGEE_API_KEY_SID và STRINGEE_API_KEY_SECRET từ Dashboard Stringee
```

## Chạy dev

```bash
npm run dev
```

Server chạy tại `http://localhost:3000` (hoặc `PORT` trong `.env`). Watch mode — tự reload khi đổi code.

## Kiểm tra

### Cách 1: Test script offline (không cần server chạy)

```bash
npm run test:token     # in ra 2 token mẫu + decoded payload
npm run test:routes    # Phase 1 — 20 assertion (auth + token basic)
npm run test:module1   # Module 1 — 53 assertion (fault catalog + inspector + cheatsheet)
npm run test:all       # chạy cả 2 suite
```

### Cách 2: Test endpoint với curl

```bash
curl -X POST http://localhost:3000/api/auth/token \
  -H "Content-Type: application/json" \
  -d '{"userId":"agent_001"}'
```

Response:

```json
{
  "token": "eyJ0eXAiOiJKV1QiLCJhbGciOi...",
  "expiresAt": 1713360000,
  "userId": "agent_001"
}
```

### Cách 3: Verify token với jwt.io

Paste `token` từ response vào https://jwt.io và kiểm tra header + payload đúng chuẩn Stringee.

## Endpoint hiện có

### Phase 1 — Auth cơ bản

| Method | Path | Mục đích |
|---|---|---|
| GET | `/health` | Healthcheck |
| POST | `/api/auth/token` | Sinh client token cho SDK |

Request body `/api/auth/token`:

```json
{
  "userId": "agent_001",
  "ttlSeconds": 3600
}
```

### Module 1 — JWT lab (fault injection + inspector)

| Method | Path | Mục đích |
|---|---|---|
| GET | `/api/auth/faults` | Liệt kê 12 fault mode với description + fix hint |
| POST | `/api/auth/token/broken` | Sinh token cố ý lỗi theo `fault` ID |
| POST | `/api/debug/decode-jwt` | Inspect bất kỳ JWT nào, trả findings theo severity |
| GET | `/api/debug/cheatsheet/auth` | Bảng lỗi JWT/Auth thường gặp (symptom/cause/fix) |
| GET | `/api/debug/cheatsheet` | Liệt kê các topic cheatsheet có sẵn |

Request body `/api/auth/token/broken`:

```json
{
  "kind": "client",
  "fault": "no-cty",
  "userId": "agent_001"
}
```

Response trả `token` cùng `expectedError` và `fixHint`. Các `fault` hỗ trợ: `no-cty`, `wrong-cty-version`, `wrong-typ`, `claim-rs256`, `expired`, `no-exp`, `wrong-secret`, `wrong-iss`, `no-jti`, `missing-userId` (client), `missing-rest-flag` (rest), `both-flags`.

Request body `/api/debug/decode-jwt`:

```json
{
  "token": "eyJ...",
  "expectedKind": "client",
  "expectedApiKeySid": "SKxxx",
  "verifyWithSecret": "optional_secret_to_check_signature"
}
```

Response gồm `decoded` (header + payload), `findings[]` (mỗi finding có `severity`, `code`, `message`), `summary` (đếm error/warning/info), và `likelyKind` (client/rest/unknown).

### Luồng học Module 1

```bash
# 1. Xem danh sách fault
curl http://localhost:3000/api/auth/faults | jq

# 2. Sinh token lỗi — ví dụ thiếu cty
curl -X POST http://localhost:3000/api/auth/token/broken \
  -H "Content-Type: application/json" \
  -d '{"kind":"client","fault":"no-cty","userId":"agent_001"}' | jq

# 3. Lấy token đó, decode xem findings
curl -X POST http://localhost:3000/api/debug/decode-jwt \
  -H "Content-Type: application/json" \
  -d '{"token":"<token-từ-bước-2>","expectedKind":"client"}' | jq

# 4. Đem token lỗi dùng với Stringee SDK thật → quan sát error thực tế

# 5. Đọc cheatsheet
curl http://localhost:3000/api/debug/cheatsheet/auth | jq
```

## Cấu trúc thư mục

```
src/
├── server.ts                      Fastify bootstrap
├── config/env.ts                  Zod-validated env
├── services/
│   ├── token.service.ts           signClientToken, signRestApiToken, signWithFault
│   └── jwt-inspector.service.ts   Inspect JWT bất kỳ, trả findings
├── routes/
│   ├── auth.routes.ts             POST /api/auth/token
│   ├── auth-faults.routes.ts      GET /faults, POST /token/broken
│   └── debug.routes.ts            POST /decode-jwt, GET /cheatsheet
├── faults/
│   └── jwt-faults.ts              Catalog 12 fault mode
├── data/
│   └── auth-cheatsheet.ts         Bảng lỗi JWT/Auth thường gặp
├── utils/
│   └── manual-jwt.ts              Manual JWT builder (cho fault exotic)
└── types/
    ├── stringee.types.ts          JWT payload types
    └── fastify.d.ts               Module augmentation

scripts/
├── test-token.ts                  In JWT mẫu để mắt thường verify
├── test-routes.ts                 Phase 1 — 20 assertion
└── test-module1.ts                Module 1 — 53 assertion
```

## Roadmap các module tiếp

- [x] **Phase 1** — Auth cơ bản: TokenService + POST /api/auth/token
- [x] **Module 1** — JWT & Auth lab: fault catalog + inspector + cheatsheet
- [ ] **Module 5** — Events & Webhook: ring buffer log, SSE push về FE
- [ ] **Module 2** — Outgoing Call (UC1+UC2): answer_url webhook với fault injection
- [ ] **Module 3** — Incoming Call (UC3): Number answer_url, agent routing
- [ ] **Module 4** — Outbound Campaign (UC4): callout wrapper, fault kitchen
- [ ] **Module 6** — Live Chat + Chat SDK: kênh support production

## Environment variables

| Tên | Bắt buộc | Default | Ghi chú |
|---|---|---|---|
| `PORT` | Không | 3000 | |
| `LOG_LEVEL` | Không | info | trace/debug/info/warn/error/fatal |
| `CORS_ORIGIN` | Không | http://localhost:5173 | Comma-separated nếu nhiều |
| `STRINGEE_API_KEY_SID` | **Có** | — | Phải bắt đầu bằng `SK` |
| `STRINGEE_API_KEY_SECRET` | **Có** | — | Giữ bí mật, không commit |
| `TOKEN_TTL_SECONDS` | Không | 3600 | Thời hạn client token |
| `REST_TOKEN_TTL_SECONDS` | Không | 300 | Thời hạn REST API token (ngắn vì ephemeral) |
