import React from "react";
import dayjs from "dayjs";
import LongArrow from "../../../../../assets/icons/LongArrow.js";

export default function TravelInfoAlone({ center, cohortDetails }) {
  const ALONE_ARRIVAL_HOUR = "16h";
  const ALONE_DEPARTURE_HOUR = "11h";

  if (!center || !cohortDetails) {
    return <></>;
  }

  return (
    <div className="border-l-4 border-gray-500 flex-none ml-[1rem] px-[1rem] md:ml-[4rem] md:pl-[3rem]">
      <h1 className="text-xl font-bold">Résumé du voyage</h1>
      <p className="text-sm mb-4">Je me rends au centre et en reviens par mes propres moyens.</p>
      <div className="space-y-4 my-2">
        <div>
          <p className="flex gap-2 items-center">
            <strong>Aller</strong>
            <span>
              <LongArrow className="text-gray-500" />
            </span>
          </p>
          <p className="leading-relaxed text-sm">
            <span className="capitalize">{dayjs(cohortDetails.dateStart).locale("fr").format("dddd")}</span>{" "}
            <span>{dayjs(cohortDetails.dateStart).locale("fr").format("D MMMM")}</span> à {ALONE_ARRIVAL_HOUR}
            <br />
            {center.name},
            <br />
            {center.address}
          </p>
        </div>

        <div>
          <p className="flex gap-2 items-center">
            <strong>Retour</strong>
            <span>
              <LongArrow className="text-gray-500 rotate-180" />
            </span>
          </p>
          <p className="leading-relaxed text-sm">
            <span className="capitalize">{dayjs(cohortDetails.dateEnd).locale("fr").format("dddd")}</span> <span>{dayjs(cohortDetails.dateEnd).locale("fr").format("D MMMM")}</span>{" "}
            à {ALONE_DEPARTURE_HOUR}
            <br />
            {center.name},
            <br />
            {center.address}
          </p>
        </div>
      </div>
    </div>
  );
}
