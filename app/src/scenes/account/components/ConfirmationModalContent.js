import React from "react";
import { CancelButton } from "../../../components/buttons/SimpleButtons";
import { PlainButton } from "../../phase1/components/Buttons";
import { Title, SubTitle } from "./elements";

const ConfirmationModalContent = ({ onConfirm, onBack, title, subTitle }) => {
  return (
    <>
      <Title>{title}</Title>
      <SubTitle>{subTitle}</SubTitle>
      <div className="flex mt-3 w-full gap-3">
        <CancelButton className="flex-1" onClick={onBack}>
          Retour
        </CancelButton>
        <PlainButton mode="red" className="flex-1" onClick={onConfirm}>
          Confirmer
        </PlainButton>
      </div>
    </>
  );
};

export default ConfirmationModalContent;
