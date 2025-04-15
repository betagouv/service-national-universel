import React, { useState, useEffect } from "react";
import { useHistory, useLocation, Switch } from "react-router-dom";
import { useSelector } from "react-redux";
import { toastr } from "react-redux-toastr";

import { capture, SentryRoute } from "@/sentry";
import { AuthState } from "@/redux/auth/reducer";
import api from "@/services/api";
import { ROLES, translate } from "snu-lib";
import { CohortState } from "@/redux/cohorts/reducer";
import Loader from "@/components/Loader";

import Historic from "./Historic";
import ListeDemandeModif from "./ListeDemandeModif";
import List from "./List";
import HeaderPDT from "./components/Header";
import { Page } from "@snu/ds/admin";

export default function Main() {
  const { user, sessionPhase1 } = useSelector((state: AuthState) => state.Auth);
  const cohorts = useSelector((state: CohortState) => state.Cohorts);
  const urlParams = new URLSearchParams(window.location.search);
  const defaultCohort = user.role === ROLES.HEAD_CENTER && sessionPhase1 ? sessionPhase1.cohort : cohorts?.[0]?.name;
  const [cohort, setCohort] = useState(urlParams.get("cohort") || defaultCohort);
  const [hasValue, setHasValue] = useState(false);
  const history = useHistory();
  const [isLoading, setIsLoading] = React.useState(true);
  const currentLocation = useLocation();
  const [currentTab, setCurrentTab] = useState(
    currentLocation.pathname.includes("historique") ? "historique" : currentLocation.pathname.includes("modification") ? "modification" : "aller",
  );
  const cohortInURL = new URLSearchParams(history.location.search).get("cohort");
  const [selectedFilters, setSelectedFilters] = useState<any>({});

  useEffect(() => {
    if (cohortInURL) return;
    if (!selectedFilters.cohort) setSelectedFilters({ ...selectedFilters, ["cohort"]: { filter: [cohort] } });
  }, [selectedFilters]);

  const getPlanDetransport = async () => {
    try {
      const { ok, code, data: reponseBus } = await api.get(`/ligne-de-bus/cohort/${cohort}/hasValue`);
      if (!ok) {
        return toastr.error("Oups, une erreur est survenue lors de la récupération du plan de transport", translate(code));
      }
      setHasValue(reponseBus);
      setIsLoading(false);
    } catch (e) {
      capture(e);
      toastr.error("Oups, une erreur est survenue lors de la récupération du bus", "");
    }
  };

  useEffect(() => {
    if (user.role === ROLES.HEAD_CENTER && sessionPhase1) {
      history.push(`/ligne-de-bus?cohort=${sessionPhase1.cohort}`);
      setCohort(sessionPhase1.cohort);
    }
    setIsLoading(true);
    getPlanDetransport();
  }, [cohort]);

  if (isLoading) return <Loader />;

  return (
    <Page>
      <HeaderPDT
        cohort={cohort}
        setCohort={setCohort}
        getPlanDetransport={getPlanDetransport}
        hasValue={hasValue}
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        selectedFilters={selectedFilters}
      />
      <Switch>
        <SentryRoute path="/ligne-de-bus/historique" component={Historic} />
        <SentryRoute path="/ligne-de-bus/demande-de-modification" component={ListeDemandeModif} />
        <SentryRoute
          path="/ligne-de-bus"
          exact
          render={() => <List hasValue={hasValue} cohort={cohort} currentTab={currentTab} selectedFilters={selectedFilters} setSelectedFilters={setSelectedFilters} />}
        />
      </Switch>
    </Page>
  );
}
