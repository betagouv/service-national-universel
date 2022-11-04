export default function plausibleEvent(goal, props = {}) {
  const body = { props: { device: navigator?.userAgentData?.mobile ? "mobile" : "desktop", ...props } };
  // console.log(goal, body);
  window.plausible?.(goal, body);
}
