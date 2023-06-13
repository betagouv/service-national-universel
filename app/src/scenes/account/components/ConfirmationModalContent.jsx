import React from "react";
import ButtonDanger from "../../../components/ui/buttons/ButtonDanger";
import ButtonLight from "../../../components/ui/buttons/ButtonLight";
import Modal from "../../../components/ui/modals/Modal";
import { BiLoaderAlt } from "react-icons/bi";

const ConfirmationModalContent = ({ onConfirm, onBack, title, subTitle, isLoading, loadingMessage }) => {
  return (
    <>
      <Modal.Title>{title}</Modal.Title>
      <Modal.Subtitle>{isLoading && loadingMessage ? loadingMessage : subTitle}</Modal.Subtitle>
      <div className="mt-3 flex w-full flex-col gap-3 md:flex-row">
        <ButtonDanger className="flex-1 md:order-last" onClick={onConfirm} disabled={isLoading}>
          {isLoading && (
            <span className="animate-spin">
              <BiLoaderAlt />
            </span>
          )}
          Confirmer
        </ButtonDanger>
        <ButtonLight className="flex-1" onClick={onBack}>
          Retour
        </ButtonLight>
      </div>
    </>
  );
};

export default ConfirmationModalContent;
