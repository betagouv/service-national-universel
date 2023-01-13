import React, { useEffect, useState } from "react";
import { BsCheck2 } from "react-icons/bs";
import { HiOutlineChevronDown, HiOutlineChevronUp } from "react-icons/hi";
import { getCohortDetail, getMeetingPointChoiceLimitDateForCohort } from "../../../../utils/cohorts";
import dayjs from "dayjs";
import CohortDateSummary from "../../../inscription2023/components/CohortDateSummary";
import Loader from "../../../../components/Loader";
import { capture } from "../../../../sentry";
import api from "../../../../services/api";
import LinearMap from "../../../../assets/icons/LinearMap";
import { BorderButton } from "../../../../components/buttons/SimpleButtons";
import { toastr } from "react-redux-toastr";
import { setYoung } from "../../../../redux/auth/actions";
import { useDispatch } from "react-redux";
import Check from "../../../../assets/icons/Check";

const ALONE_ARRIVAL_HOUR = "16h";
const ALONE_DEPARTURE_HOUR = "11h";

export default function StepPDR({ young, center }) {
  const [valid, setValid] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [opened, setOpened] = useState(false);
  const [pdrChoiceLimitDate, setPdrChoiceLimitDate] = useState("?");
  const [pdrChoiceExpired, setPdrChoiceExpired] = useState(false);
  const [meetingPoints, setMeetingPoints] = useState(null);
  const [error, setError] = useState(null);
  const [choosenMeetingPointAddress, setChoosenMeetingPointAddress] = useState(null);
  const dispatch = useDispatch();

  useEffect(() => {
    if (young) {
      setValid(young.meetingPointId !== null && young.meetingPointId !== undefined);
      setEnabled(true);

      const date = getMeetingPointChoiceLimitDateForCohort(young.cohort);
      if (date) {
        setPdrChoiceLimitDate(dayjs(date).locale("fr").format("D MMMM YYYY"));
        setPdrChoiceExpired(date < new Date());
      } else {
        setPdrChoiceLimitDate("-");
        setPdrChoiceExpired(false);
      }

      loadMeetingPoints();
    }
  }, [young]);

  async function loadMeetingPoints() {
    setMeetingPoints(null);
    setError(null);
    try {
      const result = await api.get(`/point-de-rassemblement/available`);
      if (!result.ok) {
        setError("Nous n'avons pas réussi à charger les points de rassemblements. Veuillez réessayer dans quelques instants.");
      } else {
        setMeetingPoints(result.data);
        if (young.meetingPointId) {
          const mp = result.data.find((mp) => mp._id === young.meetingPointId);
          if (mp) {
            setChoosenMeetingPointAddress(mp.address + " " + mp.zip + " " + mp.city);
          }
        }
      }
    } catch (err) {
      capture(err);
      setError("Nous n'avons pas réussi à charger les points de rassemblements. Veuillez réessayer dans quelques instants.");
    }
  }

  function chooseMeetingPoint(meetingPoint) {
    saveChoice({ meetingPointId: meetingPoint._id });
  }

  function chooseGoAlone() {
    saveChoice({ deplacementPhase1Autonomous: "true" });
  }

  async function saveChoice(choice) {
    try {
      const result = await api.put(`/young/${young._id}/meeting-point`, choice);
      if (result.ok) {
        toastr.success("Votre choix est enregistré");
        dispatch(setYoung(result.data));
        setOpened(false);
      } else {
        toastr.error("Erreur", "Nous n'avons pas pu enregistrer votre choix. Veuillez réessayer dans quelques instants.");
      }
    } catch (err) {
      capture(err);
      toastr.error("Erreur", "Nous n'avons pas pu enregistrer votre choix. Veuillez réessayer dans quelques instants.");
    }
  }

  return (
    <>
      <div className={`hidden md:flex flex-row items-center justify-between ${enabled && "cursor-pointer"}`} onClick={() => setOpened(enabled ? !opened : false)}>
        <div className="flex lex-row py-4 items-center">
          {valid ? (
            <div className="flex items-center justify-center bg-green-500 h-9 w-9 rounded-full mr-4">
              <BsCheck2 className="text-white h-5 w-5" />
            </div>
          ) : (
            <div className="flex items-center justify-center h-9 w-9 rounded-full mr-4 border-[1px] border-gray-200 text-gray-700">1</div>
          )}
          {(young.meetingPointId || young.deplacementPhase1Autonomous === "true") && <LinearMap />}
          <div className="flex flex-1 flex-col mx-3">
            <h1 className={`text-base leading-7 ${enabled ? "text-gray-900" : "text-gray-400"}`}>
              {young.meetingPointId || young.deplacementPhase1Autonomous === "true"
                ? "Lieu de rassemblement"
                : pdrChoiceExpired
                ? "Date limite dépassée"
                : "Confirmez votre point de rassemblement"}
            </h1>
            <p className={`text-sm leading-5 ${enabled ? "text-gray-500" : "text-gray-400"}`}>
              {young.meetingPointId ? (
                <>{choosenMeetingPointAddress}</>
              ) : young.deplacementPhase1Autonomous === "true" ? (
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
        {opened && <CohortDateSummary cohortName={young.cohort} />}
        {enabled ? (
          <div className="flex items-center justify-center bg-gray-100 h-9 w-9 rounded-full hover:scale-110">
            {opened ? <HiOutlineChevronUp className="h-5 w-5" /> : <HiOutlineChevronDown className="h-5 w-5" />}
          </div>
        ) : null}
      </div>
      {opened && (
        <div className="my-12">
          {error && <div className="text-red text-sm text-center my-4">{error}</div>}
          {meetingPoints ? (
            <div className="grid grid-cols-4 gap-4">
              {meetingPoints.map((mp) => (
                <MeetingPointChooser key={mp._id} meetingPoint={mp} onChoose={() => chooseMeetingPoint(mp)} choosed={mp._id === young.meetingPointId} expired={pdrChoiceExpired} />
              ))}
              <MeetingPointGoAlone
                center={center}
                young={young}
                onChoose={chooseGoAlone}
                choosed={!young.meetingPointId && young.deplacementPhase1Autonomous === "true"}
                expired={pdrChoiceExpired}
              />
            </div>
          ) : (
            <div className="flex justify-center">
              <Loader />
            </div>
          )}
        </div>
      )}
    </>
  );
}

function MeetingPointChooser({ meetingPoint, onChoose, choosed, expired }) {
  const completeAddress = meetingPoint.address + " " + meetingPoint.zip + " " + meetingPoint.city;

  return (
    <div className="flex flex-col items-center bg-gray-50 rounded-lg p-4">
      <LinearMap />
      <div className="text-[#242526] text-base font-bold mt-3 text-center">{meetingPoint.name}</div>
      <div className="flex-1 text-gray-800 text-sm mt-1 underline text-center">{completeAddress}</div>
      <div className="w-[66px] h-[1px] bg-gray-200 my-4" />
      <div className="flex items-center mb-8">
        <Schedule type="Aller" className="mr-4">
          {meetingPoint.meetingHour}
        </Schedule>
        <Schedule type="Retour">{meetingPoint.returnHour}</Schedule>
      </div>
      {choosed ? (
        <div className="rounded-[10px] border-[1px] py-2.5 px-3  bg-blue-600 border-blue-600 text-[#FFFFFF] text-sm font-medium flex items-center">
          <Check className="mr-2" />
          Choisi
        </div>
      ) : expired ? (
        <div className="rounded-[10px] border-[1px] py-2.5 px-3  bg-[#FFFFFF] border-gray-300 text-gray-500 text-sm font-medium">Date limite dépassée</div>
      ) : (
        <BorderButton onClick={onChoose}>Choisir ce point</BorderButton>
      )}
    </div>
  );
}

function Schedule({ type, children, className }) {
  return (
    <div className={`flex items-center ${className}`}>
      <div className="text-gray-500 text-sm mr-1">{type}</div>
      <div className="text-[#242526] font-bold text-lg">{children}</div>
    </div>
  );
}

function MeetingPointGoAlone({ center, young, onChoose, choosed, expired }) {
  const [opened, setOpened] = useState(false);
  const [cohort, setCohort] = useState(null);

  useEffect(() => {
    setCohort(getCohortDetail(young.cohort));
  }, [young]);

  useEffect(() => {
    const handleClickOutside = () => {
      setOpened(false);
    };
    document.addEventListener("click", handleClickOutside, true);
    return () => {
      document.removeEventListener("click", handleClickOutside, true);
    };
  }, []);

  function toggleMore() {
    setOpened(!opened);
  }

  return (
    <div className="flex flex-col items-center bg-gray-50 rounded-lg p-4">
      <LinearMap gray />
      <div className="flex-1 text-[#242526] text-base font-bold mt-3 text-center">Je me rends au centre et en revient par mes propres moyens</div>
      <button onClick={toggleMore} className="text-blue-600 font-medium text-xs mt-6 mb-8 hover:underline relative">
        En savoir plus
        {opened && (
          <div className="absolute bg-[#FFFFFF] p-6 shadow rounded-lg top-[100%] right-[-120px] text-left">
            <div className="text-lg text-[#242526] font-bold whitespace-nowrap">Rendez vous directement à votre lieu d’affectation</div>
            <div className="text-sm text-gray-700 whitespace-nowrap">{center.address + " " + center.zip + " " + center.city}</div>
            {cohort && (
              <div className="flex items-center mt-4">
                <CenterSchedule type="Aller" hour={ALONE_ARRIVAL_HOUR} date={cohort.dateStart} className="mr-4" />
                <CenterSchedule type="Retour" hour={ALONE_DEPARTURE_HOUR} date={cohort.dateEnd} />
              </div>
            )}
          </div>
        )}
      </button>
      {choosed ? (
        <div className="rounded-[10px] border-[1px] py-2.5 px-3  bg-blue-600 border-blue-600 text-[#FFFFFF] text-sm font-medium flex items-center">
          <Check className="mr-2" />
          Choisi
        </div>
      ) : expired ? (
        <div className="rounded-[10px] border-[1px] py-2.5 px-3  bg-[#FFFFFF] border-gray-300 text-gray-500 text-sm font-medium">Date limite dépassée</div>
      ) : (
        <BorderButton onClick={onChoose}>Choisir</BorderButton>
      )}
    </div>
  );
}

function CenterSchedule({ type, hour, date, className }) {
  return (
    <div className={`border-l-[3px] border-l-blue-700 border-l-solid pl-3 ${className}`}>
      <div className="text-sm text-gray-800 font-bold">
        {type} à {hour}
      </div>
      <div className="text-sm text-gray-500 mt-2">
        <span className="capitalize">{dayjs(date).locale("fr").format("dddd")}</span> <span>{dayjs(date).locale("fr").format("D MMMM")}</span>
      </div>
    </div>
  );
}
