import React, { useState, useEffect } from "react";
import { HiHome } from "react-icons/hi";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import dayjs from "dayjs";
import { toastr } from "react-redux-toastr";

import { Page, Header, Badge } from "@snu/ds/admin";
import { capture } from "@/sentry";
import api from "@/services/api";
import { translate, YOUNG_STATUS, STATUS_CLASSE, translateStatusClasse, COHORT_TYPE, LIMIT_DATE_ESTIMATED_SEATS } from "snu-lib";
import { getRights, statusClassForBadge } from "./utils";
import { appURL } from "@/config";
import Loader from "@/components/Loader";
import { ClasseDto } from "snu-lib";
import { AuthState } from "@/redux/auth/reducer";
import { CohortState } from "@/redux/cohorts/reducer";

import GeneralInfos from "./components/GeneralInfos";
import ReferentInfos from "./components/ReferentInfos";
import SejourInfos from "./components/SejourInfos";
import StatsInfos from "./components/StatsInfos";
import ModaleCohort from "./components/modaleCohort";
import { InfoBus, Rights } from "./components/types";
import { TStatus } from "@/types";
import { getHeaderActionList } from "./header";

export default function View() {
  const [classe, setClasse] = useState<ClasseDto | null>(null);
  const [url, setUrl] = useState("");
  const [studentStatus, setStudentStatus] = useState<{ [key: string]: number }>({});
  const [showModaleCohort, setShowModaleCohort] = useState(false);
  const { id } = useParams<{ id: string }>();
  const [errors, setErrors] = useState({});
  const [edit, setEdit] = useState(false);
  const [editStay, setEditStay] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [oldClasseCohort, setOldClasseCohort] = useState();
  const [infoBus, setInfoBus] = useState<InfoBus | null>(null);

  const user = useSelector((state: AuthState) => state.Auth.user);
  const cohorts = useSelector((state: CohortState) => state.Cohorts).filter(
    (c) => classe?.cohort === c.name || (c.type === COHORT_TYPE.CLE && getRights(user, classe, c).canEditCohort),
  );
  const cohort = cohorts.find((c) => c.name === classe?.cohort);
  const rights = getRights(user, classe, cohort) as Rights;

  const totalSeatsTakenExcluding =
    (classe?.seatsTaken ?? 0) -
    (studentStatus[YOUNG_STATUS.WITHDRAWN] || 0) -
    (studentStatus[YOUNG_STATUS.REFUSED] || 0) -
    (studentStatus[YOUNG_STATUS.NOT_AUTORISED] || 0) -
    (studentStatus[YOUNG_STATUS.IN_PROGRESS] || 0) -
    (studentStatus[YOUNG_STATUS.WAITING_CORRECTION] || 0) -
    (studentStatus[YOUNG_STATUS.WAITING_VALIDATION] || 0) -
    (studentStatus[YOUNG_STATUS.ABANDONED] || 0);

  const getClasse = async () => {
    try {
      const { ok, code, data: classe } = await api.get(`/cle/classe/${id}`);
      if (!ok) {
        return toastr.error("Oups, une erreur est survenue lors de la récupération de la classe", translate(code));
      }
      setClasse(classe);
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

      //Logical stuff
      setUrl(`${appURL}/je-rejoins-ma-classe-engagee?id=${classe._id.toString()}`);
      if (![STATUS_CLASSE.CREATED, STATUS_CLASSE.VERIFIED].includes(classe.status)) {
        getStudents(classe._id);
      }
    } catch (e) {
      capture(e);
      toastr.error("Oups, une erreur est survenue lors de la récupération de la classe", e);
    }
  };

  const getStudents = async (id) => {
    try {
      const { ok, code, data: response } = await api.get(`/cle/young/by-classe-stats/${id}`);

      if (!ok) {
        return toastr.error("Oups, une erreur est survenue lors de la récupération des élèves", translate(code));
      }
      setStudentStatus(response);
    } catch (e) {
      capture(e);
      toastr.error("Oups, une erreur est survenue lors de la récupération des élèves", e);
    }
  };

  useEffect(() => {
    getClasse();
  }, [id, edit, editStay]);

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
    }

    const errors: Errors = {};
    if (classe?.cohort !== oldClasseCohort && classe.ligneId) errors.cohort = "Vous ne pouvez pas modifier la cohorte car cette classe est affecté a une ligne de bus.";
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
      handleCancel();
    } catch (e) {
      capture(e);
      toastr.error("Oups, une erreur est survenue lors de la modification de la classe", e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setEdit(false);
    setEditStay(false);
    setIsLoading(false);
    setErrors({});
  };

  if (!classe) return <Loader />;

  return (
    <Page>
      <Header
        title={classe.name || "Informations nécessaires"}
        titleComponent={<Badge className="mx-4 mt-2" title={translateStatusClasse(classe.status)} status={statusClassForBadge(classe.status) as TStatus} />}
        breadcrumb={[
          { title: <HiHome size={20} className="text-gray-400 hover:text-gray-500" to="/" /> },
          {
            title: "Mes classes",
            to: "/classes",
          },
          { title: "Fiche de la classe" },
        ]}
        actions={getHeaderActionList({ user, classe, setClasse, isLoading, setIsLoading, url, id, studentStatus })}
      />
      <GeneralInfos
        classe={classe}
        setClasse={setClasse}
        edit={edit}
        setEdit={setEdit}
        errors={errors}
        rights={rights}
        cohorts={cohorts}
        user={user}
        onCancel={handleCancel}
        onCheckInfo={checkInfo}
        isLoading={isLoading}
        setIsLoading={setIsLoading}
        validatedYoung={totalSeatsTakenExcluding}
      />

      {classe.referents?.length > 0 && <ReferentInfos classe={classe} />}

      {(rights.showCenter || rights.showPDR) && (
        <SejourInfos
          classe={classe}
          setClasse={setClasse}
          editStay={editStay}
          setEditStay={setEditStay}
          rights={rights}
          errors={errors}
          user={user}
          infoBus={infoBus}
          onCancel={handleCancel}
          isLoading={isLoading}
          onSendInfo={sendInfo}
        />
      )}

      {![STATUS_CLASSE.CREATED, STATUS_CLASSE.VERIFIED].includes(classe?.status as any) && (
        <StatsInfos classe={classe} user={user} studentStatus={studentStatus} totalSeatsTakenExcluding={totalSeatsTakenExcluding} />
      )}

      <ModaleCohort isOpen={showModaleCohort} onClose={() => setShowModaleCohort(false)} onSendInfo={sendInfo} />
    </Page>
  );
}
