import React from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import DownloadAttestationButton from "../../components/buttons/DownloadAttestationButton";
import Hero from "../../components/Hero";

export default () => {
  const young = useSelector((state) => state.Auth.young) || {};

  const renderStep = () => {
    return (
      <>
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
              <DownloadAttestationButton
                style={{
                  color: "#5949d0",
                  textAlign: "left",
                  fontSize: "1rem",
                  cursor: "pointer",
                }}
                young={young}
                uri="2"
              >
                Télécharger mon attestation {">"}
              </DownloadAttestationButton>
            </p>
            {young.statusPhase1 === "DONE" && young.statusPhase2 === "VALIDATED" ? (
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
            ) : null}
          </div>
          <div className="thumb" />
        </Hero>
      </>
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
