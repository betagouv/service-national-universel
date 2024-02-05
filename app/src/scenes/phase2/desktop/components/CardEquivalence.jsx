import React from "react";
import { BiCopy } from "react-icons/bi";
import { BsChevronDown } from "react-icons/bs";
import { HiCheckCircle } from "react-icons/hi";
import Download from "../../../../assets/icons/Download";
import SimpleFileIcon from "../../../../assets/icons/SimpleFileIcon";
import { copyToClipboard, formatDateFR, translateEquivalenceStatus } from "../../../../utils";
import ModalFiles from "./ModalFiles";
import { useHistory } from "react-router-dom";
import Pencil from "../../../../assets/icons/Pencil";

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
    <div className="mb-4 flex w-full flex-col rounded-lg bg-white px-4 pt-3 shadow-md ">
      <div className="mb-3 cursor-pointer   " onClick={() => setOpen(!open)}>
        <div className="flex items-center justify-between">
          <div className="flex-col items-center ">
            <div className="text-xs font-normal uppercase leading-4 text-gray-500">envoyée le {formatDateFR(equivalence.createdAt)}</div>
            <div className="text-base font-bold leading-5">Ma demande de reconnaissance d’engagement déjà réalisé</div>
          </div>
          <div className="flex items-center gap-5">
            <div className={`text-xs font-normal ${theme.background[equivalence.status]} ${theme.text[equivalence.status]} rounded-sm px-2 py-[2px] `}>
              {translateEquivalenceStatus(equivalence.status)}
            </div>
            <BsChevronDown className={`h-5 w-5 text-gray-400 ${open ? "rotate-180" : ""}`} />
          </div>
        </div>
      </div>
      {open ? (
        <>
          <hr className="mb-3 text-gray-200" />
          {equivalence.status === "WAITING_CORRECTION" ? (
            <>
              <div className="mb-4 flex items-center justify-between gap-6 rounded-lg bg-gray-50 px-2 py-3">
                <div className="flex flex-1 flex-col">
                  <div className="text-base font-semibold">Corrections demandées</div>
                  <div className="text-sm text-gray-500">{equivalence.message}</div>
                </div>
                <button
                  className="mr-4 rounded-lg border-[1px] border-indigo-600 px-4 py-2 text-indigo-600 hover:bg-indigo-600 hover:text-white"
                  onClick={() => history.push(`/phase2/equivalence/${equivalence._id}`)}>
                  Corriger ma demande
                </button>
              </div>
            </>
          ) : null}
          {equivalence.status === "REFUSED" ? (
            <>
              <div className="mb-4 flex items-center justify-between gap-6 rounded-lg bg-gray-50 px-2 py-3">
                <div className="flex flex-1 flex-col">
                  <div className="text-base font-semibold">Motif du refus</div>
                  <div className="w-3/4 text-sm text-gray-500">{equivalence.message}</div>
                </div>
              </div>
            </>
          ) : null}
          <div className="mb-3 flex items-stretch justify-around gap-4">
            <div className="flex ">
              <div className="grid grid-cols-2 py-2">
                <div className="flex flex-col gap-y-4 text-sm font-normal leading-none text-gray-400">
                  <span>Type d’engagement :</span>
                  {equivalence.sousType ? <span>Catégorie :</span> : null}
                  {equivalence.otherType ? <span>Autre :</span> : null}
                  <span>Structure d’accueil :</span>
                  <span>Dates :</span>
                  {equivalence.frequency ? <span>Fréquence :</span> : null}
                  <span>Adresse :</span>
                  <span>Code postal :</span>
                  <span>Ville :</span>
                </div>
                <div className="flex flex-col gap-y-4 text-sm font-medium leading-none">
                  <span>{equivalence.type}</span>
                  {equivalence.sousType ? <span>{equivalence.sousType}</span> : null}
                  {equivalence.otherType ? <span>{equivalence.otherType}</span> : null}
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
              {equivalence.status === "WAITING_VERIFICATION" ? (
                <div className="flex items-end justify-start">
                  <button
                    className="mb-2 flex cursor-pointer items-center justify-center rounded-full bg-blue-100 p-2 hover:scale-105"
                    onClick={() => history.push(`/phase2/equivalence/${equivalence._id}`)}>
                    <Pencil className="text-blue-600" />
                  </button>
                </div>
              ) : null}
            </div>
            <div className="flex items-stretch gap-6">
              <div className="flex flex-col justify-center gap-4 rounded-lg bg-gray-50">
                <div className="mx-16 flex flex-col items-center justify-center gap-2">
                  <SimpleFileIcon />
                  <div className="text-center text-sm font-bold leading-5">
                    Document justificatif <br /> d’engagement
                  </div>
                </div>
                <div className="flex flex-col items-end justify-end px-7">
                  <div className="flex cursor-pointer items-center justify-center rounded-full bg-blue-600 p-2 transition duration-150 ease-out hover:scale-110 hover:ease-in">
                    <Download className=" bg-blue-600 text-indigo-100 " onClick={() => setModalFiles({ isOpen: true })} />
                  </div>
                </div>
              </div>
              <div className="flex flex-col justify-center rounded-lg border-[1px] border-gray-200 py-4 px-8">
                <div className="mb-4 whitespace-nowrap text-base font-bold leading-6 text-gray-900">
                  Personne contact au sein
                  <br /> de la structure
                </div>
                <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-base font-semibold text-indigo-600`}>
                  {getInitials(equivalence.contactFullName)}
                </div>
                <div className="mb-2 text-sm font-medium leading-5 text-gray-900">{equivalence.contactFullName}</div>
                <div className="mb-4 flex items-center">
                  <div className="font-nornal text-fray-700 mr-2 text-xs leading-none ">{equivalence.contactEmail}</div>
                  <div
                    className="flex cursor-pointer items-center justify-center hover:scale-105"
                    onClick={() => {
                      copyToClipboard(equivalence.contactEmail);
                      setCopied(true);
                    }}>
                    {copied ? <HiCheckCircle className="text-green-500" /> : <BiCopy className="text-gray-400" />}
                  </div>
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
