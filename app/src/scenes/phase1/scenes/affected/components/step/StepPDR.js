import React, { useEffect, useState } from "react";
import { BsCheck2 } from "react-icons/bs";
import { HiOutlineChevronDown, HiOutlineChevronUp } from "react-icons/hi";
import { getCohortDetail, getMeetingPointChoiceLimitDateForCohort } from "../../../../../../utils/cohorts";
import dayjs from "dayjs";
import CohortDateSummary from "../../../../../inscription2023/components/CohortDateSummary";
import Loader from "../../../../../../components/Loader";
import { capture } from "../../../../../../sentry";
import api from "../../../../../../services/api";
import LinearMap from "../../../../../../assets/icons/LinearMap";
import { BorderButton } from "../../../../../../components/buttons/SimpleButtons";
import { toastr } from "react-redux-toastr";
import { setYoung } from "../../../../../../redux/auth/actions";
import { useDispatch } from "react-redux";
import Check from "../../../../../../assets/icons/Check";
import CloseSvg from "../../../../../../assets/Close";
import { ModalContainer } from "../../../../../../components/modals/Modal";
import { Modal } from "reactstrap";

import ConfirmationModal from "../../../../components/modals/ConfirmationModal";
import Warning from "../../../../../../assets/icons/Warning";

const ALONE_ARRIVAL_HOUR = "16h";
const ALONE_DEPARTURE_HOUR = "11h";

export default function StepPDR({ young, center }) {
  const [valid, setValid] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [openedDesktop, setOpenedDesktop] = useState(false);
  const [openedMobile, setOpenedMobile] = useState(false);
  const [pdrChoiceLimitDate, setPdrChoiceLimitDate] = useState("?");
  const [pdrChoiceExpired, setPdrChoiceExpired] = useState(false);
  const [meetingPoints, setMeetingPoints] = useState(null);
  const [error, setError] = useState(null);
  const [choosenMeetingPoint, setChoosenMeetingPoint] = useState(null);
  const [cohort, setCohort] = useState(null);

  const [modalMeetingPoint, setModalMeetingPoint] = useState({ isOpen: false, meetingPoint: null });
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();

  useEffect(() => {
    if (young) {
      setValid((young.meetingPointId !== null && young.meetingPointId !== undefined) || young.deplacementPhase1Autonomous === "true" || young.transportInfoGivenByLocal === "true");
      setEnabled(true);
      setCohort(getCohortDetail(young.cohort));

      const date = getMeetingPointChoiceLimitDateForCohort(young.cohort);
      if (date) {
        setPdrChoiceLimitDate(dayjs(date).locale("fr").format("D MMMM YYYY"));
        setPdrChoiceExpired(dayjs(date).isBefore(new Date()));
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
        icon={<Warning className="text-[#D1D5DB] w-[36px] h-[36px]" />}
        title={"Changement de PDR"}
        confirmText="Confirmer le changement"
        onCancel={() => setModalMeetingPoint({ isOpen: false, meetingPoint: null })}
        onConfirm={() => {
          if (modalMeetingPoint.meetingPoint) return chooseMeetingPoint(modalMeetingPoint.meetingPoint);
          return chooseGoAlone();
        }}>
        <div className="flex flex-col gap-2  text-[14px] leading-[20px] text-gray-900 mt-[8px] text-center my-2">
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
        className={`hidden md:flex flex-row items-center justify-between ${enabled && "cursor-pointer"}`}
        onClick={() => setOpenedDesktop(enabled && young.transportInfoGivenByLocal !== "true" ? !openedDesktop : false)}>
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
                <>{addressOf(choosenMeetingPoint)}</>
              ) : young.deplacementPhase1Autonomous === "true" ? (
                <>Je me rends au centre et en revient par mes propres moyens</>
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
        {openedDesktop && <CohortDateSummary cohortName={young.cohort} className="ml-4" />}
        {enabled && young.transportInfoGivenByLocal !== "true" ? (
          <div className="flex items-center justify-center bg-gray-100 h-9 w-9 rounded-full hover:scale-110 ml-4">
            {openedDesktop ? <HiOutlineChevronUp className="h-5 w-5" /> : <HiOutlineChevronDown className="h-5 w-5" />}
          </div>
        ) : null}
      </div>
      {openedDesktop && (
        <div className="my-12">
          {error && <div className="text-red text-sm text-center my-4">{error}</div>}
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
        className={`md:hidden flex items-center border-[1px] mb-3 ml-4 rounded-xl min-h-[144px] cursor-pointer relative ${
          valid ? "border-green-500 bg-green-50" : !young.meetingPointId || young.deplacementPhase1Autonomous !== "true" ? "border-blue-600" : "bg-white"
        } `}
        onClick={() => setOpenedMobile(enabled && young.transportInfoGivenByLocal !== "true" ? !openedMobile : false)}>
        {(young.meetingPointId || young.deplacementPhase1Autonomous === "true") && (
          <LinearMap gray={(!young.meetingPointId).toString()} className="absolute top-[10px] right-[10px]" />
        )}
        <div className="-translate-x-5 flex flex-row items-center w-full">
          {valid ? (
            <div className="flex items-center justify-center bg-green-500 h-9 w-9 rounded-full mr-4">
              <BsCheck2 className="text-white h-5 w-5" />
            </div>
          ) : (
            <div className="flex items-center justify-center h-9 w-9 rounded-full border-[1px] bg-white border-gray-200 text-gray-700">1</div>
          )}
          <div className="flex flex-1 flex-col ml-3  mr-8 mt-4">
            <div className={`text-sm ${valid && "text-green-600"} ${enabled ? "text-gray-900" : "text-gray-400"}`}>
              {young.meetingPointId || young.deplacementPhase1Autonomous === "true"
                ? "Lieu de rassemblement"
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
                  <div>Je me rends au centre et en revient par mes propres moyens</div>
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
            {!valid && enabled ? <div className="text-blue-600 text-sm text-right leading-5 mt-2">Commencer</div> : null}
          </div>
        </div>
      </div>
      {openedMobile && (
        <Modal centered isOpen={true} toggle={() => setOpenedMobile(false)} size="xl">
          <ModalContainer>
            <CloseSvg className="close-icon hover:cursor-pointer" height={10} width={10} onClick={() => setOpenedMobile(false)} />
            <div className="w-full p-12 md:p-4">
              <div className="text-gray-900 font-bold text-lg text-center mb-3">Confirmez votre point de rassemblement</div>
              <CohortDateSummary cohortName={young.cohort} className="mb-4" />
              {error && <div className="text-red text-sm text-center my-4">{error}</div>}
              {meetingPoints ? (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
    <div className="grid grid-cols-2 gap-2 my-3">
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
    <div className="flex flex-col items-center bg-gray-50 rounded-lg p-4">
      <LinearMap />
      <div className="text-[#242526] text-base font-bold mt-3 text-center">{meetingPoint.name}</div>
      <div className="flex-1 text-gray-800 text-sm mt-1 underline text-center">{completeAddress}</div>
      <div className="flex-1 text-gray-500 text-sm mt-1 text-center">N° de transport : {meetingPoint.busLineName}</div>
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
    <div className="flex flex-col items-center bg-gray-50 rounded-lg p-4">
      <LinearMap gray="true" />
      <div className="flex-1 text-[#242526] text-base font-bold mt-3 text-center">Je me rends au centre et en revient par mes propres moyens</div>
      <button onClick={toggleMore} className="text-blue-600 font-medium text-xs mt-6 mb-8 md:hover:underline relative" id="toggle-button">
        {opened ? "Masquer les informations" : "En savoir plus"}
        {opened && (
          <div
            className={`mt-4 md:mt-0 md:absolute md:bg-[#FFFFFF] md:p-6 md:shadow md:rounded-lg md:top-[100%] text-left ${
              meetingPointsCount === 0 ? "md:left-[-70px]" : "md:right-[-120px]"
            }`}>
            <div className="text-sm md:text-lg text-[#242526] font-bold md:whitespace-nowrap">Rendez vous directement à votre lieu d’affectation</div>
            <div className="text-sm text-gray-700 md:whitespace-nowrap">{center.address + " " + center.zip + " " + center.city}</div>
            {cohort && (
              <div className="flex flex-col md:flex-row md:items-center mt-4">
                <CenterSchedule type="Aller" hour={ALONE_ARRIVAL_HOUR} date={cohort.dateStart} className="mb-[16px] md:mb-0 md:mr-4" />
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
    <div className="flex flex-col items-center bg-gray-50 rounded-lg p-4">
      <LinearMap gray="true" />
      <div className="flex-1 text-[#242526] text-base font-bold mt-3 text-center">Je me rends au centre et en revient par mes propres moyens</div>
      <button onClick={toggleMore} className="text-blue-600 font-medium text-xs mt-6 mb-8 md:hover:underline relative">
        {opened ? "Masquer les informations" : "En savoir plus"}
        {opened && (
          <div className="mt-4 md:mt-0 md:absolute md:bg-[#FFFFFF] md:p-6 md:shadow md:rounded-lg md:top-[100%] md:right-[-120px] text-left">
            <div className="text-sm md:text-lg text-[#242526] font-bold md:whitespace-nowrap">Rendez vous directement à votre lieu d’affectation</div>
            <div className="text-sm text-gray-700 md:whitespace-nowrap">{center.address + " " + center.zip + " " + center.city}</div>
            {cohort && (
              <div className="flex flex-col md:flex-row md:items-center mt-4">
                <CenterSchedule type="Aller" hour={ALONE_ARRIVAL_HOUR} date={cohort.dateStart} className="mb-[16px] md:mb-0 md:mr-4" />
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

function CenterSchedule({ type, hour, date, className = 0 }) {
  return (
    <div className={`border-l-[3px] border-l-blue-700 border-l-solid pl-3 ${className}`}>
      <div className="text-sm text-gray-800 font-bold">
        {type} à {hour}
      </div>
      <div className="text-sm text-gray-500 mt-2:">
        <span className="capitalize">{dayjs(date).locale("fr").format("dddd")}</span> <span>{dayjs(date).locale("fr").format("D MMMM")}</span>
      </div>
    </div>
  );
}
