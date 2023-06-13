import React, { useState } from "react";
import { toastr } from "react-redux-toastr";
import { deleteYoungAccount } from "../../../services/young.service";
import InputText from "../../ui/forms/InputText";
import ModalDanger from "../../ui/modals/ModalDanger";

const isConfirmValueValid = (young, confirmationValue) => {
  if (!young || !young.lastName) {
    return true;
  }
  if (confirmationValue !== young.lastName) {
    return true;
  }
  return false;
};

const warningTitle = "Êtes-vous sûr(e) de vouloir supprimer ce(tte) volontaire ?";

const warningMessage = (
  <>
    <span className="block">Cette action est irréversible.</span>
    <span className="mb-4 block">
      Merci d&apos;entrer <strong>le nom de famille</strong> du (de la) volontaire pour confirmer sa suppression:
    </span>
  </>
);

const loadingTitle = "Suppression en cours...";

const loadingMessage = "Merci de patienter. La suppression devrait prendre moins d'une minute.";

const ModalConfirmDeleteYoung = ({ isOpen, onClose: handleClose = () => {}, onCancel: handleCancel = () => {}, onConfirm = () => {}, young = null }) => {
  const [confirmationValue, setConfirmationValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (event) => {
    setConfirmationValue(event.target.value);
  };

  const handleConfirm = async () => {
    try {
      setIsLoading(true);
      const { title, message } = await deleteYoungAccount(young._id);
      onConfirm();
      toastr.success(title, message);
    } catch (error) {
      const { title, message } = error;
      toastr.error(title, message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ModalDanger
      isOpen={isOpen}
      onClose={handleClose}
      onConfirm={handleConfirm}
      onCancel={handleCancel}
      title={isLoading ? loadingTitle : warningTitle}
      message={isLoading ? loadingMessage : warningMessage}
      isLoading={isLoading}
      isConfirmButtonDisabled={isConfirmValueValid(young, confirmationValue)}>
      {!isLoading && <InputText value={confirmationValue} onChange={handleInputChange} placeholder="Ex: DUPONT" />}
    </ModalDanger>
  );
};

export default ModalConfirmDeleteYoung;
