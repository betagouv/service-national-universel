import React from "react";
import { Modal } from "reactstrap";
import Loader from "../../../components/Loader";
import { BorderButton, PlainButton } from "./Buttons";

export default function ConfirmationModal({
  isOpen,
  size = "md",
  icon,
  title,
  message,
  children,
  onCancel,
  onConfirm,
  loading = false,
  loadingText = "Chargement...",
  confirmText = "Confirmer",
  confirmMode = "blue",
  cancelText = "Annuler",
}) {
  return (
    <Modal size={size} centered isOpen={isOpen} toggle={onCancel}>
      {loading ? (
        <>
          <div className="mt-[8px] text-center text-[14px] leading-[20px] text-[#6B7280]">{loadingText}</div>
          <Loader />
        </>
      ) : (
        <div className="rounded-[8px] bg-white">
          <div className="px-[24px] pt-[24px]">
            {icon && <div className="flex justify-center">{icon}</div>}
            <h1 className="mt-[24px] text-center text-[20px] leading-[28px] text-[#111827]">{title}</h1>
            <div className="mt-[8px] text-center text-[14px] leading-[20px] text-[#6B7280]">{message}</div>
            {children}
          </div>
          <div className="flex items-center justify-between p-[24px]">
            <BorderButton onClick={onCancel} className="mr-[6px] grow">
              {cancelText}
            </BorderButton>
            <PlainButton onClick={onConfirm} className="ml-[6px] grow" mode={confirmMode}>
              {confirmText}
            </PlainButton>
          </div>
        </div>
      )}
    </Modal>
  );
}
