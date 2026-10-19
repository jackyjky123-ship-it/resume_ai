"use client";

import { useEffect, useId, useRef } from "react";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  initialFocus?: React.RefObject<HTMLInputElement | null>;
};

/** Native <dialog> so focus trapping, Esc, and inert background come for free. */
export function Modal({ open, onClose, title, children, initialFocus }: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const onCloseRef = useRef(onClose);
  const mouseDownOnBackdrop = useRef(false);

  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const handleClose = () => onCloseRef.current();
    dialog.addEventListener("close", handleClose);
    return () => dialog.removeEventListener("close", handleClose);
  }, []);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      initialFocus?.current?.focus();
      initialFocus?.current?.select();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open, initialFocus]);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      className="m-auto w-full max-w-[30rem] bg-transparent p-4"
      onMouseDown={(event) => {
        mouseDownOnBackdrop.current = event.target === event.currentTarget;
      }}
      onClick={(event) => {
        if (mouseDownOnBackdrop.current && event.target === event.currentTarget) {
          dialogRef.current?.close();
        }
        mouseDownOnBackdrop.current = false;
      }}
    >
      <div className="max-h-[85vh] overflow-y-auto rounded-2xl border border-hairline bg-white p-6 shadow-[0_30px_70px_-30px_rgba(38,38,38,0.5)]">
        <h2 id={titleId} className="font-display text-xl font-bold tracking-tight">
          {title}
        </h2>
        <div className="mt-4">{children}</div>
      </div>
    </dialog>
  );
}
