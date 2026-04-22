# TypeScript Nâng Cao — Hướng Dẫn Chi Tiết

> Tài liệu này dành cho developer đã nắm vững TypeScript cơ bản và muốn đi sâu vào hệ thống kiểu, pattern nâng cao, và kỹ thuật tối ưu.

---

## Mục Lục

1. [Type System Nâng Cao](#1-type-system-nâng-cao)
2. [Generic Nâng Cao](#2-generic-nâng-cao)
3. [Conditional Types](#3-conditional-types)
4. [Mapped Types](#4-mapped-types)
5. [Template Literal Types](#5-template-literal-types)
6. [Utility Types Chuyên Sâu](#6-utility-types-chuyên-sâu)
7. [Infer Keyword](#7-infer-keyword)
8. [Decorator](#8-decorator)
9. [Declaration Merging](#9-declaration-merging)
10. [Module Augmentation](#10-module-augmentation)
11. [Type Guards Nâng Cao](#11-type-guards-nâng-cao)
12. [Variance & Covariance](#12-variance--covariance)
13. [Branded Types](#13-branded-types)
14. [Builder Pattern với TypeScript](#14-builder-pattern-với-typescript)
15. [Performance & Compiler Options](#15-performance--compiler-options)

---

## 1. Type System Nâng Cao

### 1.1 Literal Types & Widening

```typescript
// Literal type — giá trị cụ thể là một kiểu
const direction = "north";           // type: "north" (literal)
let direction2 = "north";            // type: string (widened)

// Ép TypeScript giữ literal type
const direction3 = "north" as const; // type: "north"

// Object literal với as const
const config = {
  host: "localhost",
  port: 3000,
} as const;
// config.host: "localhost"  (không phải string)
// config.port: 3000         (không phải number)
```

### 1.2 Discriminated Union (Tagged Union)

Pattern mạnh nhất để mô hình hóa state:

```typescript
type LoadingState = { status: "loading" };
type SuccessState = { status: "success"; data: string[] };
type ErrorState   = { status: "error";   error: Error };

type State = LoadingState | SuccessState | ErrorState;

function render(state: State) {
  switch (state.status) {
    case "loading":
      return "Đang tải...";
    case "success":
      return state.data.join(", "); // TypeScript biết đây là SuccessState
    case "error":
      return state.error.message;   // TypeScript biết đây là ErrorState
  }
}
```

### 1.3 Intersection Types

```typescript
type Timestamped = { createdAt: Date; updatedAt: Date };
type SoftDelete   = { deletedAt: Date | null };

type BaseEntity = Timestamped & SoftDelete;

// Dùng trong generic
function withTimestamp<T>(obj: T): T & Timestamped {
  return {
    ...obj,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}
```

### 1.4 Index Signature vs Record

```typescript
// Index signature — linh hoạt nhưng kém an toàn
interface Dict {
  [key: string]: unknown;
}

// Record — tường minh hơn
type StatusMap = Record<"active" | "inactive" | "pending", number>;

// Kết hợp index signature với property cố định
interface Config {
  timeout: number;         // property cố định
  [key: string]: unknown;  // property động — phải tương thích với tất cả kiểu trên
}
```

---

## 2. Generic Nâng Cao

### 2.1 Generic Constraints

```typescript
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

const user = { name: "An", age: 25 };
const name = getProperty(user, "name"); // type: string
const age  = getProperty(user, "age");  // type: number
// getProperty(user, "email");           // lỗi: "email" không tồn tại
```

### 2.2 Generic với Default Type

```typescript
interface ApiResponse<T = unknown> {
  data: T;
  status: number;
  message: string;
}

// Dùng không cần chỉ định type
const res: ApiResponse = { data: null, status: 200, message: "OK" };

// Hoặc chỉ định cụ thể
const userRes: ApiResponse<{ name: string }> = {
  data: { name: "An" },
  status: 200,
  message: "OK",
};
```

### 2.3 Variadic Tuple Types

```typescript
type Concat<T extends unknown[], U extends unknown[]> = [...T, ...U];

type ABC = Concat<[string, number], [boolean, Date]>;
// type: [string, number, boolean, Date]

// Ứng dụng: compose function với type an toàn
function concat<T extends unknown[], U extends unknown[]>(
  a: T,
  b: U
): Concat<T, U> {
  return [...a, ...b] as Concat<T, U>;
}
```

### 2.4 Generic Class

```typescript
class Repository<T extends { id: string }> {
  private items: Map<string, T> = new Map();

  add(item: T): void {
    this.items.set(item.id, item);
  }

  findById(id: string): T | undefined {
    return this.items.get(id);
  }

  findAll(): T[] {
    return Array.from(this.items.values());
  }

  update(id: string, patch: Partial<Omit<T, "id">>): T | undefined {
    const existing = this.items.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...patch };
    this.items.set(id, updated);
    return updated;
  }
}

interface User {
  id: string;
  name: string;
  email: string;
}

const userRepo = new Repository<User>();
userRepo.add({ id: "1", name: "An", email: "an@example.com" });
```

---

## 3. Conditional Types

### 3.1 Cú Pháp Cơ Bản

```typescript
// T extends U ? X : Y
type IsString<T> = T extends string ? true : false;

type A = IsString<string>;  // true
type B = IsString<number>;  // false
type C = IsString<"hello">; // true — literal type extends string
```

### 3.2 Distributive Conditional Types

```typescript
// Khi T là union, conditional type được phân phối trên từng thành phần
type NonNullable<T> = T extends null | undefined ? never : T;

type D = NonNullable<string | null | undefined | number>;
// = string | number

// Tắt distributive bằng cách wrap trong tuple
type IsUnion<T> = [T] extends [string] ? true : false;
type E = IsUnion<string | number>; // false — không bị distribute
```

### 3.3 Conditional Types Lồng Nhau

```typescript
type TypeName<T> =
  T extends string  ? "string"  :
  T extends number  ? "number"  :
  T extends boolean ? "boolean" :
  T extends null    ? "null"    :
  T extends undefined ? "undefined" :
  T extends Function  ? "function"  :
  "object";

type F = TypeName<Date>;     // "object"
type G = TypeName<() => void>; // "function"
```

---

## 4. Mapped Types

### 4.1 Cơ Bản

```typescript
// Biến mọi property thành optional
type Optional<T> = {
  [K in keyof T]?: T[K];
};

// Biến mọi property thành readonly
type Immutable<T> = {
  readonly [K in keyof T]: T[K];
};

// Biến mọi property thành nullable
type Nullable<T> = {
  [K in keyof T]: T[K] | null;
};
```

### 4.2 Key Remapping (TypeScript 4.1+)

```typescript
// Đổi tên key với `as`
type Getters<T> = {
  [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K];
};

interface Person {
  name: string;
  age: number;
}

type PersonGetters = Getters<Person>;
// {
//   getName: () => string;
//   getAge: () => number;
// }
```

### 4.3 Lọc Key Trong Mapped Type

```typescript
// Chỉ giữ lại property có value là string
type StringOnly<T> = {
  [K in keyof T as T[K] extends string ? K : never]: T[K];
};

interface Mixed {
  name: string;
  age: number;
  email: string;
  active: boolean;
}

type StringFields = StringOnly<Mixed>;
// { name: string; email: string }
```

### 4.4 Mapped Type Đệ Quy

```typescript
type DeepReadonly<T> = {
  readonly [K in keyof T]: T[K] extends object ? DeepReadonly<T[K]> : T[K];
};

type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};

interface Config {
  server: {
    host: string;
    port: number;
    ssl: {
      enabled: boolean;
      cert: string;
    };
  };
  database: {
    url: string;
  };
}

const patch: DeepPartial<Config> = {
  server: {
    ssl: { enabled: true }, // không cần cung cấp cert
  },
};
```

---

## 5. Template Literal Types

### 5.1 Cơ Bản

```typescript
type EventName = "click" | "focus" | "blur";
type Handler = `on${Capitalize<EventName>}`;
// "onClick" | "onFocus" | "onBlur"

type CSSProperty = "margin" | "padding";
type CSSDirection = "Top" | "Right" | "Bottom" | "Left";
type CSSShorthand = `${CSSProperty}${CSSDirection}`;
// "marginTop" | "marginRight" | ... | "paddingLeft"
```

### 5.2 Ứng Dụng Thực Tế: Type-safe Event Emitter

```typescript
type EventMap = {
  "user:login":  { userId: string };
  "user:logout": { userId: string };
  "order:created": { orderId: string; total: number };
};

class TypedEventEmitter<Events extends Record<string, unknown>> {
  private listeners = new Map<string, Function[]>();

  on<K extends string & keyof Events>(
    event: K,
    listener: (data: Events[K]) => void
  ): void {
    const list = this.listeners.get(event) ?? [];
    list.push(listener);
    this.listeners.set(event, list);
  }

  emit<K extends string & keyof Events>(
    event: K,
    data: Events[K]
  ): void {
    this.listeners.get(event)?.forEach(fn => fn(data));
  }
}

const emitter = new TypedEventEmitter<EventMap>();

emitter.on("user:login", ({ userId }) => {
  console.log(`User ${userId} đã đăng nhập`);
});

emitter.emit("user:login", { userId: "123" }); // OK
// emitter.emit("user:login", { email: "x" });  // lỗi: thiếu userId
```

### 5.3 Parse String Type

```typescript
// Trích xuất params từ URL pattern
type ExtractParams<Path extends string> =
  Path extends `${infer _Start}:${infer Param}/${infer Rest}`
    ? Param | ExtractParams<`/${Rest}`>
  : Path extends `${infer _Start}:${infer Param}`
    ? Param
  : never;

type Params = ExtractParams<"/users/:userId/posts/:postId">;
// "userId" | "postId"

type RouteParams<Path extends string> = {
  [K in ExtractParams<Path>]: string;
};

function navigate<Path extends string>(
  path: Path,
  params: RouteParams<Path>
): string {
  return Object.entries(params).reduce(
    (acc, [key, val]) => acc.replace(`:${key}`, val as string),
    path as string
  );
}

navigate("/users/:userId/posts/:postId", {
  userId: "1",
  postId: "42",
}); // "/users/1/posts/42"
```

---

## 6. Utility Types Chuyên Sâu

### 6.1 Các Utility Types Ít Biết

```typescript
// Parameters<T> — lấy type của các tham số hàm
type Fn = (name: string, age: number) => void;
type Params = Parameters<Fn>; // [string, number]

// ReturnType<T> — lấy type của giá trị trả về
type Return = ReturnType<Fn>; // void

// ConstructorParameters<T>
class Database {
  constructor(url: string, poolSize: number) {}
}
type DbArgs = ConstructorParameters<typeof Database>; // [string, number]

// InstanceType<T>
type DbInstance = InstanceType<typeof Database>; // Database

// Awaited<T> — unwrap Promise (TypeScript 4.5+)
type Unwrapped = Awaited<Promise<Promise<string>>>; // string
```

### 6.2 Tự Xây Dựng Utility Types

```typescript
// OmitByValue — Omit theo value type thay vì key
type OmitByValue<T, V> = {
  [K in keyof T as T[K] extends V ? never : K]: T[K];
};

// PickByValue
type PickByValue<T, V> = {
  [K in keyof T as T[K] extends V ? K : never]: T[K];
};

// Flatten — flat 1 cấp của union/intersection
type Flatten<T> = T extends Array<infer Item> ? Item : T;

// UnionToIntersection
type UnionToIntersection<U> =
  (U extends any ? (x: U) => void : never) extends (x: infer I) => void
    ? I
    : never;

type A = UnionToIntersection<{ a: string } | { b: number }>;
// { a: string } & { b: number }

// RequireAtLeastOne — ít nhất một property phải có
type RequireAtLeastOne<T, Keys extends keyof T = keyof T> =
  Pick<T, Exclude<keyof T, Keys>> &
  { [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>> }[Keys];

interface SearchOptions {
  name?: string;
  email?: string;
  phone?: string;
}

type SearchQuery = RequireAtLeastOne<SearchOptions>;
// Phải có ít nhất 1 trong name, email, phone
```

---

## 7. Infer Keyword

### 7.1 Cơ Bản

```typescript
// Trích xuất type từ cấu trúc phức tạp
type UnpackPromise<T> = T extends Promise<infer U> ? U : T;
type UnpackArray<T>   = T extends Array<infer U>   ? U : T;

// Trích xuất type của hàm
type FirstParam<T> = T extends (first: infer F, ...rest: any[]) => any ? F : never;

type H = FirstParam<(name: string, age: number) => void>; // string
```

### 7.2 Infer Nhiều Vị Trí

```typescript
// Trích xuất đồng thời head và tail của tuple
type Head<T extends unknown[]> = T extends [infer H, ...unknown[]] ? H : never;
type Tail<T extends unknown[]> = T extends [unknown, ...infer T] ? T : never;

type H2 = Head<[string, number, boolean]>; // string
type T2 = Tail<[string, number, boolean]>; // [number, boolean]

// Đảo ngược tuple
type Reverse<T extends unknown[]> =
  T extends [infer First, ...infer Rest]
    ? [...Reverse<Rest>, First]
    : [];

type Rev = Reverse<[1, 2, 3]>; // [3, 2, 1]
```

### 7.3 Infer Trong Class

```typescript
// Lấy type của property trong class
type PropertyType<T, K extends keyof T> = T[K];

// Lấy type của method return
type MethodReturn<T, K extends keyof T> =
  T[K] extends (...args: any[]) => infer R ? R : never;

class UserService {
  async getUser(id: string): Promise<{ name: string; email: string }> {
    return { name: "An", email: "an@example.com" };
  }
}

type GetUserReturn = MethodReturn<UserService, "getUser">;
// Promise<{ name: string; email: string }>

type ResolvedUser = Awaited<GetUserReturn>;
// { name: string; email: string }
```

---

## 8. Decorator

> Yêu cầu `"experimentalDecorators": true` trong `tsconfig.json`.

### 8.1 Class Decorator

```typescript
function Singleton<T extends { new(...args: any[]): {} }>(constructor: T) {
  let instance: T;
  return class extends constructor {
    constructor(...args: any[]) {
      if (instance) return instance;
      super(...args);
      instance = this as any;
    }
  };
}

@Singleton
class ConfigService {
  private config = { debug: false };
  get(key: string) { return (this.config as any)[key]; }
}

const a = new ConfigService();
const b = new ConfigService();
console.log(a === b); // true
```

### 8.2 Method Decorator

```typescript
function Log(
  target: any,
  propertyKey: string,
  descriptor: PropertyDescriptor
) {
  const original = descriptor.value;
  descriptor.value = function (...args: any[]) {
    console.log(`[${propertyKey}] called with:`, args);
    const result = original.apply(this, args);
    console.log(`[${propertyKey}] returned:`, result);
    return result;
  };
  return descriptor;
}

function Memoize(
  target: any,
  propertyKey: string,
  descriptor: PropertyDescriptor
) {
  const original = descriptor.value;
  const cache = new Map<string, any>();
  descriptor.value = function (...args: any[]) {
    const key = JSON.stringify(args);
    if (cache.has(key)) return cache.get(key);
    const result = original.apply(this, args);
    cache.set(key, result);
    return result;
  };
  return descriptor;
}

class MathService {
  @Log
  @Memoize
  fibonacci(n: number): number {
    if (n <= 1) return n;
    return this.fibonacci(n - 1) + this.fibonacci(n - 2);
  }
}
```

### 8.3 Property Decorator

```typescript
function MinLength(min: number) {
  return function (target: any, propertyKey: string) {
    let value: string;
    Object.defineProperty(target, propertyKey, {
      get() { return value; },
      set(newVal: string) {
        if (newVal.length < min) {
          throw new Error(`${propertyKey} phải có ít nhất ${min} ký tự`);
        }
        value = newVal;
      },
    });
  };
}

class User {
  @MinLength(3)
  name!: string;

  @MinLength(8)
  password!: string;
}

const user = new User();
user.name = "An";       // OK (3 ký tự)
// user.password = "1234"; // lỗi: phải có ít nhất 8 ký tự
```

---

## 9. Declaration Merging

### 9.1 Interface Merging

```typescript
// Hai interface cùng tên tự động merge
interface Window {
  myCustomProp: string;
}

interface Window {
  anotherProp: number;
}

// Kết quả: Window có cả myCustomProp lẫn anotherProp
declare const win: Window;
win.myCustomProp; // OK
win.anotherProp;  // OK
```

### 9.2 Namespace Merging

```typescript
// Thêm static method vào class qua namespace cùng tên
class Validator {
  validate(value: string): boolean {
    return value.length > 0;
  }
}

namespace Validator {
  export function isEmail(value: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }
}

const v = new Validator();
v.validate("hello");          // instance method
Validator.isEmail("a@b.com"); // static via namespace
```

---

## 10. Module Augmentation

### 10.1 Augment Third-party Module

```typescript
// types/express.d.ts
import "express";

declare module "express" {
  interface Request {
    user?: {
      id: string;
      role: "admin" | "user";
    };
    requestId: string;
  }
}

// Bây giờ trong code Express:
// app.use((req, res, next) => {
//   req.user?.role;    // TypeScript hiểu type này
//   req.requestId;     // không bị lỗi "Property does not exist"
// });
```

### 10.2 Augment Global

```typescript
// types/global.d.ts
declare global {
  interface Array<T> {
    groupBy<K extends string | number>(
      fn: (item: T) => K
    ): Record<K, T[]>;
  }
}

// Hiện thực:
Array.prototype.groupBy = function <T, K extends string | number>(
  this: T[],
  fn: (item: T) => K
): Record<K, T[]> {
  return this.reduce((acc, item) => {
    const key = fn(item);
    (acc[key] = acc[key] ?? []).push(item);
    return acc;
  }, {} as Record<K, T[]>);
};

export {}; // phải có để file này là module
```

---

## 11. Type Guards Nâng Cao

### 11.1 User-defined Type Guard

```typescript
// Predicate: "x is T"
function isString(value: unknown): value is string {
  return typeof value === "string";
}

function isUser(value: unknown): value is { name: string; email: string } {
  return (
    typeof value === "object" &&
    value !== null &&
    "name" in value &&
    "email" in value
  );
}
```

### 11.2 Assertion Function

```typescript
// Kiểu đặc biệt: "asserts x is T" — throw nếu sai
function assertDefined<T>(
  value: T | null | undefined,
  message?: string
): asserts value is T {
  if (value == null) {
    throw new Error(message ?? "Giá trị không được phép null/undefined");
  }
}

function processUser(userId: string | null) {
  assertDefined(userId, "userId là bắt buộc");
  // Sau đây TypeScript biết userId là string
  console.log(userId.toUpperCase());
}
```

### 11.3 Type Narrowing với in, instanceof

```typescript
interface Cat { meow(): void }
interface Dog { bark(): void }
type Animal = Cat | Dog;

function makeSound(animal: Animal) {
  if ("meow" in animal) {
    animal.meow(); // Cat
  } else {
    animal.bark(); // Dog
  }
}

// instanceof với class hierarchy
class ApiError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message);
  }
}

function handleError(error: unknown) {
  if (error instanceof ApiError) {
    console.log(`HTTP ${error.statusCode}: ${error.message}`);
  } else if (error instanceof Error) {
    console.log(`Error: ${error.message}`);
  } else {
    console.log("Unknown error:", error);
  }
}
```

---

## 12. Variance & Covariance

### 12.1 Covariant vs Contravariant

```typescript
// Covariant (cùng chiều): return types
// Nếu Cat extends Animal thì () => Cat extends () => Animal
type Producer<T> = () => T;

// Contravariant (ngược chiều): parameter types
// Nếu Cat extends Animal thì (x: Animal) => void extends (x: Cat) => void
type Consumer<T> = (value: T) => void;

// Invariant: cả hai chiều — không thể thay thế nhau
// Ví dụ: mutable container

// Bivariant: TypeScript cho phép cả hai (method shorthand)
interface Handler {
  handle(event: MouseEvent): void; // bivariant — method shorthand
}

interface StrictHandler {
  handle: (event: MouseEvent) => void; // contravariant — function property
}
```

### 12.2 in/out Variance Annotation (TypeScript 4.7+)

```typescript
// out = covariant (chỉ xuất ra)
// in  = contravariant (chỉ nhận vào)
interface Producer<out T> {
  produce(): T;
}

interface Consumer<in T> {
  consume(value: T): void;
}

// TypeScript sẽ báo lỗi nếu dùng T sai vị trí
```

---

## 13. Branded Types

Kỹ thuật tạo kiểu "tên giống nhau nhưng không thể hoán đổi":

```typescript
// Tạo brand
type Brand<T, B extends string> = T & { readonly __brand: B };

type UserId    = Brand<string, "UserId">;
type ProductId = Brand<string, "ProductId">;
type Email     = Brand<string, "Email">;

// Factory functions để tạo branded value
function createUserId(id: string): UserId {
  return id as UserId;
}

function createEmail(email: string): Email {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("Email không hợp lệ");
  }
  return email as Email;
}

function getUser(id: UserId): void {
  // ...
}

const userId    = createUserId("user-1");
const productId = "product-1" as ProductId;

getUser(userId);    // OK
// getUser(productId); // lỗi: ProductId không phải UserId
// getUser("user-1");  // lỗi: string không phải UserId

// Ứng dụng: đơn vị đo
type Meters  = Brand<number, "Meters">;
type Seconds = Brand<number, "Seconds">;

function speed(distance: Meters, time: Seconds): number {
  return distance / time;
}

const d = 100 as Meters;
const t = 10 as Seconds;
speed(d, t); // OK
// speed(t, d); // lỗi: hoán đổi sai thứ tự
```

---

## 14. Builder Pattern với TypeScript

```typescript
// Builder với type tracking — biết lúc nào có đủ field
type BuilderState = {
  name: boolean;
  age: boolean;
  email: boolean;
};

class UserBuilder<State extends BuilderState> {
  private data: Partial<{ name: string; age: number; email: string }> = {};

  setName(name: string): UserBuilder<State & { name: true }> {
    this.data.name = name;
    return this as any;
  }

  setAge(age: number): UserBuilder<State & { age: true }> {
    this.data.age = age;
    return this as any;
  }

  setEmail(email: string): UserBuilder<State & { email: true }> {
    this.data.email = email;
    return this as any;
  }

  // build() chỉ khả dụng khi đã set đủ 3 field
  build(
    this: UserBuilder<{ name: true; age: true; email: true }>
  ): { name: string; age: number; email: string } {
    return this.data as any;
  }
}

function createUserBuilder() {
  return new UserBuilder<{ name: false; age: false; email: false }>();
}

const user = createUserBuilder()
  .setName("An")
  .setAge(25)
  .setEmail("an@example.com")
  .build(); // OK

// createUserBuilder().setName("An").build(); // lỗi: thiếu age và email
```

---

## 15. Performance & Compiler Options

### 15.1 tsconfig.json Quan Trọng

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,

    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",

    "isolatedModules": true,
    "skipLibCheck": true,

    "incremental": true,
    "tsBuildInfoFile": ".tsbuildinfo"
  }
}
```

**Giải thích các flag ít biết:**

| Flag | Tác dụng |
|------|----------|
| `noUncheckedIndexedAccess` | `arr[0]` trả về `T \| undefined` thay vì `T` |
| `exactOptionalPropertyTypes` | Phân biệt `{ x?: string }` vs `{ x: string \| undefined }` |
| `noImplicitOverride` | Bắt buộc dùng keyword `override` khi ghi đè method |
| `isolatedModules` | Mỗi file phải compile độc lập — tương thích với esbuild/swc |

### 15.2 Tránh Type Computation Nặng

```typescript
// Tránh: union quá lớn gây chậm
type HugeUnion = "a" | "b" | "c" | /* ... 1000 strings */;

// Dùng: Record + keyof thay vì union thủ công
const STATUS_MAP = {
  active: 1,
  inactive: 2,
  pending: 3,
} as const;

type Status = keyof typeof STATUS_MAP; // "active" | "inactive" | "pending"

// Tránh: conditional type đệ quy sâu
// Giới hạn mặc định là 100 levels — có thể báo lỗi
// "Type instantiation is excessively deep"

// Giải pháp: dùng mapped type thay vì đệ quy khi có thể
```

### 15.3 Project References

Tách monorepo thành nhiều tsconfig để compile song song:

```
packages/
  core/
    tsconfig.json        ← { "composite": true }
  api/
    tsconfig.json        ← { "references": [{ "path": "../core" }] }
  web/
    tsconfig.json        ← { "references": [{ "path": "../core" }] }
tsconfig.json            ← { "references": [...all packages] }
```

```bash
# Compile toàn bộ với build mode
tsc --build

# Chỉ check không emit
tsc --build --dry

# Xóa cache
tsc --build --clean
```

---

## Tóm Tắt Kỹ Thuật Theo Mức Độ Ưu Tiên

| Kỹ thuật | Khi nào dùng |
|----------|-------------|
| Discriminated Union | Mô hình hóa state machine, API response |
| Generic Constraints | Hàm dùng được cho nhiều type nhưng vẫn an toàn |
| Mapped Types | Biến đổi hàng loạt property của interface |
| Conditional Types | Tính toán type dựa trên điều kiện |
| Template Literal Types | API type-safe, event naming, URL params |
| Branded Types | Phân biệt primitive types cùng kiểu gốc |
| Infer | Trích xuất type từ cấu trúc phức tạp |
| Decorator | AOP: logging, caching, validation |
| Module Augmentation | Mở rộng type thư viện third-party |

---

*TypeScript version: 5.x | Cập nhật: 2025*
