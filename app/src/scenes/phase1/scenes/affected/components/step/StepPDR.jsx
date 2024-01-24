import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setYoung } from "../../../../../../redux/auth/actions";
import { toastr } from "react-redux-toastr";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
dayjs.extend(utc);
import { capture } from "../../../../../../sentry";
import api from "../../../../../../services/api";
import { getDepartureDate, getMeetingHour, getReturnDate, getReturnHour } from "snu-lib";
import { getCohort, getMeetingPointChoiceLimitDateForCohort } from "../../../../../../utils/cohorts";
import { ALONE_ARRIVAL_HOUR, ALONE_DEPARTURE_HOUR, isStepPDRDone } from "../../utils/steps.utils";

import CloseSvg from "../../../../../../assets/Close";
import MeetingPointChooser from "../MeetingPointChooser";
import MeetingPointConfirmationModal from "../MeetingPointConfirmationModal";
import MeetingPointGoAlone from "../MeetingPointGoAlone";
import Modal from "../../../../../../components/ui/modals/Modal";
import { StepCard } from "../StepCard";

export default function StepPDR({ center, session, meetingPoint, departureDate, returnDate }) {
  const [open, setOpen] = useState(false);
  const [meetingPoints, setMeetingPoints] = useState(null);

  const young = useSelector((state) => state.Auth.young);
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

  function renderStep() {
    // if (pdrChoiceExpired) return <Disabled />;
    // if (isStepPDRDone(young)) return <Done />;
    return <Todo />;
  }

  return (
    <>
      <Step1Modal open={open} setOpen={setOpen} meetingPoints={meetingPoints} center={center} session={session} pdrChoiceExpired={pdrChoiceExpired} />
      {renderStep()}
    </>
  );

  function Disabled() {
    return (
      <StepCard state="disabled" stepNumber={1}>
        <p className="font-semibold text-gray-500">Date de choix dépassée</p>
        <p className="text-sm text-gray-500">Un point de rassemblement va vous être attribué par votre référent SNU</p>
      </StepCard>
    );
  }

  function Done() {
    if (young.meetingPointId) {
      return (
        <StepCard state="done" stepNumber={1}>
          <div className="flex flex-col md:flex-row gap-3 justify-between">
            <div>
              <p className="font-semibold">Lieu de rassemblement</p>
              <p className="leading-tight my-2">{addressOf(meetingPoint)}</p>
              <div className="mt-3 grid grid-cols-2 max-w-md">
                <div>
                  <p className="font-semibold">Aller à {meetingHour}</p>
                  <p className="capitalize">{dayjs(departureDate).locale("fr").format("dddd D MMMM")}</p>
                </div>
                <div>
                  <p className="font-semibold">Retour à {returnHour}</p>
                  <p className="capitalize">{dayjs(returnDate).locale("fr").format("dddd D MMMM")}</p>
                </div>
              </div>
            </div>
            <div>
              <button onClick={handleOpen} className="w-full text-sm border hover:bg-gray-100 py-2 px-4 shadow-sm rounded">
                Modifier
              </button>
            </div>
          </div>
        </StepCard>
      );
    }

    if (young.deplacementPhase1Autonomous === "true") {
      return (
        <StepCard state="done" stepNumber={1}>
          <p className="font-semibold">Lieu de rassemblement</p>
          <p className="leading-tight my-2">Je me rends au centre et en reviens par mes propres moyens</p>
          <div className="my-3 grid grid-cols-2 max-w-md">
            <div>
              <p className="font-semibold">Aller à {ALONE_ARRIVAL_HOUR}</p>
              <p className="capitalize">{dayjs(departureDate).locale("fr").format("dddd D MMMM")}</p>
            </div>
            <div>
              <p className="font-semibold">Retour à {ALONE_DEPARTURE_HOUR}</p>
              <p className="capitalize">{dayjs(returnDate).locale("fr").format("dddd D MMMM")}</p>
            </div>
          </div>
          <button onClick={handleOpen} className="w-full text-sm border hover:bg-gray-100 py-2 px-4 shadow-sm rounded">
            Modifier
          </button>
        </StepCard>
      );
    }

    if (young.transportInfoGivenByLocal === "true") {
      return (
        <StepCard state="done" stepNumber={1}>
          <p className="font-semibold">Confirmation du point de rendez-vous : vous n'avez rien à faire</p>
          <p className="leading-tight my-2">Vos informations de transports vers le centre vous seront transmises par email.</p>
        </StepCard>
      );
    }
  }

  function Todo() {
    return (
      <StepCard state="todo" stepNumber={1}>
        <div className="flex flex-col md:flex-row gap-3 justify-between">
          <div>
            <p className="font-semibold leading-tight">Confirmez votre point de rassemblement</p>
            <p className="text-sm mt-2 text-gray-500">
              À faire avant le <strong>{pdrChoiceLimitDate}</strong>.
            </p>
          </div>
          <div>
            <button onClick={handleOpen} className="w-full text-sm text-white bg-blue-600 hover:bg-blue-700 py-2 px-4 rounded">
              Commencer
            </button>
          </div>
        </div>
      </StepCard>
    );
  }
}

function Step1Modal({ open, setOpen, meetingPoints, center, session, pdrChoiceExpired }) {
  const young = useSelector((state) => state.Auth.young);
  const cohort = getCohort(young.cohort);
  const dispatch = useDispatch();
  const [modalMeetingPoint, setModalMeetingPoint] = useState({ isOpen: false, meetingPoint: null });
  const [loading, setLoading] = useState(false);

  const goAloneDepartureDate = getDepartureDate(young, session, cohort);
  const goAloneReturnDate = getReturnDate(young, session, cohort);

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
        setOpen(false);
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

  return (
    <Modal isOpen={open} onClose={() => setOpen(false)}>
      <div className="flex justify-between mb-3">
        <p className="text-center text-lg font-bold text-gray-900">Confirmez votre point de rassemblement</p>
        <CloseSvg className="hover:cursor-pointer" height={20} width={20} onClick={() => setOpen(false)} />
      </div>
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

      <MeetingPointConfirmationModal
        modalMeetingPoint={modalMeetingPoint}
        setModalMeetingPoint={setModalMeetingPoint}
        chooseGoAlone={chooseGoAlone}
        chooseMeetingPoint={chooseMeetingPoint}
        loading={loading}
      />
    </Modal>
  );
}
