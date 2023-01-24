import React, { useEffect, useState } from "react";
import ModalContacts from "../modals/ModalContacts";
import { getInitials, getReferents } from "../../../../utils";

export default function CardContacts({ structure }) {
  const [isOpen, setIsOpen] = useState(false);
  const [contacts, setContacts] = useState([]);

  useEffect(() => {
    getReferents(structure._id).then((contacts) => setContacts(contacts));
  }, []);

  if (!contacts.length) return <div />;
  return (
    <div className="bg-white rounded-lg shadow-sm hover:cursor-pointer items-center hover:scale-105 w-64 px-7 py-6" onClick={() => setIsOpen(true)}>
      <p className="mb-1 text-sm">L&apos;équipe</p>
      <p className="text-gray-500 text-xs">
        {contacts.length} responsable{contacts.length > 1 && "s"}
      </p>
      <div className="flex flex-row mt-4 -space-x-2">
        {contacts.map((contact, index) => {
          if (index < 6)
            return (
              <div key={index} className={`h-8 w-8 flex justify-center items-center rounded-full bg-gray-100 text-blue-600 text-xs border-2 border-white`}>
                {getInitials(contact.firstName + " " + contact.lastName)}
              </div>
            );
        })}
      </div>
      <ModalContacts isOpen={isOpen} setIsOpen={setIsOpen} structure={structure} contacts={contacts} setContacts={setContacts} />
    </div>
  );
}
