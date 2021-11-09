import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import styled from "styled-components";
import { HeroContainer, Hero, Content, Alert, Separator, WhiteButton } from "../../components/Content";
import { isEndOfInscriptionManagement2021 } from "../../utils";


export default () => {
  const young = useSelector((state) => state.Auth.young);
  const [showAlert, setShowAlert] = useState(true);
  const message = young.inscriptionCorrectionMessage.split("\n").map(line => <p>{line}</p>);

  return (
    <HeroContainer>
      <Hero>
        {showAlert && (
          <Alert color="#FBBF24">
            <div className="text">
              <strong>INSCRIPTION EN ATTENTE DE CORRECTION</strong>
            </div>
            <img src={require("../../assets/close.svg")} height={15} onClick={() => setShowAlert(false)} />
          </Alert>
        )}
        <Content showAlert={showAlert}>
          <h1 style={{ marginTop: "1.5rem" }}>
            <strong>{young.firstName},</strong> bienvenue sur votre compte volontaire.
          </h1>
          {isEndOfInscriptionManagement2021() && (
            <IconContainer>
              <svg width="48" height="48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="48" height="48" rx="24" fill="#FFFBEB" />
                <path fill-rule="evenodd" clip-rule="evenodd"
                  d="M22.503 15.172a2.194 2.194 0 013.883 0L32.6 26.574c.835 1.533-.238 3.426-1.942 3.426H18.23c-1.703 0-2.776-1.893-1.94-3.426l6.213-11.402zm3.055 11.38c0 .635-.499 1.15-1.114 1.15-.615 0-1.113-.515-1.113-1.15 0-.635.498-1.15 1.113-1.15s1.114.515 1.114 1.15zm-1.114-9.195c-.615 0-1.113.515-1.113 1.15v3.447c0 .635.498 1.15 1.113 1.15s1.114-.515 1.114-1.15v-3.448c0-.634-.499-1.15-1.114-1.15z"
                  fill="#FBBF24" />
              </svg>
              <div>
                <p style={{ color: "#000" }}><strong>Votre dossier d'inscription est en attente de correction.</strong></p>
                <p>
                  Merci de vous reconnecter à votre dossier d'inscription et d'effectuer les modifications demandées par votre référent :
                </p>
                <Message>{message}</Message>
                <Link to="/inscription/coordonnees">
                  <WhiteButton>Corriger mon dossier d'inscription</WhiteButton>
                </Link>
              </div>
            </IconContainer>
          )}
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
  :hover {
    color: #32257f;
    opacity: 0.8;
    cursor: pointer;
  }
  p {
    color: #32257f;
    font-size: 0.9rem;
  }
`;
