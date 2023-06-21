import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setYoung } from "../../../../../../redux/auth/actions";
import { toastr } from "react-redux-toastr";
import { BsCheck2 } from "react-icons/bs";
import { HiOutlineChevronDown, HiOutlineChevronUp } from "react-icons/hi";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
dayjs.extend(utc);
import { capture } from "../../../../../../sentry";
import api from "../../../../../../services/api";
import { getMeetingHour, getReturnHour } from "snu-lib";
import { getMeetingPointChoiceLimitDateForCohort } from "../../../../../../utils/cohorts";
import { isStepPDRDone } from "../../utils/steps.utils";

import CloseSvg from "../../../../../../assets/Close";
import LinearMap from "../../../../../../assets/icons/LinearMap";
import Loader from "../../../../../../components/Loader";
import MeetingPointChooser from "../MeetingPointChooser";
import MeetingPointConfirmationModal from "../MeetingPointConfirmationModal";
import MeetingPointGoAlone from "../MeetingPointGoAlone";
import Modal from "../../../../../../components/ui/modals/Modal";

export default function StepPDR({ center, meetingPoint, departureDate, returnDate }) {
  const [openedDesktop, setOpenedDesktop] = useState(false);
  const [openedMobile, setOpenedMobile] = useState(false);
  const [meetingPoints, setMeetingPoints] = useState(null);
  const [error, setError] = useState(null);
  const [modalMeetingPoint, setModalMeetingPoint] = useState({ isOpen: false, meetingPoint: null });
  const [loading, setLoading] = useState(false);

  const young = useSelector((state) => state.Auth.young);
  const dispatch = useDispatch();
  const enabled = young ? true : false;
  const valid = isStepPDRDone(young);
  const date = getMeetingPointChoiceLimitDateForCohort(young.cohort);
  const pdrChoiceLimitDate = date ? dayjs(date).locale("fr").format("D MMMM YYYY") : "?";
  const pdrChoiceExpired = date ? dayjs.utc().isAfter(dayjs(date)) : false;
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
        setOpenedDesktop(false);
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

  async function handleOpenDesktop() {
    if (enabled && young.transportInfoGivenByLocal !== "true") {
      await loadMeetingPoints();
      setOpenedDesktop(!openedDesktop);
    } else setOpenedDesktop(false);
  }

  async function handleOpenMobile() {
    if (enabled && young.transportInfoGivenByLocal !== "true") {
      await loadMeetingPoints();
      setOpenedMobile(!openedMobile);
    } else setOpenedMobile(false);
  }

  return (
    <>
      <MeetingPointConfirmationModal
        modalMeetingPoint={modalMeetingPoint}
        setModalMeetingPoint={setModalMeetingPoint}
        chooseGoAlone={chooseGoAlone}
        chooseMeetingPoint={chooseMeetingPoint}
        loading={loading}
      />

      {/* Desktop */}
      <div className={`hidden flex-row items-center justify-between md:flex ${enabled && "cursor-pointer"}`} onClick={handleOpenDesktop}>
        <div className="lex-row flex items-center py-4">
          {valid ? (
            <div className="mr-4 flex h-9 w-9 items-center justify-center rounded-full bg-green-500">
              <BsCheck2 className="h-5 w-5 text-white" />
            </div>
          ) : (
            <div className="mr-4 flex h-9 w-9 items-center justify-center rounded-full border-[1px] border-gray-200 text-gray-700">1</div>
          )}
          {(young.meetingPointId || young.deplacementPhase1Autonomous === "true") && <LinearMap />}
          <div className="mx-3 flex flex-1 flex-col">
            <h1 className={`text-base leading-7 ${enabled ? "text-gray-900" : "text-gray-400"}`}>
              {young.meetingPointId || young.deplacementPhase1Autonomous === "true"
                ? "Lieu de rassemblement"
                : young?.transportInfoGivenByLocal === "true"
                ? "Confirmation du point de rendez-vous : vous n'avez rien à faire"
                : pdrChoiceExpired
                ? "Date limite dépassée"
                : "Confirmez votre point de rassemblement"}
            </h1>
            <p className={`text-sm leading-5 ${enabled ? "text-gray-500" : "text-gray-400"}`}>
              {young.meetingPointId ? (
                <>{addressOf(meetingPoint)}</>
              ) : young.deplacementPhase1Autonomous === "true" ? (
                <>Je me rends au centre et en reviens par mes propres moyens</>
              ) : young.transportInfoGivenByLocal === "true" ? (
                <>Les informations sur les modalités d&apos;acheminement vers le centre et de retour vous seront transmises par e-mail par les services académiques.</>
              ) : pdrChoiceExpired ? (
                <>Un point de rassemblement va vous être attribué par votre référent SNU.</>
              ) : (
                <>
                  A faire avant le <span className="text-bold">{pdrChoiceLimitDate}</span>.
                </>
              )}
            </p>
          </div>
        </div>
        {enabled && young.transportInfoGivenByLocal !== "true" ? (
          <div className="ml-4 flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 hover:scale-110">
            {openedDesktop ? <HiOutlineChevronUp className="h-5 w-5" /> : <HiOutlineChevronDown className="h-5 w-5" />}
          </div>
        ) : null}
      </div>
      {openedDesktop && (
        <div className="mb-8">
          {error && <div className="text-red my-4 text-center text-sm">{error}</div>}
          {meetingPoints ? (
            <div className="flex gap-6">
              {meetingPoints.map((mp) => (
                <MeetingPointChooser
                  key={mp._id}
                  meetingPoint={mp}
                  onChoose={() => setModalMeetingPoint({ isOpen: true, meetingPoint: mp })}
                  chosen={mp._id === young.meetingPointId && mp.busLineId === young.ligneId}
                  expired={pdrChoiceExpired}
                />
              ))}
              <MeetingPointGoAlone
                center={center}
                onChoose={() => setModalMeetingPoint({ isOpen: true })}
                chosen={!young.meetingPointId && young.deplacementPhase1Autonomous === "true"}
                expired={pdrChoiceExpired}
                departureDate={departureDate}
                returnDate={returnDate}
              />
            </div>
          ) : (
            <div className="flex justify-center">
              <Loader />
            </div>
          )}
        </div>
      )}

      {/* Mobile */}
      <div
        className={`relative mb-3 ml-4 flex min-h-[144px] cursor-pointer items-center rounded-xl border-[1px] md:hidden ${
          valid ? "border-green-500 bg-green-50" : !young.meetingPointId || young.deplacementPhase1Autonomous !== "true" ? "border-blue-600" : "bg-white"
        } `}
        onClick={handleOpenMobile}>
        {(young.meetingPointId || young.deplacementPhase1Autonomous === "true") && (
          <LinearMap gray={(!young.meetingPointId).toString()} className="absolute top-[10px] right-[10px]" />
        )}
        <div className="flex w-full -translate-x-5 flex-row items-center">
          {valid ? (
            <div className="mr-4 flex h-9 w-9 items-center justify-center rounded-full bg-green-500">
              <BsCheck2 className="h-5 w-5 text-white" />
            </div>
          ) : (
            <div className="flex h-9 w-9 items-center justify-center rounded-full border-[1px] border-gray-200 bg-white text-gray-700">1</div>
          )}
          <div className="ml-3 mr-8 mt-4 flex  flex-1 flex-col">
            <div className={`text-sm ${valid && "text-green-600"} ${enabled ? "text-gray-900" : "text-gray-400"}`}>
              {young.meetingPointId || young.deplacementPhase1Autonomous === "true"
                ? "Lieu de rassemblement"
                : young?.transportInfoGivenByLocal === "true"
                ? "Confirmation du point de rendez-vous : vous n'avez rien à faire"
                : pdrChoiceExpired
                ? "Date limite dépassée"
                : "Confirmez votre point de rassemblement"}
            </div>
            <div className={` text-sm leading-5 ${valid && "text-green-600 opacity-70"} ${enabled ? "text-gray-500" : "text-gray-400"}`}>
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
      </div>

      <Modal isOpen={openedMobile} onClose={() => setOpenedMobile(false)}>
        <div className="flex mb-3">
          <p className="text-center text-lg font-bold text-gray-900">Confirmez votre point de rassemblement</p>
          <CloseSvg className="hover:cursor-pointer" height={20} width={20} onClick={() => setOpenedMobile(false)} />
        </div>
        {error && <div className="text-red my-4 text-center text-sm">{error}</div>}
        <div className="flex flex-col items-center gap-6">
          {meetingPoints &&
            meetingPoints.map((mp) => (
              <MeetingPointChooser
                key={mp._id}
                meetingPoint={mp}
                onChoose={() => {
                  return setModalMeetingPoint({ isOpen: true, meetingPoint: mp });
                }}
                choosed={mp._id === young.meetingPointId}
                expired={pdrChoiceExpired}
              />
            ))}
          <MeetingPointGoAlone
            center={center}
            young={young}
            onChoose={() => {
              return setModalMeetingPoint({ isOpen: true });
            }}
            choosed={!young.meetingPointId && young.deplacementPhase1Autonomous === "true"}
            expired={pdrChoiceExpired}
          />
        </div>
      </Modal>
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
