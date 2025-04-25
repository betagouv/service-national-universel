import React, { useState, useEffect } from "react";
import { useHistory, useLocation, Switch } from "react-router-dom";
import { useSelector } from "react-redux";

import { SentryRoute } from "@/sentry";
import { AuthState } from "@/redux/auth/reducer";
import { CohortState } from "@/redux/cohorts/reducer";
import Loader from "@/components/Loader";

import Historic from "./Historic";
import ListeDemandeModif from "./ListeDemandeModif";
import List from "./List";
import HeaderPDT from "./components/Header";
import { Page } from "@snu/ds/admin";
import { useCohortHasPDT, getInitialCohort } from "./utils";

export default function Main() {
  const { user, sessionPhase1 } = useSelector((state: AuthState) => state.Auth);
  const cohorts = useSelector((state: CohortState) => state.Cohorts);
  const [cohort, setCohort] = useState(getInitialCohort(user, cohorts, sessionPhase1));
  const history = useHistory();
  const currentLocation = useLocation();
  const [currentTab, setCurrentTab] = useState(
    currentLocation.pathname.includes("historique") ? "historique" : currentLocation.pathname.includes("modification") ? "modification" : "aller",
  );
  const cohortInURL = new URLSearchParams(history.location.search).get("cohort");
  const [selectedFilters, setSelectedFilters] = useState<any>({});
  const { data: hasValue, isPending: isLoading } = useCohortHasPDT(cohort);

  useEffect(() => {
    if (cohortInURL) return;
    if (!selectedFilters.cohort) setSelectedFilters({ ...selectedFilters, ["cohort"]: { filter: [cohort] } });
  }, [selectedFilters]);

  if (isLoading) return <Loader />;

  return (
    <Page>
      <HeaderPDT cohort={cohort} setCohort={setCohort} hasValue={hasValue} currentTab={currentTab} setCurrentTab={setCurrentTab} selectedFilters={selectedFilters} />
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
