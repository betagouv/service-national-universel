import React, { useCallback, useEffect, useState } from "react";
import { Link, useHistory } from "react-router-dom";
import useAuth from "@/services/useAuth";
import { HiArrowLeft, HiArrowRight } from "react-icons/hi";
import { CohortType, getCohortPeriod, getCohortYear } from "snu-lib";
import plausibleEvent from "@/services/plausible";
import { getAvailableSessions } from "@/services/cohort.service";
import { getCohort } from "@/utils/cohorts";
import { useQuery } from "@tanstack/react-query";
import Loader from "@/components/Loader";

export default function ChangeSejour() {
  const { young } = useAuth();
  const cohort = getCohort(young.cohort);
  const history = useHistory();
  const cohortPeriod = getCohortPeriod(cohort);

  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ["availableSessions", young],
    queryFn: () => getAvailableSessions(young),
    enabled: !!young,
  });
  const onClickEligibilte = async () => {
    plausibleEvent("Phase0/CTA reinscription - home page");
    return history.push("/reinscription");
  };

  if (isLoading) {
    return <Loader />;
  }

  return (
    <>
      <div className="flex flex-col justify-center items-center bg-white pb-12 px-[1rem] md:px-[10rem]">
        <div className="w-full flex items-center justify-between py-4">
          <button onClick={() => history.goBack()} className="flex items-center gap-1 mr-2">
            <HiArrowLeft className="text-xl text-gray-500" />
          </button>
          <h1 className="text-2xl font-bold text-center">Choisir un nouveau séjour</h1>
          <div></div>
        </div>
        <div className="bg-blue-100 text-[#1E40AF] w-fit text-center p-2 rounded-md">
          Vous êtes positionné(e) sur le séjour <span className="font-bold">{cohortPeriod}</span>.
        </div>
        <hr />
        {sessions.length > 0 && (
          <section className="w-full md:w-1/2">
            <h1 className="text-base leading-6 font-bold text-center mt-4"> S'inscrire à un séjour en {getCohortYear(cohort)}</h1>
            <p className="text-sm leading-5 font-normal text-[#6B7280] mt-2 text-center">Séjour auxquels vous êtes éligible :</p>
            {sessions.map((session) => (
              <div key={session._id} className="mt-2 flex py-3 px-2 justify-between rounded-md border border-gray-500 w-full">
                <button className="text-sm leading-5 font-medium capitalize">{getCohortPeriod(session)}</button>
                <HiArrowRight className="text-blue-500 mt-0.5 mr-2" />
              </div>
            ))}

            <p className="text-sm leading-5 font-normal text-[#6B7280] mt-2 text-center underline">Pourquoi je ne vois pas tous les séjour ?</p>
          </section>
        )}

        <section className="flex flex-col justify-center items-center">
          <h1 className="text-base leading-6 font-bold text-center mt-4"> S'inscrire pour 2025</h1>
          <p className="text-sm leading-5 font-normal text-[#6B7280] mt-2 text-center">Mettez à jour vos informations et choisissez un séjour.</p>
          <div className="flex w-full">
            <button
              className="mt-4 w-full rounded-[10px] border-[1px] border-blue-600  bg-blue-600 py-2.5 px-3 text-sm font-medium leading-5 text-white transition duration-150 ease-in-out hover:bg-white hover:!text-blue-600"
              onClick={onClickEligibilte}>
              Vérifier mon éligibilité
            </button>
          </div>
        </section>

        <button className="mt-4 flex py-3 px-2 justify-between rounded-md border border-gray-500 w-full md:w-1/2">
          <p className="text-sm leading-5 font-medium">Aucune Date ne me convient</p>
          <HiArrowRight className="text-blue-500 mt-0.5 mr-2" />
        </button>

        {sessions.length === 0 && (
          <section className="mt-6 rounded-md border border-gray-500">
            <button className="flex py-3 px-2 justify-between items-center w-full md:w-1/2">
              <div className="flex flex-col items-start text-start">
                <p className="text-sm leading-5 font-medium">Être alerté(e) lors de l’ouverture des inscriptions pour les prochains séjours</p>
                <p className="mt-1 text-sm leading-5 font-normal text-[#6B7280]">Vous recevrez un e-mail </p>
              </div>
              <HiArrowRight className="text-blue-500 text-[27px] mt-0.5 mr-2" />
            </button>
            <button className="flex py-3 px-2 justify-between items-center w-full md:w-1/2 border-t border-gray-300">
              <div className="flex flex-col items-start">
                <p className="text-sm leading-5 font-medium">Se désister</p>
                <p className="mt-1 text-sm leading-5 font-normal text-[#6B7280]">Vous ne souhaitez plus participer au séjour</p>
              </div>
              <HiArrowRight className="text-blue-500 mt-0.5 mr-2" />
            </button>
          </section>
        )}
      </div>
    </>
  );
}