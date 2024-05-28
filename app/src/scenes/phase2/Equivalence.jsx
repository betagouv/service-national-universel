import React from "react";
import { useSelector } from "react-redux";
import Img from "../../assets/phase2Reconnaissance.png";
import ImgMobile from "../../assets/phase2MobileReconnaissance.png";
import AlertPrimary from "../../components/ui/alerts/AlertPrimary";
import { isYoungCanApplyToPhase2Missions } from "../../utils";
import InformationCircle from "../../assets/icons/InformationCircle";
import plausibleEvent from "../../services/plausible";
import ButtonLinkPrimaryOutline from "../../components/ui/buttons/ButtonLinkPrimaryOutline";

export const Equivalence = () => {
  const young = useSelector((state) => state.Auth.young);

  return (
    <div className="sm:pb-4 md:pb-0 flex flex-col md:flex-row md:rounded-2xl border-0 shadow-lg md:max-h-[300px] md:w-1/2">
      <img src={Img} className="sm:hidden md:block rounded-l-xl md:w-1/2 md:max-h-[300px] overflow-hidden object-cover" />
      <img src={ImgMobile} className="w-full md:hidden" />
      <div className="flex items-center flex-col justify-center px-3 md:p-4">
        <div className="text-lg font-bold text-gray-900 ">Demandez la reconnaissance d&apos;un engagement déjà réalisé</div>
        <div className="mt-2 mb-3 text-sm text-gray-600">Faîtes reconnaitre comme mission d&apos;intérêt général un engagement déjà réalisé au service de la société</div>
        {!isYoungCanApplyToPhase2Missions(young) && (
          <AlertPrimary className="mb-4">
            <div className="my-1 text-blue-400">
              <InformationCircle />
            </div>
            <span>Vous devez avoir terminé votre séjour de cohésion.</span>
          </AlertPrimary>
        )}

        <ButtonLinkPrimaryOutline
          to="/phase2/equivalence"
          disabled={!isYoungCanApplyToPhase2Missions(young)}
          className="flex w-full justify-center"
          onClick={() => plausibleEvent("Phase 2/ CTA - EquivalenceMIGdemande")}>
          Faire ma demande
        </ButtonLinkPrimaryOutline>
      </div>
    </div>
  );
};

export default Equivalence;
