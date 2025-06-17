import plausibleEvent from "@/services/plausible";
import React from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { YOUNG_STATUS, YOUNG_STATUS_PHASE1 } from "snu-lib";
import HomeContainer from "@/components/layout/HomeContainer";
import HomeHeader from "@/components/layout/HomeHeader";
import hero from "../../assets/hero/home.png";
import Engagement from "./components/Engagement";

export default function WaitingReinscription() {
  const young = useSelector((state) => state.Auth.young);
  const title = `${young.firstName}, vous souhaitez vous inscrire sur un nouveau séjour ?`;

  let textPrecision;
  let textSecond;

  textPrecision = "Vérifiez dès maintenant votre éligibilité !";
  if (young.statusPhase1 === YOUNG_STATUS_PHASE1.NOT_DONE) {
    textPrecision = "Votre Phase 1 n'a pas été validée.";
    textSecond = "Pour la valider, inscrivez-vous pour participer à un prochain séjour !";
  }

  if (young.status === YOUNG_STATUS.WAITING_LIST) textPrecision = "Vous étiez sur liste complémentaire sur un séjour précédent.";

  return (
    <HomeContainer>
      <HomeHeader title={title} img={hero}>
        <p className="mt-4 leading-relaxed">{textPrecision}</p>
        {textSecond && <div className="left-7 mt-3 text-[#738297] pr-16">{textSecond}</div>}
        <div className="flex w-fit flex-col items-stretch">
          <Link to="/reinscription">
            <p
              className="mt-6 text-center md:w-fit rounded-md bg-blue-600 py-2 px-3 text-sm text-white transition duration-150 ease-in-out hover:bg-blue-800"
              onClick={() => plausibleEvent("Phase0/CTA reinscription - home page")}>
              Vérifier mon éligibilité
            </p>
          </Link>
        </div>
      </HomeHeader>
      <br />
      <Engagement />
    </HomeContainer>
  );
}
