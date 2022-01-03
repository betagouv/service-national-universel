import React, { useState } from "react";
import { useDispatch } from "react-redux";
import styled from "styled-components";
import { Spinner } from "reactstrap";

import { setYoung } from "../../redux/auth/actions";
import { saveYoung } from "../../scenes/inscription/utils";
import { appURL } from "../../config";
import { YOUNG_STATUS } from "../../utils";

export default function FormFooter({ values, handleSubmit, errors, secondButton = "save", loading }) {
  const dispatch = useDispatch();
  const [loadingSaveBtn, setloadingSaveBtn] = useState(false);
  const [loadingCorrectionDone, setloadingCorrectionDone] = useState(false);

  const handleSave = async () => {
    setloadingSaveBtn(true);
    const young = await saveYoung(values);
    if (young) dispatch(setYoung(young));
    setloadingSaveBtn(false);
  };

  const handleCorrectionDone = async () => {
    setloadingCorrectionDone(true);
    const young = await saveYoung({ ...values, status: YOUNG_STATUS.WAITING_VALIDATION });
    if (young) dispatch(setYoung(young));
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
          {values.status === YOUNG_STATUS.WAITING_CORRECTION ? (
            <SecondButton onClick={handleCorrectionDone}>
              {loadingCorrectionDone ? <Spinner size="sm" style={{ borderWidth: "0.1em" }} /> : "J'ai terminé la correction de mon dossier"}
            </SecondButton>
          ) : null}
          {secondButton === "save" ? (
            <SecondButton onClick={handleSave}> {loadingSaveBtn ? <Spinner size="sm" style={{ borderWidth: "0.1em" }} /> : "Enregistrer"}</SecondButton>
          ) : (
            <SecondButton onClick={handleBackToHome}>Retour</SecondButton>
          )}
          <ContinueButton onClick={handleSubmit}> {loading ? <Spinner size="sm" style={{ borderWidth: "0.1em" }} /> : "Continuer"}</ContinueButton>
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
