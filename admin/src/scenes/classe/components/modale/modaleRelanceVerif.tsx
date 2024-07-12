import React from "react";

import { ModalConfirmation } from "@snu/ds/admin";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onRelance: () => void;
}

export default function ModaleRelanceVerif({ isOpen, onClose, onRelance }: Props) {
  return (
    <ModalConfirmation
      isOpen={isOpen}
      onClose={() => {
        onClose();
      }}
      className="md:max-w-[600px]"
      title="Vous êtes sur le point de notifier le chef d'établissement de cette classe."
      text="Il recevra un email lui demandant de vérifier les informations de la classe. Si celui-ci n'est pas encore inscrit sur la plateforme, il recevra un email l'invitant à s'inscrire."
      actions={[
        { title: "Annuler", isCancel: true },
        {
          title: "Confirmer",
          onClick: () => onRelance(),
        },
      ]}
    />
  );
}
