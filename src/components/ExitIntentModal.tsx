import React, { useEffect, useRef, useState } from "react";
import NewsletterForm from "./NewsletterForm";

const STORAGE_KEY = "tie-exit-intent-dismissed-at";
const COOLDOWN_MS = 14 * 24 * 60 * 60 * 1000;

export default function ExitIntentModal() {
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (window.innerWidth < 960) return;

    const dismissedAt = Number.parseInt(
      window.localStorage.getItem(STORAGE_KEY) ?? "0",
      10,
    );
    if (
      Number.isFinite(dismissedAt) &&
      Date.now() - dismissedAt < COOLDOWN_MS
    ) {
      return;
    }

    let triggered = false;
    const handleExit = (event: MouseEvent) => {
      if (triggered || event.relatedTarget !== null || event.clientY > 10)
        return;
      triggered = true;
      previousFocusRef.current = document.activeElement as HTMLElement | null;
      setOpen(true);
    };

    document.addEventListener("mouseout", handleExit);
    return () => document.removeEventListener("mouseout", handleExit);
  }, []);

  useEffect(() => {
    if (!open) return;

    const bodyOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogRef.current
      ?.querySelector<HTMLInputElement>('input[type="email"]')
      ?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        dismiss();
        return;
      }

      if (event.key !== "Tab" || !dialogRef.current) return;
      const focusable = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(
          "a[href], button:not([disabled]), input:not([disabled])",
        ),
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = bodyOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  function dismiss() {
    window.localStorage.setItem(STORAGE_KEY, String(Date.now()));
    setOpen(false);
    window.requestAnimationFrame(() => previousFocusRef.current?.focus());
  }

  return (
    <div
      aria-hidden={!open}
      className="tie-modal-backdrop"
      hidden={!open}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) dismiss();
      }}
    >
      <div
        aria-labelledby="tie-exit-title"
        aria-modal="true"
        className="tie-modal"
        ref={dialogRef}
        role="dialog"
      >
        <button
          aria-label="Close newsletter dialog"
          className="tie-modal-close"
          onClick={dismiss}
          type="button"
        >
          <span aria-hidden="true">×</span>
        </button>
        <img
          alt=""
          aria-hidden="true"
          className="tie-modal-mark"
          height="64"
          src="/img/tie-mark.svg"
          width="64"
        />
        <p className="tie-modal-eyebrow">Before you untie</p>
        <h2 id="tie-exit-title">Follow the build, not the hype.</h2>
        <p className="tie-modal-copy">
          tie.md is being shaped in the open. Get the useful milestones, early
          previews, and field notes as the control plane comes together.
        </p>
        <NewsletterForm onSuccess={dismiss} />
      </div>
    </div>
  );
}
