import React from "react";
import Danger from "../../../assets/icons/Danger";
import { CancelButton } from "../../../components/buttons/SimpleButtons";
import { PlainButton } from "../../phase1/components/Buttons";
import Field from "./Field";
import ArrowLeft from "../../../assets/icons/ArrowLeft";
import { Title, SubTitle } from "./elements";

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
      <div className="flex w-full md:justify-center relative">
        <button className="absolute left-0 w-9 h-9 justify-center items-center bg-[#E5E7EB] rounded-full hidden md:flex" onClick={onBack}>
          <ArrowLeft />
        </button>
        <Danger />
      </div>

      <Title className="mt-6 md:mt-8">{title}</Title>
      <SubTitle>{subTitle}</SubTitle>
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
          className="w-full mt-4"
          type="textarea"
          name="withdrawnMessage"
          label="Précisez la raison de votre désistement ici (obligatoire)"
          value={withdrawnMessage}
          onChange={setWithdrawnMessage}
        />
      </div>

      <div className="flex flex-col md:flex-row mt-10 w-full gap-3">
        <CancelButton className="flex-1 hidden md:block" onClick={onCancel} />
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
