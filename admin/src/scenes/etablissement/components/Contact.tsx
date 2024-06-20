import React, { useEffect, useState } from "react";
import { HiOutlinePencil, HiOutlinePhone, HiOutlineMail, HiCheckCircle } from "react-icons/hi";
import { MdOutlineContentCopy } from "react-icons/md";
import { Link } from "react-router-dom";

import { Button, Container } from "@snu/ds/admin";
import { translate, ROLES, SUB_ROLES } from "snu-lib";
import { copyToClipboard } from "@/utils";

interface Props {
  contacts: any[];
  copied: boolean[];
  user: any;
  setContactsToUpdate: (contacts: any[]) => void;
  setModalChangeContacts: (value: boolean) => void;
  setCopied: (copied: boolean[]) => void;
}

export default function Contact({ contacts, copied, user, setContactsToUpdate, setModalChangeContacts, setCopied }: Props) {
  return (
    <Container
      title="Contacts"
      actions={[
        [ROLES.ADMIN].includes(user.role) && (
          <Button
            key="update-contacts"
            type="modify"
            leftIcon={<HiOutlinePencil size={16} />}
            title="Modifier"
            onClick={() => {
              setContactsToUpdate([...contacts.filter((c) => c.subRole === SUB_ROLES.referent_etablissement)]);
              setModalChangeContacts(true);
            }}
          />
        ),
        [ROLES.ADMINISTRATEUR_CLE, ROLES.REFERENT_CLASSE].includes(user.role) && (
          <Link key="list-users" to="/user">
            <Button type="tertiary" title="Voir mes contacts" />
          </Link>
        ),
      ]}>
      <div className="flex items-stretch justify-between overflow-y-auto">
        {contacts.map((contact, index) => (
          <div key={contact.email} className="flex-1 shrink-0 flex items-stretch justify-between">
            <div>
              <Link to={"/user/" + contact._id} className="text-base font-bold text-ds-gray-900 hover:underline hover:text-ds-gray-900">
                {contact.firstName} {contact.lastName}
              </Link>
              <div className="mb-4 text-ds-gray-500">{translate(contact.subRole)}</div>
              <div className="flex items-center justify-start mb-2">
                <HiOutlinePhone size={20} className="mr-2" />
                {contact.phone}
              </div>
              <div className="flex items-center justify-start max-w-[290px]">
                <div>
                  <HiOutlineMail size={20} className="mr-2" />
                </div>
                <p className="truncate">{contact.email}</p>
                <div
                  className="flex items-center justify-center"
                  onClick={() => {
                    copyToClipboard(contact.email);
                    const newCopied = [...copied];
                    newCopied[index] = true;
                    setCopied(newCopied);
                    setTimeout(() => {
                      setCopied([]);
                    }, 2000);
                  }}>
                  {copied[index] ? <HiCheckCircle className="text-green-500 ml-2" /> : <MdOutlineContentCopy size={20} className="ml-2 text-gray-400 cursor-pointer" />}
                </div>
              </div>
            </div>
            {index < contacts.length - 1 && <div className="mx-12 w-[1px] bg-gray-200 shrink-0">&nbsp;</div>}
          </div>
        ))}
      </div>
    </Container>
  );
}
