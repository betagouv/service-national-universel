import React, { useState } from "react";
import { useSelector } from "react-redux";
import { HeroContainer, Hero, Content, Alert, Separator } from "../../components/Content";
import styled from "styled-components";

export default () => {
  const young = useSelector((state) => state.Auth.young);
  const [showAlert, setShowAlert] = useState(true);

  return (
    <HeroContainer>
      <Hero>
        {showAlert && (
          <Alert color="#FBBF24">
            <div className="text">
              <strong>INSCRIPTION SUR LISTE COMPLÉMENTAIRE</strong>
            </div>
            <img src={require("../../assets/close.svg")} height={15} onClick={() => setShowAlert(false)} />
          </Alert>
        )}
        <Content showAlert={showAlert}>
          <h1>
            <strong>{young.firstName},</strong> bienvenue sur votre compte volontaire.
          </h1>
          <IconContainer>
            <svg width="48" height="48" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="48" height="48" rx="24" fill="#FFFBEB" /><path d="M24 20v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" stroke="#FBBF24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" /></svg>
            <p>
              <strong>Vous êtes inscrit sur liste complémentaire</strong>
              <br />
              <p>Votre dossier a été traité.</p>
              <br />
              <p>L’administration du SNU vous recontactera au plus vite pour vous informer de votre participation au Service National Universel.</p>
            </p>
          </IconContainer>
        </Content>
        <div className="thumb" />
      </Hero>
    </HeroContainer>
  );
};

const IconContainer = styled.div`
  display: flex;
  margin-top: 2.5rem;
  svg {
    min-width: 4rem
  }
`;
