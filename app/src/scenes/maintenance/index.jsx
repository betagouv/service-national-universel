import React from "react";
import styled from "styled-components";
import Header from "./header";
import "react-responsive-carousel/lib/styles/carousel.min.css"; // requires a loader
import { Carousel } from "react-responsive-carousel";
import plausibleEvent from "../../services/plausible";
import { urlWithScheme } from "../../utils";

export default function Maintenance() {
  return (
    <div>
      <Header location={location} />
      <div className="h-[405px] w-full bg-hero-pattern bg-cover bg-right	bg-no-repeat text-center md:h-[500px]">
        <div className="z-10 flex flex-col	items-center pt-1">
          {/* incription Head */}
          <div className="text-sm font-normal	uppercase	text-white md:hidden">inscription 2022</div>
          <div className="mb-8 pt-3 text-[2rem] font-semibold text-white md:text-[3rem]">Participez au SNU</div>
          {/* PlayButton */}
          <a
            className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-white md:h-20 md:w-20"
            onClick={() => plausibleEvent("LP - Video")}
            href="https://www.youtube.com/watch?v=rE-8fe9xPDo"
            target="_blank"
            rel="noreferrer">
            <svg width="20" height="26" viewBox="0 0 20 26" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M19.1346 11.0998L3.79966 0.640236C2.49183 -0.253291 0.722412 0.719077 0.722412 2.32217V23.2149C0.722412 24.8443 2.49183 25.7904 3.79966 24.8969L19.1346 14.4373C20.2886 13.6752 20.2886 11.8882 19.1346 11.0998Z"
                fill="#D33C4A"
              />
            </svg>
          </a>
        </div>
        {/* Cards container */}
        <div className="z-10 flex-1">
          <p className="mb-4 text-2xl font-medium text-white md:text-base">Une aventure en trois phases</p>
          {/* Desktop View Cards*/}
          <div className=" hidden justify-around md:flex">
            <div className="w-[20rem] lg:w-[25rem] ">
              <CardPhase
                onClick={() => plausibleEvent("LP - Phase 1")}
                upText="phase 1"
                title="Le séjour de cohésion"
                downText="3 sessions possibles en février, juin et juillet 2022"
                to="https://www.snu.gouv.fr/le-sejour-de-cohesion-26"
              />
            </div>
            <div className="w-[20rem] lg:w-[25rem]">
              <CardPhase
                onClick={() => plausibleEvent("LP - Phase 2")}
                upText="phase 2"
                title="La mission d'intérêt général"
                downText="84 heures à réaliser au cours de l'année suivant le séjour de cohésion"
                to="https://www.snu.gouv.fr/la-mission-d-interet-general-27"
              />
            </div>
            <div className="w-[20rem] lg:w-[25rem]  ">
              <CardPhase
                onClick={() => plausibleEvent("LP - Phase 3")}
                upText="phase 3 - facultative"
                title="L'engagement"
                downText="Mission facultative de 3 mois minimum"
                to="https://www.snu.gouv.fr/l-engagement-28"
              />
            </div>
          </div>

          {/* Mobile View Carusel*/}
          <Carousel className="flex p-3 md:hidden" showThumbs={false} showStatus={false} showArrows={true}>
            <CardPhase
              onClick={() => plausibleEvent("LP - Phase 1")}
              upText="phase 1"
              title="Le séjour de cohésion"
              downText="3 sessions possibles en février, juin et juillet 2022"
              to="https://www.snu.gouv.fr/le-sejour-de-cohesion-26"
            />
            <CardPhase
              onClick={() => plausibleEvent("LP - Phase 2")}
              upText="phase 2"
              title="La mission d'intérêt général"
              downText="84 heures à réaliser au cours de l'année suivant le séjour de cohésion"
              to="https://www.snu.gouv.fr/la-mission-d-interet-general-27"
            />
            <CardPhase
              onClick={() => plausibleEvent("LP - Phase 3")}
              upText="phase 3 - facultative"
              title="L'engagement"
              downText="Mission facultative de 3 mois minimum"
              to="https://www.snu.gouv.fr/l-engagement-28"
            />
          </Carousel>

          {/* Start Button Desktop View */}
          <div className="z-50  hidden md:block">
            <button disabled className="mt-[3px] cursor-not-allowed rounded-full bg-[#acaaba] p-3 pr-4 text-base font-medium	uppercase	tracking-wider text-white	lg:mt-[2rem]">
              Site&nbsp;en&nbsp;maintenance
            </button>
          </div>
        </div>
        <Container>
          <Text>
            Le site est actuellement en maintenance suite à un problème technique sur la plateforme.
            <br />
            Nous faisons notre possible pour rétablir la situation.
          </Text>
        </Container>
      </div>
      {/* Its Mobile and Desktop View Component */}
      {/* <DesktopView /> */}
    </div>
  );
}

const CardPhase = ({ upText, title, downText, to }) => {
  return (
    <a
      className="flex min-h-[10rem] w-full flex-col items-start justify-between rounded-2xl border-b-8  border-red-700	 bg-white pt-4	pr-4 pb-8	 pl-4	hover:text-black"
      href={urlWithScheme(to)}
      target="_blank"
      rel="noreferrer">
      <div>
        <p className="text-left text-[0.8rem]	uppercase text-[#ef4036]	">{upText}</p>
        <p className="text-left text-lg font-bold md:text-2xl ">{title}</p>
      </div>
      <p className="text-left text-base	text-[#6e757c] md:text-sm ">{downText}</p>
    </a>
  );
};

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  padding-top: 2rem;
  padding-left: auto;
  padding-right: auto;
  border-radius: 1rem;
  overflow: hidden;
  width: 60%;
  margin: auto;
  margin-top: -2rem;
  input {
    margin-bottom: 1rem;
    text-align: center;
    border: 1px solid #c7c7c7;
    background-color: #fff;
    border-radius: 10px;
    padding: 7px 30px;
    min-width: 300px;
    max-width: 300px;
  }
  @media (max-width: 767px) {
    margin-top: 0;
    width: 100%;
  }
`;

const Text = styled.div`
  color: #32267f;
  font-size: 1.2rem;
  padding: 1rem;
  @media (max-width: 767px) {
    font-size: 1rem;
  }
`;
