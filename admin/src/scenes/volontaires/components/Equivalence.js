import React from "react";
import { BiCopy } from "react-icons/bi";
import { BsCheck2, BsChevronDown } from "react-icons/bs";
import { GoPrimitiveDot } from "react-icons/go";
import { HiCheckCircle } from "react-icons/hi";
import { toastr } from "react-redux-toastr";
import Bell from "../../../assets/icons/Bell";
import CheckCircle from "../../../assets/icons/CheckCircle";
import ChevronDown from "../../../assets/icons/ChevronDown";
import Download from "../../../assets/icons/Download";
import ExclamationCircle from "../../../assets/icons/ExclamationCircle";
import SimpleFileIcon from "../../../assets/icons/SimpleFileIcon";
import XCircle from "../../../assets/icons/XCircle";
import api from "../../../services/api";
import { copyToClipboard, formatDateFR, translate, translateEquivalenceStatus } from "../../../utils";
import ModalChangeStatus from "./ModalChangeStatus";
import ModalFilesEquivalence from "./ModalFilesEquivalence";

export default function CardEquivalence({ young, equivalence }) {
  const optionsStatus = ["WAITING_CORRECTION", "REFUSED", "VALIDATED"];
  const [copied, setCopied] = React.useState(false);
  const [modalFiles, setModalFiles] = React.useState({ isOpen: false });
  const [modalStatus, setModalStatus] = React.useState({ isOpen: false });

  const ref = React.useRef(null);
  const [open, setOpen] = React.useState(false);
  const [cardOpen, setCardOpen] = React.useState(false);
  React.useEffect(() => {
    if (copied) {
      setTimeout(() => setCopied(false), 3000);
    }
  }, [copied]);

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside, true);
    return () => {
      document.removeEventListener("click", handleClickOutside, true);
    };
  }, []);

  const theme = {
    WAITING_CORRECTION: "text-[#4484FF] h-4 w-4",
    VALIDATED: "text-[#27AF66] h-4 w-4",
    REFUSED: "text-[#EF6737] h-4 w-4",
  };

  const themeBadge = {
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

  const onChangeFiles = async ({ data, equivalenceId }) => {
    try {
      const { ok } = await api.put(`/young/${young._id.toString()}/phase2/equivalence/${equivalenceId}`, { files: data });
      if (!ok) {
        toastr.error("Oups, une erreur est survenue");
        return;
      }
      toastr.success("Fichier téléversé");
    } catch (error) {
      toastr.error("Oups, une erreur est survenue");
      return;
    }
  };

  return (
    <>
      <div className="flex flex-col w-full rounded-lg bg-white px-4 pt-3 mb-4 shadow-md">
        <div className="mb-3">
          <div className="flex items-center justify-between px-4">
            <div className="flex items-center">
              <div className="duration-150 flex rounded-full bg-[#FD7A02] p-2 items-center justify-center mr-2">
                <Bell className="h-4 w-4 text-white" />
              </div>
              <div className="flex-col items-center ">
                <div className="text-xs font-normal text-gray-500 leading-4 uppercase">envoyée le {formatDateFR(equivalence.createdAt)}</div>
                <div className="text-base leading-5 font-bold">Demande de reconnaissance d’engagement déjà réalisé</div>
              </div>
            </div>
            {!cardOpen ? (
              <div className="flex items-center gap-5">
                <div className={`text-xs font-normal ${themeBadge.background[equivalence.status]} ${themeBadge.text[equivalence.status]} px-2 py-[2px] rounded-sm `}>
                  {translateEquivalenceStatus(equivalence.status)}
                </div>
                <BsChevronDown className="text-gray-400 h-5 w-5 cursor-pointer" onClick={() => setCardOpen(true)} />
              </div>
            ) : (
              <>
                {equivalence.status === "WAITING_VERIFICATION" ? (
                  <div className="flex items-center gap-5 ">
                    <button
                      className="group flex items-center justify-center rounded-lg shadow-ninaButton px-4 py-2 hover:bg-indigo-400 transition duration-300 ease-in-out"
                      onClick={() => setModalStatus({ isOpen: true, status: "WAITING_CORRECTION", equivalenceId: equivalence._id })}>
                      <ExclamationCircle className="text-indigo-400 mr-2 w-5 h-5 group-hover:text-white" />
                      <span className="text-sm leading-5 font-medium text-gray-700 group-hover:text-white">Demander une correction</span>
                    </button>
                    <button
                      className="flex items-center justify-center rounded-lg px-4 py-2 bg-green-500 hover:bg-green-400 transition duration-300 ease-in-ou"
                      onClick={() => setModalStatus({ isOpen: true, status: "VALIDATED", equivalenceId: equivalence._id })}>
                      <CheckCircle className="text-green-500 mr-2 w-5 h-5 hover:bg-green-400" />
                      <span className="text-sm leading-5 font-medium text-white">Valider</span>
                    </button>
                    <button
                      className="flex items-center justify-center rounded-lg px-4 py-2 bg-red-500 hover:bg-red-400 transition duration-300 ease-in-ou"
                      onClick={() => setModalStatus({ isOpen: true, status: "REFUSED", equivalenceId: equivalence._id })}>
                      <XCircle className="text-red-500 mr-2 w-5 h-5 hover:bg-red-400" />
                      <span className="text-sm leading-5 font-medium text-white">Refuser</span>
                    </button>
                    <BsChevronDown className="text-gray-400 h-5 w-5 rotate-180 cursor-pointer" onClick={() => setCardOpen(false)} />
                  </div>
                ) : (
                  <div className="flex items-center gap-5 ">
                    <div className="border-[1px] border-gray-300 rounded-lg px-3 py-2.5">
                      <div className="relative" ref={ref}>
                        <button
                          className="flex justify-between items-center cursor-pointer disabled:opacity-50 disabled:cursor-wait min-w-[200px]"
                          onClick={() => setOpen((e) => !e)}>
                          <div className="flex items-center gap-2">
                            <GoPrimitiveDot className={theme[equivalence.status]} />
                            <span className="text-sm leading-5 font-normal">{translate(equivalence?.status)}</span>
                          </div>
                          <ChevronDown className="ml-2 text-gray-400 cursor-pointer" />
                        </button>
                        {/* display options */}
                        <div className={`${open ? "block" : "hidden"}  rounded-lg min-w-full bg-white transition absolute left-0 shadow overflow-hidden z-50 top-[35px]`}>
                          {optionsStatus.map((option) => (
                            <div
                              key={option}
                              className={`${option === equivalence?.status && "font-bold bg-gray"}`}
                              // eslint-disable-next-line react/jsx-no-duplicate-props
                              onClick={() => {
                                setModalStatus({ isOpen: true, status: option, equivalenceId: equivalence._id });
                                setOpen(false);
                              }}>
                              <div className="group flex justify-between items-center gap-2 p-2 px-3 text-sm leading-5 hover:bg-gray-50 cursor-pointer">
                                <div>{translate(option)}</div>
                                {option === equivalence?.type ? <BsCheck2 /> : null}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    <BsChevronDown className="text-gray-400 h-5 w-5 rotate-180 cursor-pointer" onClick={() => setCardOpen(false)} />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
        {cardOpen ? (
          <>
            <hr className="mb-3 text-gray-200" />
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

        <ModalChangeStatus
          isOpen={modalStatus?.isOpen}
          onCancel={() => setModalStatus({ isOpen: false, value: null })}
          status={modalStatus?.status}
          equivalenceId={modalStatus?.equivalenceId}
          young={young}
        />
        <ModalFilesEquivalence
          isOpen={modalFiles?.isOpen}
          onCancel={() => setModalFiles({ isOpen: false })}
          initialValues={equivalence?.files ? equivalence.files : []}
          young={young}
          nameFiles="equivalenceFiles"
          equivalenceId={equivalence?._id}
          onChange={onChangeFiles}
        />
      </div>
    </>
  );
}

const getInitials = (word) =>
  (word || "UK")
    .match(/\b(\w)/g)
    .join("")
    .substring(0, 2)
    .toUpperCase();
