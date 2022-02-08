import React, { useState } from "react";
import LoadingButton from "./LoadingButton";
import downloadPDF from "../../utils/download-pdf";

export default function DownloadAllAttestation({ sessionPhase1, children }) {
  const [loading, setLoading] = useState();

  const viewAttestation = async () => {
    setLoading(true);
    await downloadPDF({
      url: `/session-phase1/${sessionPhase1}/certificate`,
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
