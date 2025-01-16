import React from "react";
import { Switch, useLocation, Redirect } from "react-router-dom";
import Reset from "./reset";
import DesktopForgot from "./desktop/forgot";
import Signin from "./signin";
import Signin2FA from "./signin2FA";
import SignupInvite from "./signupInvite";
import { SentryRoute } from "../../sentry";
import DSFRLayout from "@/components/dsfr/layout/DSFRLayout";

export default function Index() {
  const location = useLocation();
  const parentPath = location.pathname.substring(0, location.pathname.lastIndexOf("/"));

  return (
    <DSFRLayout>
      <Switch>
        <SentryRoute path="/auth/signup/invite" component={() => <SignupInvite />} />
        <SentryRoute path="/auth/reset" component={() => <Reset />} />
        <SentryRoute path="/auth/forgot" component={() => <DesktopForgot />} />
        <SentryRoute path="/auth/2fa" component={() => <Signin2FA />} />
        <SentryRoute path="/auth" component={() => <Signin />} />
        <Redirect to={parentPath} /> {/* This will redirect to the parent path if no other Routes match */}
      </Switch>
    </DSFRLayout>
  );
}
