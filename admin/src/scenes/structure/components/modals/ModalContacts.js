import React, { useContext, useState } from "react";
import ModalForm from "../../../../components/modals/ModalForm";
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

export default function ModalContacts({ isOpen, setIsOpen, contacts, setContacts }) {
  const { structure } = useContext(StructureContext);
  const [contact, setContact] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [modal, setModal] = useState({ isOpen: false, onConfirm: null });
  const [modalTutor, setModalTutor] = useState({ isOpen: false, onConfirm: null });
  const [modalReferentDeleted, setModalReferentDeleted] = useState({ isOpen: false });

  const resetState = () => {
    setContact(null);
    setIsLoading(false);
  };

  const onCancel = () => {
    resetState();
    setIsOpen(false);
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
  };

  const onConfirmDelete = async (target) => {
    try {
      const { ok, code } = await API.remove(`/referent/${target._id}`);
      if (!ok && code === "OPERATION_UNAUTHORIZED") return toastr.error("Vous n'avez pas les droits pour effectuer cette action");
      if (!ok && code === "LINKED_MISSIONS") return onDeleteTutorLinked(target);
      if (!ok) return toastr.error("Une erreur s'est produite :", translate(code));

      setContacts(contacts.filter((e) => e._id !== target._id));
      setContact(null);
      return onReferentDeleted();
    } catch (e) {
      console.log(e);
      return toastr.error("Oups, une erreur est survenue pendant la suppression du profil :", translate(e.code));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!contact.firstName || !contact.lastName || !contact.email || !contact.phone) {
        return toastr.error("Vous devez remplir tous les champs", "nom, prénom, télephone et e-mail");
      }
      if (!validator.matches(contact.phone, regexPhoneFrenchCountries)) {
        return toastr.error("Le numéro de téléphone est au mauvais format. Format attendu : 06XXXXXXXX ou +33XXXXXXXX");
      }

      setIsLoading(true);
      if (contact._id) {
        const { ok, code, data } = await API.put(`/referent/${contact._id}`, contact);
        if (!ok) {
          setIsLoading(false);
          return toastr.error("Une erreur s'est produite lors de la sauvegarde du responsable :", translate(code));
        }
        const index = contacts.findIndex((e) => e._id === contact._id);
        contacts[index] = data;
        setContacts(contacts);
        setContact(null);
        toastr.success("Le contact a été sauvegardé !");
      } else {
        contact.role = structure.isNetwork ? ROLES.SUPERVISOR : ROLES.RESPONSIBLE;
        contact.structureId = structure._id;
        contact.structureName = structure.name;
        const { ok, code, data } = await API.post(`/referent/signup_invite/${SENDINBLUE_TEMPLATES.invitationReferent.NEW_STRUCTURE_MEMBER}`, contact);
        if (!ok) {
          setIsLoading(false);
          if (e.code === "USER_ALREADY_REGISTERED") return toastr.error("Cette adresse email est déjà utilisée.", `${contact.email} a déjà un compte sur cette plateforme.`);
          else return toastr.error("Une erreur s'est produite lors de la création du responsable :", translate(code));
        }
        setContacts([...contacts, data]);
        setContact(null);
        toastr.success("Le contact a été créé !");
      }
    } catch (e) {
      toastr.error("Oups, une erreur est survenue lors de la sauvegarde du contact : ", translate(e.code));
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    setContact({ ...contact, [e.target.name]: e.target.value });
  };

  if (!contacts) return <div />;
  return (
    <ModalForm classNameModal="max-w-3xl" isOpen={isOpen} headerText="L'équipe" onCancel={onCancel}>
      {contact ? (
        <EditContact
          contact={contact}
          setContact={setContact}
          isLoading={isLoading}
          handleSubmit={handleSubmit}
          handleChange={handleChange}
          handleDelete={handleDelete}
          onChange={resetState}
        />
      ) : (
        <div className="w-full grid grid-cols-2 gap-4 p-4">
          {contacts.length && contacts.map((contact) => <DisplayContact key={contact._id} contact={contact} setContact={setContact} />)}
          {contacts.length < 4 && <AddContact setContact={setContact} />}
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
    </ModalForm>
  );
}

const DisplayContact = ({ contact, setContact }) => {
  const [copied, setCopied] = useState(false);
  return (
    <div className="group flex flex-col rounded-lg bg-white border-grey-200 border-[1px] px-2 h-24">
      <div className="flex justify-between items-center">
        <div className="flex items-center p-2">
          <div className="h-7 w-7 flex justify-center items-center rounded-full bg-gray-100 text-blue-600 text-xs font-bold mr-2">
            {getInitials(contact.firstName + " " + contact.lastName)}
          </div>
          <div>
            <div className="text-sm text-bold text-gray-900">{contact.firstName + " " + contact.lastName}</div>
            <div className="text-xs text-gray-500">{translate(contact.role)}</div>
          </div>
        </div>
        <div
          className="invisible group-hover:!visible h-7 w-7 flex items-center rounded-full bg-gray-100 justify-center mx-1 cursor-pointer hover:scale-105"
          onClick={() => setContact(contact)}>
          <HiPencil className="text-blue-500 tex-lg" />
        </div>
      </div>

      <div className="flex flex-row border-t-[1px] border-gray-200">
        {contact.phone && (
          <div className="flex flex-1 flex-row justify-center items-center my-2 px-2">
            <HiPhone className="text-gray-400" />
            <div className="pl-2 text-gray-700 whitespace-nowrap">{formatPhoneNumberFR(contact.phone)}</div>
          </div>
        )}
        {contact.email && (
          <div className="flex flex-2 my-2 px-2 border-l-[1px] border-gray-200 truncate w-full justify-center items-center">
            <div className="pr-2 flex-row text-gray-700 truncate ">{contact.email}</div>
            <div
              className="flex items-center justify-center cursor-pointer hover:scale-105"
              onClick={() => {
                copyToClipboard(contact.email);
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

const AddContact = ({ setContact }) => {
  return (
    <div
      className="flex flex-row border-dashed border-blue-600 rounded-lg bg-white border-grey-200 border-[1px] px-2 items-center justify-center hover:cursor-pointer h-24"
      onClick={() => setContact({})}>
      <HiPlus className="text-indigo-300" />
      <div className="pl-2 text-blue-600 text-sm">Ajouter un responsable</div>
    </div>
  );
};

const EditContact = ({ contact, isLoading, handleSubmit, handleChange, handleDelete, onChange }) => {
  return (
    <form className="w-full" onSubmit={handleSubmit}>
      <div className="flex flex-col items-center justify-center p-4">
        <div className="w-full flex flex-col justify-center ">
          <div className="flex flex-row">
            <div className={`flex flex-1 flex-col border-[1px] rounded-lg m-2 py-1 px-2 ${isLoading && "bg-gray-200"}`}>
              <label htmlFor="firstName" className="w-full m-0 text-left text-gray-500">
                Prénom
              </label>
              <input required disabled={isLoading} className="w-full disabled:bg-gray-200" name="firstName" id="firstName" onChange={handleChange} value={contact.firstName} />
            </div>

            <div className={`flex flex-1 flex-col border-[1px] rounded-lg m-2 py-1 px-2 ${isLoading && "bg-gray-200"}`}>
              <label htmlFor="lastName" className="w-full m-0 text-left text-gray-500">
                Nom
              </label>
              <input required disabled={isLoading} className="w-full disabled:bg-gray-200" name="lastName" id="lastName" onChange={handleChange} value={contact.lastName} />
            </div>
          </div>
          <div className="flex flex-row">
            <div className={`flex flex-1 flex-col border-[1px] rounded-lg m-2 py-1 px-2 ${isLoading && "bg-gray-200"}`}>
              <label htmlFor="contactPhone" className="w-full m-0 text-left text-gray-500">
                Téléphone
              </label>
              <input
                type="tel"
                pattern="\d*"
                required={!contact.email}
                disabled={isLoading}
                className="w-full disabled:bg-gray-200"
                name="phone"
                id="phone"
                onChange={handleChange}
                value={contact.phone}
              />
            </div>
            <div className={`flex flex-1 flex-col border-[1px] rounded-lg m-2 py-1 px-2 ${isLoading && "bg-gray-200"}`}>
              <label htmlFor="contactMail" className="w-full m-0 text-left text-gray-500">
                Adresse email
              </label>
              <input required={!contact.phone} disabled={isLoading} className="w-full disabled:bg-gray-200" name="email" id="email" onChange={handleChange} value={contact.email} />
            </div>
          </div>

          {contact._id && (
            <button disabled={isLoading} className="border-b-[1px] border-b-transparent hover:border-red-500 pt-4 mx-2 ml-auto" type="button" onClick={() => handleDelete(contact)}>
              <div className="w-full flex flex-row justify-center items-center text-red-500">
                <HiOutlineTrash className="text-red-300 text-lg mr-2" />
                Supprimer le contact
              </div>
            </button>
          )}
        </div>

        <div className="w-full flex flex-row justify-center mt-4">
          <button
            className="bg-white flex flex-1 border-[1px] rounded-lg border-grey-300 items-center py-2 px-8 m-2 justify-center cursor-pointer hover:bg-blue-600"
            onClick={onChange}
            disabled={isLoading}>
            Annuler
          </button>
          <button
            className="flex flex-1 border-[1px] rounded-lg border-blue-600 bg-blue-600 shadow-sm items-center py-2 px-8 m-2 text-white text-sm justify-center hover:opacity-90"
            type="submit"
            disabled={isLoading}>
            {contact._id ? "Enregistrer" : "Envoyer l'invitation"}
          </button>
        </div>
      </div>
    </form>
  );
};
