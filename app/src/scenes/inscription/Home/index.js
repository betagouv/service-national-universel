import React from "react";
import styled from "styled-components";
import { useHistory } from "react-router-dom";

import Header from "./header";
import "react-responsive-carousel/lib/styles/carousel.min.css"; // requires a loader
import { Carousel } from "react-responsive-carousel";
import MobileView from "./MobileView";
import DesktopView from "./DesktopView";

export default function Home({ location }) {
  const history = useHistory();

  const registerEventPlausibleMobile = (e) => {
    window.plausible?.(e, { props: { device: "mobile" } });
  };

  const registerEventPlausibleDesktop = (e) => {
    window.plausible?.(e, { props: { device: "desktop" } });
  };

  return (
    <div>
      <Header location={location} />
      <Wrapper>
        <TitleContainer>
          <TopTitle className="mobileOnly">inscription 2022</TopTitle>
          <Title>Participez au SNU</Title>
          <PlayButton onClick={() => window.plausible?.("Clic video")} href="https://www.youtube.com/watch?v=rE-8fe9xPDo" target="_blank">
            <svg width="20" height="26" viewBox="0 0 20 26" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M19.1346 11.0998L3.79966 0.640236C2.49183 -0.253291 0.722412 0.719077 0.722412 2.32217V23.2149C0.722412 24.8443 2.49183 25.7904 3.79966 24.8969L19.1346 14.4373C20.2886 13.6752 20.2886 11.8882 19.1346 11.0998Z"
                fill="#D33C4A"
              />
            </svg>
          </PlayButton>
        </TitleContainer>
        <CardsContainer>
          <CardTitle>Une aventure en trois phases</CardTitle>
          <div className="desktop">
            <CardPhase
              onClick={() => registerEventPlausibleDesktop("Clic Phase 1")}
              upText="phase 1"
              title="Le séjour de cohésion"
              downText="3 sessions possibles en février, juin et juillet 2022"
              to="https://www.snu.gouv.fr/le-sejour-de-cohesion-26"
            />
            <CardPhase
              onClick={() => registerEventPlausibleDesktop("Clic Phase 2")}
              upText="phase 2"
              title="La mission d'intérêt général"
              downText="84 heures à réaliser au cours de l'année suivant le séjour de cohésion"
              to="https://www.snu.gouv.fr/la-mission-d-interet-general-27"
            />
            <CardPhase
              onClick={() => registerEventPlausibleDesktop("Clic Phase 3")}
              upText="phase 3 - facultative"
              title="L'engagement"
              downText="Mission facultative de 3 mois minimum"
              to="https://www.snu.gouv.fr/l-engagement-28"
            />
          </div>
          <Carousel className="mobile" showThumbs={false} showStatus={false} showArrows={true}>
            <CardPhase
              onClick={() => registerEventPlausibleMobile("Clic Phase 1")}
              upText="phase 1"
              title="Le séjour de cohésion"
              downText="3 sessions possibles en février, juin et juillet 2022"
              to="https://www.snu.gouv.fr/le-sejour-de-cohesion-26"
            />
            <CardPhase
              onClick={() => registerEventPlausibleMobile("Clic Phase 2")}
              upText="phase 2"
              title="La mission d'intérêt général"
              downText="84 heures à réaliser au cours de l'année suivant le séjour de cohésion"
              to="https://www.snu.gouv.fr/la-mission-d-interet-general-27"
            />
            <CardPhase
              onClick={() => registerEventPlausibleMobile("Clic Phase 3")}
              upText="phase 3 - facultative"
              title="L'engagement"
              downText="Mission facultative de 3 mois minimum"
              to="https://www.snu.gouv.fr/l-engagement-28"
            />
          </Carousel>
          <StartButtonContainer className="desktop desktopButton">
            <StartButton
              onClick={() => {
                history.push("/inscription/profil");
                registerEventPlausibleDesktop("Clic CTA - Inscription");
              }}>
              Commencer&nbsp;l&apos;inscription
            </StartButton>
          </StartButtonContainer>
        </CardsContainer>
        <MobileView />
        <DesktopView />
      </Wrapper>
      <StartButtonContainer className="mobile">
        <StartButton
          onClick={() => {
            history.push("/inscription/profil");
            registerEventPlausibleMobile("Clic CTA - Inscription");
          }}>
          Commencer&nbsp;l&apos;inscription
        </StartButton>
      </StartButtonContainer>
    </div>
  );
}

const CardTitle = styled.div`
  color: #fff;
  font-size: 1.5rem;
  margin-bottom: 2rem;
  font-weight: 500;
  @media (max-width: 767px) {
    font-size: 1rem;
  }
`;

const PlayButton = styled.a`
  background-color: #fff;
  height: 90px;
  width: 90px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
  svg {
    height: 100%;
  }
  @media (max-width: 767px) {
    height: 50px;
    width: 50px;
  }
`;

const TitleContainer = styled.div`
  margin-top: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 10;
`;

const CardsContainer = styled.div`
  flex: 1;
  z-index: 2;
  .mobile {
    display: none;
  }
  .desktop {
    display: flex;
    align-items: center;
    > * {
      margin: 0 1rem;
    }
  }
  @media (max-width: 767px) {
    .desktop {
      display: none;
    }
    .mobile {
      display: flex;
      > * {
        margin: 0 1rem;
      }
    }
  }
`;

const CardPhase = ({ upText, title, downText, to }) => {
  return (
    <Card href={to} target="_blank">
      <div>
        <CardUpText>{upText}</CardUpText>
        <CardText>{title}</CardText>
      </div>
      <CardDownText>{downText}</CardDownText>
    </Card>
  );
};

const Card = styled.a`
  padding: 1rem 1rem 2rem 1rem;
  display: flex;
  width: 100%;
  min-height: 170px;
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-start;
  background-color: #fff;
  border-radius: 1rem;
  border-bottom: 7px solid #ef4036;
`;
const CardUpText = styled.div`
  text-align: left;
  color: #ef4036;
  text-transform: uppercase;
  font-size: 0.8rem;
`;

const CardText = styled.div`
  color: #000;
  font-size: 1.5rem;
  text-align: left;
  font-weight: 700;
  @media (max-width: 767px) {
    font-size: 1.2rem;
  }
`;

const CardDownText = styled.div`
  text-align: left;
  font-size: 1rem;
  @media (max-width: 767px) {
    font-size: 0.85rem;
  }
  color: #6e757c;
`;

const StartButtonContainer = styled.div`
  z-index: 100;
  &.mobile {
    display: none;
  }
  justify-content: center;
  margin-top: 1rem;
  @media (max-width: 767px) {
    position: fixed;
    bottom: 80px;
    left: 50%;
    transform: translate(-50%, 0);
    &.mobile {
      display: inline-block;
    }
  }
`;

const StartButton = styled.div`
  padding: 1rem 1.5rem;
  text-transform: uppercase;
  color: #fff;
  background-color: #61c091;
  font-weight: 500;
  font-size: 1rem;
  cursor: pointer;
  letter-spacing: 0.03em;
  border-radius: 30px;
  :hover {
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    color: #fff;
  }
  &.mobile {
    border: 3px #51b081 solid;
  }
`;

const Wrapper = styled.div`
  width: 100%;
  text-align: center;
  align-items: center;

  ::before {
    content: "";
    display: block;
    height: 630px;
    width: 100%;
    background: url(${require("../../../assets/phase3.jpg")}) center no-repeat;
    background-size: cover;
    position: absolute;
    top: 0;
    left: 0;
    z-index: 1;
  }
  ::after {
    content: "";
    display: block;
    height: 630px;
    width: 100%;
    position: absolute;
    top: 0;
    left: 0;
    background: rgb(66, 56, 157);
    background: linear-gradient(0deg, rgba(66, 56, 157, 1) 0%, rgba(66, 56, 157, 0.8575805322128851) 24%, rgba(66, 56, 157, 0.5606617647058824) 79%, rgba(0, 212, 255, 0) 100%);
    z-index: 1;
  }
  > * {
    position: relative;
  }
  .mobileOnly {
    display: none;
  }
  @media (max-width: 767px) {
    .mobileOnly {
      display: block;
    }
    padding: 0;
    ::before,
    ::after {
      height: 490px;
    }
  }
`;
const Title = styled.div`
  margin-bottom: 20px;
  color: #fff;
  font-size: 46px;
  font-weight: 600;
  @media (max-width: 1024px) {
    font-size: 38px;
  }
  @media (max-width: 767px) {
    font-size: 32px;
  }
  @media (max-width: 575px) {
    font-size: 22px;
  }
`;
const TopTitle = styled.div`
  text-transform: uppercase;
  color: #fff;
  font-size: 0.8rem;
  font-weight: 400;
`;
