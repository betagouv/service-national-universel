import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link, useHistory } from "react-router-dom";
import { ProfilePic } from "@snu/ds";
import { Page, Header, Container, Button, InputText, ModalConfirmation, Label, Select } from "@snu/ds/admin";
import { HiPlus, HiOutlinePencil, HiOutlineMail, HiOutlinePhone } from "react-icons/hi";
import { VscCopy } from "react-icons/vsc";
import InstitutionIcon from "@/components/drawer/icons/Institution";
import ClasseIcon from "@/components/drawer/icons/Classe";
import { CLE_TYPE_LIST, CLE_SECTOR_LIST, SUB_ROLES, ROLES, translate } from "snu-lib";
import api from "@/services/api";
import { IoAdd } from "react-icons/io5";
import { capture } from "@/sentry";
import { toastr } from "react-redux-toastr";
import { copyToClipboard, SENDINBLUE_TEMPLATES } from "@/utils";
import { HiCheckCircle } from "react-icons/hi";
import validator from "validator";

export default function view() {
  const user = useSelector((state) => state.Auth.user);
  const [edit, setEdit] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [etablissement, setEtablissement] = useState({});
  const [newCoordinator, setNewCoordinator] = useState({});
  const [contacts, setContacts] = useState([]);
  const typeOptions = CLE_TYPE_LIST.map((type) => ({ value: type, label: translate(type) }));
  const sectorOptions = CLE_SECTOR_LIST.map((sector) => ({ value: sector, label: translate(sector) }));
  const [modalChef, setModalChef] = useState(false);
  const [modalSousChef, setModalSousChef] = useState(false);
  const [modalCoordinator, setModalCoordinator] = useState(false);

  const history = useHistory();

  const sendInfo = async () => {
    try {
      setIsLoading(true);
      setErrors({});
      let errors = {};

      if (!etablissement.type || etablissement.type.length === 0) errors.type = "Ce champ est obligatoire";
      if (!etablissement.sector || etablissement.sector.length === 0) errors.sector = "Ce champ est obligatoire";

      if (Object.keys(errors).length > 0) {
        setErrors(errors);
        setIsLoading(false);
        return;
      }

      const { ok, code, data: response } = await api.put("/etablissement", etablissement);

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
    }
  };

  const getEtablissement = async () => {
    try {
      const { ok, code, data: response } = await api.get("/etablissement");

      if (!ok) {
        return toastr.error("Oups, une erreur est survenue lors de la récupération de l'établissement", translate(code));
      }
      setEtablissement(response);
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

  const cancel = () => {
    setEdit(!edit);
    setEtablissement({ ...etablissement, sector: [], type: [] });
  };

  const sendInvitation = async () => {
    try {
      setErrors({});
      let error = {};

      if (!newCoordinator.firstName) error.firstName = "Ce champ est obligatoire";
      if (!newCoordinator.lastName) error.lastName = "Ce champ est obligatoire";
      if (!newCoordinator.email || !validator.isEmail(newCoordinator.email)) error.email = "L'email est incorrect";

      if (Object.keys(error).length > 0) {
        setErrors(error);
        return;
      }

      newCoordinator.role = ROLES.ADMINISTRATEUR_CLE;
      newCoordinator.subRole = SUB_ROLES.coordinateur_cle;
      newCoordinator.region = etablissement.region;
      newCoordinator.department = [etablissement.department];
      newCoordinator.cohorts = [];

      const { ok, code } = await api.post(`/referent/signup_invite/${SENDINBLUE_TEMPLATES.invitationReferent[ROLES.ADMINISTRATEUR_CLE]}`, newCoordinator);

      if (!ok) {
        toastr.error("Oups, une erreur est survenue lors de l'ajout du nouveau membre", translate(code));
        setNewCoordinator({});
        return setModalCoordinator(false);
      }

      setErrors({});
      setNewCoordinator({});
      setModalCoordinator(false);
      return toastr.success("Invitation envoyée");
    } catch (e) {
      capture(e);
      if (e.code === "USER_ALREADY_REGISTERED")
        return toastr.error("Cette adresse email est déjà utilisée.", `${newCoordinator.email} a déjà un compte sur cette plateforme.`, { timeOut: 10000 });
      toastr.error("Oups, une erreur est survenue lors de l'ajout du nouveau membre", translate(e));
    }
  };

  useEffect(() => {
    getEtablissement();
  }, []);

  const actionList = edit
    ? [
        <Button key="cancel" type="cancel" title="Annuler" onClick={cancel} disabled={isLoading} />,
        <Button key="validate" type="primary" title="Valider" className={"!h-8 ml-2"} onClick={sendInfo} disabled={isLoading} />,
      ]
    : user.subRole === SUB_ROLES.referent_etablissement && [
        <Button key="change" type="change" leftIcon={<HiOutlinePencil size={16} />} title="Modifier" onClick={() => setEdit(!edit)} disabled={isLoading} />,
      ];

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
              leftIcon={<IoAdd size={24} className="mt-0.5" />}
              onClick={() => setModalCoordinator(true)}
            />
          ),
          <Button key="modal-sous-chef" className="ml-2" type="secondary" title="Modal 1ère connexion Référent de classe" onClick={() => setModalSousChef(true)} />,
          <Button key="modal-chef" className="ml-2" type="secondary" title="Modal 1ère connexion Chef d'ét." onClick={() => setModalChef(true)} />,
        ]}
      />
      <Container
        title="Contacts"
        actions={[
          <Link key="list-users" to="/user">
            <Button type="tertiary" title="Voir mes contacts" />
          </Link>,
        ]}>
        <div className="flex items-stretch justify-between">
          {contacts.map((contact, index) => (
            <div key={contact.email} className="flex-1 shrink-0 flex items-stretch justify-between">
              <div>
                <div className="text-base font-bold text-ds-gray-900">
                  {contact.firstName} {contact.lastName}
                </div>
                <div className="mb-4 text-ds-gray-500">{translate(contact.role)}</div>
                <div className="flex items-center justify-start mb-2">
                  <HiOutlinePhone size={20} className="mr-2" />
                  {contact.phone}
                </div>
                <div className="flex items-center justify-start">
                  <HiOutlineMail size={20} className="mr-2" /> {contact.email}
                  <div
                    className="flex items-center justify-center hover:scale-105"
                    onClick={() => {
                      copyToClipboard(contact.email);
                      setCopied(true);
                    }}>
                    {copied ? <HiCheckCircle className="text-green-500 ml-2" /> : <VscCopy size={20} className="ml-2 text-gray-400 cursor-pointer" />}
                  </div>
                </div>
              </div>
              {index < contacts.length - 1 && <div className="mx-14 w-[1px] bg-gray-200 shrink-0">&nbsp;</div>}
            </div>
          ))}
        </div>
      </Container>
      <Container title="Informations générales" actions={actionList}>
        <div className="flex items-stretch justify-between">
          <div className="flex-1 shrink-0">
            <Label title="Nom de l’établissement" tooltip="This is a test and need to be replaced." />
            <InputText className="mb-4" value={etablissement.name} disabled />
            <Label title="Adresse postale" tooltip="This is a test and need to be replaced." />
            <InputText className="mb-3" label="Numéro et nom de la voie" value={etablissement.address} disabled />
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
            <Label title="Type d’établissement" tooltip="This is a test and need to be replaced." />
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
            <Label title="Filière" tooltip="This is a test and need to be replaced." />
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

      {/* First login ADMINISTRATEUR_CLE */}
      <ModalConfirmation
        isOpen={modalChef}
        onClose={() => setModalChef(false)}
        icon={<ProfilePic initials="ep" />}
        title="Bonjour Estelle PÉPIN !"
        text="Bienvenue sur votre compte SNU Responsable Classe engagée en tant que Chef d’établissement. Vous pouvez créer une classe engagée et ajouter un référent d’établissement."
        actions={[
          { title: "Créer une classe engagée", leftIcon: <ClasseIcon />, onClick: () => history.push("/mes-classes/create") },
          { title: "Ajouter un coordinateur", leftIcon: <HiPlus />, onClick: () => setModalCoordinator(true) },
        ]}
      />
      {/* First login REFERENT_CLASSE */}
      <ModalConfirmation
        isOpen={modalSousChef}
        onClose={() => setModalSousChef(false)}
        icon={<ProfilePic initials="ap" />}
        title="Bonjour Amandine PIGNON !"
        text="Bienvenue sur votre compte SNU en tant que Référent de classe. Vous pouvez compléter la fiche de votre classe en renseignant toutes les informations."
        actions={[
          { title: "Fermer", isCancel: true },
          { title: "Compléter les informations", leftIcon: <ClasseIcon />, onClick: () => history.push("/mes-classes/1") },
        ]}
      />
      {/* Invite COORDINATOR */}
      <ModalConfirmation
        isOpen={modalCoordinator}
        onClose={() => {
          setModalCoordinator(false);
          setNewCoordinator({});
          setErrors({});
        }}
        className="md:max-w-[700px]"
        icon={<ProfilePic />}
        title="Ajouter un coordinateur d’établissement"
        text={
          <div className="mt-6 w-[636px] text-left text-ds-gray-900">
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
