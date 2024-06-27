import React, { useEffect, useState } from "react";
import API from "../../../services/api";
import { toastr } from "react-redux-toastr";
import { translate, formatDateFR, getZonedDate } from "../../../utils";
import { MdInfoOutline } from "react-icons/md";
import ReactTooltip from "react-tooltip";
import RightArrow from "./RightArrow";

export default function PDRpropose({ young, center, modalAffectations, setModalAffectation }) {
  const [dataPdr, setDataPdr] = useState([]);
  const [loadingPdr, setLoadingPdr] = useState(false);

  useEffect(() => {
    getPDR(young, center);
  }, []);

  async function getPDR(young, center) {
    setLoadingPdr(true);

    try {
      const result = await API.get(`/point-de-rassemblement/ligneToPoint/${young.cohort}/${center._id}`);
      if (result.ok) {
        setDataPdr(result.data.filter((item) => item.meetingPoint.department === young.department));
      } else {
        return toastr.error("Impossible de récupérer la liste des points de rassemblement. Veuillez réessayer dans quelques instants.");
      }
      setLoadingPdr(false);
    } catch (err) {
      setLoadingPdr(false);
      return toastr.error("Impossible de récupérer la liste des points de rassemblement. Veuillez réessayer dans quelques instants.", translate(err?.code), {
        timeOut: 2000,
      });
    }
  }
  const PdrInfo = (pdr) => {
    return (
      <div className="flex gap-1 flex-col text-[12px] leading-5">
        <p className=" text-gray-900">
          {pdr.pdr.meetingPoint.department}, {pdr.pdr.meetingPoint.region}
        </p>
        <p className=" text-gray-600">
          N° transport: <span className="text-gray-900">{pdr.pdr.ligneBus.busId}</span>
        </p>
        <p className=" text-gray-600">
          Départ:{" "}
          <span className="text-gray-900">
            {formatDateFR(getZonedDate(pdr.pdr.ligneBus.departuredDate))} {pdr.pdr.ligneToPoint.departureHour}
          </span>
        </p>
        <p className=" text-gray-600">
          Retour:{" "}
          <span className="text-gray-900">
            {formatDateFR(getZonedDate(pdr.pdr.ligneBus.returnDate))} {pdr.pdr.ligneToPoint.returnHour}
          </span>
        </p>
      </div>
    );
  };

  return loadingPdr ? (
    <div className="mt-2">Chargement ...</div>
  ) : dataPdr.length === 0 ? (
    <div className="mt-2">Aucun résultat.</div>
  ) : (
    <div className="grid grid-cols-1 divide-y  border-y-[1px] border-gray-200">
      {dataPdr.map((pdr) => (
        <div
          key={pdr.meetingPoint._id}
          className="flex w-full flex-row items-center justify-between gap-4 px-2  py-2 cursor-pointer"
          onClick={() => {
            setModalAffectation({ isOpen: true, center: center, sessionId: young.sessionPhase1Id });
          }}>
          <div className="flex items-center text-gray-900 font-bold text-[15px] leading-6  gap-4">
            <p>{pdr.meetingPoint.name}</p>
            <MdInfoOutline data-tip data-for={pdr.meetingPoint._id} className="h-5 w-5 cursor-pointer text-gray-400" />
          </div>
          <ReactTooltip id={pdr.meetingPoint._id} type="light" place="top" effect="solid" className="custom-tooltip-radius !opacity-100 !shadow-md" tooltipRadius="6">
            <div className=" w-fit list-outside !px-2 !py-1.5 text-left text-sm text-black">
              <PdrInfo pdr={pdr} />
            </div>
          </ReactTooltip>
          <div>
            <RightArrow />
          </div>
        </div>
      ))}
    </div>
  );
}
