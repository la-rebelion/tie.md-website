/**
 * Consent-gated analytics. Google Tag Manager and passive HubSpot tracking load
 * after an explicit "Accept". HubSpot may also load when a visitor explicitly
 * submits the newsletter form so it can receive that requested submission.
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
  return Boolean(
    document.getElementById("tie-gtm") ||
    document.getElementById("hs-script-loader"),
  );
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
  if (!document.getElementById("tie-gtm")) {
    window.dataLayer = window.dataLayer ?? [];
    window.dataLayer.push({ "gtm.start": Date.now(), event: "gtm.js" });
    inject("tie-gtm", `https://www.googletagmanager.com/gtm.js?id=${GTM_ID}`);
  }
  void loadHubSpot();
}

let hubSpotPromise: Promise<void> | undefined;

async function waitForCollectedForms() {
  const deadline = Date.now() + 10_000;
  while (Date.now() < deadline) {
    const ready = performance
      .getEntriesByType("resource")
      .some((entry) =>
        entry.name.includes("hscollectedforms.net/collectedforms.js"),
      );
    if (ready) {
      // Give the collector one task to bind the forms it just scanned.
      await new Promise((resolve) => window.setTimeout(resolve, 0));
      return;
    }
    await new Promise((resolve) => window.setTimeout(resolve, 100));
  }
  throw new Error("HubSpot form collection is unavailable.");
}

/** Load only HubSpot and resolve after its collector is ready to inspect forms. */
export function loadHubSpot(): Promise<void> {
  if (hubSpotPromise) return hubSpotPromise;

  hubSpotPromise = new Promise((resolve, reject) => {
    const existing = document.getElementById(
      "hs-script-loader",
    ) as HTMLScriptElement | null;
    if (existing?.dataset.loaded === "true") {
      resolve();
      return;
    }

    const script = existing ?? document.createElement("script");
    let timeoutId: number;
    let settled = false;
    const cleanup = () => {
      window.clearTimeout(timeoutId);
      script.removeEventListener("load", handleLoad);
      script.removeEventListener("error", handleError);
    };
    const handleLoad = async () => {
      try {
        await waitForCollectedForms();
        if (settled) return;
        settled = true;
        script.dataset.loaded = "true";
        cleanup();
        resolve();
      } catch {
        handleError();
      }
    };
    const handleError = () => {
      if (settled) return;
      settled = true;
      cleanup();
      hubSpotPromise = undefined;
      if (!existing) script.remove();
      reject(new Error("HubSpot could not be loaded."));
    };

    script.addEventListener("load", handleLoad, { once: true });
    script.addEventListener("error", handleError, { once: true });
    timeoutId = window.setTimeout(handleError, 12_000);

    if (!existing) {
      script.id = "hs-script-loader";
      script.async = true;
      script.src = `https://js.hs-scripts.com/${HUBSPOT_ID}.js`;
      document.head.appendChild(script);
    }
  });

  return hubSpotPromise;
}
