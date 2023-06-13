import React from "react";
import LinearMap from "../../../../../assets/icons/LinearMap";
import Check from "../../../../../assets/icons/Check";
import { BorderButton } from "../../../../../components/buttons/SimpleButtons";

function MeetingPointChooser({ meetingPoint, onChoose, choosed, expired }) {
  const completeAddress = meetingPoint.address + " " + meetingPoint.zip + " " + meetingPoint.city;

  return (
    <div className="flex flex-col items-center rounded-lg bg-gray-50 p-4">
      <LinearMap />
      <div className="mt-3 text-center text-base font-bold text-[#242526]">{meetingPoint.name}</div>
      <div className="mt-1 flex-1 text-center text-sm text-gray-800 underline">{completeAddress}</div>
      <div className="mt-1 flex-1 text-center text-sm text-gray-500">N° de transport : {meetingPoint.busLineName}</div>
      <div className="my-4 h-[1px] w-[66px] bg-gray-200" />
      <div className="mb-8 flex items-center">
        <Schedule type="Aller" className="mr-4">
          {meetingPoint.meetingHour}
        </Schedule>
        <Schedule type="Retour">{meetingPoint.returnHour}</Schedule>
      </div>
      {choosed ? (
        <div className="flex items-center rounded-[10px] border-[1px]  border-blue-600 bg-blue-600 py-2.5 px-3 text-sm font-medium text-[#FFFFFF]">
          <Check className="mr-2" />
          Choisi
        </div>
      ) : expired ? (
        <div className="rounded-[10px] border-[1px] border-gray-300 bg-[#FFFFFF]  py-2.5 px-3 text-sm font-medium text-gray-500">Date limite dépassée</div>
      ) : (
        <BorderButton onClick={onChoose}>Choisir ce point</BorderButton>
      )}
    </div>
  );
}

function Schedule({ type, children, className }) {
  return (
    <div className={`flex items-center ${className}`}>
      <div className="mr-1 text-sm text-gray-500">{type}</div>
      <div className="text-lg font-bold text-[#242526]">{children}</div>
    </div>
  );
}

export default MeetingPointChooser;
