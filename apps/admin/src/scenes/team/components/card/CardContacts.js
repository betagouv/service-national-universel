import React, { useEffect, useState } from "react";
import ModalContacts from "../modal/ModalContacts";
import { oldSessions, sessions2023 } from "snu-lib";

export default function CardContacts({ contacts, idServiceDep, getService }) {
  const [isOpen, setIsOpen] = useState(false);
  const [sortedContacts, setSortedContacts] = useState({});
  const [nbCohorts, setNbCohorts] = useState(0);
  const [cohorts, setCohorts] = useState([]);

  const [contactsFromCohort, setContactsFromCohort] = useState([]);

  const getInitials = (word) =>
    (word || "UK")
      .match(/\b(\w)/g)
      .join("")
      .substring(0, 2)
      .toUpperCase();

  useEffect(() => {
    if (contacts) {
      let existCohort = [];
      let tempContact = {};

      // we take only the last 2 oldCohorts
      let oldCohorts = oldSessions.map((session) => session.name);
      oldCohorts = oldCohorts.slice(oldCohorts.length - 2, oldCohorts.length);
      const newCohorts = sessions2023.map((session) => session.name);

      const concatCohorts = [...oldCohorts, ...newCohorts];
      setCohorts(concatCohorts);

      contacts.forEach((contact) => {
        if (!existCohort.includes(contact.cohort) && concatCohorts.includes(contact.cohort)) {
          existCohort.push(contact.cohort);
        }
      });

      concatCohorts.forEach((cohort) => {
        tempContact[cohort] = [];
        tempContact[cohort].push(...contacts.filter((contact) => contact.cohort === cohort));
      });
      setNbCohorts(existCohort.length);
      setSortedContacts(tempContact);
      setContactsFromCohort(contacts.filter((contact) => concatCohorts.includes(contact.cohort)));
    }
  }, [contacts]);

  const handleShowModal = () => setIsOpen(true);

  if (!contacts) return null;

  return (
    <div className=" flex flex-row rounded-lg bg-white shadow-sm mr-4 hover:cursor-pointer items-center hover:scale-105" onClick={handleShowModal}>
      <div className="flex flex-col px-7 py-6">
        <div className="font-bold mb-1 text-sm">Contacts convocation</div>
        <div className="text-gray-500 text-xs">
          {contactsFromCohort.length} contacts - {nbCohorts} séjours
        </div>
        <div className="flex flex-row mt-4 -space-x-2">
          {contactsFromCohort.map((contact, index) => {
            if (index < 6)
              return (
                <div key={index} className={`h-8 w-8 flex justify-center items-center rounded-full bg-gray-100 text-indigo-600 text-xs border-2 border-white`}>
                  {getInitials(contact.contactName)}
                </div>
              );
          })}
        </div>
      </div>
      <ModalContacts isOpen={isOpen} setIsOpen={setIsOpen} contacts={sortedContacts} cohorts={cohorts} idServiceDep={idServiceDep} getService={getService} />
    </div>
  );
}
