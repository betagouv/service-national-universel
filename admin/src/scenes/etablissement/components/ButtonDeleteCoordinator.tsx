import React, { useState } from "react";
import { HiOutlinePencil, HiOutlineX } from "react-icons/hi";
import { toastr } from "react-redux-toastr";
import { useBoolean } from "react-use";

import { SUB_ROLES, translate, ReferentDto } from "snu-lib";
import { Button, ModalConfirmation } from "@snu/ds/admin";
import { ProfilePic } from "@snu/ds";

import { capture } from "@/sentry";
import api from "@/services/api";
import { useMutation } from "@tanstack/react-query";

interface Props {
  etablissementId: string;
  contacts: ReferentDto[];
  onChange: () => void;
  className?: string;
}

export default function ButtonDeleteCoordinator({ etablissementId, contacts, onChange, className }: Props) {
  const [showModal, toggleShowModal] = useBoolean(false);
  const [deletedCoordinatorIds, setDeletedCoordinatorIds] = useState<string[]>([]);

  const { isPending, mutate } = useMutation({
    mutationFn: async (deletedCoordinatorIds: string[]) => {
      const { ok, code, data } = await api.remove(`/cle/etablissement/${etablissementId}/referents`, { referentIds: deletedCoordinatorIds });
      if (!ok) throw new Error(translate(code));
      return data;
    },
    onSuccess: () => {
      toastr.success("Le coordinateur a bien été supprimé", "");
      closeModal();
      onChange();
    },
    onError: (e: any) => {
      capture(e);
      toastr.error("Une erreur est survenue lors de la suppression du coordinateur", translate(e.code));
    },
  });

  const closeModal = () => {
    toggleShowModal(false);
    setDeletedCoordinatorIds([]);
  };

  return (
    <>
      <Button type="modify" leftIcon={<HiOutlinePencil size={16} />} title="Modifier" onClick={toggleShowModal} className={className} />
      <ModalConfirmation
        isOpen={showModal}
        onClose={closeModal}
        className="md:max-w-[700px]"
        icon={<ProfilePic />}
        title="Modifier les coordinateurs d’établissement"
        text={
          <div className="mt-6 w-[636px] text-left text-ds-gray-900 flex flex-col gap-6">
            {contacts
              .filter(({ _id, subRole }) => subRole === SUB_ROLES.coordinateur_cle && !deletedCoordinatorIds.includes(_id))
              .map((contact) => (
                <div key={contact._id} className="flex items-center justify-between gap-6 py-2">
                  <div>
                    <div className="text-base leading-6 font-bold">
                      {contact.firstName} {contact.lastName}
                    </div>
                    <div className="text-sm leading-5 font-normal">{translate(contact.subRole)}</div>
                  </div>
                  <button
                    className="bg-red-50 p-3 rounded-full border-[1px] hover:border-red-500"
                    onClick={() => setDeletedCoordinatorIds([...deletedCoordinatorIds, contact._id])}>
                    <HiOutlineX className="text-red-500" size={24} />
                  </button>
                </div>
              ))}
          </div>
        }
        actions={[
          { title: "Annuler", isCancel: true },
          { title: "Valider", onClick: () => mutate(deletedCoordinatorIds), disabled: isPending },
        ]}
      />
    </>
  );
}
