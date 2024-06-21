import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link, useHistory, useParams } from "react-router-dom";
import { useDebounce } from "@uidotdev/usehooks";
import { HiPlus, HiOutlinePencil, HiOutlineOfficeBuilding } from "react-icons/hi";
import { IoAdd } from "react-icons/io5";
import { toastr } from "react-redux-toastr";
import validator from "validator";

import { ProfilePic } from "@snu/ds";
import { Page, Header, Container, Button, InputText, ModalConfirmation, Label, Select } from "@snu/ds/admin";
import { AddressForm, Input } from "@snu/ds/common";
import InstitutionIcon from "@/components/drawer/icons/Institution";
import { useAddress, CLE_TYPE_LIST, CLE_SECTOR_LIST, SUB_ROLES, ROLES, translate, ERRORS } from "snu-lib";
import api from "@/services/api";
import { capture } from "@/sentry";
import Loader from "@/components/Loader";

import Contact from "./components/Contact";
import GeneralInfos from "./components/GeneralInfos";

export default function View() {
  const user = useSelector((state) => state.Auth.user);
  const { id } = useParams();
  const [classeId, setClasseId] = useState("");
  const [etablissement, setEtablissement] = useState({});
  const [newCoordinator, setNewCoordinator] = useState({});
  const [contacts, setContacts] = useState([]);
  const [contactsToUpdate, setContactsToUpdate] = useState([]);
  const [modalChef, setModalChef] = useState(false);
  const [modalClassReferent, setModalClassReferent] = useState(false);
  const [modalCoordinator, setModalCoordinator] = useState(false);
  const [modalAddCoordinator, setModalAddCoordinator] = useState(false);

  const history = useHistory();
  const firstLogin = localStorage.getItem("cle_referent_signup_first_time");

  const getEtablissement = async () => {
    try {
      //TODO only one call
      const url = [ROLES.ADMINISTRATEUR_CLE, ROLES.REFERENT_CLASSE].includes(user.role) ? "/cle/etablissement/from-user" : `/cle/etablissement/${id}`;
      const { ok, code, data: response } = await api.get(url);

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
  }, []);

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

  if (!etablissement) return <Loader />;

  return (
    <Page>
      <Header
        title={etablissement.name}
        breadcrumb={[{ title: <InstitutionIcon className="scale-[65%]" /> }, { title: "Fiche de mon établissement" }]}
        actions={[
          [ROLES.ADMIN].includes(user.role) && (
            <Button
              key="create-classe"
              title="Créer une classe"
              leftIcon={<HiPlus size={20} />}
              onClick={() => history.push("/classes/create?etablissementId=" + etablissement._id)}
            />
          ),
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
      <Contact
        contacts={contacts}
        user={user}
        onContactsUpdate={setContactsToUpdate}
        contactsToUpdate={contactsToUpdate}
        etablissementId={etablissement?._id}
        getEtablissement={getEtablissement}
      />

      <GeneralInfos etablissement={etablissement} onUpdateEtab={setEtablissement} user={user} />

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
