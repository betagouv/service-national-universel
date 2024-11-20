import React, { useCallback, useEffect, useState } from "react";
import { Link, useHistory } from "react-router-dom";
import useAuth from "@/services/useAuth";
import { HiArrowLeft, HiArrowRight } from "react-icons/hi";
import { getCohortPeriod, getCohortYear } from "snu-lib";
import plausibleEvent from "@/services/plausible";
import { getAvailableSessions } from "@/services/cohort.service";
import { getCohort } from "@/utils/cohorts";
import { useQuery } from "@tanstack/react-query";
import Loader from "@/components/Loader";
import { supportURL } from "@/config";
import { fetchReInscriptionOpen } from "../../../services/reinscription.service";
import NoSejourSection from "../components/NoSejourSection";

export default function ChangeSejour() {
  const { young } = useAuth();
  const cohort = getCohort(young.cohort);
  const history = useHistory();
  const cohortPeriod = getCohortPeriod(cohort);

  const { data: isReinscriptionOpen, isLoading: isReinscriptionOpenLoading } = useQuery({
    queryKey: ["isReInscriptionOpen"],
    queryFn: fetchReInscriptionOpen,
  });

  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ["availableSessions", young],
    queryFn: () => getAvailableSessions(young),
    enabled: !!young,
  });

  const onClickEligibilte = async () => {
    plausibleEvent("Phase0/CTA reinscription - home page");
    return history.push("/reinscription");
  };

  if (isLoading || isReinscriptionOpenLoading) {
    return <Loader />;
  }

  return (
    <div className="flex flex-col justify-center items-center bg-white pb-12 px-4 md:px-[8rem]">
      <div className="w-full flex items-center justify-between py-4">
        <button onClick={() => history.push("/home")} className="flex items-center gap-1 mr-2">
          <HiArrowLeft className="text-xl text-gray-500" />
        </button>
        <h1 className="text-2xl font-bold text-center">{"Choisir un nouveau séjour"}</h1>
        <div></div>
      </div>
      <div className="bg-blue-100 text-[#1E40AF] w-fit text-center p-2 rounded-md">
        Vous êtes positionné(e) sur le séjour <span className="font-bold">{cohortPeriod}</span>.
      </div>
      <hr />
      {sessions.length > 0 && (
        <section className="w-full flex flex-col md:w-1/2">
          <h1 className="text-base leading-6 font-bold text-center mt-4"> S'inscrire à un séjour en {getCohortYear(cohort)}</h1>
          <p className="text-sm leading-5 font-normal text-[#6B7280] mt-2 text-center">Séjour auxquels vous êtes éligible :</p>
          {sessions.map((session) => (
            <Link to="/changer-de-sejour/motif" key={session._id} className="mt-2 flex py-3 px-2 justify-between rounded-md border border-gray-500 w-full">
              <button className="text-sm leading-5 font-medium capitalize">{getCohortPeriod(session)}</button>
              <HiArrowRight className="text-blue-500 mt-0.5 mr-2" />
            </Link>
          ))}
          <a
            href={supportURL + "/base-de-connaissance/suis-je-eligible-a-un-sejour-de-cohesion"}
            className="text-sm leading-5 font-normal text-[#6B7280] mt-2 text-center underline"
            target="_blank"
            rel="noreferrer">
            Pourquoi je ne vois pas tous les séjours ?
          </a>
        </section>
      )}
      {isReinscriptionOpen === true && (
        <section className="flex flex-col justify-center items-center">
          <h1 className="text-base leading-6 font-bold text-center mt-4"> S'inscrire pour 2025</h1>
          <p className="text-sm leading-5 font-normal text-[#6B7280] mt-2 text-center">Mettez à jour vos informations et choisissez un séjour.</p>
          <div className="flex w-full">
            <button
              className="mt-4 w-full rounded-[10px] border-[1px] border-blue-600 bg-blue-600 py-2.5 px-3 text-sm font-medium leading-5 text-white transition duration-150 ease-in-out hover:bg-white hover:!text-blue-600"
              onClick={onClickEligibilte}>
              Vérifier mon éligibilité
            </button>
          </div>
        </section>
      )}
      {isReinscriptionOpen === true && sessions.length > 0 ? (
        <Link to="/changer-de-sejour/no-date" className="mt-4 flex py-3 px-2 justify-between rounded-md border border-gray-500 w-full md:w-1/2">
          <p className="text-sm leading-5 font-medium">Aucune Date ne me convient</p>
          <HiArrowRight className="text-blue-500 mt-0.5 mr-2" />
        </Link>
      ) : (
        <NoSejourSection />
      )}
    </div>
  );
}
