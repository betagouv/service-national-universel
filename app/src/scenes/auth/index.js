import React from "react";
import { Switch } from "react-router-dom";

import Reset from "./reset";
import Forgot from "./forgot";
import Connect from "./connect";
import SignupInvite from "./signupInvite";

import Signin from "./signin";
import { SentryRoute } from "../../sentry";

export default function Index() {
  return (
    <Switch>
      <SentryRoute path="/auth/signup/invite" component={SignupInvite} />
      <SentryRoute path="/auth/reset" component={Reset} />
      <SentryRoute path="/auth/forgot" component={Forgot} />
      <SentryRoute path="/auth/connect" component={Connect} />
      <SentryRoute path="/auth" component={Signin} />
    </Switch>
  );
}
