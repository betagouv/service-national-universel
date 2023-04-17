import React from "react";
import dayjs from "dayjs";
import LongArrow from "../../../../../assets/icons/LongArrow.js";

export default function TravelInfoBus({ meetingPoint, cohortDetails }) {
  if (!meetingPoint || !cohortDetails) {
    return <></>;
  }

  return (
    <div className="ml-[1rem] flex-none border-l-4 border-gray-500 pl-[1rem] md:ml-[4rem] md:max-w-md md:pl-[3rem]">
      <h1 className="mb-6 text-xl font-bold">Résumé du voyage</h1>
      <div className="my-2 space-y-4">
        <div className="max-w-md">
          <p className="flex items-center gap-2">
            <strong>Aller</strong>
            <span>
              <LongArrow className="text-gray-500" />
            </span>
          </p>
          <p className="text-sm">
            <span className="capitalize">{dayjs(cohortDetails.dateStart).locale("fr").format("dddd")}</span>{" "}
            <span>{dayjs(cohortDetails.dateStart).locale("fr").format("D MMMM")}</span> à {meetingPoint?.ligneToPoint?.meetingHour}
          </p>
          <p className="my-2 rounded-xl bg-gray-100 py-2 px-3 text-sm">
            {meetingPoint.name},
            <br />
            {meetingPoint.address}
            <br />
            {meetingPoint.zip} {meetingPoint.city}
          </p>
        </div>

        <div className="max-w-md">
          <p className="flex items-center gap-2">
            <strong>Retour</strong>
            <span>
              <LongArrow className="rotate-180 text-gray-500" />
            </span>
          </p>
          <p className="max-w-md text-sm leading-relaxed">
            <span className="capitalize">{dayjs(cohortDetails.dateEnd).locale("fr").format("dddd")}</span> <span>{dayjs(cohortDetails.dateEnd).locale("fr").format("D MMMM")}</span>{" "}
            à {meetingPoint?.ligneToPoint?.returnHour}
          </p>
          <p className="my-2 rounded-xl bg-gray-100 py-2 px-3 text-sm">
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
