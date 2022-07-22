import React from "react";
import { Switch } from "react-router-dom";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import { SentryRoute } from "../../sentry";

import Reset from "./reset";
import Forgot from "./forgot";
import Signin from "./signin";
import SignupInvite from "./signupInvite";
import Signup from "./signup";
import InvitationExpired from "./invitationexpired";

export default function AuthIndex() {
  useDocumentTitle("Connexion");

  return (
    <div className="flex flex-1 bg-white">
      <Switch>
        <SentryRoute path="/auth/reset" component={Reset} />
        <SentryRoute path="/auth/forgot" component={Forgot} />
        <SentryRoute path="/auth/signup/invite" component={SignupInvite} />
        <SentryRoute path="/auth/signup" component={Signup} />
        <SentryRoute path="/auth/invitationexpired" component={InvitationExpired} />
        <SentryRoute path="/auth" component={Signin} />
      </Switch>
    </div>
  );
}
