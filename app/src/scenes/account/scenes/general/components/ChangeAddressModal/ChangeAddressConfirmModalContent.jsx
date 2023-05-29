import React from "react";
import Modal from "../../../../../../components/ui/modals/Modal";

const ChangeAddressConfirmModalContent = ({ onConfirm, onCancel }) => {
  return (
    <>
      <Modal.Title>J’ai changé d’adresse</Modal.Title>
      <Modal.Subtitle>Êtes-vous sûr(e) de vouloir déclarer un changement d’adresse ?</Modal.Subtitle>
      <Modal.Buttons onCancel={onCancel} onConfirm={onConfirm} cancelText="Non" confirmText="Oui" />
    </>
  );
};

export default ChangeAddressConfirmModalContent;
