import React from "react";
import { MdOutlineDangerous } from "react-icons/md";
import { IoWarningOutline } from "react-icons/io5";

import { ModalConfirmation } from "@snu/ds/admin";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onWithdraw: () => void;
}

export default function ModaleWithdraw({ isOpen, onClose, onWithdraw }: Props) {
  return (
    <ModalConfirmation
      isOpen={isOpen}
      onClose={() => {
        onClose();
      }}
      className="md:max-w-[700px]"
      icon={<IoWarningOutline className="text-red-600" size={40} />}
      title="Attention, vous êtes sur le point de désister cette classe."
      text="Cette action entraînera l'abandon de l'inscription de tous les élèves de cette classe."
      actions={[
        { title: "Annuler", isCancel: true },
        {
          title: "Désister la classe",
          leftIcon: <MdOutlineDangerous size={20} />,
          onClick: () => onWithdraw(),
          isDestructive: true,
        },
      ]}
    />
  );
}
