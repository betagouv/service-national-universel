import Cni from "../../../assets/icons/Cni";
import { DownloadButton, MiniTitle, MoreButton } from "./commons";
import React, { useEffect, useState } from "react";
import api from "../../../services/api";
import { download } from "snu-lib";
import { toastr } from "react-redux-toastr";
import CorrectionRequest from "./CorrectionRequest";
import PencilAlt from "../../../assets/icons/PencilAlt";

export function CniField({ young, name, label, mode, onStartRequest, className = "", currentRequest, correctionRequest, onCorrectionRequestChange }) {
  const [opened, setOpened] = useState(false);
  const [hasValidRequest, setHasValidRequest] = useState(false);
  const [requestButtonClass, setRequestButtonClass] = useState("");

  useEffect(() => {
    setOpened(currentRequest === name);
  }, [currentRequest]);

  useEffect(() => {
    setHasValidRequest(correctionRequest ? correctionRequest.status !== "CANCELED" : false);
  }, [correctionRequest]);

  useEffect(() => {
    setRequestButtonClass(
      `flex items-center justify-center mr-[8px] w-[32px] h-[32px] rounded-[100px] cursor-pointer group ${hasValidRequest ? "bg-[#F97316]" : "bg-[#FFEDD5]"} hover:bg-[#F97316]`,
    );
  }, [hasValidRequest]);

  async function downloadCni() {
    if (young && young.files && young.files.cniFiles && young.files.cniFiles.length > 0) {
      const lastCniFile = young.files.cniFiles[young.files.cniFiles.length - 1];
      try {
        const result = await api.get("/young/" + young._id + "/documents/cniFiles/" + lastCniFile._id);
        const blob = new Blob([new Uint8Array(result.data.data)], { type: result.mimeType });
        download(blob, result.fileName);
      } catch (err) {
        toastr.error("Impossible de télécharger la CNI. Veuillez essayer dans quelques instants.");
      }
    } else {
      toastr.error("Impossible de télécharger la CNI. Veuillez essayer dans quelques instants.");
    }
  }

  function startRequest() {
    setOpened(true);
    onStartRequest && onStartRequest(name);
  }

  return (
    <>
      <div className={`p-[30px] bg-[#F9FAFB] rounded-[7px] mb-[15px] flex items-center justify-between ${className}`}>
        <div>
          <Cni />
          <MiniTitle>Pièce d&apos;identité</MiniTitle>
        </div>
        <div className="flex items-center">
          {mode === "correction" && (
            <div className={requestButtonClass} onClick={startRequest}>
              <PencilAlt className={`w-[14px] h-[14px]  ${hasValidRequest ? "text-white" : "text-[#F97316]"} group-hover:text-white`} />
            </div>
          )}
          <DownloadButton className="mr-[8px]" onClick={downloadCni} />
          {/*TODO: à remettre en mode modification */}
          {false && <MoreButton />}
        </div>
      </div>
      {opened && <CorrectionRequest name={name} label={label} correctionRequest={correctionRequest} onChangeRequest={onCorrectionRequestChange} />}
    </>
  );
}
