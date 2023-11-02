import Img3 from "../../assets/homePhase2Desktop.png";
import Img2 from "../../assets/homePhase2Mobile.png";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toastr } from "react-redux-toastr";
import { useHistory } from "react-router-dom";
import { YOUNG_STATUS, YOUNG_STATUS_PHASE1 } from "snu-lib";
import { setYoung } from "../../redux/auth/actions";
import { capture } from "../../sentry";
import API from "../../services/api";
import plausibleEvent from "../../services/plausible";
import { translate } from "../../utils";

export default function WaitingReinscription() {
  const young = useSelector((state) => state.Auth.young);
  const history = useHistory();
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(false);

  let textPrecision;
  if (young.status === YOUNG_STATUS.WAITING_LIST && young.cohort === "à venir")
    textPrecision = "Nous vous tiendrons informé par mail lors de l’ouverture des inscriptions pour les séjours à venir de l’année scolaire 2023-2024.";
  else if (young.status === YOUNG_STATUS.WAITING_LIST) textPrecision = "Vous étiez sur liste complémentaire sur un séjour précédent.";
  else if (young.cohort === "à venir")
    textPrecision = "Nous vous tiendrons informé par mail lors de l’ouverture des inscriptions pour les séjours à venir de l’année scolaire 2023-2024.";
  else if ((young.statusPhase1 === YOUNG_STATUS_PHASE1.NOT_DONE && young.departSejourMotif !== "Exclusion") || young.statusPhase1 === YOUNG_STATUS_PHASE1.EXEMPTED)
    textPrecision = "Vous n'avez pas pu participer au séjour de cohésion.";
  else return;

  const onClickEligibilte = async () => {
    try {
      setLoading(true);
      const { ok, code, data: responseData } = await API.put("/young/reinscription/goToReinscription");
      if (!ok) throw new Error(translate(code));
      dispatch(setYoung(responseData));

      plausibleEvent("Phase0/CTA reinscription - home page");
      return history.push("/reinscription/eligibilite");
    } catch (e) {
      setLoading(false);
      capture(e);
      toastr.error("Une erreur s'est produite :", translate(e.code));
    }
  };

  return (
    <>
      {/* DESKTOP */}
      <div className="hidden lg:flex">
        <div className="my-12 mx-10 w-full">
          <div className="flex items-center justify-between rounded-lg bg-white ">
            <div className="w-1/2 py-12 pl-10">
              <div className="text-[48px] font-medium leading-tight tracking-tight text-gray-800">
                <strong>{young.firstName},</strong> vous souhaitez vous réinscrire sur un séjour l'année prochaine ?
              </div>
              <div className="left-7 mt-5 text-base text-gray-800">{textPrecision}</div>
              <div className="flex w-fit flex-col items-stretch">
                {/* <button
                  className="mt-5 rounded-[10px] border-[1px] border-blue-600  bg-blue-600 py-2.5 px-3 text-sm font-medium leading-5 text-white transition duration-150 ease-in-out hover:bg-white hover:!text-blue-600"
                  disabled={loading}
                  onClick={onClickEligibilte}>
                  Vérifier mon éligibilité
                </button> */}
              </div>
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
              <strong>{young.firstName},</strong> vous souhaitez vous réinscrire sur un séjour en 2023 ?
            </div>
            <div className="left-7 mt-3 text-[#738297]">{textPrecision}</div>
            {/* <div className="left-7 mt-4 font-bold text-gray-800">Vérifiez dès maintenant votre éligibilité</div>
            <button
              className="mt-3 w-full rounded-[10px] border-[1px] border-blue-600  bg-blue-600 py-2.5 px-3 text-sm leading-5 text-white transition duration-150 ease-in-out hover:bg-white hover:!text-blue-600"
              disabled={loading}
              onClick={onClickEligibilte}>
              Vérifier mon éligibilité
            </button> */}
          </div>
          <img src={Img2} />
        </div>
      </div>
    </>
  );
}
