import React, { useState } from "react";
import { HiChevronDown, HiChevronUp } from "react-icons/hi";
import { IoMdInformationCircleOutline } from "react-icons/io";
import { useDispatch } from "react-redux";
import { toastr } from "react-redux-toastr";
import Calendar from "../../../assets/calendar";
import LinearMap from "../../../assets/Linear-map.js";
import LoadingButton from "../../../components/buttons/LoadingButton";
import ModalConfirm from "../../../components/modals/ModalConfirm";
import WithTooltip from "../../../components/WithTooltip";
import { setYoung } from "../../../redux/auth/actions";
import api from "../../../services/api";
import { translate } from "../../../utils";

const departureMeetingDate = {
  2021: "lundi 20 février, 14:00",
  "Février 2022": "dimanche 13 février, 16:00",
  "Juin 2022": "dimanche 12 juin, 16:00",
  "Juillet 2022": "dimanche 03 juillet, 16:00",
};

const departureMeetingDateException = {
  2021: "lundi 20 février, 14:00",
  "Février 2022": "dimanche 13 février, 16:00",
  "Juin 2022": "mercredi 15 juin, 10:00",
  "Juillet 2022": "mercredi 06 juillet, 10:00",
};

const returnMeetingDate = {
  2021: "mardi 02 juillet, 14:00",
  "Février 2022": "vendredi 25 février, 11:00",
  "Juin 2022": "vendredi 24 juin, 11:00",
  "Juillet 2022": "vendredi 15 juillet, 18:00",
};

const cohortToMonth = {
  2021: "FEVR",
  "Février 2022": "FEVR",
  "Juin 2022": "JUIN",
  "Juillet 2022": "JUIL",
};

export default function ConvocationDetails({ young, center, meetingPoint }) {
  const [open, setOpen] = useState(false);
  const [isAutonomous, setIsAutonomous] = useState(young.deplacementPhase1Autonomous === "true");
  const [modal, setModal] = useState({ isOpen: false, onConfirm: null });
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();

  const handleAutonomousClick = () => {
    setModal({
      isOpen: true,
      title: "Je confirme venir et rentrer par mes propres moyens",
      message: (
        <>
          <p>
            Vous confirmez vous rendre au centre <b>{[center?.name, center?.address, center?.zip, center?.city, center?.department, center?.region].filter((e) => e).join(", ")}</b>{" "}
            et en revenir par vos propres moyens.
          </p>
          <br />
          <p>Cette action est irréversible.</p>
        </>
      ),
      onConfirm: confirmAutonomous,
      confirmText: "Je confirme",
    });
  };

  const isFromDOMTOM = () => {
    return (
      (["Guadeloupe", "Martinique", "Guyane", "La Réunion", "Saint-Pierre-et-Miquelon", "Mayotte", "Saint-Martin", "Polynésie française", "Nouvelle-Calédonie"].includes(
        young.department,
      ) ||
        young.region === "Corse") &&
      young.grade !== "Terminale"
    );
  };

  console.log("isFromDOMTOM", isFromDOMTOM());

  const getDepartureMeetingDate = () => {
    if (isAutonomous || !meetingPoint) return young.grade !== "Terminale" ? departureMeetingDate[young.cohort] : departureMeetingDateException[young.cohort]; //new Date("2021-06-20T14:30:00.000+00:00");
    return meetingPoint.departureAtString;
  };
  const getReturnMeetingDate = () => {
    if (isAutonomous || !meetingPoint) return returnMeetingDate[young.cohort]; // new Date("2021-07-02T12:00:00.000+00:00");
    return meetingPoint.returnAtString;
  };
  const getMeetingAddress = () => {
    if (isAutonomous || !meetingPoint) return [center?.name, center?.address, center?.zip, center?.city, center?.department, center?.region].filter((e) => e).join(", ");
    const address = [meetingPoint?.departureAddress];
    if (meetingPoint?.hideDepartmentInConvocation !== "true") {
      address.push(meetingPoint?.departureDepartment);
    }
    return address.filter((e) => e).join(", ");
  };

  async function confirmAutonomous() {
    setIsLoading(true);
    const { data, code, ok } = await api.post(`/young/${young._id}/deplacementPhase1Autonomous`);
    if (!ok) {
      setIsLoading(false);
      return toastr.error("error", translate(code));
    }
    dispatch(setYoung(data));
    setIsAutonomous(data.deplacementPhase1Autonomous === "true");
    setIsLoading(false);
    setOpen(false);
    return toastr.success("Mis à jour !");
  }
  return (
    <>
      <div className="bg-white md:!bg-gray-50 rounded-xl px-4 mt-6">
        <div className="flex flex-col lg:flex-row items-center">
          {isFromDOMTOM() ? (
            <div className="flex flex-row items-center my-3 w-full md:pr-4">
              <LinearMap className="w-16 h-16 mr-3" />
              <div className="flex flex-col flex-1">
                <div className="text-sm leading-7 font-bold">Lieu de rassemblement</div>
                <div className="text-sm text-gray-800 leading-5 italic">
                  Les informations sur les modalités d&apos;acheminement vers le centre et de retour vous seront transmises par e-mail par les services académiques.
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="flex flex-row items-center my-3 lg:border-r-[1px] md:pr-4">
                <LinearMap className="w-16 h-16 mr-3" />
                <div className="flex flex-col">
                  <div className="text-sm leading-7 font-bold">Lieu de rassemblement</div>
                  <div className="text-sm text-gray-800 leading-5 max-w-sm">{getMeetingAddress()}</div>
                </div>
              </div>
              <div className="flex flex-row items-center flex-1 md:!justify-center pb-3 md:!pb-0 my-3">
                <Calendar date={getDepartureMeetingDate().split(" ")[1]} month={cohortToMonth[young.cohort]} className="shadow-sm mr-3 w-7 h-10 md:w-11 md:h-12 md:mx-3" />
                <div className="flex flex-col">
                  <div className="font-bold text-sm whitespace-nowrap">Aller à{getDepartureMeetingDate().split(",")[1]}</div>
                  <div className="text-sm text-gray-600 whitespace-nowrap">
                    {getDepartureMeetingDate()
                      .split(/[,\s]+/)
                      .slice(0, 3)
                      .join(" ")}
                  </div>
                </div>
                {/* FIXME Hot fix sale pour juillet */}
                {young?.cohort === "Juillet 2022" ? (
                  <>
                    <Calendar date={returnMeetingDate[young.cohort].split(" ")[1]} month={cohortToMonth[young.cohort]} className="shadow-sm mx-3 w-7 h-10 md:w-11 md:h-12" />
                    <div className="flex flex-col">
                      <div className="flex gap-x-1">
                        <div className="font-bold text-sm whitespace-nowrap">Retour à{returnMeetingDate[young.cohort].split(",")[1]}</div>
                        <WithTooltip tooltipText="Cet horaire est donné à titre indicatif. Il vous sera confirmé ultérieurement">
                          <IoMdInformationCircleOutline />
                        </WithTooltip>
                      </div>

                      <div className="text-sm text-gray-600 whitespace-nowrap">
                        {returnMeetingDate[young.cohort]
                          .split(/[,\s]+/)
                          .slice(0, 3)
                          .join(" ")}
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <Calendar date={getReturnMeetingDate().split(" ")[1]} month={cohortToMonth[young.cohort]} className="shadow-sm mx-3 w-7 h-10 md:w-11 md:h-12" />
                    <div className="flex flex-col">
                      <div className="font-bold text-sm whitespace-nowrap">Retour à{getReturnMeetingDate().split(",")[1]}</div>
                      <div className="text-sm text-gray-600 whitespace-nowrap">
                        {getReturnMeetingDate()
                          .split(/[,\s]+/)
                          .slice(0, 3)
                          .join(" ")}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </>
          )}
        </div>
        {!isFromDOMTOM() ? (
          <>
            <hr className="flex md:hidden text-gray-200 -mx-6" />
            {!isAutonomous ? (
              <p className="flex md:hidden text-gray-700 py-3 text-center" onClick={() => setOpen(!open)}>
                Je souhaite me rendre au centre et en revenir par mes propres moyens mobile
              </p>
            ) : (
              <p className="flex md:hidden text-gray-700 py-3 text-center">Vous vous rendez au centre et en revenez par vos propres moyens.</p>
            )}
            {/* Mobile */}
            {open ? <div className="flex md:hidden flex-col pb-4">{changeAffectation({ center, young, isLoading, handleAutonomousClick })}</div> : null}
          </>
        ) : null}
      </div>
      {!isFromDOMTOM() ? (
        !isAutonomous ? (
          <div className="hidden md:flex flex-row items-center hover:underline cursor-pointer" onClick={() => setOpen(!open)}>
            <p className="text-gray-800 py-3 text-sm pr-1">Je souhaite me rendre au centre et en revenir par mes propres moyens</p>
            {open ? <HiChevronUp className="text-gray-800" /> : <HiChevronDown className="text-gray-800" />}
          </div>
        ) : (
          <p className="hidden md:flex text-gray-800 py-3 text-sm pr-1">Vous vous rendez au centre et en revenez par vos propres moyens.</p>
        )
      ) : null}
      {/* Desktop */}
      {open ? <div className="hidden md:flex flex-col pb-4">{changeAffectation({ center, young, isLoading, handleAutonomousClick })}</div> : null}

      <ModalConfirm
        isOpen={modal?.isOpen}
        title={modal?.title}
        message={modal?.message}
        confirmText={modal?.confirmText}
        onConfirm={() => {
          modal?.onConfirm();
          setModal({ isOpen: false, onConfirm: null });
        }}
        onCancel={() => {
          setModal({ isOpen: false, onConfirm: null });
        }}
      />
    </>
  );
}

const changeAffectation = ({ center, young, isLoading, handleAutonomousClick }) => {
  return (
    <>
      <div className="flex flex-col lg:flex-row items-center lg:pb-4">
        <div className=" flex flex-col pr-6 pb-3 lg:!pb-0">
          <div className="text-sm md:text-base font-bold pb-1 text-center md:!text-left">Rendez vous directement à votre lieu d&apos;affectation</div>
          <div className="text-sm leading-5 text-gray-800 text-center md:!text-left">
            {[center?.name, center?.address, center?.zip, center?.city, center?.department, center?.region].filter((e) => e).join(", ")}
          </div>
        </div>
        <div className="flex flex-row items-center flex-1 pb-3 md:!pb-0 my-3">
          <div className="flex flex-col border-l-[3px] border-blue-700 px-6">
            <div className="font-bold text-sm whitespace-nowrap">Aller à{departureMeetingDate[young.cohort].split(",")[1]}</div>
            <div className="text-sm text-gray-600 whitespace-nowrap">
              {departureMeetingDate[young.cohort]
                .split(/[,\s]+/)
                .slice(0, 3)
                .join(" ")}
            </div>
          </div>
          <div className="flex flex-col border-l-[3px] border-blue-700 px-6">
            <div className="font-bold text-sm whitespace-nowrap">Retour à{returnMeetingDate[young.cohort].split(",")[1]}</div>
            <div className="text-sm text-gray-600 whitespace-nowrap">
              {returnMeetingDate[young.cohort]
                .split(/[,\s]+/)
                .slice(0, 3)
                .join(" ")}
            </div>
          </div>
        </div>
      </div>
      <LoadingButton loading={isLoading} disabled={isLoading} onClick={handleAutonomousClick} className="max-w-fit">
        Je confirme venir et rentrer par mes propres moyens&nbsp;
        <svg width="16" height="12" fill="none" xmlns="http://www.w3.org/2000/svg" className="ml-2">
          <path d="M1 7l4 4L15 1" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </LoadingButton>
    </>
  );
};
