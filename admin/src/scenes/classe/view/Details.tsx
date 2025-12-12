import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import dayjs from "dayjs";
import { toastr } from "react-redux-toastr";

import { Page } from "@snu/ds/admin";
import { capture } from "@/sentry";
import api from "@/services/api";
import { translate, YOUNG_STATUS, STATUS_CLASSE, COHORT_TYPE, LIMIT_DATE_ESTIMATED_SEATS } from "snu-lib";
import Loader from "@/components/Loader";
import { AuthState } from "@/redux/auth/reducer";
import { CohortState } from "@/redux/cohorts/reducer";

import { getRights } from "../utils";
import GeneralInfos from "../components/GeneralInfos";
import ReferentInfos from "../components/ReferentInfos";
import SejourInfos from "../components/SejourInfos";
import StatsInfos from "../components/StatsInfos";
import ModaleCohort from "../components/modaleCohort";
import ClasseHeader from "../header/ClasseHeader";
import { InfoBus, Rights } from "../components/types";
import { ReferentModifier } from "../components/ReferentInfosModifierModal";

export default function Details(props) {
  const [classe, setClasse] = useState(props.classe);
  const studentStatus = props.studentStatus;
  const [showModaleCohort, setShowModaleCohort] = useState(false);
  const { id } = useParams<{ id: string }>();
  const [errors, setErrors] = useState({});
  const [edit, setEdit] = useState(false);
  const [editRef, setEditRef] = useState(false);
  const [editStay, setEditStay] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [oldClasseCohort, setOldClasseCohort] = useState<string>();
  const [infoBus, setInfoBus] = useState<InfoBus | null>(null);
  const referent = classe?.referents[0] ? { nom: classe.referents[0].lastName, prenom: classe.referents[0].firstName, email: classe.referents[0].email } : undefined;
  const handleModiferReferent = (referent: ReferentModifier) => {
    setClasse({ ...classe, referents: [{ firstName: referent.prenom, lastName: referent.nom, email: referent.email }] });
  };
  const user = useSelector((state: AuthState) => state.Auth.user);
  const cohorts = useSelector((state: CohortState) => state.Cohorts).filter(
    (c) => classe?.cohortId === c._id || (c.type === COHORT_TYPE.CLE && getRights(user, classe, c).canEditCohort),
  );
  const cohort = cohorts.find((c) => c.name === classe?.cohort);
  const rights = getRights(user, classe, cohort) as Rights;
  const validatedYoung = studentStatus[YOUNG_STATUS.VALIDATED] || 0;

  const getClasse = async () => {
    try {
      setOldClasseCohort(classe.cohort);
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
  }, [id, edit, editStay, editRef]);

  const checkInfo = () => {
    setErrors({});
    interface Errors {
      cohort?: string;
      name?: string;
      coloration?: string;
      totalSeats?: string;
      filiere?: string;
      grades?: string;
      estimatedSeats?: string;
      type?: string;
      refFirstName?: string;
      refLastName?: string;
      refEmail?: string;
    }

    const errors: Errors = {};
    if (classe?.cohort !== oldClasseCohort && classe?.ligneId) errors.cohort = "Vous ne pouvez pas modifier la cohorte car cette classe est affecté a une ligne de bus.";
    if (!classe?.name) errors.name = "Ce champ est obligatoire";
    if (!classe?.coloration) errors.coloration = "Ce champ est obligatoire";
    if (!classe?.filiere) errors.filiere = "Ce champ est obligatoire";
    if (!classe?.type) errors.type = "Ce champ est obligatoire";
    if (!classe?.grades.length) errors.grades = "Ce champ est obligatoire";
    if (classe?.grades && classe?.grades.length > 3) errors.grades = "Une classe ne peut avoir que 3 niveaux maximum";
    if (!classe?.estimatedSeats) errors.estimatedSeats = "Ce champ est obligatoire";
    if (!classe?.totalSeats) errors.totalSeats = "Ce champ est obligatoire";
    const now = new Date();
    const limitDateEstimatedSeats = new Date(LIMIT_DATE_ESTIMATED_SEATS);
    if (classe?.totalSeats && classe.estimatedSeats && classe.totalSeats > classe.estimatedSeats && now > limitDateEstimatedSeats)
      errors.totalSeats = "L'effectif ajusté ne peut pas être supérieur à l'effectif prévisionnel";
    if (!classe?.referents?.[0].firstName) errors.refFirstName = "Ce champ est obligatoire";
    if (!classe?.referents?.[0].lastName) errors.refLastName = "Ce champ est obligatoire";
    if (!classe?.referents?.[0].email) errors.refEmail = "Ce champ est obligatoire";

    if (Object.keys(errors).length > 0) {
      setErrors(errors);
      setIsLoading(false);
      return;
    }
    if (classe?.cohort !== oldClasseCohort) {
      setShowModaleCohort(true);
    } else {
      sendInfo();
    }
  };

  const sendInfo = async () => {
    try {
      setShowModaleCohort(false);
      setIsLoading(true);

      const { ok, code, data } = await api.put(`/cle/classe/${classe?._id}`, classe);

      if (!ok) {
        toastr.error("Oups, une erreur est survenue lors de la modification de la classe", translate(code));
        return setIsLoading(false);
      }
      setClasse(data);
      handleModiferReferent({ nom: classe.referents[0].lastName, prenom: classe.referents[0].firstName, email: classe.referents[0].email });
      closeForm();
      toastr.success("Succès", "La classe a bien été modifié");
    } catch (e) {
      capture(e);
      toastr.error("Oups, une erreur est survenue lors de la modification de la classe", e);
    } finally {
      setIsLoading(false);
    }
  };

  const closeForm = () => {
    setEdit(false);
    setEditRef(false);
    setEditStay(false);
    setIsLoading(false);
    setErrors({});
  };

  const reset = () => {
    setClasse(props.classe);
    closeForm();
  };

  if (!classe) return <Loader />;

  return (
    <Page>
      <ClasseHeader classe={classe} setClasse={setClasse} isLoading={isLoading} setIsLoading={setIsLoading} studentStatus={studentStatus} page={"Fiche de la classe"} />
      <GeneralInfos
        classe={classe}
        setClasse={setClasse}
        edit={edit}
        setEdit={setEdit}
        errors={errors}
        rights={rights}
        cohorts={cohorts}
        user={user}
        onCancel={reset}
        onCheckInfo={checkInfo}
        isLoading={isLoading}
        setIsLoading={setIsLoading}
        validatedYoung={validatedYoung}
      />



      {(rights.showCenter || rights.showPDR) && classe?.status !== STATUS_CLASSE.WITHDRAWN && (
        <SejourInfos
          classe={classe}
          setClasse={setClasse}
          editStay={editStay}
          setEditStay={setEditStay}
          rights={rights}
          errors={errors}
          user={user}
          infoBus={infoBus}
          onCancel={reset}
          isLoading={isLoading}
          onSendInfo={sendInfo}
        />
      )}

      {![STATUS_CLASSE.CREATED, STATUS_CLASSE.VERIFIED].includes(classe?.status as any) && (
        <StatsInfos classe={classe} user={user} studentStatus={studentStatus} validatedYoung={validatedYoung} />
      )}

      <ModaleCohort isOpen={showModaleCohort} onClose={() => setShowModaleCohort(false)} onSendInfo={sendInfo} />
    </Page>
  );
}
