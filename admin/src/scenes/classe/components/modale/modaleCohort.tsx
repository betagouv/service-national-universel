import React from "react";
import { HiOutlineExclamation } from "react-icons/hi";
import { ModalConfirmation } from "@snu/ds/admin";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSendInfo: () => void;
}

export default function ModaleCohort({ isOpen, onClose, onSendInfo }: Props) {
  return (
    <ModalConfirmation
      isOpen={isOpen}
      onClose={() => {
        onClose();
      }}
      className="md:max-w-[500px]"
      icon={<HiOutlineExclamation className="text-red-600 bg-red-50 rounded-full p-2" size={40} />}
      title="Changement de cohorte"
      text={
        <div className="mt-6">
          <p className="text-base font-normal text-gray-900 mb-6">Attention ! Vous êtes sur le point de changer la cohorte de cette classe.</p>
          <p className="text-base font-bold text-red-600 mb-6">
            Les informations du centre et du point de rassemblement vont être supprimées également et vous devrez les remplir à nouveau !
          </p>
        </div>
      }
      actions={[
        { title: "Annuler", isCancel: true },
        {
          title: "J'ai compris",
          onClick: () => onSendInfo(),
        },
      ]}
    />
  );
}
