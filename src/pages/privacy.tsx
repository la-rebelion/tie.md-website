import Layout from "@theme/Layout";
import Link from "@docusaurus/Link";
import React, { useEffect, useState } from "react";
import {
  CONSENT_EVENT,
  type Consent,
  readConsent,
  writeConsent,
} from "../lib/consent";

function ConsentControls() {
  const [consent, setConsent] = useState<Consent | undefined>();
  useEffect(() => {
    const sync = () => setConsent(readConsent());
    sync();
    window.addEventListener(CONSENT_EVENT, sync);
    return () => window.removeEventListener(CONSENT_EVENT, sync);
  }, []);
  const label =
    consent === "granted"
      ? "Analytics are allowed on this browser."
      : consent === "denied"
        ? "Analytics are declined on this browser."
        : "You have not chosen yet; no analytics are loaded.";
  return (
    <div className="tie-consent-inline">
      <p role="status">{label}</p>
      <div className="tie-consent-actions">
        <button
          type="button"
          className="button button--secondary"
          onClick={() => writeConsent("denied")}
          disabled={consent === "denied"}
        >
          Decline analytics
        </button>
        <button
          type="button"
          className="button button--primary"
          onClick={() => writeConsent("granted")}
          disabled={consent === "granted"}
        >
          Allow analytics
        </button>
      </div>
    </div>
  );
}

export default function Privacy() {
  return (
    <Layout
      title="Privacy"
      description="What the tie.md product and the tie.md website collect, and how to change your analytics choice."
    >
      <main className="container margin-vert--xl tie-prose">
        <h1>Privacy</h1>
        <p>
          There are two different things here: the <strong>tie.md tool</strong>{" "}
          you install, and <strong>this website</strong>. They have different
          privacy behavior, so they are described separately.
        </p>

        <h2>The tie.md tool</h2>
        <ul>
          <li>
            Runs on your machine and binds to <code>127.0.0.1</code> by default.
          </li>
          <li>
            Needs no tie.md account and uploads no repository content to a
            tie.md service.
          </li>
          <li>
            Has no telemetry in this release. Any future telemetry will be
            opt-in and list the exact fields sent.
          </li>
          <li>
            The coding agent you choose (for example Claude Code or Codex) has
            its own network and privacy behavior, which tie.md shows but cannot
            change. See{" "}
            <Link to="/docs/safety-and-local-first">
              Safety and local-first operation
            </Link>
            .
          </li>
        </ul>

        <h2>This website</h2>
        <p>
          The site is static and works without JavaScript. Fonts are served from
          tie.md itself. With your permission only, it loads:
        </p>
        <ul>
          <li>
            <strong>Google Tag Manager / Google Analytics</strong>: page views
            and basic device information, with IP anonymization.
          </li>
          <li>
            <strong>HubSpot</strong> (La Rebelion Labs account): page views and
            a visitor cookie, used to understand interest in tie.md.
          </li>
        </ul>
        <p>
          If you decline or never answer, neither is loaded for passive
          analytics and no tracking cookies are set. Your choice is stored only
          in your browser (<code>localStorage</code>).
        </p>
        <ConsentControls />

        <h2>Newsletter</h2>
        <p>
          When you begin entering an email in the newsletter form, the site
          loads the La Rebelion Labs HubSpot collector so it is ready before you
          submit. It sends the email address only when you submit the form. This
          happens even if you declined passive analytics because it is necessary
          to complete the subscription you requested. You can unsubscribe from
          any message.
        </p>

        <h2>Contact</h2>
        <p>
          Questions: open an issue at{" "}
          <Link href="https://github.com/la-rebelion/tie.md-website/issues">
            github.com/la-rebelion/tie.md-website
          </Link>
          .
        </p>
      </main>
    </Layout>
  );
}
