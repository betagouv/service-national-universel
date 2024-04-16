import React, { useState } from "react";
import { FaCheck } from "react-icons/fa6";
import { IoShieldCheckmarkOutline } from "react-icons/io5";

import { Button, ModalConfirmation } from "@snu/ds/admin";

export default function ForceConsentement({ young, onConstentChange }) {
  const [imageRights, setImageRights] = useState(false);
  const [participationConsent, setParticipationConsent] = useState(false);
  const [modalConsent, setModalConsent] = useState(false);

  async function handleConfirmConsent() {
    setModalConsent(false);
    onConstentChange(participationConsent, imageRights);
  }

  return (
    <>
      <div className="flex justify-end mt-4 border-t border-t-[#E5E7EB] p-4">
        <Button
          disabled={young.inscriptionStep2023 !== "WAITING_CONSENT" && young.reinscriptionStep2023 !== "WAITING_CONSENT"}
          title="Accepter à la place des représentants légaux"
          type="tertiary"
          leftIcon={<FaCheck />}
          onClick={() => setModalConsent(true)}
        />
      </div>
      {young.inscriptionStep2023 !== "WAITING_CONSENT" && young.reinscriptionStep2023 !== "WAITING_CONSENT" && (
        // TODO: intégrer la maquette
        <div>la fonctionnalité sera disponible des que l’inscription du jeune sera terminée</div>
      )}
      <ModalConfirmation
        isOpen={modalConsent}
        onClose={() => {
          setModalConsent(false);
        }}
        className="md:max-w-[500px]"
        icon={<IoShieldCheckmarkOutline size={40} />}
        title="Consentements à la place des représentants légaux"
        text={
          <div className="text-gray-900 text-sm">
            <p>
              Vous allez valider le consentements et le droit à l'image à la place des représentants légaux de{" "}
              <span className="font-bold">
                {young.firstName} {young.lastName}
              </span>
              . Conservez bien l’autorisation écrite dans le dossier des élèves au sein de l’établissement.
            </p>
            <div className="flex-col mt-4 w-[90%] mx-auto">
              <div className="flex justify-start mb-3">
                <input type="checkbox" className="mr-2 w-5 h-5 mt-0.5" checked={imageRights} onChange={(e) => setImageRights(e.target.checked)} />
                <p className="text-sm font-bold ml-5">Droit à l'image</p>
              </div>
              <div className="flex justify-start">
                <input type="checkbox" className="mr-2 w-5 h-5 mt-0.5" checked={participationConsent} onChange={(e) => setParticipationConsent(e.target.checked)} />
                <p className="text-sm font-bold ml-5">Consentement à la participation</p>
              </div>
            </div>
          </div>
        }
        actions={[
          { title: "Fermer", isCancel: true },
          { title: "Confirmer", onClick: handleConfirmConsent },
        ]}
      />
    </>
  );
}
