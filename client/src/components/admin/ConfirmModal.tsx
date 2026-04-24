import type { FC, ReactNode } from "react";

type Props = {
  open: boolean;
  title: string;
  body: ReactNode;
  confirmLabel?: string;
  danger?: boolean;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

const ConfirmModal: FC<Props> = ({
  open,
  title,
  body,
  confirmLabel = "Confirm",
  danger,
  busy,
  onConfirm,
  onCancel,
}) => {
  if (!open) return null;
  return (
    <dialog className="modal modal-open">
      <div className="modal-box max-w-lg">
        <h3 className="font-bold text-base">{title}</h3>
        <div className="py-3 text-sm">{body}</div>
        <div className="modal-action">
          <button
            className="btn btn-ghost btn-sm"
            onClick={onCancel}
            disabled={busy}
          >
            Cancel
          </button>
          <button
            className={`btn btn-sm ${danger ? "btn-error" : "btn-primary"}`}
            onClick={onConfirm}
            disabled={busy}
          >
            {busy ? (
              <span className="loading loading-spinner loading-xs" />
            ) : (
              confirmLabel
            )}
          </button>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button onClick={onCancel}>close</button>
      </form>
    </dialog>
  );
};

export default ConfirmModal;
