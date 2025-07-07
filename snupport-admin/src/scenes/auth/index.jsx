import React from "react";
import { Switch } from "react-router-dom";
import { SentryRoute } from "../../sentry";

import Forgot from "./forgot";
import Reset from "./reset";
import Signin from "./signin";
// import Signup from "./signup";

export default () => {
  return (
    <Switch>
      <SentryRoute path="/auth/reset" component={Reset} />
      <SentryRoute path="/auth/forgot" component={Forgot} />
      {/* <SentryRoute path="/auth/signup" component={Signup} /> */}
      <SentryRoute path="/auth" component={Signin} />
    </Switch>
  );
};
