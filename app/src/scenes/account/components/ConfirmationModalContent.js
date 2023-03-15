import React from "react";
import { CancelButton } from "../../../components/buttons/SimpleButtons";
import { PlainButton } from "../../phase1/components/Buttons";
import { Title, SubTitle } from "./elements";

const ConfirmationModalContent = ({ onConfirm, onBack, title, subTitle }) => {
  return (
    <>
      <Title>{title}</Title>
      <SubTitle>{subTitle}</SubTitle>
      <div className="flex flex-col md:flex-row mt-3 w-full gap-3">
        <PlainButton mode="red" className="flex-1 md:order-last" onClick={onConfirm}>
          Confirmer
        </PlainButton>
        <CancelButton className="flex-1" onClick={onBack}>
          Retour
        </CancelButton>
      </div>
    </>
  );
};

export default ConfirmationModalContent;
