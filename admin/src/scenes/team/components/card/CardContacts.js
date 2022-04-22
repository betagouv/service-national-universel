import React, { useEffect, useState } from "react";
import ModalContacts from "../modal/ModalContacts";
import { COHORTS } from "snu-lib/constants";

export default function CardContacts({ contacts, idServiceDep, getService }) {
  const [isOpen, setIsOpen] = useState(false);
  const [sortedContacts, setSortedContacts] = useState({});
  const [nbCohorts, setNbCohorts] = useState(0);

  const getInitials = (word) =>
    (word || "UK")
      .match(/\b(\w)/g)
      .join("")
      .substring(0, 2)
      .toUpperCase();

  useEffect(() => {
    if (contacts) {
      let nb = 0;
      let existCohort = [];
      let tempContact = {};

      contacts.forEach((contact) => {
        if (!existCohort.includes(contact.cohort)) {
          existCohort.push(contact.cohort);
        }
      });

      COHORTS.forEach((cohort) => {
        tempContact[cohort] = [];
        tempContact[cohort].push(...contacts.filter((contact) => contact.cohort === cohort));
      });
      setNbCohorts(existCohort.length);
      setSortedContacts(tempContact);
    }
  }, [contacts]);

  const handleShowModal = () => setIsOpen(true);

  if (!contacts) return null;

  return (
    <div className=" flex flex-row rounded-lg bg-white shadow-sm mr-4 hover:cursor-pointer items-center hover:scale-105" onClick={handleShowModal}>
      <div className="flex flex-col px-7 py-6">
        <div className="font-bold mb-1 text-sm">Contacts convocation</div>
        <div className="text-gray-500 text-xs">
          {contacts.length} contacts - {nbCohorts} séjours
        </div>
        <div className="flex flex-row mt-4 -space-x-2">
          {contacts.map((contact, index) => {
            if (index < 6)
              return (
                <div key={index} className={`h-8 w-8 flex justify-center items-center rounded-full bg-gray-100 text-indigo-600 text-xs border-2 border-white`}>
                  {getInitials(contact.contactName)}
                </div>
              );
          })}
        </div>
      </div>
      <ModalContacts isOpen={isOpen} setIsOpen={setIsOpen} contacts={sortedContacts} cohorts={COHORTS} idServiceDep={idServiceDep} getService={getService} />
    </div>
  );
}
