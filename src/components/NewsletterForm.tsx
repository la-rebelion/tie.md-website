import React, { startTransition, useEffect, useRef, useState } from "react";
import { loadHubSpot } from "../lib/consent";

type NewsletterFormProps = {
  onSuccess?: () => void;
};

type HubSpotState = "idle" | "loading" | "ready" | "error";

export default function NewsletterForm({ onSuccess }: NewsletterFormProps) {
  const [email, setEmail] = useState("");
  const [showThankYou, setShowThankYou] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [hubSpotState, setHubSpotState] = useState<HubSpotState>("idle");
  const confirmationTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (confirmationTimer.current) clearTimeout(confirmationTimer.current);
    },
    [],
  );

  function prepareHubSpot() {
    if (hubSpotState === "loading" || hubSpotState === "ready") return;
    setHubSpotState("loading");
    setError("");
    void loadHubSpot()
      .then(() => setHubSpotState("ready"))
      .catch(() => {
        setHubSpotState("error");
        setError(
          "We couldn’t reach HubSpot. Check your privacy blocker, then edit the email to retry.",
        );
      });
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (hubSpotState !== "ready" || submitting) return;

    setSubmitting(true);
    setError("");
    // Keep the form in place until the trusted user submit has propagated to
    // HubSpot's listener, then replace it with the confirmation.
    window.setTimeout(() => {
      setShowThankYou(true);
      confirmationTimer.current = setTimeout(() => {
        onSuccess?.();
        setShowThankYou(false);
        setSubmitting(false);
        startTransition(() => setEmail(""));
      }, 3000);
    }, 0);
  }

  if (showThankYou) {
    return (
      <div className="tie-newsletter-thanks" role="status" aria-live="polite">
        <strong>You’re on the list.</strong>
        <span>We’ll send the useful milestones—not the noise.</span>
      </div>
    );
  }

  const submitLabel = submitting
    ? "Joining…"
    : hubSpotState === "ready"
      ? "Keep me in the loop →"
      : hubSpotState === "error"
        ? "HubSpot unavailable"
        : email
          ? "Connecting…"
          : "Enter your email";

  return (
    <form
      action="#"
      className="tie-newsletter-form"
      method="post"
      name="tie-md-newsletter"
      onSubmit={handleSubmit}
    >
      <label className="tie-newsletter-field" htmlFor="tie-newsletter-email">
        <span>Email address</span>
        <input
          autoComplete="email"
          id="tie-newsletter-email"
          name="email"
          onChange={(event) => {
            setEmail(event.target.value);
            prepareHubSpot();
          }}
          placeholder="you@workshop.dev"
          required
          type="email"
          value={email}
        />
      </label>
      <input
        className="tie-newsletter-submit"
        disabled={hubSpotState !== "ready" || submitting}
        type="submit"
        value={submitLabel}
      />
      {error ? (
        <p className="tie-newsletter-error" role="alert">
          {error}
        </p>
      ) : null}
      <p className="tie-newsletter-note">
        Product notes only. Entering your email connects this form to HubSpot.
        See how{" "}
        <a href="https://rebelion.la/privacy">
          La Rebelion Labs handles your data
        </a>
        .
      </p>
    </form>
  );
}
