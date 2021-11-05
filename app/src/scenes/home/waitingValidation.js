import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { HeroContainer, Hero, Content, Alert, Separator, WhiteButton } from "../../components/Content";
import { YOUNG_STATUS } from "../../utils";
import styled from "styled-components";
import { isEndOfInscriptionManagement2021 } from "snu-lib";

export default () => {
  const young = useSelector((state) => state.Auth.young);
  const [showAlert, setShowAlert] = useState(true);

  return (
    <HeroContainer>
      <Hero>
        {showAlert && (
          <Alert>
            <div className="text">
              <strong>INSCRIPTION EN ATTENTE DE VALIDATION</strong>
            </div>
            <img src={require("../../assets/close.svg")} height={15} onClick={() => setShowAlert(false)} />
          </Alert>
        )}
        <Content showAlert={showAlert}>
          <h1 style={{ marginTop: "1.5rem" }}>
            <strong>{young.firstName},</strong> bienvenue sur votre compte volontaire.
          </h1>
          <IconContainer>
            <svg width="48" height="48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0 24C0 10.745 10.745 0 24 0s24 10.745 24 24-10.745 24-24 24S0 37.255 0 24z" fill="#D1FAE5" /><path d="M17 25l4 4 10-10" stroke="#059669" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" /></svg>
            <p style={{ color: "#000" }}>
              <strong>
                Merci, votre inscription a bien été enregistrée.
              </strong>
              <br />
              Votre dossier est en cours de traitement par l'administration.
            </p>
          </IconContainer>
          <p>Vous recevrez prochainement un e-mail de no-reply@snu.gouv.fr vous informant de l'avancement de votre inscription.</p>
          {young.status === YOUNG_STATUS.WAITING_VALIDATION && isEndOfInscriptionManagement2021() ? (
            <>
              <p>Vous pouvez consulter les informations renseignées dans votre dossier jusqu'à validation de votre inscription.</p>
              <Link to="/inscription/coordonnees">
                <WhiteButton>Revenir à mon dossier d'inscription</WhiteButton>
              </Link>
            </>
          ) : null}
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
