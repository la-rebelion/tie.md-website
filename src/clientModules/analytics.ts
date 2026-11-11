import ExecutionEnvironment from "@docusaurus/ExecutionEnvironment";
import type { ClientModule } from "@docusaurus/types";
import { loadAnalytics, readConsent } from "../lib/consent";

// Runs once in the browser: restore a previous "Accept" without asking again.
if (ExecutionEnvironment.canUseDOM && readConsent() === "granted")
  loadAnalytics();

const module: ClientModule = {
  onRouteDidUpdate({ location, previousLocation }) {
    if (!previousLocation || location.pathname === previousLocation.pathname)
      return;
    if (readConsent() !== "granted") return;
    const path = location.pathname + location.search;
    window.dataLayer?.push({ event: "page_view", page_path: path });
    window._hsq = window._hsq ?? [];
    window._hsq.push(["setPath", path], ["trackPageView"]);
  },
};

export default module;
