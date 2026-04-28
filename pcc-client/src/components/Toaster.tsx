import { useEffect, useState, type FC } from "react";
import { toastBus, type ToastMessage } from "@/lib/toast";

const KIND_CLASS: Record<ToastMessage["kind"], string> = {
  success: "alert-success",
  error: "alert-error",
  info: "alert-info",
  warning: "alert-warning",
};

const ICON: Record<ToastMessage["kind"], string> = {
  success: "✓",
  error: "✕",
  info: "i",
  warning: "!",
};

const Toaster: FC = () => {
  const [msgs, setMsgs] = useState<ToastMessage[]>([]);

  useEffect(() => toastBus.subscribe(setMsgs), []);

  useEffect(() => {
    const timers = msgs.map((m) =>
      window.setTimeout(() => toastBus.dismiss(m.id), m.duration),
    );
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [msgs]);

  if (msgs.length === 0) return null;

  return (
    <div className="toast toast-end toast-bottom z-50">
      {msgs.map((m) => (
        <div
          key={m.id}
          role="alert"
          className={`alert ${KIND_CLASS[m.kind]} shadow-lg max-w-sm`}
        >
          <span aria-hidden className="font-bold">
            {ICON[m.kind]}
          </span>
          <span className="text-xs leading-snug break-words">{m.text}</span>
          <button
            className="btn btn-ghost btn-xs btn-circle"
            onClick={() => toastBus.dismiss(m.id)}
            aria-label="Dismiss"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
};

export default Toaster;
