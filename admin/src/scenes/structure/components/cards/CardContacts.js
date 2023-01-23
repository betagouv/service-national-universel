import React, { useEffect, useState } from "react";
import ModalContacts from "../modals/ModalContacts";
import { Spinner } from "reactstrap";

export default function CardContacts({ getContacts, createContact, deleteContact }) {
  const [isOpen, setIsOpen] = useState(false);
  const [contacts, setContacts] = useState([]);
  console.log("🚀 ~ file: CardContacts.js:9 ~ CardContacts ~ contacts", contacts);

  useEffect(() => {
    getContacts().then((contacts) => setContacts(contacts));
  }, []);

  const getInitials = (word) =>
    (word || "UK")
      .match(/\b(\w)/g)
      .join("")
      .substring(0, 2)
      .toUpperCase();

  if (!contacts.length) return <Spinner />;
  return (
    <div className="bg-white rounded-lg shadow-sm hover:cursor-pointer items-center hover:scale-105 w-64 px-7 py-6" onClick={() => setIsOpen(true)}>
      <div className="font-bold mb-1 text-sm">L&apos;équipe</div>
      <div className="text-gray-500 text-xs">
        {contacts.length} responsable{contacts.length > 1 && "s"}
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
      <ModalContacts isOpen={isOpen} setIsOpen={setIsOpen} contacts={contacts} getContacts={getContacts} createContact={createContact} deleteContact={deleteContact} />
    </div>
  );
}
