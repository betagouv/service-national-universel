import React from "react";
import dayjs from "dayjs";
import LongArrow from "../../../../../assets/icons/LongArrow.js";
import { ALONE_ARRIVAL_HOUR, ALONE_DEPARTURE_HOUR } from "../utils/steps.utils.js";

export default function TravelInfo({ location, cohortDetails }) {
  if (!location || !cohortDetails) {
    return <></>;
  }

  return (
    <div className="p-4 md:ml-10">
      <h1 className="text-xl font-bold mb-6">Résumé du voyage</h1>
      {!location?.ligneToPoint && <p className="text-sm mb-4">Je me rends au centre et en reviens par mes propres moyens.</p>}

      <div className="pl-4 border-l-2 border-gray-500 space-y-8">
        <div>
          <p className="flex gap-2 items-center">
            <strong>Aller</strong>
            <span>
              <LongArrow className="text-gray-500" />
            </span>
          </p>
          <p className="text-sm">
            <span className="capitalize">{dayjs(cohortDetails.dateStart).locale("fr").format("dddd")}</span>{" "}
            <span>{dayjs(cohortDetails.dateStart).locale("fr").format("D MMMM")}</span> à {location?.ligneToPoint?.meetingHour || ALONE_ARRIVAL_HOUR}
          </p>
          <p className="text-sm py-2 px-3 my-2 bg-gray-100 rounded-xl">
            {location.name},
            <br />
            {location.address}
            <br />
            {location.zip} {location.city}
          </p>
        </div>

        <div>
          <p className="flex gap-2 items-center">
            <strong>Retour</strong>
            <span>
              <LongArrow className="text-gray-500 rotate-180" />
            </span>
          </p>
          <p className="leading-relaxed text-sm max-w-md">
            <span className="capitalize">{dayjs(cohortDetails.dateEnd).locale("fr").format("dddd")}</span> <span>{dayjs(cohortDetails.dateEnd).locale("fr").format("D MMMM")}</span>{" "}
            à {location?.ligneToPoint?.returnHour || ALONE_DEPARTURE_HOUR}
          </p>
          <p className="text-sm py-2 px-3 my-2 bg-gray-100 rounded-xl">
            {location.name},
            <br />
            {location.address}
            <br />
            {location.zip} {location.city}
          </p>
        </div>
      </div>
    </div>
  );
}
