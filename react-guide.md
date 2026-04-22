# React từ A đến Z: Cách hoạt động, vòng đời và cách tổ chức module

> Bài viết này dành cho developer đã biết JavaScript/TypeScript cơ bản, muốn hiểu React một cách có hệ thống — từ cách nó hoạt động bên trong, đến vòng đời component, và cách chia code thành các module có thể tái sử dụng và kết nối với nhau.

---

## Phần 1: React hoạt động như thế nào?

### 1.1. Ý tưởng cốt lõi: UI là một hàm của State

Trước React, để cập nhật giao diện web, chúng ta phải thao tác DOM trực tiếp: `document.getElementById(...)`, `element.innerHTML = ...`, `element.style.color = ...`. Cách này sinh ra code rối rắm khi UI phức tạp.

React đưa ra một triết lý khác:

```
UI = f(state)
```

Bạn mô tả UI sẽ trông như thế nào **với một state cho trước**, và React chịu trách nhiệm cập nhật DOM thực tế để khớp với mô tả đó. Khi state thay đổi, bạn không cần chỉnh DOM tay — chỉ cần khai báo UI mới, React sẽ tự tính toán và áp dụng thay đổi.

### 1.2. Virtual DOM và Reconciliation

Khi component render, React không tạo DOM thật ngay lập tức. Thay vào đó, nó tạo một **Virtual DOM** — một object JavaScript mô tả cây UI. Khi state đổi:

1. React render lại component → tạo cây Virtual DOM mới
2. So sánh (diff) với cây Virtual DOM cũ → tìm ra những chỗ khác biệt
3. Chỉ cập nhật **phần DOM thật sự thay đổi**, không phải toàn bộ cây

Quá trình này gọi là **Reconciliation**. Đây là lý do React nhanh: thao tác trên JS object nhanh hơn nhiều so với thao tác DOM thật, và chỉ phần cần đổi mới bị đụng vào.

### 1.3. Component — đơn vị cơ bản

Component là một function trả về JSX (mô tả UI). Đây là ví dụ tối giản:

```tsx
function Greeting({ name }: { name: string }) {
  return <h1>Xin chào, {name}!</h1>;
}
```

Component có thể lồng nhau, tạo thành cây:

```tsx
function App() {
  return (
    <div>
      <Header />
      <Main>
        <Article />
        <Sidebar />
      </Main>
      <Footer />
    </div>
  );
}
```

Mỗi component là một "mảnh" UI độc lập, có state riêng, logic riêng, có thể tái sử dụng nhiều nơi.

### 1.4. JSX — cú pháp mô tả UI

JSX nhìn giống HTML nhưng thực chất là syntactic sugar cho `React.createElement`:

```tsx
// Viết JSX
const el = <button className="btn" onClick={handleClick}>Click</button>;

// Biên dịch thành
const el = React.createElement('button', 
  { className: 'btn', onClick: handleClick }, 
  'Click'
);
```

JSX cho phép bạn nhúng biểu thức JS bằng `{...}`, nhận prop như HTML attribute, và viết UI declarative ngay trong JS.

### 1.5. State và Re-render

State là dữ liệu có thể thay đổi của component. Khi state đổi, component re-render.

```tsx
import { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <button onClick={() => setCount(count + 1)}>
      Đã click {count} lần
    </button>
  );
}
```

Khi user click button:
1. `setCount(count + 1)` được gọi → React đánh dấu component là "dirty"
2. React gọi lại function `Counter()` → tạo JSX mới với `count = 1`
3. Diff với JSX cũ → thấy text trong button đổi
4. Cập nhật đúng text node đó trong DOM thật

---

## Phần 2: Vòng đời Component

### 2.1. Ba giai đoạn của một component

Mỗi component trong React trải qua 3 giai đoạn:

| Giai đoạn | Mô tả | Xảy ra khi |
|---|---|---|
| **Mount** | Sinh ra lần đầu, xuất hiện trong DOM | Lần đầu component được render |
| **Update** (re-render) | Cập nhật lại với state/props mới | Mỗi khi state/props thay đổi |
| **Unmount** | Bị gỡ khỏi DOM | Khi không còn được render nữa |

Mỗi component có thể **update nhiều lần**, nhưng chỉ **mount 1 lần** và **unmount 1 lần** cho mỗi "phiên" tồn tại.

### 2.2. Khi nào component mount?

Component mount khi nó **xuất hiện lần đầu** trong cây UI. Các tình huống phổ biến:

- **App khởi động** → root component và toàn bộ cây con mount
- **Render có điều kiện** chuyển từ `false` sang `true`:
  ```tsx
  {showModal && <Modal />}  // Modal mount khi showModal = true
  ```
- **Điều hướng** vào route chứa component
- **Thêm item vào danh sách** qua `.map()`
- **`key` thay đổi** → React coi là component mới, unmount cái cũ và mount cái mới

### 2.3. Khi nào component unmount?

Ngược lại với mount:

- Điều kiện render chuyển về `false`
- Điều hướng rời khỏi route
- Item bị xóa khỏi danh sách
- Component cha unmount → toàn bộ con cũng unmount

### 2.4. `useEffect` — công cụ móc vào vòng đời

`useEffect` cho phép bạn chạy side effect (fetch API, subscribe event, set timer...) vào các thời điểm phù hợp trong vòng đời.

**Cú pháp đầy đủ:**

```tsx
useEffect(() => {
  // Effect body — chạy SAU render

  return () => {
    // Cleanup — chạy TRƯỚC effect lần sau hoặc khi unmount
  };
}, [dependencies]);
```

**Ba dạng khác nhau ở dependency array:**

```tsx
// Dạng 1: Không có deps → chạy sau MỌI render (hiếm khi dùng)
useEffect(() => { /* ... */ });

// Dạng 2: Deps rỗng → chạy ĐÚNG 1 LẦN khi mount, cleanup khi unmount
useEffect(() => { /* ... */ }, []);

// Dạng 3: Có deps → chạy khi deps thay đổi
useEffect(() => { /* ... */ }, [userId]);
```

### 2.5. Ví dụ toàn vẹn về vòng đời

```tsx
function UserProfile({ userId }: { userId: string }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    console.log(`Fetch user ${userId}`);
    let cancelled = false;

    fetch(`/api/users/${userId}`)
      .then(r => r.json())
      .then(data => {
        if (!cancelled) setUser(data);
      });

    return () => {
      console.log(`Cleanup user ${userId}`);
      cancelled = true; // tránh race condition
    };
  }, [userId]);

  return <div>{user?.name ?? 'Đang tải...'}</div>;
}
```

**Dòng thời gian:**

1. Component mount với `userId="u1"` → effect chạy → log `Fetch user u1`
2. Fetch xong → `setUser` → re-render (effect KHÔNG chạy lại vì `userId` không đổi)
3. Parent đổi `userId` từ `u1` → `u2`:
   - Cleanup chạy: log `Cleanup user u1`
   - Effect chạy lại: log `Fetch user u2`
4. Component unmount → cleanup cuối chạy: log `Cleanup user u2`

### 2.6. Tại sao Cleanup quan trọng?

Cleanup dọn dẹp những gì effect đã "để lại" trong thế giới bên ngoài:

| Effect làm gì | Cleanup làm gì |
|---|---|
| `addEventListener` | `removeEventListener` |
| `setInterval` / `setTimeout` | `clearInterval` / `clearTimeout` |
| `client.on('event', handler)` | `client.off('event', handler)` |
| `fetch` | Set flag `cancelled = true` hoặc `AbortController` |
| `socket.connect()` | `socket.disconnect()` |

Quên cleanup = memory leak, double-listener, race condition.

### 2.7. Mental model: đồng bộ hóa, không phải vòng đời

Đừng nghĩ `useEffect` theo kiểu "làm X khi mount, Y khi unmount". Nghĩ theo kiểu:

> **"Giữ world bên ngoài đồng bộ với giá trị của deps. Khi deps đổi, đồng bộ lại. Khi không cần đồng bộ nữa, dọn dẹp."**

Ví dụ: `useEffect(() => { document.title = name }, [name])` = "luôn giữ tiêu đề tab khớp với biến `name`".

---

## Phần 3: Hook — trái tim của React hiện đại

### 3.1. Hook là gì?

Hook là các function bắt đầu bằng `use` cho phép component "móc vào" các tính năng của React (state, lifecycle, context...). Một số hook cốt lõi:

| Hook | Chức năng |
|---|---|
| `useState` | Lưu state trong component |
| `useEffect` | Chạy side effect theo vòng đời |
| `useRef` | Lưu giá trị "sống lâu" không gây re-render |
| `useMemo` | Cache kết quả tính toán tốn kém |
| `useCallback` | Cache function reference để tránh re-render con |
| `useContext` | Đọc value từ Context |
| `useReducer` | Quản lý state phức tạp với reducer pattern |

### 3.2. Quy tắc Hook — phải tuân thủ tuyệt đối

1. **Chỉ gọi hook ở top level** của component hoặc custom hook. Không gọi trong if, for, try/catch, function lồng.
2. **Chỉ gọi hook từ React function component** hoặc custom hook. Không từ function JS thông thường.

Vi phạm → React không track được hook nào là hook nào → bug khó hiểu.

### 3.3. `useState` chi tiết

```tsx
const [value, setValue] = useState(initialValue);
```

- `value`: giá trị state hiện tại
- `setValue`: hàm cập nhật state, nhận giá trị mới hoặc function updater
- `initialValue`: giá trị khởi tạo, chỉ dùng ở lần mount đầu

**Hai cách cập nhật:**

```tsx
setCount(count + 1);            // truyền giá trị trực tiếp
setCount(prev => prev + 1);     // truyền function → an toàn khi batch
```

Dùng function updater khi state mới phụ thuộc state cũ, đặc biệt trong event handler xảy ra nhiều lần hoặc trong async code.

### 3.4. `useRef` chi tiết

`useRef` trả về một object `{ current: T }` giữ nguyên reference qua mọi re-render:

```tsx
const ref = useRef<HTMLInputElement>(null);

// Truy cập DOM element
<input ref={ref} />

// Sau mount, ref.current = DOM node thật
ref.current?.focus();
```

Hai use case chính:

**1. Giữ reference đến DOM element:**
```tsx
const inputRef = useRef<HTMLInputElement>(null);
useEffect(() => { inputRef.current?.focus(); }, []);
```

**2. Lưu "giá trị sống lâu" không cần trigger re-render:**
```tsx
const timerRef = useRef<number | null>(null);

const start = () => {
  timerRef.current = window.setInterval(() => console.log('tick'), 1000);
};
const stop = () => {
  if (timerRef.current) clearInterval(timerRef.current);
};
```

⚠️ **Đừng nhầm:** `useState` gây re-render khi đổi, `useRef` thì không.

### 3.5. Custom Hook — tái sử dụng logic stateful

Custom hook là function bắt đầu bằng `use` gọi các hook khác bên trong. Nó giúp đóng gói logic để dùng lại ở nhiều component.

```tsx
// hooks/useLocalStorage.ts
import { useState, useEffect } from 'react';

export function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : initial;
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue] as const;
}
```

```tsx
// Dùng ở mọi component
function Settings() {
  const [theme, setTheme] = useLocalStorage('theme', 'light');
  return <button onClick={() => setTheme('dark')}>Theme: {theme}</button>;
}
```

---

## Phần 4: Cách tổ chức Module

Khi app lớn lên, bạn không thể dồn tất cả vào một file. Việc chia thành các module có vai trò rõ ràng là kỹ năng then chốt để code dễ maintain.

### 4.1. Cấu trúc thư mục gợi ý

```
src/
├── components/          # UI component tái sử dụng
│   ├── Button.tsx
│   ├── Modal.tsx
│   └── IncomingCallModal.tsx
├── pages/               # Component cấp trang (route)
│   ├── HomePage.tsx
│   └── DashboardPage.tsx
├── hooks/               # Custom hook
│   ├── useLocalStorage.ts
│   └── useIncomingCall.ts
├── services/            # Kết nối với thế giới bên ngoài (API, SDK)
│   ├── apiClient.ts
│   └── stringeeClient.ts
├── stores/              # Global state
│   └── callStore.ts
├── utils/               # Hàm tiện ích thuần (không state)
│   ├── formatDate.ts
│   └── validateEmail.ts
├── types/               # TypeScript types/interfaces
│   └── index.ts
└── App.tsx              # Root component
```

### 4.2. Phân biệt các loại module theo vai trò

| Loại | Phần mở rộng | Có JSX? | Ví dụ | Vai trò |
|---|---|---|---|---|
| **Component** | `.tsx` | Có | `Button.tsx` | Render UI |
| **Custom Hook** | `.ts` (không JSX) hoặc `.tsx` | Không (thường) | `useIncomingCall.ts` | Đóng gói logic stateful |
| **Service** | `.ts` | Không | `stringeeClient.ts` | Giao tiếp với API/SDK/browser |
| **Store** | `.ts` | Không | `callStore.ts` | Quản lý global state |
| **Utility** | `.ts` | Không | `formatDate.ts` | Hàm thuần, không state |
| **Types** | `.ts` | Không | `types.ts` | Khai báo type |

Quy tắc: **Chỉ dùng `.tsx` khi file có chứa JSX**. File logic không UI nên dùng `.ts` thuần.

### 4.3. Anatomy của một Component module

Một component module chuẩn có cấu trúc:

```tsx
// components/UserCard.tsx

// 1. Import
import { useState } from 'react';
import { formatDate } from '../utils/formatDate';

// 2. Type definitions
export interface UserCardProps {
  name: string;
  email: string;
  joinedAt: Date;
  onMessage?: (name: string) => void;
}

// 3. Sub-component (nếu có, chỉ dùng nội bộ)
function Avatar({ name }: { name: string }) {
  return <div className="avatar">{name[0].toUpperCase()}</div>;
}

// 4. Main component export
export function UserCard({ name, email, joinedAt, onMessage }: UserCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className="user-card"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Avatar name={name} />
      <h3>{name}</h3>
      <p>{email}</p>
      <small>Tham gia: {formatDate(joinedAt)}</small>
      {isHovered && onMessage && (
        <button onClick={() => onMessage(name)}>Nhắn tin</button>
      )}
    </div>
  );
}
```

Nguyên tắc:
- **1 component chính / 1 file**, tên file khớp tên component
- Type/interface export cùng component để người khác import được
- Props rõ ràng với type
- Sub-component chỉ dùng nội bộ → không export

### 4.4. Anatomy của một Service module

Service là cầu nối giữa app React và thế giới bên ngoài (API, SDK, browser API):

```typescript
// services/apiClient.ts

const BASE_URL = import.meta.env.VITE_API_URL;

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export const api = {
  getUser: (id: string) => request<User>(`/users/${id}`),
  listUsers: () => request<User[]>('/users'),
  createUser: (data: Omit<User, 'id'>) => 
    request<User>('/users', { method: 'POST', body: JSON.stringify(data) }),
};
```

Service module **không chứa React code**. Nó có thể được import vào bất kỳ component, hook hay store nào.

### 4.5. Anatomy của một Store module (Zustand)

```typescript
// stores/authStore.ts
import { create } from 'zustand';
import { api } from '../services/apiClient';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;

  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoading: false,

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const { user, token } = await api.login(email, password);
      set({ user, token, isLoading: false });
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  logout: () => set({ user: null, token: null }),
}));
```

### 4.6. Anatomy của một Custom Hook module

```typescript
// hooks/useDebounce.ts
import { useEffect, useState } from 'react';

export function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
```

---

## Phần 5: Cách các module kết nối với nhau

Đây là phần khó nhất — đi từ module riêng lẻ đến một app vận hành mượt.

### 5.1. Các cách giao tiếp giữa module

| Tình huống | Giải pháp |
|---|---|
| Component A gọi function của service | `import` trực tiếp |
| Component A truyền data cho Component B (con) | **Props** |
| Component con báo sự kiện lên cha | **Callback props** |
| Nhiều component cần chung state | **Context** hoặc **Store** (Zustand, Redux) |
| Service bắn sự kiện bất đồng bộ cho UI | **Event bus** hoặc **Store** |
| Logic stateful dùng chung | **Custom hook** |

### 5.2. Flow 1: Component → Service (gọi API)

```tsx
// pages/UserListPage.tsx
import { useEffect, useState } from 'react';
import { api } from '../services/apiClient';
import { UserCard } from '../components/UserCard';

export function UserListPage() {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    api.listUsers().then(setUsers);
  }, []);

  return (
    <div>
      {users.map(u => (
        <UserCard key={u.id} name={u.name} email={u.email} joinedAt={u.joinedAt} />
      ))}
    </div>
  );
}
```

Component chỉ quan tâm "cần data" — không care API nằm ở đâu, nếu đổi backend chỉ cần sửa `apiClient.ts`.

### 5.3. Flow 2: Service → Store → UI (kết nối SDK với React)

Đây là pattern xử lý SDK bên ngoài (Stringee, Socket.io, Firebase...) — SDK bắn event, store lưu state, UI render theo store:

```typescript
// services/stringeeClient.ts
import { StringeeClient } from 'stringee-web-sdk';
import { useCallStore } from '../stores/callStore';

let client: StringeeClient | null = null;

export function initStringee(token: string): StringeeClient {
  if (client) return client;

  client = new StringeeClient();
  client.connect(token);

  // Khi SDK bắn event → update store → UI tự re-render
  client.on('incomingcall', (call) => {
    useCallStore.getState().setIncoming(call);
  });

  return client;
}

export function getStringeeClient() {
  if (!client) throw new Error('Stringee chưa init');
  return client;
}
```

```typescript
// stores/callStore.ts
import { create } from 'zustand';

interface CallState {
  status: 'idle' | 'ringing' | 'active';
  incomingCall: any | null;
  setIncoming: (call: any) => void;
  answer: () => void;
  reset: () => void;
}

export const useCallStore = create<CallState>((set, get) => ({
  status: 'idle',
  incomingCall: null,

  setIncoming: (call) => set({ status: 'ringing', incomingCall: call }),
  answer: () => {
    get().incomingCall?.answer(() => set({ status: 'active' }));
  },
  reset: () => set({ status: 'idle', incomingCall: null }),
}));
```

```tsx
// components/IncomingCallModal.tsx
import { useCallStore } from '../stores/callStore';

export function IncomingCallModal() {
  const { status, answer, reset } = useCallStore();

  if (status !== 'ringing') return null;

  return (
    <div className="modal">
      <h2>Cuộc gọi đến</h2>
      <button onClick={answer}>Trả lời</button>
      <button onClick={reset}>Từ chối</button>
    </div>
  );
}
```

```tsx
// App.tsx — kết nối tất cả
import { useEffect } from 'react';
import { initStringee } from './services/stringeeClient';
import { useAuthStore } from './stores/authStore';
import { IncomingCallModal } from './components/IncomingCallModal';

export default function App() {
  const token = useAuthStore(s => s.token);

  useEffect(() => {
    if (token) initStringee(token);
  }, [token]);

  return (
    <>
      <MainPages />
      <IncomingCallModal />
    </>
  );
}
```

**Dòng dữ liệu:**
1. SDK bắn event `incomingcall`
2. Service nhận event, gọi `useCallStore.getState().setIncoming(call)`
3. Store cập nhật state → Zustand notify mọi subscriber
4. `IncomingCallModal` đang subscribe → tự re-render với `status = 'ringing'`
5. UI hiển thị modal

### 5.4. Flow 3: Props drilling và khi nào cần Context/Store

Truyền prop qua 1-2 cấp thì ổn:

```tsx
<App>
  <Dashboard user={user}>
    <Header user={user} />
  </Dashboard>
</App>
```

Nhưng nếu phải truyền qua 5-6 cấp, hoặc nhiều component rải rác đều cần cùng data → đó là **props drilling**, nên chuyển sang Context hoặc Store.

**Context (built-in React):**

```tsx
// contexts/ThemeContext.tsx
import { createContext, useContext, useState, ReactNode } from 'react';

interface ThemeContextValue {
  theme: 'light' | 'dark';
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const toggle = () => setTheme(t => t === 'light' ? 'dark' : 'light');
  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme phải dùng trong ThemeProvider');
  return ctx;
}
```

```tsx
// Dùng ở bất kỳ component con
function Button() {
  const { theme, toggle } = useTheme();
  return <button onClick={toggle}>Theme: {theme}</button>;
}
```

### 5.5. Tổng hợp: architecture của một app

```
┌───────────────────────────────────────────────────┐
│                  UI Layer (JSX)                   │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────┐   │
│  │  Component  │  │  Component  │  │   Page   │   │
│  └──────┬──────┘  └──────┬──────┘  └────┬─────┘   │
│         │                │              │         │
│         ▼                ▼              ▼         │
│  ┌──────────────────────────────────────────┐     │
│  │          Custom Hook Layer               │     │
│  │    useIncomingCall, useDebounce, ...     │     │
│  └──────┬───────────────────────────────────┘     │
│         │                                         │
│         ▼                                         │
│  ┌──────────────────────────────────────────┐     │
│  │           Store Layer (Zustand)          │     │
│  │     authStore, callStore, cartStore      │     │
│  └──────┬───────────────────────────────────┘     │
│         │                                         │
│         ▼                                         │
│  ┌──────────────────────────────────────────┐     │
│  │          Service Layer (plain .ts)       │     │
│  │    apiClient, stringeeClient, socket     │     │
│  └──────┬───────────────────────────────────┘     │
└─────────┼─────────────────────────────────────────┘
          ▼
    External World
 (API server, SDK, browser API, localStorage...)
```

Nguyên tắc:
- **UI Layer** chỉ biết đến **Hook Layer** và **Store Layer**, không gọi thẳng Service
- **Hook Layer** gói logic state, có thể gọi Store hoặc Service
- **Store Layer** lưu state toàn cục, có thể gọi Service
- **Service Layer** là lớp giáp ranh duy nhất với thế giới ngoài

---

## Phần 6: Best Practices

### 6.1. Component

- **Mỗi component làm 1 việc** — nếu file quá dài (>200 dòng), tách nhỏ
- **Props type rõ ràng** — luôn khai báo interface
- **Đặt tên theo PascalCase** — `UserCard`, không `userCard`
- **Tách logic phức tạp ra custom hook** — giữ component tập trung vào UI

### 6.2. Hook

- **Luôn cleanup trong useEffect** khi có subscription
- **Đặt dependency array đầy đủ** — bật `react-hooks/exhaustive-deps` trong ESLint
- **Custom hook đặt tên bắt đầu bằng `use`** — để React nhận diện
- **Không gọi hook điều kiện** — đặt ở top level

### 6.3. State

- **Đừng lưu derived data trong state** — tính từ props hoặc state khác:
  ```tsx
  // ❌ 
  const [fullName, setFullName] = useState('');
  useEffect(() => setFullName(`${first} ${last}`), [first, last]);
  
  // ✅
  const fullName = `${first} ${last}`;
  ```
- **Lift state lên đúng cấp chung thấp nhất** cần truy cập
- **State local trước, global sau** — chỉ đưa vào store khi nhiều component cần

### 6.4. Performance

- Dùng `useMemo` / `useCallback` **chỉ khi cần thiết** (tính toán đắt, hoặc truyền xuống component đã `React.memo`)
- **`key` trong danh sách phải stable và unique** — không dùng `index` nếu danh sách thay đổi thứ tự
- **Tránh tạo object/array mới trong render** nếu truyền làm prop cho component con memoized

### 6.5. Kiến trúc

- **Một mối quan tâm, một module** — không trộn UI, logic, API call trong cùng file
- **Service là lớp duy nhất giao tiếp ngoài** — UI không gọi `fetch` trực tiếp
- **Types dùng chung để ở `types/`** — import nhiều nơi không bị lặp
- **Comment code phức tạp** — đặc biệt phần closure, async flow, side effect

---

## Kết

React không chỉ là "thư viện UI" — nó là một mô hình tư duy về cách ứng dụng được cấu trúc:

- **UI là hàm của state** → mô tả, không thao tác
- **Component là đơn vị đóng gói** → UI + logic + state
- **Hook là công cụ kết nối** component với các tính năng runtime của React
- **Module hóa theo vai trò** → UI, Hook, Store, Service — mỗi lớp có trách nhiệm rõ ràng

Khi đã nắm vững 4 ý trên, bạn sẽ thấy hầu hết bug và "tangled code" đều xuất phát từ việc **nhầm vai trò của từng module** — đưa logic gọi API vào component, đưa UI state vào store global, quên cleanup effect... Giữ kỷ luật chia tầng rõ ràng là cách nhanh nhất để code React của bạn sạch và scale được.

Bước tiếp theo sau bài này: tìm hiểu React Router (điều hướng), React Query (quản lý server state), và Suspense + lazy loading để tối ưu performance.
