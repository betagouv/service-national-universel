import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Spinner } from "reactstrap";
import styled from "styled-components";
import { appURL } from "../../config";
import { YOUNG_STATUS } from "../../utils";

export default function FormFooter({ values, handleSubmit, errors, secondButton = "save", loading, save }) {
  const dispatch = useDispatch();
  const [loadingSaveBtn, setloadingSaveBtn] = useState(false);
  const [loadingCorrectionDone, setloadingCorrectionDone] = useState(false);
  const young = useSelector((state) => state.Auth.young);

  const handleSave = async () => {
    setloadingSaveBtn(true);
    await save({ values, type: "save" });
    setloadingSaveBtn(false);
  };

  const handleCorrectionDone = async () => {
    setloadingCorrectionDone(true);
    await save({ values, type: "correction" });
    setloadingCorrectionDone(false);
    handleBackToHome();
  };

  const handleBackToHome = async () => {
    window.location.href = appURL;
  };

  return (
    <>
      <Footer>
        <ButtonContainer>
          {young?.status === YOUNG_STATUS.WAITING_CORRECTION ? (
            <SecondButton disabled={loading || loadingSaveBtn || loadingCorrectionDone} onClick={handleCorrectionDone}>
              {loadingCorrectionDone ? <Spinner size="sm" style={{ borderWidth: "0.1em" }} /> : "J'ai terminé la correction de mon dossier"}
            </SecondButton>
          ) : null}
          {secondButton === "save" ? (
            <SecondButton disabled={loading || loadingSaveBtn || loadingCorrectionDone} onClick={handleSave}>
              {loadingSaveBtn ? <Spinner size="sm" style={{ borderWidth: "0.1em" }} /> : "Enregistrer"}
            </SecondButton>
          ) : secondButton !== "none" ? (
            <SecondButton onClick={handleBackToHome}>Retour</SecondButton>
          ) : null}

          <ContinueButton disabled={loading || loadingSaveBtn || loadingCorrectionDone} onClick={handleSubmit}>
            {loading ? <Spinner size="sm" style={{ borderWidth: "0.1em" }} /> : "Continuer"}
          </ContinueButton>
        </ButtonContainer>
      </Footer>
      {Object.keys(errors).filter((key) => errors[key]).length ? (
        <ErrorText>Vous ne pouvez pas passer à l&apos;étape suivante car tous les champs ne sont pas correctement renseignés.</ErrorText>
      ) : null}
    </>
  );
}

const Footer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-end;
`;

const ErrorText = styled.h3`
  border: 1px solid #fc8181;
  border-radius: 0.25em;
  margin-top: 1em;
  background-color: #fff5f5;
  color: #c53030;
  font-weight: 400;
  font-size: 12px;
  padding: 1em;
  text-align: center;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;

const ContinueButton = styled.button`
  min-width: 110px;
  color: #fff;
  background-color: #5145cd;
  padding: 9px 20px;
  border: 0;
  outline: 0;
  border-radius: 6px;
  margin-inline: 5px;
  margin-top: 40px;
  display: block;
  outline: 0;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  :hover {
    opacity: 0.9;
  }
`;
const SecondButton = styled(ContinueButton)`
  color: #374151;
  background-color: #fff;
  border: solid 2px;
  border-color: #e3e7ea;
  box-shadow: none;
  :hover {
    box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
    opacity: 0.9;
  }
`;
