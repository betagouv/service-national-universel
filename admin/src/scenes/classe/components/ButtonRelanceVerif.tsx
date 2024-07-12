import React, { useState } from "react";
import { toastr } from "react-redux-toastr";
import { HiOutlineRefresh } from "react-icons/hi";

import { ModalConfirmation, Button } from "@snu/ds/admin";
import { translate } from "snu-lib";
import { capture } from "@/sentry";
import api from "@/services/api";

interface Props {
  classeId: string;
  onLoading: (isLoading: boolean) => void;
}

export default function ButtonRelanceVerif({ classeId, onLoading }: Props) {
  const [showModal, setShowModal] = useState(false);

  const notifyRefForVerif = async () => {
    try {
      onLoading(true);
      setShowModal(false);

      const { ok, code } = await api.get(`/cle/classe/${classeId}/notifyRef`);

      if (!ok) {
        toastr.error("Oups, une erreur est survenue lors de l'envoi de la notification", translate(code));
        return onLoading(false);
      } else {
        toastr.success("Opération réussie", "Notification envoyée");
      }
    } catch (e) {
      capture(e);
      toastr.error("Oups, une erreur est survenue lors de l'envoi de la notification", e);
    } finally {
      onLoading(false);
      setShowModal(false);
    }
  };

  return (
    <>
      <Button
        key="relance"
        leftIcon={<HiOutlineRefresh size={20} className="mt-1" />}
        type="wired"
        title="Relancer la vérification"
        className="mr-2"
        onClick={() => setShowModal(true)}
      />
      <ModalConfirmation
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
        }}
        className="md:max-w-[600px]"
        title="Vous êtes sur le point de notifier le chef d'établissement de cette classe."
        text="Il recevra un email lui demandant de vérifier les informations de la classe. Si celui-ci n'est pas encore inscrit sur la plateforme, il recevra un email l'invitant à s'inscrire."
        actions={[
          { title: "Annuler", isCancel: true },
          {
            title: "Confirmer",
            onClick: notifyRefForVerif,
          },
        ]}
      />
    </>
  );
}
