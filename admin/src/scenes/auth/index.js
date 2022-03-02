import React from "react";
import { Route, Switch } from "react-router-dom";
import useDocumentTitle from "../../hooks/useDocumentTitle";

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
        <Route path="/auth/reset" component={Reset} />
        <Route path="/auth/forgot" component={Forgot} />
        <Route path="/auth/signup/invite" component={SignupInvite} />
        <Route path="/auth/signup" component={Signup} />
        <Route path="/auth/invitationexpired" component={InvitationExpired} />
        <Route path="/auth" component={Signin} />
      </Switch>
    </div>
  );
}
