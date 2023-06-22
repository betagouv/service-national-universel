import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setYoung } from "../../../../../../redux/auth/actions";
import { toastr } from "react-redux-toastr";
import { BsCheck2 } from "react-icons/bs";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
dayjs.extend(utc);
import { capture } from "../../../../../../sentry";
import api from "../../../../../../services/api";
import { getDepartureDate, getMeetingHour, getReturnDate, getReturnHour } from "snu-lib";
import { getCohort, getMeetingPointChoiceLimitDateForCohort } from "../../../../../../utils/cohorts";
import { isStepPDRDone } from "../../utils/steps.utils";

import CloseSvg from "../../../../../../assets/Close";
import LinearMap from "../../../../../../assets/icons/LinearMap";
import MeetingPointChooser from "../MeetingPointChooser";
import MeetingPointConfirmationModal from "../MeetingPointConfirmationModal";
import MeetingPointGoAlone from "../MeetingPointGoAlone";
import Modal from "../../../../../../components/ui/modals/Modal";

export default function StepPDR({ center, session, meetingPoint, departureDate, returnDate }) {
  const [openedMobile, setOpenedMobile] = useState(false);
  const [meetingPoints, setMeetingPoints] = useState(null);
  const [error, setError] = useState(null);
  const [modalMeetingPoint, setModalMeetingPoint] = useState({ isOpen: false, meetingPoint: null });
  const [loading, setLoading] = useState(false);

  const young = useSelector((state) => state.Auth.young);
  const cohort = getCohort(young.cohort);
  const dispatch = useDispatch();
  const enabled = !young.transportInfoGivenByLocal === "true";
  const valid = isStepPDRDone(young);
  const date = getMeetingPointChoiceLimitDateForCohort(young.cohort);
  const pdrChoiceLimitDate = date ? dayjs(date).locale("fr").format("D MMMM YYYY") : "?";
  const pdrChoiceExpired = date ? dayjs.utc().isAfter(dayjs(date)) : false;
  const goAloneDepartureDate = getDepartureDate(young, session, cohort);
  const goAloneReturnDate = getReturnDate(young, session, cohort);
  const meetingHour = getMeetingHour(meetingPoint);
  const returnHour = getReturnHour(meetingPoint);

  async function loadMeetingPoints() {
    if (meetingPoints?.length) return;
    try {
      const result = await api.get(`/point-de-rassemblement/available`);
      if (!result.ok) {
        setError("Nous n'avons pas réussi à charger les points de rassemblements. Veuillez réessayer dans quelques instants.");
      } else {
        setMeetingPoints(result.data);
      }
    } catch (err) {
      capture(err);
      setError("Nous n'avons pas réussi à charger les points de rassemblements. Veuillez réessayer dans quelques instants.");
    }
  }

  function addressOf(mp) {
    if (mp) {
      return mp.address + " " + mp.zip + " " + mp.city;
    } else {
      return null;
    }
  }

  function chooseMeetingPoint(meetingPoint) {
    saveChoice({ meetingPointId: meetingPoint._id, ligneId: meetingPoint.busLineId });
  }

  function chooseGoAlone() {
    saveChoice({ deplacementPhase1Autonomous: "true" });
  }

  async function saveChoice(choice) {
    try {
      setLoading(true);
      const result = await api.put(`/young/${young._id}/point-de-rassemblement`, choice);
      if (result.ok) {
        toastr.success("Votre choix est enregistré");
        dispatch(setYoung(result.data));
        setOpenedMobile(false);
      } else {
        toastr.error("Erreur", "Nous n'avons pas pu enregistrer votre choix. Veuillez réessayer dans quelques instants.");
      }
      setLoading(false);
      setModalMeetingPoint({ isOpen: false, meetingPoint: null });
    } catch (err) {
      setLoading(false);
      setModalMeetingPoint({ isOpen: false, meetingPoint: null });
      capture(err);
      toastr.error("Erreur", "Nous n'avons pas pu enregistrer votre choix. Veuillez réessayer dans quelques instants.");
    }
  }

  async function handleOpenMobile() {
    console.log("wesh");
    if (enabled && young.transportInfoGivenByLocal !== "true") {
      console.log("yo");
      await loadMeetingPoints();
      setOpenedMobile(!openedMobile);
    } else setOpenedMobile(false);
  }

  return (
    <>
      <input type="checkbox" className="hidden" checked={valid} readOnly />

      {valid ? (
        <button className="relative mb-3 ml-4 flex min-h-[144px] items-center rounded-xl border-[1px] border-emerald-500 bg-emerald-50" onClick={handleOpenMobile}>
          {(young.meetingPointId || young.deplacementPhase1Autonomous === "true") && (
            <LinearMap gray={(!young.meetingPointId).toString()} className="absolute top-[10px] right-[10px]" />
          )}
          <div className="flex w-full -translate-x-5 flex-row items-center">
            <div className="mr-4 flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500">
              <BsCheck2 className="h-5 w-5 text-white" />
            </div>
            <div className="ml-3 mr-8 mt-4 flex-1 text-left">
              <div className="text-sm text-emerald-600">
                {young?.transportInfoGivenByLocal === "true" ? "Confirmation du point de rendez-vous : vous n'avez rien à faire" : "Lieu de rassemblement"}
              </div>
              <div className={` text-sm leading-5 ${valid && "text-emerald-600 opacity-70"} ${enabled ? "text-gray-500" : "text-gray-400"}`}>
                {young.meetingPointId ? (
                  <>
                    <div>{addressOf(meetingPoint)}</div>
                    <MobileDateDetail departureDate={departureDate} returnDate={returnDate} startHour={meetingHour} returnHour={returnHour} />
                  </>
                ) : young.deplacementPhase1Autonomous === "true" ? (
                  <>
                    <div>Je me rends au centre et en reviens par mes propres moyens</div>
                    <MobileDateDetail departureDate={departureDate} returnDate={returnDate} startHour={meetingHour} returnHour={returnHour} />
                  </>
                ) : young.transportInfoGivenByLocal === "true" ? (
                  <>Les informations sur les modalités d&apos;acheminement vers le centre et de retour vous seront transmises par e-mail par les services académiques.</>
                ) : pdrChoiceExpired ? (
                  <>Un point de rassemblement va vous être attribué par votre référent SNU.</>
                ) : (
                  <>
                    A faire avant le <span className="text-bold">{pdrChoiceLimitDate}</span>.
                  </>
                )}
              </div>
              {!valid && enabled ? <div className="mt-2 text-right text-sm leading-5 text-blue-600">Commencer</div> : null}
            </div>
          </div>
        </button>
      ) : (
        <button
          disabled={!enabled}
          className="relative mb-3 ml-4 flex min-h-[144px] items-center rounded-xl border-[1px] border-blue-600 disabled:border-gray-200"
          onClick={handleOpenMobile}>
          <div className="flex w-full -translate-x-5 flex-row items-center">
            <div className="flex h-9 w-9 items-center justify-center rounded-full border-[1px] border-gray-200 bg-white text-gray-700">1</div>

            <div className="ml-3 mr-8 mt-4 flex-1 text-left">
              <div className="text-sm text-gray-900 disabled:text-gray-400">{pdrChoiceExpired ? "Date limite dépassée" : "Confirmez votre point de rassemblement"}</div>
              <div className="text-sm leading-5 text-gray-500 disabled:text-gray-400">
                {young.transportInfoGivenByLocal === "true" ? (
                  <>Les informations sur les modalités d&apos;acheminement vers le centre et de retour vous seront transmises par e-mail par les services académiques.</>
                ) : pdrChoiceExpired ? (
                  <>Un point de rassemblement va vous être attribué par votre référent SNU.</>
                ) : (
                  <>
                    A faire avant le <span className="text-bold">{pdrChoiceLimitDate}</span>.
                  </>
                )}
              </div>
              {enabled ? <div className="mt-2 text-right text-sm leading-5 text-blue-600">Commencer</div> : null}
            </div>
          </div>
        </button>
      )}

      <Modal isOpen={openedMobile} onClose={() => setOpenedMobile(false)} className="w-auto bg-white p-8 rounded">
        <CloseSvg className="ml-auto hover:cursor-pointer" height={16} width={16} onClick={() => setOpenedMobile(false)} />
        <h2 className="text-center text-lg font-bold text-gray-800 mb-4">Confirmez votre point de rassemblement</h2>
        {error && <div className="text-red my-4 text-center text-sm">{error}</div>}
        <div className="flex flex-col md:flex-row items-center gap-6">
          {meetingPoints &&
            meetingPoints.map((mp) => (
              <MeetingPointChooser
                key={mp._id}
                meetingPoint={mp}
                onChoose={() => {
                  return setModalMeetingPoint({ isOpen: true, meetingPoint: mp });
                }}
                chosen={mp._id === young.meetingPointId}
                expired={pdrChoiceExpired}
              />
            ))}
          <MeetingPointGoAlone
            center={center}
            young={young}
            onChoose={() => {
              return setModalMeetingPoint({ isOpen: true });
            }}
            chosen={!young.meetingPointId && young.deplacementPhase1Autonomous === "true"}
            expired={pdrChoiceExpired}
            departureDate={goAloneDepartureDate}
            returnDate={goAloneReturnDate}
          />
        </div>
      </Modal>

      <MeetingPointConfirmationModal
        modalMeetingPoint={modalMeetingPoint}
        setModalMeetingPoint={setModalMeetingPoint}
        chooseGoAlone={chooseGoAlone}
        chooseMeetingPoint={chooseMeetingPoint}
        loading={loading}
      />
    </>
  );
}

function MobileDateDetail({ departureDate, returnDate, startHour, returnHour }) {
  return (
    <div className="my-3 grid grid-cols-2 gap-2">
      <div className="">
        <div className="font-bold">Aller à {startHour}</div>
        <div className="text-xs">
          <span className="capitalize">{dayjs(departureDate).locale("fr").format("dddd D MMMM")}</span>
        </div>
      </div>
      <div className="">
        <div className="font-bold">Retour à {returnHour}</div>
        <div className="text-xs">
          <span className="capitalize">{dayjs(returnDate).locale("fr").format("dddd D MMMM")}</span>
        </div>
      </div>
    </div>
  );
}
