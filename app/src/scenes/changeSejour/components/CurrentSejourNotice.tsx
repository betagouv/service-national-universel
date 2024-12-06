import React from "react";
import { HiOutlineInformationCircle } from "react-icons/hi";
import useAuth from "@/services/useAuth";
import { getCohortPeriod } from "snu-lib";
import { getCohort } from "@/utils/cohorts";

const CurrentSejourNotice = () => {
  const { young } = useAuth();
  const cohort = getCohort(young.cohort);
  const cohortPeriod = getCohortPeriod(cohort);

  return (
    <div className="bg-blue-50 text-sm text-blue-800 px-3 py-2.5 rounded-md flex gap-2">
      <div className="flex-none">
        <HiOutlineInformationCircle className="text-blue-800 h-5 w-5 " />
      </div>
      <p>
        Vous êtes positionné(e) sur le séjour <strong>{cohortPeriod}</strong>.
      </p>
    </div>
  );
};

export default CurrentSejourNotice;
