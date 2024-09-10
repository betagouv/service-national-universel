import React from "react";
import { usePendingAction } from "@/hooks/usePendingAction";
import { downloadCertificatesByClassId } from "@/services/convocation.service";
import { FUNCTIONAL_ERRORS } from "snu-lib";

export default function ButtonCertificateDownload({ title, type, id, setIsLoading }) {
  const [isConvocationDownloading, handleConvocationDownload] = usePendingAction() as [boolean, any];

  const handleCertificateDownload = async () => {
    setIsLoading(true);

    const getErrorMessage = (error) => {
      let errorMessage = "Téléchargement des certificats impossible";
      if (FUNCTIONAL_ERRORS.TOO_MANY_YOUNGS_IN_CLASSE === error.code) {
        errorMessage = "Le nombre de certificat est trop élevé";
      }
      return errorMessage;
    };

    try {
      await handleConvocationDownload(
        downloadCertificatesByClassId(id, type),
        "Téléchargement des certificats en cours",
        "Les certificats ont bien été téléchargées",
        getErrorMessage,
      );
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <button type="button" className="flex items-center justify-start w-full text-sm leading-5 font-normal" onClick={handleCertificateDownload} disabled={isConvocationDownloading}>
      {title}
    </button>
  );
}
