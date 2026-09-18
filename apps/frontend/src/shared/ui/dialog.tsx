import {
  useEffect,
  useId,
  useRef,
  type ReactNode,
  type RefObject,
} from 'react';
import type { DialogConfiguration } from './generated/dialog';
import { Button } from './button';

// Callbacks and DOM references are technical bindings. The caller owns the request and draft.
export function Dialog({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel,
  pending = false,
  error,
  children,
  onConfirm,
  onClose,
  returnFocusRef,
}: DialogConfiguration & {
  children?: ReactNode;
  onConfirm: () => void;
  onClose: () => void;
  returnFocusRef?: RefObject<HTMLElement | null>;
}) {
  const id = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    const dialog = dialogRef.current!;
    const trigger = document.activeElement;
    const fallback = returnFocusRef?.current;
    dialog.showModal();
    cancelRef.current!.focus();
    return () => {
      dialog.close();
      const target =
        trigger instanceof HTMLElement && trigger.isConnected
          ? trigger
          : fallback;
      target?.focus();
    };
  }, [open, returnFocusRef]);
  return (
    <dialog
      ref={dialogRef}
      className="mm-dialog"
      aria-labelledby={`${id}-title`}
      aria-describedby={description ? `${id}-description` : undefined}
      onKeyDown={(event) => {
        if (event.key !== 'Tab') return;
        const items = [
          ...event.currentTarget.querySelectorAll<HTMLElement>(
            'button, a[href], input, select, textarea, [tabindex]',
          ),
        ].filter(
          (node) =>
            node.tabIndex >= 0 &&
            !node.matches(':disabled') &&
            node.getClientRects().length > 0,
        );
        // The scroll region and safe action always provide focusable endpoints.
        const first = items[0]!;
        const last = items.at(-1)!;
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClose={(event) => {
        if (open && !event.currentTarget.open) onClose();
      }}
    >
      <div className="mm-dialog-layout">
        <h2 id={`${id}-title`} className="mm-dialog-title">
          {title}
        </h2>
        <div className="mm-dialog-content" tabIndex={0}>
          {description && <p id={`${id}-description`}>{description}</p>}
          {children}
          <p className="mm-dialog-error" role="alert">
            {error}
          </p>
        </div>
        <div className="mm-dialog-actions">
          <Button
            ref={cancelRef}
            label={cancelLabel}
            variant="secondary"
            onClick={onClose}
          />
          <Button label={confirmLabel} loading={pending} onClick={onConfirm} />
        </div>
      </div>
    </dialog>
  );
}
