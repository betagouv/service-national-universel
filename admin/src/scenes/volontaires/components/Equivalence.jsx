import React from "react";
import { BiCopy } from "react-icons/bi";
import { BsCheck2, BsChevronDown } from "react-icons/bs";
import { BsCircleFill } from "react-icons/bs";
import { HiCheckCircle } from "react-icons/hi";
import { toastr } from "react-redux-toastr";
import Bell from "../../../assets/icons/Bell";
import CheckCircle from "../../../assets/icons/CheckCircle";
import ChevronDown from "../../../assets/icons/ChevronDown";
import Download from "../../../assets/icons/Download";
import ExclamationCircle from "../../../assets/icons/ExclamationCircle";
import SimpleFileIcon from "../../../assets/icons/SimpleFileIcon";
import XCircle from "../../../assets/icons/XCircle";
import { capture } from "../../../sentry";
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
      capture(error);
      toastr.error("Oups, une erreur est survenue");
      return;
    }
  };

  return (
    <>
      <div className="mb-4 flex w-full flex-col rounded-lg bg-white px-4 pt-3 shadow-md">
        <div className="mb-3">
          <div className="flex items-center justify-between px-4">
            <div className="flex items-center">
              <div className="mr-2 flex items-center justify-center rounded-full bg-[#FD7A02] p-2 duration-150">
                <Bell className="h-4 w-4 text-white" />
              </div>
              <div className="flex-col items-center">
                <div className="text-xs font-normal uppercase leading-4 text-gray-500">envoyée le {formatDateFR(equivalence.createdAt)}</div>
                <div className="text-base font-bold leading-5">Demande de reconnaissance d’engagement déjà réalisé</div>
              </div>
            </div>
            {!cardOpen ? (
              <div className="flex items-center gap-5">
                <div className={`text-xs font-normal ${themeBadge.background[equivalence.status]} ${themeBadge.text[equivalence.status]} rounded-sm px-2 py-[2px] `}>
                  {translateEquivalenceStatus(equivalence.status)}
                </div>
                <BsChevronDown className="h-5 w-5 cursor-pointer text-gray-400" onClick={() => setCardOpen(true)} />
              </div>
            ) : (
              <>
                {equivalence.status === "WAITING_VERIFICATION" ? (
                  <div className="flex items-center gap-5">
                    <button
                      className="group flex items-center justify-center rounded-lg px-4 py-2 shadow-ninaButton transition duration-300 ease-in-out hover:bg-indigo-400"
                      onClick={() => setModalStatus({ isOpen: true, status: "WAITING_CORRECTION", equivalenceId: equivalence._id })}>
                      <ExclamationCircle className="mr-2 h-5 w-5 text-indigo-400 group-hover:text-white" />
                      <span className="text-sm font-medium leading-5 text-gray-700 group-hover:text-white">Demander une correction</span>
                    </button>
                    <button
                      className="ease-in-ou flex items-center justify-center rounded-lg bg-green-500 px-4 py-2 transition duration-300 hover:bg-green-400"
                      onClick={() => setModalStatus({ isOpen: true, status: "VALIDATED", equivalenceId: equivalence._id })}>
                      <CheckCircle className="mr-2 h-5 w-5 text-green-500 hover:bg-green-400" />
                      <span className="text-sm font-medium leading-5 text-white">Valider</span>
                    </button>
                    <button
                      className="ease-in-ou flex items-center justify-center rounded-lg bg-red-500 px-4 py-2 transition duration-300 hover:bg-red-400"
                      onClick={() => setModalStatus({ isOpen: true, status: "REFUSED", equivalenceId: equivalence._id })}>
                      <XCircle className="mr-2 h-5 w-5 text-red-500 hover:bg-red-400" />
                      <span className="text-sm font-medium leading-5 text-white">Refuser</span>
                    </button>
                    <BsChevronDown className="h-5 w-5 rotate-180 cursor-pointer text-gray-400" onClick={() => setCardOpen(false)} />
                  </div>
                ) : (
                  <div className="flex items-center gap-5 ">
                    <div className="rounded-lg border-[1px] border-gray-300 px-3 py-2.5">
                      <div className="relative" ref={ref}>
                        <button
                          className="flex min-w-[200px] cursor-pointer items-center justify-between disabled:cursor-wait disabled:opacity-50"
                          onClick={() => setOpen((e) => !e)}>
                          <div className="flex items-center gap-2">
                            <BsCircleFill className={theme[equivalence.status]} />
                            <span className="text-sm font-normal leading-5">{translate(equivalence?.status)}</span>
                          </div>
                          <ChevronDown className="ml-2 cursor-pointer text-gray-400" />
                        </button>
                        {/* display options */}
                        <div className={`${open ? "block" : "hidden"}  absolute left-0 top-[35px] z-50 min-w-full overflow-hidden rounded-lg bg-white shadow transition`}>
                          {optionsStatus.map((option) => (
                            <div
                              key={option}
                              className={`${option === equivalence?.status && "bg-gray font-bold"}`}
                              // eslint-disable-next-line react/jsx-no-duplicate-props
                              onClick={() => {
                                setModalStatus({ isOpen: true, status: option, equivalenceId: equivalence._id });
                                setOpen(false);
                              }}>
                              <div className="group flex cursor-pointer items-center justify-between gap-2 p-2 px-3 text-sm leading-5 hover:bg-gray-50">
                                <div>{translate(option)}</div>
                                {option === equivalence?.type ? <BsCheck2 /> : null}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    <BsChevronDown className="h-5 w-5 rotate-180 cursor-pointer text-gray-400" onClick={() => setCardOpen(false)} />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
        {cardOpen ? (
          <>
            <hr className="mb-3 text-gray-200" />
            <div className="mb-3 flex items-stretch justify-around gap-4">
              <div className="grid grid-cols-2 py-2">
                <div className="flex flex-col gap-y-4 text-sm font-normal leading-none text-gray-400">
                  <span>Type d’engagement :</span>
                  {equivalence.sousType ? <span>Catégorie :</span> : null}
                  {equivalence.desc ? <span>Descriptif :</span> : null}
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
                  {equivalence.desc ? <span>{equivalence.otherType}</span> : null}
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

const getInitials = (word) => {
  const initials = (word || "UK")
    .match(/\b(\w)/g)
    ?.join("")
    ?.substring(0, 2)
    ?.toUpperCase();
  return initials || "";
};
