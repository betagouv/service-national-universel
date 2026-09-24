import React from "react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
dayjs.extend(utc);
import { getMeetingHour, getReturnHour } from "snu-lib";
import { ALONE_ARRIVAL_HOUR, ALONE_DEPARTURE_HOUR } from "../../utils/steps.utils";
import { StepCard } from "../StepCard";
import useAuth from "@/services/useAuth";
import useAffectationInfo from "../../utils/useAffectationInfo";

// Le choix du point de rassemblement par le volontaire n'est plus possible : cette étape affiche le choix existant.
export default function StepPDR() {
  const index = 1;
  const { young, isCLE } = useAuth();
  const { meetingPoint, departureDate, returnDate } = useAffectationInfo();

  function addressOf(mp) {
    if (mp) {
      return mp.address + " " + mp.zip + " " + mp.city;
    } else {
      return null;
    }
  }

  if (isCLE) {
    return (
      <StepCard variant="done" index={index}>
        <p className="font-semibold text-sm">Confirmation du point de rendez-vous : vous n'avez rien à faire</p>
        <p className="leading-tight mt-1 text-sm text-gray-500">Vos informations de transport vers le centre vous seront transmises par votre établissement.</p>
      </StepCard>
    );
  }

  if (young.meetingPointId) {
    return (
      <StepCard variant="done" index={index}>
        <div className="text-sm">
          <p className="font-semibold">Point de rassemblement</p>
          <p className="leading-tight my-2">{addressOf(meetingPoint)}</p>
          <div className="mt-3 grid grid-cols-2 max-w-md">
            <div>
              <p className="font-semibold">Aller à {getMeetingHour(meetingPoint)}</p>
              <p className="capitalize">{dayjs(departureDate).locale("fr").format("dddd D MMMM")}</p>
            </div>
            <div>
              <p className="font-semibold">Retour à {getReturnHour(meetingPoint)}</p>
              <p className="capitalize">{dayjs(returnDate).locale("fr").format("dddd D MMMM")}</p>
            </div>
          </div>
        </div>
      </StepCard>
    );
  }

  if (young.deplacementPhase1Autonomous === "true") {
    return (
      <StepCard variant="done" index={index}>
        <div className="text-sm">
          <p className="font-semibold">Point de rassemblement</p>
          <p className="leading-tight my-2">Je me rends au centre et en reviens par mes propres moyens</p>
          <div className="mt-3 grid grid-cols-2 max-w-md">
            <div>
              <p className="font-semibold">Aller à {ALONE_ARRIVAL_HOUR}</p>
              <p className="capitalize">{dayjs(departureDate).locale("fr").format("dddd D MMMM")}</p>
            </div>
            <div>
              <p className="font-semibold">Retour à {ALONE_DEPARTURE_HOUR}</p>
              <p className="capitalize">{dayjs(returnDate).locale("fr").format("dddd D MMMM")}</p>
            </div>
          </div>
        </div>
      </StepCard>
    );
  }

  if (young.transportInfoGivenByLocal === "true") {
    return (
      <StepCard variant="done" index={index}>
        <p className="font-semibold">Confirmation du point de rendez-vous : vous n'avez rien à faire</p>
        <p className="leading-tight my-2">Vos informations de transport vers le centre vous seront transmises par email.</p>
      </StepCard>
    );
  }

  return (
    <StepCard variant="disabled" index={index}>
      <p className="font-semibold text-gray-500">Point de rassemblement</p>
      <p className="text-sm text-gray-500">Le choix du point de rassemblement n'est plus disponible.</p>
    </StepCard>
  );
}
