import React from "react";
import { Link } from "react-router-dom";
import { HiArrowRight } from "react-icons/hi";
import useAuth from "@/services/useAuth";
import { getCohortPeriod } from "snu-lib";
import { getCohort } from "@/utils/cohorts";

const CurrentSejourNotice = () => {
  const { young } = useAuth();
  const cohort = getCohort(young.cohort);
  const cohortPeriod = getCohortPeriod(cohort);

  return (
    <div className="bg-blue-100 text-[#1E40AF] w-fit text-center p-2 rounded-md">
      Vous êtes positionné(e) sur le séjour <span className="font-bold">{cohortPeriod}</span>.
    </div>
  );
};

export default CurrentSejourNotice;
