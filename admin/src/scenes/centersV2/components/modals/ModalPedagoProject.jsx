import React, { useState } from "react";
import { Modal } from "reactstrap";
import CloseSvg from "../../../../assets/Close";
import { ModalContainer } from "../../../../components/modals/Modal";
import { BorderButton } from "../../../phase0/components/Buttons";
import { DownloadButton } from "@/scenes/phase0/components/commons/DownloadButton";
import { toastr } from "react-redux-toastr";
import Loader from "../../../../components/Loader";
import api from "../../../../services/api";
import { download } from "snu-lib";

// Consultation seule : le téléversement et la suppression de fichiers ont été supprimés.
export default function ModalPedagoProject({ session, onCancel }) {
  return (
    <Modal centered isOpen={true} toggle={onCancel}>
      <ModalContainer className="p-8">
        <CloseSvg className="close-icon" height={10} onClick={onCancel} />
        <div className="align-center flex text-xl font-medium text-black">Projet pédagogique du séjour</div>
        <div className="w-full">
          {session.pedagoProjectFiles && session.pedagoProjectFiles.length > 0 ? (
            session.pedagoProjectFiles.map((file) => <PedagoProjectFile session={session} file={file} key={file.name} />)
          ) : (
            <div className="my-8">Aucun projet pédagogique pour l&apos;instant.</div>
          )}
          <BorderButton mode="grey" onClick={onCancel} className="w-full">
            Fermer
          </BorderButton>
        </div>
      </ModalContainer>
    </Modal>
  );
}

function PedagoProjectFile({ session, file, className = "" }) {
  const [communicating, setCommunicating] = useState(false);

  async function downloadFile() {
    setCommunicating(true);
    try {
      const result = await api.get(`/session-phase1/${session._id}/pedago-project/${file._id}`);
      const blob = new Blob([new Uint8Array(result.data.data)], { type: result.mimeType });
      download(blob, result.fileName);
    } catch (err) {
      toastr.error("Impossible de télécharger le fichier. Veuillez réessayer dans quelques instants.");
    }
    setCommunicating(false);
  }

  return (
    <div className={`flex items-center justify-between border-b-[1px] border-b-gray-200 py-4 ${className}`}>
      <div className="grow-1">{file.name.substring(0, 25)}</div>
      {communicating ? (
        <div>
          <Loader size="2rem" className="m-0" />
        </div>
      ) : (
        <div className="ml-2 flex items-center">
          <DownloadButton onClick={downloadFile} />
        </div>
      )}
    </div>
  );
}
