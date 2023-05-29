import React from "react";
import Danger from "../../../assets/icons/Danger";
import { CancelButton } from "../../../components/buttons/SimpleButtons";
import { PlainButton } from "../../phase1/components/Buttons";
import Field from "./Field";
import ArrowLeft from "../../../assets/icons/ArrowLeft";
import Modal from "../../../components/ui/modals/Modal";

const WithdrawFormModalContent = ({
  withdrawnReasons,
  onCancel,
  withdrawnReason,
  setWithdrawnReason,
  withdrawnMessage,
  setWithdrawnMessage,
  title,
  subTitle,
  confirmButtonName,
  onConfirm,
  onBack,
}) => {
  return (
    <>
      <div className="relative flex w-full md:justify-center">
        <button className="absolute left-0 hidden h-9 w-9 items-center justify-center rounded-full bg-[#E5E7EB] md:flex" onClick={onBack}>
          <ArrowLeft />
        </button>
        <Danger />
      </div>

      <Modal.Title className="mt-6 md:mt-8">{title}</Modal.Title>
      <Modal.Subtitle>{subTitle}</Modal.Subtitle>
      <div className="w-full md:px-3">
        <Field
          className="w-full"
          type="select"
          options={withdrawnReasons}
          name="withdrawnReason"
          label="Motif"
          value={withdrawnReason}
          onChange={setWithdrawnReason}
          transformer={(v) => withdrawnReasons.find((r) => r.value === v)?.label}
        />
        <Field
          className="mt-4 w-full"
          type="textarea"
          name="withdrawnMessage"
          label="Précisez la raison de votre désistement ici (obligatoire)"
          value={withdrawnMessage}
          onChange={setWithdrawnMessage}
        />
      </div>

      <div className="mt-10 flex w-full flex-col gap-3 md:flex-row">
        <CancelButton className="hidden flex-1 md:block" onClick={onCancel} />
        <PlainButton disabled={!withdrawnReason || !withdrawnMessage} className="flex-1" onClick={onConfirm}>
          {confirmButtonName}
        </PlainButton>
        <CancelButton className="flex-1 md:hidden" onClick={onBack}>
          Retour
        </CancelButton>
      </div>
    </>
  );
};

export default WithdrawFormModalContent;
