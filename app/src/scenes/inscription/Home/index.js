import React from "react";
import { useHistory } from "react-router-dom";
import { useCookies } from "react-cookie";
import Header from "./header";
import "react-responsive-carousel/lib/styles/carousel.min.css"; // requires a loader
import { Carousel } from "react-responsive-carousel";
import DesktopView from "./DesktopView";
import plausibleEvent from "../../../services/plausible";
import gtagEvent from "../../../services/gtag";
import { urlWithScheme } from "../../../utils";

export default function Home({ location }) {
  const history = useHistory();
  const [cookies] = useCookies(["accept-cookie"]);
  return (
    <div>
      <Header location={location} />
      <div className="bg-hero-pattern w-full h-[405px] text-center bg-right	bg-no-repeat bg-cover md:h-[500px]">
        <div className="flex pt-1 flex-col	items-center z-10">
          {/* incription Head */}
          <div className="uppercase text-sm	font-normal	text-white md:hidden">inscription 2022</div>
          <div className="mb-8 pt-3 text-white font-semibold text-[2rem] md:text-[3rem]">Participez au SNU</div>
          {/* PlayButton */}
          <a
            className="flex items-center justify-center bg-white mb-4 w-12 h-12 rounded-full md:h-20 md:w-20"
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
        <div className="flex-1 z-10">
          <p className="text-white mb-4 font-medium text-2xl md:text-base">Une aventure en trois phases</p>
          {/* Desktop View Cards*/}
          <div className=" justify-around hidden md:flex">
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
          <Carousel className="flex md:hidden p-3" showThumbs={false} showStatus={false} showArrows={true}>
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
            <button
              className="uppercase p-3 pr-4 mt-[3px] lg:mt-[2rem] text-white bg-[#61c091] font-medium	text-base	cursor-pointer tracking-wider	rounded-full	hover:shadow-2xl"
              onClick={() => {
                history.push("/inscription/profil");
                plausibleEvent("LP CTA - Inscription");
                gtagEvent(cookies, "DC-2971054/snuiz0/bouton1+unique");
              }}>
              Commencer&nbsp;l&apos;inscription
            </button>
          </div>
        </div>
      </div>
      {/* Its Mobile and Desktop View Component */}
      <DesktopView />
      {/* Start Button Mobile View */}
      <div className="flex justify-center	">
        <div className="z-10 fixed bottom-12 md:hidden">
          <button
            className="uppercase p-3 pr-4 text-white bg-[#61c091]	font-medium	text-base	cursor-pointer tracking-wider	rounded-full 	hover:shadow-2xl"
            onClick={() => {
              history.push("/inscription/profil");
              plausibleEvent("LP CTA - Inscription");
              gtagEvent(cookies, "DC-2971054/snuiz0/bouton1+unique");
            }}>
            Commencer&nbsp;l&apos;inscription
          </button>
        </div>
      </div>
    </div>
  );
}

const CardPhase = ({ upText, title, downText, to }) => {
  return (
    <a
      className="flex w-full flex-col justify-between items-start border-b-8 border-red-700 rounded-2xl  min-h-[10rem]	 bg-white pt-4	pr-4 pb-8	 pl-4	hover:text-black"
      href={urlWithScheme(to)}
      target="_blank"
      rel="noreferrer">
      <div>
        <p className="text-left text-[#ef4036]	uppercase text-[0.8rem]	">{upText}</p>
        <p className="text-lg text-left font-bold md:text-2xl ">{title}</p>
      </div>
      <p className="text-left text-base	md:text-sm text-[#6e757c] ">{downText}</p>
    </a>
  );
};
