import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link, useHistory } from "react-router-dom";
import { ProfilePic } from "@snu/ds";
import { Page, Header, Container, Button, InputText, ModalConfirmation, Label, Select } from "@snu/ds/admin";
import { HiPlus, HiOutlinePencil, HiOutlineMail, HiOutlinePhone, HiCheckCircle, HiOutlineOfficeBuilding } from "react-icons/hi";
import { MdOutlineContentCopy } from "react-icons/md";
import InstitutionIcon from "@/components/drawer/icons/Institution";
import { CLE_TYPE_LIST, CLE_SECTOR_LIST, SUB_ROLES, ROLES, translate } from "snu-lib";
import api from "@/services/api";
import { IoAdd } from "react-icons/io5";
import { capture } from "@/sentry";
import { toastr } from "react-redux-toastr";
import { copyToClipboard } from "@/utils";
import validator from "validator";
import { ERRORS } from "snu-lib/errors";
import Loader from "@/components/Loader";

export default function view() {
  const user = useSelector((state) => state.Auth.user);
  const [edit, setEdit] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [classeId, setClasseId] = useState("");
  const [etablissement, setEtablissement] = useState({});
  const [newCoordinator, setNewCoordinator] = useState({});
  const [contacts, setContacts] = useState([]);
  const [copied, setCopied] = useState([]);
  const typeOptions = Object.keys(CLE_TYPE_LIST).map((value) => ({
    value: CLE_TYPE_LIST[value],
    label: CLE_TYPE_LIST[value],
  }));
  const sectorOptions = Object.keys(CLE_SECTOR_LIST).map((value) => ({
    value: CLE_SECTOR_LIST[value],
    label: CLE_SECTOR_LIST[value],
  }));
  const [modalChef, setModalChef] = useState(false);
  const [modalClassReferent, setModalClassReferent] = useState(false);
  const [modalCoordinator, setModalCoordinator] = useState(false);
  const [modalAddCoordinator, setModalAddCoordinator] = useState(false);

  const history = useHistory();
  const firstLogin = localStorage.getItem("cle_referent_signup_first_time");

  const sendInfo = async () => {
    try {
      setIsLoading(true);
      setErrors({});
      let errors = {};
      if (!etablissement.address) errors.address = "Ce champ est obligatoire";
      if (!etablissement.type || etablissement.type.length === 0) errors.type = "Ce champ est obligatoire";
      if (!etablissement.sector || etablissement.sector.length === 0) errors.sector = "Ce champ est obligatoire";

      if (Object.keys(errors).length > 0) {
        setErrors(errors);
        setIsLoading(false);
        return;
      }

      const { ok, code, data: response } = await api.put(`/cle/etablissement/${etablissement._id}`, etablissement);

      if (!ok) {
        toastr.error("Oups, une erreur est survenue lors de la modification de l'établissement", translate(code));
        return setIsLoading(false);
      }
      setEtablissement(response);
      setEdit(!edit);
      setIsLoading(false);
      setErrors({});
    } catch (e) {
      capture(e);
      toastr.error("Oups, une erreur est survenue lors de la modification de l'établissement");
    } finally {
      setIsLoading(false);
    }
  };

  const getEtablissement = async () => {
    try {
      const { ok, code, data: response } = await api.get("/cle/etablissement/from-user");

      if (!ok) {
        return toastr.error("Oups, une erreur est survenue lors de la récupération de l'établissement", translate(code));
      }
      setEtablissement(response);
      getClasse(response._id);
      getContacts(response);
    } catch (e) {
      capture(e);
      toastr.error("Oups, une erreur est survenue lors de la récupération de l'établissement");
    }
  };

  const getContacts = async (etablissement) => {
    let contactList = etablissement.referentEtablissementIds.concat(etablissement.coordinateurIds);
    try {
      const requests = contactList.map(async (referentId) => {
        const { ok, code, data: response } = await api.get(`/referent/${referentId}`);

        if (!ok) {
          return toastr.error("Oups, une erreur est survenue lors de la récupération de l'établissement", translate(code));
        }

        return response;
      });
      const contactResponses = await Promise.all(requests);
      setContacts(contactResponses);
    } catch (e) {
      capture(e);
      toastr.error("Oups, une erreur est survenue lors de la récupération des contacts");
    }
  };

  const getClasse = async (id) => {
    try {
      const { ok, code, data: response } = await api.get(`/cle/classe/from-etablissement/${id}`);

      if (!ok) {
        return toastr.error("Oups, une erreur est survenue lors de la récupération des classes", translate(code));
      }
      if (user.ROLES === ROLES.REFERENT_CLASSE) {
        const classId = response.find((classe) => classe.referentClasseIds.includes(user._id))._id;
        if (!classId) return toastr.error("Oups, une erreur est survenue lors de la récupération de la classe", translate(code));
        setClasseId(classId);
      }
    } catch (e) {
      capture(e);
      toastr.error("Oups, une erreur est survenue lors de la récupération des classes");
    }
  };

  const cancel = () => {
    setEdit(!edit);
    setErrors({});
  };

  const sendInvitation = async () => {
    try {
      setErrors({});
      let error = {};

      if (!newCoordinator.firstName) error.firstName = "Ce champ est obligatoire";
      if (!newCoordinator.lastName) error.lastName = "Ce champ est obligatoire";
      if (!newCoordinator.email || !validator.isEmail(newCoordinator.email)) error.email = "L'email est incorrect";
      if (etablissement.coordinateurIds.length === 2) error.coordinator = "Vous avez déjà deux coordinateurs pour cet établissement.";

      if (Object.keys(error).length > 0) {
        setErrors(error);
        return;
      }

      const { ok, code } = await api.post(`/cle/referent/invite-coordonnateur`, newCoordinator);

      if (!ok) {
        toastr.error("Oups, une erreur est survenue lors de l'ajout du nouveau membre", translate(code));
        setNewCoordinator({});
        return setModalAddCoordinator(false);
      }

      setErrors({});
      setNewCoordinator({});
      setModalAddCoordinator(false);
      return toastr.success("Invitation envoyée");
    } catch (e) {
      capture(e);
      setNewCoordinator({});
      setModalAddCoordinator(false);
      if (e.code === ERRORS.USER_ALREADY_REGISTERED)
        return toastr.error("Cette adresse email est déjà utilisée.", `${newCoordinator.email} a déjà un compte sur cette plateforme.`, { timeOut: 10000 });
      toastr.error("Oups, une erreur est survenue lors de l'ajout du nouveau membre", translate(e));
    }
  };

  useEffect(() => {
    getEtablissement();
  }, [edit]);

  useEffect(() => {
    if (firstLogin) {
      if (user.subRole === SUB_ROLES.referent_etablissement) {
        setModalChef(true);
      }
      if (user.subRole === SUB_ROLES.coordinateur_cle) {
        setModalCoordinator(true);
      }
      if (user.role === ROLES.REFERENT_CLASSE) {
        setModalClassReferent(true);
      }
    }
  }, [user]);

  const actionList = edit
    ? [
        <div className="flex items-center justify-end ml-6">
          <Button key="cancel" type="cancel" title="Annuler" onClick={cancel} disabled={isLoading} />
          <Button key="validate" type="primary" title="Valider" className={"!h-8 ml-2"} onClick={sendInfo} disabled={isLoading} />
        </div>,
      ]
    : user.subRole === SUB_ROLES.referent_etablissement && [
        <Button key="change" type="change" leftIcon={<HiOutlinePencil size={16} />} title="Modifier" onClick={() => setEdit(!edit)} disabled={isLoading} />,
      ];

  if (!etablissement) return <Loader />;

  return (
    <Page>
      <Header
        title={etablissement.name}
        breadcrumb={[{ title: <InstitutionIcon className="scale-[65%]" /> }, { title: "Fiche de mon établissement" }]}
        actions={[
          user.subRole === SUB_ROLES.referent_etablissement && (
            <Button
              key="modal-coordinator"
              className="ml-2"
              title="Ajouter un coordinateur"
              leftIcon={<IoAdd size={20} className="mt-0.5" />}
              onClick={() => setModalAddCoordinator(true)}
            />
          ),
        ]}
      />
      <Container
        title="Contacts"
        actions={[
          <Link key="list-users" to="/user">
            <Button type="tertiary" title="Voir mes contacts" />
          </Link>,
        ]}>
        <div className="flex items-stretch justify-between overflow-y-auto">
          {contacts.map((contact, index) => (
            <div key={contact.email} className="flex-1 shrink-0 flex items-stretch justify-between">
              <div>
                <div className="text-base font-bold text-ds-gray-900">
                  {contact.firstName} {contact.lastName}
                </div>
                <div className="mb-4 text-ds-gray-500">{translate(contact.subRole)}</div>
                <div className="flex items-center justify-start mb-2">
                  <HiOutlinePhone size={20} className="mr-2" />
                  {contact.phone}
                </div>
                <div className="flex items-center justify-start max-w-[290px]">
                  <div>
                    <HiOutlineMail size={20} className="mr-2" />
                  </div>
                  <p className="truncate">{contact.email}</p>
                  <div
                    className="flex items-center justify-center"
                    onClick={() => {
                      copyToClipboard(contact.email);
                      const newCopied = [...copied];
                      newCopied[index] = true;
                      setCopied(newCopied);
                      setTimeout(() => {
                        setCopied([]);
                      }, 2000);
                    }}>
                    {copied[index] ? <HiCheckCircle className="text-green-500 ml-2" /> : <MdOutlineContentCopy size={20} className="ml-2 text-gray-400 cursor-pointer" />}
                  </div>
                </div>
              </div>
              {index < contacts.length - 1 && <div className="mx-12 w-[1px] bg-gray-200 shrink-0">&nbsp;</div>}
            </div>
          ))}
        </div>
      </Container>
      <Container title="Informations générales" actions={actionList}>
        <div className="flex items-stretch justify-between">
          <div className="flex-1 shrink-0">
            <Label title="Nom de l’établissement" />
            <InputText className="mb-4" value={etablissement.name} disabled />
            <Label title="Adresse postale" />
            <InputText
              className="mb-3"
              label="Numéro et nom de la voie"
              value={etablissement.address}
              readOnly={!edit}
              active={edit}
              error={errors.address}
              onChange={(e) => setEtablissement({ ...etablissement, address: e.target.value })}
            />
            <div className="flex items-stretch justify-stretch gap-3 mb-3">
              <InputText className="flex-1" label="Code postal" value={etablissement.zip} disabled />
              <InputText className="flex-1" label="Ville" value={etablissement.city} disabled />
            </div>
            <div className="flex items-stretch justify-stretch gap-3 mb-3">
              <InputText className="flex-1" label="Département" value={etablissement.department} disabled />
              <InputText className="flex-1" label="Région" value={etablissement.region} disabled />
            </div>
          </div>
          <div className="mx-14 w-[1px] bg-gray-200 shrink-0">&nbsp;</div>
          <div className="flex-1 shrink-0">
            <Label title="Type d’établissement" />
            <Select
              className="mb-4"
              readOnly={!edit}
              isActive={edit}
              placeholder={"À modifier"}
              options={typeOptions}
              closeMenuOnSelect={true}
              value={etablissement.type?.map((type1) => ({ value: type1, label: typeOptions.find((type2) => type2.value === type1)?.label }))}
              onChange={(options) => {
                setEtablissement({ ...etablissement, type: [options.value] });
              }}
              error={errors.type}
            />
            <Label title="Statut" />
            <Select
              className="mb-4"
              readOnly={!edit}
              isActive={edit}
              placeholder={"À modifier"}
              options={sectorOptions}
              closeMenuOnSelect={true}
              value={etablissement.sector?.map((sector1) => ({ value: sector1, label: sectorOptions.find((sector2) => sector2.value === sector1)?.label }))}
              onChange={(options) => {
                setEtablissement({ ...etablissement, sector: [options.value] });
              }}
              error={errors.sector}
            />
          </div>
        </div>
      </Container>

      {/* First login ADMINISTRATEUR_CLE referent-etablissement */}
      <ModalConfirmation
        isOpen={modalChef}
        onClose={() => {
          setModalChef(false);
          localStorage.removeItem("cle_referent_signup_first_time");
        }}
        className="md:max-w-[700px]"
        icon={<ProfilePic initials={`${user.firstName.charAt(0)}${user.lastName.charAt(0)}`} />}
        title={`Bonjour ${user.firstName} ${user.lastName} !`}
        text="Bienvenue sur votre compte Administrateur CLE en tant que Chef d’établissement. Vous pouvez créer une classe engagée et ajouter un coordinateur d'établissement."
        actions={[
          { title: "Créer une classe engagée", leftIcon: <HiOutlineOfficeBuilding size={20} />, onClick: () => history.push("/classes/create") },
          { title: "Ajouter un coordinateur", leftIcon: <HiPlus size={20} />, onClick: () => setModalAddCoordinator(true) },
        ]}
      />
      {/* First login ADMINISTRATEUR_CLE coordinateur-cle */}
      <ModalConfirmation
        isOpen={modalCoordinator}
        onClose={() => {
          setModalCoordinator(false);
          localStorage.removeItem("cle_referent_signup_first_time");
        }}
        className="md:max-w-[700px]"
        icon={<ProfilePic initials={`${user.firstName.charAt(0)}${user.lastName.charAt(0)}`} />}
        title={`Bonjour ${user.firstName} ${user.lastName} !`}
        text="Bienvenue sur votre compte Administrateur CLE en tant que Coordinateur d’établissement. Vous pouvez créer une classe engagée, suivre l'évolution de celles déjà créées et consulter les inscriptions des élèves."
        actions={[
          { title: "Fermer", isCancel: true },
          { title: "Voir mes classes", leftIcon: <HiOutlineOfficeBuilding size={20} />, onClick: () => history.push("/classes") },
        ]}
      />
      {/* First login REFERENT_CLASSE */}
      <ModalConfirmation
        isOpen={modalClassReferent}
        onClose={() => {
          setModalClassReferent(false);
          localStorage.removeItem("cle_referent_signup_first_time");
        }}
        className="md:max-w-[700px]"
        icon={<ProfilePic initials={`${user.firstName.charAt(0)}${user.lastName.charAt(0)}`} />}
        title={`Bonjour ${user.firstName} ${user.lastName} !`}
        text="Bienvenue sur votre compte SNU en tant que Référent de classe. Vous pouvez compléter la fiche de votre classe en renseignant toutes les informations."
        actions={[
          { title: "Fermer", isCancel: true },
          { title: "Compléter les informations", leftIcon: <HiOutlineOfficeBuilding size={20} />, onClick: () => history.push(`/classes/${classeId}`) },
        ]}
      />
      {/* Invite COORDINATOR */}
      <ModalConfirmation
        isOpen={modalAddCoordinator}
        onClose={() => {
          setModalAddCoordinator(false);
          setNewCoordinator({});
          setErrors({});
        }}
        className="md:max-w-[700px]"
        icon={<ProfilePic />}
        title="Ajouter un coordinateur d’établissement"
        tooltip="Vous pouvez ajouter jusqu’à deux coordinateurs d’établissement par établissement."
        text={
          <div className="mt-6 w-[636px] text-left text-ds-gray-900">
            {errors.coordinator && <div className="text-red-500 mb-2">{errors.coordinator}</div>}
            <InputText
              className="mb-3"
              label="Nom"
              placeholder="Préciser"
              error={errors.lastName}
              name={"lastName"}
              value={newCoordinator.lastName}
              onChange={(e) => setNewCoordinator({ ...newCoordinator, lastName: e.target.value })}
            />
            <InputText
              className="mb-3"
              label="Prénom"
              placeholder="Préciser"
              error={errors.firstName}
              name={"firstName"}
              value={newCoordinator.firstName}
              onChange={(e) => setNewCoordinator({ ...newCoordinator, firstName: e.target.value })}
            />
            <InputText
              className="mb-3"
              type="email"
              label="Adresse email"
              placeholder="Préciser"
              error={errors.email}
              name={"email"}
              value={newCoordinator.email}
              onChange={(e) => setNewCoordinator({ ...newCoordinator, email: e.target.value })}
            />
          </div>
        }
        actions={[
          { title: "Annuler", isCancel: true },
          { title: "Valider", onClick: () => sendInvitation() },
        ]}
      />
    </Page>
  );
}
