import React from "react";
import { Switch, useLocation, Redirect } from "react-router-dom";

import MobileReset from "./mobile/reset";
import MobileForgot from "./mobile/forgot";
// import MobileSignupInvite from "./mobile/signupInvite";
// import MobileSignin from "./mobile/signin";
// import MobileSignin2FA from "./mobile/signin2FA";

import DesktopReset from "./desktop/reset";
import DesktopForgot from "./desktop/forgot";
import DesktopSignupInvite from "./desktop/signupInvite";
// import DesktopSignin from "./desktop/signin";
// import DesktopSignin2FA from "./desktop/signin2FA";

import Signin from "./signin";
import Signin2FA from "./signin2FA";
import SignupInvite from "./signupInvite";

import { SentryRoute } from "../../sentry";
import useDevice from "../../hooks/useDevice";

import DSFRLayout from "@/components/dsfr/layout/DSFRLayout";

const Render = ({ screen }) => {
  const device = useDevice();

  function renderScreen(screen) {
    if (screen === "invite") return <SignupInvite />;
    if (screen === "reset") return device === "desktop" ? <DesktopReset /> : <MobileReset />;
    if (screen === "forgot") return device === "desktop" ? <DesktopForgot /> : <MobileForgot />;
    if (screen === "auth") return <Signin />;
    if (screen === "2fa") return <Signin2FA />;
  }

  return <DSFRLayout>{renderScreen(screen)}</DSFRLayout>;
};

export default function Index() {
  let location = useLocation();
  let parentPath = location.pathname.substring(0, location.pathname.lastIndexOf("/"));

  return (
    <Switch>
      <SentryRoute path="/auth/signup/invite" component={() => <Render screen="invite" />} />
      <SentryRoute path="/auth/reset" component={() => <Render screen="reset" />} />
      <SentryRoute path="/auth/forgot" component={() => <Render screen="forgot" />} />
      <SentryRoute path="/auth/2fa" component={() => <Render screen="2fa" />} />
      <SentryRoute path="/auth" component={() => <Render screen="auth" />} />
      <Redirect to={parentPath} /> {/* This will redirect to the parent path if no other Routes match */}
    </Switch>
  );
}
