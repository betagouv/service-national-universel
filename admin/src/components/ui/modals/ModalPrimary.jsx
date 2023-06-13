import React from "react";
import { BiLoaderAlt } from "react-icons/bi";
import ButtonLight from "../buttons/ButtonLight";
import Modal from "./Modal";
import ButtonPrimary from "../buttons/ButtonPrimary";
import CheckCircle from "../../../assets/icons/CheckCircle";

const ModalPrimary = ({
  isOpen,
  onClose: handleClose = () => {},
  onCancel: handleCancel = () => {},
  onConfirm: handleConfirm = () => {},
  title = "",
  message = "",
  className = "",
  confirmButtonText = "Confirmer",
  isCancelButtonDisabled = false,
  isConfirmButtonDisabled = false,
  cancelButtonText = "Annuler",
  isLoading = false,
  children = null,
  icon = <CheckCircle className="h-[40px] w-[40px] text-[#D1D5DB]" />,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={handleClose} className={className}>
      <Modal.Header className="flex-col items-center justify-center">
        {icon}
        <h3 className="text-center text-xl font-medium text-gray-900">{title}</h3>
      </Modal.Header>
      <Modal.Content>
        {message && <p className="font-sm text-center text-gray-500">{message}</p>}
        {children}
      </Modal.Content>
      <Modal.Footer className="flex gap-3">
        <ButtonLight className="flex-1" onClick={handleCancel} disabled={isCancelButtonDisabled || isLoading}>
          {cancelButtonText}
        </ButtonLight>
        <ButtonPrimary className="flex-1" onClick={handleConfirm} disabled={isConfirmButtonDisabled || isLoading}>
          {isLoading && (
            <span className="animate-spin">
              <BiLoaderAlt />
            </span>
          )}
          {confirmButtonText}
        </ButtonPrimary>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalPrimary;
