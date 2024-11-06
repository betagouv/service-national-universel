import UploadedFileIcon from "../../../assets/icons/UploadedFileIcon";
import React, { useEffect, useRef, useState } from "react";
import { download } from "snu-lib";
import MiniSwitch from "./MiniSwitch";
import api from "../../../services/api";
import { toastr } from "react-redux-toastr";
import Warning from "../../../assets/icons/Warning";
import ConfirmationModal from "./ConfirmationModal";
import { capture } from "../../../sentry";
import { MiniTitle } from "./commons/MiniTitle";
import { DownloadButton } from "./commons/DownloadButton";
import { MoreButton } from "./commons/MoreButton";

export function FileField({ young, label, className = "", onChange, mode, statusField, fileType, updateYoung }) {
  const [opened, setOpened] = useState(false);
  const [file, setFile] = useState(null);
  const [confirmDeleteModal, setConfirmDeleteModal] = useState(false);

  const optionsRef = useRef();
  const fileUploader = useRef();

  useEffect(() => {
    function handleClickOutside(e) {
      if (optionsRef.current) {
        let target = e.target;
        while (target) {
          if (target === optionsRef.current) {
            return;
          }
          target = target.parentNode;
        }
        setOpened(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (young && young.files && young.files[fileType] && young.files[fileType].length > 0) {
      setFile(young.files[fileType][young.files[fileType].length - 1]);
    } else {
      setFile(null);
    }
  }, [young]);

  async function downloadFile() {
    try {
      const result = await api.get("/young/" + young._id + "/documents/" + fileType + "/" + file._id);
      const blob = new Blob([new Uint8Array(result.data.data)], { type: result.mimeType });
      download(blob, result.fileName);
    } catch (err) {
      toastr.error("Impossible de télécharger la pièce. Veuillez réessayer dans quelques instants.");
    }
  }

  function changeImageRightFileStatus() {
    if (young[statusField] === "VALIDATED") {
      onChange && onChange(statusField, "WAITING_CORRECTION");
    } else {
      onChange && onChange(statusField, "VALIDATED");
    }
  }

  function startUploadFile() {
    setOpened(false);
    if (fileUploader && fileUploader.current) {
      fileUploader.current.click();
    }
  }

  async function uploadFile(files) {
    if (files && files.length > 0) {
      const file = files[0];

      if (file.size > 5000000) {
        return toastr.error(`Ce fichier ${file.name} est trop volumineux.`);
      }
      const res = await api.uploadFiles(`/young/${young._id}/documents/${fileType}`, [file], {});
      if (res.code === "FILE_CORRUPTED")
        return toastr.error(
          "Le fichier semble corrompu. Pouvez-vous changer le format ou regénérer votre fichier ? Si vous rencontrez toujours le problème, contactez le support inscription@snu.gouv.fr",
        );
      if (!res.ok) {
        capture(res.code);
        toastr.error("Une erreur s'est produite lors du téléversement de votre fichier.");
        return;
      }
      if (res.data) {
        setFile(res.data[res.data.length - 1]);
        toastr.success("Fichier téléversé.");
        updateYoung && updateYoung();
      }
    }
  }

  function deleteFile() {
    setOpened(false);
    setConfirmDeleteModal(true);
  }

  async function confirmDelete() {
    setConfirmDeleteModal(false);
    if (file) {
      try {
        const res = await api.remove(`/young/${young._id}/documents/${fileType}/${file._id}`);
        if (res.ok) {
          if (res.data && res.data.length > 0) {
            setFile(res.data[res.data.length - 1]);
          } else {
            setFile(null);
          }
          updateYoung && updateYoung();
          toastr.success("Fichier supprimé.");
        } else {
          toastr.error("Impossible de supprimer le fichier. Veuillez réessayer dans quelques instants.");
        }
      } catch (err) {
        console.log(err);
        toastr.error("Impossible de supprimer le fichier. Veuillez réessayer dans quelques instants.");
      }
    }
  }

  return (
    <>
      <div ref={optionsRef} className={`mb-[15px] flex items-center justify-between rounded-[7px] bg-[#F9FAFB] p-[30px] ${className}`}>
        <div className="shrink-0">
          <UploadedFileIcon />
        </div>
        <MiniTitle className="grow text-left">{label}</MiniTitle>
        <div className="relative ml-[8px] flex items-center justify-end">
          {file && <DownloadButton className="flex-[0_0_32px]" onClick={() => downloadFile()} />}
          {mode === "edition" && <MoreButton className="ml-[8px] flex-[0_0_32px]" onClick={() => setOpened(!opened)} />}
          {opened && (
            <div className="absolute right-[0px] top-[105%] z-10 mt-[-1] overflow-hidden rounded-[6px] border-[1px] border-[#E5E7EB] bg-white text-[#1F2937] shadow-[0px_8px_16px_-3px_rgba(0,0,0,0.05)]">
              {statusField && file && (
                <div
                  className="flex cursor-pointer items-center whitespace-nowrap bg-[#FFFFFF] py-[6px] px-[15px] text-[14px] text-[#374151] hover:bg-[#E5E7EB] hover:text-[#000000]"
                  onClick={changeImageRightFileStatus}>
                  <MiniSwitch value={young.imageRightFilesStatus === "VALIDATED"} className="mr-[6px]" />
                  Accord : {young.imageRightFilesStatus === "VALIDATED" ? "oui" : "non"}
                </div>
              )}
              <div
                className="cursor-pointer whitespace-nowrap bg-[#FFFFFF] py-[6px] px-[15px] text-[14px] text-[#374151] hover:bg-[#E5E7EB] hover:text-[#000000]"
                onClick={startUploadFile}>
                Téléverser le document
              </div>
              {file && (
                <div
                  className="cursor-pointer whitespace-nowrap bg-[#FFFFFF] py-[6px] px-[15px] text-[14px] text-[#374151] hover:bg-[#E5E7EB] hover:text-[#000000]"
                  onClick={deleteFile}>
                  Supprimer le document
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <ConfirmationModal
        isOpen={confirmDeleteModal}
        icon={<Warning className="h-[36px] w-[36px] text-[#D1D5DB]" />}
        title={"Supprimer le fichier"}
        message={"Voulez-vous vraiment supprimer ce fichier ? Cette action est irréversible."}
        confirmText="Confirmer la suppression"
        confirmMode="red"
        onCancel={() => setConfirmDeleteModal(null)}
        onConfirm={confirmDelete}
      />
      <input
        ref={fileUploader}
        type="file"
        id="file-upload-imageRight"
        name="file-upload-imageRight"
        accept=".png, .jpg, .jpeg, .pdf"
        onChange={(e) => uploadFile(e.target.files)}
        className="hidden"
      />
    </>
  );
}
