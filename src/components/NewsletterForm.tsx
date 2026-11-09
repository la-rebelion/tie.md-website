import React from "react";

const subscribeUrl = "https://go.rebelion.la/subscribe";

export default function NewsletterForm() {
  return (
    <form
      action={subscribeUrl}
      className="tie-newsletter-form"
      method="get"
      name="tie-md-newsletter"
    >
      <label className="tie-newsletter-field" htmlFor="tie-newsletter-email">
        <span>Email address</span>
        <input
          autoComplete="email"
          id="tie-newsletter-email"
          name="email"
          placeholder="you@workshop.dev"
          required
          type="email"
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
