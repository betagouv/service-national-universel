import React from "react";
import { FiMail } from "react-icons/fi";
import { useSelector } from "react-redux";
import { Modal } from "reactstrap";
import Calendar from "../../../../assets/calendar";
import ChevronDown from "../../../../assets/icons/ChevronDown";
import Download from "../../../../assets/icons/Download";
import Loader from "../../../../components/Loader";
import api from "../../../../services/api";
import downloadPDF from "../../../../utils/download-pdf";
import { toastr } from "react-redux-toastr";

const returnMeetingDate = {
  2021: "mardi 02 juillet, 14:00",
  "Février 2022": "vendredi 25 février, 11:00",
  "Juin 2022": "vendredi 24 juin, 11:00",
  "Juillet 2022": "vendredi 15 juillet, 11:00",
};
const cohortToMonth = {
  2021: "FEVR",
  "Février 2022": "FEVR",
  "Juin 2022": "JUIN",
  "Juillet 2022": "JUIL",
};
export default function InfoConvocation({ isOpen, onCancel }) {
  const young = useSelector((state) => state.Auth.young) || {};
  const [selectOpen, setSelectOpen] = React.useState(false);
  const refSelect = React.useRef(null);
  const [isAutonomous, setIsAutonomous] = React.useState(false);
  const [meetingPoint, setMeetingPoint] = React.useState();
  const [center, setCenter] = React.useState();
  const [isLoading, setIsLoading] = React.useState(false);
  const [loadingConvocation, setLoadingConvocation] = React.useState(false);

  const getMeetingPoint = async () => {
    try {
      const { data, ok } = await api.get(`/young/${young._id}/meeting-point`);
      if (!ok) {
        setMeetingPoint(null);
        return;
      }
      setMeetingPoint(data);
    } catch (e) {
      console.log(e);
      setMeetingPoint(null);
    }
  };

  const getCenter = async () => {
    try {
      const { data, ok } = await api.get(`/session-phase1/${young.sessionPhase1Id}/cohesion-center`);
      console.log(young.sessionPhase1Id);
      if (!ok) {
        setCenter(null);
        return;
      }
      setCenter(data);
    } catch (e) {
      console.log(e);
      setCenter(null);
    }
  };

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (refSelect.current && !refSelect.current.contains(event.target)) {
        setSelectOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside, true);
    return () => {
      document.removeEventListener("click", handleClickOutside, true);
    };
  }, []);

  React.useEffect(() => {
    setIsLoading(true);
    setIsAutonomous(young.deplacementPhase1Autonomous === "true");
    getMeetingPoint();
    getCenter();
    setIsLoading(false);
  }, [young]);

  const viewConvocation = async ({ uri }) => {
    setLoadingConvocation(true);
    await downloadPDF({
      url: `/young/${young._id}/documents/convocation/${uri}`,
      fileName: `${young.firstName} ${young.lastName} - convocation - ${uri}.pdf`,
      errorTitle: "Une erreur est survenue lors de l'édition de votre convocation",
    });
    setLoadingConvocation(false);
  };

  const sendConvocation = async ({ template, type }) => {
    setLoadingConvocation(true);
    const { ok } = await api.post(`/young/${young._id}/documents/${type}/${template}/send-email`, {
      fileName: `${young.firstName} ${young.lastName} - ${template} ${type}.pdf`,
    });
    setLoadingConvocation(false);
    if (ok) toastr.success(`Document envoyé à ${young.email}`);
    else toastr.error("Erreur lors de l'envoie du document");
  };

  const getReturnMeetingDate = () => {
    if (isAutonomous || !meetingPoint) return returnMeetingDate[young.cohort];
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

  if (isLoading)
    return (
      <Modal centered isOpen={isOpen} onCancel={onCancel} size="">
        <Loader />
      </Modal>
    );

  return (
    <Modal centered isOpen={isOpen} onCancel={onCancel} size="">
      <div className="flex flex-col items-center justify-center p-4">
        <div className="text-xl leading-7 font-medium text-gray-900 text-center">Mes informations de retour de séjour</div>
        {/* <div className="relative mt-4" ref={refSelect}>
          <button
            disabled={loadingConvocation}
            className="flex justify-between gap-3 items-center rounded-full border-[1px] border-blue-600 bg-blue-600 px-4 py-2 disabled:opacity-50 disabled:cursor-wait w-full"
            onClick={() => setSelectOpen((e) => !e)}>
            <div className="flex items-center gap-2">
              <span className="text-white leading-4 text-xs font-medium mr-2">Ma convocation</span>
            </div>
            <ChevronDown className="text-white font-medium" />
          </button>
          
          <div className={`${selectOpen ? "block" : "hidden"}  rounded-lg !min-w-full bg-white transition absolute right-0 shadow overflow-hidden z-50 top-[40px]`}>
            <div
              key="download"
              onClick={() => {
                viewConvocation({ uri: "cohesion" });
                setSelectOpen(false);
              }}>
              <div className="group flex items-center gap-3 p-2 px-3 text-sm leading-5 hover:bg-gray-50 cursor-pointer">
                <Download className="text-gray-400 w-4 h-4" />
                <div>Télécharger</div>
              </div>
            </div>
            <div
              key="email"
              onClick={() => {
                sendConvocation({ template: "cohesion", type: "convocation" });
                setSelectOpen(false);
              }}>
              <div className="group flex items-center gap-3 p-2 px-3 text-sm leading-5 hover:bg-gray-50 cursor-pointer">
                <FiMail className="text-gray-400 w-4 h-4" />
                <div>Envoyer par mail</div>
              </div>
            </div>
          </div>
        </div> */}
        <div className="flex flex-col md:flex-row items-center mt-4 gap-6">
          <div className="flex items-center justify-center gap-2 pr-4 md:border-r-[1px]">
            <Calendar date={getReturnMeetingDate().split(" ")[1]} month={cohortToMonth[young.cohort]} className="shadow-ninaBlock mx-3 w-7 h-10 md:w-11 md:h-12" />
            <div className="flex flex-col">
              <div className="font-bold text-xs whitespace-nowrap">Retour à{getReturnMeetingDate().split(",")[1]}</div>
              <div className="text-xs text-gray-600 whitespace-nowrap">
                {getReturnMeetingDate()
                  .split(/[,\s]+/)
                  .slice(0, 3)
                  .join(" ")}
              </div>
            </div>
          </div>
          <div className="flex w-2/3 text-center md:!text-left md:w-full text-xs leading-5 font-normal text-gray-800">{getMeetingAddress()}</div>
        </div>
        <button className="mt-10 w-full text-center text-gray-700 border-[1px] py-2 rounded-lg" onClick={onCancel}>
          Fermer
        </button>
      </div>
    </Modal>
  );
}
