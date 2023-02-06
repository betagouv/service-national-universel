import React, { useEffect, useRef, useState } from "react";
import { Modal } from "reactstrap";
import CloseSvg from "../../../../assets/Close";
import { ModalContainer } from "../../../../components/modals/Modal";
import { BorderButton } from "../../../phase0/components/Buttons";
import { DeleteButton, DownloadButton } from "../../../phase0/components/commons";
import AddImage from "../../../../assets/icons/AddImage";
import { toastr } from "react-redux-toastr";
import Loader from "../../../../components/Loader";
import api from "../../../../services/api";
import { capture } from "../../../../sentry";
import { download } from "snu-lib";

const FILE_SIZE_LIMIT = 5 * 1024 * 1024;
const ACCEPTABLE_MIME_TYPES = ["image/jpg", "image/jpeg", "image/png", "application/pdf"];

export default function ModalTimeSchedule({ session, onCancel, onChanged }) {
  useEffect(() => {
    console.log("return of the session: ", session);
    for (const file of session.timeScheduleFiles) {
      console.log(file.name);
    }
  }, [session]);

  function sessionChanged(newSession) {
    console.log("session changed: ", newSession);
    onChanged && onChanged(newSession);
  }

  return (
    <Modal centered isOpen={true} toggle={onCancel}>
      <ModalContainer className="p-8">
        <CloseSvg className="close-icon" height={10} onClick={onCancel} />
        <div className="flex align-center text-xl text-black font-medium">Emploi du temps du séjour</div>
        <div className="w-full">
          {session.timeScheduleFiles && session.timeScheduleFiles.length > 0 ? (
            session.timeScheduleFiles.map((file) => <TimeScheduleFile session={session} file={file} key={file.name} onDelete={onChanged} />)
          ) : (
            <div className="my-8">Aucun emploi du temps pour l&apos;instant.</div>
          )}
          <DropZone session={session} className="my-8" sessionChanged={sessionChanged} />
          <BorderButton mode="grey" onClick={onCancel} className="w-full">
            Fermer
          </BorderButton>
        </div>
      </ModalContainer>
    </Modal>
  );
}

function TimeScheduleFile({ session, file, onDelete, className = "" }) {
  const [communicating, setCommunicating] = useState(false);

  async function deleteFile() {
    setCommunicating(true);
    try {
      const res = await api.remove(`/session-phase1/${session._id}/time-schedule/${file._id}`);
      if (!res.ok) {
        capture(res.code);
        toastr.error("Une erreur s'est produite lors de la suppression du fichier. Veuillez réessayer.");
      } else {
        onDelete && onDelete(res.data);
      }
    } catch (err) {
      toastr.error("Une erreur s'est produite lors de la suppression du fichier. Veuillez réessayer dans quelques instants.");
    }
    setCommunicating(false);
  }

  async function downloadFile() {
    setCommunicating(true);
    try {
      const result = await api.get(`/session-phase1/${session._id}/time-schedule/${file._id}`);
      const blob = new Blob([new Uint8Array(result.data.data)], { type: result.mimeType });
      download(blob, result.fileName);
    } catch (err) {
      toastr.error("Impossible de télécharger le fichier. Veuillez essayer dans quelques instants.");
    }
    setCommunicating(false);
  }

  return (
    <div className={`flex items-center justify-between py-4 border-b-[1px] border-b-gray-200 ${className}`}>
      <div className="grow-1">{file.name}</div>
      {communicating ? (
        <div>
          <Loader size="2rem" className="m-0" />
        </div>
      ) : (
        <div className="flex items-center ml-2">
          <DownloadButton onClick={downloadFile} />
          <DeleteButton mode="gray" className="ml-2" onClick={deleteFile} />
        </div>
      )}
    </div>
  );
}

function DropZone({ session, className = "", sessionChanged }) {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const fileInput = useRef(null);

  function startUpload(e) {
    e.preventDefault();
    if (fileInput && fileInput.current) {
      fileInput.current.click();
    }
  }

  function getFileFromInput(e) {
    if (e && e.target && e.target.files && e.target.files.length > 0) {
      uploadFile(e.target.files[0]);
    }
  }

  function dragIn(e) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  }

  function dragOut(e) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }

  function dropped(e) {
    console.log("dropped: ", e);
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e && e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      uploadFile(e.dataTransfer.files[0]);
    }
  }

  async function uploadFile(file) {
    console.log("Upload File: ", file);
    console.log("type: ", file.type);
    console.log("accept: ", ACCEPTABLE_MIME_TYPES, ACCEPTABLE_MIME_TYPES.findIndex((t) => t === file.type) >= 0);
    if (ACCEPTABLE_MIME_TYPES.findIndex((t) => t === file.type) < 0) {
      toastr.error("Les seules fichiers autorisés sont les images (Jpeg ou Png) et les PDF.");
      return;
    }
    if (file.size > FILE_SIZE_LIMIT) {
      toastr.error("Votre fichier dépasse la limite de 5Mo.");
      return;
    }

    setUploading(true);
    try {
      const res = await api.uploadFile(`/session-phase1/${session._id}/time-schedule`, [file]);
      if (res.code === "FILE_CORRUPTED") {
        setError(
          "Le fichier semble corrompu. Pouvez-vous changer le format ou regénérer votre fichier ? Si vous rencontrez toujours le problème, contactez le support inscription@snu.gouv.fr",
        );
        return;
      }
      if (!res.ok) {
        capture(res.code);
        setError("Une erreur s'est produite lors du téléversement de votre fichier.");
        return;
      }
      sessionChanged(res.session);
    } catch (err) {
      toastr.error("Une erreur est survenue. Nous n'avons pu enregistrer le fichier. Veuillez réessayer dans quelques instants.");
    }
    setUploading(false);
  }

  return (
    <div
      className={`relative border-gray-300 border-[1px] ${dragActive ? "border-solid bg-gray-100" : "border-dashed"} p-4 flex flex-col items-center ${className}`}
      onDragEnter={dragIn}>
      <AddImage className="txt-gray-400 mb-3" />
      <div className="text-sm font-medium text-gray-600">
        <a href="#" onClick={startUpload} className="text-blue-600">
          Téléversez votre fichier
        </a>{" "}
        ou glisser-déposez
      </div>
      <div className="mt-1 text-xs text-gray-500">PDF, PNG, JPG jusqu’à 5Mo</div>
      <input type="file" accept="image/png, image/jpg, application/pdf" ref={fileInput} onChange={getFileFromInput} className="hidden" />
      {dragActive && <div className="absolute left-[0] right-[0] top-[0] bottom-[0]" onDragEnter={dragIn} onDragOver={dragIn} onDragLeave={dragOut} onDrop={dropped}></div>}
      {uploading && (
        <div className="bg-gray-100 absolute left-[0] right-[0] top-[0] bottom-[0] flex flex-col items-center justify-center">
          <div>
            <Loader />
          </div>
          <div className="text-gray-800 text-sm">Téléversement en cours...</div>
        </div>
      )}
      {error && <div className="text-red-500 text-sm py-4">{error}</div>}
    </div>
  );
}
