import Link from "@docusaurus/Link";
import React, { useEffect, useState } from "react";
import { CONSENT_EVENT, readConsent, writeConsent } from "../lib/consent";

/** Non-modal consent region: the site is fully usable without answering it. */
export default function ConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const sync = () => setVisible(readConsent() === undefined);
    sync();
    window.addEventListener(CONSENT_EVENT, sync);
    return () => window.removeEventListener(CONSENT_EVENT, sync);
  }, []);

  if (!visible) return null;
  return (
    <section className="tie-consent" aria-label="Analytics consent">
      <p>
        tie.md itself never phones home. This website would like to use Google
        Tag Manager and HubSpot analytics to learn which pages help. Nothing
        loads unless you accept. <Link to="/privacy">Privacy details</Link>
      </p>
      <div className="tie-consent-actions">
        <button
          type="button"
          className="button button--secondary"
          onClick={() => writeConsent("denied")}
        >
          Decline
        </button>
        <button
          type="button"
          className="button button--primary"
          onClick={() => writeConsent("granted")}
        >
          Accept analytics
        </button>
      </div>
    </section>
  );
}
