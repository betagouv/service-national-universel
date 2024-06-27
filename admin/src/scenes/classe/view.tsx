import React, { useState, useEffect } from "react";
import { HiOutlineOfficeBuilding } from "react-icons/hi";
import { AiOutlinePlus } from "react-icons/ai";
import { useParams, useHistory } from "react-router-dom";
import { useSelector } from "react-redux";
import dayjs from "dayjs";
import { toastr } from "react-redux-toastr";

import { Page, Header, Button, Badge, DropdownButton } from "@snu/ds/admin";
import { capture } from "@/sentry";
import api from "@/services/api";
import { translate, ROLES, YOUNG_STATUS, STATUS_CLASSE, translateStatusClasse, COHORT_TYPE, IS_INSCRIPTION_OPEN_CLE, FUNCTIONAL_ERRORS } from "snu-lib";
import { getRights, statusClassForBadge } from "./utils";
import { appURL } from "@/config";
import Loader from "@/components/Loader";
import plausibleEvent from "@/services/plausible";
import { downloadCertificatesByClassId } from "@/services/convocation.service";
import { usePendingAction } from "@/hooks/usePendingAction";
import { ClasseDto } from "snu-lib/src/dto/classeDto";
import { AuthState } from "@/redux/auth/reducer";
import { CohortState } from "@/redux/cohorts/reducer";

import GeneralInfos from "./components/GeneralInfos";
import ReferentInfos from "./components/ReferentInfos";
import SejourInfos from "./components/SejourInfos";
import StatsInfos from "./components/StatsInfos";
import DeleteButton from "./components/DeleteButton";
import ModaleWithdraw from "./components/modale/ModaleWithdraw";
import ModaleCohort from "./components/modale/modaleCohort";
import ButtonInvite from "./components/ButtonInvite";
import { InfoBus, TStatus, Rights } from "./components/types";

export default function View() {
  const [classe, setClasse] = useState<ClasseDto | null>(null);
  const [url, setUrl] = useState("");
  const [studentStatus, setStudentStatus] = useState<{ [key: string]: number }>({});
  const [showModaleWithdraw, setShowModaleWithdraw] = useState(false);
  const [showModaleCohort, setShowModaleCohort] = useState(false);
  const { id } = useParams<{ id: string }>();
  const [errors, setErrors] = useState({});
  const [edit, setEdit] = useState(false);
  const [editStay, setEditStay] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [oldClasseCohort, setOldClasseCohort] = useState();
  const [infoBus, setInfoBus] = useState<InfoBus | null>(null);
  const [isConvocationDownloading, handleConvocationDownload] = usePendingAction() as [boolean, any];

  const user = useSelector((state: AuthState) => state.Auth.user);
  const cohorts = useSelector((state: CohortState) => state.Cohorts).filter(
    (c) => classe?.cohort === c.name || (c.type === COHORT_TYPE.CLE && getRights(user, classe, c).canEditCohort),
  );
  const cohort = cohorts.find((c) => c.name === classe?.cohort);
  const rights = getRights(user, classe, cohort) as Rights;

  const history = useHistory();
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
      if (![STATUS_CLASSE.CREATED, STATUS_CLASSE.VERIFIED, STATUS_CLASSE.ASSIGNED].includes(classe.status)) {
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
      trimester?: string;
      type?: string;
    }

    const errors: Errors = {};
    if (classe?.cohort !== oldClasseCohort && classe.ligneId) errors.cohort = "Vous ne pouvez pas modifier la cohorte car cette classe est affecté a une ligne de bus.";
    if (!classe?.name) errors.name = "Ce champ est obligatoire";
    if (!classe?.coloration) errors.coloration = "Ce champ est obligatoire";
    if (!classe?.totalSeats) errors.totalSeats = "Ce champ est obligatoire";
    if (!classe?.filiere) errors.filiere = "Ce champ est obligatoire";
    if (!classe?.trimester) errors.trimester = "Ce champ est obligatoire";
    if (!classe?.estimatedSeats) errors.estimatedSeats = "Ce champ est obligatoire";
    if (!classe?.type) errors.type = "Ce champ est obligatoire";
    if (!classe?.grades.length) errors.grades = "Ce champ est obligatoire";
    if (classe?.grades && classe?.grades.length > 3) errors.grades = "Une classe ne peut avoir que 3 niveaux maximum";

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

  const onWithdraw = async () => {
    try {
      setIsLoading(true);
      const { ok, code } = await api.remove(`/cle/classe/${classe?._id}?type=withdraw`);
      if (!ok) {
        toastr.error("Oups, une erreur est survenue lors de la suppression", translate(code));
        return setIsLoading(false);
      }
      history.push("/classes");
    } catch (e) {
      capture(e);
      toastr.error("Oups, une erreur est survenue lors de la suppression", e);
    } finally {
      setIsLoading(false);
      setShowModaleWithdraw(false);
    }
  };

  const onInscription = () => {
    plausibleEvent("Inscriptions/CTA - Nouvelle inscription");
    history.push(`/volontaire/create?classeId=${classe?._id}`);
  };

  const handleCertificateDownload = () => {
    const getErrorMessage = (error) => {
      let errorMessage = "Téléchargement des convocations impossible";
      if (FUNCTIONAL_ERRORS.TOO_MANY_YOUNGS_IN_CLASSE === error.code) {
        errorMessage = "Le nombre de convocations est trop élevé";
      }
      return errorMessage;
    };
    handleConvocationDownload(
      downloadCertificatesByClassId(classe?._id),
      "Téléchargement des convocations en cours",
      "Les convocations ont bien été téléchargées",
      getErrorMessage,
    );
  };

  const isClasseDeletable = () => {
    if (studentStatus?.[YOUNG_STATUS.VALIDATED] > 0) return false;
    if (classe?.cohesionCenterId) return false;
    if (classe?.sessionId) return false;
    if (classe?.ligneId) return false;
    return true;
  };

  const headerActionList = () => {
    const actionsList: React.ReactNode[] = [];

    if (classe?.status && [STATUS_CLASSE.OPEN].includes(classe.status) && IS_INSCRIPTION_OPEN_CLE) {
      actionsList.push(
        <Button key="inscription" leftIcon={<AiOutlinePlus size={20} className="mt-1" />} title="Inscrire un élève" className="mr-2" onClick={onInscription} />,
        <ButtonInvite key="invite" url={url} />,
      );
    }
    if (studentStatus?.[YOUNG_STATUS.VALIDATED] > 0) {
      actionsList.push(<Button disabled={isConvocationDownloading} key="export" title="Exporter toutes les convocations" className="mr-2" onClick={handleCertificateDownload} />);
    }
    if (user.role === ROLES.ADMIN) {
      const options = [
        {
          key: "actions",
          title: "Actions",
          items: [
            {
              key: "edit1",
              render: classe && <DeleteButton classe={classe} onLoading={setIsLoading} />,
            },
          ],
        },
      ];
      actionsList.push(
        <DropdownButton
          key="edit"
          type="secondary"
          title="Actions"
          optionsGroup={options}
          position="right"
          tooltip="Vous ne pouvez pas supprimer une classe si des élèves sont validés, ou si la classe est affectée à un centre."
          disabled={!isClasseDeletable()}
        />,
      );
    }
    return actionsList;
  };

  if (!classe) return <Loader />;

  return (
    <Page>
      <Header
        title={classe.name || "Informations nécessaires"}
        titleComponent={<Badge className="mx-4 mt-2" title={translateStatusClasse(classe.status)} status={statusClassForBadge(classe.status) as TStatus} />}
        breadcrumb={[
          { title: <HiOutlineOfficeBuilding size={20} /> },
          {
            title: "Mes classes",
            to: "/classes",
          },
          { title: "Fiche de la classe" },
        ]}
        actions={headerActionList()}
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
        setShowModaleWithdraw={setShowModaleWithdraw}
        isLoading={isLoading}
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

      {![STATUS_CLASSE.CREATED, STATUS_CLASSE.ASSIGNED, STATUS_CLASSE.VERIFIED].includes(classe?.status) && (
        <StatsInfos classe={classe} user={user} studentStatus={studentStatus} totalSeatsTakenExcluding={totalSeatsTakenExcluding} />
      )}

      <ModaleWithdraw isOpen={showModaleWithdraw} onClose={() => setShowModaleWithdraw(false)} onWithdraw={onWithdraw} />
      <ModaleCohort isOpen={showModaleCohort} onClose={() => setShowModaleCohort(false)} onSendInfo={sendInfo} />
    </Page>
  );
}
