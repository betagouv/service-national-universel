import React, { useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import gtagEvent from "../services/gtag";
// import { Helmet } from "react-helmet";

export default function GoogleTags() {
  const [cookies] = useCookies(["accept-cookie"]);
  const [axel, setAxel] = useState(null);

  useEffect(() => {
    if (cookies["accept-cookie"] !== "true") return;

    const script = document.createElement("script");
    script.src = "https://www.googletagmanager.com/gtag/js?id=DC-2971054";
    script.async = true;
    document.body.appendChild(script);
    gtagEvent(cookies, "DC-2971054/snuiz0/snulp+unique");

    // Add floodlight tag
    setAxel((Math.random() + "") * 10000000000000);
  }, [cookies]);

  if (cookies["accept-cookie"] !== "true" && axel) {
    return (
      <iframe
        src="https://ad.doubleclick.net/ddm/activity/src=2971054;type=snuiz0;cat=snulp;dc_lat=;dc_rdid=;tag_for_child_directed_treatment=;tfua=;npa=;gdpr=${GDPR};gdpr_consent=${GDPR_CONSENT_755};ord=1;num=1?"
        width="1"
        height="1"
        frameBorder="0"
        style="display:none"></iframe>
    );
  }

  return <></>;
}
