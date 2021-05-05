import React from "react";
import styled from "styled-components";
import { useSelector } from "react-redux";

import DownloadAttestationButton from "../../components/buttons/DownloadAttestationButton";
import { HeroContainer, Hero } from "../../components/Hero";

export default () => {
  const young = useSelector((state) => state.Auth.young) || {};

  return (
    <HeroContainer>
      <Hero>
        <div className="content">
          <h1>
            <strong>{young.firstName}, vous avez validé votre Phase 1 !</strong>
          </h1>
          <p>Bravo pour votre engagement !</p>
          {young.statusPhase1 === "DONE" && young.cohesionCenterName ? (
            <>
              <Separator />
              <p>
                <strong>Attestation de réalisation</strong>
                <br />
                Télécharger votre attestation de réalisation de phase 1
                <DownloadAttestationButton
                  style={{
                    color: "#5949d0",
                    textAlign: "left",
                    fontSize: "1rem",
                    cursor: "pointer",
                  }}
                  young={young}
                  uri="1"
                >
                  Télécharger mon attestation {">"}
                </DownloadAttestationButton>
              </p>
            </>
          ) : null}
        </div>
        <div className="thumb" />
      </Hero>
    </HeroContainer>
  );
};

const Separator = styled.hr`
  margin: 2.5rem 0;
  height: 1px;
  border-style: none;
  background-color: #e5e7eb;
`;
