import React from "react";
import dayjs from "dayjs";
import LongArrow from "../../../../../assets/icons/LongArrow";
import useAuth from "@/services/useAuth";
import useAffectationInfo from "../utils/useAffectationInfo";
import { getMeetingHour, getReturnHour } from "snu-lib";

export default function TravelInfo() {
  const { young, isCLE } = useAuth();
  const { meetingPoint, center, departureDate, returnDate } = useAffectationInfo();

  if (!location) {
    return <></>;
  }

  const meetingHour = getMeetingHour(location);
  const returnHour = getReturnHour(location);
  const location = young?.meetingPointId ? meetingPoint : center;

  return (
    <div className="p-4 md:ml-10">
      <h1 className="mb-6 text-xl font-bold">Résumé du voyage</h1>

      {isCLE && <p className="mb-4 text-sm">Vos informations de transport vous seront transmises par votre établissement.</p>}

      {!isCLE && !location?.ligneToPoint && (
        <p className="mb-4 text-sm">
          {young.transportInfoGivenByLocal === "true"
            ? "Vos informations de transport vous seront transmises par email."
            : "Je me rends au centre et en reviens par mes propres moyens."}
        </p>
      )}

      {young?.transportInfoGivenByLocal !== "true" && (
        <div className="space-y-8">
          <div>
            <p className="flex items-center gap-2">
              <strong>Aller</strong>
              <span>
                <LongArrow className="text-gray-500" />
              </span>
            </p>
            <p className="text-sm">
              <span className="capitalize">{dayjs(departureDate).locale("fr").format("dddd")}</span> <span>{dayjs(departureDate).locale("fr").format("D MMMM")}</span>
              {!isCLE && ` à ${meetingHour}`}
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
              <span className="capitalize">{dayjs(returnDate).locale("fr").format("dddd")}</span> <span>{dayjs(returnDate).locale("fr").format("D MMMM")}</span>
              {!isCLE && ` à ${returnHour}`}
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
