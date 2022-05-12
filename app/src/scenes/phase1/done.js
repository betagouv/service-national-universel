import React from "react";
import { useSelector } from "react-redux";
import Bus from "../../assets/Bus.js";
import phase1done from "../../assets/phase1done.png";
import trophy from "../../assets/trophy.svg";
import DownloadAttestationButton from "../../components/buttons/DownloadAttestationButton";
import MailAttestationButton from "../../components/buttons/MailAttestationButton";
import plausibleEvent from "../../services/plausible";
import Container from "./components/Container";

export default function Done() {
  const young = useSelector((state) => state.Auth.young) || {};

  return (
    <>
      <Container>
        <div className="content">
          <article className="lg:flex lg:items-center">
            <img className="mr-4 hidden lg:block" src={trophy} alt="trophy" />
            <div>
              <h1 className="text-2xl md:text-5xl mb-4">
                <strong>{young.firstName}, vous avez validé votre Phase 1 !</strong>
              </h1>
              <p className="text-[#738297]">Bravo pour votre engagement.</p>
            </div>
            <img src={phase1done} />
          </article>
          {young.statusPhase1 === "DONE" ? (
            <section>
              <p className="text-2xl font-bold mb-4">Avez-vous effectué votre recensement citoyen ?</p>
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
                    <DownloadAttestationButton
                      young={young}
                      uri="1"
                      className="flex items-center border-[1px] border-indigo-700 rounded-lg px-4 py-2.5 font-sm leading-5  mt-4 shadow-sm bg-indigo-700 text-white mr-3">
                      Télécharger mon attestation
                    </DownloadAttestationButton>
                    <MailAttestationButton
                      className="flex items-center border-[1px] border-indigo-700 rounded-lg px-4 py-2.5 font-sm leading-5 mt-4 shadow-sm text-indigo-700 bg-white"
                      young={young}
                      type="1"
                      template="certificate"
                      placeholder="Attestation de réalisation de la phase 1"
                      onClick={() => plausibleEvent("Phase1/CTA - Envoi par mail de l'attestation réussite")}>
                      Envoyer par mail
                    </MailAttestationButton>
                  </div>
                </article>
                <article className="bg-gray-50 px-4 py-8 rounded md:mr-4">
                  <p className="text-2xl font-bold mb-2">Non</p>
                  <p className="text-base text-[#738297]">Vous devez effectuer vos démarches auprès de votre mairie ou en ligne à partir de vos 16 ans.</p>
                  <a
                    className="text-sm text-indigo-600 underline hover:text-indigo-700"
                    href="https://www.service-public.fr/particuliers/vosdroits/F870"
                    target="_blank"
                    rel="noreferrer">
                    En savoir plus sur le recensement ›
                  </a>
                </article>
              </div>
              <article className="mt-4 rounded-md shadow-sm p-6 max-w-[50%]">
                <a
                  href="https://support.snu.gouv.fr/base-de-connaissance/permis-et-code-de-la-route"
                  target="_blank"
                  rel="noreferrer noopener"
                  className="flex justify-between items-center">
                  <Bus className="w-24" />
                  <section>
                    <p className="font-bold text-gray-900">Envie de gagner en mobilité ?</p>
                    <p className="text-gray-500 text-sm">
                      Découvrez comment accéder à la prise en charge du <strong>code de la route</strong>.
                    </p>
                  </section>
                </a>
              </article>
            </section>
          ) : null}
        </div>
        <div className="thumb" />
      </Container>
    </>
  );
}
