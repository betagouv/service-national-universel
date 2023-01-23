import React, { useState } from "react";
import ModalForm from "../../../../components/modals/ModalForm";
import { BiCopy } from "react-icons/bi";
import { HiCheckCircle, HiPhone, HiPlus, HiPencil, HiOutlineTrash } from "react-icons/hi";
import { copyToClipboard, translate, formatPhoneNumberFR } from "../../../../utils";
import { toastr } from "react-redux-toastr";
import { Spinner } from "reactstrap";

export default function ModalContacts({ isOpen, setIsOpen, contacts, setContacts, structure, createContact, updateContact, deleteContact }) {
  // const [hit, setHit] = useState(null);
  const [newContact, setNewContact] = useState(false);
  const [contact, setContact] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const resetState = () => {
    setContact(null);
    setIsLoading(false);
  };

  const onCancel = () => {
    resetState();
    setIsOpen(false);
  };

  const onChange = () => {
    resetState();
  };

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      await deleteContact(contact._id);
      toastr.success("Le contact a été supprimé !");
      setContacts(contacts.filter((e) => e._id !== contact._id));
    } catch (e) {
      resetState();
      return toastr.error("Oups, une erreur est survenue lors de la suppression du contact : ", translate(e.code));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { ok, data } = await createContact(contact, structure);
      if (!ok) {
        resetState();
        return toastr.error("Une erreur s'est produite lors de la sauvegarde du contact");
      }
      toastr.success("Le contact a été sauvegardé !");
      setContacts([...contacts, data]);
      setContact(null);
    } catch (e) {
      return toastr.error("Oups, une erreur est survenue lors de la sauvegarde du contact : ", translate(e.code));
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    setContact({ ...contact, [e.target.name]: e.target.value });
  };

  if (!contacts) return <Spinner />;

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
          onChange={onChange}
        />
      ) : (
        <div className="w-full grid grid-cols-2 gap-4 p-4">
          {contacts.length && contacts.map((contact) => <ContactCard key={contact._id} contact={contact} setContact={setContact} />)}
          {contacts.length < 4 && <AddContact setContact={setContact} />}
        </div>
      )}
    </ModalForm>
  );
}

const ContactCard = ({ contact, setContact }) => {
  const [copied, setCopied] = useState(false);
  return (
    <div className="group flex flex-col rounded-lg bg-white border-grey-200 border-[1px] px-2">
      <div className="flex justify-between items-center">
        <div className="flex items-center px-2 py-2">
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
        {contact.mobile ? (
          <div className="flex flex-1 flex-row justify-center items-center my-2 px-2">
            <HiPhone className="text-gray-400" />
            <div className="pl-2 text-gray-700 whitespace-nowrap">{formatPhoneNumberFR(contact.mobile)}</div>
          </div>
        ) : null}
        {contact.email ? (
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
        ) : null}
      </div>
    </div>
  );
};

const AddContact = ({ setContact }) => {
  return (
    <div
      className="flex flex-row border-dashed border-blue-600 rounded-lg bg-white border-grey-200 border-[1px] px-2 items-center justify-center hover:cursor-pointer"
      onClick={() => setContact({})}>
      <HiPlus className="text-indigo-300" />
      <div className="pl-2 text-blue-600 text-sm">Ajouter un responsable</div>
    </div>
  );
};

const EditContact = ({ contact, setContact, isLoading, newContact, handleSubmit, handleChange, handleDelete, onChange }) => {
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
                name="mobile"
                id="mobile"
                onChange={handleChange}
                value={contact.mobile}
              />
            </div>
            <div className={`flex flex-1 flex-col border-[1px] rounded-lg m-2 py-1 px-2 ${isLoading && "bg-gray-200"}`}>
              <label htmlFor="contactMail" className="w-full m-0 text-left text-gray-500">
                Adresse email
              </label>
              <input
                required={!contact.mobile}
                disabled={isLoading}
                className="w-full disabled:bg-gray-200"
                name="email"
                id="email"
                onChange={handleChange}
                value={contact.email}
              />
            </div>
          </div>

          <button disabled={isLoading} className="border-b-[1px] border-b-transparent hover:border-red-500 pt-4 px-2 ml-auto" type="button" onClick={handleDelete}>
            <div className="w-full flex flex-row justify-center items-center text-red-500">
              <HiOutlineTrash className="text-red-300 text-lg mr-2" />
              Supprimer le contact
            </div>
          </button>
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
            {newContact ? "Envoyer l'invitation" : "Enregistrer"}
          </button>
        </div>
      </div>
    </form>
  );
};

const getInitials = (word) =>
  (word || "UK")
    .match(/\b(\w)/g)
    .join("")
    .substring(0, 2)
    .toUpperCase();
