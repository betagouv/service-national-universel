import React from "react";
import { MdOutlineDangerous } from "react-icons/md";
import { IoWarningOutline } from "react-icons/io5";

import { ModalConfirmation } from "@snu/ds/admin";

interface Props {
  modaleWithdraw: boolean;
  setModaleWithdraw: (b: boolean) => void;
  onDelete: (action: "withdraw") => void;
}

export default function ModaleWithdraw({ modaleWithdraw, setModaleWithdraw, onDelete }: Props) {
  return (
    <ModalConfirmation
      isOpen={modaleWithdraw}
      onClose={() => {
        setModaleWithdraw(false);
      }}
      className="md:max-w-[500px]"
      icon={<IoWarningOutline className="text-red-600" size={40} />}
      title="Attention, vous êtes sur le point de désister cette classe."
      text="Cette action entraînera l'abandon de l'inscription de tous les élèves de cette classe."
      actions={[
        { title: "Annuler", isCancel: true },
        {
          title: "Désister la classe",
          leftIcon: <MdOutlineDangerous size={20} />,
          onClick: () => onDelete("withdraw"),
          isDestructive: true,
        },
      ]}
    />
  );
}
