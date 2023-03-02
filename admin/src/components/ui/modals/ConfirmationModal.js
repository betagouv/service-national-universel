import React from "react";
import Loader from "../../Loader";
import Button from "../buttons/Button";
import Modal from "./Modal";

const ConfirmationModal = ({
  isOpen,
  icon,
  title,
  children,
  onCancel,
  onConfirm,
  isLoading = false,
  size = "md",
  loadingText = "Chargement...",
  variant = "primary",
  confirmButtonChildren = "Confirmer",
  cancelText = "Annuler",
  infoLink = null,
}) => {
  return (
    <Modal isOpen={isOpen} size={size}>
      {isLoading ? (
        <>
          <div className="leading-5 text-sm text-gray-500 mt-2 text-center">{loadingText}</div>
          <Loader />
        </>
      ) : (
        <div className="bg-white rounded-lg">
          <Modal.Header icon={icon} title={title} />
          <Modal.Content>{children}</Modal.Content>
          <Modal.Footer className="flex gap-2 items-center justify-between">
            {cancelText && (
              <Button variant="light" className="grow" onClick={onCancel}>
                {cancelText}
              </Button>
            )}
            <Button onClick={onConfirm} variant={variant} className="grow">
              {confirmButtonChildren}
            </Button>
          </Modal.Footer>
          {infoLink && (
            <Modal.Footer className="flex items-center justify-center">
              <Button displayMode="link" href={infoLink.href} to={infoLink.to} target={infoLink.target || "_self"}>
                {infoLink.text}
              </Button>
            </Modal.Footer>
          )}
        </div>
      )}
    </Modal>
  );
};

export default ConfirmationModal;
