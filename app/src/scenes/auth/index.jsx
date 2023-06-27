import React from "react";
import { Switch, useLocation, Redirect } from "react-router-dom";

import MobileReset from "./mobile/reset";
import MobileForgot from "./mobile/forgot";
import MobileSignupInvite from "./mobile/signupInvite";
import MobileSignin from "./mobile/signin";

import DesktopReset from "./desktop/reset";
import DesktopForgot from "./desktop/forgot";
import DesktopSignupInvite from "./desktop/signupInvite";
import DesktopSignin from "./desktop/signin";

import { SentryRoute } from "../../sentry";
import useDevice from "../../hooks/useDevice";

import Header from "../../components/header";
import HeaderMenu from "../../components/headerMenu";
import Footer from "../../components/footerV2";

const Render = ({ screen }) => {
  const device = useDevice();
  const [isOpen, setIsOpen] = React.useState(false);

  function renderScreen(screen) {
    if (screen === "invite") return device === "desktop" ? <DesktopSignupInvite /> : <MobileSignupInvite />;
    if (screen === "reset") return device === "desktop" ? <DesktopReset /> : <MobileReset />;
    if (screen === "forgot") return device === "desktop" ? <DesktopForgot /> : <MobileForgot />;
    if (screen === "auth") return device === "desktop" ? <DesktopSignin /> : <MobileSignin />;
  }

  return (
    <div>
      <HeaderMenu isOpen={isOpen} setIsOpen={setIsOpen} />
      <Header setIsOpen={setIsOpen} />
      {renderScreen(screen)}
      {device === "desktop" && <Footer marginBottom={"0px"} />}
    </div>
  );
};

export default function Index() {
  let location = useLocation();
  let parentPath = location.pathname.substring(0, location.pathname.lastIndexOf("/"));

  return (
    <Switch>
      <SentryRoute path="/auth/signup/invite" component={() => <Render screen="invite" />} />
      <SentryRoute path="/auth/reset" component={() => <Render screen="reset" />} />
      <SentryRoute path="/auth/forgot" component={() => <Render screen="forgot" />} />
      <SentryRoute path="/auth" component={() => <Render screen="auth" />} />
      <Redirect to={parentPath} /> {/* This will redirect to the parent path if no other Routes match */}
    </Switch>
  );
}
