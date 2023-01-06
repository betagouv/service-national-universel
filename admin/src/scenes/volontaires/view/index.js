import React, { useEffect, useState } from "react";
import { Switch } from "react-router-dom";
import useDocumentTitle from "../../../hooks/useDocumentTitle";
import { SentryRoute } from "../../../sentry";

import api from "../../../services/api";
import Details from "./details";
import DeletedDetail from "./deletedDetail";
import Phase1 from "./phase1";
import Phase2Bis from "./phase2bis";
import Phase2 from "./phase2";
import Phase3 from "./phase3";
import Phase2Contract from "./phase2Contract";
import History from "./history";
import Notifications from "./notifications";
import Notes from "./notes";
import { YOUNG_STATUS } from "../../../utils";
import Breadcrumbs from "../../../components/Breadcrumbs";
import FormEquivalence from "./FormEquivalence";
import VolontairePhase0View from "../../phase0/view";

export default function Index({ ...props }) {
  const [young, setYoung] = useState();
  const setDocumentTitle = useDocumentTitle("Volontaires");

  const getYoung = async () => {
    const id = props.match && props.match.params && props.match.params.id;
    if (!id) return <div />;
    const { data } = await api.get(`/referent/young/${id}`);
    setYoung(data);
    setDocumentTitle(`${data?.firstName} ${data?.lastName}`);
    if (data?.status === YOUNG_STATUS.DELETED) {
      setDocumentTitle(`Compte supprimé`);
    } else {
      setDocumentTitle(`${data?.firstName} ${data?.lastName}`);
    }
  };

  const getDetail = () => {
    const mode = [YOUNG_STATUS.WAITING_VALIDATION, YOUNG_STATUS.WAITING_CORRECTION].includes(young.status) ? "correction" : "readonly";
    return <VolontairePhase0View young={young} onChange={getYoung} globalMode={mode} />;
  };

  useEffect(() => {
    getYoung();
  }, [props.match.params.id]);

  if (!young) return <div />;

  return (
    <>
      <Breadcrumbs items={[{ label: "Volontaires", to: "/volontaire" }, { label: "Fiche du volontaire" }]} />
      <Switch>
        <SentryRoute path="/volontaire/:id/phase1" component={() => <Phase1 young={young} getYoung={getYoung} onChange={getYoung} />} />
        <SentryRoute path="/volontaire/:id/phase2/equivalence" component={() => <FormEquivalence young={young} onChange={getYoung} />} />
        <SentryRoute path="/volontaire/:id/phase2/application/:applicationId/contrat" component={() => <Phase2Contract young={young} onChange={getYoung} />} />
        <SentryRoute path="/volontaire/:id/phase2" component={() => <Phase2Bis young={young} onChange={getYoung} />} />
        <SentryRoute path="/volontaire/:id/phase3" component={() => <Phase3 young={young} onChange={getYoung} />} />
        <SentryRoute path="/volontaire/:id/historique" component={() => <History young={young} onChange={getYoung} />} />
        <SentryRoute path="/volontaire/:id/notifications" component={() => <Notifications young={young} onChange={getYoung} />} />
        <SentryRoute path="/volontaire/:id/notes" component={() => <Notes young={young} onChange={getYoung} />} />
        <SentryRoute path="/volontaire/:id" component={getDetail} />
      </Switch>
    </>
  );
}
