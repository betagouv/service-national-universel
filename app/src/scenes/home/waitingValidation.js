import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { HeroContainer, Hero, Content, Alert, WhiteButton } from "../../components/Content";
import { YOUNG_STATUS, inscriptionModificationOpenForYoungs, translate } from "../../utils";
import styled from "styled-components";
import plausibleEvent from "../../services/plausible";

export default function WaitingValidation() {
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
            <img src={require("../../assets/close.svg")} height={15} width={15} onClick={() => setShowAlert(false)} />
          </Alert>
        )}
        <Content showAlert={showAlert} style={{ paddingBottom: "1rem" }}>
          <h1 style={{ marginTop: "1.5rem" }}>
            <strong>{young.firstName},</strong> bienvenue sur votre compte volontaire.
          </h1>
          <IconContainer>
            <svg width="48" height="48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M0 24C0 10.745 10.745 0 24 0s24 10.745 24 24-10.745 24-24 24S0 37.255 0 24z" fill="#D1FAE5" />
              <path d="M17 25l4 4 10-10" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <p style={{ color: "#000" }}>
              <strong>Merci, votre inscription a bien été enregistrée.</strong>
              <br />
              Votre dossier est en cours de traitement par l&apos;administration.
            </p>
          </IconContainer>
          <p>Vous recevrez prochainement un e-mail de no-reply@snu.gouv.fr vous informant de l&apos;avancement de votre inscription.</p>
          {young.status === YOUNG_STATUS.WAITING_VALIDATION && inscriptionModificationOpenForYoungs(young.cohort) ? (
            <>
              <p>Vous pouvez consulter les informations renseignées dans votre dossier jusqu&apos;à validation de votre inscription.</p>
              <Link to="/inscription/coordonnees">
                <WhiteButton>Revenir à mon dossier d&apos;inscription</WhiteButton>
              </Link>
            </>
          ) : null}
          <div style={{ display: "flex", justifyContent: "flex-end", paddingTop: "2rem" }}>
            <a
              href="https://voxusagers.numerique.gouv.fr/Demarches/3154?&view-mode=formulaire-avis&nd_mode=en-ligne-enti%C3%A8rement&nd_source=button&key=060c41afff346d1b228c2c02d891931f"
              onClick={() => plausibleEvent("Compte/CTA - Je donne mon avis", { statut: translate(young.status) })}>
              <img src="https://voxusagers.numerique.gouv.fr/static/bouton-blanc.svg" alt="Je donne mon avis" />
            </a>
          </div>
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
