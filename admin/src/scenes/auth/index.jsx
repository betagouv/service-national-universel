import React, { useEffect, useState } from "react";
import { Switch, Redirect, useLocation } from "react-router-dom";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import { SentryRoute } from "../../sentry";

import { useDispatch } from "react-redux";
import Forgot from "./forgot";
import InvitationExpired from "./invitationexpired";
import Reset from "./reset";
import Signin from "./signin";
import Signin2FA from "./signin2FA";
import Signup from "./signup";
import SignupInvite from "./signupInvite";
import api from "../../services/api";
import { setUser } from "../../redux/auth/actions";
import Loader from "../../components/Loader";
import { environment } from "../../config";
import FooterComponent from "../../components/footer";

export default function AuthIndex() {
  useDocumentTitle("Connexion");

  let location = useLocation();
  let parentPath = location.pathname.substring(0, location.pathname.lastIndexOf("/"));

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
    <div className="flex flex-1 flex-col bg-white">
      <Switch>
        <SentryRoute path="/auth/reset" component={Reset} />
        <SentryRoute path="/auth/forgot" component={Forgot} />
        <SentryRoute path="/auth/signup/invite" component={SignupInvite} />
        <SentryRoute path="/auth/signup" component={Signup} />
        <SentryRoute path="/auth/invitationexpired" component={InvitationExpired} />
        <SentryRoute exact path="/auth/2fa" component={Signin2FA} />
        <SentryRoute exact path="/auth" component={Signin} />
        <Redirect to={parentPath} /> {/* This will redirect to the parent path if no other Routes match */}
      </Switch>
      <FooterComponent />
    </div>
  );
}
