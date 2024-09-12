import React from "react";
import { HiOutlineExclamationCircle } from "react-icons/hi";
import { ModalConfirmation } from "@snu/ds/admin";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function ModaleWarning({ isOpen, onClose }: Props) {
  return (
    <ModalConfirmation
      isOpen={isOpen}
      onClose={() => {
        onClose();
      }}
      className="md:max-w-[600px]"
      icon={<HiOutlineExclamationCircle className="bg-gray-100 rounded-full p-2" size={48} />}
      title="Message important"
      text={
        <div className="mt-6 text-base leading-6 font-normal text-gray-900">
          Attention, les informations saisies dans la plateforme doivent être saisies en doublon dans le SI SNU si besoin (les classes devront être créées manuellement).
        </div>
      }
      actions={[{ title: "Fermer", isCancel: true }]}
    />
  );
}
