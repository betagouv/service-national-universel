import React from "react";
import Modal from "../../../../../../components/ui/modals/Modal";
import InformationCircle from "../../../../../../assets/icons/InformationCircle";
import LightningBolt from "../../../../../../assets/icons/LightningBolt";

const ChangedDepartmentInfoModalContent = ({ onCancel, onConfirm, cohortPeriod, type, isLoading }) => {
  const isNotEligible = type === "NOT_ELIGIBLE";
  const onComplemetaryList = type === "COMPLEMENTARY_LIST";
  return (
    <>
      <div className="flex justify-center">
        <div className="w-11 h-11 flex justify-center items-center bg-blue-100 rounded-full mb-6">
          {onComplemetaryList ? <InformationCircle className="text-blue-600" /> : <LightningBolt className="text-blue-600" />}
        </div>
      </div>
      {onComplemetaryList && (
        <>
          <Modal.Title>Vous avez changé de département</Modal.Title>
          <div className="text-gray-500 md:text-center">
            Suite au grand nombre de dossiers reçus dans votre nouveau département de résidence, vous serez inscrit sur liste complémentaire pour le séjour{" "}
            <span className="text-gray-900 font-medium">{cohortPeriod}</span>. Nous reviendrons vers vous dès qu&apos;une place se libère.
          </div>
        </>
      )}

      {isNotEligible && (
        <>
          <Modal.Title>Vous n'êtes éligible à aucun séjour de cohésion pour le moment</Modal.Title>
          <div className="text-gray-500 md:text-center">
            Aucun séjour de cohésion n'est prévu <span className="text-gray-900 font-medium">{cohortPeriod}</span> dans votre nouveau département de résidence et vous n’êtes plus
            éligible à un prochain séjour de cohésion.
          </div>
        </>
      )}

      <Modal.Buttons
        className="md:flex-col-reverse"
        onCancel={onCancel}
        cancelText="Annuler"
        onConfirm={onConfirm}
        confirmText={isNotEligible ? "Valider et découvrir d’autres formes d’engagement" : "Valider le changement d'adresse"}
        disabled={isLoading}
      />
    </>
  );
};

export default ChangedDepartmentInfoModalContent;
