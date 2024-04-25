import React, { useState, useEffect } from "react";
import { ProfilePic } from "@snu/ds";
import { Page, Header, Container, Button, Badge, Label, InputText, Modal, Select, ModalConfirmation } from "@snu/ds/admin";
import { HiOutlinePencil, HiOutlineOfficeBuilding } from "react-icons/hi";
import { AiOutlinePlus } from "react-icons/ai";
import { BsSend, BsTrash3 } from "react-icons/bs";
import { Link } from "react-router-dom";
import { useParams, useHistory } from "react-router-dom";
import { capture } from "@/sentry";
import api from "@/services/api";
import { toastr } from "react-redux-toastr";
import {
  translate,
  CLE_COLORATION_LIST,
  CLE_GRADE_LIST,
  CLE_FILIERE_LIST,
  ROLES,
  YOUNG_STATUS,
  translateGrade,
  translateColoration,
  STATUS_CLASSE,
  translateStatusClasse,
  COHORT_TYPE,
  IS_INSCRIPTION_OPEN_CLE,
} from "snu-lib";
import { FUNCTIONAL_ERRORS } from "snu-lib/functionalErrors";
import { useSelector } from "react-redux";
import { getRights, statusClassForBadge } from "./utils";
import { appURL } from "@/config";
import { copyToClipboard } from "@/utils";
import { MdContentCopy } from "react-icons/md";
import Loader from "@/components/Loader";
import { IoWarningOutline } from "react-icons/io5";
import { MdOutlineDangerous } from "react-icons/md";
import plausibleEvent from "@/services/plausible";
import dayjs from "dayjs";
import { downloadCertificatesByClassId } from "@/services/convocation.service";
import { usePendingAction } from "@/hooks/usePendingAction";

export default function View() {
  const [classe, setClasse] = useState({});
  const [url, setUrl] = useState("");
  const [studentStatus, setStudentStatus] = useState([]);
  const [modalInvite, setModalInvite] = useState(false);
  const [modalDelete, setModalDelete] = useState(false);
  const { id } = useParams();
  const [errors, setErrors] = useState({});
  const [edit, setEdit] = useState(false);
  const [editStay, setEditStay] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [infoBus, setInfoBus] = useState(null);
  const [isConvocationDownloading, handleConvocationDownload] = usePendingAction();

  const user = useSelector((state) => state.Auth.user);
  const cohorts = useSelector((state) => state.Cohorts).filter((c) => classe?.cohort === c.name || (c.type === COHORT_TYPE.CLE && getRights(user, classe, c).canEditCohort));
  const cohort = cohorts.find((c) => c.name === classe?.cohort);
  const rights = getRights(user, classe, cohort);

  const history = useHistory();
  const totalSeatsTakenExcluding =
    classe.seatsTaken -
    (studentStatus[YOUNG_STATUS.WITHDRAWN] || 0) -
    (studentStatus[YOUNG_STATUS.REFUSED] || 0) -
    (studentStatus[YOUNG_STATUS.NOT_AUTORISED] || 0) -
    (studentStatus[YOUNG_STATUS.IN_PROGRESS] || 0) -
    (studentStatus[YOUNG_STATUS.WAITING_CORRECTION] || 0) -
    (studentStatus[YOUNG_STATUS.WAITING_VALIDATION] || 0) -
    (studentStatus[YOUNG_STATUS.ABANDONED] || 0);

  const colorOptions = Object.keys(CLE_COLORATION_LIST).map((value) => ({
    value: CLE_COLORATION_LIST[value],
    label: translateColoration(CLE_COLORATION_LIST[value]),
  }));
  const filiereOptions = Object.keys(CLE_FILIERE_LIST).map((value) => ({
    value: CLE_FILIERE_LIST[value],
    label: CLE_FILIERE_LIST[value],
  }));
  const gradeOptions = Object.keys(CLE_GRADE_LIST).map((value) => ({
    value: CLE_GRADE_LIST[value],
    label: translateGrade(CLE_GRADE_LIST[value]),
  }));

  const getClasse = async () => {
    try {
      const { ok, code, data: classe } = await api.get(`/cle/classe/${id}`);
      if (!ok) {
        return toastr.error("Oups, une erreur est survenue lors de la récupération de la classe", translate(code));
      }
      setClasse(classe);
      if (classe?.ligneId) {
        //Bus
        const { ok: ok1, code: code1, data: ligne } = await api.get(`/ligne-de-bus/${classe.ligneId}`);
        if (!ok1) {
          return toastr.error("Oups, une erreur est survenue lors de la récupération des lignes de bus", translate(code1));
        }
        let meetingPoint = ligne.meetingsPointsDetail.find((e) => e.meetingPointId === classe.pointDeRassemblementId);

        setInfoBus({
          busId: ligne.busId,
          departureDate: dayjs(ligne.departuredDate).format("dddd D MMMM YYYY"),
          meetingHour: meetingPoint.meetingHour,
          departureHour: meetingPoint.departureHour,
          returnDate: dayjs(ligne.returnDate).format("dddd D MMMM YYYY"),
          returnHour: meetingPoint.returnHour,
        });
      }

      //Logical stuff
      setUrl(`${appURL}/je-rejoins-ma-classe-engagee?id=${classe._id.toString()}`);
      if (classe.status !== STATUS_CLASSE.DRAFT) {
        getStudents(classe._id);
      }
    } catch (e) {
      capture(e);
      toastr.error("Oups, une erreur est survenue lors de la récupération de la classe");
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
      toastr.error("Oups, une erreur est survenue lors de la récupération des élèves");
    }
  };

  useEffect(() => {
    getClasse();
  }, [id]);

  const sendInfo = async () => {
    try {
      setIsLoading(true);
      setErrors({});
      let errors = {};
      if (!classe.name) errors.name = "Ce champ est obligatoire";
      if (!classe.coloration) errors.coloration = "Ce champ est obligatoire";
      if (!classe.totalSeats) errors.totalSeats = "Ce champ est obligatoire";
      if (!classe.filiere) errors.filiere = "Ce champ est obligatoire";
      if (!classe.grade) errors.grade = "Ce champ est obligatoire";

      if (Object.keys(errors).length > 0) {
        setErrors(errors);
        setIsLoading(false);
        return;
      }

      const { ok, code, data } = await api.put(`/cle/classe/${classe._id}`, classe);

      if (!ok) {
        toastr.error("Oups, une erreur est survenue lors de la modification de la classe", translate(code));
        return setIsLoading(false);
      }
      setClasse(data);
      onCancel();
    } catch (e) {
      capture(e);
      toastr.error("Oups, une erreur est survenue lors de la modification de la classe");
    } finally {
      setIsLoading(false);
    }
  };

  const onCancel = () => {
    setEdit(false);
    setEditStay(false);
    setIsLoading(false);
    setErrors({});
  };

  const onDelete = async () => {
    try {
      setIsLoading(true);
      //delete data
      const { ok, code } = await api.remove(`/cle/classe/${classe._id}`);
      if (!ok) {
        toastr.error("Oups, une erreur est survenue lors de la suppression", translate(code));
        return setIsLoading(false);
      }
      history.push("/classes");
    } catch (e) {
      capture(e);
      toastr.error("Oups, une erreur est survenue lors de la suppression");
      setIsLoading(false);
    }
  };

  const handleClick = () => {
    plausibleEvent("Inscriptions/CTA - Nouvelle inscription");
    history.push(`/volontaire/create?classeId=${classe._id}`);
  };

  const handleCertificateDownload = () => {
    const getErrorMessage = (error) => {
      let errorMessage = "Téléchargement des convocations impossible";
      if (FUNCTIONAL_ERRORS.TOO_MANY_YOUNGS_IN_CLASSE === error.code) {
        errorMessage = "Le nombre de convocations est trop élevé";
      }
      return errorMessage;
    };
    handleConvocationDownload(downloadCertificatesByClassId(classe._id), "Téléchargement des convocations en cours", "Les convocations ont bien été téléchargées", getErrorMessage);
  };

  const actionList = ({ edit, setEdit, canEdit }) => {
    return edit ? (
      <div className="flex items-center justify-end ml-6">
        <Button key="cancel" type="cancel" title="Annuler" onClick={onCancel} disabled={isLoading} />
        <Button key="validate" type="primary" title="Valider" className={"!h-8 ml-2"} onClick={sendInfo} loading={isLoading} disabled={isLoading} />
      </div>
    ) : canEdit ? (
      [<Button key="change" type="modify" leftIcon={<HiOutlinePencil size={16} />} title="Modifier" onClick={() => setEdit(!edit)} disabled={isLoading} />]
    ) : null;
  };

  if (!classe) return <Loader />;

  return (
    <Page>
      <Header
        title={classe.name || "Informations nécessaires"}
        titleComponent={<Badge className="mx-4 mt-2" title={translateStatusClasse(classe.status)} status={statusClassForBadge(classe.status)} />}
        breadcrumb={[
          { title: <HiOutlineOfficeBuilding size={20} /> },
          {
            title: "Mes classes",
            to: "/classes",
          },
          { title: "Fiche de la classe" },
        ]}
        actions={
          (![STATUS_CLASSE.DRAFT, STATUS_CLASSE.WITHDRAWN, STATUS_CLASSE.VALIDATED].includes(classe.status) &&
            IS_INSCRIPTION_OPEN_CLE && [
              <Button key="inscription" leftIcon={<AiOutlinePlus size={20} className="mt-1" />} title="Inscrire un élève" className="mr-2" onClick={handleClick} />,
              <Button key="invite" leftIcon={<BsSend />} title="Inviter des élèves" onClick={() => setModalInvite(true)} />,
            ]) ||
          (studentStatus?.[YOUNG_STATUS.VALIDATED] > 0 && [
            <Button disabled={isConvocationDownloading} key="export" title="Exporter toutes les convocations" onClick={handleCertificateDownload} />,
          ])
        }
      />
      <Container title="Informations générales" actions={actionList({ edit, setEdit, canEdit: rights.canEdit })}>
        <div className="flex items-stretch justify-stretch">
          <div className="flex-1">
            {rights.showCohort && (
              <>
                <Label title="Cohorte" name="Cohorte" tooltip="La cohorte sera mise à jour lors de la validation des dates d'affectation." />
                <Select
                  className="mb-3"
                  isActive={edit && rights.canEditCohort}
                  readOnly={!edit || !rights.canEditCohort}
                  disabled={!rights.canEditCohort}
                  placeholder={"Choisissez une cohorte"}
                  options={cohorts?.map((c) => ({ value: c.name, label: c.name }))}
                  closeMenuOnSelect={true}
                  value={classe?.cohort ? { value: classe?.cohort, label: classe?.cohort } : null}
                  onChange={(options) => {
                    setClasse({ ...classe, cohort: options.value });
                  }}
                  error={errors.cohort}
                />
                <div className="flex flex-col gap-2 rounded-lg bg-gray-100 px-3 py-2 mb-3">
                  <p className="text-left text-sm  text-gray-800">Dates</p>
                  <div className="flex items-center">
                    <p className="text-left text-xs text-gray-500 flex-1">
                      Début : <strong>{classe?.cohort ? dayjs(cohorts.find((c) => c.name === classe?.cohort)?.dateStart).format("DD/MM/YYYY") : ""}</strong>
                    </p>
                    <p className="text-left text-xs text-gray-500 flex-1">
                      Fin : <strong>{classe?.cohort ? dayjs(cohorts.find((c) => c.name === classe?.cohort)?.dateEnd).format("DD/MM/YYYY") : ""}</strong>
                    </p>
                  </div>
                </div>
              </>
            )}
            <Label title="Numéro d’identification" />
            <div className="flex items-center justify-between gap-3 mb-3">
              <InputText className="flex-1" value={classe.uniqueKey} disabled />
              <InputText className="flex-1" value={classe.uniqueId} disabled />
            </div>
            <Label title="Nom de la classe engagée" name="Class-name" tooltip="Identité du groupe formé." />
            <InputText className="mb-3" value={classe.name} onChange={(e) => setClasse({ ...classe, name: e.target.value })} error={errors.name} readOnly={!edit} active={edit} />
            <Label title="Coloration souhaitée" name="coloration" tooltip="Les colorations définitives seront confirmées au moment des affectations." />
            <Select
              className="mb-3"
              isActive={edit}
              readOnly={!edit}
              placeholder={"Choisissez une coloration"}
              options={colorOptions}
              closeMenuOnSelect={true}
              value={classe?.coloration ? { value: classe?.coloration, label: translate(classe?.coloration) } : null}
              onChange={(options) => {
                setClasse({ ...classe, coloration: options.value });
              }}
              error={errors.coloration}
            />
          </div>
          <div className="mx-14 w-[1px] bg-gray-200 shrink-0">&nbsp;</div>
          <div className="flex-1">
            <Label
              title="Nombre d'élèves"
              name="totalSeats"
              tooltip="Pour qu'une classe soit considérée comme complète et puisse être validée, 100% des élèves doivent être inscrits (ou désistés). Vous pouvez modifier le nombre d'élèves dans le cas d'un changement d'effectif en cours d'année."
            />
            <InputText
              className="mb-3"
              type="number"
              value={classe.totalSeats}
              error={errors.totalSeats}
              onChange={(e) => setClasse({ ...classe, totalSeats: e.target.value })}
              readOnly={!edit}
              active={edit}
            />
            <Label
              title="Situation scolaire"
              name="class-situation"
              tooltip="C'est la situation de la classe. Une exception au niveau d'un élève qui viendrait d'une autres filière ou d'un autre niveau peut être gérer au niveau du profil de l'élève concerné."
            />
            <Select
              className="mb-3"
              isActive={edit}
              readOnly={!edit}
              placeholder={"Choisissez une filière"}
              options={filiereOptions}
              closeMenuOnSelect={true}
              value={classe?.filiere ? { value: classe?.filiere, label: translate(classe?.filiere) } : null}
              onChange={(options) => {
                setClasse({ ...classe, filiere: options.value });
              }}
              error={errors.filiere}
            />
            <Select
              className="mb-3"
              isActive={edit}
              readOnly={!edit}
              placeholder={"Choisissez un niveau"}
              options={gradeOptions}
              closeMenuOnSelect={true}
              value={classe?.grade ? { value: classe?.grade, label: translateGrade(classe?.grade) } : null}
              onChange={(options) => {
                setClasse({ ...classe, grade: options.value });
              }}
              error={errors.grade}
            />
            {[ROLES.ADMIN, ROLES.REFERENT_DEPARTMENT, ROLES.REFERENT_REGION].includes(user.role) && (
              <>
                <InputText className="mb-3" value={classe.etablissement?.name} readOnly={true} label="Établissement" />
                <Link to={`/etablissement/${classe.etablissementId}`} className="w-full">
                  <Button type="tertiary" title="Voir l'établissement" className="w-full max-w-none" />
                </Link>
              </>
            )}
            {edit && user.role === ROLES.ADMINISTRATEUR_CLE ? (
              <div className="flex items-center justify-end mt-6">
                <button type="button" className="flex items-center justify-center text-xs text-red-500 hover:text-red-700" onClick={() => setModalDelete(true)}>
                  <BsTrash3 className="mr-2" />
                  Désister la classe
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </Container>

      {classe?.referents?.length > 0 && (
        <Container title="Référent de classe" actions={[]}>
          <div className="flex items-stretch justify-stretch">
            <div className="flex-1">
              <InputText className="mb-3" value={classe?.referents[0]?.lastName} label={"Nom"} disabled={true} />
              <InputText className="mb-3" value={classe?.referents[0]?.firstName} label={"Prénom"} disabled={true} />
            </div>
            <div className="mx-14 w-[1px] bg-gray-200 shrink-0">&nbsp;</div>
            <div className="flex-1">
              <InputText className="mb-3" label={"Adresse Email"} value={classe.referents[0].email} disabled={true} />
            </div>
          </div>
        </Container>
      )}

      {(rights.showCenter || rights.showPDR) && (
        <Container
          title="Séjour"
          actions={actionList({
            edit: editStay,
            setEdit: setEditStay,
            canEdit: rights.canEditCenter || rights.canEditPDR,
          })}>
          <div className="flex items-stretch justify-stretch">
            {rights.showCenter && (
              <div className="flex-1">
                <Label
                  title="Centre"
                  name="centre"
                  tooltip="vous devez indiquez la cohorte avant d'indiquer le centre, si la cohorte séléctionner est CLE 23 24, vous ne pourrez associer aucun centre"
                />
                <Select
                  isAsync
                  className="mb-3"
                  placeholder={"Choisissez un centre existant"}
                  loadOptions={(q) => searchSessions({ q, cohort: classe.cohort })}
                  defaultOptions={() => searchSessions({ q: "", cohort: classe.cohort })}
                  noOptionsMessage={"Aucun centre ne correspond à cette recherche"}
                  isClearable={true}
                  closeMenuOnSelect={true}
                  value={classe.cohesionCenter?.name ? { label: classe.cohesionCenter.name } : null}
                  onChange={(option) =>
                    setClasse({
                      ...classe,
                      session: option?.session,
                      sessionId: option?._id,
                      cohesionCenter: option?.session.cohesionCenter,
                      cohesionCenterId: option?.session.cohesionCenter._id,
                    })
                  }
                  error={errors.session}
                  isActive={editStay && rights.canEditCenter}
                  readOnly={!editStay || !rights.canEditCenter}
                  disabled={!rights.canEditCenter || classe?.cohort === "CLE 23-24"}
                />
                {classe.cohesionCenter && (
                  <>
                    <InputText className="mb-3" label="Numéro et nom de la voie" value={classe.cohesionCenter.address} disabled />
                    <div className="flex items-center justify-between gap-3 mb-3">
                      <InputText className="flex-1" label="Code Postal" value={classe.cohesionCenter.zip} disabled />
                      <InputText className="flex-1" label="Ville" value={classe.cohesionCenter.city} disabled />
                    </div>
                    <div className="flex items-center justify-between gap-3 mb-3">
                      <InputText className="flex-1" label="Département" value={classe.cohesionCenter.department} disabled />
                      <InputText className="flex-1" label="Région" value={classe.cohesionCenter.region} disabled />
                    </div>
                    {![ROLES.REFERENT_CLASSE, ROLES.ADMINISTRATEUR_CLE].includes(user.role) && (
                      <Link to={`/centre/` + classe.cohesionCenter._id} className="w-full">
                        <Button type="tertiary" title="Voir le centre" className="w-full max-w-none" />
                      </Link>
                    )}
                  </>
                )}
              </div>
            )}
            {rights.showCenter && rights.showPDR && <div className="mx-14 w-[1px] bg-gray-200 shrink-0">&nbsp;</div>}
            {rights.showPDR && (
              <div className="flex-1">
                <Label
                  title="Point de rassemblement"
                  name="pdr"
                  tooltip="Le point de rassemblement est automatiquement pré rempli avec l'adresse de l'établissement, vous pouvez le modifier si besoin"
                />
                <Select
                  isAsync
                  className="mb-3"
                  placeholder={"Choisissez un point de rassemblement existant"}
                  loadOptions={(q) => searchPointDeRassemblements({ q, cohort: classe.cohort })}
                  defaultOptions={() =>
                    searchPointDeRassemblements({
                      q: classe.etablissement?.name,
                      cohort: classe.cohort,
                    })
                  }
                  noOptionsMessage={"Aucun point de rassemblement ne correspond à cette recherche"}
                  isClearable={true}
                  closeMenuOnSelect={true}
                  value={
                    classe.pointDeRassemblement?.name && classe.pointDeRassemblement?.department
                      ? { label: `${classe.pointDeRassemblement?.name}, ${classe.pointDeRassemblement?.department}` }
                      : null
                  }
                  onChange={(option) =>
                    setClasse({
                      ...classe,
                      pointDeRassemblement: option?.pointDeRassemblement,
                      pointDeRassemblementId: option?._id,
                    })
                  }
                  error={errors.pointDeRassemblement}
                  isActive={editStay && rights.canEditPDR}
                  readOnly={!editStay || !rights.canEditPDR}
                  disabled={!rights.canEditPDR || classe?.cohort === "CLE 23-24"}
                />
                {classe.pointDeRassemblement && (
                  <>
                    <InputText className="mb-3" label="Numéro et nom de la voie" value={classe.pointDeRassemblement?.address} disabled />
                    <div className="flex items-center justify-between gap-3 mb-3">
                      <InputText className="flex-1" label="Code Postal" value={classe.pointDeRassemblement?.zip} disabled />
                      <InputText className="flex-1" label="Ville" value={classe.pointDeRassemblement?.city} disabled />
                    </div>
                    <div className="flex items-center justify-between gap-3 mb-3">
                      <InputText className="flex-1" label="Département" value={classe.pointDeRassemblement?.department} disabled />
                      <InputText className="flex-1" label="Région" value={classe.pointDeRassemblement?.region} disabled />
                    </div>
                    {![ROLES.REFERENT_CLASSE, ROLES.ADMINISTRATEUR_CLE].includes(user.role) && (
                      <Link to={`/point-de-rassemblement/` + classe.pointDeRassemblement._id} className="w-full">
                        <Button type="tertiary" title="Voir le point de rassemblement" className="w-full max-w-none" />
                      </Link>
                    )}
                  </>
                )}
                {infoBus && (
                  <div className="mt-3">
                    <Label title="Transport" name="ligneBus" />
                    <InputText className="mb-3" label="Numéro de transport" value={infoBus.busId} disabled />
                    <Label title="Aller" name="Aller" />
                    <div className="flex gap-3">
                      <InputText className="mb-3" label="Date&nbsp;de&nbsp;départ" value={infoBus.departureDate} disabled />
                      <InputText className="mb-3" label="Heure&nbsp;de&nbsp;convocation" value={infoBus.meetingHour} disabled />
                      <InputText className="mb-3" label="Heure&nbsp;de&nbsp;départ" value={infoBus.departureHour} disabled />
                    </div>
                    <Label title="Retour" name="Retour" />
                    <div className="flex gap-3 w-full">
                      <InputText className="mb-3 w-1/2" label="Date&nbsp;de&nbsp;retour" value={infoBus.returnDate} disabled />
                      <InputText className="mb-3 w-1/2" label="Heure&nbsp;de&nbsp;retour" value={infoBus.returnHour} disabled />
                    </div>

                    {![ROLES.REFERENT_CLASSE, ROLES.ADMINISTRATEUR_CLE].includes(user.role) && (
                      <Link to={`/ligne-de-bus/` + classe.ligneId} className="w-full">
                        <Button type="tertiary" title="Voir la ligne de bus" className="w-full max-w-none" />
                      </Link>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </Container>
      )}

      {classe?.status !== STATUS_CLASSE.DRAFT ? (
        <Container
          title="Suivi de la classe"
          actions={[
            <Link key="list-students" to={`${[ROLES.ADMINISTRATEUR_CLE, ROLES.REFERENT_CLASSE].includes(user.role) ? "/mes-eleves" : "/inscription"}?classeId=${classe._id}`}>
              <Button type="tertiary" title="Voir les élèves" />
            </Link>,
          ]}>
          <div className="flex justify-between">
            <table className="flex-1">
              <tbody>
                <tr className="border-b border-gray-200">
                  <td className="font-bold pr-4 py-2">Objectif :</td>
                  <td className="px-4 font-bold text-lg text-center py-2">{classe.totalSeats || 0}</td>
                  <td className="text-gray-500 text-center py-2">Élèves</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="font-bold pr-4 py-2">Total :</td>
                  <td className="px-4 font-bold text-lg text-center py-2">{totalSeatsTakenExcluding}</td>
                  <td className="text-gray-500 text-center py-2">({Math.round((totalSeatsTakenExcluding * 100) / classe.totalSeats || 0)}%)</td>
                </tr>
                <tr>
                  <td className="font-bold pr-4 py-2">Places libres :</td>
                  <td className="px-4 font-bold text-lg text-center py-2">{classe.totalSeats - classe.seatsTaken < 0 ? 0 : classe.totalSeats - classe.seatsTaken}</td>
                  <td className="text-gray-500 text-center py-2">
                    ({Math.round(100 - (classe.seatsTaken * 100) / classe.totalSeats) < 0 ? 0 : Math.round(100 - (classe.seatsTaken * 100) / classe.totalSeats)}%)
                  </td>
                </tr>
              </tbody>
            </table>
            <div className="mx-8 w-[1px] bg-gray-200">&nbsp;</div>
            <table className="flex-1">
              <tbody>
                <tr>
                  <td className="font-bold text-lg text-right">{studentStatus[YOUNG_STATUS.VALIDATED] || 0}</td>
                  <td className="px-4 flex-1">Élèves validés</td>
                  <td className="text-gray-500">({Math.round((studentStatus[YOUNG_STATUS.VALIDATED] * 100) / studentStatus.total || 0)}%)</td>
                </tr>
                <tr>
                  <td className="font-bold text-lg text-right">{studentStatus[YOUNG_STATUS.IN_PROGRESS] || 0}</td>
                  <td className="px-4 flex-1">Élèves en cours d'inscription</td>
                  <td className="text-gray-500">({Math.round((studentStatus[YOUNG_STATUS.IN_PROGRESS] * 100) / studentStatus.total || 0)}%)</td>
                </tr>
                <tr>
                  <td className="font-bold text-lg text-right">{studentStatus[YOUNG_STATUS.WAITING_VALIDATION] || 0}</td>
                  <td className="px-4 flex-1">Élèves en attente de validation</td>
                  <td className="text-gray-500">({Math.round((studentStatus[YOUNG_STATUS.WAITING_VALIDATION] * 100) / studentStatus.total || 0)}%)</td>
                </tr>
                <tr>
                  <td className="font-bold text-lg text-right">{studentStatus[YOUNG_STATUS.WAITING_CORRECTION] || 0}</td>
                  <td className="px-4 flex-1">Élèves en attente de correction</td>
                  <td className="text-gray-500">({Math.round((studentStatus[YOUNG_STATUS.WAITING_CORRECTION] * 100) / studentStatus.total || 0)}%)</td>
                </tr>
              </tbody>
            </table>
            <div className="mx-8 w-[1px] bg-gray-200">&nbsp;</div>
            <table className="flex-1">
              <tbody>
                <tr>
                  <td className="font-bold text-lg text-right">{studentStatus[YOUNG_STATUS.ABANDONED] || 0}</td>
                  <td className="px-4 flex-1">Inscriptions abandonnées</td>
                  <td className="text-gray-500">({Math.round((studentStatus[YOUNG_STATUS.ABANDONED] * 100) / studentStatus.total || 0)}%)</td>
                </tr>
                <tr className="">
                  <td className="font-bold text-lg text-right">{studentStatus[YOUNG_STATUS.NOT_AUTORISED] || 0}</td>
                  <td className="px-4 flex-1">Élèves non autorisés</td>
                  <td className="text-gray-500">({Math.round((studentStatus[YOUNG_STATUS.NOT_AUTORISED] * 100) / studentStatus.total || 0)}%)</td>
                </tr>
                <tr>
                  <td className="font-bold text-lg text-right">{studentStatus[YOUNG_STATUS.WITHDRAWN] || 0}</td>
                  <td className="px-4 flex-1">Élèves désistés</td>
                  <td className="text-gray-500">({Math.round((studentStatus[YOUNG_STATUS.WITHDRAWN] * 100) / studentStatus.total || 0)}%)</td>
                </tr>
                <tr>
                  <td className="font-bold text-lg text-right">{studentStatus[YOUNG_STATUS.REFUSED] || 0}</td>
                  <td className="px-4 flex-1">Élèves refusés</td>
                  <td className="text-gray-500">({Math.round((studentStatus[YOUNG_STATUS.REFUSED] * 100) / studentStatus.total || 0)}%)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Container>
      ) : null}
      <ModalConfirmation
        isOpen={modalDelete}
        onClose={() => {
          setModalDelete(false);
        }}
        className="md:max-w-[700px]"
        icon={<IoWarningOutline className="text-red-500" size={40} />}
        title="Attention, vous êtes sur le point de désister cette classe."
        text="Cette action entraînera l'abandon de l'inscription de tous les élèves de cette classe."
        actions={[
          { title: "Annuler", isCancel: true },
          {
            title: "Désister la classe",
            leftIcon: <MdOutlineDangerous size={20} />,
            onClick: onDelete,
            isDestructive: true,
          },
        ]}
      />
      <Modal
        isOpen={modalInvite}
        className="w-[700px]"
        onClose={() => setModalInvite(false)}
        content={
          <div className="flex flex-col items-center justify-center">
            <ProfilePic icon={({ size, className }) => <BsSend size={size} className={className} />} />
            <h1 className="text-xl leading-7 font-medium text-gray-900 mt-6">Invitez des élèves à rejoindre votre classe !</h1>
            <p className="text-base leading-5 font-normal text-gray-900 mt-6 mb-">Vous pouvez inviter des élèves à rejoindre votre classe en leur partageant ce lien : </p>
            <a href={url} className="text-base leading-5 font-normal text-blue-600" rel="noreferrer" target="_blank">
              {url}
            </a>
            <Button
              type="secondary"
              leftIcon={<MdContentCopy className="h-5 w-5" />}
              title="Copier le lien"
              className="mt-6 !w-80 flex items-center justify-center"
              onClick={() => {
                copyToClipboard(`${appURL}/je-rejoins-ma-classe-engagee/${url}`);
                setModalInvite(false);
              }}
            />
          </div>
        }
      />
    </Page>
  );
}

const searchSessions = async ({ q, cohort }) => {
  if (!cohort || cohort === "CLE 23-24") return [];

  const query = {
    filters: {
      cohort: [cohort],
    },
    page: 0,
    size: 10,
  };
  if (q) query.filters.searchbar = [q];

  const { responses } = await api.post(`/elasticsearch/sessionphase1/search?needCohesionCenterInfo=true`, query);
  return responses[0].hits.hits.map((hit) => {
    return {
      value: hit._source,
      _id: hit._id,
      label: hit._source.cohesionCenter.name,
      session: { ...hit._source, _id: hit._id },
    };
  });
};

const searchPointDeRassemblements = async ({ q, cohort }) => {
  if (!cohort || cohort === "CLE 23-24") return [];

  const query = {
    filters: {
      cohorts: [cohort],
    },
    page: 0,
    size: 10,
  };
  if (q) query.filters.searchbar = [q];

  const { responses } = await api.post(`/elasticsearch/pointderassemblement/search`, query);
  return responses[0].hits.hits.map((hit) => {
    return {
      value: hit._source,
      _id: hit._id,
      label: `${hit._source.name}, ${hit._source.department}`,
      pointDeRassemblement: { ...hit._source, _id: hit._id },
    };
  });
};
