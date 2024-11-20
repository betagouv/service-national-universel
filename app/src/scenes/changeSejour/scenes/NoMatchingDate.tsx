import React, { useEffect, useState } from "react";
import { Link, useHistory } from "react-router-dom";
import useAuth from "@/services/useAuth";
import { HiArrowLeft } from "react-icons/hi";
import { getCohortPeriod } from "snu-lib";
import { getCohort } from "@/utils/cohorts";
import NoSejourSection from "../components/NoSejourSection";

export default function NoMatchingDate() {
  const { young } = useAuth();
  const cohort = getCohort(young.cohort);
  const history = useHistory();
  const cohortPeriod = getCohortPeriod(cohort);

  return (
    <div className="flex flex-col justify-center items-center bg-white pb-12 px-4 md:px-[8rem]">
      <div className="w-full flex items-center justify-between py-4">
        <button onClick={() => history.push("/changer-de-sejour/")} className="flex items-center gap-1 mr-2">
          <HiArrowLeft className="text-xl text-gray-500" />
        </button>
        <h1 className="text-2xl font-bold text-center">Aucune date ne me convient</h1>
        <div></div>
      </div>
      <div className="bg-blue-100 text-[#1E40AF] w-fit text-center p-2 rounded-md">
        Vous êtes positionné(e) sur le séjour <span className="font-bold">{cohortPeriod}</span>.
      </div>
      <hr />
      <p className="mt-4 text-sm leading-5 text-[#6B7280] font-normal">Faites votre choix</p>
      <NoSejourSection />
    </div>
  );
}
