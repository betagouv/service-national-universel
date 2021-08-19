import React from "react";
import styled from "styled-components";
import { useSelector } from "react-redux";

import DownloadAttestationButton from "../../components/buttons/DownloadAttestationButton";
import MailAttestationButton from "../../components/buttons/MailAttestationButton";

import { HeroContainer, Hero } from "../../components/Content";

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
                <DownloadAttestationButton young={young} uri="1">
                  Télécharger mon attestation {">"}
                </DownloadAttestationButton>
                <MailAttestationButton young={young} type="1" template="certificate" placeholder="Attestation de réalisation de la phase 1">
                  Envoyer l'attestation de réalisation par mail {">"}
                </MailAttestationButton>
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
