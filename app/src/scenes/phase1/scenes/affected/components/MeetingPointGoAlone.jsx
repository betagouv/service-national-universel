import React, { useEffect, useState } from "react";
import LinearMap from "../../../../../assets/icons/LinearMap";
import Check from "../../../../../assets/icons/Check";
import dayjs from "dayjs";
import { BorderButton } from "../../../../../components/buttons/SimpleButtons";

function MeetingPointGoAlone({ center, onChoose, choosed, expired, meetingPointsCount, meetingHour, returnHour, departureDate, returnDate }) {
  const [opened, setOpened] = useState(false);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e || !e.target || e.target.getAttribute("id") !== "toggle-button") {
        setOpened(false);
      }
    };
    document.addEventListener("click", handleClickOutside, true);
    return () => {
      document.removeEventListener("click", handleClickOutside, true);
    };
  }, []);

  function toggleMore(e) {
    e.stopPropagation();
    setOpened(!opened);
  }

  return (
    <div className="flex flex-col items-center rounded-lg bg-gray-50 p-4">
      <LinearMap gray="true" />
      <div className="mt-3 flex-1 text-center text-base font-bold text-[#242526]">Je me rends au centre et en reviens par mes propres moyens</div>
      <button onClick={toggleMore} className="relative mt-6 mb-8 text-xs font-medium text-blue-600 md:hover:underline" id="toggle-button">
        {opened ? "Masquer les informations" : "En savoir plus"}
        {opened && (
          <div
            className={`mt-4 text-left md:absolute md:top-[100%] md:mt-0 md:rounded-lg md:bg-[#FFFFFF] md:p-6 md:shadow ${
              meetingPointsCount === 0 ? "md:left-[-70px]" : "md:right-[-120px]"
            }`}>
            <div className="text-sm font-bold text-[#242526] md:whitespace-nowrap md:text-lg">Rendez vous directement à votre lieu d’affectation</div>
            <div className="text-sm text-gray-700 md:whitespace-nowrap">{center.address + " " + center.zip + " " + center.city}</div>
            <div className="mt-4 flex flex-col md:flex-row md:items-center">
              <CenterSchedule type="Aller" hour={meetingHour} date={departureDate} className="mb-[16px] md:mb-0 md:mr-4" />
              <CenterSchedule type="Retour" hour={returnHour} date={returnDate} />
            </div>
          </div>
        )}
      </button>
      {choosed ? (
        <div className="flex items-center rounded-[10px] border-[1px]  border-blue-600 bg-blue-600 py-2.5 px-3 text-sm font-medium text-[#FFFFFF]">
          <Check className="mr-2" />
          Choisi
        </div>
      ) : expired ? (
        <div className="rounded-[10px] border-[1px] border-gray-300 bg-[#FFFFFF]  py-2.5 px-3 text-sm font-medium text-gray-500">Date limite dépassée</div>
      ) : (
        <BorderButton onClick={onChoose}>Choisir</BorderButton>
      )}
    </div>
  );
}

function CenterSchedule({ type, hour, date, className = 0 }) {
  return (
    <div className={`border-l-solid border-l-[3px] border-l-blue-700 pl-3 ${className}`}>
      <div className="text-sm font-bold text-gray-800">
        {type} à {hour}
      </div>
      <div className="mt-2: text-sm text-gray-500">
        <span className="capitalize">{dayjs(date).locale("fr").format("dddd")}</span> <span>{dayjs(date).locale("fr").format("D MMMM")}</span>
      </div>
    </div>
  );
}

export default MeetingPointGoAlone;
