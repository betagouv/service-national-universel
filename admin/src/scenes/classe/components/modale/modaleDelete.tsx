import React from "react";
import { MdOutlineDangerous } from "react-icons/md";
import { HiOutlineExclamation } from "react-icons/hi";
import { ModalConfirmation } from "@snu/ds/admin";

interface Props {
  isOpen: boolean;
  onClose: (b: boolean) => void;
  onDelete: (action: "delete") => void;
}

export default function ModaleDelete({ isOpen, onClose, onDelete }: Props) {
  return (
    <ModalConfirmation
      isOpen={isOpen}
      onClose={() => {
        onClose(false);
      }}
      className="md:max-w-[500px]"
      icon={<HiOutlineExclamation className="text-red-600 bg-red-50 rounded-full p-2" size={40} />}
      title="Supprimer cette classe"
      text="Voulez-vous vraiment supprimer cette classe ? Cette action est irréversible."
      actions={[
        { title: "Annuler", isCancel: true },
        {
          title: "Supprimer la classe",
          leftIcon: <MdOutlineDangerous size={20} />,
          onClick: () => onDelete("delete"),
          isDestructive: true,
        },
      ]}
    />
  );
}
