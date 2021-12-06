import React, { useState } from "react";
import { useSelector } from "react-redux";
import { HeroContainer, Hero, Content, Alert } from "../../components/Content";
import styled from "styled-components";

export default function Refused() {
  const young = useSelector((state) => state.Auth.young);
  const [showAlert, setShowAlert] = useState(true);
  const message = young.inscriptionRefusedMessage?.split("\n").map((line) => <p key={line}>{line}</p>);

  return (
    <HeroContainer>
      <Hero>
        {showAlert && (
          <Alert color="#EF4036">
            <div className="text">
              <strong>INSCRIPTION REFUSÉE</strong>
            </div>
            <img src={require("../../assets/close.svg")} height={15} onClick={() => setShowAlert(false)} />
          </Alert>
        )}
        <Content showAlert={showAlert}>
          <h1>
            <strong>{young.firstName},</strong> bienvenue sur votre compte volontaire.
          </h1>
          <IconContainer>
            <svg width="48" height="48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="48" height="48" rx="24" fill="#FFEBEB" />
              <path
                d="M30.364 30.364L17.636 17.636m12.728 12.728a9 9 0 00-12.728-12.728l12.728 12.728zm0 0a9 9 0 01-12.728-12.728l12.728 12.728z"
                stroke="#EF4036"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <p style={{ color: "#000" }}>
              <strong>Votre inscription n’a pas pu être retenue</strong>
              <br />
              <p>Suite au traitement de votre dossier d’inscription, votre référent SNU de votre département n’a pu retenir votre inscription.</p>
              {young.inscriptionRefusedMessage && young.inscriptionRefusedMessage?.trim() && <Message>{message}</Message>}
            </p>
          </IconContainer>
        </Content>
        <div className="thumb" />
      </Hero>
    </HeroContainer>
  );
}

const IconContainer = styled.div`
  display: flex;
  margin-top: 2.5rem;
  svg {
    min-width: 4rem;
  }
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
    svg {
      margin-bottom: 1rem;
    }
  }
`;

const Message = styled.div`
  background: rgba(79, 70, 229, 0.1);
  padding: 1rem;
  color: #32257f;
  border-radius: 6px;
  p {
    color: #32257f;
    font-size: 0.9rem;
  }
`;
