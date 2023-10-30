import React, { useEffect, useState } from "react";
import ModalContacts from "../modal/ModalContacts";
import { oldSessions } from "snu-lib";
import API from "@/services/api";
import { capture } from "@/sentry";

export default function CardContacts({ contacts, idServiceDep, getService }) {
  const [isOpen, setIsOpen] = useState(false);
  const [sortedContacts, setSortedContacts] = useState({});
  const [nbCohorts, setNbCohorts] = useState(0);
  const [cohorts, setCohorts] = useState([]);
  const [sessions2023, setSessions2023] = useState([]);

  const [contactsFromCohort, setContactsFromCohort] = useState([]);

  async function cohortsInit() {
    try {
      const result = await API.get("/cohort");
      if (result.status === 401) {
        return;
      }
      if (!result.ok) {
        capture("Unable to load global cohorts data :" + JSON.stringify(result));
      } else {
        setSessions2023(result.data);
      }
    } catch (err) {
      capture(err);
    }
  }

  const getInitials = (word) =>
    (word || "UK")
      .match(/\b(\w)/g)
      .join("")
      .substring(0, 2)
      .toUpperCase();

  useEffect(() => {
    cohortsInit();
  }, []);

  useEffect(() => {
    if (contacts && sessions2023.length > 0) {
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
  }, [contacts, sessions2023]);

  const handleShowModal = () => setIsOpen(true);

  if (!contacts) return null;

  return (
    <div className=" mr-4 flex flex-row items-center rounded-lg bg-white shadow-sm hover:scale-105 hover:cursor-pointer" onClick={handleShowModal}>
      <div className="flex flex-col px-7 py-6">
        <div className="mb-1 text-sm font-bold">Contacts convocation</div>
        <div className="text-xs text-gray-500">
          {contactsFromCohort.length} contacts - {nbCohorts} séjours
        </div>
        <div className="mt-4 flex flex-row -space-x-2">
          {contactsFromCohort.map((contact, index) => {
            if (index < 6)
              return (
                <div key={index} className={`flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-gray-100 text-xs text-indigo-600`}>
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
