import UploadedFileIcon from "@/assets/icons/UploadedFileIcon";
import React, { useEffect, useState } from "react";
import CorrectionRequest from "./CorrectionRequest";
import PencilAlt from "@/assets/icons/PencilAlt";
import CorrectedRequest from "./CorrectedRequest";
import { HiDotsVertical, HiOutlineInformationCircle, HiInformationCircle } from "react-icons/hi";
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
          "rounded-[7px]",
          "px-4",
          "py-6",
          {
            "bg-indigo-50": isDatePassed,
            "border-l-8": isDatePassed,
            "border-indigo-400": isDatePassed,
            "bg-gray-50": !isDatePassed,
          },
          className,
        )}
        onMouseEnter={() => setMouseIn(true)}
        onMouseLeave={() => setMouseIn(false)}>
        <div className={cx("flex", "w-full", { "justify-between": !isDatePassed })}>
          <div className="w-2/10">
            <UploadedFileIcon />
          </div>
          <div className={classNames("text-sm", "leading-5", "font-medium", "w-7/10", { flex: !isDatePassed, "items-center": !isDatePassed })}>
            <div className="flex ml-2">
              <p>Pièce d'identité</p>
              {isDatePassed && (
                <>
                  <HiOutlineInformationCircle size={20} className="ml-2 text-gray-900" data-tip data-for={"CNI-tooltip"} />
                  <ReactTooltip id={"CNI-tooltip"} type="light" place="top" effect="solid" className="custom-tooltip-radius rounded-md !opacity-100 !shadow-md">
                    <div className={"w-[275px] list-outside !px-1 !py-2 text-left text-xs font-normal text-gray-600 "}>
                      {"La date de péremption de la CNI est dépassée, pensez à vérifier qu’il n’y ait pas d’erreur de saisie (non bloquant pour la validation du dossier)."}
                    </div>
                  </ReactTooltip>
                </>
              )}
            </div>
            {isDatePassed && (
              <div className="flex">
                <HiInformationCircle size={30} className="text-indigo-500 mr-2" />
                <p className="text-indigo-700">
                  Date de validité dépassée (non bloquant pour la validation du dossier).{" "}
                  <a href=" https://support.snu.gouv.fr/base-de-connaissance/instruction-des-dossiers-par-les-referents" className="underline" target="_blank">
                    Plus d’infos
                  </a>
                </p>
              </div>
            )}
          </div>
          <div className="w-1/10 flex items-center ml-auto">
            {mode === "correction" && (
              <div className={requestButtonClass} onClick={startRequest}>
                <PencilAlt className={`h-[14px] w-[14px]  ${hasValidRequest ? "text-white" : "text-[#F97316]"} group-hover:text-white`} />
              </div>
            )}
            <button
              className={classNames("rounded-full", "p-2.5", {
                "bg-indigo-100": isDatePassed,
                "bg-gray-100": !isDatePassed,
              })}
              onClick={() => setCniModalOpened(true)}>
              <HiDotsVertical size={16} className={classNames({ "text-indigo-500": isDatePassed, "text-gray-500": !isDatePassed })} />
            </button>
          </div>
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
