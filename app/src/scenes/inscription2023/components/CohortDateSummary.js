import React, { useEffect, useState } from "react";
import { getCohortDetail } from "../../../utils/cohorts";
import dayjs from "dayjs";
import Loader from "../../../components/Loader";

export default function CohortDateSummary({ cohortName }) {
  const [cohort, setCohort] = useState();

  useEffect(() => {
    setCohort(getCohortDetail(cohortName));
  }, [cohortName]);

  if (!cohort) {
    return <Loader />;
  }

  return (
    <div className="flex items-center bg-gray-50 rounded-xl py-2 px-3">
      <DateSummary type="Aller" date={cohort.dateStart} className="mr-8" />
      <DateSummary type="Retour" date={cohort.dateEnd} />
    </div>
  );
}

function DateSummary({ date, type, className }) {
  const d = dayjs(date).locale("fr");
  return (
    <div className={`flex items-center ${className}`}>
      <div className="bg-[#FFFFFF] rounded-xl px-2 py-1 shadow mr-2">
        <div className="text-[#EC6316] text-[10px] text-center font-medium uppercase">{d.format("MMM")}</div>
        <div className="text-[#3F444A] text-lg text-center font-bold">{d.format("DD")}</div>
      </div>
      <div className="">
        <div className="text-gray-500 text-sm">{type}</div>
        <div className="text-gray-800 text-lg font-bold">
          <span className="capitalize">{d.format("dddd")}</span> <span>{d.format("D MMMM")}</span>
        </div>
      </div>
    </div>
  );
}
