import { ENVIRONMENT } from "../config";

export default function plausibleEvent(goal, props = {}) {
  if (ENVIRONMENT === "production") {
    window.plausible?.(goal, { props: { device: navigator?.userAgentData?.mobile ? "mobile" : "desktop", ...props } });
  }
}
