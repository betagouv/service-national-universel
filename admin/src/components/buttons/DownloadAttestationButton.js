import React, { useState } from "react";
import LoadingButton from "./LoadingButton";
import downloadPDF from "../../utils/download-pdf";

export default ({ young, children, disabled, uri, ...rest }) => {
  const [loading, setLoading] = useState();

  const viewAttestation = async (a) => {
    setLoading(true);
    await downloadPDF({
      url: `/young/${young._id}/certificate/${a}`,
      fileName: `${young.firstName} ${young.lastName} - attestation ${a}.pdf`,
    });
    setLoading(false);
  };
  return (
    <LoadingButton loading={loading} onClick={() => viewAttestation(uri)}>
      {children}
    </LoadingButton>
  );
};
