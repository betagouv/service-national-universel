import React from "react";
import LinearMap from "../../../../../assets/icons/LinearMap";
import Check from "../../../../../assets/icons/Check";
import { BorderButton } from "../../../../../components/buttons/SimpleButtons";
import dayjs from "dayjs";

function MeetingPointChooser({ meetingPoint, onChoose, chosen, expired }) {
  return (
    <div className="flex flex-col items-center rounded-lg bg-gray-50 p-4 w-64">
      <LinearMap />
      <p className="my-2 text-center text-base font-bold text-gray-800">{meetingPoint.name}</p>
      <p className="text-center text-xs text-gray-500">
        {meetingPoint.address}
        <br />
        {meetingPoint.zip + " " + meetingPoint.city}
      </p>
      <p className="mt-3 text-center text-xs text-gray-500">N° de transport : {meetingPoint.busLineName}</p>

      <hr className="my-3 w-16" />

      <div className="flex text-gray-500 items-center">
        <p className="text-xs">Aller &nbsp;</p>
        <p className="text-base text-gray-800">{dayjs(meetingPoint.departuredDate).locale("fr").format("DD MMMM")} à&nbsp;</p>
        <p className="text-base text-gray-800 font-semibold">{meetingPoint.meetingHour}</p>
      </div>
      <div className="mb-3 flex text-gray-500 items-center">
        <p className="text-xs">Retour &nbsp;</p>
        <p className="text-base text-gray-800">{dayjs(meetingPoint.returnDate).locale("fr").format("DD MMMM")} à&nbsp;</p>
        <p className="text-base text-gray-800 font-semibold">{meetingPoint.returnHour}</p>
      </div>

      {chosen ? (
        <button disabled className="flex items-center rounded border-[1px] border-blue-600 bg-blue-600 py-2.5 px-3 text-sm font-medium text-white">
          <Check className="mr-2" />
          Choisi
        </button>
      ) : expired ? (
        <div className="rounded-lg border-[1px] border-gray-300 bg-white  py-2.5 px-3 text-sm font-medium text-gray-500">Date limite dépassée</div>
      ) : (
        <BorderButton onClick={onChoose}>Choisir ce point</BorderButton>
      )}
    </div>
  );
}

export default MeetingPointChooser;
