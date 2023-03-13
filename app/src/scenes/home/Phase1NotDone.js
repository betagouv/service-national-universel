import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useHistory } from "react-router-dom";
import plausibleEvent from "../../services/plausible";
import API from "../../services/api";
import { permissionChangeCohort, permissionPhase2, permissionReinscription, translate, wasYoungExcluded } from "../../utils";
import { capture } from "../../sentry";
import { toastr } from "react-redux-toastr";
import { setYoung } from "../../redux/auth/actions";
import Loader from "../../components/Loader";
import ChevronRight from "../../assets/icons/ChevronRight";
import Engagement from "./components/Engagement";
import dayjs from "dayjs";
import { environment } from "../../config";

export default function Phase1NotDone() {
  const [loading, setLoading] = useState(false);
  const young = useSelector((state) => state.Auth.young);
  const history = useHistory();
  const dispatch = useDispatch();
  const [sessionEndDate, setSessionEndDate] = useState(null);

  async function getSessionEndDate(cohort) {
    const { ok, data } = await API.get(`/cohort/${cohort}`);
    if (!ok) return null;
    return dayjs(data.dateEnd);
  }

  React.useEffect(() => {
    if (!young?.cohort) return;
    getSessionEndDate(young.cohort).then((date) => setSessionEndDate(date));
  }, [young]);

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
      <div className="relative hidden lg:flex justify-between m-10 rounded-xl shadow-md bg-white overflow-hidden min-h-[450px]">
        {wasYoungExcluded(young) ? (
          <div className="m-16 space-y-10">
            <p className="text-5xl font-medium leading-tight tracking-tight text-gray-900 max-w-4xl">
              <strong>{young.firstName}, </strong>
              votre séjour de cohésion n&apos;a pas été validé pour motif d&apos;exclusion.
            </p>
            <p>
              <strong>Vous ne pouvez donc pas poursuivre votre parcours d’engagement au sein du SNU.</strong>
              <br />
              Nous vous proposons de découvrir les autres formes d’engagement possible.
            </p>
            <Engagement />
          </div>
        ) : (
          <>
            <div className="ml-16 my-16 space-y-6 ">
              <p className="text-5xl font-medium leading-tight tracking-tight text-gray-900 max-w-lg">
                <strong>{young.firstName}, </strong>
                vous n&apos;avez pas réalisé votre séjour de cohésion.
              </p>
              {permissionChangeCohort(young, sessionEndDate) && <ChangeCohortPrompt />}
              {permissionPhase2(young) && (
                <>
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
                  </div>
                </>
              )}
              {permissionReinscription(young) && (
                <div className="flex flex-col items-stretch w-fit">
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
              )}
            </div>
            <div className="hidden xl:block flex-none">
              <img className="object-" src={require("../../assets/homePhase2Desktop.png")} alt="" />
            </div>
          </>
        )}
      </div>
      {/* MOBILE */}
      <div className="flex flex-col-reverse lg:hidden w-full bg-white">
        {wasYoungExcluded(young) ? (
          <div className="p-4 space-y-10">
            <p className="text-5xl font-medium leading-tight tracking-tight text-gray-900 max-w-4xl">
              <strong>{young.firstName}, </strong>
              votre séjour de cohésion n&apos;a pas été validé pour motif d&apos;exclusion.
            </p>
            <p>
              <strong>Vous ne pouvez donc pas poursuivre votre parcours d’engagement au sein du SNU.</strong>
              <br />
              Nous vous proposons de découvrir les autres formes d’engagement possible.
            </p>
            <Engagement />
          </div>
        ) : (
          <>
            <div className="px-4 pb-4">
              <p className="text-3xl font-medium leading-tight tracking-tight text-gray-800">
                <strong>{young.firstName}, </strong> vous n&apos;avez pas réalisé votre séjour de cohésion.
              </p>
              {permissionChangeCohort(young, sessionEndDate) && <ChangeCohortPrompt />}
              {permissionPhase2(young) && (
                <>
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
                </>
              )}
              {permissionReinscription(young) && (
                <button
                  className="w-full rounded-[10px] border-[1px] py-2.5 px-3  bg-blue-600 hover:bg-white border-blue-600 mt-5 text-white hover:!text-blue-600 text-sm leading-5 font-medium transition ease-in-out duration-150"
                  onClick={goToReinscription}>
                  Se réinscrire à un autre séjour
                </button>
              )}
            </div>
            <img src={require("../../assets/homePhase2Mobile.png")} alt="" />
          </>
        )}
      </div>
    </>
  );
}

function ChangeCohortPrompt() {
  return (
    <div className="space-y-10 md:space-y-12 w-fit">
      <div className="font-bold leading-7 mt-8 space-y-2">
        <p className="text-lg md:text-xl m-0">Votre phase 1 n’est donc pas validée.</p>
        <p className="text-gray-700 text-base max-w-sm leading-6">Pour la valider, inscrivez-vous pour participer à un prochain séjour !</p>
      </div>
      <Link
        to="changer-de-sejour"
        className="w-full md:w-fit bg-blue-600 rounded-md text-white text-sm px-3 py-2 hover:brightness-110 active:brightness-125 shadow-ninaBlue transition flex justify-center items-center">
        Choisir un nouveau séjour
      </Link>
      <div className="text-xs text-blue-600">
        <Link to={environment === "production" ? "desistement" : "account?desistement=1"} className="flex items-center justify-center md:justify-start gap-4">
          <span>Se désister du SNU</span>
          <ChevronRight />
        </Link>
      </div>
    </div>
  );
}
