import UploadedFileIcon from "@/assets/icons/UploadedFileIcon";
import React, { useEffect, useState } from "react";
import CorrectionRequest from "./CorrectionRequest";
import PencilAlt from "@/assets/icons/PencilAlt";
import CorrectedRequest from "./CorrectedRequest";
import { HiDotsVertical, HiExclamation, HiOutlineInformationCircle } from "react-icons/hi";
import ReactTooltip from "react-tooltip";
import { isBefore } from "date-fns";
import classNames from "classnames";
import { CniModal } from "./CniModal";

export function CniField({
  young,
  name,
  label,
  mode,
  onStartRequest,
  className = "",
  currentRequest,
  correctionRequest,
  onCorrectionRequestChange,
  onChange,
  blockUpload = false,
  onInscriptionChange = null,
}) {
  const [opened, setOpened] = useState(false);
  const [hasValidRequest, setHasValidRequest] = useState(false);
  const [requestButtonClass, setRequestButtonClass] = useState("");
  const [mouseIn, setMouseIn] = useState(false);
  const [cniModalOpened, setCniModalOpened] = useState(false);
  const isDatePassed = young.latestCNIFileExpirationDate ? isBefore(new Date(young.latestCNIFileExpirationDate), new Date()) : false;

  useEffect(() => {
    setOpened(currentRequest === name);
  }, [currentRequest]);

  useEffect(() => {
    setHasValidRequest(correctionRequest ? correctionRequest.status !== "CANCELED" : false);
  }, [correctionRequest]);

  useEffect(() => {
    setRequestButtonClass(
      `flex items-center justify-center w-[32px] h-[32px] rounded-[100px] cursor-pointer group ${
        hasValidRequest ? "bg-[#F97316]" : "bg-[#FFEDD5] " // + (mouseIn ? "visible" : "invisible")
      } hover:bg-[#F97316]`,
    );
  }, [mouseIn, hasValidRequest]);

  function startRequest() {
    setOpened(true);
    onStartRequest && onStartRequest(name);
  }

  const reasons = [
    { value: "UNREADABLE", label: "Pièce illisible (supprimer le(s) fichier(s))" },
    { value: "MISSING_FRONT", label: "Recto à fournir" },
    { value: "NOT_SUITABLE", label: "Pièce ne convenant pas... (supprimer le(s) fichier(s))", defaultMessage: "Passeport ou carte nationale d'identité requis." },
    { value: "OTHER", label: "Autre (supprimer le(s) fichier(s))" },
  ];

  if (young?.latestCNIFileCategory !== "PASSPORT") {
    reasons.push({ value: "MISSING_BACK", label: "Verso à fournir" });
  }

  function cniModalClose(changes, value) {
    setCniModalOpened(false);
    if (changes) {
      onInscriptionChange && onInscriptionChange(young);
      onChange && onChange("files", { cniFiles: value });
    }
  }

  return (
    <>
      <div
        className={classNames(
          "mb-[15px]",
          "flex",
          "items-center",
          "justify-between",
          "rounded-[7px]",
          "p-[30px]",
          {
            "bg-amber-50": isDatePassed,
            "border-l-8": isDatePassed,
            "border-amber-500": isDatePassed,
            "bg-gray-50": !isDatePassed,
          },
          className,
        )}
        onMouseEnter={() => setMouseIn(true)}
        onMouseLeave={() => setMouseIn(false)}>
        <div className="shrink-0 flex">
          <UploadedFileIcon />
          <div className="text-sm leading-5 font-medium">
            <div className="flex mt-3 ml-2">
              <p>Pièce d'identité</p>
              {isDatePassed && (
                <>
                  <HiOutlineInformationCircle size={20} className="ml-2 text-gray-900" data-tip data-for={"CNI-tooltip"} />
                  <ReactTooltip id={"CNI-tooltip"} type="light" place="top" effect="solid" className="custom-tooltip-radius rounded-md !opacity-100 !shadow-md">
                    <div className={"w-[275px] list-outside !px-1 !py-2 text-left text-xs font-normal text-gray-600 "}>
                      {"La date de péremption de la CNI est dépassé, pensez à vérifier qu’il n’y ait pas d’erreur de saisie."}
                    </div>
                  </ReactTooltip>
                </>
              )}
            </div>
            {isDatePassed && (
              <div className="flex ml-2 mt-2">
                <HiExclamation size={20} className="text-amber-400 mr-2" />
                <p className="text-amber-800">Date de validité dépassée</p>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center justify-end gap-2">
          {mode === "correction" && (
            <div className={requestButtonClass} onClick={startRequest}>
              <PencilAlt className={`h-[14px] w-[14px]  ${hasValidRequest ? "text-white" : "text-[#F97316]"} group-hover:text-white`} />
            </div>
          )}
          <button
            className={classNames("rounded-full", "p-2.5", {
              "bg-amber-100": isDatePassed,
              "bg-gray-100": !isDatePassed,
            })}
            onClick={() => setCniModalOpened(true)}>
            <HiDotsVertical size={16} className={classNames({ "text-amber-500": isDatePassed, "text-gray-500": !isDatePassed })} />
          </button>
        </div>
      </div>
      {correctionRequest && correctionRequest.status === "CORRECTED" && (
        <CorrectedRequest correctionRequest={correctionRequest} reasons={reasons} className="mt-[-6px] mb-[15px]" young={young} />
      )}
      {opened && (
        <CorrectionRequest
          name={name}
          label={label}
          correctionRequest={correctionRequest}
          onChangeRequest={onCorrectionRequestChange}
          reasons={young.latestCNIFileCategory ? reasons : reasons.filter(({ value }) => !["MISSING_FRONT", "MISSING_BACK"].includes(value))}
          messagePlaceholder="(Facultatif) Précisez les corrections à apporter ici"
        />
      )}
      {cniModalOpened && <CniModal young={young} onClose={cniModalClose} mode={mode} blockUpload={blockUpload} />}
    </>
  );
}
