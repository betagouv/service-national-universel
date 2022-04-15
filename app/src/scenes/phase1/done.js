import React from "react";
import styled from "styled-components";
import { useSelector } from "react-redux";

import DownloadAttestationButton, { PrimaryStyle } from "../../components/buttons/DownloadAttestationButton";
import MailAttestationButton from "../../components/buttons/MailAttestationButton";

import { HeroContainer, Hero } from "../../components/Content";
import { environment, supportURL } from "../../config";
import plausibleEvent from "../../services/plausible";
import trophy from "../../assets/trophy.svg";
import DownloadButton from "./components/DownloadButton";
import phase1done from "../../assets/phase1done.png";
import Container from "./components/Container";

export default function Done() {
  const young = useSelector((state) => state.Auth.young) || {};

  return (
    <>
      {environment !== "production" ? (
        <Container>
          <div className="content">
            <article className="flex items-center">
              <img className="mr-4" src={trophy} alt="trophy" />
              <div>
                <h1 className="text-5xl mb-4">
                  <strong>{young.firstName}, vous avez validé votre Phase 1 !</strong>
                </h1>
                <p className="text-[#738297]">Bravo pour votre engagement !</p>
              </div>
              <img src={phase1done} />
            </article>
            {young.statusPhase1 === "DONE" ? (
              <section>
                <p className="text-2xl font-bold mb-4">Avez-vous fait votre recensement ?</p>
                <div className="lg:flex lg:flex-row">
                  <article className="bg-gray-50 px-4 py-8 rounded md:mr-4">
                    <p className="text-2xl font-bold mb-2">Oui</p>
                    <p className="text-base text-[#738297]">
                      Vous pouvez dès à présent transmettre votre attestation de réalisation de Phase 1 au CSNJ afin qu&apos;il valide votre JDC.
                    </p>
                    <a className="text-sm text-indigo-600 underline hover:text-indigo-700" href="https://presaje.sga.defense.gouv.fr/" target="_blank" rel="noreferrer">
                      J&apos;ai une question sur la JDC ›
                    </a>
                    <div className="flex items-center">
                      <DownloadAttestationButton young={young} uri="1">
                        <DownloadButton text="Télécharger mon attestation" tw="bg-indigo-700 text-white mr-3" />
                      </DownloadAttestationButton>
                      <MailAttestationButton
                        young={young}
                        type="1"
                        template="certificate"
                        placeholder="Attestation de réalisation de la phase 1"
                        onClick={() => plausibleEvent("Phase1/CTA - Envoi par mail de l'attestation réussite")}>
                        <DownloadButton text="Envoyer par mail" tw="text-indigo-700 bg-white" />
                      </MailAttestationButton>
                    </div>
                  </article>
                  <article className="bg-gray-50 px-4 py-8 rounded md:mr-4">
                    <p className="text-2xl font-bold mb-2">Non</p>
                    <p className="text-base text-[#738297]">Dans ce cas, il faut attendre que ce dernier soit effectué auprès de votre mairie à partir de vos 16 ans.</p>
                    <a
                      className="text-sm text-indigo-600 underline hover:text-indigo-700"
                      href="https://www.service-public.fr/particuliers/vosdroits/F870"
                      target="_blank"
                      rel="noreferrer">
                      En savoir plus sur le recensement ›
                    </a>
                  </article>
                </div>
              </section>
            ) : null}
          </div>
          <div className="thumb" />
        </Container>
      ) : (
        <HeroContainer>
          <Hero>
            <div className="content">
              <h1>
                <strong>{young.firstName}, vous avez validé votre Phase 1 !</strong>
              </h1>
              <p>Bravo pour votre engagement !</p>
              {young.statusPhase1 === "DONE" ? (
                <>
                  <Separator />
                  <p>
                    <strong>Attestation de réalisation</strong>
                    <br />
                    Télécharger votre attestation de réalisation de phase 1
                    <DownloadAttestationButton young={young} uri="1">
                      Télécharger mon attestation ›
                    </DownloadAttestationButton>
                    <MailAttestationButton
                      young={young}
                      type="1"
                      template="certificate"
                      placeholder="Attestation de réalisation de la phase 1"
                      onClick={() => plausibleEvent("Phase1/CTA - Envoi par mail de l'attestation réussite")}>
                      Envoyer l&apos;attestation de réalisation par mail ›
                    </MailAttestationButton>
                  </p>
                  <p>
                    <strong>Attestation de JDC</strong>
                    <br />
                    Penser à réaliser votre recensement auprès de votre mairie
                    <a href={`${supportURL}/base-de-connaissance/journee-defense-et-citoyennete`} target="_blank" rel="noreferrer">
                      <PrimaryStyle>En savoir plus ›</PrimaryStyle>
                    </a>
                  </p>
                </>
              ) : null}
            </div>
            <div className="thumb" />
          </Hero>
        </HeroContainer>
      )}
    </>
  );
}

const Separator = styled.hr`
  margin: 2.5rem 0;
  height: 1px;
  border-style: none;
  background-color: #e5e7eb;
`;
