import React from "react";
import { Switch } from "react-router-dom";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import { SentryRoute } from "../../sentry";

import Create from "./create";
import List from "./list";
import View from "./view";
import InscriptionEnMasse from "./inscriptionEnMasse/InscriptionEnMassePage";
import InscriptionManuellePage from "./inscriptionManuelle/InscriptionManuellePage";
import { toastr } from "react-redux-toastr";
import NotFound from "@/components/layout/NotFound";
import { FeatureFlagName } from "snu-lib";
import { useSelector } from "react-redux";
import { AuthState } from "@/redux/auth/reducer";

export default function Index() {
  useDocumentTitle("Classes");
  const user = useSelector((state: AuthState) => state.Auth.user);

  return (
    <Switch>
      <SentryRoute path="/classes/create" component={Create} />
      <SentryRoute
        path="/classes/:id/inscription-masse"
        render={({ match }) => {
          const { id } = match.params;
          if (!/^[0-9a-fA-F]{24}$/.test(id)) {
            toastr.error("Identifiant invalide : " + id, "");
            return <SentryRoute component={NotFound} />;
          }
          if (!user.featureFlags?.[FeatureFlagName.INSCRIPTION_EN_MASSE_CLASSE]) {
            return <SentryRoute component={NotFound} />;
          }
          return <SentryRoute component={InscriptionEnMasse} />;
        }}
      />
      <SentryRoute
        path="/classes/:id/inscription-manuelle"
        render={({ match }) => {
          const { id } = match.params;
          if (!/^[0-9a-fA-F]{24}$/.test(id)) {
            toastr.error("Identifiant invalide : " + id, "");
            return <SentryRoute component={NotFound} />;
          }
          return <SentryRoute component={InscriptionManuellePage} />;
        }}
      />
      <SentryRoute
        path="/classes/:id"
        render={({ match }) => {
          const { id } = match.params;
          if (!/^[0-9a-fA-F]{24}$/.test(id)) {
            toastr.error("Identifiant invalide : " + id, "");
            return <SentryRoute component={NotFound} />;
          }
          return <SentryRoute component={View} />;
        }}
      />
      <SentryRoute path="/classes" component={List} />
    </Switch>
  );
}
