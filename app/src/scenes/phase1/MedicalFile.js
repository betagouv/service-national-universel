import React from "react";
import { useSelector } from "react-redux";
import { SuccessMessage, Logo, ContinueButton } from "./components/printable";
import { HeroContainer, Hero } from "../../components/Content";
import styled from "styled-components";

export default () => {
  const young = useSelector((state) => state.Auth.young);

  return (
    <HeroContainer>
      <Hero>
        <ContentHorizontal style={{ width: "100%" }} id="sanitaire">
          <div className="icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              ></path>
            </svg>
          </div>
          <div>
            <h2>Transmission de la fiche sanitaire</h2>
            {young.cohesionStayMedicalFileReceived === "true" ? (
              <SuccessMessage>
                <Logo>
                  <svg height={64} width={64} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="#057a55" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </Logo>
                Ce document a bien été réceptionné
              </SuccessMessage>
            ) : (
              <>
                <p style={{ color: "#9C9C9C" }}>
                  Vous devez renseigner votre fiche sanitaire, la mettre dans une enveloppe portant la mention “A l’attention de l’infirmier, Pli Confidentiel” et y joindre une
                  photocopie des documents requis. <br />
                  Vous la remettrez à <strong>votre arrivée au centre de séjour</strong> à l’équipe d’encadrement.
                </p>
                <a
                  href="https://cni-bucket-prod.cellar-c2.services.clever-cloud.com/file/note_relatives_aux_informations_d_ordre_sanitaire_2022.pdf"
                  target="blank"
                  className="link"
                >
                  Note relative aux informations d'ordre sanitaire ›
                </a>
              </>
            )}
            <div style={{ marginTop: "2rem" }}>
              <div style={{ color: "#9C9C9C" }}>
                <b> Rappel : </b>Vous devez réaliser un bilan de santé obligatoire auprès de votre médecin traitant. Il est fortement recommandé de le faire avant votre séjour de
                cohésion.
              </div>
              <a
                href="https://www.ameli.fr/assure/sante/themes/suivi-medical-de-lenfant-et-de-ladolescent/examen-medical-propose-ladolescent-entre-15-et-16-ans"
                className="link"
                target="_blank"
              >
                Plus d’informations sur le bilan de santé obligatoire ›
              </a>
            </div>
            {young.cohesionStayMedicalFileReceived !== "true" ? (
              <div style={{ minWidth: "30%", display: "flex", justifyContent: "flex-end", alignItems: "center", marginLeft: "1.5rem" }}>
                <a target="blank" href="https://cni-bucket-prod.cellar-c2.services.clever-cloud.com/file/fiche_sanitaire_2022.pdf">
                  <ContinueButton>Télécharger la fiche sanitaire</ContinueButton>
                </a>
              </div>
            ) : null}
          </div>
        </ContentHorizontal>
      </Hero>
    </HeroContainer>
  );
};

const Content = styled.div`
  margin-top: ${({ showAlert }) => (showAlert ? "2rem" : "")};
  width: 65%;
  @media (max-width: 768px) {
    width: 100%;
  }
  padding: 60px 30px 60px 50px;
  @media (max-width: 768px) {
    width: 100%;
    padding: 30px 15px 30px 15px;
  }
  position: relative;
  > * {
    position: relative;
    z-index: 2;
  }
  .icon {
    margin-right: 1rem;
    svg {
      width: 1.5rem;
      stroke: #5145cd;
    }
  }
  :not(:last-child) {
    border-bottom-width: 1px;
    border-color: #d2d6dc;
    border-bottom-style: dashed;
  }
  h2 {
    font-size: 1.5rem;
    @media (max-width: 768px) {
      font-size: 1.2rem;
    }
    color: #161e2e;
    margin-bottom: 20px;
    font-weight: 700;
    line-height: 1;
  }
  p {
    color: #6b7280;
    margin-top: 0.5rem;
    font-size: 1.125rem !important;
    @media (max-width: 768px) {
      font-size: 0.8rem !important;
    }
    font-weight: 400 !important;
  }
`;

const ContentHorizontal = styled(Content)`
  display: flex;
  width: 100%;

  .link {
    color: #5145cd;
    font-size: 0.875rem;
    margin-top: 0.5rem;
    font-weight: 400;
    cursor: pointer;
  }
`;
