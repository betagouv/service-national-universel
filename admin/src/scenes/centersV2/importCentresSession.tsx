import React, { ChangeEvent, useRef, useState } from "react";
import { HiOutlineDocumentAdd } from "react-icons/hi";
import ReactLoading from "react-loading";

import { MIME_TYPES } from "snu-lib";

import { capture } from "@/sentry";
import api from "@/services/api";

import { Button, Container } from "@snu/ds/admin";

import { toastr } from "react-redux-toastr";
import { FILE_SIZE_LIMIT } from "./import";

export default function ImportCentresSessions() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  function importFile(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    setUploadError(null);
    if (fileInput && fileInput.current) {
      fileInput.current.click();
    }
  }

  async function handleUpload(e: ChangeEvent<HTMLInputElement>) {
    if (!e?.target?.files?.length) return;
    const file = e.target.files[0];
    setUploadError(null);
    if (file.type !== MIME_TYPES.EXCEL) {
      setUploadError("Le fichier doit être au format Excel.");
      return;
    }
    if (file.size > FILE_SIZE_LIMIT) {
      setUploadError("Votre fichier dépasse la limite de 5Mo.");
      return;
    }

    setIsUploading(true);
    try {
      const res = await api.uploadFiles(`/session-phase1/import`, [file]);
      if (res.code === "FILE_CORRUPTED") {
        setUploadError("Le fichier semble corrompu. Pouvez-vous changer le format ou regénérer votre fichier ? Si vous rencontrez toujours le problème, contactez le support.");
      } else if (!res.ok) {
        toastr.error("Une erreur est survenue lors de l'import du fichier des centres de sessions", "");
        capture(res.code);
        setUploadError("Le fichier des centres de sessions doit contenir : " + res.code);
      } else {
        toastr.success("Succès", "Fichier importé avec succès");
        const { data: base64Data, mimeType, fileName } = res;
        const binaryData = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0));

        const blob = new Blob([binaryData], { type: mimeType });
        const url = window.URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();

        a.remove();
        window.URL.revokeObjectURL(url);
      }
    } catch (err) {
      setUploadError("La requête étant trop longue, nous vous avons envoyé un mail avec le fichier de résultat.");
    }
    setIsUploading(false);
  }

  return (
    <Container>
      <div className="mt-8 flex w-full flex-col items-center justify-center bg-white rounded-xl px-8 pt-12 pb-24">
        <div className="bg-gray-50 w-full flex-col pb-5">
          <h1 className="text-lg leading-6 font-medium text-gray-900 text-center mt-12 mb-2">Mettre à jour les sessions</h1>
          <p className="text-sm leading-5 font-normal text-gray-500 text-center mb-12">Importez votre fichier (au format .xlsx jusqu’à 5Mo)</p>

          {!isUploading ? (
            <>
              <Button
                onClick={importFile}
                className="cursor-pointer text-center mx-auto text-blue-600"
                leftIcon={<HiOutlineDocumentAdd className="mt-0.5 mr-2" size={20} />}
                title="Téléversez votre fichier"></Button>
              <input type="file" accept={MIME_TYPES.EXCEL} ref={fileInput} onChange={handleUpload} className="hidden" />
              {uploadError && <div className="mt-8 text-center text-sm font-bold text-red-900">{uploadError}</div>}
            </>
          ) : (
            <>
              <div className="mx-auto flex justify-center mb-2">
                <p>Temps Estimé : 1 minute</p>
              </div>
              <ReactLoading className="mx-auto" type="spin" color="#2563EB" width={"40px"} height={"40px"} />
            </>
          )}
        </div>
      </div>
    </Container>
  );
}
