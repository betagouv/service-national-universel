import React from "react";
import { BiCopy } from "react-icons/bi";
import { HiCheckCircle } from "react-icons/hi";
import { useHistory } from "react-router-dom";
import { Modal } from "reactstrap";
import Download from "../../../../assets/icons/Download";
import Pencil from "../../../../assets/icons/Pencil";
import SimpleFileIcon from "../../../../assets/icons/SimpleFileIcon";
import { copyToClipboard, formatDateFR, translateEquivalenceStatus } from "../../../../utils";
import ModalFiles from "../../desktop/components/ModalFiles";

export default function ModalEquivalenceInformations({ theme, equivalence, open, setOpen, young, copied, setCopied }) {
  const [modalFiles, setModalFiles] = React.useState({ isOpen: false });
  const history = useHistory();

  return (
    <Modal isOpen={open} centered>
      <div className="mb-20 w-full px-3 py-2">
        <div className="flex items-center justify-between ">
          <div className={`text-xs font-normal ${theme.background[equivalence.status]} ${theme.text[equivalence.status]} flex rounded-sm px-2 py-[2px] `}>
            {/* <img src={clock} alt="clock icon" className="w-5 h-5 bg-blue-50" /> */}
            {translateEquivalenceStatus(equivalence.status)}
          </div>
          <div className="text-xl " onClick={() => setOpen(false)}>
            x
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex-col items-center ">
            <div className="mt-2 text-xs font-normal uppercase leading-4 text-gray-500">envoyée le {formatDateFR(equivalence.createdAt)}</div>
            <div className="text-base font-bold leading-5">Ma demande de reconnaissance d’engagement déjà réalisé</div>
          </div>
        </div>
        {equivalence.status === "WAITING_CORRECTION" && (
          <>
            <div className="mb-4 mt-3 flex flex-col justify-between gap-6 rounded-lg bg-gray-50 px-2 py-3">
              <div className="flex flex-1 flex-col">
                <div className="text-base font-semibold">Corrections demandées</div>
                <div className="text-sm text-gray-500">{equivalence.message}</div>
              </div>
              <button
                className="mr-4 w-full rounded-lg border-[1px] border-indigo-600 px-4 py-2 text-indigo-600 hover:bg-indigo-600 hover:text-white"
                onClick={() => history.push(`/phase2/equivalence/${equivalence._id}`)}>
                Corriger ma demande
              </button>
            </div>
          </>
        )}
        {equivalence.status === "REFUSED" && (
          <>
            <div className="mt-3 mb-4 flex items-center justify-between gap-6  rounded-lg bg-gray-50 px-2 py-3">
              <div className="flex flex-1 flex-col">
                <div className="text-base font-semibold">Motif du refus</div>
                <div className="w-3/4 text-sm text-gray-500">{equivalence.message}</div>
              </div>
            </div>
          </>
        )}
        <div className="mt-3 flex  space-x-8 overflow-x-auto ">
          <div className="h-56 w-56 shrink-0 rounded-lg bg-gray-50 pt-4">
            <div className="mx-2 flex flex-col items-center justify-center gap-2">
              <SimpleFileIcon />
              <div className="text-center text-sm font-bold leading-5">
                Document justificatif <br /> d’engagement
              </div>
            </div>
            <div className="flex flex-col items-end justify-end  pr-3 ">
              <div className="flex cursor-pointer items-center justify-center rounded-full bg-blue-600 p-2 transition duration-150 ease-out hover:scale-110 hover:ease-in">
                <Download className=" bg-blue-600 text-indigo-100 " onClick={() => setModalFiles({ isOpen: true })} />
              </div>
            </div>
          </div>

          <div className="h-56 w-64 shrink-0 justify-center rounded-lg border-[1px] border-gray-200 bg-white  py-4 px-4">
            <div className="mb-4 text-base font-bold leading-6 text-gray-900">
              Personne contact au sein <br /> de la structure
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

        <div className="grid-rows-7 grid grid-cols-2 items-start gap-y-2 pt-5">
          <div className="text-sm font-normal leading-relaxed text-gray-400 ">Type d’engagement :</div>
          <div className="text-sm leading-relaxed">{equivalence.type}</div>
          {equivalence.sousType ? (
            <>
              <div className="text-sm font-normal leading-relaxed text-gray-400 ">Catégorie :</div>
              <div className="text-sm leading-relaxed">{equivalence.sousType}</div>
            </>
          ) : null}
          {equivalence.desc ? (
            <>
              <div className="text-sm font-normal leading-relaxed text-gray-400 ">Engagement réalisé :</div>
              <div className="text-sm leading-relaxed">{equivalence.desc}</div>
            </>
          ) : null}
          <div className="text-sm font-normal leading-relaxed text-gray-400 ">Structure d’accueil :</div>
          <div className="text-sm leading-relaxed">{equivalence.structureName}</div>
          <div className="text-sm font-normal leading-relaxed text-gray-400 ">Dates :</div>
          <div className="text-sm leading-relaxed">
            Du {formatDateFR(equivalence.startDate)} au {formatDateFR(equivalence.endDate)}
          </div>
          {equivalence.frequency ? (
            <>
              <div className="text-sm font-normal leading-relaxed text-gray-400 ">Fréquence :</div>
              <div className="text-sm lowercase leading-relaxed">
                {equivalence.frequency.nombre} {equivalence.frequency.duree} {equivalence.frequency.frequence}
              </div>
            </>
          ) : null}
          <div className="text-sm font-normal leading-relaxed text-gray-400 ">Adresse :</div>
          <div className="text-sm leading-relaxed">{equivalence.address}</div>
          <div className="text-sm font-normal leading-relaxed text-gray-400 ">Code postal :</div>
          <div className="text-sm leading-relaxed">{equivalence.zip}</div>
          <div className="text-sm font-normal leading-relaxed text-gray-400 ">Ville :</div>
          <div className="text-sm leading-relaxed">{equivalence.city}</div>
        </div>
        {equivalence.status === "WAITING_VERIFICATION" ? (
          <div className="flex -translate-y-4 items-end justify-end">
            <button
              className="mb-2 flex cursor-pointer items-center justify-center rounded-full bg-blue-100 p-2 hover:scale-105"
              onClick={() => history.push(`/phase2/equivalence/${equivalence._id}`)}>
              <Pencil className="text-blue-600" />
            </button>
          </div>
        ) : null}
      </div>
      <ModalFiles
        isOpen={modalFiles?.isOpen}
        onCancel={() => setModalFiles({ isOpen: false })}
        initialValues={equivalence?.files ? equivalence.files : []}
        young={young}
        nameFiles="equivalenceFiles"
      />
    </Modal>
  );
}

const getInitials = (word) =>
  (word || "UK")
    .match(/\b(\w)/g)
    .join("")
    .substring(0, 2)
    .toUpperCase();
