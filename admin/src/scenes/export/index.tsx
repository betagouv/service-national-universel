import React, { useState } from "react";
import { Button } from "@snu/ds/admin";
import { toastr } from "react-redux-toastr";
import { useParams } from "react-router-dom";
import { useTimeoutFn } from "react-use";
import cx from "classnames";

import { downloadSecuredFile } from "@/services/file.service";
import useEnvironment from "@/hooks/useEnvironment";
import Loader from "@/components/Loader";

interface URLParams {
  id: string;
}

export default function ExportPage() {
  const { id } = useParams<URLParams>();
  const { isDevelopment } = useEnvironment();
  const [isLoading, setIsLoading] = useState(true);

  const handleDownloadFile = async () => {
    try {
      await downloadSecuredFile(decodeURIComponent(id));
      setIsLoading(false);
    } catch (error) {
      toastr.error("Erreur lors du téléchargement du fichier", error.message);
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
      <div className="text-center">Si le téléchargement ne démarre pas, veuillez cliquer sur le bouton ci-dessous.</div>

      <Button title="Télécharcher mon export" onClick={handleDownloadFile} className="mb-10" />
      <i className="text-xs">(le fichier n'est disponible que quelques heures après la réception de de l'email de confirmation)</i>
      <div className={cx("text-center mt-20", { hidden: !isDevelopment })}>
        <b>Debug key:</b> {decodeURIComponent(id)}
      </div>
    </div>
  );
}
