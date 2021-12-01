import React, { useState } from "react";
import LoadingButton from "./LoadingButton";
import downloadPDF from "../../utils/download-pdf";

export default function DownloadAllAttestation({ cohesionCenterId, children }) {
  const [loading, setLoading] = useState();

  const viewAttestation = async () => {
    setLoading(true);
    await downloadPDF({
      url: `/cohesion-center/${cohesionCenterId}/certificate`,
      body: { options: { landscape: true } },
      fileName: `attestations.pdf`,
    });
    setLoading(false);
  };
  return (
    <LoadingButton loading={loading} onClick={() => viewAttestation()}>
      {children}
    </LoadingButton>
  );
}
