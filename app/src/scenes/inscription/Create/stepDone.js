import React, { useEffect } from "react";
import styled from "styled-components";
import { useSelector, useDispatch } from "react-redux";
import { Link, useHistory } from "react-router-dom";

import matomo from "../../../services/matomo";

export default () => {

  useEffect(() => {
    matomo.logEvent("inscription", "open_step", "step", 6);
  }, []);

  const history = useHistory();
  const young = useSelector((state) => state.Auth.young);

  if (!young) {
    history.push("/inscription/profil");
    return <div />;
  }
  return (
    <Wrapper>
      <Logo>
        <svg height={64} width={64} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="#057a55" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
        </svg>
      </Logo>
      <h2>Merci {young.firstName}</h2>
      <p>Bravo, votre inscription a bien été enregistrée. Votre candidature est en cours de traitement.</p>
      <p>Vous serez prochainement contacter par e-mail.</p>
      <p>Vous pouvez continuer à éditer vos informations personnelles jusqu'à la validation de votre inscription.</p>
      <Footer>
        <ButtonContainer>
          <Button to="/">Accéder à mon espace volontaire</Button>
        </ButtonContainer>
      </Footer>
    </Wrapper>
  );
};

const Logo = styled.div`
  width: 7rem;
  height: 7rem;
  border-radius: 50%;
  background-color: #def7ec;
  display: flex;
  justify-content: center;
  align-items: center;
  img {
    color: #057a55;
  }
`;

const Wrapper = styled.div`
  display: flex;
  max-width: 48rem;
  padding: 40px 0px;
  @media (max-width: 768px) {
    padding: 22px;
  }
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: auto;
  margin-bottom: 30px;
  h2 {
    color: #161e2e;
    font-size: 1.8rem;
    font-weight: 700;
    margin: 20px;
  }
  p {
    text-align: center;
    color: #6b7280;
    font-size: 1rem;
  }
`;

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

const Button = styled(Link)`
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
  text-align: center;
  outline: 0;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  :hover {
    opacity: 0.9;
    color: #fff;
  }
`;
