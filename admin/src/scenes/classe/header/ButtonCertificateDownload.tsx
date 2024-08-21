import React from "react";
import { usePendingAction } from "@/hooks/usePendingAction";
import { downloadCertificatesByClassId } from "@/services/convocation.service";
import { FUNCTIONAL_ERRORS } from "snu-lib";

export default function ButtonCertificateDownload({ id }) {
  const [isConvocationDownloading, handleConvocationDownload] = usePendingAction() as [boolean, any];

  const handleCertificateDownload = () => {
    const getErrorMessage = (error) => {
      let errorMessage = "Téléchargement des convocations impossible";
      if (FUNCTIONAL_ERRORS.TOO_MANY_YOUNGS_IN_CLASSE === error.code) {
        errorMessage = "Le nombre de convocations est trop élevé";
      }
      return errorMessage;
    };
    handleConvocationDownload(downloadCertificatesByClassId(id), "Téléchargement des convocations en cours", "Les convocations ont bien été téléchargées", getErrorMessage);
  };
  return (
    <button type="button" className="flex items-center justify-start w-full text-sm leading-5 font-normal" onClick={handleCertificateDownload} disabled={isConvocationDownloading}>
      Convocations au séjour (.pdf)
    </button>
  );
}
