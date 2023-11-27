import React, { useState, useEffect } from "react";
import { ProfilePic } from "@snu/ds";
import { Page, Header, Container, Button, Badge, Label, InputText, ModalConfirmation, Select } from "@snu/ds/admin";
import { HiOutlinePencil } from "react-icons/hi";
import { BsSend, BsTrash3 } from "react-icons/bs";
import { VscCopy } from "react-icons/vsc";
import ClasseIcon from "@/components/drawer/icons/Classe";
import { Link } from "react-router-dom";
import { useParams, useHistory } from "react-router-dom";
import { capture } from "@/sentry";
import api from "@/services/api";
import { toastr } from "react-redux-toastr";
import { translate, CLE_COLORATION_LIST, CLE_GRADE_LIST, CLE_FILIERE_LIST, ROLES, YOUNG_STATUS, STATUS_CLASSE } from "snu-lib";
import { useSelector } from "react-redux";
import { statusClassForBadge } from "./utils";

export default function view() {
  const [classe, setClasse] = useState({});
  const [studentsWaiting, setStudentsWaiting] = useState([]);
  const [studentsInProgress, setStudentsInProgress] = useState([]);
  const [modalInvite, setModalInvite] = useState(false);
  const { id } = useParams();
  const [errors, setErrors] = useState({});
  const user = useSelector((state) => state.Auth.user);
  const [edit, setEdit] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const history = useHistory();

  const colorOptions = Object.keys(CLE_COLORATION_LIST).map((value) => ({
    value: CLE_COLORATION_LIST[value],
    label: CLE_COLORATION_LIST[value],
  }));
  const filiereOptions = Object.keys(CLE_FILIERE_LIST).map((value) => ({
    value: CLE_FILIERE_LIST[value],
    label: CLE_FILIERE_LIST[value],
  }));
  const gradeOptions = Object.keys(CLE_GRADE_LIST).map((value) => ({
    value: CLE_GRADE_LIST[value],
    label: CLE_GRADE_LIST[value],
  }));

  const getClasse = async () => {
    try {
      const { ok, code, data: response } = await api.get(`/cle/classe/${id}`);

      if (!ok) {
        return toastr.error("Oups, une erreur est survenue lors de la récupération de la classe", translate(code));
      }
      setClasse(response);
      getStudents(response._id);
    } catch (e) {
      capture(e);
      toastr.error("Oups, une erreur est survenue lors de la récupération de la classe");
    }
  };

  const getStudents = async (id) => {
    try {
      const { ok, code, data: response } = await api.get(`/young/cle/by-classe/${id}`);

      if (!ok) {
        return toastr.error("Oups, une erreur est survenue lors de la récupération des élèves", translate(code));
      }
      setStudentsWaiting(response.filter((young) => young.status === YOUNG_STATUS.WAITING_VALIDATION));
      setStudentsInProgress(response.filter((young) => young.status === YOUNG_STATUS.IN_PROGRESS));
    } catch (e) {
      capture(e);
      toastr.error("Oups, une erreur est survenue lors de la récupération des élèves");
    }
  };

  useEffect(() => {
    getClasse();
  }, [edit]);

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
      console.log(e);
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
      history.push("/mes-classes");
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
    : user.role === ROLES.ADMINISTRATEUR_CLE || user.role === ROLES.REFERENT_CLASSE
    ? [<Button key="change" type="change" leftIcon={<HiOutlinePencil size={16} />} title="Modifier" onClick={() => setEdit(!edit)} disabled={isLoading} />]
    : null;

  return (
    <Page>
      <Header
        title={classe.name || "Informations nécessaires"}
        titleComponent={<Badge className="mx-4 mt-2" title={translate(classe?.status)} status={statusClassForBadge(classe?.status)} />}
        breadcrumb={[{ title: <ClasseIcon className="scale-[65%]" /> }, { title: "Mes classes", to: "/mes-classes" }, { title: "Fiche de la classe" }]}
        actions={[<Button key="invite" leftIcon={<BsSend />} title="Inviter des élèves" onClick={() => setModalInvite(true)} />]}
      />
      <Container title="Informations générales" actions={actionList}>
        <div className="flex items-stretch justify-stretch">
          <div className="flex-1">
            <Label title="Cohorte" name="Cohorte" tooltip="La cohorte sera mise à jour lors de la validation des dates d'affectation." />
            <InputText className="mb-3" value={classe.cohort} disabled />
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
              tooltip="Pour qu'une classe soit considérée comme complète et puisse être validée, 100% des élèves doivent être inscrit (ou désisté). Vous pouvez modifier le nombre d'élève dans le cas d'un changement d'effectif en cours d'année."
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
              value={classe?.grade ? { value: classe?.grade, label: translate(classe?.grade) } : null}
              onChange={(options) => {
                setClasse({ ...classe, grade: options.value });
              }}
              error={errors.grade}
            />
            {edit && (
              <div className="flex items-center justify-end mt-6">
                <button type="button" className="flex items-center justify-center text-xs text-red-500 hover:text-red-700" onClick={onDelete}>
                  <BsTrash3 className="mr-2" />
                  Supprimer la classe
                </button>
              </div>
            )}
          </div>
        </div>
      </Container>
      <Container
        title="Suivi de la classe"
        actions={[
          <Link key="list-students" to="/mes-eleves">
            <Button type="tertiary" title="Voir les élèves" />
          </Link>,
        ]}>
        <div className="flex items-stretch justify-between">
          <table className="flex-1 shrink-0">
            <tbody>
              <tr>
                <td className="font-bold pr-4">Objectif :</td>
                <td className="px-4 font-bold text-lg text-center">{classe?.totalSeats || 0}</td>
                <td className="text-gray-500 text-center">Élèves</td>
              </tr>
              <tr className="mt-8">
                <td className="font-bold pr-4">Total :</td>
                <td className="px-4 font-bold text-lg text-center">{classe?.seatsTaken || 0}</td>
                <td className="text-gray-500 text-center">({Math.round((classe?.seatsTaken * 100) / classe?.totalSeats || 0)}%)</td>
              </tr>
            </tbody>
          </table>
          <div className="mx-8 w-[1px] bg-gray-200 shrink-0">&nbsp;</div>
          <table className="flex-1 shrink-0">
            <tbody>
              <tr>
                <td className="font-bold text-lg text-right">{classe?.seatsTaken || 0}</td>
                <td className="px-4 flex-1">Élèves inscrits</td>
                <td className="text-gray-500">({Math.round((classe?.seatsTaken * 100) / classe?.totalSeats || 0)}%)</td>
              </tr>
              <tr>
                <td className="font-bold text-lg text-right">{studentsWaiting?.length || 0}</td>
                <td className="px-4 flex-1">Élèves en attente de consentement </td>
                <td className="text-gray-500">({Math.round((studentsWaiting?.length * 100) / classe?.totalSeats || 0)}%)</td>
              </tr>
            </tbody>
          </table>
          <div className="mx-8 w-[1px] bg-gray-200 shrink-0">&nbsp;</div>
          <table className="flex-1 shrink-0">
            <tbody>
              <tr>
                <td className="font-bold text-lg text-right">{studentsInProgress?.length || 0}</td>
                <td className="px-4 flex-1">Élèves en cours d’inscription</td>
                <td className="text-gray-500">({Math.round((studentsInProgress?.length * 100) / classe?.totalSeats || 0)}%)</td>
              </tr>
              <tr>
                <td className="font-bold text-lg text-right">{classe?.totalSeats - classe?.seatsTaken || 0}</td>
                <td className="px-4 flex-1">Places libres</td>
                <td className="text-gray-500">({Math.round(100 - (classe?.seatsTaken * 100) / classe?.totalSeats || 0)}%)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Container>

      <ModalConfirmation
        isOpen={modalInvite}
        onClose={() => setModalInvite(false)}
        icon={<ProfilePic icon={({ size, className }) => <BsSend size={size} className={className} />} />}
        title="Invitez des élèves à rejoindre votre classe !"
        text={
          <>
            <p>
              Vous pouvez inviter des élèves à rejoindre votre classe en leur partageant ce lien :{" "}
              <a href={`https://moncompte.snu.gouv.fr/classe-engagee/${classe?._id}`} className="text-primary">
                https://moncompte.snu.gouv.fr/classe-engagee/{classe?._id}
              </a>
            </p>
          </>
        }
        actions={[{ leftIcon: <VscCopy />, title: "Copier le lien", isCancel: true, onClick: () => console.info("Copier le lien") }]}
      />
    </Page>
  );
}
