import Cni from "../../../assets/icons/Cni";
import { DownloadButton, MiniTitle, MoreButton } from "./commons";
import React, { useEffect, useState } from "react";
import api from "../../../services/api";
import { download } from "snu-lib";
import { toastr } from "react-redux-toastr";
import CorrectionRequest from "./CorrectionRequest";
import PencilAlt from "../../../assets/icons/PencilAlt";
import CorrectedRequest from "./CorrectedRequest";

export function CniField({ young, name, label, mode, onStartRequest, className = "", currentRequest, correctionRequest, onCorrectionRequestChange }) {
  const [opened, setOpened] = useState(false);
  const [hasValidRequest, setHasValidRequest] = useState(false);
  const [requestButtonClass, setRequestButtonClass] = useState("");
  const [mouseIn, setMouseIn] = useState(false);
  const [cniButtons, setCniButtons] = useState([]);

  useEffect(() => {
    setOpened(currentRequest === name);
  }, [currentRequest]);

  useEffect(() => {
    setHasValidRequest(correctionRequest ? correctionRequest.status !== "CANCELED" : false);
  }, [correctionRequest]);

  useEffect(() => {
    setRequestButtonClass(
      `flex items-center justify-center w-[32px] h-[32px] rounded-[100px] cursor-pointer group ${
        hasValidRequest ? "bg-[#F97316]" : "bg-[#FFEDD5] " + (mouseIn ? "visible" : "invisible")
      } hover:bg-[#F97316]`,
    );
  }, [mouseIn, hasValidRequest]);

  useEffect(() => {
    if (young && young.files && young.files.cniFiles && young.files.cniFiles.length > 0) {
      setCniButtons(
        young.files.cniFiles.map((file) => (
          <div key={file._id} className="flex items-center justify-end text-[12px] mt-[8px]">
            <div className="text-right">{file.name}</div>
            <DownloadButton className="ml-[8px] flex-[0_0_32px]" onClick={() => downloadCni(file)} />
          </div>
        )),
      );
    } else {
      setCniButtons(null);
    }
  }, [young]);

  async function downloadCni(cniFile) {
    try {
      const result = await api.get("/young/" + young._id + "/documents/cniFiles/" + cniFile._id);
      const blob = new Blob([new Uint8Array(result.data.data)], { type: result.mimeType });
      download(blob, result.fileName);
    } catch (err) {
      toastr.error("Impossible de télécharger la pièce. Veuillez essayer dans quelques instants.");
    }
  }

  function startRequest() {
    setOpened(true);
    onStartRequest && onStartRequest(name);
  }

  const reasons = [
    { value: "UNREADABLE", label: "Pièce illisible" },
    { value: "MISSING_FRONT", label: "Recto à fournir" },
    { value: "MISSING_BACK", label: "Verso à fournir" },
    { value: "NOT_SUITABLE", label: "Pièce ne convenant pas...", defaultMessage: "Passeport ou carte nationale d'identité requis." },
    { value: "OTHER", label: "Autre" },
  ];

  return (
    <>
      <div
        className={`p-[30px] bg-[#F9FAFB] rounded-[7px] mb-[15px] flex items-start justify-between ${className}`}
        onMouseEnter={() => setMouseIn(true)}
        onMouseLeave={() => setMouseIn(false)}>
        <div className="shrink-0">
          <Cni />
          <MiniTitle>Pièce d&apos;identité</MiniTitle>
        </div>
        <div className="grow">
          <div className="flex items-center justify-end">
            {mode === "correction" && (
              <div className={requestButtonClass} onClick={startRequest}>
                <PencilAlt className={`w-[14px] h-[14px]  ${hasValidRequest ? "text-white" : "text-[#F97316]"} group-hover:text-white`} />
              </div>
            )}
            {/*TODO: à remettre en mode modification */}
            {false && <MoreButton />}
          </div>
          <div className="mt-[16px]">{cniButtons}</div>
        </div>
      </div>
      {correctionRequest && correctionRequest.status === "CORRECTED" && (
        <CorrectedRequest correctionRequest={correctionRequest} reasons={reasons} className="mt-[-6px] mb-[15px]" />
      )}
      {opened && (
        <CorrectionRequest
          name={name}
          label={label}
          correctionRequest={correctionRequest}
          onChangeRequest={onCorrectionRequestChange}
          reasons={reasons}
          messagePlaceholder="(Facultatif) Précisez les corrections à apporter ici"
        />
      )}
    </>
  );
}
