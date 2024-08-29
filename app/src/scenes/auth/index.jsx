import React from "react";
import { Switch, useLocation, Redirect } from "react-router-dom";

import MobileReset from "./mobile/reset";
import MobileForgot from "./mobile/forgot";
import MobileSignupInvite from "./mobile/signupInvite";
import MobileSignin from "./mobile/signin";
import MobileSignin2FA from "./mobile/signin2FA";

import DesktopReset from "./desktop/reset";
import DesktopForgot from "./desktop/forgot";
import DesktopSignupInvite from "./desktop/signupInvite";
import DesktopSignin from "./desktop/signin";
import DesktopSignin2FA from "./desktop/signin2FA";

import { SentryRoute } from "../../sentry";
import useDevice from "../../hooks/useDevice";

import DSFRLayout from "@/components/dsfr/layout/DSFRLayout";
import useDocumentCss from "@/hooks/useDocumentCss";

const Render = ({ screen }) => {
  const device = useDevice();

  function renderScreen(screen) {
    if (screen === "invite") return device === "desktop" ? <DesktopSignupInvite /> : <MobileSignupInvite />;
    if (screen === "reset") return device === "desktop" ? <DesktopReset /> : <MobileReset />;
    if (screen === "forgot") return device === "desktop" ? <DesktopForgot /> : <MobileForgot />;
    if (screen === "auth") return device === "desktop" ? <DesktopSignin /> : <MobileSignin />;
    if (screen === "2fa") return device === "desktop" ? <DesktopSignin2FA /> : <MobileSignin2FA />;
  }

  return <DSFRLayout>{renderScreen(screen)}</DSFRLayout>;
};

export default function Index() {
  useDocumentCss(["/dsfr/utility/icons/icons.min.css", "/dsfr/dsfr.min.css"]);

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
