import React, { useContext, useState } from "react";
import validator from "validator";
import { ROLES, SENDINBLUE_TEMPLATES } from "snu-lib";
import { copyToClipboard, translate, formatPhoneNumberFR, regexPhoneFrenchCountries, getInitials } from "../../../../utils";

import { BiCopy } from "react-icons/bi";
import { HiCheckCircle, HiPhone, HiPlus, HiPencil, HiOutlineTrash } from "react-icons/hi";
import { toastr } from "react-redux-toastr";
import ModalReferentDeleted from "../../../../components/modals/ModalReferentDeleted";
import ModalConfirm from "../../../../components/modals/ModalConfirm";
import API from "../../../../services/api";
import ModalChangeTutor from "../../../../components/modals/ModalChangeTutor";
import { StructureContext } from "../../view";
import ModalTailwind from "../../../../components/modals/ModalTailwind";
import Select from "../../../centersV2/components/Select";
import { useSelector } from "react-redux";
import Button from "../Button";
import { Link } from "react-router-dom";
import Field from "../../../missions/components/Field";

export default function TeamModal({ isOpen, onCancel, team, setTeam }) {
  const { structure } = useContext(StructureContext);
  const user = useSelector((state) => state.Auth.user);
  const isSupervisor = user.role === ROLES.SUPERVISOR && user.structureId === structure._id;
  const [responsible, setResponsible] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const [modal, setModal] = useState({ isOpen: false, onConfirm: null });
  const [modalTutor, setModalTutor] = useState({ isOpen: false, onConfirm: null });
  const [modalReferentDeleted, setModalReferentDeleted] = useState({ isOpen: false });

  const resetState = () => {
    setResponsible(null);
    setIsLoading(false);
  };

  const handleDelete = (target) => {
    setModal({
      isOpen: true,
      onConfirm: () => onConfirmDelete(target),
      title: `Êtes-vous sûr(e) de vouloir supprimer le profil de ${target.firstName} ${target.lastName} ?`,
      message: "Cette action est irréversible.",
    });
  };

  const onDeleteTutorLinked = (target) => {
    setModalTutor({
      isOpen: true,
      value: target,
      onConfirm: () => onConfirmDelete(target),
    });
  };

  const onReferentDeleted = () => {
    setModalReferentDeleted({
      isOpen: true,
    });
    setResponsible(null);
  };

  const onConfirmDelete = async (target) => {
    try {
      const { ok, code } = await API.remove(`/referent/${target._id}`);
      if (!ok && code === "OPERATION_UNAUTHORIZED") return toastr.error("Vous n'avez pas les droits pour effectuer cette action");
      if (!ok && code === "LINKED_MISSIONS") return onDeleteTutorLinked(target);
      if (!ok) return toastr.error("Une erreur s'est produite :", translate(code));

      setTeam(team.filter((e) => e._id !== target._id));
      return onReferentDeleted();
    } catch (e) {
      console.log(e);
      return toastr.error("Oups, une erreur est survenue pendant la suppression du profil :", translate(e.code));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!responsible.firstName || !responsible.lastName || !responsible.email || !responsible.phone) {
        return toastr.error("Vous devez remplir tous les champs", "nom, prénom, télephone et e-mail");
      }
      if (!validator.matches(responsible.phone, regexPhoneFrenchCountries)) {
        return toastr.error("Le numéro de téléphone est au mauvais format. Format attendu : 06XXXXXXXX ou +33XXXXXXXX");
      }

      setIsLoading(true);
      if (responsible._id) {
        const { ok, code, data } = await API.put(`/referent/${responsible._id}`, responsible);
        if (!ok) {
          setIsLoading(false);
          return toastr.error("Une erreur s'est produite lors de la sauvegarde du responsable :", translate(code));
        }
        const index = team.findIndex((e) => e._id === responsible._id);
        team[index] = data;
        setTeam(team);
        setResponsible(null);
        toastr.success("Le contact a été sauvegardé !");
      } else {
        responsible.role = structure.isNetwork ? ROLES.SUPERVISOR : ROLES.RESPONSIBLE;
        responsible.structureId = structure._id;
        responsible.structureName = structure.name;
        const { ok, code, data } = await API.post(`/referent/signup_invite/${SENDINBLUE_TEMPLATES.invitationReferent.NEW_STRUCTURE_MEMBER}`, responsible);
        if (!ok) {
          setIsLoading(false);
          if (e.code === "USER_ALREADY_REGISTERED") {
            return toastr.error("Cette adresse email est déjà utilisée.", `${responsible.email} a déjà un compte sur cette plateforme.`);
          } else return toastr.error("Une erreur s'est produite lors de la création du responsable :", translate(code));
        }
        setTeam([...team, data]);
        setResponsible(null);
        toastr.success("Le contact a été créé !");
      }
    } catch (e) {
      toastr.error("Oups, une erreur est survenue lors de la sauvegarde du contact : ", translate(e.code));
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => setResponsible({ ...responsible, [e.target.name]: e.target.value });

  return (
    <ModalTailwind isOpen={isOpen} onClose={onCancel} className="bg-white rounded-xl shadow-xl w-[800px] h-[500px] p-8">
      {responsible ? (
        <EditContact
          team={team}
          responsible={responsible}
          setResponsible={setResponsible}
          isLoading={isLoading}
          handleSubmit={handleSubmit}
          handleChange={handleChange}
          handleDelete={handleDelete}
          onChange={resetState}
        />
      ) : (
        <div className="space-y-8">
          <p className="text-lg font-medium text-center">L&apos;équipe</p>
          <div className="h-88 overflow-auto">
            <div className="grid grid-cols-2 gap-6 overflow-auto">
              {team?.length && team.map((responsible) => <DisplayContact key={responsible._id} responsible={responsible} setResponsible={setResponsible} />)}
              <AddContact setResponsible={setResponsible} isSupervisor={isSupervisor} />
            </div>
          </div>
        </div>
      )}
      <ModalConfirm
        isOpen={modal?.isOpen}
        title={modal?.title}
        message={modal?.message}
        onCancel={() => setModal({ isOpen: false, onConfirm: null })}
        onConfirm={() => {
          modal?.onConfirm();
          setModal({ isOpen: false, onConfirm: null });
        }}
      />
      <ModalChangeTutor
        isOpen={modalTutor?.isOpen}
        title={modalTutor?.title}
        message={modalTutor?.message}
        tutor={modalTutor?.value}
        onCancel={() => setModalTutor({ isOpen: false, onConfirm: null })}
        onConfirm={() => {
          modalTutor?.onConfirm();
          setModalTutor({ isOpen: false, onConfirm: null });
        }}
      />
      <ModalReferentDeleted isOpen={modalReferentDeleted?.isOpen} onConfirm={() => setModalReferentDeleted({ isOpen: false })} />
    </ModalTailwind>
  );
}

const DisplayContact = ({ responsible, setResponsible }) => {
  const [copied, setCopied] = useState(false);

  return (
    <div className="group flex flex-col rounded-lg border-grey-200 border-[1px] h-28">
      <div className="flex justify-between items-center">
        <Link to={`/user/${responsible._id}`} className="flex items-center p-3">
          <div className="h-9 w-9 flex justify-center items-center rounded-full bg-gray-100 text-blue-600 text-sm font-bold mr-3">
            {getInitials(responsible.firstName + " " + responsible.lastName)}
          </div>
          <div>
            <div className="text-sm text-bold text-gray-900 max-w-[200px] truncate">{responsible.firstName + " " + responsible.lastName}</div>
            <div className="text-xs text-gray-500">{translate(responsible.role)}</div>
          </div>
        </Link>
        <div
          className="invisible group-hover:!visible h-7 w-7 flex items-center rounded-full bg-gray-100 justify-center mr-3 cursor-pointer hover:scale-105"
          onClick={() => setResponsible(responsible)}>
          <HiPencil className="text-blue-500 tex-lg" />
        </div>
      </div>

      <div className="flex border-t-[1px] border-gray-200 my-auto">
        {responsible.phone && (
          <div className="flex flex-1 flex-row justify-center items-center my-2 px-3">
            <HiPhone className="text-gray-400" />
            <div className="pl-2 text-gray-700 whitespace-nowrap">{formatPhoneNumberFR(responsible.phone)}</div>
          </div>
        )}
        {responsible.email && (
          <div className="flex flex-2 my-2 px-3 border-l-[1px] border-gray-200 truncate w-full items-center">
            <div className="pr-2 flex-row text-gray-700 truncate ">{responsible.email}</div>
            <div
              className="flex items-center justify-center cursor-pointer hover:scale-105"
              onClick={() => {
                copyToClipboard(responsible.email);
                setCopied(true);
                setTimeout(() => setCopied(false), 3000);
              }}>
              {copied ? <HiCheckCircle className="text-green-500" /> : <BiCopy className="text-gray-400" />}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const AddContact = ({ setResponsible, isSupervisor = false }) => {
  return (
    <div
      className="flex flex-row border-dashed border-blue-600 rounded-lg bg-[#ffffff] border-grey-200 border-[1px] px-2 items-center justify-center hover:cursor-pointer h-28 hover:bg-[#eff6ff]"
      onClick={() => setResponsible({})}>
      <HiPlus className="text-indigo-300" />
      <div className="pl-2 text-blue-600 text-sm">Ajouter un {isSupervisor ? "membre" : "responsable"}</div>{" "}
    </div>
  );
};

const EditContact = ({ team, responsible, setResponsible, isLoading, handleSubmit, handleChange, handleDelete, onChange }) => {
  const user = useSelector((state) => state.Auth.user);
  const { structure } = useContext(StructureContext);

  const disabled = isLoading || !responsible.firstName || !responsible.lastName || !responsible.email || !responsible.phone;

  const roles = [ROLES.RESPONSIBLE];
  if (structure.isNetwork === "true" && (user.role === ROLES.ADMIN || (user.role === ROLES.SUPERVISOR && user.structureId === structure._id))) {
    roles.push(ROLES.SUPERVISOR);
  }
  const rolesOptions = roles.map((role) => ({ label: translate(role), value: role }));

  return (
    <div className="h-full flex flex-col space-y-6" onSubmit={handleSubmit}>
      <p className="text-lg font-medium text-center">{responsible._id ? "L'équipe" : "Inviter un nouvel utilisateur"}</p>
      {!responsible._id && (
        <p className="text-center text-gray-500">Vous pouvez partager les droits d&apos;administration de votre compte de structure d&apos;accueil SNU avec plusieurs personnes.</p>
      )}

      <div className="grid grid-cols-2 gap-6">
        <Field readOnly={isLoading} label="Prénom" name="firstName" handleChange={handleChange} value={responsible.firstName} required={true} />
        <Field readOnly={isLoading} label="Nom" name="lastName" handleChange={handleChange} value={responsible.lastName} required={true} />
        <Field readOnly={isLoading} label="Email" name="email" handleChange={handleChange} value={responsible.email} required={!responsible.phone} />
        <Field readOnly={isLoading} label="Téléphone" name="phone" handleChange={handleChange} value={responsible.phone} required={!responsible.email} type="tel" />
        {[ROLES.ADMIN, ROLES.SUPERVISOR].includes(user.role) && (
          <Select
            label="Sélectionnez un rôle"
            options={rolesOptions}
            selected={rolesOptions.find((e) => e.value === responsible.role || "")}
            setSelected={(e) => setResponsible({ ...responsible, role: e.value })}
          />
        )}
      </div>

      <div className="mt-auto space-y-6">
        {responsible._id && team.length > 1 && (
          <button disabled={isLoading} className="items-center gap-2 flex ml-auto text-red-500" onClick={() => handleDelete(responsible)}>
            <HiOutlineTrash className="text-lg" />
            Supprimer le contact
          </button>
        )}
        <div className="grid grid-cols-2 gap-6">
          <Button onClick={onChange} disabled={isLoading} category="tertiary">
            Annuler
          </Button>
          <Button category="primary" disabled={disabled} onClick={handleSubmit}>
            {responsible._id ? "Enregistrer" : "Envoyer l'invitation"}
          </Button>
        </div>
      </div>
    </div>
  );
};
