import React, { useEffect, useState } from "react";
import { Switch } from "react-router-dom";
import useDocumentTitle from "../../../hooks/useDocumentTitle";
import { SentryRoute } from "../../../sentry";

import api from "../../../services/api";
import Breadcrumbs from "../../../components/Breadcrumbs";
import { toastr } from "react-redux-toastr";
import { ROLES } from "../../../utils";
import { useSelector } from "react-redux";
import Details from "./details";
import Notifications from "./notifications";
import History from "./history";
import Loader from "../../../components/Loader";

export default function Index({ ...props }) {
  const [user, setUser] = useState();
  useDocumentTitle(user ? `${user.firstName} ${user.lastName}` : "Volontaires");
  const currentUser = useSelector((state) => state.Auth.user);

  useEffect(() => {
    (async () => {
      try {
        // fetching user info
        const id = props.match && props.match.params && props.match.params.id;
        if (!id) return setUser(null);
        const userResponse = await api.get(`/referent/${id}`);
        if (!userResponse.ok) {
          setUser(null);
          return toastr.error("Une erreur s'est produite lors du chargement de cet utilisateur. Celui-ci est peut-être introuvable.");
        }
        setUser(userResponse.data);
      } catch (e) {
        console.log(e);
        return toastr.error("Une erreur s'est produite lors du chargement de cet utilisateur");
      }
    })();
  }, []);

  if (!user || !currentUser) return <Loader />;

  return (
    <>
      <Breadcrumbs items={[{ label: "Utilisateurs", to: "/user" }, { label: "Fiche de l'utilisateur" }]} />{" "}
      <Switch>
        {currentUser.role === ROLES.ADMIN && <SentryRoute path="/user/:id/historique" render={() => <History user={user} currentUser={currentUser} />} />}
        <SentryRoute path="/user/:id/notifications" render={() => <Notifications user={user} currentUser={currentUser} />} />
        <SentryRoute path="/user/:id" render={() => <Details user={user} setUser={setUser} currentUser={currentUser} />} />
      </Switch>
    </>
  );
}
