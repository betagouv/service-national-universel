import React, { useState } from "react";
import { useSelector } from "react-redux";
import { toastr } from "react-redux-toastr";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
dayjs.extend(utc);
import { capture } from "../../../../../../sentry";
import api from "../../../../../../services/api";
import { getMeetingHour, getReturnHour, isCle } from "snu-lib";
import { ALONE_ARRIVAL_HOUR, ALONE_DEPARTURE_HOUR, pdrChoiceExpired, pdrChoiceLimitDate } from "../../utils/steps.utils";
import { StepCard } from "../StepCard";
import PDRModal from "../modals/PDRModal";
import useAuth from "@/services/useAuth";

export default function StepPDR({ data: { center, session, meetingPoint, departureDate, returnDate } }) {
  const index = 1;
  const { young } = useAuth();
  const [open, setOpen] = useState(false);
  const [meetingPoints, setMeetingPoints] = useState([]);

  async function loadMeetingPoints() {
    try {
      const result = await api.get(`/point-de-rassemblement/available`);
      if (!result.ok) {
        toastr.error("Nous n'avons pas réussi à charger les points de rassemblements.", "Veuillez réessayer dans quelques instants.");
      } else {
        setMeetingPoints(result.data);
      }
    } catch (err) {
      capture(err);
      toastr.error("Nous n'avons pas réussi à charger les points de rassemblements.", "Veuillez réessayer dans quelques instants.");
    }
  }

  function addressOf(mp) {
    if (mp) {
      return mp.address + " " + mp.zip + " " + mp.city;
    } else {
      return null;
    }
  }

  async function handleOpen() {
    await loadMeetingPoints();
    setOpen(!open);
  }

  if (isCle(young)) {
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
        <div className="flex flex-col md:flex-row gap-3 justify-between text-sm">
          <div>
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
          {young.cohort !== "Juillet 2024" ?? (
            <div>
              <button onClick={handleOpen} className="w-full text-sm border hover:bg-gray-100 py-2 px-4 shadow-sm rounded">
                Modifier
              </button>
            </div>
          )}
        </div>
        <PDRModal open={open} setOpen={setOpen} meetingPoints={meetingPoints} center={center} session={session} pdrChoiceExpired={pdrChoiceExpired(young.cohort)} />
      </StepCard>
    );
  }

  if (young.deplacementPhase1Autonomous === "true") {
    return (
      <StepCard variant="done" index={index}>
        <div className="flex flex-col md:flex-row gap-3 justify-between text-sm">
          <div>
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
          {young.cohort !== "Juillet 2024" ?? (
            <div>
              <button onClick={handleOpen} className="w-full text-sm border hover:bg-gray-100 py-2 px-4 shadow-sm rounded">
                Modifier
              </button>
            </div>
          )}
        </div>
        <PDRModal open={open} setOpen={setOpen} meetingPoints={meetingPoints} center={center} session={session} pdrChoiceExpired={pdrChoiceExpired(young.cohort)} />
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

  if (pdrChoiceExpired(young.cohort)) {
    return (
      <StepCard variant="disabled" index={index}>
        <p className="font-semibold text-gray-500">Date de choix dépassée</p>
        <p className="text-sm text-gray-500">Un point de rassemblement va vous être attribué par votre référent SNU</p>
      </StepCard>
    );
  }

  return (
    <StepCard index={index}>
      <div className="flex flex-col md:flex-row gap-3 justify-between">
        <div>
          <p className="font-semibold leading-tight">Confirmez votre point de rassemblement</p>
          <p className="text-sm mt-2 text-gray-500">
            À faire avant le <strong>{pdrChoiceLimitDate(young.cohort)}</strong>.
          </p>
        </div>
        <div>
          <button onClick={handleOpen} className="w-full text-sm text-white bg-blue-600 hover:bg-blue-700 py-2 px-4 rounded">
            Commencer
          </button>
        </div>
      </div>
      <PDRModal open={open} setOpen={setOpen} meetingPoints={meetingPoints} center={center} session={session} pdrChoiceExpired={pdrChoiceExpired(young.cohort)} />
    </StepCard>
  );
}
