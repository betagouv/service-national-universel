import React from "react";
import { Modal } from "reactstrap";
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
  confirmText = "Confirmer",
  confirmMode = "blue",
  cancelText = "Annuler",
}) {
  return (
    <Modal size={size} centered isOpen={isOpen} toggle={onCancel}>
      <div className="bg-white rounded-[8px]">
        <div className="px-[24px] pt-[24px]">
          {icon && <div className="flex justify-center">{icon}</div>}
          <h1 className="text-[20px] leading-[28px] text-[#111827] mt-[24px] text-center">{title}</h1>
          <p className="text-[14px] leading-[20px] text-[#6B7280] mt-[8px] text-center">{message}</p>
          {children}
        </div>
        <div className="flex p-[24px] items-center justify-between">
          <BorderButton onClick={onCancel} className="mr-[6px] grow">
            {cancelText}
          </BorderButton>
          <PlainButton onClick={onConfirm} className="ml-[6px] grow" mode={confirmMode}>
            {confirmText}
          </PlainButton>
        </div>
      </div>
    </Modal>
  );
}
