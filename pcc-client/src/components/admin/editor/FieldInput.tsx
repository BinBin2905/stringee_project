import type { FC } from "react";
import { defaultValue, type Field, type FormValue } from "./model";

type Props = {
  field: Field;
  value: FormValue | undefined;
  onChange: (v: FormValue) => void;
};

const FieldInput: FC<Props> = ({ field, value, onChange }) => {
  if (field.type === "object") return <ObjectInput field={field} value={value} onChange={onChange} />;
  if (field.type === "array") return <ArrayInput field={field} value={value} onChange={onChange} />;
  return <LeafInput field={field} value={value} onChange={onChange} />;
};

const LeafInput: FC<Props> = ({ field, value, onChange }) => {
  const str = (value as string | undefined) ?? "";
  const id = `fld-${field.key}-${Math.random().toString(36).slice(2, 7)}`;

  const label = (
    <div className="label py-0.5">
      <span className="label-text text-xs">
        {field.label}
        {field.required && " *"}
        {field.hint && (
          <span className="text-base-content/50"> — {field.hint}</span>
        )}
      </span>
    </div>
  );

  if (field.type === "boolean") {
    return (
      <label className="form-control" htmlFor={id}>
        {label}
        <label className="label cursor-pointer justify-start gap-2 py-0">
          <input
            id={id}
            type="checkbox"
            className="checkbox checkbox-sm"
            checked={str === "true"}
            onChange={(e) => onChange(e.target.checked ? "true" : "false")}
          />
          <span className="label-text text-xs text-base-content/70">
            {str === "true" ? "true" : "false"}
          </span>
        </label>
      </label>
    );
  }

  if (field.type === "json") {
    return (
      <label className="form-control" htmlFor={id}>
        {label}
        <textarea
          id={id}
          className="textarea textarea-bordered font-mono text-xs"
          rows={3}
          value={str}
          onChange={(e) => onChange(e.target.value)}
        />
      </label>
    );
  }

  if (field.type === "string" && field.options) {
    return (
      <label className="form-control" htmlFor={id}>
        {label}
        <select
          id={id}
          className="select select-bordered select-sm"
          value={str}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="">—</option>
          {field.options.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      </label>
    );
  }

  return (
    <label className="form-control" htmlFor={id}>
      {label}
      <input
        id={id}
        type={field.type === "number" ? "number" : "text"}
        className="input input-bordered input-sm"
        value={str}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
};

const ObjectInput: FC<Props> = ({ field, value, onChange }) => {
  if (field.type !== "object") return null;
  const obj = (value as Record<string, FormValue> | undefined) ?? {};
  return (
    <fieldset className="border border-base-300 rounded-box p-3 col-span-full">
      <legend className="text-xs px-1 text-base-content/70">
        {field.label}
        {field.hint && (
          <span className="text-base-content/50"> — {field.hint}</span>
        )}
      </legend>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {field.fields.map((child) => (
          <FieldInput
            key={child.key}
            field={child}
            value={obj[child.key]}
            onChange={(v) => onChange({ ...obj, [child.key]: v })}
          />
        ))}
      </div>
    </fieldset>
  );
};

const ArrayInput: FC<Props> = ({ field, value, onChange }) => {
  if (field.type !== "array") return null;
  const arr = (value as FormValue[] | undefined) ?? [];
  return (
    <fieldset className="border border-base-300 rounded-box p-3 col-span-full space-y-2">
      <legend className="text-xs px-1 text-base-content/70">
        {field.label}
        {field.hint && (
          <span className="text-base-content/50"> — {field.hint}</span>
        )}
      </legend>
      {arr.length === 0 && (
        <div className="text-xs text-base-content/50">No items.</div>
      )}
      {arr.map((item, i) => (
        <div key={i} className="flex items-start gap-2">
          <div className="flex-1">
            <FieldInput
              field={{ ...field.item, label: `#${i + 1}` }}
              value={item}
              onChange={(v) => {
                const next = arr.slice();
                next[i] = v;
                onChange(next);
              }}
            />
          </div>
          <button
            type="button"
            className="btn btn-ghost btn-xs text-error mt-5"
            onClick={() => onChange(arr.filter((_, j) => j !== i))}
            aria-label="Remove item"
          >
            ✕
          </button>
        </div>
      ))}
      <button
        type="button"
        className="btn btn-outline btn-xs"
        onClick={() => onChange([...arr, defaultValue(field.item)])}
      >
        + Add
      </button>
    </fieldset>
  );
};

export default FieldInput;
