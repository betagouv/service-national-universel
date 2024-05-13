import plausibleEvent from "@/services/plausible";
import Img3 from "../../assets/homePhase2Desktop.png";
import Img2 from "../../assets/homePhase2Mobile.png";
import React from "react";
import { useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { YOUNG_STATUS, YOUNG_STATUS_PHASE1 } from "snu-lib";

export default function WaitingReinscription({ reinscriptionOpen }) {
  const young = useSelector((state) => state.Auth.young);
  const history = useHistory();

  let textPrecision;
  let textSecond;

  if (reinscriptionOpen) {
    textPrecision = "Vérifiez dès maintenant votre éligibilité !";
    if (young.statusPhase1 === YOUNG_STATUS_PHASE1.NOT_DONE) {
      textPrecision = "Votre Phase 1 n'a pas été validée.";
      textSecond = "Pour la valider, inscrivez-vous pour participer à un prochain séjour !";
    }
  } else {
    if (young.status === YOUNG_STATUS.WAITING_LIST) textPrecision = "Vous étiez sur liste complémentaire sur un séjour précédent.";
    else if ((young.statusPhase1 === YOUNG_STATUS_PHASE1.NOT_DONE && young.departSejourMotif !== "Exclusion") || young.statusPhase1 === YOUNG_STATUS_PHASE1.EXEMPTED) {
      textPrecision = "Vous n’avez pas réalisé votre séjour de cohésion";
      textSecond = "Votre phase 1 n’est donc pas validée";
    } else return;
  }
  const onClickEligibilte = async () => {
    plausibleEvent("Phase0/CTA reinscription - home page");
    return history.push("/reinscription");
  };

  return (
    <>
      {/* DESKTOP */}
      <div className="hidden lg:flex">
        <div className="my-12 mx-10 w-full">
          <div className="flex items-center justify-between rounded-lg bg-white ">
            <div className="w-1/2 py-12 pl-10">
              <div className="text-[48px] border-b pb-12 font-medium leading-tight tracking-tight text-gray-800">
                <strong>{young.firstName},</strong> vous souhaitez vous inscrire sur un séjour en 2024 ?
              </div>
              <div className="left-7 mt-4 text-black text-xl leading-7 font-bold">{textPrecision}</div>
              {textSecond && <div className="left-7 mt-3 text-[#738297] pr-16">{textSecond}</div>}
              {reinscriptionOpen && (
                <>
                  <div className="flex w-fit flex-col items-stretch">
                    <button
                      className="mt-4 rounded-[10px] border-[1px] border-blue-600  bg-blue-600 py-2.5 px-3 text-sm font-medium leading-5 text-white transition duration-150 ease-in-out hover:bg-white hover:!text-blue-600"
                      onClick={onClickEligibilte}>
                      Vérifier mon éligibilité
                    </button>
                  </div>
                </>
              )}
            </div>
            <img className="w-1/2 object-fill" src={Img3} />
          </div>
        </div>
      </div>
      {/* MOBILE */}
      <div className="flex w-full lg:hidden">
        <div className="flex flex-col-reverse ">
          <div className="px-4 pb-4">
            <div className="text-3xl font-medium leading-tight tracking-tight text-gray-800">
              <strong>{young.firstName},</strong> vous souhaitez vous inscrire sur un séjour en 2024 ?
            </div>
            <div className="left-7 mt-4 text-black text-xl leading-7 font-bold">{textPrecision}</div>
            {textSecond && <div className="left-7 mt-3 text-[#738297]">{textSecond}</div>}
            {reinscriptionOpen && (
              <>
                <button
                  className="mt-3 w-full rounded-[10px] border-[1px] border-blue-600  bg-blue-600 py-2.5 px-3 text-sm leading-5 text-white transition duration-150 ease-in-out hover:bg-white hover:!text-blue-600"
                  onClick={onClickEligibilte}>
                  Vérifier mon éligibilité
                </button>
              </>
            )}
          </div>
          <img src={Img2} />
        </div>
      </div>
    </>
  );
}
