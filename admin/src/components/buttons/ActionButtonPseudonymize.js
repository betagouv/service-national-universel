import React, { useState } from "react";
import { useHistory } from "react-router-dom";

import PanelActionButton from "./PanelActionButton";
import api from "../../services/api";
import ModalConfirm from "../modals/ModalConfirm";

export default function ActionButtonPseudonymize({ young, ...rest }) {
  const [modal, setModal] = useState({ isOpen: false, onConfirm: null });
  const history = useHistory();

  const onConfirm = async () => {
    try {
      const { ok } = await api.post(`/young/${young._id}/anonymize`);
      if (ok) history.go(0);
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <>
      <div
        onClick={() => {
          setModal({
            isOpen: true,
            onConfirm,
            title: `Êtes-vous sûr(e) de vouloir anonymiser le profil de ${young.firstName} ?`,
            message:
              "Cette action est irréversible, et enverra automatiquement un mail au volontaire lui indiquant qu'il peut à nouveau s'inscrire sur la plateforme. Si vous souhaitez modifier le sujet du template, contactez l'équipe technique.",
          });
        }}
        {...rest}>
        <PanelActionButton icon="impersonate" title="Anonymiser" />
      </div>
      <ModalConfirm
        isOpen={modal?.isOpen}
        title={modal?.title}
        message={modal?.message}
        onCancel={() => setModal({ isOpen: false, onConfirm: null })}
        onConfirm={() => {
          modal?.onConfirm();
          setModal({ isOpen: false, onConfirm: null });
        }}
      />
    </>
  );
}
