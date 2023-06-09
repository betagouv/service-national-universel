import React, { useEffect, useState } from "react";
import API from "../../../services/api";
import { toastr } from "react-redux-toastr";
import { translate, formatStringDateWithDayTimezoneUTC } from "../../../utils";
import { MdInfoOutline } from "react-icons/md";
import ReactTooltip from "react-tooltip";

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
        return toastr.error("Impossible de récupérer la liste des points de rassemblement. Veuillez essayer dans quelques instants.");
      }
      setLoadingPdr(false);
    } catch (err) {
      setLoadingPdr(false);
      return toastr.error("Impossible de récupérer la liste des points de rassemblement. Veuillez essayer dans quelques instants.", translate(err?.code), {
        timeOut: 2000,
      });
    }
  }
  const PdrInfo = (pdr) => {
    return (
      <div>
        <p>
          {pdr.pdr.meetingPoint.department}, {pdr.pdr.meetingPoint.region}
        </p>
        <p className="text-gray-600">
          N° transport: <span className="text-black">{pdr.pdr.ligneBus.busId}</span>
        </p>
        <p className="text-gray-600">
          Départ:{" "}
          <span className="text-black">
            {formatStringDateWithDayTimezoneUTC(pdr.pdr.ligneBus.departuredDate)} {pdr.pdr.ligneToPoint.departureHour}
          </span>
        </p>
        <p className="text-gray-600">
          Retour:{" "}
          <span className="text-black">
            {formatStringDateWithDayTimezoneUTC(pdr.pdr.ligneBus.returnDate)} {pdr.pdr.ligneToPoint.returnHour}
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
    dataPdr.map((pdr) => (
      <div
        key={pdr.meetingPoint._id}
        className="flex w-full flex-row items-center justify-between gap-4 px-2 border-b-[1px] border-t-[1px] border-gray-200 pb-1.5 pt-1.5 cursor-pointer"
        onClick={() => {
          setModalAffectation({ isOpen: true, center: center, sessionId: young.sessionPhase1Id });
        }}>
        <div className="text-black font-bold text-base leading-6 flex flex-row gap-1 align-middle">
          <p>{pdr.meetingPoint.name}</p>
          <MdInfoOutline data-tip data-for={pdr.meetingPoint._id} className="h-5 w-5 cursor-pointer text-gray-400" />
        </div>
        <ReactTooltip id={pdr.meetingPoint._id} type="light" place="top" effect="solid" className="custom-tooltip-radius !opacity-100 !shadow-md" tooltipRadius="6">
          <div className=" w-[275px] list-outside !px-2 !py-1.5 text-left text-sm text-black">
            <PdrInfo pdr={pdr} />
          </div>
        </ReactTooltip>
        <div>
          <RightArrow />
        </div>
      </div>
    ))
  );
}
const RightArrow = () => {
  return (
    <svg width="42" height="42" viewBox="0 0 42 42" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g filter="url(#filter0_d_3100_51832)">
        <rect x="2" y="1" width="38" height="38" rx="19" fill="#2563EB" />
        <path d="M18.5 14.1667L24.3333 20L18.5 25.8334" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      <defs>
        <filter id="filter0_d_3100_51832" x="0" y="0" width="42" height="42" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
          <feOffset dy="1" />
          <feGaussianBlur stdDeviation="1" />
          <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.05 0" />
          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_3100_51832" />
          <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_3100_51832" result="shape" />
        </filter>
      </defs>
    </svg>
  );
};
