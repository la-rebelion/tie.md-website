/**
 * Consent-gated analytics. Nothing third-party loads until the visitor accepts:
 * Google Tag Manager and HubSpot tracking are injected only after an explicit "Accept",
 * and the choice can be changed at any time from /privacy.
 */
export const CONSENT_KEY = "tie-analytics-consent";
export const CONSENT_EVENT = "tie-consent-change";
export const GTM_ID = "GTM-MSVN7V57";
export const HUBSPOT_ID = "21339207";

export type Consent = "granted" | "denied";

declare global {
  interface Window {
    dataLayer?: unknown[];
    _hsq?: unknown[];
  }
}

export function readConsent(): Consent | undefined {
  try {
    const value = window.localStorage.getItem(CONSENT_KEY);
    return value === "granted" || value === "denied" ? value : undefined;
  } catch {
    return undefined;
  }
}

export function writeConsent(value: Consent | undefined) {
  try {
    if (value) window.localStorage.setItem(CONSENT_KEY, value);
    else window.localStorage.removeItem(CONSENT_KEY);
  } catch {
    // Storage blocked: the choice applies to this page view only.
  }
  window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: value }));
  if (value === "granted") loadAnalytics();
  // Withdrawing consent stops tracking from the next page load (scripts already running
  // cannot be unloaded), so reload to guarantee a clean state.
  if (value !== "granted" && analyticsLoaded()) window.location.reload();
}

function analyticsLoaded() {
  return Boolean(document.getElementById("tie-gtm"));
}

function inject(id: string, src: string) {
  if (document.getElementById(id)) return;
  const script = document.createElement("script");
  script.id = id;
  script.async = true;
  script.src = src;
  document.head.appendChild(script);
}

export function loadAnalytics() {
  if (analyticsLoaded()) return;
  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push({ "gtm.start": Date.now(), event: "gtm.js" });
  inject("tie-gtm", `https://www.googletagmanager.com/gtm.js?id=${GTM_ID}`);
  inject("hs-script-loader", `https://js.hs-scripts.com/${HUBSPOT_ID}.js`);
}
