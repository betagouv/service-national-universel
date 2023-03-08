import React from "react";
import Danger from "../../../assets/icons/Danger";
import { CancelButton } from "../../../components/buttons/SimpleButtons";
import { PlainButton } from "../../phase1/components/Buttons";
import { WITHRAWN_REASONS } from "../../../utils";
import Field from "./Field";
import ArrowLeft from "../../../assets/icons/ArrowLeft";
import { Title, SubTitle } from "./elements";

const WithdrawFormModalContent = ({
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
      <div className="flex w-full justify-center relative">
        <button className="absolute left-0 w-9 h-9 flex justify-center items-center bg-[#E5E7EB] rounded-full" onClick={onBack}>
          <ArrowLeft />
        </button>
        <Danger />
      </div>

      <Title className="mt-8">{title}</Title>
      <SubTitle>{subTitle}</SubTitle>
      <div className="w-full px-3">
        <Field
          className="w-full"
          type="select"
          options={WITHRAWN_REASONS}
          name="withdrawnReason"
          label="Motif"
          value={withdrawnReason}
          onChange={setWithdrawnReason}
          transformer={(v) => WITHRAWN_REASONS.find((r) => r.value === v)?.label}
        />
        <Field
          className="w-full mt-4"
          type="textarea"
          options={WITHRAWN_REASONS}
          name="withdrawnMessage"
          label="Précisez la raison de votre désistement ici (obligatoire)"
          value={withdrawnMessage}
          onChange={setWithdrawnMessage}
        />
      </div>

      <div className="flex mt-10 w-full gap-3">
        <CancelButton className="flex-1" onClick={onCancel} />
        <PlainButton disabled={!withdrawnReason || !withdrawnMessage} className="flex-1" onClick={onConfirm}>
          {confirmButtonName}
        </PlainButton>
      </div>
    </>
  );
};

export default WithdrawFormModalContent;
