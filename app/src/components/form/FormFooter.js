import React from "react";
import { useDispatch } from "react-redux";
import styled from "styled-components";

import { setYoung } from "../../redux/auth/actions";
import { saveYoung } from "../../scenes/inscription/utils";

export default ({ values, handleSubmit, errors, save = true }) => {
  const dispatch = useDispatch();

  const handleSave = async () => {
    const young = await saveYoung(values);
    if (young) dispatch(setYoung(young));
  };
  return (
    <Footer>
      <ButtonContainer>
        {save ? <SaveButton onClick={handleSave}>Enregistrer</SaveButton> : null}
        <ContinueButton onClick={handleSubmit}>Continuer</ContinueButton>
      </ButtonContainer>
      {Object.keys(errors).length ? <h3>Vous ne pouvez passer à l'étape suivante car tous les champs ne sont pas correctement renseignés.</h3> : null}
    </Footer>
  );
};

const Footer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  h3 {
    border: 1px solid #fc8181;
    border-radius: 0.25em;
    margin-top: 1em;
    background-color: #fff5f5;
    color: #c53030;
    font-weight: 400;
    font-size: 12px;
    padding: 1em;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;

const ContinueButton = styled.button`
  color: #fff;
  background-color: #5145cd;
  padding: 9px 20px;
  border: 0;
  outline: 0;
  border-radius: 6px;
  font-weight: 500;
  font-size: 20px;
  margin-right: 10px;
  margin-top: 40px;
  display: block;
  width: 140px;
  outline: 0;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  :hover {
    opacity: 0.9;
  }
`;

const SaveButton = styled(ContinueButton)`
  color: #374151;
  background-color: #f9fafb;
  border-width: 1px;
  border-color: transparent;
`;
