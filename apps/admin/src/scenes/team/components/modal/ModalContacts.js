import React, { useState, useEffect } from "react";
import ModalForm from "../../../../components/modals/ModalForm";
import { BiCopy } from "react-icons/bi";
import { HiCheckCircle, HiPhone, HiPlus, HiPencil, HiOutlineTrash } from "react-icons/hi";
import { copyToClipboard, translate, formatPhoneNumberFR } from "../../../../utils";
import api from "../../../../services/api";
import { toastr } from "react-redux-toastr";

export default function ModalContacts({ isOpen, setIsOpen, idServiceDep, contacts, cohorts, getService }) {
  const [currentTab, setCurrentTab] = useState();
  const [hit, setHit] = useState();
  const [newContact, setNewContact] = useState(false);
  const [edit, setEdit] = useState();
  const [isLoading, setIsLoading] = useState(false);

  const resetState = () => {
    setEdit(null);
    setHit(null);
    setNewContact(false);
    setIsLoading(false);
  };

  const onCancel = () => {
    resetState();
    setIsOpen(false);
  };

  const onChange = () => {
    resetState();
  };

  useEffect(() => {
    setEdit(null);
    setHit(null);
    setNewContact(false);
  }, [currentTab]);

  useEffect(() => {
    if (contacts) {
      if (newContact) {
        setEdit({});
      } else if (hit) {
        let firstName = hit.contactName.substring(0, hit.contactName.indexOf(" "));
        let lastName = hit.contactName.substring(hit.contactName.indexOf(" ") + 1);
        setEdit({ firstName, lastName, contactPhone: hit.contactPhone, contactMail: hit.contactMail, contactId: hit._id });
      }
    }
  }, [newContact, hit]);

  useEffect(() => {
    if (cohorts && contacts) {
      setCurrentTab(cohorts[0]);
    }
  }, [cohorts]);

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      const { ok } = await api.remove(`/department-service/${idServiceDep}/cohort/${currentTab}/contact/${hit._id}`);
      if (!ok) {
        resetState();
        return toastr.error("Une erreur s'est produite lors de la suppression du contact");
      }
      toastr.success("Le contact a été supprimé !");
      await getService();
      resetState();
    } catch (e) {
      resetState();
      return toastr.error("Oups, une erreur est survenue lors de la suppression du contact : ", translate(e.code));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      let value = {
        contactName: `${edit.firstName} ${edit.lastName}`,
        contactPhone: edit.contactPhone,
        contactMail: edit.contactMail,
        contactId: edit.contactId,
      };

      const { ok } = await api.post(`/department-service/${idServiceDep}/cohort/${currentTab}/contact`, value);
      if (!ok) {
        resetState();
        return toastr.error("Une erreur s'est produite lors de la sauvegarde du contact");
      }
      toastr.success("Le contact a été sauvegardé !");
      await getService();
      resetState();
    } catch (e) {
      resetState();
      return toastr.error("Oups, une erreur est survenue lors de la sauvegarde du contact : ", translate(e.code));
    }
  };

  const handleChange = (e) => {
    setEdit({ ...edit, [e.target.name]: e.target.value });
  };

  if (!contacts || !cohorts || !currentTab) return null;

  return (
    <ModalForm classNameModal="max-w-3xl" isOpen={isOpen} headerText="Mes contacts convocation" onCancel={onCancel}>
      <div className="flex flex-col w-full pt-2">
        <div className="flex flex-1 flex-col lg:flex-row mb-4 border-b">
          <nav className="px-3 flex flex-1 ">
            {cohorts.map((cohort) => (
              <TabItem name={cohort} key={cohort} setCurrentTab={setCurrentTab} active={currentTab === cohort}>
                {cohort}
              </TabItem>
            ))}
          </nav>
        </div>
        {!edit ? (
          <>
            {contacts[currentTab].length ? (
              <div className="grid grid-cols-2 grid-rows-2 gap-4 px-4 pb-4">
                {contacts[currentTab].map((contact) => (
                  <Contact contact={contact} key={contact} setHit={setHit} />
                ))}
                {contacts[currentTab].length < 4 && (
                  <div
                    className="flex flex-row border-dashed border-indigo-700 rounded-lg bg-white border-grey-200 border-[1px] shadow-sm mr-4 px-2 items-center justify-center hover:cursor-pointer"
                    onClick={() => setNewContact(true)}>
                    <HiPlus className="text-indigo-300" />
                    <div className="pl-2 text-indigo-700 text-lg">Ajouter un contact</div>
                  </div>
                )}
              </div>
            ) : (
              <div
                className="flex border-dashed border-indigo-700 rounded-lg bg-white border-grey-200 border-[1px] shadow-sm mx-auto px-8 py-4 mb-4 items-center justify-center hover:cursor-pointer"
                onClick={() => setNewContact(true)}>
                <HiPlus className="text-indigo-300" />
                <div className="pl-2 text-indigo-700 text-lg">Ajouter un contact</div>
              </div>
            )}
          </>
        ) : (
          <form className="w-full" onSubmit={handleSubmit}>
            <div className="flex flex-col items-center justify-center px-8 pb-4">
              <div className="w-full flex flex-col justify-center ">
                <div className="flex flex-row">
                  <div className={`flex flex-1 flex-col border-[1px] rounded-lg m-2 py-1 px-2 ${isLoading && "bg-gray-200"}`}>
                    <label htmlFor="firstName" className="w-full m-0 text-left text-gray-500">
                      Prénom
                    </label>
                    <input required disabled={isLoading} className="w-full disabled:bg-gray-200" name="firstName" id="firstName" onChange={handleChange} value={edit.firstName} />
                  </div>

                  <div className={`flex flex-1 flex-col border-[1px] rounded-lg m-2 py-1 px-2 ${isLoading && "bg-gray-200"}`}>
                    <label htmlFor="lastName" className="w-full m-0 text-left text-gray-500">
                      Nom
                    </label>
                    <input required disabled={isLoading} className="w-full disabled:bg-gray-200" name="lastName" id="lastName" onChange={handleChange} value={edit.lastName} />
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
                      required={!edit.contactMail}
                      disabled={isLoading}
                      className="w-full disabled:bg-gray-200"
                      name="contactPhone"
                      id="contactPhone"
                      onChange={handleChange}
                      value={edit.contactPhone}
                    />
                  </div>
                  <div className={`flex flex-1 flex-col border-[1px] rounded-lg m-2 py-1 px-2 ${isLoading && "bg-gray-200"}`}>
                    <label htmlFor="contactMail" className="w-full m-0 text-left text-gray-500">
                      Adresse email
                    </label>
                    <input
                      required={!edit.contactPhone}
                      disabled={isLoading}
                      className="w-full disabled:bg-gray-200"
                      name="contactMail"
                      id="contactMail"
                      onChange={handleChange}
                      value={edit.contactMail}
                    />
                  </div>
                </div>
              </div>
              {!newContact ? (
                <div className="w-full flex flex-row justify-center">
                  <button disabled={isLoading} className="hover:border-b-[1px] hover:border-red-500 pt-2" type="button" onClick={handleDelete}>
                    <div className="w-full flex flex-row justify-center items-center text-red-500">
                      <HiOutlineTrash className="text-red-300 text-lg " />
                      Supprimer le contact
                    </div>
                  </button>
                </div>
              ) : null}

              <div className="w-full flex flex-row justify-center mt-4">
                <button
                  className="flex flex-1 border-[1px] rounded-lg border-grey-300 shadow-sm items-center py-2 px-8 m-2 justify-center cursor-pointer hover:border-lg"
                  onClick={onChange}
                  disabled={isLoading}>
                  Annuler
                </button>
                <button
                  className="flex flex-1 border-[1px] rounded-lg border-indigo-700 bg-indigo-600 shadow-sm items-center py-2 px-8 m-2 text-white justify-center hover:opacity-90"
                  type="submit"
                  disabled={isLoading}>
                  {newContact ? "Ajouter un contact" : "Enregistrer"}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </ModalForm>
  );
}

const Contact = ({ contact, setHit }) => {
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (copied) {
      setTimeout(() => setCopied(false), 3000);
    }
  }, [copied]);
  return (
    <div className="group flex flex-col rounded-lg bg-white border-grey-200 border-[1px] shadow-sm mr-4 px-2">
      <div className="flex flex-row justify-between items-center">
        <div className="flex flex-row items-center px-2 py-2">
          <div className="h-7 w-7 flex justify-center items-center rounded-full bg-gray-100 text-indigo-600 text-xs font-bold mr-2">{getInitials(contact.contactName)}</div>
          <div className="text-lg text-bold mb-1 text-gray-900">{contact.contactName}</div>
        </div>
        <div
          className="invisible group-hover:!visible h-7 w-7 flex items-center rounded-full bg-gray-100 justify-center mx-1 cursor-pointer hover:scale-105"
          onClick={() => setHit(contact)}>
          <HiPencil className="text-blue-500 tex-lg" />
        </div>
      </div>

      <div className="flex flex-row border-t-[1px] border-gray-200">
        {contact.contactPhone ? (
          <div className="flex flex-1 flex-row justify-center items-center my-2 px-2">
            <HiPhone className="text-gray-400" />
            <div className="pl-2 text-gray-700 whitespace-nowrap">{formatPhoneNumberFR(contact.contactPhone)}</div>
          </div>
        ) : null}
        {contact.contactMail ? (
          <div className="flex flex-2 my-2 px-2 border-l-[1px] border-gray-200 truncate w-full justify-center items-center">
            <div className="pr-2 flex-row text-gray-700 truncate ">{contact.contactMail}</div>
            <div
              className="flex items-center justify-center cursor-pointer hover:scale-105"
              onClick={() => {
                copyToClipboard(contact.contactMail);
                setCopied(true);
              }}>
              {copied ? <HiCheckCircle className="text-green-500" /> : <BiCopy className="text-gray-400" />}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

const TabItem = ({ name, active, setCurrentTab, children }) => (
  <div
    onClick={() => setCurrentTab(name)}
    className={`px-3 py-2 cursor-pointer text-coolGray-500  hover:text-snu-purple-800 hover:border-b-[3px] hover:border-snu-purple-800
      ${active && "text-snu-purple-800 border-b-[3px] border-snu-purple-800"}`}>
    {children}
  </div>
);

const getInitials = (word) =>
  (word || "UK")
    .match(/\b(\w)/g)
    .join("")
    .substring(0, 2)
    .toUpperCase();
