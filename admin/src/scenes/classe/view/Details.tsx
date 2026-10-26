import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import dayjs from "dayjs";
import { toastr } from "react-redux-toastr";

import { Page } from "@snu/ds/admin";
import { capture } from "@/sentry";
import api from "@/services/api";
import { translate, YOUNG_STATUS, STATUS_CLASSE, COHORT_TYPE } from "snu-lib";
import Loader from "@/components/Loader";
import { AuthState } from "@/redux/auth/reducer";
import { CohortState } from "@/redux/cohorts/reducer";

import { getRights } from "../utils";
import GeneralInfos from "../components/GeneralInfos";
import ReferentInfos from "../components/ReferentInfos";
import SejourInfos from "../components/SejourInfos";
import StatsInfos from "../components/StatsInfos";
import ClasseHeader from "../header/ClasseHeader";
import { InfoBus, Rights } from "../components/types";

export default function Details(props) {
  const [classe, setClasse] = useState(props.classe);
  const studentStatus = props.studentStatus;
  const { id } = useParams<{ id: string }>();
  const [isLoading, setIsLoading] = useState(false);
  const [infoBus, setInfoBus] = useState<InfoBus | null>(null);
  const referent = classe?.referents[0] ? { nom: classe.referents[0].lastName, prenom: classe.referents[0].firstName, email: classe.referents[0].email } : undefined;
  const user = useSelector((state: AuthState) => state.Auth.user);
  const cohorts = useSelector((state: CohortState) => state.Cohorts).filter(
    (c) => classe?.cohortId === c._id || (c.type === COHORT_TYPE.CLE && getRights(user, classe, c).canEditCohort),
  );
  const cohort = cohorts.find((c) => c.name === classe?.cohort);
  const rights = getRights(user, classe, cohort) as Rights;
  const validatedYoung = studentStatus[YOUNG_STATUS.VALIDATED] || 0;

  const getClasse = async () => {
    try {
      if (classe?.ligneId) {
        //Bus
        const { ok: ok1, code: code1, data: ligne } = await api.get(`/ligne-de-bus/${classe.ligneId}`);
        if (!ok1) {
          return toastr.error("Oups, une erreur est survenue lors de la récupération des lignes de bus", translate(code1));
        }
        const meetingPoint = ligne.meetingsPointsDetail.find((e) => e.meetingPointId === classe.pointDeRassemblementId);

        setInfoBus({
          busId: ligne.busId,
          departureDate: dayjs(ligne.departuredDate).format("dddd D MMMM YYYY"),
          meetingHour: meetingPoint?.meetingHour,
          departureHour: meetingPoint?.departureHour,
          returnDate: dayjs(ligne.returnDate).format("dddd D MMMM YYYY"),
          returnHour: meetingPoint?.returnHour,
        });
      }
    } catch (e) {
      capture(e);
      toastr.error("Oups, une erreur est survenue lors de la récupération de la classe", translate(e.message));
    }
  };

  useEffect(() => {
    getClasse();
  }, [id]);

  if (!classe) return <Loader />;

  return (
    <Page>
      <ClasseHeader classe={classe} setClasse={setClasse} isLoading={isLoading} setIsLoading={setIsLoading} studentStatus={studentStatus} page={"Fiche de la classe"} />
      <GeneralInfos classe={classe} rights={rights} cohorts={cohorts} user={user} validatedYoung={validatedYoung} />

      {classe.referents?.length ? <ReferentInfos currentReferent={referent} /> : null}

      {(rights.showCenter || rights.showPDR) && classe?.status !== STATUS_CLASSE.WITHDRAWN && <SejourInfos classe={classe} rights={rights} user={user} infoBus={infoBus} />}

      {![STATUS_CLASSE.CREATED, STATUS_CLASSE.VERIFIED].includes(classe?.status as any) && (
        <StatsInfos classe={classe} user={user} studentStatus={studentStatus} validatedYoung={validatedYoung} />
      )}
    </Page>
  );
}
