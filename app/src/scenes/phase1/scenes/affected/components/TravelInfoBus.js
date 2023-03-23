import React from "react";
import dayjs from "dayjs";
import LongArrow from "../../../../../assets/icons/LongArrow.js";

export default function TravelInfoBus({ meetingPoint, cohortDetails }) {
  if (!meetingPoint || !cohortDetails) {
    return <></>;
  }

  return (
    <div className="border-l-4 border-gray-500 flex-none ml-[1rem] pl-[1rem] md:ml-[4rem] md:pl-[3rem] md:max-w-md">
      <h1 className="text-xl font-bold mb-6">Résumé du voyage</h1>
      <div className="space-y-4 my-2">
        <div>
          <p className="flex gap-2 items-center">
            <strong>Aller</strong>
            <span>
              <LongArrow className="text-gray-500" />
            </span>
          </p>
          <p className="leading-relaxed text-sm max-w-md text-ellipsis overflow-hidden whitespace-nowrap">
            <span className="capitalize">{dayjs(cohortDetails.dateStart).locale("fr").format("dddd")}</span>{" "}
            <span>{dayjs(cohortDetails.dateStart).locale("fr").format("D MMMM")}</span> à {meetingPoint?.ligneToPoint?.meetingHour}
            <br />
            {meetingPoint.name},
            <br />
            {meetingPoint.address}
          </p>
        </div>

        <div>
          <p className="flex gap-2 items-center">
            <strong>Retour</strong>
            <span>
              <LongArrow className="text-gray-500 rotate-180" />
            </span>
          </p>
          <p className="leading-relaxed text-sm max-w-md text-ellipsis overflow-hidden whitespace-nowrap">
            <span className="capitalize">{dayjs(cohortDetails.dateEnd).locale("fr").format("dddd")}</span> <span>{dayjs(cohortDetails.dateEnd).locale("fr").format("D MMMM")}</span>{" "}
            à {meetingPoint?.ligneToPoint?.returnHour}
            <br />
            {meetingPoint.name},
            <br />
            {meetingPoint.address}
          </p>
        </div>
      </div>
    </div>
  );
}
