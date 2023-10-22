import Img3 from "../../assets/homePhase2Desktop.png";
import Img2 from "../../assets/homePhase2Mobile.png";
import React, { useState } from "react";
import { useSelector } from "react-redux";
import { Link, useHistory } from "react-router-dom";
import plausibleEvent from "../../services/plausible";
import API from "../../services/api";
import { permissionChangeCohort, permissionPhase2, wasYoungExcluded } from "../../utils";

import ChevronRight from "../../assets/icons/ChevronRight";
import Engagement from "./components/Engagement";
import dayjs from "dayjs";

export default function Phase1NotDone() {
  const young = useSelector((state) => state.Auth.young);
  const history = useHistory();
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

  return (
    <>
      {/* DESKTOP */}
      <div className="relative m-10 hidden min-h-[450px] justify-between overflow-hidden rounded-xl bg-white shadow-md lg:flex">
        {wasYoungExcluded(young) ? (
          <div className="m-16 space-y-10">
            <p className="max-w-4xl text-5xl font-medium leading-tight tracking-tight text-gray-900">
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
            <div className="my-16 ml-16 space-y-6 ">
              <p className="max-w-lg text-5xl font-medium leading-tight tracking-tight text-gray-900">
                <strong>{young.firstName}, </strong>
                vous n&apos;avez pas réalisé votre séjour de cohésion.
              </p>
              {permissionChangeCohort(young, sessionEndDate) && <ChangeCohortPrompt />}
              {permissionPhase2(young) && (
                <>
                  <div className="left-7 mt-5 text-base text-gray-800">
                    Mettez votre énergie au service d&apos;une société plus solidaire et découvrez <strong>votre talent pour l&apos;engagement</strong> en réalisant une mission
                    d&apos;intérêt général !
                  </div>
                  <div className="flex w-fit flex-col items-stretch">
                    <button
                      className="mt-5 rounded-[10px] border-[1px] border-blue-600  bg-blue-600 py-2.5 px-3 text-sm font-medium leading-5 text-white transition duration-150 ease-in-out hover:bg-white hover:!text-blue-600"
                      onClick={() => {
                        plausibleEvent("Phase 2/CTA - Realiser ma mission");
                        history.push("/phase2");
                      }}>
                      Réaliser ma mission d&apos;intérêt général
                    </button>
                  </div>
                </>
              )}
            </div>
            <div className="hidden flex-none xl:block">
              <img className="object-" src={Img3} alt="" />
            </div>
          </>
        )}
      </div>
      {/* MOBILE */}
      <div className="flex w-full flex-col-reverse bg-white lg:hidden">
        {wasYoungExcluded(young) ? (
          <div className="space-y-10 p-4">
            <p className="max-w-4xl text-5xl font-medium leading-tight tracking-tight text-gray-900">
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
                  <div className="left-7 mt-5 text-sm text-gray-800">
                    Mettez votre énergie au service d&apos;une société plus solidaire et découvrez <strong>votre talent pour l&apos;engagement</strong> en réalisant une mission
                    d&apos;intérêt général !
                  </div>
                  <button
                    className="mt-5 w-full rounded-[10px] border-[1px] border-blue-600  bg-blue-600 py-2.5 px-3 text-sm font-medium leading-5 text-white transition duration-150 ease-in-out hover:bg-white hover:!text-blue-600"
                    onClick={() => {
                      plausibleEvent("Phase 2/CTA - Realiser ma mission");
                      history.push("/phase2");
                    }}>
                    Réaliser ma mission d&apos;intérêt général
                  </button>
                </>
              )}
            </div>
            <img src={Img2} alt="" />
          </>
        )}
      </div>
    </>
  );
}

function ChangeCohortPrompt() {
  return (
    <div className="w-fit space-y-10 md:space-y-12">
      <div className="mt-8 space-y-2 font-bold leading-7">
        <p className="m-0 text-lg md:text-xl">Votre phase 1 n’est donc pas validée.</p>
        <p className="max-w-sm text-base leading-6 text-gray-700">Pour la valider, inscrivez-vous pour participer à un prochain séjour !</p>
      </div>
      <Link
        to="changer-de-sejour"
        className="flex w-full items-center justify-center rounded-md bg-blue-600 px-3 py-2 text-sm text-white shadow-ninaBlue transition hover:brightness-110 active:brightness-125 md:w-fit">
        Choisir un nouveau séjour
      </Link>
      <div className="text-xs text-blue-600">
        <Link to="account/general?desistement=1" className="flex items-center justify-center gap-4 md:justify-start">
          <span>Se désister du SNU</span>
          <ChevronRight />
        </Link>
      </div>
    </div>
  );
}
