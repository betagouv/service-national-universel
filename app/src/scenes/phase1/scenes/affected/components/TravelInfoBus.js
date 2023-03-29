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
        <div className="max-w-md">
          <p className="flex gap-2 items-center">
            <strong>Aller</strong>
            <span>
              <LongArrow className="text-gray-500" />
            </span>
          </p>
          <p className="text-sm">
            <span className="capitalize">{dayjs(cohortDetails.dateStart).locale("fr").format("dddd")}</span>{" "}
            <span>{dayjs(cohortDetails.dateStart).locale("fr").format("D MMMM")}</span> à {meetingPoint?.ligneToPoint?.meetingHour}
          </p>
          <p className="text-sm py-2 px-3 my-2 bg-gray-100 rounded-xl">
            {meetingPoint.name},
            <br />
            {meetingPoint.address}
            <br />
            {meetingPoint.zip} {meetingPoint.city}
          </p>
        </div>

        <div className="max-w-md">
          <p className="flex gap-2 items-center">
            <strong>Retour</strong>
            <span>
              <LongArrow className="text-gray-500 rotate-180" />
            </span>
          </p>
          <p className="leading-relaxed text-sm max-w-md">
            <span className="capitalize">{dayjs(cohortDetails.dateEnd).locale("fr").format("dddd")}</span> <span>{dayjs(cohortDetails.dateEnd).locale("fr").format("D MMMM")}</span>{" "}
            à {meetingPoint?.ligneToPoint?.returnHour}
          </p>
          <p className="text-sm py-2 px-3 my-2 bg-gray-100 rounded-xl">
            {meetingPoint.name},
            <br />
            {meetingPoint.address}
            <br />
            {meetingPoint.zip} {meetingPoint.city}
          </p>
        </div>
      </div>
    </div>
  );
}
