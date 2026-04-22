# JavaScript / TypeScript — Crash Course & Cheat Sheet

---

## 1. BIẾN & KHAI BÁO

```typescript
// ── var / let / const ──
var old = "cũ"; // function scope — KHÔNG dùng nữa
let count = 0; // block scope — thay đổi được
const name = "An"; // block scope — không gán lại được

// ── TypeScript: khai báo type ──
let age: number = 25;
let active: boolean = true;
let greeting: string = "Xin chào";
let items: number[] = [1, 2, 3];
let pair: [string, number] = ["age", 25]; // tuple
let anything: any = "gì cũng được"; // tắt type check — tránh dùng
let unknown: unknown = "an toàn hơn any"; // phải check type trước khi dùng

// ── const với object/array — reference không đổi, nội dung đổi được ──
const user = { name: "An" };
user.name = "Bình"; // ✅ sửa nội dung được
// user = {};           // ❌ gán lại reference không được
```

---

## 2. KIỂU DỮ LIỆU

```typescript
// ── Primitive (giá trị) ──
string      "hello"
number      42, 3.14, NaN, Infinity
boolean     true, false
null        null          // cố ý không có giá trị
undefined   undefined     // chưa gán giá trị
bigint      9007199254740991n
symbol      Symbol("id")

// ── Reference (tham chiếu) ──
object      { key: "value" }
array       [1, 2, 3]
function    () => {}

// ── TypeScript đặc biệt ──
void        // function không trả về gì
never       // function không bao giờ return (throw error, infinite loop)
any         // bất kỳ — tắt type check
unknown     // bất kỳ — phải check trước khi dùng

// ── Type check ──
typeof "hello"    // "string"
typeof 42         // "number"
typeof true       // "boolean"
typeof undefined  // "undefined"
typeof null       // "object" ← bug lịch sử JS
typeof {}         // "object"
typeof []         // "object" ← dùng Array.isArray([]) → true
typeof (() => {}) // "function"
```

---

## 3. STRING

```typescript
// ── Tạo string ──
const s1 = "ngoặc kép";
const s2 = "ngoặc đơn";
const s3 = `template literal: ${name} tuổi ${age}`; // ← dùng nhiều nhất

// ── Methods phổ biến ──
"hello".length; // 5
"hello".toUpperCase(); // "HELLO"
"HELLO".toLowerCase(); // "hello"
"hello world".split(" "); // ["hello", "world"]
"hello".includes("ell"); // true
"hello".startsWith("he"); // true
"hello".endsWith("lo"); // true
"hello".indexOf("l"); // 2 (-1 nếu không tìm thấy)
"hello".slice(1, 3); // "el" (từ index 1 đến 3, không bao gồm 3)
"hello".substring(1, 3); // "el"
"  hello  ".trim(); // "hello"
"hello".replace("l", "L"); // "heLlo" (chỉ cái đầu)
"hello".replaceAll("l", "L"); // "heLLo" (tất cả)
"hello".repeat(3); // "hellohellohello"
"hello".charAt(0); // "h"
"hello"[0]; // "h"
"hello".padStart(10, "."); // ".....hello"
"hello".padEnd(10, "."); // "hello....."

// ── Template literal — xuống dòng + biểu thức ──
const msg = `
  Xin chào ${name},
  Bạn ${age >= 18 ? "đủ tuổi" : "chưa đủ tuổi"}.
  Tổng: ${1 + 2 + 3}
`;
```

---

## 4. NUMBER

```typescript
// ── Tạo ──
const n = 42;
const f = 3.14;
const hex = 0xff; // 255
const bin = 0b1010; // 10
const oct = 0o777; // 511

// ── Methods ──
(3.14159).toFixed(2); // "3.14" (string)
parseInt("42px"); // 42
parseFloat("3.14abc"); // 3.14
Number("42"); // 42
Number("abc"); // NaN
isNaN(NaN); // true
isFinite(42); // true
Number.isInteger(42); // true
Math.round(3.5); // 4
Math.ceil(3.1); // 4
Math.floor(3.9); // 3
Math.max(1, 2, 3); // 3
Math.min(1, 2, 3); // 1
Math.random(); // 0.0 → 0.999...
Math.abs(-5); // 5
Math.pow(2, 3); // 8
2 ** 3; // 8 (ES2016)
```

---

## 5. ARRAY

```typescript
const arr: number[] = [1, 2, 3, 4, 5];

// ── Thêm / Xóa ──
arr.push(6);              // thêm cuối → [1,2,3,4,5,6]
arr.pop();                // xóa cuối → trả về 6
arr.unshift(0);           // thêm đầu → [0,1,2,3,4,5]
arr.shift();              // xóa đầu → trả về 0
arr.splice(2, 1);         // xóa 1 phần tử tại index 2
arr.splice(2, 0, 99);     // chèn 99 tại index 2

// ── Tìm kiếm ──
arr.includes(3)           // true
arr.indexOf(3)            // index đầu tiên, -1 nếu không có
arr.find(x => x > 3)     // phần tử đầu tiên > 3
arr.findIndex(x => x > 3) // index đầu tiên > 3
arr.some(x => x > 3)     // true nếu CÓ ít nhất 1 phần tử > 3
arr.every(x => x > 0)    // true nếu TẤT CẢ > 0

// ── Biến đổi (trả về array MỚI, không sửa gốc) ──
arr.map(x => x * 2)           // [2,4,6,8,10]
arr.filter(x => x > 2)        // [3,4,5]
arr.reduce((sum, x) => sum + x, 0)  // 15
arr.slice(1, 3)                // [2,3] — cắt từ index 1 đến 3
arr.concat([6, 7])             // [1,2,3,4,5,6,7]
arr.flat()                     // [1,[2,3]] → [1,2,3]
arr.reverse()                  // [5,4,3,2,1] — SỬA gốc!
arr.sort((a, b) => a - b)     // sắp xếp tăng — SỬA gốc!
[...arr].sort()                // sort bản copy, không sửa gốc

// ── Chuyển đổi ──
arr.join(", ")                 // "1, 2, 3, 4, 5"
Array.from("hello")            // ["h","e","l","l","o"]
Array.from({ length: 5 }, (_, i) => i)  // [0,1,2,3,4]
[...new Set([1,1,2,2,3])]     // [1,2,3] — loại bỏ trùng

// ── Destructuring ──
const [first, second, ...rest] = [1, 2, 3, 4, 5];
// first = 1, second = 2, rest = [3,4,5]
```

---

## 6. OBJECT

```typescript
// ── Tạo ──
const user = {
  name: "An",
  age: 25,
  address: {
    city: "HCM",
  },
};

// ── Truy cập ──
user.name              // "An"
user["name"]           // "An" — dùng khi key là biến
const key = "age";
user[key]              // 25

// ── Thêm / Sửa / Xóa ──
user.email = "an@mail.com";   // thêm
user.age = 26;                 // sửa
delete user.email;             // xóa

// ── Methods ──
Object.keys(user)          // ["name", "age", "address"]
Object.values(user)        // ["An", 25, { city: "HCM" }]
Object.entries(user)       // [["name","An"], ["age",25], ...]
Object.assign({}, user)    // shallow copy
{ ...user }                // shallow copy (spread)
Object.freeze(user)        // không sửa được nữa
Object.hasOwn(user, "name") // true

// ── Destructuring ──
const { name, age, address: { city } } = user;
// name = "An", age = 25, city = "HCM"

// Đổi tên
const { name: userName } = user;  // userName = "An"

// Default value
const { email = "none" } = user;  // email = "none" (không có trong object)

// ── Spread / Merge ──
const updated = { ...user, age: 30, email: "new@mail.com" };
// copy user + ghi đè age + thêm email

// ── Optional chaining ──
user.address?.city         // "HCM"
user.company?.name         // undefined (không crash)
user.getAge?.()            // undefined (không crash)
```

---

## 7. FUNCTION

```typescript
// ── 4 cách viết ──

// 1. Function declaration
function add(a: number, b: number): number {
  return a + b;
}

// 2. Function expression
const add = function (a: number, b: number): number {
  return a + b;
};

// 3. Arrow function
const add = (a: number, b: number): number => {
  return a + b;
};

// 4. Arrow function ngắn gọn (1 expression)
const add = (a: number, b: number): number => a + b;

// ── Default params ──
function greet(name: string = "bạn"): string {
  return `Xin chào ${name}`;
}
greet(); // "Xin chào bạn"
greet("An"); // "Xin chào An"

// ── Rest params ──
function sum(...nums: number[]): number {
  return nums.reduce((a, b) => a + b, 0);
}
sum(1, 2, 3); // 6

// ── Function là giá trị ──
let action: (() => void) | null = null;
action = () => console.log("Hello");
action(); // "Hello"
action = null;
action?.(); // không crash

// ── Callback ──
function doAfter(ms: number, fn: () => void): void {
  setTimeout(fn, ms);
}
doAfter(1000, () => console.log("1 giây sau"));

// ── Return function ──
function multiplier(factor: number) {
  return (n: number) => n * factor;
}
const double = multiplier(2);
double(5); // 10
```

---

## 8. ĐIỀU KIỆN

```typescript
// ── if / else ──
if (age >= 18) {
  console.log("Đủ tuổi");
} else if (age >= 16) {
  console.log("Gần đủ");
} else {
  console.log("Chưa đủ");
}

// ── Ternary ──
const status = age >= 18 ? "Đủ tuổi" : "Chưa đủ";

// ── Switch ──
switch (code) {
  case 1:
    console.log("Calling");
    break;
  case 2:
    console.log("Ringing");
    break;
  case 3:
    console.log("Answered");
    break;
  default:
    console.log("Unknown");
}

// ── Nullish coalescing ?? ──
const name = user.name ?? "Ẩn danh";
// null hoặc undefined → dùng fallback
// "" (chuỗi rỗng) → giữ nguyên "" ← khác với ||

// ── Logical OR || ──
const name = user.name || "Ẩn danh";
// bất kỳ falsy → dùng fallback
// "" → dùng fallback ← khác với ??

// ── Falsy values ──
// false, 0, "", null, undefined, NaN → đều là falsy

// ── Optional chaining ?. ──
user?.address?.city; // undefined nếu user hoặc address null
arr?.[0]; // undefined nếu arr null
fn?.(); // không gọi nếu fn null

// ── Logical assignment ──
x ??= 10; // x = x ?? 10 — gán nếu x là null/undefined
x ||= 10; // x = x || 10 — gán nếu x là falsy
x &&= 10; // x = x && 10 — gán nếu x là truthy
```

---

## 9. VÒNG LẶP

```typescript
// ── for ──
for (let i = 0; i < 5; i++) {
  console.log(i); // 0,1,2,3,4
}

// ── for...of (duyệt giá trị — array, string) ──
for (const item of [1, 2, 3]) {
  console.log(item); // 1,2,3
}

// ── for...in (duyệt key — object) ──
for (const key in { a: 1, b: 2 }) {
  console.log(key); // "a","b"
}

// ── while ──
let i = 0;
while (i < 5) {
  console.log(i++);
}

// ── Array methods (thay thế vòng lặp) ──
[1, 2, 3].forEach((x) => console.log(x)); // duyệt
[1, 2, 3].map((x) => x * 2); // biến đổi
[1, 2, 3].filter((x) => x > 1); // lọc
[1, 2, 3].reduce((sum, x) => sum + x, 0); // gộp

// ── break / continue ──
for (let i = 0; i < 10; i++) {
  if (i === 5) break; // dừng hẳn
  if (i % 2 === 0) continue; // bỏ qua, đi tiếp
  console.log(i); // 1, 3
}
```

---

## 10. DESTRUCTURING & SPREAD

```typescript
// ── Array destructuring ──
const [a, b, ...rest] = [1, 2, 3, 4, 5];
// a = 1, b = 2, rest = [3,4,5]

const [first, , third] = [1, 2, 3];
// first = 1, third = 3 (bỏ qua phần tử thứ 2)

// ── Object destructuring ──
const { name, age, ...others } = { name: "An", age: 25, city: "HCM" };
// name = "An", age = 25, others = { city: "HCM" }

// Đổi tên
const { name: userName, age: userAge } = user;

// Default value
const { email = "none" } = user;

// Nested
const {
  address: { city },
} = user;

// ── Trong function params ──
function greet({ name, age }: { name: string; age: number }) {
  console.log(`${name}, ${age} tuổi`);
}
greet({ name: "An", age: 25 });

// ── Spread (tách ra) ──
const arr1 = [1, 2];
const arr2 = [...arr1, 3, 4]; // [1,2,3,4]

const obj1 = { a: 1 };
const obj2 = { ...obj1, b: 2 }; // { a: 1, b: 2 }

// ── Merge / Override ──
const defaults = { timeout: 60, format: "mp3" };
const custom = { timeout: 30 };
const final = { ...defaults, ...custom };
// { timeout: 30, format: "mp3" } — custom ghi đè defaults
```

---

## 11. ASYNC / AWAIT / PROMISE

```typescript
// ── Promise ──
const promise = new Promise<string>((resolve, reject) => {
  setTimeout(() => resolve("done"), 1000);
  // hoặc reject(new Error("fail"));
});

promise
  .then((result) => console.log(result)) // "done"
  .catch((err) => console.error(err))
  .finally(() => console.log("xong"));

// ── Async/Await (cú pháp gọn hơn Promise) ──
async function fetchData(): Promise<string> {
  try {
    const res = await fetch("/api/data"); // chờ response
    const data = await res.json(); // chờ parse JSON
    return data;
  } catch (err) {
    console.error("Lỗi:", err);
    throw err;
  } finally {
    console.log("Luôn chạy");
  }
}

// ── Promise.all — chạy song song, chờ TẤT CẢ ──
const [users, posts] = await Promise.all([
  fetch("/api/users").then((r) => r.json()),
  fetch("/api/posts").then((r) => r.json()),
]);

// ── Promise.race — lấy cái xong TRƯỚC ──
const fastest = await Promise.race([
  fetch("/api/server1"),
  fetch("/api/server2"),
]);

// ── Promise.allSettled — chờ tất cả, kể cả fail ──
const results = await Promise.allSettled([
  fetch("/api/a"),
  fetch("/api/b"), // fail cũng không sao
]);
// [{ status: "fulfilled", value: ... }, { status: "rejected", reason: ... }]
```

---

## 12. ERROR HANDLING

```typescript
// ── try / catch / finally ──
try {
  const data = JSON.parse(invalidString);
} catch (err) {
  if (err instanceof SyntaxError) {
    console.log("JSON sai format");
  } else if (err instanceof Error) {
    console.log(err.message);
  }
} finally {
  console.log("Luôn chạy");
}

// ── Custom error ──
class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

throw new ApiError(404, "Not found");

// ── Type guard cho error ──
catch (err: unknown) {
  const message = err instanceof Error ? err.message : "Lỗi không xác định";
}
```

---

## 13. TYPESCRIPT — TYPE & INTERFACE

```typescript
// ── Type alias ──
type MediaFormat = "mp3" | "wav" | "mp4"; // union literal
type ID = string | number; // union type
type Nullable<T> = T | null; // generic

// ── Interface ──
interface User {
  name: string;
  age: number;
  email?: string; // optional
  readonly id: string; // không sửa được sau khi tạo
}

// ── Kế thừa ──
interface Admin extends User {
  role: "admin" | "superadmin";
}

// ── Type vs Interface ──
// Interface: dùng cho object, extends được, merge được
// Type: dùng cho union, tuple, mapped types, linh hoạt hơn

// ── Generic ──
function first<T>(arr: T[]): T | undefined {
  return arr[0];
}
first<number>([1, 2, 3]); // 1
first(["a", "b"]); // "a" — TypeScript tự suy

// ── Generic interface ──
interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

const res: ApiResponse<User> = {
  success: true,
  data: { name: "An", age: 25, id: "1" },
};

// ── Utility types ──
Partial<User>; // tất cả field thành optional
Required<User>; // tất cả field thành required
Pick<User, "name" | "age">; // chỉ lấy name và age
Omit<User, "id">; // bỏ id
Record<string, number>; // { [key: string]: number }
Readonly<User>; // tất cả field readonly
ReturnType<typeof fn>; // kiểu trả về của function

// ── Type assertion ──
const input = document.getElementById("name") as HTMLInputElement;
const state = unknownValue as SignalingState;

// ── Type guard ──
function isString(value: unknown): value is string {
  return typeof value === "string";
}

// ── Discriminated union ──
type Action =
  | { action: "record"; format: string }
  | { action: "connect"; from: Endpoint; to: Endpoint }
  | { action: "talk"; text: string };

function handleAction(a: Action) {
  switch (a.action) {
    case "record":
      console.log(a.format);
      break; // TS biết có format
    case "connect":
      console.log(a.from);
      break; // TS biết có from
    case "talk":
      console.log(a.text);
      break; // TS biết có text
  }
}
```

---

## 14. CLASS

```typescript
class Call {
  // Properties
  private callId: string;
  public status: string;
  protected duration: number;

  // Constructor
  constructor(callId: string) {
    this.callId = callId;
    this.status = "idle";
    this.duration = 0;
  }

  // Method
  start(): void {
    this.status = "calling";
    console.log(`Call ${this.callId} started`);
  }

  // Getter
  get info(): string {
    return `${this.callId}: ${this.status}`;
  }

  // Static
  static createId(): string {
    return `call_${Date.now()}`;
  }
}

// Sử dụng
const call = new Call("123");
call.start();
console.log(call.info);
const id = Call.createId();

// Kế thừa
class VideoCall extends Call {
  private hasVideo: boolean;

  constructor(callId: string) {
    super(callId); // gọi constructor cha
    this.hasVideo = true;
  }

  override start(): void {
    super.start(); // gọi method cha
    console.log("Video enabled");
  }
}

// ── Shorthand constructor (TypeScript) ──
class User {
  constructor(
    public name: string,
    public age: number,
    private email?: string,
  ) {}
  // Tự tạo property + gán giá trị, không cần viết this.name = name
}
```

---

## 15. MODULE (Import / Export)

```typescript
// ── Named export ──
// utils.ts
export function add(a: number, b: number) { return a + b; }
export function subtract(a: number, b: number) { return a - b; }
export const PI = 3.14;

// Import — bắt buộc {}, đúng tên
import { add, subtract, PI } from "./utils";
import { add as cong } from "./utils";        // đổi tên
import * as Utils from "./utils";              // import tất cả
Utils.add(1, 2);

// ── Default export ──
// Button.tsx
export default function Button() { return <button>Click</button>; }

// Import — không {}, tên tùy ý
import Button from "./Button";
import Nut from "./Button";        // tên khác vẫn được

// ── Kết hợp ──
import api, { getToken, makeCall } from "./stringee";
//     ↑ default   ↑ named

// ── Re-export (barrel) ──
// components/index.ts
export { default as Button } from "./Button";
export { default as Input } from "./Input";
export { Toggle } from "./Toggle";

// Import gọn
import { Button, Input, Toggle } from "./components";
```

---

## 16. MAP, SET, WeakMap, WeakSet

```typescript
// ── Map — key bất kỳ (object, function, number...) ──
const map = new Map<string, number>();
map.set("a", 1);
map.set("b", 2);
map.get("a"); // 1
map.has("a"); // true
map.delete("a");
map.size; // 1
map.forEach((val, key) => console.log(key, val));

// ── Set — giá trị không trùng ──
const set = new Set<number>([1, 2, 2, 3]);
// Set { 1, 2, 3 }
set.add(4);
set.has(2); // true
set.delete(2);
set.size; // 3

// Loại trùng từ array
const unique = [...new Set([1, 1, 2, 2, 3])]; // [1, 2, 3]
```

---

## 17. DOM (Browser)

```typescript
// ── Lấy element ──
document.getElementById("app");
document.querySelector(".btn"); // 1 element đầu tiên
document.querySelectorAll(".item"); // tất cả
document.querySelector<HTMLInputElement>("#name"); // TypeScript

// ── Sửa nội dung ──
el.textContent = "Hello"; // text thuần
el.innerHTML = "<b>Hello</b>"; // HTML

// ── Sửa style / class ──
el.style.color = "red";
el.classList.add("active");
el.classList.remove("active");
el.classList.toggle("active");

// ── Event ──
el.addEventListener("click", (e) => {
  console.log("clicked", e.target);
});

// ── Tạo element ──
const div = document.createElement("div");
div.textContent = "Mới";
document.body.appendChild(div);
```

---

## 18. JSON

```typescript
// ── Object → String ──
const str = JSON.stringify({ name: "An", age: 25 });
// '{"name":"An","age":25}'

// ── String → Object ──
const obj = JSON.parse('{"name":"An","age":25}');
// { name: "An", age: 25 }

// ── Pretty print ──
JSON.stringify(obj, null, 2);
// {
//   "name": "An",
//   "age": 25
// }

// ── Với TypeScript ──
const data = JSON.parse(str) as User; // ép kiểu
```

---

## 19. DATE & TIME

```typescript
const now = new Date();
const specific = new Date("2025-01-15T10:30:00");
const unix = Date.now(); // milliseconds

now.getFullYear(); // 2025
now.getMonth(); // 0-11 (0 = tháng 1!)
now.getDate(); // 1-31
now.getHours(); // 0-23
now.getTime(); // unix ms
Math.floor(Date.now() / 1000); // unix seconds (cho JWT)

// ── Format ──
now.toLocaleDateString("vi-VN"); // "15/01/2025"
now.toLocaleTimeString("vi-VN"); // "10:30:00"
now.toISOString(); // "2025-01-15T10:30:00.000Z"
```

---

## 20. LOCAL STORAGE & SESSION STORAGE

```typescript
// ── localStorage (tồn tại mãi) ──
localStorage.setItem("key", "value");
localStorage.getItem("key"); // "value" hoặc null
localStorage.removeItem("key");
localStorage.clear(); // xóa hết

// ── Lưu object → phải stringify ──
localStorage.setItem("user", JSON.stringify({ name: "An" }));
const user = JSON.parse(localStorage.getItem("user") ?? "null");

// ── sessionStorage (mất khi đóng tab) ──
sessionStorage.setItem("key", "value");
sessionStorage.getItem("key");
```

---

## 21. PATTERNS PHỔ BIẾN

```typescript
// ── Short-circuit evaluation ──
isLoggedIn && showDashboard(); // chỉ chạy nếu true
data || fetchData(); // chỉ fetch nếu data falsy

// ── Optional chaining + nullish coalescing ──
const city = user?.address?.city ?? "Không rõ";

// ── Object shorthand ──
const name = "An";
const age = 25;
const user = { name, age }; // { name: "An", age: 25 }

// ── Computed property ──
const key = "email";
const obj = { [key]: "an@mail.com" }; // { email: "an@mail.com" }

// ── Swap ──
let a = 1,
  b = 2;
[a, b] = [b, a]; // a = 2, b = 1

// ── Clone ──
const shallow = { ...obj }; // shallow copy
const deep = JSON.parse(JSON.stringify(obj)); // deep copy (mất function)
const deep2 = structuredClone(obj); // deep copy (giữ Date, Map...)

// ── Chaining ──
const result = arr
  .filter((x) => x > 0)
  .map((x) => x * 2)
  .reduce((sum, x) => sum + x, 0);

// ── Early return ──
function process(data: Data | null) {
  if (!data) return; // thoát sớm
  if (!data.valid) return; // thoát sớm
  // logic chính — không lồng if
}
```

---

## 22. SO SÁNH

```typescript
// ── == vs === ──
1 == "1"      // true  — ép kiểu rồi so sánh (KHÔNG DÙNG)
1 === "1"     // false — so sánh cả kiểu (LUÔN DÙNG)
null == undefined   // true
null === undefined  // false

// ── Object so sánh reference ──
{a:1} === {a:1}     // false — khác reference
const obj = {a:1};
obj === obj          // true — cùng reference

// ── So sánh nội dung object ──
JSON.stringify(a) === JSON.stringify(b)  // cách đơn giản (không hoàn hảo)
```

---

## 23. TIMER

```typescript
// ── setTimeout — chạy 1 lần sau N ms ──
const timer = setTimeout(() => {
  console.log("3 giây sau");
}, 3000);
clearTimeout(timer); // hủy

// ── setInterval — chạy lặp mỗi N ms ──
const interval = setInterval(() => {
  console.log("mỗi giây");
}, 1000);
clearInterval(interval); // dừng

// ── Trong React — luôn cleanup ──
useEffect(() => {
  const timer = setInterval(() => setCount((c) => c + 1), 1000);
  return () => clearInterval(timer);
}, []);
```

---

## 24. FETCH API

```typescript
// ── GET ──
const res = await fetch("/api/users");
const data = await res.json();

// ── POST ──
const res = await fetch("/api/users", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ name: "An", age: 25 }),
});

// ── Kiểm tra lỗi ──
if (!res.ok) throw new Error(`HTTP ${res.status}`);

// ── Với AbortController ──
const controller = new AbortController();
const res = await fetch("/api", { signal: controller.signal });
controller.abort(); // hủy request
```

---

## 25. CONSOLE

```typescript
console.log("thông tin");
console.error("lỗi");
console.warn("cảnh báo");
console.table([{ a: 1 }, { a: 2 }]); // bảng
console.time("label"); // bắt đầu đo
console.timeEnd("label"); // kết thúc đo
console.group("nhóm"); // nhóm log
console.groupEnd();
console.dir(object); // hiện object dạng tree
```
