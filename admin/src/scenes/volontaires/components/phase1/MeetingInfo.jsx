import dayjs from "dayjs";
import React from "react";
import { getDepartureDate, getMeetingHour, getReturnDate, getReturnHour } from "snu-lib";

export default function MeetingInfo({ young, session, cohort, selectedPdr }) {
  const departureDate = getDepartureDate(young, session, cohort, selectedPdr);
  const returnDate = getReturnDate(young, session, cohort, selectedPdr);
  const meetingHour = getMeetingHour(selectedPdr);
  const returnHour = getReturnHour(selectedPdr);

  return (
    <div className="mb-2 flex flex-row justify-center gap-6">
      <div className="flex flex-row">
        <div className="flex flex-col items-center justify-center rounded-lg bg-white p-1 px-2 font-bold shadow-sm">
          <div className="capitalize text-orange-600">{dayjs(departureDate).locale("fr").format("MMM")}</div>
          <div className="text-lg text-gray-700">{dayjs(departureDate).locale("fr").format("D")}</div>
        </div>
        <div className="ml-2 flex flex-col items-start justify-center">
          <div className="font-bold text-gray-900">Aller à {meetingHour}</div>
          <div className="text-gray-600 first-letter:capitalize">{dayjs(departureDate).locale("fr").format("dddd D MMMM")}</div>
        </div>
      </div>
      <div className="flex flex-row">
        <div className="flex flex-col items-center justify-center rounded-lg bg-white p-1 px-2 font-bold shadow-sm">
          <div className="capitalize text-orange-600">{dayjs(returnDate).locale("fr").format("MMM")}</div>
          <div className="text-lg text-gray-700">{dayjs(returnDate).locale("fr").format("D")}</div>
        </div>
        <div className="ml-2 flex flex-col items-start justify-center">
          <div className="font-bold text-gray-900">Retour à {returnHour}</div>
          <div className="text-gray-600 first-letter:capitalize">{dayjs(returnDate).locale("fr").format("dddd D MMMM")}</div>
        </div>
      </div>
    </div>
  );
}
