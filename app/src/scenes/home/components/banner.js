import React from "react";
import styled from "styled-components";
import { HeroContainer, Hero, VioletButton, WhiteButton } from "../../../components/Content";

export default function Banner() {
  return (
    <HeroContainer>
      <Hero>
        <Container>
          <svg width="48" height="48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="48" height="48" rx="24" fill="#FFFBEB" />
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M22.503 15.172a2.194 2.194 0 013.883 0L32.6 26.574c.835 1.533-.238 3.426-1.942 3.426H18.23c-1.703 0-2.776-1.893-1.94-3.426l6.213-11.402zm3.055 11.38c0 .635-.499 1.15-1.114 1.15-.615 0-1.113-.515-1.113-1.15 0-.635.498-1.15 1.113-1.15s1.114.515 1.114 1.15zm-1.114-9.195c-.615 0-1.113.515-1.113 1.15v3.447c0 .635.498 1.15 1.113 1.15s1.114-.515 1.114-1.15v-3.448c0-.634-.499-1.15-1.114-1.15z"
              fill="#FBBF24"
            />
          </svg>
          <section style={{ flex: 1 }}>
            <p>Vous n&apos;avez pas pu participer au séjour de cohésion en 2021.</p>
            <p className="small">Si vous souhaitez participer à la session 2022 :</p>
            <section className="button_container">
              <a href="https://support.snu.gouv.fr/help/fr-fr/24-questions-frequemment-posees/181-suis-je-eligible-au-sejour-de-cohesion" target="_blank" rel="noreferrer">
                <WhiteButton style={{ borderRadius: "8px" }}>Vérifiez votre éligibilité</WhiteButton>
              </a>
              <a
                href="https://support.snu.gouv.fr/help/fr-fr/24-questions-frequemment-posees/175-j-etais-inscrit-en-2021-comment-me-reinscrire-en-2022"
                target="_blank"
                rel="noreferrer">
                <VioletButton style={{ borderRadius: "8px" }}>Consultez la procédure d&apos;inscription 2022</VioletButton>
              </a>
            </section>
          </section>
        </Container>
      </Hero>
    </HeroContainer>
  );
}

const Container = styled.div`
  padding: 30px 50px;
  display: flex;
  color: #000;
  p {
    font-size: 1rem;
    margin-bottom: 0.2rem;
  }
  .small {
    font-size: 0.9rem;
  }
  svg {
    margin-right: 0.8rem;
  }
  a {
    margin-right: 0.5rem;
  }
`;
