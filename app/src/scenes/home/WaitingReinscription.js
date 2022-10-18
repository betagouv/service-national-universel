import React, { useState } from "react";
import { useSelector } from "react-redux";
import { toastr } from "react-redux-toastr";
import { useHistory } from "react-router-dom";
import { YOUNG_STATUS } from "snu-lib";
import { capture } from "../../sentry";
import API from "../../services/api";
import plausibleEvent from "../../services/plausible";
import { translate } from "../../utils";

export default function WaitingReinscription() {
  const young = useSelector((state) => state.Auth.young);
  const history = useHistory();

  const [loading, setLoading] = useState(false);

  let textPrecision;
  if (young.status === YOUNG_STATUS.WAITING_LIST) textPrecision = "Vous étiez sur liste complémentaire sur un séjour en 2022.";
  else if (young.cohorte === "à venir") textPrecision = "Vous êtes inscrit sur un séjour “à venir”.";
  else if (young.status === YOUNG_STATUS.NOT_DONE && !young.cohesionStayPresence && !young.departInform)
    textPrecision = "En 2022, vous n'avez pas pu participer au séjour de cohésion.";
  else return;

  const onClickEligibilte = async () => {
    try {
      setLoading(true);
      const { ok, code } = await API.put("/young/reinscription/goToReinscription");
      if (!ok) throw new Error(translate(code));

      plausibleEvent("Phase0/CTA reinscription - home page");
      return history.push("/reinscription");
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
          <div className="flex justify-between items-center rounded-lg bg-white ">
            <div className="w-1/2 pl-10 py-12">
              <div className="text-[48px] font-medium leading-tight tracking-tight text-gray-800">
                <strong>{young.firstName},</strong> vous inscrire sur un séjour en 2023 ?
              </div>
              <div className="text-base left-7 text-gray-800 mt-5">{textPrecision}</div>
              <div className="flex flex-col items-stretch w-fit">
                <button
                  className="rounded-[10px] border-[1px] py-2.5 px-3  bg-blue-600 hover:bg-white border-blue-600 mt-5 text-white hover:!text-blue-600 text-sm leading-5 font-medium transition ease-in-out duration-150"
                  disabled={loading}
                  onClick={onClickEligibilte}>
                  Vérifier mon éligibilité
                </button>
              </div>
            </div>
            <img className="w-1/2 object-fill" src={require("../../assets/homePhase2Desktop.png")} />
          </div>
        </div>
      </div>
      {/* MOBILE */}
      <div className="flex lg:hidden w-full">
        <div className="flex flex-col-reverse ">
          <div className="px-4 pb-4">
            <div className="text-3xl font-medium leading-tight tracking-tight text-gray-800">
              <strong>{young.firstName},</strong> vous inscrire sur un séjour en 2023 ?
            </div>
            <div className="left-7 text-[#738297] mt-3">{textPrecision}</div>
            <div className="left-7 font-bold text-gray-800 mt-4">Vérifiez dès maintenant votre éligibilité</div>
            <button
              className="w-full rounded-[10px] border-[1px] py-2.5 px-3  bg-blue-600 hover:bg-white border-blue-600 mt-3 text-white hover:!text-blue-600 text-sm leading-5 transition ease-in-out duration-150"
              disabled={loading}
              onClick={onClickEligibilte}>
              Vérifier mon éligibilité
            </button>
          </div>
          <img src={require("../../assets/homePhase2Mobile.png")} />
        </div>
      </div>
    </>
  );
}
