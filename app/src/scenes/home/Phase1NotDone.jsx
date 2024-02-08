import React from "react";
import Img3 from "../../assets/homePhase2Desktop.png";
import Img2 from "../../assets/homePhase2Mobile.png";
import { useSelector } from "react-redux";
import { wasYoungExcluded } from "../../utils";

import Engagement from "./components/Engagement";

export default function Phase1NotDone() {
  const young = useSelector((state) => state.Auth.young);

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
              <div className="w-fit space-y-10 md:space-y-12">
                <div className="mt-8 space-y-2 font-bold leading-7">
                  <p className="m-0 text-lg md:text-xl">Votre phase 1 n’est donc pas validée.</p>
                </div>
              </div>
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
              <div className="w-fit space-y-10 md:space-y-12">
                <div className="mt-8 space-y-2 font-bold leading-7">
                  <p className="m-0 text-lg md:text-xl">Votre phase 1 n’est donc pas validée.</p>
                </div>
              </div>
            </div>
            <img src={Img2} alt="" />
          </>
        )}
      </div>
    </>
  );
}
