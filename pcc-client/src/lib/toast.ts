// Global toast emitter — usable from React components AND plain modules.
// The <Toaster /> component subscribes and renders the queue with
// daisyUI's `toast` + `alert` classes.

export type ToastKind = "success" | "error" | "info" | "warning";

export interface ToastMessage {
  id: number;
  kind: ToastKind;
  text: string;
  duration: number;
}

type Listener = (msgs: ToastMessage[]) => void;

const listeners = new Set<Listener>();
let queue: ToastMessage[] = [];
let nextId = 1;

const emit = (): void => {
  for (const fn of listeners) fn(queue);
};

export const toastBus = {
  subscribe(fn: Listener): () => void {
    listeners.add(fn);
    fn(queue);
    return () => {
      listeners.delete(fn);
    };
  },
  push(kind: ToastKind, text: string, duration = 4000): number {
    const id = nextId++;
    queue = [...queue, { id, kind, text, duration }];
    emit();
    return id;
  },
  dismiss(id: number): void {
    queue = queue.filter((m) => m.id !== id);
    emit();
  },
};

export const toast = {
  success: (text: string, duration?: number) =>
    toastBus.push("success", text, duration),
  error: (text: string, duration?: number) =>
    toastBus.push("error", text, duration ?? 6000),
  info: (text: string, duration?: number) =>
    toastBus.push("info", text, duration),
  warning: (text: string, duration?: number) =>
    toastBus.push("warning", text, duration ?? 5000),
};
