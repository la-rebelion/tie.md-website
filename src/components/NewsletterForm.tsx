import React, { startTransition, useEffect, useRef, useState } from "react";

type NewsletterFormProps = {
  onSuccess?: () => void;
};

export default function NewsletterForm({ onSuccess }: NewsletterFormProps) {
  const [email, setEmail] = useState("");
  const [showThankYou, setShowThankYou] = useState(false);
  const confirmationTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (confirmationTimer.current) clearTimeout(confirmationTimer.current);
    },
    [],
  );

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    // Keep the form in place until the native submit event has finished
    // propagating so HubSpot's non-HubSpot-form listener can collect it.
    window.setTimeout(() => setShowThankYou(true), 0);
    confirmationTimer.current = setTimeout(() => {
      onSuccess?.();
      setShowThankYou(false);
      startTransition(() => setEmail(""));
    }, 3000);
  }

  if (showThankYou) {
    return (
      <div className="tie-newsletter-thanks" role="status" aria-live="polite">
        <strong>You’re on the list.</strong>
        <span>We’ll send the useful milestones—not the noise.</span>
      </div>
    );
  }

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
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@workshop.dev"
          required
          type="email"
          value={email}
        />
      </label>
      <input
        className="tie-newsletter-submit"
        type="submit"
        value="Keep me in the loop →"
      />
      <p className="tie-newsletter-note">
        Product notes only. No noise. See how{" "}
        <a href="https://rebelion.la/privacy">
          La Rebelion Labs handles your data
        </a>
        .
      </p>
    </form>
  );
}
