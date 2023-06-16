import React from "react";
import Modal from "../../../../../../components/ui/modals/Modal";
import InformationCircle from "../../../../../../assets/icons/InformationCircle";

const ChangedDepartmentInfoModalContent = ({ onConfirm, cohortPeriod, type, isLoading }) => {
  return (
    <>
      <div className="flex justify-center">
        <div className="w-11 h-11 flex justify-center items-center bg-blue-100 rounded-full mb-6">
          <InformationCircle className="text-blue-600" />
        </div>
      </div>
      <Modal.Title>Vous avez changé de département</Modal.Title>
      {type === "COMPLEMENTARY_LIST" && (
        <div className="text-gray-500 md:text-center">
          Suite au grand nombre de dossiers reçus dans votre nouveau département de résidence, vous serez inscrit sur liste complémentaire pour le séjour{" "}
          <span className="text-gray-900 font-medium">{cohortPeriod}</span>. Nous reviendrons vers vous dès qu&apos;une place se libère.
        </div>
      )}

      {type === "NOT_ELIGIBLE" && (
        <div className="text-gray-500 md:text-center">
          Aucun séjour de cohésion n'est prévu <span className="text-gray-900 font-medium">{cohortPeriod}</span> dans votre nouveau département de résidence. Malheureusement, vous
          n’êtes plus éligible à un prochain séjour de cohésion.
        </div>
      )}

      <Modal.Buttons onConfirm={onConfirm} confirmText="J'ai compris" disabled={isLoading} />
    </>
  );
};

export default ChangedDepartmentInfoModalContent;
