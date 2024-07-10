import React from "react";
import { IoWarningOutline } from "react-icons/io5";

import { ModalConfirmation } from "@snu/ds/admin";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function ModaleErrorOnVerify({ isOpen, onClose }: Props) {
  return (
    <ModalConfirmation
      isOpen={isOpen}
      onClose={() => {
        onClose();
      }}
      className="md:max-w-[700px]"
      icon={<IoWarningOutline className="text-red-600" size={40} />}
      title="Vous ne pouvez pas vérifier cette classe."
      text={
        <div>
          <p className="mb-2">Pour être vérifiée une classe doit avoir :</p>
          <ul className="list-none">
            <li>- Un effectif prévisionnel non nul</li>
            <li>- Un référent de classe valide avec Nom, Prénom et Email</li>
          </ul>
        </div>
      }
      actions={[{ title: "Annuler", isCancel: true }]}
    />
  );
}
