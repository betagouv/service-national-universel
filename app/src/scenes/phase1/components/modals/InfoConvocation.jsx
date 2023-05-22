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
import { translate } from "snu-lib";
import { capture } from "../../../../sentry";
import { getCohort } from "../../../../utils/cohorts";
import dayjs from "dayjs";

export default function InfoConvocation({ isOpen, onCancel, title }) {
  const young = useSelector((state) => state.Auth.young) || {};
  const [selectOpen, setSelectOpen] = React.useState(false);
  const refSelect = React.useRef(null);
  const [isAutonomous, setIsAutonomous] = React.useState(false);
  const [meetingPoint, setMeetingPoint] = React.useState();
  const [center, setCenter] = React.useState();
  const [isLoading, setIsLoading] = React.useState(false);
  const [loadingConvocation, setLoadingConvocation] = React.useState(false);
  const [returnDate, setReturnDate] = React.useState(null);

  const getMeetingPoint = async () => {
    try {
      const { data, ok } = await api.get(`/young/${young._id}/point-de-rassemblement?withbus=true`);
      console.log("PDR = ", data);
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

  React.useEffect(() => {
    let date = null;
    if (isAutonomous || !meetingPoint || !meetingPoint.bus) {
      const cohort = getCohort(young.cohort);
      if (cohort) {
        date = cohort.dateEnd;
      }
    } else {
      date = meetingPoint.bus.returnDate;
    }

    const hour = meetingPoint && meetingPoint.ligneToPoint ? meetingPoint.ligneToPoint.returnHour : "11h";

    if (date) {
      const d = dayjs(date).locale("fr");
      setReturnDate({
        date: d.format("DD"),
        month: d.format("MMM").toUpperCase().replace(".", ""),
        complete: d.format("dddd D MMMM YYYY"),
        hour,
      });
    } else {
      setReturnDate({});
    }
  }, [meetingPoint]);

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
    try {
      setLoadingConvocation(true);
      const { ok, code } = await api.post(`/young/${young._id}/documents/${type}/${template}/send-email`, {
        fileName: `${young.firstName} ${young.lastName} - ${template} ${type}.pdf`,
      });
      setLoadingConvocation(false);
      if (!ok) {
        throw new Error(translate(code));
      }
      toastr.success(`Document envoyé à ${young.email}`);
    } catch (e) {
      capture(e);
      setLoadingConvocation(false);
      toastr.error("Erreur lors de l'envoie du document : ", e.message);
    }
  };

  const getMeetingAddress = () => {
    if (isAutonomous || !meetingPoint) {
      return [center?.name, center?.address, center?.zip, center?.city, center?.department, center?.region].filter((e) => e).join(", ");
    } else {
      let address = [meetingPoint.address];

      let complement = meetingPoint.complementAddress ? meetingPoint.complementAddress.find((c) => c.cohort === young.cohort) : null;
      if (complement && complement.complement) {
        complement = complement.complement.trim();
        if (complement.length === 0) {
          complement = null;
        }
      } else {
        complement = null;
      }
      if (complement) {
        address.push(complement);
      }

      address.push(meetingPoint.zip + " " + meetingPoint.city);
      address.push("(" + meetingPoint.department + ")");
      return address.join(", ");
    }
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
        <div className="text-center text-xl font-medium leading-7 text-gray-900">{title ? title : "Mes informations de retour de séjour"}</div>
        <div className="relative mt-4" ref={refSelect}>
          <button
            disabled={loadingConvocation}
            className="flex w-full items-center justify-between gap-3 rounded-full border-[1px] border-blue-600 bg-blue-600 px-4 py-2 disabled:cursor-wait disabled:opacity-50"
            onClick={() => setSelectOpen((e) => !e)}>
            <div className="flex items-center gap-2">
              <span className="mr-2 text-xs font-medium leading-4 text-white">Ma convocation</span>
            </div>
            <ChevronDown className="font-medium text-white" />
          </button>

          <div className={`${selectOpen ? "block" : "hidden"}  absolute right-0 top-[40px] z-50 !min-w-full overflow-hidden rounded-lg bg-white shadow transition`}>
            <div
              key="download"
              onClick={() => {
                viewConvocation({ uri: "cohesion" });
                setSelectOpen(false);
              }}>
              <div className="group flex cursor-pointer items-center gap-3 p-2 px-3 text-sm leading-5 hover:bg-gray-50">
                <Download className="h-4 w-4 text-gray-400" />
                <div>Télécharger</div>
              </div>
            </div>
            <div
              key="email"
              onClick={() => {
                sendConvocation({ template: "cohesion", type: "convocation" });
                setSelectOpen(false);
              }}>
              <div className="group flex cursor-pointer items-center gap-3 p-2 px-3 text-sm leading-5 hover:bg-gray-50">
                <FiMail className="h-4 w-4 text-gray-400" />
                <div>Envoyer par mail</div>
              </div>
            </div>
          </div>
        </div>
        {returnDate && (
          <div className="mt-4 flex flex-col items-center gap-6 md:flex-row">
            <div className="flex items-center justify-center gap-2 pr-4 md:border-r-[1px]">
              <Calendar date={returnDate.date} month={returnDate.month} className="mx-3 h-10 w-7 shadow-ninaBlock md:h-12 md:w-11" />
              <div className="flex flex-col">
                <div className="whitespace-nowrap text-xs font-bold">Retour à {returnDate.hour}</div>
                <div className="whitespace-nowrap text-xs text-gray-600">{returnDate.complete}</div>
              </div>
            </div>
            <div className="flex w-2/3 text-center text-xs font-normal leading-5 text-gray-800 md:w-full md:!text-left">{getMeetingAddress()}</div>
          </div>
        )}
        <button className="mt-10 w-full rounded-lg border-[1px] py-2 text-center text-gray-700" onClick={onCancel}>
          Fermer
        </button>
      </div>
    </Modal>
  );
}
