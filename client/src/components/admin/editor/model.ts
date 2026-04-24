// Pure types + form helpers shared by the editor framework.
// The field tree is recursive: object fields group sub-fields, array fields
// repeat a single item schema. Form state mirrors the tree, with every leaf
// stored as a string (coerced on submit).

interface BaseField {
  key: string;
  label: string;
  required?: boolean;
  hint?: string;
}

export interface LeafField extends BaseField {
  type: "string" | "number" | "boolean" | "json";
  // If set for a string leaf, renders a <select> instead of <input>.
  options?: readonly string[];
}

export interface ObjectField extends BaseField {
  type: "object";
  fields: readonly Field[];
}

export interface ArrayField extends BaseField {
  type: "array";
  item: Field;
}

export type Field = LeafField | ObjectField | ArrayField;

export interface Column {
  key: string;
  label: string;
  render?: (row: Record<string, unknown>) => string;
}

// Leaves are strings; containers mirror the field tree.
export type FormValue = string | FormValue[] | { [k: string]: FormValue };
export type FormState = Record<string, FormValue>;

// ── Builders / converters ──────────────────────────────────────────────
export function defaultValue(field: Field): FormValue {
  if (field.type === "object") {
    const out: Record<string, FormValue> = {};
    for (const f of field.fields) out[f.key] = defaultValue(f);
    return out;
  }
  if (field.type === "array") return [];
  if (field.type === "boolean") return "false";
  return "";
}

export function emptyForm(fields: readonly Field[]): FormState {
  const out: FormState = {};
  for (const f of fields) out[f.key] = defaultValue(f);
  return out;
}

export function formFromBody(
  fields: readonly Field[],
  body: Record<string, unknown>,
): FormState {
  const out: FormState = {};
  for (const f of fields) out[f.key] = valueToForm(f, body[f.key]);
  return out;
}

function valueToForm(field: Field, value: unknown): FormValue {
  if (field.type === "object") {
    const v = (value as Record<string, unknown> | null | undefined) ?? {};
    const out: Record<string, FormValue> = {};
    for (const f of field.fields) out[f.key] = valueToForm(f, v[f.key]);
    return out;
  }
  if (field.type === "array") {
    const v = (value as unknown[] | null | undefined) ?? [];
    return v.map((item) => valueToForm(field.item, item));
  }
  if (value === undefined || value === null) return defaultValue(field);
  if (field.type === "json") return JSON.stringify(value, null, 2);
  if (field.type === "boolean") return value ? "true" : "false";
  return String(value);
}

// Discriminated result — shared by `bodyFromForm` (T = full body) and the
// internal recursive `formToValue` (T = unknown, may be undefined for
// skipped optional fields).
export type Ok<T> = { ok: true; value: T };
export type Err = { ok: false; error: string };
export type Result<T> = Ok<T> | Err;

// Explicit guard — TS's generic-discriminated narrowing is flaky across
// language-service versions, so callers use this to pick the error branch.
export const isErr = <T>(r: Result<T>): r is Err => !r.ok;

// Validate + coerce a FormState into a wire-shaped payload. Empty-ish nodes
// are dropped so the request body only contains what the user actually set.
export function bodyFromForm(
  fields: readonly Field[],
  form: FormState,
): Result<Record<string, unknown>> {
  const out: Record<string, unknown> = {};
  for (const f of fields) {
    const r = formToValue(f, form[f.key]);
    if (isErr(r)) return r;
    if (r.value !== undefined) out[f.key] = r.value;
  }
  return { ok: true, value: out };
}

function formToValue(
  field: Field,
  raw: FormValue | undefined,
): Result<unknown> {
  if (field.type === "object") {
    const obj = (raw as Record<string, FormValue> | undefined) ?? {};
    const out: Record<string, unknown> = {};
    for (const f of field.fields) {
      const r = formToValue(f, obj[f.key]);
      if (isErr(r)) return r;
      if (r.value !== undefined) out[f.key] = r.value;
    }
    return { ok: true, value: Object.keys(out).length ? out : undefined };
  }
  if (field.type === "array") {
    const arr = (raw as FormValue[] | undefined) ?? [];
    const out: unknown[] = [];
    for (const item of arr) {
      const r = formToValue(field.item, item);
      if (isErr(r)) return r;
      if (r.value !== undefined) out.push(r.value);
    }
    return { ok: true, value: out.length ? out : undefined };
  }
  const s = ((raw as string | undefined) ?? "").trim();
  if (!s) {
    if (field.required)
      return { ok: false, error: `${field.label} is required.` };
    return { ok: true, value: undefined };
  }
  switch (field.type) {
    case "string":
      return { ok: true, value: s };
    case "number": {
      const n = Number(s);
      if (!Number.isFinite(n))
        return { ok: false, error: `${field.label} must be a number.` };
      return { ok: true, value: n };
    }
    case "boolean":
      return { ok: true, value: s === "true" };
    case "json":
      try {
        return { ok: true, value: JSON.parse(s) };
      } catch {
        return { ok: false, error: `${field.label}: invalid JSON.` };
      }
  }
}
