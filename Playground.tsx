import { useState, useCallback, useRef, useEffect } from "react";

const EXAMPLES = {
  "Biến & Type": `// Khai báo biến
let count: number = 0;
const name: string = "An";
let active: boolean = true;
let items: number[] = [1, 2, 3];

console.log("count:", count);
console.log("name:", name);
console.log("typeof name:", typeof name);
console.log("items:", items);

// Nullish coalescing
let x: string | null = null;
console.log("x ?? 'fallback':", x ?? "fallback");

// Optional chaining
let user: { name?: string; address?: { city: string } } = { name: "An" };
console.log("user?.address?.city:", user?.address?.city);`,

  "String": `const s = "Hello World";

console.log("length:", s.length);
console.log("upper:", s.toUpperCase());
console.log("split:", s.split(" "));
console.log("includes 'World':", s.includes("World"));
console.log("slice(0,5):", s.slice(0, 5));
console.log("replace:", s.replace("World", "Stringee"));

// Template literal
const name = "An";
const age = 25;
console.log(\`\${name} tuổi \${age}\`);
console.log(\`Tính: \${age >= 18 ? "đủ tuổi" : "chưa đủ"}\`);`,

  "Array": `const arr = [1, 2, 3, 4, 5];

console.log("map x2:", arr.map(x => x * 2));
console.log("filter >2:", arr.filter(x => x > 2));
console.log("reduce sum:", arr.reduce((s, x) => s + x, 0));
console.log("find >3:", arr.find(x => x > 3));
console.log("some >4:", arr.some(x => x > 4));
console.log("every >0:", arr.every(x => x > 0));

// Destructuring
const [first, second, ...rest] = arr;
console.log("first:", first, "rest:", rest);

// Spread
const arr2 = [...arr, 6, 7];
console.log("spread:", arr2);

// Loại trùng
console.log("unique:", [...new Set([1,1,2,2,3])]);`,

  "Object": `const user = {
  name: "An",
  age: 25,
  address: { city: "HCM" },
};

console.log("keys:", Object.keys(user));
console.log("values:", Object.values(user));
console.log("entries:", Object.entries(user));

// Destructuring
const { name, age, address: { city } } = user;
console.log("destructured:", name, age, city);

// Spread merge
const updated = { ...user, age: 30, email: "an@mail.com" };
console.log("merged:", updated);

// Optional chaining
console.log("user?.address?.city:", user?.address?.city);
console.log("user?.company?.name:", (user as any)?.company?.name);`,

  "Function": `// Arrow function
const add = (a: number, b: number): number => a + b;
console.log("add(2,3):", add(2, 3));

// Default params
const greet = (name: string = "bạn") => \`Xin chào \${name}\`;
console.log(greet());
console.log(greet("An"));

// Rest params
const sum = (...nums: number[]) => nums.reduce((a, b) => a + b, 0);
console.log("sum(1,2,3,4):", sum(1, 2, 3, 4));

// Function là giá trị
let action: ((msg: string) => void) | null = null;
action = (msg) => console.log("Action:", msg);
action?.("hello");
action = null;
action?.("sẽ không chạy");

// Return function (closure)
const multiplier = (factor: number) => (n: number) => n * factor;
const double = multiplier(2);
const triple = multiplier(3);
console.log("double(5):", double(5));
console.log("triple(5):", triple(5));`,

  "Async/Await": `// Simulate API call
const fakeApi = (data: string, ms: number): Promise<string> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(\`Response: \${data}\`), ms);
  });
};

// Async/Await
const fetchData = async () => {
  console.log("Bắt đầu fetch...");
  const result = await fakeApi("user data", 500);
  console.log(result);

  // Promise.all — song song
  const [a, b] = await Promise.all([
    fakeApi("API 1", 300),
    fakeApi("API 2", 200),
  ]);
  console.log("Song song:", a, b);
};

fetchData();`,

  "Destructuring": `// Array
const [a, b, ...rest] = [1, 2, 3, 4, 5];
console.log("a:", a, "b:", b, "rest:", rest);

// Bỏ qua phần tử
const [first, , third] = [1, 2, 3];
console.log("first:", first, "third:", third);

// Swap
let x = 1, y = 2;
[x, y] = [y, x];
console.log("swap: x =", x, "y =", y);

// Object
const { name, age, ...others } = { name: "An", age: 25, city: "HCM", job: "dev" };
console.log("name:", name, "others:", others);

// Đổi tên
const { name: userName } = { name: "Bình" };
console.log("userName:", userName);

// Default value
const { email = "none" } = { name: "An" };
console.log("email:", email);

// Nested
const { address: { city } } = { address: { city: "HCM" } };
console.log("city:", city);

// Function params
const printUser = ({ name, age }: { name: string; age: number }) => {
  console.log(\`\${name}, \${age} tuổi\`);
};
printUser({ name: "An", age: 25 });`,

  "Spread & Merge": `// Array spread
const a = [1, 2];
const b = [3, 4];
const merged = [...a, ...b, 5];
console.log("array merge:", merged);

// Object spread
const defaults = { timeout: 60, format: "mp3", record: false };
const custom = { timeout: 30, record: true };
const final = { ...defaults, ...custom };
console.log("object merge:", final);
console.log("→ custom ghi đè defaults");

// Clone
const original = { a: 1, b: { c: 2 } };
const shallow = { ...original };
shallow.a = 99;
console.log("original.a:", original.a, "← không bị ảnh hưởng");
shallow.b.c = 99;
console.log("original.b.c:", original.b.c, "← BỊ ảnh hưởng (shallow copy)");

// Deep clone
const deep = JSON.parse(JSON.stringify(original));
deep.b.c = 999;
console.log("sau deep clone, original.b.c:", original.b.c, "← không bị ảnh hưởng");`,

  "TypeScript Types": `// Union type
type ID = string | number;
const id1: ID = "abc";
const id2: ID = 123;
console.log("id1:", id1, "id2:", id2);

// Literal union
type Status = "idle" | "calling" | "ringing" | "answered" | "ended";
let status: Status = "idle";
console.log("status:", status);

// Interface
interface User {
  name: string;
  age: number;
  email?: string;  // optional
}
const user: User = { name: "An", age: 25 };
console.log("user:", user);

// Generic
function first<T>(arr: T[]): T | undefined {
  return arr[0];
}
console.log("first number:", first([1, 2, 3]));
console.log("first string:", first(["a", "b"]));

// Discriminated union
type Action =
  | { action: "record"; format: string }
  | { action: "connect"; to: string }
  | { action: "talk"; text: string };

function handle(a: Action) {
  switch (a.action) {
    case "record": return console.log("Record:", a.format);
    case "connect": return console.log("Connect to:", a.to);
    case "talk": return console.log("Say:", a.text);
  }
}
handle({ action: "record", format: "mp3" });
handle({ action: "talk", text: "Xin chào" });`,

  "Callback Pattern": `// Callback bridge — pattern dùng trong Stringee SDK
type Handler = ((data: { from: string; to: string }) => void) | null;

// Biến toàn cục — bridge
let onIncomingCall: Handler = null;

// React đăng ký callback
const setHandler = (cb: Handler) => { onIncomingCall = cb; };

// Simulate: React đăng ký
setHandler((call) => {
  console.log("React nhận cuộc gọi:", call);
});

// Simulate: SDK fire event
console.log("SDK: có cuộc gọi đến...");
onIncomingCall?.({ from: "0901234567", to: "agent_01" });

// Simulate: hủy đăng ký
setHandler(null);
onIncomingCall?.({ from: "099", to: "agent" });
console.log("Sau hủy: không có gì chạy");`,

  "Error Handling": `// try/catch/finally
try {
  const data = JSON.parse('{"valid": true}');
  console.log("Parsed:", data);
} catch (err) {
  console.error("Parse failed");
} finally {
  console.log("Finally luôn chạy");
}

// Error type check
try {
  JSON.parse("invalid json!!!");
} catch (err: unknown) {
  if (err instanceof SyntaxError) {
    console.log("SyntaxError:", err.message);
  } else if (err instanceof Error) {
    console.log("Error:", err.message);
  } else {
    console.log("Unknown error");
  }
}

// Custom error
class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

try {
  throw new ApiError(401, "Token hết hạn");
} catch (err) {
  if (err instanceof ApiError) {
    console.log(\`\${err.name} \${err.status}: \${err.message}\`);
  }
}`,

  "Timing": `console.log("1. Sync — chạy ngay");

setTimeout(() => {
  console.log("3. setTimeout 0ms — chạy SAU sync");
}, 0);

Promise.resolve().then(() => {
  console.log("2. Promise — chạy sau sync, TRƯỚC setTimeout");
});

console.log("1.5. Sync — cũng chạy ngay");

// Thứ tự: Sync → Microtask (Promise) → Macrotask (setTimeout)`,
};

type ExampleKey = keyof typeof EXAMPLES;

export default function Playground() {
  const [code, setCode] = useState(EXAMPLES["Biến & Type"]);
  const [output, setOutput] = useState<string[]>([]);
  const [running, setRunning] = useState(false);
  const [activeTab, setActiveTab] = useState<ExampleKey>("Biến & Type");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const runCode = useCallback(() => {
    setRunning(true);
    setOutput([]);
    const logs: string[] = [];

    const originalConsole = {
      log: console.log,
      error: console.error,
      warn: console.warn,
    };

    const formatArg = (arg: unknown): string => {
      if (arg === null) return "null";
      if (arg === undefined) return "undefined";
      if (typeof arg === "object") {
        try {
          return JSON.stringify(arg, null, 2);
        } catch {
          return String(arg);
        }
      }
      return String(arg);
    };

    const capture =
      (prefix: string) =>
      (...args: unknown[]) => {
        const line = args.map(formatArg).join(" ");
        logs.push(prefix ? `${prefix} ${line}` : line);
        setOutput([...logs]);
      };

    console.log = capture("");
    console.error = capture("❌");
    console.warn = capture("⚠️");

    try {
      const cleanCode = code
        .replace(/:\s*(string|number|boolean|void|unknown|any|null)\b/g, "")
        .replace(/:\s*(string|number|boolean)\[\]/g, "")
        .replace(/<[A-Z]\w*>/g, "")
        .replace(/\bas\s+\w+/g, "")
        .replace(/interface\s+\w+\s*\{[^}]*\}/g, "")
        .replace(/type\s+\w+\s*=[^;]+;/g, "")
        .replace(
          /class\s+\w+\s+extends\s+Error\s*\{[^}]*constructor\s*\([^)]*\)\s*\{[^}]*\}[^}]*\}/g,
          (match) => match.replace(/public\s+/g, ""),
        )
        .replace(/\bpublic\s+/g, "")
        .replace(/\bprivate\s+/g, "")
        .replace(/\bprotected\s+/g, "")
        .replace(/\breadonly\s+/g, "")
        .replace(/\boverride\s+/g, "");

      const asyncWrapped = `(async () => { ${cleanCode} })()`;
      const result = eval(asyncWrapped);

      if (result instanceof Promise) {
        result
          .then(() => {
            setTimeout(() => {
              setOutput([...logs]);
              setRunning(false);
            }, 600);
          })
          .catch((err: Error) => {
            logs.push(`❌ ${err.message}`);
            setOutput([...logs]);
            setRunning(false);
          });
      } else {
        setTimeout(() => setRunning(false), 100);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      logs.push(`❌ ${msg}`);
      setOutput([...logs]);
      setRunning(false);
    } finally {
      console.log = originalConsole.log;
      console.error = originalConsole.error;
      console.warn = originalConsole.warn;
    }
  }, [code]);

  const selectExample = (key: ExampleKey) => {
    setActiveTab(key);
    setCode(EXAMPLES[key]);
    setOutput([]);
  };

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        runCode();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [runCode]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
    }
  }, [code]);

  return (
    <div className="min-h-screen bg-white font-mono text-black">
      {/* Header */}
      <header className="border-b border-gray-200 px-4 py-3">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-widest">
            JS / TS Playground
          </span>
          <span className="text-[11px] text-gray-400">Ctrl+Enter để chạy</span>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-4 py-4">
        {/* Tabs */}
        <div className="mb-4 flex flex-wrap gap-1">
          {Object.keys(EXAMPLES).map((key) => (
            <button
              key={key}
              onClick={() => selectExample(key as ExampleKey)}
              className={`rounded px-2.5 py-1 text-[11px] transition ${
                activeTab === key
                  ? "bg-black text-white"
                  : "border border-gray-200 text-gray-500 hover:border-gray-400"
              }`}
            >
              {key}
            </button>
          ))}
        </div>

        {/* Editor + Output */}
        <div className="grid gap-4 lg:grid-cols-2">
          {/* Code editor */}
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">
                Code
              </label>
              <button
                onClick={runCode}
                disabled={running}
                className="flex items-center gap-1.5 rounded bg-black px-3 py-1 text-[11px] font-medium text-white transition hover:bg-gray-800 disabled:opacity-40"
              >
                {running ? (
                  <>
                    <span className="h-2.5 w-2.5 animate-spin rounded-full border border-gray-500 border-t-white" />
                    Đang chạy...
                  </>
                ) : (
                  <>▶ Chạy</>
                )}
              </button>
            </div>
            <textarea
              ref={textareaRef}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              spellCheck={false}
              className="min-h-[300px] w-full resize-none overflow-hidden rounded border border-gray-200 bg-gray-50 p-3 font-mono text-[12px] leading-relaxed text-gray-800 outline-none transition focus:border-black"
            />
          </div>

          {/* Output */}
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">
                Output
              </label>
              {output.length > 0 && (
                <button
                  onClick={() => setOutput([])}
                  className="text-[11px] text-gray-400 hover:text-gray-600"
                >
                  Clear
                </button>
              )}
            </div>
            <div className="min-h-[300px] rounded border border-gray-200 bg-gray-50 p-3">
              {output.length === 0 ? (
                <span className="text-[11px] text-gray-300">
                  Nhấn ▶ Chạy hoặc Ctrl+Enter...
                </span>
              ) : (
                <div className="space-y-0.5">
                  {output.map((line, i) => (
                    <div
                      key={i}
                      className={`whitespace-pre-wrap font-mono text-[12px] leading-relaxed ${
                        line.startsWith("❌")
                          ? "text-red-600"
                          : line.startsWith("⚠️")
                            ? "text-yellow-600"
                            : "text-gray-700"
                      }`}
                    >
                      <span className="mr-2 select-none text-gray-300">
                        {String(i + 1).padStart(2)}
                      </span>
                      {line}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick reference */}
        <div className="mt-6 border-t border-gray-100 pt-4">
          <label className="mb-2 block text-[10px] font-semibold uppercase tracking-widest text-gray-400">
            Quick Reference
          </label>
          <div className="grid grid-cols-2 gap-2 text-[11px] text-gray-500 md:grid-cols-4">
            <div className="rounded border border-gray-100 p-2">
              <span className="font-semibold text-gray-700">??</span>
              <span className="ml-1">nullish coalescing</span>
              <div className="mt-0.5 text-gray-400">null/undefined → fallback</div>
            </div>
            <div className="rounded border border-gray-100 p-2">
              <span className="font-semibold text-gray-700">?.</span>
              <span className="ml-1">optional chaining</span>
              <div className="mt-0.5 text-gray-400">null → undefined, no crash</div>
            </div>
            <div className="rounded border border-gray-100 p-2">
              <span className="font-semibold text-gray-700">...</span>
              <span className="ml-1">spread / rest</span>
              <div className="mt-0.5 text-gray-400">tách / gom phần tử</div>
            </div>
            <div className="rounded border border-gray-100 p-2">
              <span className="font-semibold text-gray-700">as</span>
              <span className="ml-1">type assertion</span>
              <div className="mt-0.5 text-gray-400">ép kiểu TypeScript</div>
            </div>
            <div className="rounded border border-gray-100 p-2">
              <span className="font-semibold text-gray-700">=&gt;</span>
              <span className="ml-1">arrow function</span>
              <div className="mt-0.5 text-gray-400">(x) =&gt; x * 2</div>
            </div>
            <div className="rounded border border-gray-100 p-2">
              <span className="font-semibold text-gray-700">typeof</span>
              <span className="ml-1">check kiểu runtime</span>
              <div className="mt-0.5 text-gray-400">"string" "number" ...</div>
            </div>
            <div className="rounded border border-gray-100 p-2">
              <span className="font-semibold text-gray-700">instanceof</span>
              <span className="ml-1">check class</span>
              <div className="mt-0.5 text-gray-400">err instanceof Error</div>
            </div>
            <div className="rounded border border-gray-100 p-2">
              <span className="font-semibold text-gray-700">keyof</span>
              <span className="ml-1">union of keys</span>
              <div className="mt-0.5 text-gray-400">keyof User → "name"|"age"</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
