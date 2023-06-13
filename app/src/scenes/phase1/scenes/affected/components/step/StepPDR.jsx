import React, { useEffect, useState } from "react";
import { BsCheck2 } from "react-icons/bs";
import { HiOutlineChevronDown, HiOutlineChevronUp } from "react-icons/hi";
import { getCohortDetail, getMeetingPointChoiceLimitDateForCohort } from "../../../../../../utils/cohorts";
import { ALONE_ARRIVAL_HOUR, ALONE_DEPARTURE_HOUR, isStepPDRDone } from "../../utils/steps.utils";
import dayjs from "dayjs";
const utc = require("dayjs/plugin/utc");
dayjs.extend(utc);
import CohortDateSummary from "../../../../../inscription2023/components/CohortDateSummary";
import Loader from "../../../../../../components/Loader";
import { capture } from "../../../../../../sentry";
import api from "../../../../../../services/api";
import LinearMap from "../../../../../../assets/icons/LinearMap";
import { BorderButton } from "../../../../../../components/buttons/SimpleButtons";
import { toastr } from "react-redux-toastr";
import { setYoung } from "../../../../../../redux/auth/actions";
import { useDispatch, useSelector } from "react-redux";
import Check from "../../../../../../assets/icons/Check";
import CloseSvg from "../../../../../../assets/Close";
import { ModalContainer } from "../../../../../../components/modals/Modal";
import { Modal } from "reactstrap";

import ConfirmationModal from "../../../../components/modals/ConfirmationModal";
import Warning from "../../../../../../assets/icons/Warning";

export default function StepPDR({ center }) {
  const young = useSelector((state) => state.Auth.young);
  const dispatch = useDispatch();

  const [openedDesktop, setOpenedDesktop] = useState(false);
  const [openedMobile, setOpenedMobile] = useState(false);
  const [meetingPoints, setMeetingPoints] = useState(null);
  const [error, setError] = useState(null);
  const [choosenMeetingPoint, setChoosenMeetingPoint] = useState(null);
  const [modalMeetingPoint, setModalMeetingPoint] = useState({ isOpen: false, meetingPoint: null });
  const [loading, setLoading] = useState(false);

  const cohort = young ? young.cohort : null;
  const enabled = young ? true : false;
  const valid = isStepPDRDone(young);
  const date = getMeetingPointChoiceLimitDateForCohort(young.cohort);
  const pdrChoiceLimitDate = date ? dayjs(date).locale("fr").format("D MMMM YYYY") : "?";
  const pdrChoiceExpired = date ? dayjs.utc().isAfter(dayjs(date)) : false;

  useEffect(() => {
    if (young && !meetingPoints) {
      loadMeetingPoints();
    }
  }, [young]);

  async function loadMeetingPoints() {
    try {
      const result = await api.get(`/point-de-rassemblement/available`);
      if (!result.ok) {
        setError("Nous n'avons pas réussi à charger les points de rassemblements. Veuillez réessayer dans quelques instants.");
      } else {
        setMeetingPoints(result.data);
        if (young.meetingPointId) {
          const mp = result.data.find((mp) => mp._id === young.meetingPointId);
          if (mp) {
            setChoosenMeetingPoint(mp);
          }
        }
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

  return (
    <>
      <ConfirmationModal
        isOpen={modalMeetingPoint?.isOpen}
        loading={loading}
        icon={<Warning className="h-[36px] w-[36px] text-[#D1D5DB]" />}
        title={"Changement de PDR"}
        confirmText="Confirmer le changement"
        onCancel={() => setModalMeetingPoint({ isOpen: false, meetingPoint: null })}
        onConfirm={() => {
          if (modalMeetingPoint.meetingPoint) return chooseMeetingPoint(modalMeetingPoint.meetingPoint);
          return chooseGoAlone();
        }}>
        <div className="my-2 mt-[8px] flex  flex-col gap-2 text-center text-[14px] leading-[20px] text-gray-900">
          {modalMeetingPoint.meetingPoint ? (
            <>
              <div>Vous vous apprêtez à changer votre point de rassemblement, souhaitez-vous confirmer cette action ? </div>
              <div>
                Après avoir cliquer sur &apos;<i>Confirmer le changement</i>&apos;, nous vous invitons à télécharger votre convocation qui a été mise à jour.
              </div>
            </>
          ) : (
            <>
              <div> Vous vous apprêtez à choisir de vous rendre seul au centre, souhaitez-vous confirmer cette action ? </div>
              <div>Après avoir cliquer sur &apos;Confirmer le changement&apos;, nous vous invitons à télécharger votre convocation qui a été mise à jour.</div>
            </>
          )}
          {modalMeetingPoint.meetingPoint ? (
            <div>
              <div>Nouveau point de rassemblement :</div>
              <div className="text-[#6B7280]">{modalMeetingPoint.meetingPoint.name + ", " + addressOf(modalMeetingPoint.meetingPoint)} </div>
            </div>
          ) : null}
        </div>
      </ConfirmationModal>

      {/* Desktop */}
      <div
        className={`hidden flex-row items-center justify-between md:flex ${enabled && "cursor-pointer"}`}
        onClick={() => setOpenedDesktop(enabled && young.transportInfoGivenByLocal !== "true" ? !openedDesktop : false)}>
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
                <>{addressOf(choosenMeetingPoint)}</>
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
        {openedDesktop && <CohortDateSummary cohortName={young.cohort} choosenMeetingPoint={choosenMeetingPoint} className="ml-4" />}
        {enabled && young.transportInfoGivenByLocal !== "true" ? (
          <div className="ml-4 flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 hover:scale-110">
            {openedDesktop ? <HiOutlineChevronUp className="h-5 w-5" /> : <HiOutlineChevronDown className="h-5 w-5" />}
          </div>
        ) : null}
      </div>
      {openedDesktop && (
        <div className="my-12">
          {error && <div className="text-red my-4 text-center text-sm">{error}</div>}
          {meetingPoints ? (
            <div className="grid grid-cols-4 gap-4">
              {meetingPoints.map((mp) => (
                <MeetingPointChooser
                  key={mp._id}
                  meetingPoint={mp}
                  onChoose={() => {
                    return setModalMeetingPoint({ isOpen: true, meetingPoint: mp });
                  }}
                  choosed={mp._id === young.meetingPointId && mp.busLineId === young.ligneId}
                  expired={pdrChoiceExpired}
                />
              ))}
              <MeetingPointGoAloneDesktop
                center={center}
                young={young}
                onChoose={() => {
                  return setModalMeetingPoint({ isOpen: true });
                }}
                choosed={!young.meetingPointId && young.deplacementPhase1Autonomous === "true"}
                expired={pdrChoiceExpired}
                meetingPointsCount={meetingPoints.length}
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
        onClick={() => setOpenedMobile(enabled && young.transportInfoGivenByLocal !== "true" ? !openedMobile : false)}>
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
                  <div>{addressOf(choosenMeetingPoint)}</div>
                  {cohort && choosenMeetingPoint && <MobileDateDetail startHour={choosenMeetingPoint.meetingHour} returnHour={choosenMeetingPoint.returnHour} cohort={cohort} />}
                </>
              ) : young.deplacementPhase1Autonomous === "true" ? (
                <>
                  <div>Je me rends au centre et en reviens par mes propres moyens</div>
                  {cohort && <MobileDateDetail startHour={ALONE_ARRIVAL_HOUR} returnHour={ALONE_DEPARTURE_HOUR} cohort={cohort} />}
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
      {openedMobile && (
        <Modal centered isOpen={true} toggle={() => setOpenedMobile(false)} size="xl">
          <ModalContainer>
            <CloseSvg className="close-icon hover:cursor-pointer" height={10} width={10} onClick={() => setOpenedMobile(false)} />
            <div className="w-full p-12 md:p-4">
              <div className="mb-3 text-center text-lg font-bold text-gray-900">Confirmez votre point de rassemblement</div>
              <CohortDateSummary cohortName={young.cohort} className="mb-4" />
              {error && <div className="text-red my-4 text-center text-sm">{error}</div>}
              {meetingPoints ? (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                  {meetingPoints.map((mp) => (
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
                  <MeetingPointGoAloneMobile
                    center={center}
                    young={young}
                    onChoose={() => {
                      return setModalMeetingPoint({ isOpen: true });
                    }}
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
          </ModalContainer>
        </Modal>
      )}
    </>
  );
}

function MobileDateDetail({ startHour, returnHour, cohort }) {
  return (
    <div className="my-3 grid grid-cols-2 gap-2">
      <div className="">
        <div className="font-bold">Aller à {startHour}</div>
        <div className="text-xs">
          <span className="capitalize">{dayjs(cohort.dateStart).locale("fr").format("dddd")}</span> <span>{dayjs(cohort.dateStart).locale("fr").format("D MMMM")}</span>
        </div>
      </div>
      <div className="">
        <div className="font-bold">Retour à {returnHour}</div>
        <div className="text-xs">
          <span className="capitalize">{dayjs(cohort.dateEnd).locale("fr").format("dddd")}</span> <span>{dayjs(cohort.dateEnd).locale("fr").format("D MMMM")}</span>
        </div>
      </div>
    </div>
  );
}

function MeetingPointChooser({ meetingPoint, onChoose, choosed, expired }) {
  const completeAddress = meetingPoint.address + " " + meetingPoint.zip + " " + meetingPoint.city;

  return (
    <div className="flex flex-col items-center rounded-lg bg-gray-50 p-4">
      <LinearMap />
      <div className="mt-3 text-center text-base font-bold text-[#242526]">{meetingPoint.name}</div>
      <div className="mt-1 flex-1 text-center text-sm text-gray-800 underline">{completeAddress}</div>
      <div className="mt-1 flex-1 text-center text-sm text-gray-500">N° de transport : {meetingPoint.busLineName}</div>
      <div className="my-4 h-[1px] w-[66px] bg-gray-200" />
      <div className="mb-8 flex items-center">
        <Schedule type="Aller" className="mr-4">
          {meetingPoint.meetingHour}
        </Schedule>
        <Schedule type="Retour">{meetingPoint.returnHour}</Schedule>
      </div>
      {choosed ? (
        <div className="flex items-center rounded-[10px] border-[1px]  border-blue-600 bg-blue-600 py-2.5 px-3 text-sm font-medium text-[#FFFFFF]">
          <Check className="mr-2" />
          Choisi
        </div>
      ) : expired ? (
        <div className="rounded-[10px] border-[1px] border-gray-300 bg-[#FFFFFF]  py-2.5 px-3 text-sm font-medium text-gray-500">Date limite dépassée</div>
      ) : (
        <BorderButton onClick={onChoose}>Choisir ce point</BorderButton>
      )}
    </div>
  );
}

function Schedule({ type, children, className }) {
  return (
    <div className={`flex items-center ${className}`}>
      <div className="mr-1 text-sm text-gray-500">{type}</div>
      <div className="text-lg font-bold text-[#242526]">{children}</div>
    </div>
  );
}

function MeetingPointGoAloneDesktop({ center, young, onChoose, choosed, expired, meetingPointsCount }) {
  const [opened, setOpened] = useState(false);
  const [cohort, setCohort] = useState(null);

  useEffect(() => {
    setCohort(getCohortDetail(young.cohort));
  }, [young]);

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
            {cohort && (
              <div className="mt-4 flex flex-col md:flex-row md:items-center">
                <CenterSchedule type="Aller" hour={ALONE_ARRIVAL_HOUR} date={cohort.dateStart} className="mb-[16px] md:mb-0 md:mr-4" />
                <CenterSchedule type="Retour" hour={ALONE_DEPARTURE_HOUR} date={cohort.dateEnd} />
              </div>
            )}
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

function MeetingPointGoAloneMobile({ center, young, onChoose, choosed, expired }) {
  const [opened, setOpened] = useState(false);
  const [cohort, setCohort] = useState(null);

  useEffect(() => {
    setCohort(getCohortDetail(young.cohort));
  }, [young]);

  function toggleMore() {
    setOpened(!opened);
  }

  return (
    <div className="flex flex-col items-center rounded-lg bg-gray-50 p-4">
      <LinearMap gray="true" />
      <div className="mt-3 flex-1 text-center text-base font-bold text-[#242526]">Je me rends au centre et en reviens par mes propres moyens</div>
      <button onClick={toggleMore} className="relative mt-6 mb-8 text-xs font-medium text-blue-600 md:hover:underline">
        {opened ? "Masquer les informations" : "En savoir plus"}
        {opened && (
          <div className="mt-4 text-left md:absolute md:top-[100%] md:right-[-120px] md:mt-0 md:rounded-lg md:bg-[#FFFFFF] md:p-6 md:shadow">
            <div className="text-sm font-bold text-[#242526] md:whitespace-nowrap md:text-lg">Rendez vous directement à votre lieu d’affectation</div>
            <div className="text-sm text-gray-700 md:whitespace-nowrap">{center.address + " " + center.zip + " " + center.city}</div>
            {cohort && (
              <div className="mt-4 flex flex-col md:flex-row md:items-center">
                <CenterSchedule type="Aller" hour={ALONE_ARRIVAL_HOUR} date={cohort.dateStart} className="mb-[16px] md:mb-0 md:mr-4" />
                <CenterSchedule type="Retour" hour={ALONE_DEPARTURE_HOUR} date={cohort.dateEnd} />
              </div>
            )}
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
