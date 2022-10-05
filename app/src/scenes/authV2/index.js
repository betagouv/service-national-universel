import React from "react";
import { Switch } from "react-router-dom";

import MobileReset from "./mobile/reset";
import MobileForgot from "./mobile/forgot";
import MobileSignupInvite from "./mobile/signupInvite";
import MobileSignin from "./mobile/signin";

import DesktopReset from "./desktop/reset";
import DesktopForgot from "./desktop/forgot";
import DesktopSignupInvite from "./desktop/signupInvite";
import DesktopSignin from "./desktop/signin";

import Connect from "./connect";
import { SentryRoute } from "../../sentry";
import useDevice from "../../hooks/useDevice";

export default function Index() {
  const device = useDevice();
  return (
    <Switch>
      <SentryRoute path="/auth/signup/invite" component={device === "desktop" ? DesktopSignupInvite : MobileSignupInvite} />
      <SentryRoute path="/auth/reset" component={device === "desktop" ? DesktopReset : MobileReset} />
      <SentryRoute path="/auth/forgot" component={device === "desktop" ? DesktopForgot : MobileForgot} />
      <SentryRoute path="/auth/connect" component={Connect} />
      <SentryRoute path="/auth" component={device === "desktop" ? DesktopSignin : MobileSignin} />
    </Switch>
  );
}
