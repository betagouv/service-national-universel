import { environment } from "../config";

export default function plausibleEvent(goal, props = {}) {
  if (environment === "production") {
    window.plausible?.(goal, { props: { device: navigator?.userAgentData?.mobile ? "mobile" : "desktop", ...props } });
  }
}
