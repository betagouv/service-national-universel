import React, { useEffect, useState } from "react";
import { Switch } from "react-router-dom";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import { SentryRoute } from "../../sentry";

import { useDispatch } from "react-redux";
import Forgot from "./forgot";
import InvitationExpired from "./invitationexpired";
import Reset from "./reset";
import Signin from "./signin";
import Signup from "./signup";
import SignupInvite from "./signupInvite";
import api from "../../services/api";
import { setUser } from "../../redux/auth/actions";
import Loader from "../../components/Loader";

export default function AuthIndex() {
  useDocumentTitle("Connexion");

  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();
  useEffect(() => {
    async function fetchData() {
      try {
        const res = await api.checkToken();
        if (!res.ok || !res.user) {
          api.setToken(null);
          dispatch(setUser(null));
          return setLoading(false);
        }
        if (res.token) api.setToken(res.token);
        if (res.user) dispatch(setUser(res.user));
      } catch (e) {
        console.log(e);
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  if (loading) return <Loader />;

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
