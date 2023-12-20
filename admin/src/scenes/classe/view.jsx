import React, { useState, useEffect } from "react";
import { ProfilePic } from "@snu/ds";
import { Page, Header, Container, Button, Badge, Label, InputText, Modal, Select, ModalConfirmation } from "@snu/ds/admin";
import { HiOutlinePencil, HiOutlineOfficeBuilding } from "react-icons/hi";
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
} from "snu-lib";
import { useSelector } from "react-redux";
import { statusClassForBadge } from "./utils";
import { appURL } from "@/config";
import { copyToClipboard } from "@/utils";
import { MdContentCopy } from "react-icons/md";
import Loader from "@/components/Loader";
import { IoWarningOutline } from "react-icons/io5";
import { MdOutlineDangerous } from "react-icons/md";

export default function view() {
  const [classe, setClasse] = useState({});
  const [url, setUrl] = useState("");
  const [studentStatus, setStudentStatus] = useState([]);
  const [modalInvite, setModalInvite] = useState(false);
  const [modalDelete, setModalDelete] = useState(false);
  const { id } = useParams();
  const [errors, setErrors] = useState({});
  const user = useSelector((state) => state.Auth.user);
  const [edit, setEdit] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [canEditCohort, setCanEditCohort] = useState(false);
  const [cohorts, setCohorts] = useState([]);

  const history = useHistory();

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
      const { ok, code, data: response } = await api.get(`/cle/classe/${id}`);

      if (!ok) {
        return toastr.error("Oups, une erreur est survenue lors de la récupération de la classe", translate(code));
      }
      setClasse(response);
      setUrl(`${appURL}/je-rejoins-ma-classe-engagee?id=${response._id.toString()}`);
      if (response.status !== STATUS_CLASSE.DRAFT) {
        getStudents(response._id);
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
  }, [edit]);

  useEffect(() => {
    if (!user) return;
    setCanEditCohort([ROLES.ADMIN, ROLES.REFERENT_DEPARTMENT, ROLES.REFERENT_REGION].includes(user.role));
  }, [user]);

  useEffect(() => {
    (async () => {
      try {
        const responseCohorts = await api.get(`/cohort`);
        console.log("✌️  responseCohorts.data", responseCohorts.data);
        setCohorts(responseCohorts.data);
      } catch (e) {
        capture(e);
        setCohorts([]);
      }
    })();
  }, []);

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

      const { ok, code, data: response } = await api.put(`/cle/classe/${classe._id}`, classe);

      if (!ok) {
        toastr.error("Oups, une erreur est survenue lors de la modification de la classe", translate(code));
        return setIsLoading(false);
      }
      setClasse(response);
      setEdit(!edit);
      setIsLoading(false);
      setErrors({});
    } catch (e) {
      capture(e);
      toastr.error("Oups, une erreur est survenue lors de la modification de la classe");
    } finally {
      setIsLoading(false);
    }
  };

  const onCancel = () => {
    setEdit(!edit);
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

  const actionList = edit
    ? [
        <div className="flex items-center justify-end ml-6">
          <Button key="cancel" type="cancel" title="Annuler" onClick={onCancel} disabled={isLoading} />
          <Button key="validate" type="primary" title="Valider" className={"!h-8 ml-2"} onClick={sendInfo} disabled={isLoading} />
        </div>,
      ]
    : [ROLES.ADMINISTRATEUR_CLE, ROLES.REFERENT_CLASSE, ROLES.ADMIN, ROLES.REFERENT_DEPARTMENT, ROLES.REFERENT_REGION].includes(user.role) &&
        classe?.status !== STATUS_CLASSE.WITHDRAWN
      ? [<Button key="change" type="change" leftIcon={<HiOutlinePencil size={16} />} title="Modifier" onClick={() => setEdit(!edit)} disabled={isLoading} />]
      : null;

  if (!classe) return <Loader />;

  return (
    <Page>
      <Header
        title={classe.name || "Informations nécessaires"}
        titleComponent={<Badge className="mx-4 mt-2" title={translateStatusClasse(classe.status)} status={statusClassForBadge(classe.status)} />}
        breadcrumb={[{ title: <HiOutlineOfficeBuilding size={20} /> }, { title: "Mes classes", to: "/classes" }, { title: "Fiche de la classe" }]}
        actions={
          ![STATUS_CLASSE.DRAFT, STATUS_CLASSE.WITHDRAWN, STATUS_CLASSE.VALIDATED].includes(classe.status) && [
            <Button key="invite" leftIcon={<BsSend />} title="Inviter des élèves" onClick={() => setModalInvite(true)} />,
          ]
        }
      />
      <Container title="Informations générales" actions={actionList}>
        <div className="flex items-stretch justify-stretch">
          <div className="flex-1">
            <Label title="Cohorte" name="Cohorte" tooltip="La cohorte sera mise à jour lors de la validation des dates d'affectation." />
            <Select
              className="mb-3"
              isActive={edit && canEditCohort}
              readOnly={!edit || !canEditCohort}
              disabled={!canEditCohort}
              placeholder={"Choisissez une cohorte"}
              options={cohorts?.map((c) => ({ value: c.name, label: c.name }))}
              closeMenuOnSelect={true}
              value={classe?.cohort ? { value: classe?.cohort, label: translate(classe?.cohort) } : null}
              onChange={(options) => {
                setClasse({ ...classe, cohort: options.value });
              }}
              error={errors.cohort}
            />
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
                <InputText className="mb-3" value={classe.name} error={errors.name} readOnly={true} label="Établissement" />
                <Link to={`/etablissement/${classe.etablissementId}`} className="w-full">
                  <Button type="tertiary" title="Voir l'établissement" className="w-full" />
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
                  <td className="px-4 font-bold text-lg text-center py-2">{classe.seatsTaken || 0}</td>
                  <td className="text-gray-500 text-center py-2">({Math.round((classe.seatsTaken * 100) / classe.totalSeats || 0)}%)</td>
                </tr>
                <tr>
                  <td className="font-bold pr-4 py-2">Places libres</td>
                  <td className="px-4 font-bold text-lg text-center py-2">{classe.totalSeats - classe.seatsTaken || 0}</td>
                  <td className="text-gray-500 text-center py-2">({Math.round(100 - (classe.seatsTaken * 100) / classe.totalSeats || 0)}%)</td>
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
          { title: "Désister la classe", leftIcon: <MdOutlineDangerous size={20} />, onClick: onDelete, isDestructive: true },
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
            <p className="text-base leading-5 font-normal text-gray-900 mt-6">Vous pouvez inviter des élèves à rejoindre votre classe en leur partageant ce lien : </p>
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
