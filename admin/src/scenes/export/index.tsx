import React, { useState } from "react";
import { Button } from "@snu/ds/admin";
import { toastr } from "react-redux-toastr";
import { useParams } from "react-router-dom";
import { useTimeoutFn } from "react-use";
import cx from "classnames";

import { downloadSignedFile } from "@/services/file.service";
import useEnvironment from "@/hooks/useEnvironment";
import Loader from "@/components/Loader";
import { FUNCTIONAL_ERRORS, translate } from "snu-lib";

interface URLParams {
  id: string;
}

export default function ExportPage() {
  const { id } = useParams<URLParams>();
  const { isDevelopment } = useEnvironment();
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  const handleDownloadFile = async () => {
    setIsError(false);
    try {
      await downloadSignedFile(decodeURIComponent(id));
      setIsLoading(false);
    } catch (error) {
      if (error.message === FUNCTIONAL_ERRORS.FILE_NOT_AVAILABLE_FOR_DOWNLOAD) {
        setIsError(true);
        toastr.error("Impossible de télécharger le fichier", "Le fichier n'est plus disponible au téléchargement");
      } else {
        toastr.error("Erreur lors du téléchargement du fichier", translate(error.message));
      }
      setIsLoading(false);
    }
  };

  useTimeoutFn(() => {
    handleDownloadFile();
  }, 3000);

  return (
    <div className="flex flex-col items-center justify-center px-32 min-h-screen gap-2 text-ds-gray-900">
      <div className="flex flex-col items-center justify-center gap-2 mb-10">
        <div className="font-bold text-2xl">Téléchargement du fichier</div>
        {isLoading && (
          <>
            <div className="text-xl">En cours...</div>
            <div className="text-ds-gray-500">
              Veuillez patienter... <Loader />
            </div>
          </>
        )}
      </div>
      {isError && (
        <div className="text-center">
          <div className="text-red-500 text-lg mb-2">Le fichier n'est plus disponible au téléchargement</div>
          <i>Cette situation peut survenir si votre export a expiré. Veuillez générer un nouvel export et utiliser le nouveau lien correspondant.</i>
        </div>
      )}
      {!isError && (
        <>
          <div className="text-center">Si le téléchargement ne démarre pas, veuillez cliquer sur le bouton ci-dessous.</div>
          <Button title="Télécharcher mon export" onClick={handleDownloadFile} className="mb-10" />
          <i className="text-xs">(le fichier n'est disponible que quelques heures après la réception de l'email de confirmation)</i>
        </>
      )}

      <div className={cx("text-center mt-20", { hidden: !isDevelopment })}>
        <b>Debug key:</b> {decodeURIComponent(id)}
      </div>
    </div>
  );
}
