import React from "react";
import styled from "styled-components";
import { useSelector } from "react-redux";

import DownloadAttestationButton, { PrimaryStyle } from "../../components/buttons/DownloadAttestationButton";
import MailAttestationButton from "../../components/buttons/MailAttestationButton";

import { HeroContainer, Hero } from "../../components/Content";
import { supportURL } from "../../config";

export default function Done() {
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
                  Télécharger mon attestation &gt;
                </DownloadAttestationButton>
                <MailAttestationButton young={young} type="1" template="certificate" placeholder="Attestation de réalisation de la phase 1">
                  Envoyer l&apos;attestation de réalisation par mail &gt;
                </MailAttestationButton>
              </p>
              <p>
                <strong>Attestation de JDC</strong>
                <br />
                Penser à réaliser votre recensement auprès de votre mairie
                <a href={`${supportURL}/base-de-connaissance/journee-defense-et-citoyennete-1?type=article`} target="_blank" rel="noreferrer">
                  <PrimaryStyle>En savoir plus &gt;</PrimaryStyle>
                </a>
              </p>
            </>
          ) : null}
        </div>
        <div className="thumb" />
      </Hero>
    </HeroContainer>
  );
}

const Separator = styled.hr`
  margin: 2.5rem 0;
  height: 1px;
  border-style: none;
  background-color: #e5e7eb;
`;
