import React from "react";
import { HiOutlineInformationCircle } from "react-icons/hi";
import useAuth from "@/services/useAuth";
import { YOUNG_STATUS } from "snu-lib";
import useCohort from "@/services/useCohort";

const CurrentSejourNotice = () => {
  const { young } = useAuth();
  const { cohortDateString, isCohortDone } = useCohort();

  const text =
    young.status === YOUNG_STATUS.WITHDRAWN ? (
      <p>Vous vous êtes désisté(e) 🥲</p>
    ) : young.status === YOUNG_STATUS.ABANDONED ? (
      <p>Vous avez abandonné votre inscription 🥲</p>
    ) : isCohortDone ? (
      <p>
        Vous étiez positionné(e) sur le séjour <strong>{cohortDateString}</strong>.
      </p>
    ) : (
      <p>
        Vous êtes positionné(e) sur le séjour <strong>{cohortDateString}</strong>.
      </p>
    );

  return (
    <div className="bg-blue-50 text-sm text-blue-800 px-3 py-2.5 rounded-md flex gap-2">
      <div className="flex-none">
        <HiOutlineInformationCircle className="text-blue-800 h-5 w-5 " />
      </div>
      {text}
    </div>
  );
};

export default CurrentSejourNotice;
