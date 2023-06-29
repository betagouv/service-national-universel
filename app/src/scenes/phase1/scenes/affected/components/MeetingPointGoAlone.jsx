import React from "react";
import LinearMap from "../../../../../assets/icons/LinearMap";
import Check from "../../../../../assets/icons/Check";
import dayjs from "dayjs";
import { BorderButton } from "../../../../../components/buttons/SimpleButtons";
import { TRANSPORT_TIMES } from "snu-lib";

function MeetingPointGoAlone({ center, onChoose, chosen, expired, departureDate, returnDate }) {
  return (
    <div className="flex flex-col items-center rounded-lg bg-gray-50 p-3 w-64 gap-1">
      <LinearMap gray="true" />
      <p className="my-2 text-center text-base font-bold text-gray-800 leading-5">Je me rends au centre et en reviens par mes propres moyens</p>

      <p className="text-xs text-gray-500 text-center">{center.name}</p>
      <p className="text-xs text-gray-500">{center.address}</p>
      <p className="text-xs text-gray-500 mb-auto">{center.zip + " " + center.city}</p>

      <hr className="my-3 w-16" />

      <div className="flex text-gray-500 items-center">
        <p className="text-xs">Arrivée &nbsp;</p>
        <p className="text-base text-gray-800">{dayjs(departureDate).locale("fr").format("DD MMMM")} à&nbsp;</p>
        <p className="text-base text-gray-800 font-semibold">{TRANSPORT_TIMES.ALONE_ARRIVAL_HOUR}</p>
      </div>
      <div className="mb-3 flex text-gray-500 items-center">
        <p className="text-xs">Départ &nbsp;</p>
        <p className="text-base text-gray-800">{dayjs(returnDate).locale("fr").format("DD MMMM")} à&nbsp;</p>
        <p className="text-base text-gray-800 font-semibold">{TRANSPORT_TIMES.ALONE_DEPARTURE_HOUR}</p>
      </div>

      {chosen ? (
        <button disabled className="w-full flex items-center justify-center rounded-[10px] border-[1px] border-blue-600 bg-blue-600 py-2.5 px-3 text-xs font-medium text-white">
          <Check className="mr-2" />
          Validé
        </button>
      ) : expired ? (
        <div className="rounded-[10px] border-[1px] border-gray-300 bg-white py-2.5 px-3 text-sm font-medium text-gray-500 w-full text-center">Non disponible</div>
      ) : (
        <BorderButton onClick={onChoose} className="w-full">
          Choisir
        </BorderButton>
      )}
    </div>
  );
}

export default MeetingPointGoAlone;
