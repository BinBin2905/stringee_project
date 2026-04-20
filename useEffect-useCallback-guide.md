# useEffect & useCallback — Giải thích chi tiết

## Phần 1: useEffect

### 1.1 useEffect là gì

`useEffect` là hook cho phép chạy code **sau khi React render xong UI**. Dùng cho những việc nằm ngoài việc hiển thị giao diện — gọi là **side effects**.

```
Component function chạy
  → React tính UI mới
  → React cập nhật DOM
  → Trình duyệt vẽ lên màn hình
  → useEffect chạy ← SAU TẤT CẢ bước trên
```

### 1.2 Tại sao cần useEffect

React component là **function thuần** — nhận props/state, trả về UI. Nhưng app thực tế cần làm nhiều thứ ngoài UI:

```
Gọi API                    → fetch data từ server
Đọc localStorage           → khôi phục trạng thái
Lắng nghe sự kiện          → resize, scroll, online/offline
Đặt timer                  → setTimeout, setInterval
Thao tác DOM trực tiếp     → focus input, scroll to top
Kết nối WebSocket          → real-time data
```

Những thứ này **không được** đặt trực tiếp trong function body:

```typescript
// ❌ SAI — chạy MỖI LẦN render, gây loop vô hạn
const App = () => {
  const [data, setData] = useState(null);

  // fetch → setData → re-render → fetch → setData → re-render → ...
  fetch("/api/data").then(res => res.json()).then(setData);

  return <div>{data}</div>;
};

// ✅ ĐÚNG — chạy sau render, kiểm soát được khi nào chạy lại
const App = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch("/api/data").then(res => res.json()).then(setData);
  }, []); // [] → chạy 1 lần

  return <div>{data}</div>;
};
```

### 1.3 Cấu trúc

```typescript
useEffect(
  () => {
    // ── EFFECT ──
    // Code chạy SAU khi render
    // Gọi API, đặt listener, timer...

    return () => {
      // ── CLEANUP ──
      // Chạy TRƯỚC khi effect chạy lại
      // hoặc khi component unmount
      // Gỡ listener, xóa timer, hủy request...
    };
  },
  [dependencies] // Quyết định KHI NÀO chạy lại
);
```

3 phần: **Effect** (làm gì), **Cleanup** (dọn dẹp gì), **Dependencies** (khi nào chạy lại).

### 1.4 Dependency Array — 3 kiểu

#### Kiểu 1: Không truyền array → chạy sau MỌI lần render

```typescript
useEffect(() => {
  console.log("Chạy sau mỗi render");
});
// Component render → effect → state đổi → render → effect → ...
// ⚠️ Gần như không bao giờ dùng — dễ gây performance issue
```

#### Kiểu 2: Array rỗng `[]` → chạy 1 lần khi mount

```typescript
useEffect(() => {
  console.log("Chạy 1 lần duy nhất khi component xuất hiện");

  // Ví dụ: load token đã lưu
  const saved = localStorage.getItem("token");
  if (saved) setToken(saved);
}, []);
```

Timeline:

```
Mount → Render lần 1 → Effect chạy ✅
State đổi → Render lần 2 → Effect KHÔNG chạy
State đổi → Render lần 3 → Effect KHÔNG chạy
Unmount → Cleanup chạy (nếu có)
```

#### Kiểu 3: Có dependencies → chạy lại khi dependency thay đổi

```typescript
useEffect(() => {
  console.log("userId đổi thành:", userId);
  // Ví dụ: fetch profile mới khi userId đổi
  fetchProfile(userId);
}, [userId]);
```

Timeline:

```
Mount → Render lần 1 (userId = "a") → Effect chạy ✅
userId đổi → Render lần 2 (userId = "b") → Effect chạy ✅ (dependency đổi)
Render lần 3 (userId = "b") → Effect KHÔNG chạy (dependency giữ nguyên)
userId đổi → Render lần 4 (userId = "c") → Cleanup → Effect chạy ✅
```

React so sánh bằng `Object.is()`:

```typescript
// Primitive → so sánh giá trị
"abc" === "abc"  // true → KHÔNG chạy lại
"abc" === "xyz"  // false → CHẠY lại

// Object/Array → so sánh REFERENCE
{a: 1} === {a: 1}  // false → LUÔN chạy lại (reference khác nhau mỗi render)
```

### 1.5 Cleanup — Dọn dẹp

#### Tại sao cần cleanup

```typescript
// ❌ Không cleanup → memory leak
useEffect(() => {
  // Mỗi lần effect chạy → thêm 1 listener
  // Không gỡ → listener cũ vẫn còn → chồng chất
  window.addEventListener("resize", handleResize);
}, []);

// ✅ Có cleanup → sạch sẽ
useEffect(() => {
  window.addEventListener("resize", handleResize);
  return () => window.removeEventListener("resize", handleResize);
  //       ↑ cleanup: gỡ listener cũ trước khi thêm mới
}, []);
```

#### Cleanup chạy khi nào

```
1. Trước khi effect chạy lại (dependency đổi)
   → Dọn effect cũ trước khi chạy effect mới

2. Khi component unmount (biến mất khỏi màn hình)
   → Dọn dẹp mọi thứ
```

```typescript
useEffect(() => {
  console.log("Effect: subscribe", userId);
  const ws = new WebSocket(`/ws/${userId}`);

  return () => {
    console.log("Cleanup: unsubscribe", userId);
    ws.close(); // Đóng connection cũ
  };
}, [userId]);

// userId = "a" → Effect: subscribe a
// userId = "b" → Cleanup: unsubscribe a → Effect: subscribe b
// userId = "c" → Cleanup: unsubscribe b → Effect: subscribe c
// Unmount      → Cleanup: unsubscribe c
```

### 1.6 Các use case thực tế

#### Gọi API khi mount

```typescript
useEffect(() => {
  const controller = new AbortController(); // Tạo controller để hủy request

  async function loadData() {
    try {
      const res = await fetch("/api/data", { signal: controller.signal });
      const json = await res.json();
      setData(json);
    } catch (err) {
      if (err.name !== "AbortError") setError(err.message);
    }
  }

  loadData();

  return () => controller.abort(); // Hủy request nếu unmount trước khi hoàn tất
}, []);
```

#### Lắng nghe sự kiện

```typescript
useEffect(() => {
  const handleOnline = () => setIsOnline(true);
  const handleOffline = () => setIsOnline(false);

  window.addEventListener("online", handleOnline);
  window.addEventListener("offline", handleOffline);

  return () => {
    window.removeEventListener("online", handleOnline);
    window.removeEventListener("offline", handleOffline);
  };
}, []);
```

#### Đặt interval

```typescript
useEffect(() => {
  const interval = setInterval(() => {
    setSeconds(s => s + 1);
  }, 1000);

  return () => clearInterval(interval); // Xóa timer khi unmount
}, []);
```

#### Sync state với localStorage

```typescript
useEffect(() => {
  localStorage.setItem("settings", JSON.stringify(settings));
}, [settings]); // Mỗi khi settings đổi → lưu lại
```

#### Auto-refresh token

```typescript
useEffect(() => {
  if (!tokenInfo?.exp) return;

  const expiresIn = tokenInfo.exp * 1000 - Date.now();
  const refreshBefore = 5 * 60 * 1000; // 5 phút trước khi hết hạn

  if (expiresIn <= refreshBefore) return; // Đã quá hạn refresh

  const timer = setTimeout(async () => {
    const newToken = await getClientToken(userId);
    setToken(newToken);
  }, expiresIn - refreshBefore);

  return () => clearTimeout(timer);
}, [tokenInfo, userId]);
```

### 1.7 Lỗi thường gặp

#### Dependency thiếu → dùng giá trị cũ (stale closure)

```typescript
// ❌ userId luôn là giá trị lúc mount, không cập nhật
useEffect(() => {
  const timer = setInterval(() => {
    console.log(userId); // Luôn là "" (giá trị ban đầu)
  }, 1000);
  return () => clearInterval(timer);
}, []); // Thiếu userId trong dependency

// ✅ userId cập nhật mỗi khi đổi
useEffect(() => {
  const timer = setInterval(() => {
    console.log(userId); // Giá trị mới nhất
  }, 1000);
  return () => clearInterval(timer);
}, [userId]); // Có userId → tạo lại interval khi userId đổi
```

#### Object trong dependency → chạy vô hạn

```typescript
// ❌ Object mới mỗi render → dependency luôn "thay đổi" → loop
useEffect(() => {
  fetchData(options);
}, [{ page: 1, limit: 10 }]); // Mới mỗi render!

// ✅ Dùng giá trị primitive
const [page, setPage] = useState(1);
const [limit, setLimit] = useState(10);
useEffect(() => {
  fetchData({ page, limit });
}, [page, limit]); // Primitive → so sánh giá trị

// ✅ Hoặc useMemo
const options = useMemo(() => ({ page: 1, limit: 10 }), []);
useEffect(() => {
  fetchData(options);
}, [options]); // Reference ổn định nhờ useMemo
```

#### setState gây loop

```typescript
// ❌ fetch → setData → render → effect chạy lại → fetch → ...
useEffect(() => {
  fetch("/api").then(res => res.json()).then(setData);
}); // Thiếu dependency array!

// ✅ Chạy 1 lần
useEffect(() => {
  fetch("/api").then(res => res.json()).then(setData);
}, []);
```

---

## Phần 2: useCallback

### 2.1 useCallback là gì

`useCallback` **ghi nhớ (memoize) function**, chỉ tạo function mới khi dependencies thay đổi.

```typescript
const fn = useCallback(() => {
  // logic
}, [dependencies]);
```

### 2.2 Tại sao cần useCallback

Trong React, **function được tạo mới mỗi lần render**:

```typescript
const App = () => {
  // Mỗi lần render → handleClick là function MỚI (reference khác)
  const handleClick = () => {
    console.log("clicked");
  };
  // Render 1: handleClick = function#1
  // Render 2: handleClick = function#2 (khác reference)
  // Render 3: handleClick = function#3 (khác reference)

  return <Button onClick={handleClick} />;
};
```

Điều này gây 2 vấn đề:

```
1. Component con nhận props mới (reference khác) → re-render thừa
2. Function nằm trong useEffect dependency → effect chạy lại thừa
```

### 2.3 Cách hoạt động

```typescript
// Không có useCallback
const fetchToken = async () => { ... };
// Render 1: fetchToken = function#1
// Render 2: fetchToken = function#2 ← mới
// Render 3: fetchToken = function#3 ← mới

// Có useCallback
const fetchToken = useCallback(async () => { ... }, [userId]);
// Render 1: fetchToken = function#1
// Render 2: fetchToken = function#1 ← giữ nguyên (userId chưa đổi)
// Render 3: fetchToken = function#1 ← giữ nguyên
// userId đổi:
// Render 4: fetchToken = function#4 ← mới (userId đổi)
// Render 5: fetchToken = function#4 ← giữ nguyên
```

### 2.4 Khi nào CẦN useCallback

#### Trường hợp 1: Function truyền vào component con dùng React.memo

```typescript
// Component con được memo — chỉ re-render khi props thay đổi
const ExpensiveList = React.memo(({ onItemClick }: { onItemClick: () => void }) => {
  console.log("ExpensiveList render"); // Log mỗi lần render
  return <div>...</div>;
});

// Component cha
const Parent = () => {
  const [count, setCount] = useState(0);

  // ❌ Không useCallback
  // count đổi → Parent render → tạo handleClick mới → ExpensiveList render thừa
  const handleClick = () => console.log("click");

  // ✅ Có useCallback
  // count đổi → Parent render → handleClick giữ nguyên → ExpensiveList KHÔNG render
  const handleClick = useCallback(() => console.log("click"), []);

  return (
    <>
      <button onClick={() => setCount(c + 1)}>Count: {count}</button>
      <ExpensiveList onItemClick={handleClick} />
    </>
  );
};
```

#### Trường hợp 2: Function nằm trong dependency của useEffect

```typescript
// ❌ Không useCallback → effect chạy mỗi render
const fetchData = () => {
  fetch(`/api/${userId}`);
};

useEffect(() => {
  fetchData();
}, [fetchData]); // fetchData mới mỗi render → effect chạy mỗi render

// ✅ Có useCallback → effect chỉ chạy khi userId đổi
const fetchData = useCallback(() => {
  fetch(`/api/${userId}`);
}, [userId]); // Chỉ tạo mới khi userId đổi

useEffect(() => {
  fetchData();
}, [fetchData]); // fetchData ổn định → effect ổn định
```

#### Trường hợp 3: Function là dependency của useCallback/useMemo khác

```typescript
const formatResult = useCallback((data: Data) => {
  return data.items.map(item => item.name);
}, []);

const processedData = useMemo(() => {
  if (!rawData) return [];
  return formatResult(rawData);
}, [rawData, formatResult]); // formatResult ổn định nhờ useCallback
```

### 2.5 Khi nào KHÔNG CẦN useCallback

```typescript
// ❌ Thừa — inline handler đơn giản, không truyền vào component con
const App = () => {
  const [count, setCount] = useState(0);

  // Không cần useCallback — function này chỉ dùng trong JSX tại chỗ
  return <button onClick={() => setCount(c => c + 1)}>+1</button>;
};

// ❌ Thừa — component con KHÔNG dùng React.memo
const Child = ({ onClick }) => <button onClick={onClick}>Click</button>;
// Child re-render khi Parent render dù có useCallback hay không
// vì Child không có React.memo

// ❌ Thừa — function không có dependency phức tạp
const handleSubmit = useCallback(() => {
  console.log("submit");
}, []); // Chi phí useCallback > lợi ích vì function quá đơn giản
```

### 2.6 Ví dụ thực tế đầy đủ

```typescript
const StringeeClient: FC = () => {
  const [userId, setUserId] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [record, setRecord] = useState(false);
  const [recordFormat, setRecordFormat] = useState<MediaFormat>("mp3");

  // ── useCallback: ghi nhớ function ──
  const fetchToken = useCallback(async (): Promise<void> => {
    const trimmed = userId.trim();
    if (!trimmed) {
      setError("Vui lòng nhập User ID");
      return;
    }

    setLoading(true);
    try {
      const token = await getClientToken(trimmed);
      setToken(token);
    } catch (err) {
      setError("Lỗi");
    } finally {
      setLoading(false);
    }
  }, [userId]); // Chỉ tạo function mới khi userId đổi

  const clearToken = useCallback((): void => {
    setToken(null);
    storage.remove();
  }, []); // Không dependency → function luôn giữ nguyên

  const copyToken = useCallback((): void => {
    if (token) navigator.clipboard.writeText(token);
  }, [token]); // Tạo mới khi token đổi

  // ── useEffect: side effects ──

  // Load token khi mở app
  useEffect(() => {
    const saved = storage.get();
    if (saved?.token) setToken(saved.token);
  }, []); // Chạy 1 lần khi mount

  // Lưu settings mỗi khi đổi
  useEffect(() => {
    storage.set({ record, recordFormat });
  }, [record, recordFormat]); // Chạy khi record hoặc format đổi

  // Auto-fetch khi userId đổi (debounced)
  const debouncedUserId = useDebounce(userId, 500);
  useEffect(() => {
    if (debouncedUserId) fetchToken();
  }, [debouncedUserId, fetchToken]);
  // fetchToken ổn định nhờ useCallback → effect không chạy thừa

  return (
    <>
      <input onChange={e => setUserId(e.target.value)} />
      <button onClick={fetchToken}>Lấy Token</button>
      <button onClick={clearToken}>Xóa</button>
      <button onClick={copyToken}>Copy</button>
      <TokenDisplay token={token} /> {/* Component con */}
    </>
  );
};
```

---

## Phần 3: So sánh useEffect vs useCallback

```
┌──────────────────────────────────────────────────────────────────┐
│                    useEffect              useCallback            │
├──────────────────────────────────────────────────────────────────┤
│ Mục đích          Chạy side effect       Ghi nhớ function       │
│                                                                  │
│ Chạy khi nào      SAU khi render         TRONG lúc render       │
│                                                                  │
│ Trả về gì         Cleanup function       Function đã memoize    │
│                                                                  │
│ Dùng cho           Gọi API               Tạo handler ổn định    │
│                    Đặt listener           Truyền vào component   │
│                    Timer                  con hoặc useEffect     │
│                    Đọc/ghi storage        dependency             │
│                                                                  │
│ Dependencies      Quyết định khi nào     Quyết định khi nào     │
│                   CHẠY LẠI effect        TẠO LẠI function       │
└──────────────────────────────────────────────────────────────────┘
```

### Cách chúng phối hợp

```typescript
// 1. useCallback giữ function ổn định
const fetchToken = useCallback(async () => {
  await getClientToken(userId);
}, [userId]);

// 2. useEffect dùng function ổn định đó
useEffect(() => {
  fetchToken(); // Không chạy thừa nhờ useCallback
}, [fetchToken]);

// Luồng:
// userId = "a" → useCallback tạo fetchToken#1
//              → useEffect thấy fetchToken#1 (mới) → chạy
// Re-render    → useCallback giữ fetchToken#1 (userId chưa đổi)
//              → useEffect thấy fetchToken#1 (cũ) → KHÔNG chạy
// userId = "b" → useCallback tạo fetchToken#2 (userId đổi)
//              → useEffect thấy fetchToken#2 (mới) → chạy
```

---

## Phần 4: Quy tắc chung

### useEffect

```
✅ Dùng khi: cần tương tác với thế giới bên ngoài React
   Gọi API, DOM, timer, storage, WebSocket, event listener

✅ Luôn có cleanup nếu: subscribe, addEventListener, setInterval, WebSocket

✅ [] cho: code chỉ chạy 1 lần (load data ban đầu, đọc storage)

✅ [dep] cho: code chạy lại khi dep thay đổi (fetch lại khi filter đổi)

❌ Không đặt logic thuần vào useEffect:
   Tính toán từ state/props → dùng useMemo
   Format data để hiển thị → tính trực tiếp trong render
```

### useCallback

```
✅ Dùng khi: function truyền vào React.memo component
✅ Dùng khi: function nằm trong useEffect dependency
✅ Dùng khi: function là dependency của hook khác

❌ Không cần cho: inline onClick đơn giản
❌ Không cần cho: function không truyền đi đâu
❌ Không cần cho: component con không dùng React.memo
```

### Dependency array

```
Primitive (string, number, boolean)  → So sánh GIÁT TRỊ    → An toàn
Object / Array                       → So sánh REFERENCE   → Cẩn thận
Function                             → So sánh REFERENCE   → Cần useCallback
```
