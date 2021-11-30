import React, { useState } from "react";
import downloadPDF from "../../utils/download-pdf";
import LoadingButton from "./LoadingButton";

export default function DownloadContractButton({ young, children, uri }) {
  const [loading, setLoading] = useState();

  const viewContract = async (contractId) => {
    setLoading(true);
    await downloadPDF({
      url: `/contract/${contractId}/download`,
      fileName: `${young.firstName} ${young.lastName} - contrat ${contractId}.pdf`,
    });
    setLoading(false);
  };
  return (
    <LoadingButton loading={loading} onClick={() => viewContract(uri)}>
      {children}
    </LoadingButton>
  );
}
