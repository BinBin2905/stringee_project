# Cấu trúc thư mục React + TypeScript + Vite

## Tổng quan

```
stringee-client/
│
├── public/                         # File tĩnh — Vite copy nguyên vào build, không xử lý
│   ├── favicon.ico                 # Icon tab trình duyệt
│   ├── robots.txt                  # Hướng dẫn cho search engine crawler
│   └── assets/                     # Ảnh, font, file tĩnh không cần import trong code
│       └── logo.svg
│
├── src/                            # ★ Toàn bộ source code nằm ở đây
│   │
│   ├── main.tsx                    # Entry point — nơi React mount vào DOM
│   ├── App.tsx                     # Component gốc — routing, layout chính
│   ├── index.css                   # CSS gốc — import Tailwind, reset, font
│   ├── env.d.ts                    # Khai báo type cho import.meta.env
│   ├── vite-env.d.ts               # Type reference cho Vite (tự sinh)
│   │
│   ├── api/                        # ★ Giao tiếp với server
│   │   ├── axios.ts                # Axios instance: baseURL, interceptors, token handling
│   │   ├── stringee.ts             # API functions: getClientToken(), getRestToken()
│   │   └── types.ts                # Types cho API: request/response interfaces
│   │
│   ├── components/                 # ★ UI components tái sử dụng
│   │   ├── ui/                     # Components cơ bản (atoms)
│   │   │   ├── Button.tsx          # <Button variant="primary" loading={true} />
│   │   │   ├── Input.tsx           # <Input label="User ID" error="Required" />
│   │   │   ├── Toggle.tsx          # <Toggle checked={record} onChange={...} />
│   │   │   ├── Badge.tsx           # <Badge>CONNECTED</Badge>
│   │   │   └── index.ts            # Barrel export: export * from './Button'
│   │   │
│   │   ├── icons/                  # SVG icon components
│   │   │   ├── IconKey.tsx
│   │   │   ├── IconPhone.tsx
│   │   │   ├── IconMic.tsx
│   │   │   └── index.ts
│   │   │
│   │   └── shared/                 # Components dùng chung nhiều trang
│   │       ├── Header.tsx          # Header cố định trên mọi trang
│   │       ├── ErrorMessage.tsx    # Hiển thị lỗi dạng chuẩn
│   │       └── LoadingSpinner.tsx
│   │
│   ├── features/                   # ★ Nhóm theo tính năng (feature-based)
│   │   │
│   │   ├── auth/                   # Tính năng: Xác thực & Token
│   │   │   ├── AuthPanel.tsx       # UI nhập userId, lấy token, hiển thị token
│   │   │   ├── TokenDisplay.tsx    # Hiển thị token info: issuer, expiry, copy
│   │   │   ├── useAuth.ts         # Hook: fetchToken, clearToken, token state
│   │   │   └── auth.types.ts      # Types: TokenPayload, SavedToken
│   │   │
│   │   ├── call/                   # Tính năng: Gọi điện
│   │   │   ├── CallPanel.tsx       # UI gọi điện: nhập số, nút call
│   │   │   ├── SCCOPreview.tsx     # Hiển thị SCCO sẽ gửi
│   │   │   ├── useCall.ts         # Hook: makeCall, callState
│   │   │   └── call.types.ts      # Types: ISCCO, IActionConnect...
│   │   │
│   │   └── recording/             # Tính năng: Ghi âm
│   │       ├── RecordingPanel.tsx  # UI toggle ghi âm, chọn format
│   │       ├── useRecording.ts    # Hook: record state, format, stereo
│   │       └── recording.types.ts # Types: MediaFormat, RecordingOptions
│   │
│   ├── hooks/                      # ★ Custom hooks dùng chung
│   │   ├── useDebounce.ts          # Delay state update
│   │   ├── useLocalStorage.ts      # useState sync với localStorage
│   │   └── useOnline.ts            # Theo dõi trạng thái mạng
│   │
│   ├── utils/                      # ★ Hàm tiện ích thuần (không liên quan React)
│   │   ├── token.ts                # decodeToken(), isTokenExpired(), formatTime()
│   │   ├── storage.ts              # localStorage wrapper: get/set/remove
│   │   └── cn.ts                   # classNames helper cho Tailwind
│   │
│   ├── types/                      # ★ Types dùng chung toàn project
│   │   ├── stringee.ts             # Stringee-specific: IEndpoint, ISCCO, MediaFormat
│   │   └── common.ts               # Chung: ApiResponse<T>, Nullable<T>
│   │
│   ├── constants/                  # ★ Hằng số
│   │   ├── stringee.ts             # STRINGEE_VOICES, DEFAULT_TIMEOUT, SCCO defaults
│   │   └── app.ts                  # APP_NAME, STORAGE_KEYS
│   │
│   ├── pages/                      # ★ Components cấp trang (nếu có routing)
│   │   ├── HomePage.tsx            # Trang chính — ghép AuthPanel + CallPanel
│   │   ├── SettingsPage.tsx        # Trang cấu hình server URL, preferences
│   │   └── NotFoundPage.tsx        # Trang 404
│   │
│   └── layouts/                    # ★ Layout wrapper
│       └── MainLayout.tsx          # Header + main content + footer
│
├── .env                            # Biến môi trường — KHÔNG push lên git
├── .env.example                    # Mẫu .env cho team — CÓ push lên git
├── .gitignore                      # Ignore: node_modules, dist, .env
├── index.html                      # HTML gốc — Vite inject script vào đây
├── package.json                    # Dependencies + scripts
├── tsconfig.json                   # Cấu hình TypeScript
├── tsconfig.node.json              # TS config riêng cho vite.config.ts
├── vite.config.ts                  # Cấu hình Vite: plugins, proxy, alias
├── tailwind.config.ts              # Cấu hình Tailwind (v3) hoặc không cần (v4)
├── postcss.config.js               # PostCSS config (v3) hoặc không cần (v4)
└── README.md                       # Hướng dẫn setup + chạy project
```

---

## Giải thích nguyên tắc tổ chức

### 1. Feature-based structure

Nhóm code theo **tính năng**, không theo loại file:

```
# ❌ Nhóm theo loại file — khó tìm khi project lớn
components/
  AuthPanel.tsx
  CallPanel.tsx
  RecordingPanel.tsx
hooks/
  useAuth.ts
  useCall.ts
  useRecording.ts
types/
  auth.types.ts
  call.types.ts
  recording.types.ts

# ✅ Nhóm theo tính năng — mở 1 folder là đủ context
features/
  auth/
    AuthPanel.tsx
    useAuth.ts
    auth.types.ts
  call/
    CallPanel.tsx
    useCall.ts
    call.types.ts
```

### 2. Barrel exports

Dùng `index.ts` để gom export, giúp import gọn hơn:

```typescript
// src/components/ui/index.ts
export { Button } from "./Button";
export { Input } from "./Input";
export { Toggle } from "./Toggle";

// Khi import — gọn 1 dòng thay vì 3 dòng
import { Button, Input, Toggle } from "@/components/ui";
```

### 3. Path alias

Cấu hình `@` alias trong `vite.config.ts` + `tsconfig.json` để tránh `../../../`:

```typescript
// vite.config.ts
import { resolve } from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
});
```

```json
// tsconfig.json → compilerOptions
{
  "baseUrl": ".",
  "paths": {
    "@/*": ["src/*"]
  }
}
```

```typescript
// Trước
import { useAuth } from "../../../features/auth/useAuth";

// Sau
import { useAuth } from "@/features/auth/useAuth";
```

---

## Luồng dữ liệu

```
main.tsx
  └── App.tsx
        └── MainLayout.tsx
              └── HomePage.tsx
                    ├── AuthPanel.tsx
                    │     ├── useAuth.ts → api/stringee.ts → axios.ts → Server
                    │     └── TokenDisplay.tsx
                    │
                    ├── RecordingPanel.tsx
                    │     └── useRecording.ts → utils/storage.ts → localStorage
                    │
                    └── CallPanel.tsx
                          ├── useCall.ts → Stringee SDK
                          └── SCCOPreview.tsx
```

---

## Quy tắc đặt tên

| Loại | Convention | Ví dụ |
|------|-----------|-------|
| Component | PascalCase | `AuthPanel.tsx`, `TokenDisplay.tsx` |
| Hook | camelCase, prefix `use` | `useAuth.ts`, `useDebounce.ts` |
| Utility | camelCase | `token.ts`, `storage.ts` |
| Type file | camelCase + `.types.ts` | `auth.types.ts`, `call.types.ts` |
| Constant | camelCase file, UPPER_SNAKE value | `stringee.ts` → `DEFAULT_TIMEOUT` |
| CSS Module | camelCase + `.module.css` | `AuthPanel.module.css` |
| Test | gắn `.test.ts` hoặc `.spec.ts` | `useAuth.test.ts` |

---

## File mẫu

### `src/main.tsx`

```tsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
```

### `src/App.tsx`

```tsx
import StringeeClient from "@/features/auth/AuthPanel";

function App() {
  return <StringeeClient />;
}

export default App;
```

### `src/env.d.ts`

```typescript
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_STRINGEE_SERVER_URL: string;
  readonly VITE_DEFAULT_USER_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
```

### `src/utils/cn.ts`

```typescript
// Nối classNames, bỏ qua giá trị falsy
export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

// Dùng trong component
// className={cn("px-4 py-2", isActive && "bg-black text-white", disabled && "opacity-50")}
```

### `src/hooks/useLocalStorage.ts`

```typescript
import { useState } from "react";

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setStoredValue = (newValue: T | ((prev: T) => T)) => {
    setValue((prev) => {
      const resolved = newValue instanceof Function ? newValue(prev) : newValue;
      localStorage.setItem(key, JSON.stringify(resolved));
      return resolved;
    });
  };

  const removeValue = () => {
    localStorage.removeItem(key);
    setValue(initialValue);
  };

  return [value, setStoredValue, removeValue] as const;
}
```

### `src/hooks/useDebounce.ts`

```typescript
import { useState, useEffect } from "react";

export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debounced, setDebounced] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
```

### `src/constants/stringee.ts`

```typescript
export const DEFAULT_TIMEOUT = 60;
export const DEFAULT_MAX_CONNECT_TIME = -1;
export const DEFAULT_RECORD_FORMAT = "mp3";

export const STRINGEE_VOICES = {
  female: "Nữ mặc định",
  male: "Nam mặc định",
  banmai: "Nữ — Ban Mai",
  hatieumai: "Nữ — Hà Tiểu Mai",
  ngoclam: "Nữ — Ngọc Lam",
  leminh: "Nữ — Lê Minh",
  myan: "Nữ — My An",
  lannhi: "Nữ — Lan Nhi",
  "sg_male_xuankien_vdts_48k-hsmm": "Nam — Sài Gòn",
  "sg_female_xuanhong_vdts_48k-hsmm": "Nữ — Sài Gòn",
  "hn_male_xuantin_vdts_48k-hsmm": "Nam — Hà Nội",
  "hn_female_thutrang_phrase_48k-hsmm": "Nữ — Hà Nội",
} as const;

export const STORAGE_KEYS = {
  TOKEN: "stringee_token",
  SETTINGS: "stringee_settings",
} as const;
```

---

## Khi nào dùng folder nào

| Đặt ở | Khi nào |
|--------|---------|
| `components/ui/` | Component nhỏ, tái sử dụng, không chứa business logic |
| `components/shared/` | Component dùng chung nhiều trang nhưng lớn hơn ui |
| `features/xxx/` | Component + hook + type gắn với 1 tính năng cụ thể |
| `hooks/` | Custom hook dùng chung, không gắn tính năng nào |
| `utils/` | Hàm thuần, không liên quan React, có thể test độc lập |
| `types/` | Type dùng chung ≥ 2 features |
| `constants/` | Giá trị cố định, magic number, config mặc định |
| `api/` | Axios instance, API functions, request/response types |
| `pages/` | Component cấp trang, chỉ ghép các feature lại |
| `layouts/` | Bố cục trang: header, sidebar, footer wrapper |

---

## Checklist project mới

- [ ] Khởi tạo: `npm create vite@latest -- --template react-ts`
- [ ] Cài Tailwind: `npm install tailwindcss @tailwindcss/vite`
- [ ] Cấu hình path alias `@` trong `vite.config.ts` + `tsconfig.json`
- [ ] Tạo `.env` + `.env.example`
- [ ] Tạo `src/env.d.ts` khai báo type cho env
- [ ] Tạo cấu trúc thư mục theo feature
- [ ] Tạo barrel exports (`index.ts`) cho `components/ui/` và `components/icons/`
- [ ] Cài thêm nếu cần: `axios`, `react-router-dom`, `zustand`/`jotai`
