export default function plausibleEvent(goal, props = {}) {
  window.plausible?.(goal, { props: { device: navigator?.userAgentData?.mobile ? "mobile" : "desktop", ...props } });
}
