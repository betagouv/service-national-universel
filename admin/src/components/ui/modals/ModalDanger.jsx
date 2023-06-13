import React from "react";
import { BiLoaderAlt } from "react-icons/bi";
import DangerTriangle from "../../../assets/icons/DangerTriangle";
import ButtonDanger from "../buttons/ButtonDanger";
import ButtonLight from "../buttons/ButtonLight";
import Modal from "./Modal";

const ModalDanger = ({
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
  icon = null,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={handleClose} className={className}>
      <Modal.Header className="flex-col items-center justify-center">
        <DangerTriangle />
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
        <ButtonDanger className="flex-1" onClick={handleConfirm} disabled={isConfirmButtonDisabled || isLoading}>
          {isLoading && (
            <span className="animate-spin">
              <BiLoaderAlt />
            </span>
          )}
          {confirmButtonText}
        </ButtonDanger>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalDanger;
