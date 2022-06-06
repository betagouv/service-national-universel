import React from "react";
import { BiCopy } from "react-icons/bi";
import { BsChevronDown } from "react-icons/bs";
import { HiCheckCircle } from "react-icons/hi";
import Download from "../../../../assets/icons/Download";
import SimpleFileIcon from "../../../../assets/icons/SimpleFileIcon";
import { copyToClipboard, formatDateFR, translateEquivalenceStatus } from "../../../../utils";
import ModalFiles from "./ModalFiles";
import { useHistory } from "react-router-dom";

export default function CardEquivalence({ equivalence, young }) {
  const [open, setOpen] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  const [modalFiles, setModalFiles] = React.useState({ isOpen: false });
  const history = useHistory();

  React.useEffect(() => {
    if (copied) {
      setTimeout(() => setCopied(false), 3000);
    }
  }, [copied]);

  const theme = {
    background: {
      WAITING_VERIFICATION: "bg-sky-100",
      WAITING_CORRECTION: "bg-[#FD7A02]",
      VALIDATED: "bg-[#71C784]",
      REFUSED: "bg-red-500",
    },
    text: {
      WAITING_VERIFICATION: "text-sky-600",
      WAITING_CORRECTION: "text-white",
      VALIDATED: "text-white",
      REFUSED: "text-white",
    },
  };

  return (
    <div className="flex flex-col w-full rounded-lg bg-white px-4 pt-3 mb-4 shadow-md ">
      <div className="mb-3 cursor-pointer   " onClick={() => setOpen(!open)}>
        <div className="flex items-center justify-between">
          <div className="flex-col items-center ">
            <div className="text-xs font-normal text-gray-500 leading-4 uppercase">envoyée le {formatDateFR(equivalence.createdAt)}</div>
            <div className="text-base leading-5 font-bold">Ma demande de reconnaissance d’engagement externe</div>
          </div>
          <div className="flex items-center gap-5">
            <div className={`text-xs font-normal ${theme.background[equivalence.status]} ${theme.text[equivalence.status]} px-2 py-[2px] rounded-sm `}>
              {translateEquivalenceStatus(equivalence.status)}
            </div>
            <BsChevronDown className={`text-gray-400 h-5 w-5 ${open ? "rotate-180" : ""}`} />
          </div>
        </div>
      </div>
      {open ? (
        <>
          <hr className="mb-3 text-gray-200" />
          {equivalence.status === "WAITING_VERIFICATION" ? (
            <>
              <div className="flex justify-end">
                <button
                  className="mr-8 mb-3 border-[1px] border-indigo-600 hover:bg-indigo-600 text-indigo-600 hover:text-white px-4 py-2 rounded-lg"
                  onClick={() => history.push(`/phase2/equivalence/${equivalence._id}`)}>
                  Modifier ma demande
                </button>
              </div>
            </>
          ) : null}
          {equivalence.status === "WAITING_CORRECTION" ? (
            <>
              <div className="flex justify-between items-center px-2 py-3 rounded-lg bg-gray-50 mb-4 gap-6">
                <div className="flex flex-col flex-1">
                  <div className="text-base font-semibold">Corrections demandées</div>
                  <div className="text-sm text-gray-500">{equivalence.message}</div>
                </div>
                <button
                  className="mr-4 border-[1px] border-indigo-600 hover:bg-indigo-600 text-indigo-600 hover:text-white px-4 py-2 rounded-lg"
                  onClick={() => history.push(`/phase2/equivalence/${equivalence._id}`)}>
                  Corriger ma demande
                </button>
              </div>
            </>
          ) : null}
          {equivalence.status === "REFUSED" ? (
            <>
              <div className="flex justify-between items-center px-2 py-3 rounded-lg bg-gray-50 mb-4 gap-6">
                <div className="flex flex-col flex-1">
                  <div className="text-base font-semibold">Motif du refus</div>
                  <div className="text-sm text-gray-500 w-3/4">{equivalence.message}</div>
                </div>
              </div>
            </>
          ) : null}
          <div className="flex items-stretch mb-3 gap-4 justify-around">
            <div className="grid grid-cols-2 py-2">
              <div className="flex flex-col gap-y-4 text-sm leading-none font-normal text-gray-400">
                <span>Type d’engagement :</span>
                <span>Structure d’accueil :</span>
                <span>Dates :</span>
                {equivalence.frequency ? <span>Fréquence :</span> : null}
                <span>Adresse :</span>
                <span>Code postal :</span>
                <span>Ville :</span>
              </div>
              <div className="flex flex-col gap-y-4 text-sm leading-none font-medium">
                <span>{equivalence.type}</span>
                <span>{equivalence.structureName}</span>
                <span>
                  Du {formatDateFR(equivalence.startDate)} au {formatDateFR(equivalence.endDate)}
                </span>
                {equivalence.frequency ? (
                  <span className="lowercase">
                    {equivalence.frequency.nombre} {equivalence.frequency.duree} {equivalence.frequency.frequence}
                  </span>
                ) : null}
                <span>{equivalence.address}</span>
                <span>{equivalence.zip}</span>
                <span>{equivalence.city}</span>
              </div>
            </div>
            <div className="flex flex-col justify-center bg-gray-50 rounded-lg gap-4">
              <div className="flex flex-col justify-center items-center gap-2 mx-16">
                <SimpleFileIcon />
                <div className="text-sm leading-5 font-bold text-center">
                  Document justificatif <br /> d’engagement
                </div>
              </div>
              <div className="flex flex-col justify-end items-end px-7">
                <div className="transition duration-150 flex rounded-full bg-blue-600 p-2 items-center justify-center hover:scale-110 ease-out hover:ease-in cursor-pointer">
                  <Download className=" text-indigo-100 bg-blue-600 " onClick={() => setModalFiles({ isOpen: true })} />
                </div>
              </div>
            </div>
            <div className="flex flex-col justify-center border-[1px] border-gray-200 rounded-lg py-4 px-8">
              <div className="text-base leading-6 font-bold text-gray-900 mb-4">
                Personne contact au sein <br /> de la structure
              </div>
              <div className={`h-10 w-10 flex justify-center items-center rounded-full bg-gray-100 text-indigo-600 text-base font-semibold mb-3`}>
                {getInitials(equivalence.contactFullName)}
              </div>
              <div className="text-sm leading-5 font-medium text-gray-900 mb-2">{equivalence.contactFullName}</div>
              <div className="flex items-center mb-4">
                <div className="text-xs leading-none font-nornal text-fray-700 mr-2 ">{equivalence.contactEmail}</div>
                <div
                  className="flex items-center justify-center cursor-pointer hover:scale-105"
                  onClick={() => {
                    copyToClipboard(equivalence.contactEmail);
                    setCopied(true);
                  }}>
                  {copied ? <HiCheckCircle className="text-green-500" /> : <BiCopy className="text-gray-400" />}
                </div>
              </div>
            </div>
          </div>
        </>
      ) : null}
      <ModalFiles
        isOpen={modalFiles?.isOpen}
        onCancel={() => setModalFiles({ isOpen: false })}
        initialValues={equivalence?.files ? equivalence.files : []}
        young={young}
        nameFiles="equivalenceFiles"
      />
    </div>
  );
}

const getInitials = (word) =>
  (word || "UK")
    .match(/\b(\w)/g)
    .join("")
    .substring(0, 2)
    .toUpperCase();
