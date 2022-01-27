export default function plausibleEvent(goal, props = {}) {
  console.log("PLAUSIBLE", goal, props);
  // Just in case :
  // const p = decodeURIComponent(window.location.search);
  // console.log("PLAUSIBLE", p.split("?from=")[1]);
  window.plausible?.(goal, { props: { device: navigator?.userAgentData?.mobile ? "mobile" : "desktop", ...props } });
}
