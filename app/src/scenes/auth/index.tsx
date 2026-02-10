import React from "react";
import { Switch, useLocation, Redirect } from "react-router-dom";
import Reset from "./reset";
// import DesktopForgot from "./desktop/forgot";
import Forgot from "./forgot";
import Signin from "./signin";
import Signin2FA from "./signin2FA";
import SignupInvite from "./signupInvite";
import { SentryRoute } from "../../sentry";
import DSFRLayout from "@/components/dsfr/layout/DSFRLayout";
import { Alert } from "@codegouvfr/react-dsfr/Alert";

export default function Index() {
  const location = useLocation();
  const parentPath = location.pathname.substring(0, location.pathname.lastIndexOf("/"));

  return (
    <DSFRLayout>
      <Alert
        severity="warning"
        title="Problème technique avec l'envoi des mails"
        description="Nous rencontrons actuellement un problème technique avec l'envoi des mails. Si vous ne recevez pas les mails d'authentification, cela est probablement lié à ce dysfonctionnement. Vous pouvez contacter le support, contact@snu.gouv.fr, afin que nous puissions revenir vers vous dès la résolution du problème."
        className="mb-4"
      />
      <Switch>
        <SentryRoute path="/auth/signup/invite" component={() => <SignupInvite />} />
        <SentryRoute path="/auth/reset" component={() => <Reset />} />
        <SentryRoute path="/auth/forgot" component={() => <Forgot />} />
        <SentryRoute path="/auth/2fa" component={() => <Signin2FA />} />
        <SentryRoute path="/auth" component={() => <Signin />} />
        <Redirect to={parentPath} /> {/* This will redirect to the parent path if no other Routes match */}
      </Switch>
    </DSFRLayout>
  );
}
