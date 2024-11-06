import React, { useState } from "react";
import { HiOutlinePencil, HiOutlineX } from "react-icons/hi";
import { toastr } from "react-redux-toastr";

import { Button, ModalConfirmation, Select } from "@snu/ds/admin";
import { ProfilePic } from "@snu/ds";
import { ROLES, SUB_ROLES, translate, ReferentDto } from "snu-lib";
import api from "@/services/api";
import { capture } from "@/sentry";

interface Props {
  contacts: ReferentDto[];
  etablissementId: string;
  onChange: () => void;
}

export default function ButtonEditChefEtablissement({ contacts, etablissementId, onChange }: Props) {
  const [modalChangeContacts, setModalChangeContacts] = useState(false);
  const [errors, setErrors] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [contactsToUpdate, setContactsToUpdate] = useState<ReferentDto[]>([]);

  const saveContacts = async () => {
    try {
      setIsLoading(true);
      setErrors("");
      if (!contactsToUpdate.length) {
        setErrors("Veuillez renseigner au moins un contact");
      }
      if (errors) {
        setIsLoading(false);
        return;
      }

      const { ok, code } = await api.put(`/cle/etablissement/${etablissementId}/referents`, { referentEtablissementIds: contactsToUpdate.map((c) => c._id) });
      if (!ok) throw new Error(translate(code));

      await onChange();
      setModalChangeContacts(false);
      setIsLoading(false);
      setErrors("");
    } catch (e) {
      capture(e);
      toastr.error("Erreur", "Oups, une erreur est survenue lors de la modification des contacts de l'établissement");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchReferentsEtablissement = async (search) => {
    const q = {
      filters: {
        cohorts: [],
        department: [],
        region: [],
        role: [ROLES.ADMINISTRATEUR_CLE],
        subRole: [SUB_ROLES.referent_etablissement],
        searchbar: [] as string[],
      },
      sort: {
        field: "lastName.keyword",
        order: "asc",
      },
      page: 0,
      size: 10,
    };
    if (search) q.filters.searchbar = [search];
    const { responses } = await api.post(`/elasticsearch/referent/search`, q);
    return responses[0].hits.hits.map((hit) => ({
      value: hit._id,
      label: `${hit._source.firstName} ${hit._source.lastName}`,
      referent: { ...hit._source, _id: hit._id },
    }));
  };

  const getContactToAdd = () => {
    const contactToAdd = contactsToUpdate.find((c) => c._id === null);
    return contactToAdd ? { value: contactToAdd._id, label: `${contactToAdd.firstName} ${contactToAdd.lastName}` } : null;
  };

  return (
    <>
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
      <ModalConfirmation
        isOpen={modalChangeContacts}
        onClose={() => {
          setModalChangeContacts(false);
          setErrors("");
        }}
        className="md:max-w-[700px]"
        icon={<ProfilePic />}
        title="Modifier les référents de l’établissement"
        text={
          <div className="mt-6 w-[636px] text-left text-ds-gray-900">
            {errors && <div className="text-red-500 mb-2">{errors}</div>}
            {contactsToUpdate.map((contact) => (
              <div key={contact._id.toString()} className="flex items-center justify-between my-3">
                <div>
                  <div className="font-bold">
                    {contact.firstName} {contact.lastName}
                  </div>
                  <p>{translate(contact.subRole)}</p>
                </div>
                <ProfilePic
                  size={40}
                  className="cursor-pointer"
                  icon={({ size, className }) => <HiOutlineX size={size} className={className} />}
                  onClick={() => setContactsToUpdate(contactsToUpdate.filter((c) => c._id !== contact._id))}
                />
              </div>
            ))}
            <Select
              isAsync
              className="my-6"
              placeholder="Ajouter un référent"
              loadOptions={fetchReferentsEtablissement}
              value={getContactToAdd()}
              isClearable={true}
              noOptionsMessage={"Aucun référent d'établissement ne correspond à cette recherche"}
              onChange={({ referent }) => {
                if (!contactsToUpdate.some((c) => c._id === referent._id)) setContactsToUpdate([...contactsToUpdate, referent]);
              }}
              closeMenuOnSelect={true}
            />
          </div>
        }
        actions={[
          { title: "Annuler", isCancel: true },
          { title: "Valider", disabled: contactsToUpdate.length === 0, loading: isLoading, onClick: () => saveContacts() },
        ]}
      />
    </>
  );
}
