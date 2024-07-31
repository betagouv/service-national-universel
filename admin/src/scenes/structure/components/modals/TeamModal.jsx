import React, { useState } from "react";
import { ROLES, SENDINBLUE_TEMPLATES } from "snu-lib";
import validator from "validator";
import { formatPhoneNumberFR, translate } from "snu-lib";
import { copyToClipboard, getInitials } from "@/utils";
import { AiOutlineClose } from "react-icons/ai";
import { BiCopy } from "react-icons/bi";
import { HiCheckCircle, HiOutlineTrash, HiPencil, HiPhone, HiPlus } from "react-icons/hi";
import { useSelector } from "react-redux";
import { toastr } from "react-redux-toastr";
import { Link } from "react-router-dom";
import Field from "@/components/forms/Field";
import ModalChangeTutor from "@/components/modals/ModalChangeTutor";
import ModalConfirm from "@/components/modals/ModalConfirm";
import ModalReferentDeleted from "@/components/modals/ModalReferentDeleted";
import ModalTailwind from "@/components/modals/ModalTailwind";
import API from "@/services/api";
import Select from "../../../centersV2/components/Select";
import Button from "../Button";
import { isPossiblePhoneNumber } from "libphonenumber-js";

export default function TeamModal({ isOpen, onCancel, team, setTeam, structure }) {
  const user = useSelector((state) => state.Auth.user);
  const isSupervisor = user.role === ROLES.SUPERVISOR && user.structureId === structure._id;
  const [responsible, setResponsible] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const [modal, setModal] = useState({ isOpen: false, onConfirm: null });
  const [modalTutor, setModalTutor] = useState({ isOpen: false, onConfirm: null });
  const [modalReferentDeleted, setModalReferentDeleted] = useState({ isOpen: false });
  const [errors, setErrors] = useState({});

  const resetState = () => {
    setResponsible(null);
    setIsLoading(false);
    setErrors({});
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
      let error = {};
      if (!responsible?.firstName?.trim()) error.firstName = "Le prénom est obligatoire";
      if (!responsible?.lastName?.trim()) error.lastName = "Le nom est obligatoire";
      if (!responsible?.email?.trim()) error.email = "L'email est obligatoire";
      if (responsible?.email?.trim() && !validator.isEmail(responsible?.email?.trim())) error.email = "L'email est au mauvais format";
      if (responsible.phone && !isPossiblePhoneNumber(responsible.phone, "FR")) error.phone = "Le numéro de téléphone est au mauvais format";

      setErrors(error);
      if (Object.keys(error).length > 0) return;

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
    <ModalTailwind
      isOpen={isOpen}
      onClose={() => {
        onCancel();
        setErrors({});
      }}
      className="h-[500px] w-[800px] rounded-xl bg-white p-8 shadow-xl">
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
          errors={errors}
          structure={structure}
        />
      ) : (
        <div className="space-y-8">
          <div className="grid grid-cols-6">
            <div />
            <p className="col-span-4 text-center text-lg font-medium">L&apos;équipe</p>
            <div className="flex items-center justify-end">
              <button onClick={onCancel}>
                <AiOutlineClose className="text-gray-500" />
              </button>
            </div>
          </div>
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
    <div className="border-grey-200 group flex h-28 flex-col rounded-lg border-[1px]">
      <div className="flex items-center justify-between">
        <Link to={`/user/${responsible._id}`} className="flex items-center p-3">
          <div className="mr-3 flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-sm font-bold text-blue-600">
            {getInitials(responsible.firstName + " " + responsible.lastName)}
          </div>
          <div>
            <div className="text-bold max-w-[200px] truncate text-sm text-gray-900">{responsible.firstName + " " + responsible.lastName}</div>
            <div className="text-xs text-gray-500">{translate(responsible.role)}</div>
          </div>
        </Link>
        <div
          className="invisible mr-3 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-gray-100 hover:scale-105 group-hover:!visible"
          onClick={() => setResponsible(responsible)}>
          <HiPencil className="tex-lg text-blue-500" />
        </div>
      </div>

      <div className="my-auto flex border-t-[1px] border-gray-200">
        {responsible.phone && (
          <div className="my-2 flex flex-1 flex-row items-center justify-center px-3">
            <HiPhone className="text-gray-400" />
            <div className="whitespace-nowrap pl-2 text-gray-700">{formatPhoneNumberFR(responsible.phone)}</div>
          </div>
        )}
        {responsible.email && (
          <div className="flex-2 my-2 flex w-full items-center truncate border-l-[1px] border-gray-200 px-3">
            <div className="flex-row truncate pr-2 text-gray-700 ">{responsible.email}</div>
            <div
              className="flex cursor-pointer items-center justify-center hover:scale-105"
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
      className="border-grey-200 flex h-28 flex-row items-center justify-center rounded-lg border-[1px] border-dashed border-blue-600 bg-[#ffffff] px-2 hover:cursor-pointer hover:bg-[#eff6ff]"
      onClick={() => setResponsible({ role: ROLES.RESPONSIBLE })}>
      <HiPlus className="text-indigo-300" />
      <div className="pl-2 text-sm text-blue-600">Ajouter un {isSupervisor ? "membre" : "responsable"}</div>{" "}
    </div>
  );
};

const EditContact = ({ team, responsible, setResponsible, isLoading, handleSubmit, handleChange, handleDelete, onChange, errors, structure }) => {
  const user = useSelector((state) => state.Auth.user);

  const disabled = isLoading || !responsible.firstName || !responsible.lastName || !responsible.email;

  const roles = [ROLES.RESPONSIBLE];
  if (structure.isNetwork === "true" && (user.role === ROLES.ADMIN || (user.role === ROLES.SUPERVISOR && user.structureId === structure._id))) {
    roles.push(ROLES.SUPERVISOR);
  }
  const rolesOptions = roles.map((role) => ({ label: translate(role), value: role }));

  return (
    <div className="flex h-full flex-col space-y-6" onSubmit={handleSubmit}>
      <p className="text-center text-lg font-medium">{responsible._id ? "L'équipe" : "Inviter un nouveau responsable"}</p>
      {!responsible._id && (
        <p className="text-center text-gray-500">Vous pouvez partager les droits d&apos;administration de votre compte de structure d&apos;accueil SNU avec plusieurs personnes.</p>
      )}

      <div className="grid grid-cols-2 gap-6">
        <Field readOnly={isLoading} label="Prénom" name="firstName" handleChange={handleChange} value={responsible.firstName} required={true} errors={errors} />
        <Field readOnly={isLoading} label="Nom" name="lastName" handleChange={handleChange} value={responsible.lastName} required={true} errors={errors} />
        <Field readOnly={isLoading} label="Email" name="email" handleChange={handleChange} value={responsible.email} required={true} errors={errors} />
        <Field readOnly={isLoading} label="Téléphone" name="phone" handleChange={handleChange} value={responsible.phone} type="tel" errors={errors} />
        {[ROLES.ADMIN, ROLES.SUPERVISOR].includes(user.role) && (
          <Select
            label="Sélectionnez un rôle"
            options={rolesOptions}
            selected={rolesOptions.find((e) => e.value === responsible.role)}
            setSelected={(e) => setResponsible({ ...responsible, role: e.value })}
          />
        )}
      </div>

      <div className="mt-auto space-y-6">
        {responsible._id && team.length > 1 && (
          <button disabled={isLoading} className="ml-auto flex items-center gap-2 text-red-500" onClick={() => handleDelete(responsible)}>
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
