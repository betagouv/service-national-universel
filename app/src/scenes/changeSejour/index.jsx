import React from "react";
import { Switch } from "react-router-dom";
import { SentryRoute } from "@/sentry";
import NoMatchingDate from "./scenes/NoMatchingDate";
import ChangeSejourV2 from "./scenes/changeSejourV2";

const ChangeSejour = () => {
  return (
    <Switch>
      {/* <SentryRoute path="/changer-de-sejour/motif" component={todo} /> */}
      {/* <SentryRoute path="/changer-de-sejour/prevenir-sejour" component={todo} /> */}
      {/* <SentryRoute path="/changer-de-sejour/se-desister" component={todo} /> */}
      <SentryRoute path="/changer-de-sejour/no-date" component={NoMatchingDate} />
      <SentryRoute path="/changer-de-sejour/" component={ChangeSejourV2} />
    </Switch>
  );
};

export default ChangeSejour;
