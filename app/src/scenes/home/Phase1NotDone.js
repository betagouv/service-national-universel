import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import plausibleEvent from "../../services/plausible";
import API from "../../services/api";
import { translate } from "../../utils";
import { capture } from "../../sentry";
import { toastr } from "react-redux-toastr";
import { setYoung } from "../../redux/auth/actions";
import Loader from "../../components/Loader";

export default function Phase1NotDone() {
  const [loading, setLoading] = useState(false);
  const young = useSelector((state) => state.Auth.young);
  const history = useHistory();
  const dispatch = useDispatch();

  async function goToReinscription() {
    try {
      setLoading(true);
      const { ok, code, data: responseData } = await API.put("/young/reinscription/goToReinscription");
      if (!ok) throw new Error(translate(code));
      dispatch(setYoung(responseData));

      plausibleEvent("Phase1 Non réalisée/CTA reinscription - home page");
      return history.push("/reinscription/eligibilite");
    } catch (e) {
      setLoading(false);
      capture(e);
      toastr.error("Une erreur s'est produite :", translate(e.code));
    }
  }

  return (
    <>
      {/* DESKTOP */}
      <div className="hidden lg:flex">
        <div className="my-12 mx-10 w-full">
          <div className="flex justify-between items-center rounded-lg bg-white ">
            <div className="w-1/2 pl-10 py-12">
              <div className="text-[48px] font-medium leading-tight tracking-tight text-gray-800">
                <strong>{young.firstName},</strong>
                <br />
                vous n&apos;avez pas réalisé votre séjour de cohésion&nbsp;!
              </div>
              <div className="text-base left-7 text-gray-800 mt-5">
                Mettez votre énergie au service d&apos;une société plus solidaire et découvrez <strong>votre talent pour l&apos;engagement</strong> en réalisant une mission
                d&apos;intérêt général !
              </div>
              <div className="flex flex-col items-stretch w-fit">
                <button
                  className="rounded-[10px] border-[1px] py-2.5 px-3  bg-blue-600 hover:bg-white border-blue-600 mt-5 text-white hover:!text-blue-600 text-sm leading-5 font-medium transition ease-in-out duration-150"
                  onClick={() => {
                    plausibleEvent("Phase 2/CTA - Realiser ma mission");
                    history.push("/phase2");
                  }}>
                  Réaliser ma mission d&apos;intérêt général
                </button>
                {loading ? (
                  <Loader />
                ) : (
                  <button
                    className="w-full rounded-[10px] border-[1px] py-2.5 px-3  bg-blue-[#FFFFFF] hover:bg-blue-600 border-blue-600 mt-5 text-blue-600 hover:text-white text-sm leading-5 font-medium transition ease-in-out duration-150"
                    onClick={goToReinscription}>
                    Se réinscrire à un autre séjour
                  </button>
                )}
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
              <strong>{young.firstName},</strong>
              <br />
              vous n&apos;avez pas réalisé votre séjour de cohésion&nbsp;!
            </div>
            <div className="text-sm left-7 text-gray-800 mt-5">
              Mettez votre énergie au service d&apos;une société plus solidaire et découvrez <strong>votre talent pour l&apos;engagement</strong> en réalisant une mission
              d&apos;intérêt général !
            </div>
            <button
              className="w-full rounded-[10px] border-[1px] py-2.5 px-3  bg-blue-600 hover:bg-white border-blue-600 mt-5 text-white hover:!text-blue-600 text-sm leading-5 font-medium transition ease-in-out duration-150"
              onClick={() => {
                plausibleEvent("Phase 2/CTA - Realiser ma mission");
                history.push("/phase2");
              }}>
              Réaliser ma mission d&apos;intérêt général
            </button>
            <button
              className="w-full rounded-[10px] border-[1px] py-2.5 px-3  bg-blue-600 hover:bg-white border-blue-600 mt-5 text-white hover:!text-blue-600 text-sm leading-5 font-medium transition ease-in-out duration-150"
              onClick={goToReinscription}>
              Se réinscrire à un autre séjour
            </button>
          </div>
          <img src={require("../../assets/homePhase2Mobile.png")} />
        </div>
      </div>
    </>
  );
}
