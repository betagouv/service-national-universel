import React from "react";
import { Switch } from "react-router-dom";
import { useSelector } from "react-redux";
import { useQuery } from "@tanstack/react-query";

import { YoungDto } from "snu-lib";

import useDocumentTitle from "@/hooks/useDocumentTitle";
import { SentryRoute } from "@/sentry";
import api from "@/services/api";
import { CohortState } from "@/redux/cohorts/reducer";
import { YOUNG_STATUS } from "@/utils";
import Breadcrumbs from "@/components/Breadcrumbs";

import Phase1 from "./phase1";
import Phase2Bis from "./phase2bis";
import Phase3 from "./phase3";
import Phase2Contract from "./phase2Contract";
import History from "./history";
import Notifications from "./notifications";
import Notes from "./notes";
import FormEquivalence from "./FormEquivalence";
import VolontairePhase0View from "../../phase0/view";
import ProposeMission from "./proposalMission";
import CustomMission from "./customMission";

export default function Index({ ...props }) {
  const cohorts = useSelector((state: CohortState) => state.Cohorts);

  const { data: young, refetch } = useQuery<YoungDto>({
    queryKey: ["young", props.match.params.id],
    queryFn: async () => (await api.get(`/referent/young/${props.match.params.id}`))?.data,
    enabled: !!props.match?.params?.id,
  });
  useDocumentTitle(young ? (young.status === YOUNG_STATUS.DELETED ? "Compte supprimé" : `${young.firstName} ${young.lastName}`) : "Volontaires");

  const getDetail = () => {
    if (!young) return;
    let mode: "correction" | "readonly" = ([YOUNG_STATUS.WAITING_VALIDATION, YOUNG_STATUS.WAITING_CORRECTION] as string[]).includes(young?.status || "")
      ? "correction"
      : "readonly";
    const cohort = cohorts.find(({ _id, name }) => _id === young?.cohortId || name === young?.cohort);
    if (new Date() > new Date(cohort?.instructionEndDate || "")) {
      mode = "readonly";
    }
    return <VolontairePhase0View young={young} onChange={refetch} globalMode={mode} />;
  };

  if (!props.match?.params?.id || !young) return <div />;

  return (
    <>
      <Breadcrumbs items={[{ label: "Volontaires", to: "/volontaire" }, { label: "Fiche du volontaire" }]} />
      <Switch>
        <SentryRoute path="/volontaire/:id/phase1" component={() => <Phase1 young={young} getYoung={refetch} onChange={refetch} />} />
        <SentryRoute path="/volontaire/:id/phase2/equivalence" component={() => <FormEquivalence young={young} onChange={refetch} />} />
        <SentryRoute path="/volontaire/:id/phase2/propose-mission" component={() => <ProposeMission young={young} onSend={refetch} />} />
        <SentryRoute path="/volontaire/:id/phase2/mission-personnalisé" component={() => <CustomMission young={young} onChange={refetch} />} />
        <SentryRoute path="/volontaire/:id/phase2/application/:applicationId/contrat" component={() => <Phase2Contract young={young} onChange={refetch} />} />
        <SentryRoute path="/volontaire/:id/phase2" component={() => <Phase2Bis young={young} getYoung={refetch} />} />
        <SentryRoute path="/volontaire/:id/phase3" component={() => <Phase3 young={young} onChange={refetch} />} />
        <SentryRoute path="/volontaire/:id/historique" component={() => <History young={young} onChange={refetch} />} />
        <SentryRoute path="/volontaire/:id/notifications" component={() => <Notifications young={young} onChange={refetch} />} />
        <SentryRoute path="/volontaire/:id/notes" component={() => <Notes young={young} onChange={refetch} />} />
        <SentryRoute path="/volontaire/:id" component={getDetail} />
      </Switch>
    </>
  );
}
