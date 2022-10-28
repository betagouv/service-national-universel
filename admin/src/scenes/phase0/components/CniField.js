import Cni from "../../../assets/icons/Cni";
import { DeleteButton, DownloadButton, MiniTitle, MoreButton } from "./commons";
import React, { useEffect, useState } from "react";
import api from "../../../services/api";
import { download } from "snu-lib";
import { toastr } from "react-redux-toastr";
import CorrectionRequest from "./CorrectionRequest";
import PencilAlt from "../../../assets/icons/PencilAlt";
import CorrectedRequest from "./CorrectedRequest";
import { Modal } from "reactstrap";
import { BorderButton } from "./Buttons";
import ConfirmationModal from "./ConfirmationModal";
import Warning from "../../../assets/icons/Warning";

export function CniField({ young, name, label, mode, onStartRequest, className = "", currentRequest, correctionRequest, onCorrectionRequestChange, onChange }) {
  const [opened, setOpened] = useState(false);
  const [hasValidRequest, setHasValidRequest] = useState(false);
  const [requestButtonClass, setRequestButtonClass] = useState("");
  const [mouseIn, setMouseIn] = useState(false);
  const [cniModalOpened, setCniModalOpened] = useState(false);

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

  function cniModalClose(changes) {
    setCniModalOpened(false);
    if (changes) {
      onChange && onChange();
    }
  }

  return (
    <>
      <div
        className={`p-[30px] bg-[#F9FAFB] rounded-[7px] mb-[15px] flex items-center justify-between ${className}`}
        onMouseEnter={() => setMouseIn(true)}
        onMouseLeave={() => setMouseIn(false)}>
        <div className="shrink-0">
          <Cni />
          <MiniTitle>Pièce d&apos;identité</MiniTitle>
        </div>
        <div className="flex items-center justify-end">
          {mode === "correction" && (
            <div className={requestButtonClass} onClick={startRequest}>
              <PencilAlt className={`w-[14px] h-[14px]  ${hasValidRequest ? "text-white" : "text-[#F97316]"} group-hover:text-white`} />
            </div>
          )}
          <MoreButton className="flex-[0_0_32px] ml-[8px]" onClick={() => setCniModalOpened(true)} />
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
      {cniModalOpened && <CniModal young={young} onClose={cniModalClose} />}
    </>
  );
}

function CniModal({ young, onClose }) {
  const [confirmDeleteModal, setConfirmDeleteModal] = useState(null);
  const [error, setError] = useState(null);
  const [changes, setChanges] = useState(false);
  const [cniFiles, setCniFiles] = useState([]);

  useEffect(() => {
    if (young && young.files && young.files.cniFiles) {
      setCniFiles(young.files.cniFiles);
    } else {
      setCniFiles([]);
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

  function deleteCni(file) {
    setConfirmDeleteModal({ file });
  }

  async function confirmDelete() {
    setError(null);
    const file = confirmDeleteModal.file;
    setConfirmDeleteModal(null);
    if (file) {
      console.log("Delete file: ", file);
      try {
        const res = await api.remove(`/young/${young._id}/documents/cniFiles/${file._id}`);
        if (res.ok) {
          setChanges(true);
          setCniFiles(res.data);
        } else {
          setError("Impossible de supprimer le fichier. Veuillez réessayer dans quelques instants.");
        }
      } catch (err) {
        console.log(err);
        setError("Impossible de supprimer le fichier. Veuillez réessayer dans quelques instants.");
      }
    }
  }

  return (
    <Modal size="md" centered isOpen={true} toggle={() => onClose(changes)}>
      <div className="bg-white rounded-[8px]">
        <div className="p-[24px]">
          {cniFiles.length > 0 ? (
            cniFiles.map((file) => (
              <div key={file._id} className="flex items-center justify-between text-[12px] mt-[8px] border-b-[#E5E7EB] border-b-[1px] last:border-b-[0px] py-[12px]">
                <div className="text-right">{file.name}</div>
                <div className="flex items-center">
                  <DownloadButton className="ml-[8px] flex-[0_0_32px]" onClick={() => downloadCni(file)} />
                  <DeleteButton className="ml-[8px] flex-[0_0_32px]" onClick={() => deleteCni(file)} />
                </div>
              </div>
            ))
          ) : (
            <div className="text-[14px] text-[#6B7280] text-center">Aucune pièce d&apos;identité</div>
          )}
          {error && <div className="text-[#EF4444] text-[12px] leading-[1.4em] mt-[16px]">{error}</div>}
        </div>
        <div className="flex p-[24px] items-center justify-center">
          <BorderButton onClick={() => onClose(changes)}>Fermer</BorderButton>
        </div>
      </div>
      <ConfirmationModal
        isOpen={confirmDeleteModal}
        icon={<Warning className="text-[#D1D5DB] w-[36px] h-[36px]" />}
        title={"Supprimer la pièce"}
        message={"Voulez-vous vraiment supprimer ce fichier ? Cette action est irréversible."}
        confirmText="Confirmer la suppression"
        confirmMode="red"
        onCancel={() => setConfirmDeleteModal(null)}
        onConfirm={confirmDelete}
      />
    </Modal>
  );
}
