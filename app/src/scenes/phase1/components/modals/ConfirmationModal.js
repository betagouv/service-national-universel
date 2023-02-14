import React from "react";
import { Modal } from "reactstrap";
import Loader from "../../../../components/Loader";
import { BorderButton, PlainButton } from "../Buttons";

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
          <div className="text-[14px] leading-[20px] text-[#6B7280] mt-[8px] text-center">{loadingText}</div>
          <Loader />
        </>
      ) : (
        <div className="bg-white rounded-[8px]">
          <div className="px-[24px] pt-[24px]">
            {icon && <div className="flex justify-center">{icon}</div>}
            <h1 className="text-[20px] leading-[28px] text-[#111827] mt-[24px] text-center">{title}</h1>
            {message && <div className="text-[14px] leading-[20px] text-[#6B7280] mt-[8px] text-center">{message}</div>}
            {children}
          </div>
          <div className="flex p-[24px] items-center justify-between md:flex-row flex-col gap-[6px]">
            <BorderButton onClick={onCancel} className="grow">
              {cancelText}
            </BorderButton>
            <PlainButton onClick={onConfirm} className="grow" mode={confirmMode}>
              {confirmText}
            </PlainButton>
          </div>
        </div>
      )}
    </Modal>
  );
}
