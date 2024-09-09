import React from "react";
import { useHistory } from "react-router-dom";
import { HiOutlineCheck } from "react-icons/hi";
import { ModalConfirmation } from "@snu/ds/admin";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  id: string;
}

export default function ModaleValidation({ isOpen, onClose, id }: Props) {
  const history = useHistory();
  return (
    <ModalConfirmation
      isOpen={isOpen}
      onClose={() => {
        onClose();
      }}
      className="md:max-w-[600px]"
      icon={<HiOutlineCheck className="bg-gray-100 rounded-full p-2" size={48} />}
      title="Confirmation de la création"
      text={
        <div className="mt-6 text-base leading-6 font-normal text-gray-900">
          Cet établissement a bien été créé dans la plateforme Admin ! Un mail d’inscription a été automatiquement envoyé au chef d’établissement.
        </div>
      }
      actions={[{ title: "Fermer", isCancel: true, onClick: () => history.push(`/etablissement/${id}`) }]}
    />
  );
}
