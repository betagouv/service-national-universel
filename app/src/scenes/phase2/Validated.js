import React from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import DownloadAttestationButton from "../../components/buttons/DownloadAttestationButton";
import MailAttestationButton from "../../components/buttons/MailAttestationButton";
import { HeroContainer, Hero } from "../../components/Content";

export default () => {
  const young = useSelector((state) => state.Auth.young) || {};

  const renderStep = () => {
    return (
      <HeroContainer>
        <Hero>
          <div className="content">
            <h1>
              <strong>{young.firstName}</strong>, vous avez validé votre Phase 2 !
            </h1>
            <p>Bravo pour votre engagement !</p>
            <Separator />
            <p>
              <strong>Mes missions réalisées</strong>
              <br />
              Retrouver l'historique de vos missions réalisées
              <br />
              <Link to="/candidature">Consulter mes missions réalisées {">"}</Link>
            </p>
            <p>
              <strong>Attestation de réalisation de Phase 2</strong>
              <br />
              Télécharger votre attestation de réalisation de votre phase 2
              <br />
              <DownloadAttestationButton young={young} uri="2">
                Télécharger mon attestation {">"}
              </DownloadAttestationButton>
              <MailAttestationButton young={young} type="2" template="certificate" placeholder="Attestation de réalisation de la phase 2">
                Envoyer l'attestation de réalisation par mail {">"}
              </MailAttestationButton>
            </p>
            {/* {young.statusPhase1 === "DONE" && young.statusPhase2 === "VALIDATED" ? (
              <>
                <Separator />
                <p>
                  <strong>Attestation de réalisation du SNU</strong>
                  <br />
                  Télécharger votre attestation de réalisation du SNU
                  <br />
                  <DownloadAttestationButton
                    style={{
                      color: "#5949d0",
                      textAlign: "left",
                      fontSize: "1rem",
                      cursor: "pointer",
                    }}
                    young={young}
                    uri="snu"
                  >
                    Télécharger mon attestation {">"}
                  </DownloadAttestationButton>
                </p>
              </>
            ) : null} */}
          </div>
          <div className="thumb" />
        </Hero>
      </HeroContainer>
    );
  };

  return renderStep();
};
const Separator = styled.hr`
  margin: 2.5rem 0;
  height: 1px;
  border-style: none;
  background-color: #e5e7eb;
`;
