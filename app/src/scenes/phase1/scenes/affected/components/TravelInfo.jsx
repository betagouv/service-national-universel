import React from "react";
import dayjs from "dayjs";
import LongArrow from "../../../../../assets/icons/LongArrow";
import { useSelector } from "react-redux";
import { getMeetingHour, getReturnHour } from "../../../../../utils/cohorts";

export default function TravelInfo({ location, departureDate, returnDate }) {
  const young = useSelector((state) => state.Auth.young);

  if (!location) {
    return <></>;
  }

  const meetingHour = getMeetingHour(location);
  const returnHour = getReturnHour(location);

  return (
    <div className="p-4 md:ml-10">
      <h1 className="mb-6 text-xl font-bold">Résumé du voyage</h1>
      {!location?.ligneToPoint && (
        <p className="mb-4 text-sm">
          {young.transportInfoGivenByLocal === "true"
            ? "Les informations de transport seront transmises par les services locaux."
            : "Je me rends au centre et en reviens par mes propres moyens."}
        </p>
      )}

      {young?.transportInfoGivenByLocal !== "true" && (
        <div className="space-y-8 border-l-2 border-gray-500 pl-4">
          <div>
            <p className="flex items-center gap-2">
              <strong>Aller</strong>
              <span>
                <LongArrow className="text-gray-500" />
              </span>
            </p>
            <p className="text-sm">
              <span className="capitalize">{dayjs(departureDate).locale("fr").format("dddd")}</span> <span>{dayjs(departureDate).locale("fr").format("D MMMM")}</span> à{" "}
              {meetingHour}
            </p>
            <p className="my-2 rounded-xl bg-gray-100 py-2 px-3 text-sm">
              {location.name},
              <br />
              {location.address}
              <br />
              {location.zip} {location.city}
            </p>
          </div>

          <div>
            <p className="flex items-center gap-2">
              <strong>Retour</strong>
              <span>
                <LongArrow className="rotate-180 text-gray-500" />
              </span>
            </p>
            <p className="max-w-md text-sm leading-relaxed">
              <span className="capitalize">{dayjs(returnDate).locale("fr").format("dddd")}</span> <span>{dayjs(returnDate).locale("fr").format("D MMMM")}</span> à {returnHour}
            </p>
            <p className="my-2 rounded-xl bg-gray-100 py-2 px-3 text-sm">
              {location.name},
              <br />
              {location.address}
              <br />
              {location.zip} {location.city}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
