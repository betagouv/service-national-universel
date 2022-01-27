import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { useCookies } from "react-cookie";
import StepProfilOnline from "./stepProfilOnline";
import StepProfilOffline from "./stepProfilOffline";

export default function StepProfil() {
  const young = useSelector((state) => state.Auth.young);
  const [cookies] = useCookies(["accept-cookie"]);

  useEffect(() => {
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
      send_to: "DC-2971054/snuiz0/bouton1+unique",
    });
  }, []);

  if (young?.email) return <StepProfilOnline />;

  return <StepProfilOffline />;
}
