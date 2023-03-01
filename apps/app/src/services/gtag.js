export default function gtagEvent(cookies, sendTo) {
  if (cookies["accept-cookie"] !== "true") return;
  window.dataLayer = window.dataLayer || [];
  window.gtag =
    window.gtag ||
    function () {
      window.dataLayer.push(arguments);
    };
  window.gtag("js", new Date());
  window.gtag("config", "DC-2971054");
  window.gtag("event", "conversion", {
    allow_custom_scripts: true,
    send_to: sendTo,
  });
}
