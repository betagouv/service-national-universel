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
      <div className="w-full mb-20 px-3 py-2">
        <div className="flex items-center justify-between ">
          <div className={`text-xs font-normal ${theme.background[equivalence.status]} ${theme.text[equivalence.status]} px-2 py-[2px] rounded-sm flex `}>
            {/* <img src={clock} alt="clock icon" className="w-5 h-5 bg-blue-50" /> */}
            {translateEquivalenceStatus(equivalence.status)}
          </div>
          <div className="text-xl " onClick={() => setOpen(false)}>
            x
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex-col items-center ">
            <div className="text-xs font-normal text-gray-500 leading-4 uppercase mt-2">envoyée le {formatDateFR(equivalence.createdAt)}</div>
            <div className="text-base leading-5 font-bold">Ma demande de reconnaissance d’engagement externe</div>
          </div>
        </div>
        {equivalence.status === "WAITING_CORRECTION" && (
          <>
            <div className="flex flex-col justify-between px-2 py-3 rounded-lg bg-gray-50 mb-4 mt-3 gap-6">
              <div className="flex flex-col flex-1">
                <div className="text-base font-semibold">Corrections demandées</div>
                <div className="text-sm text-gray-500">{equivalence.message}</div>
              </div>
              <button
                className="mr-4 border-[1px] w-full border-indigo-600 hover:bg-indigo-600 text-indigo-600 hover:text-white px-4 py-2 rounded-lg"
                onClick={() => history.push(`/phase2/equivalence/${equivalence._id}`)}>
                Corriger ma demande
              </button>
            </div>
          </>
        )}
        {equivalence.status === "REFUSED" && (
          <>
            <div className="flex justify-between items-center px-2 py-3 rounded-lg  mt-3 bg-gray-50 mb-4 gap-6">
              <div className="flex flex-col flex-1">
                <div className="text-base font-semibold">Motif du refus</div>
                <div className="text-sm text-gray-500 w-3/4">{equivalence.message}</div>
              </div>
            </div>
          </>
        )}
        <div className="flex space-x-8  overflow-x-auto mt-3 ">
          <div className="bg-gray-50 w-56 h-56 shrink-0 rounded-lg pt-4">
            <div className="flex flex-col justify-center items-center gap-2 mx-2">
              <SimpleFileIcon />
              <div className="text-sm leading-5 font-bold text-center">
                Document justificatif <br /> d’engagement
              </div>
            </div>
            <div className="flex flex-col justify-end items-end  pr-3 ">
              <div className="transition duration-150 flex rounded-full bg-blue-600 p-2 items-center justify-center hover:scale-110 ease-out hover:ease-in cursor-pointer">
                <Download className=" text-indigo-100 bg-blue-600 " onClick={() => setModalFiles({ isOpen: true })} />
              </div>
            </div>
          </div>

          <div className="bg-white justify-center w-64 h-56 shrink-0 py-4 px-4 border-[1px]  border-gray-200 rounded-lg">
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

        <div className="grid grid-cols-2 grid-rows-7 pt-5 items-start gap-y-2">
          <div className="text-sm leading-relaxed font-normal text-gray-400 ">Type d’engagement :</div>
          <div className="text-sm leading-relaxed">{equivalence.type}</div>
          <div className="text-sm leading-relaxed font-normal text-gray-400 ">Structure d’accueil :</div>
          <div className="text-sm leading-relaxed">{equivalence.structureName}</div>
          <div className="text-sm leading-relaxed font-normal text-gray-400 ">Dates :</div>
          <div className="text-sm leading-relaxed">
            Du {formatDateFR(equivalence.startDate)} au {formatDateFR(equivalence.endDate)}
          </div>
          {equivalence.frequency ? (
            <>
              <div className="text-sm leading-relaxed font-normal text-gray-400 ">Fréquence :</div>
              <div className="text-sm leading-relaxed lowercase">
                {equivalence.frequency.nombre} {equivalence.frequency.duree} {equivalence.frequency.frequence}
              </div>
            </>
          ) : null}
          <div className="text-sm leading-relaxed font-normal text-gray-400 ">Adresse :</div>
          <div className="text-sm leading-relaxed">{equivalence.address}</div>
          <div className="text-sm leading-relaxed font-normal text-gray-400 ">Code postal :</div>
          <div className="text-sm leading-relaxed">{equivalence.zip}</div>
          <div className="text-sm leading-relaxed font-normal text-gray-400 ">Ville :</div>
          <div className="text-sm leading-relaxed">{equivalence.city}</div>
        </div>
        {equivalence.status === "WAITING_VERIFICATION" ? (
          <div className="flex items-end justify-end -translate-y-4">
            <button
              className="flex items-center justify-center rounded-full bg-blue-100 p-2 hover:scale-105 cursor-pointer mb-2"
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
