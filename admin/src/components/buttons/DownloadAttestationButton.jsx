import React, { useState } from "react";
import LoadingButton from "./LoadingButton";
import downloadPDF from "../../utils/download-pdf";

export default function DownloadAttestationButton({ young, children, uri, ...props }) {
  const [loading, setLoading] = useState();

  const viewAttestation = async (a) => {
    setLoading(true);
    await downloadPDF({
      url: `/young/${young._id}/documents/certificate/${a}`,
      fileName: `${young.firstName} ${young.lastName} - attestation ${a}.pdf`,
    });
    setLoading(false);
  };
  return (
    <LoadingButton {...props} color="#EFF6FF" textColor="#5145cd" loading={loading} onClick={() => viewAttestation(uri)}>
      {children}
    </LoadingButton>
  );
}
