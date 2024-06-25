import React from "react";
import { useSelector } from "react-redux";
import { youngCanWithdraw, isCle } from "snu-lib";
import Img3 from "../../assets/homePhase2Desktop.png";
import Img2 from "../../assets/homePhase2Mobile.png";
// import { wasYoungExcluded } from "../../utils";
import Withdrawal from "../account/scenes/withdrawn/components/Withdrawal";
// import Engagement from "./components/Engagement";

export default function Phase1NotDone() {
  const young = useSelector((state) => state.Auth.young);

  return (
    <div className="flex w-full lg:w-fit flex-col-reverse lg:flex-row bg-white lg:rounded-xl lg:m-10 bg-white lg:shadow-md">
      {/* {wasYoungExcluded(young) ? (
        <div className="space-y-10 p-4 lg:m-16">
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
        <> */}
      <div className="sm:px-4 sm:pb-4 lg:px-0 lg:pb-0 lg:my-16 lg:ml-16  ">
        <p className="text-3xl lg:text-5xl font-medium leading-tight tracking-tight text-gray-800">
          <strong>{young.firstName}, </strong> vous n&apos;avez pas réalisé votre séjour de cohésion.
        </p>
        <div className="w-fit space-y-10 md:space-y-12">
          <div className="mt-8 space-y-2 font-bold leading-7">
            <p className="m-0 text-lg md:text-xl">Votre phase 1 n’est donc pas validée.</p>
          </div>
        </div>

        {!isCle(young) && (
          <>
            <div className="flex w-full lg:w-fit flex-col items-stretch">
              <button
                className="mt-4 rounded-[10px] border-[1px] border-blue-600 bg-blue-600 py-2.5 px-3 text-sm font-medium leading-5 text-white hover:bg-white hover:!text-blue-600"
                onClick={() => (window.location.href = "/changer-de-sejour")}>
                Choisir un nouveau séjour
              </button>
            </div>

            {youngCanWithdraw(young) ? (
              <div className="flex w-full lg:w-fit flex-col items-stretch">
                <span className="pt-4 [&>button]:text-blue-600">
                  <Withdrawal young={young} />
                </span>
              </div>
            ) : null}
          </>
        )}
      </div>
      <div className="hidden flex-none xl:block">
        <img className="object-" src={Img3} alt="" />
      </div>
      <img className="lg:hidden" src={Img2} alt="" />
      {/* </>
      )} */}
    </div>
  );
}
