import React, { useState, useEffect } from "react";
import ModalForm from "../../../../components/modals/ModalForm";
import { BiCopy } from "react-icons/bi";
import { HiCheckCircle, HiPhone, HiPlus, HiPencil, HiOutlineTrash } from "react-icons/hi";
import { copyToClipboard, translate, formatPhoneNumberFR } from "../../../../utils";
import api from "../../../../services/api";
import { toastr } from "react-redux-toastr";
import { MdInfoOutline } from "react-icons/md";
import ReactTooltip from "react-tooltip";
import Select from "react-select";
import { Select as SelectDS } from "@snu/ds/admin";
import { Label } from "reactstrap";

export default function ModalContacts({ isOpen, setIsOpen, idServiceDep, contacts, cohorts, getService }) {
  const [currentTab, setCurrentTab] = useState();
  const [hit, setHit] = useState();
  const [newContact, setNewContact] = useState(false);
  const [edit, setEdit] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [proposedContact, setProposedContact] = useState([]);
  const cohortList = cohorts.map((cohort) => ({ value: cohort, label: cohort }));

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

  const getAllContact = () => {
    let arrContact = Object.values(contacts).flat();
    const uniqueContact = arrContact.reduce((acc, contact) => {
      const { _id, cohort, ...contactWithoutId } = contact;
      const isDuplicate = acc.some(
        (c) => c.contactMail === contactWithoutId.contactMail && c.contactPhone === contactWithoutId.contactPhone && c.contactName === contactWithoutId.contactName,
      );

      if (!isDuplicate) {
        const updatedContact = {
          ...contactWithoutId,
          firstName: contactWithoutId.contactName.split(" ")[0],
          lastName: contactWithoutId.contactName.split(" ")[1],
          value: contactWithoutId.contactName,
          label: contactWithoutId.contactName,
        };
        acc.push(updatedContact);
      }

      return acc;
    }, []);

    const proposedContact = uniqueContact.filter((contact) => {
      return !contacts[currentTab].some((item) => {
        return item.contactName === contact.contactName && item.contactPhone === contact.contactPhone && item.contactMail === contact.contactMail;
      });
    });
    setProposedContact(proposedContact);
  };

  useEffect(() => {
    setEdit(null);
    setHit(null);
    setNewContact(false);
    getAllContact();
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
    if (cohorts && contacts && !currentTab) {
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
    <ModalForm classNameModal="max-w-4xl" isOpen={isOpen} onCancel={onCancel}>
      <div className="flex w-full flex-col pt-2 ">
        <div className="mb-4 flex flex-row items-center justify-center gap-2">
          <span className="text-xl font-medium text-black">Mes contacts convocation</span>
          <MdInfoOutline data-tip data-for="inscriptions" className="h-5 w-5 cursor-pointer text-gray-400" />
          <ReactTooltip id="inscriptions" type="light" place="top" effect="solid" className="custom-tooltip-radius !opacity-100 !shadow-md" tooltipRadius="6">
            Renseigner le contact local de votre département disponible le jour du départ
          </ReactTooltip>
        </div>
        <div className="mb-4 flex flex-1 flex-col lg:flex-row">
          <nav className="flex-col flex-1 px-3 ">
            <Label className="text-xs leading-5 text-gray-900">Séjour</Label>
            <SelectDS
              options={cohortList}
              className="m-auto w-[100%]"
              defaultValue={cohortList.find((cohort) => cohort.value === currentTab)}
              closeMenuOnSelect={true}
              onChange={(options) => {
                setCurrentTab(options.value);
              }}
            />
          </nav>
        </div>
        {!edit ? (
          <>
            {contacts[currentTab].length ? (
              <div className="grid grid-cols-2 grid-rows-2 gap-4 px-4 pb-4">
                {contacts[currentTab].map((contact) => (
                  <Contact contact={contact} key={contact._id} setHit={setHit} />
                ))}
                {contacts[currentTab].length < 4 && (
                  <div
                    className="border-grey-200 mr-4 flex flex-row items-center justify-center bg-gray-50 px-2 shadow-sm hover:cursor-pointer hover:bg-blue-50"
                    onClick={() => setNewContact(true)}>
                    <HiPlus className="text-blue-600" size={20} />
                    <div className="pl-2 text-lg text-blue-600">Ajouter un contact</div>
                  </div>
                )}
              </div>
            ) : (
              <div
                className="mx-auto mb-4 mt-[150px] flex items-center justify-center bg-gray-50 px-8 py-4 shadow-sm hover:cursor-pointer hover:bg-blue-50"
                onClick={() => setNewContact(true)}>
                <HiPlus className="text-blue-600 mt-1" size={20} />
                <div className="pl-2 text-lg text-blue-600">Ajouter un contact</div>
              </div>
            )}
          </>
        ) : (
          <div>
            {proposedContact.length ? (
              <div className=" w-full px-10 py-2 text-[14px] leading-[20px]">
                <p className="text-gray-500 pb-3">Ajouter à ce séjour un contact déjà existant...</p>
                <Select
                  options={proposedContact}
                  onChange={(e) => setEdit(proposedContact.find((contact) => contact.contactName === e.value))}
                  placeholder="Rechercher un contact"
                  maxMenuHeight={240}
                  styles={{
                    placeholder: (styles) => ({ ...styles, color: "#6B7280" }),
                  }}
                />
                <p className="text-gray-500 pt-3">... ou un nouveau contact :</p>
              </div>
            ) : null}
            <form className="w-full" onSubmit={handleSubmit}>
              <div className="flex flex-col items-center justify-center px-8 pb-4">
                <div className="flex w-full flex-col justify-center ">
                  <div className="flex flex-row">
                    <div className={`m-2 flex flex-1 flex-col rounded-lg border-[1px] py-1 px-2 ${isLoading && "bg-gray-200"}`}>
                      <label htmlFor="firstName" className="m-0 w-full text-left text-gray-500">
                        Prénom
                      </label>
                      <input required disabled={isLoading} className="w-full disabled:bg-gray-200" name="firstName" id="firstName" onChange={handleChange} value={edit.firstName} />
                    </div>

                    <div className={`m-2 flex flex-1 flex-col rounded-lg border-[1px] py-1 px-2 ${isLoading && "bg-gray-200"}`}>
                      <label htmlFor="lastName" className="m-0 w-full text-left text-gray-500">
                        Nom
                      </label>
                      <input required disabled={isLoading} className="w-full disabled:bg-gray-200" name="lastName" id="lastName" onChange={handleChange} value={edit.lastName} />
                    </div>
                  </div>
                  <div className="flex flex-row">
                    <div className={`m-2 flex flex-1 flex-col rounded-lg border-[1px] py-1 px-2 ${isLoading && "bg-gray-200"}`}>
                      <label htmlFor="contactPhone" className="m-0 w-full text-left text-gray-500">
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
                    <div className={`m-2 flex flex-1 flex-col rounded-lg border-[1px] py-1 px-2 ${isLoading && "bg-gray-200"}`}>
                      <label htmlFor="contactMail" className="m-0 w-full text-left text-gray-500">
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

                <div className="mt-4 flex w-full flex-row justify-center">
                  <button
                    className="border-grey-300 hover:border-lg m-2 flex flex-1 cursor-pointer items-center justify-center rounded-lg border-[1px] py-2 px-8 shadow-sm"
                    onClick={onChange}
                    disabled={isLoading}>
                    Annuler
                  </button>
                  <button
                    className="m-2 flex flex-1 items-center justify-center rounded-lg border-[1px] bg-blue-600 py-2 px-8 text-white shadow-sm hover:opacity-90"
                    type="submit"
                    disabled={isLoading}>
                    {newContact ? "Ajouter un contact" : "Enregistrer"}
                  </button>
                </div>
                {!newContact ? (
                  <div className="flex w-full flex-row justify-center mt-1">
                    <button disabled={isLoading} className="pt-2" type="button" onClick={handleDelete}>
                      <div className="flex w-full flex-row items-center justify-center text-red-600 border !border-red-600 p-2 rounded-lg hover:bg-red-50">
                        <HiOutlineTrash className="text-lg text-red-300 " />
                        Supprimer le contact
                      </div>
                    </button>
                  </div>
                ) : null}
              </div>
            </form>
          </div>
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
    <div className="border-grey-200 group mr-4 flex flex-col rounded-lg border-[1px] bg-white px-2 shadow-sm">
      <div className="flex flex-row items-center justify-between">
        <div className="flex flex-row items-center px-2 py-2">
          <div className="mr-2 flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-indigo-600">{getInitials(contact.contactName)}</div>
          <div className="text-bold mb-1 text-lg text-gray-900">{contact.contactName}</div>
        </div>
        <div
          className="invisible mx-1 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-gray-100 hover:scale-105 group-hover:!visible"
          onClick={() => setHit(contact)}>
          <HiPencil className="tex-lg text-blue-500" />
        </div>
      </div>

      <div className="flex flex-row border-t-[1px] border-gray-200">
        {contact.contactPhone ? (
          <div className="my-2 flex flex-1 flex-row items-center justify-center px-2">
            <HiPhone className="text-gray-400" />
            <div className="whitespace-nowrap pl-2 text-gray-700">{formatPhoneNumberFR(contact.contactPhone)}</div>
          </div>
        ) : null}
        {contact.contactMail ? (
          <div className="flex-2 my-2 flex w-full items-center justify-center truncate border-l-[1px] border-gray-200 px-2">
            <div className="flex-row truncate pr-2 text-gray-700 ">{contact.contactMail}</div>
            <div
              className="flex cursor-pointer items-center justify-center hover:scale-105"
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

const getInitials = (word) =>
  (word || "UK")
    .match(/\b(\w)/g)
    .join("")
    .substring(0, 2)
    .toUpperCase();
