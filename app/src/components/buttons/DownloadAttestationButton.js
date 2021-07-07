import React, { useState } from "react";
import { Spinner } from "reactstrap";
import downloadPDF from "../../utils/download-pdf";

export default ({ young, children, disabled, uri, ...rest }) => {
  const [loading, setLoading] = useState();

  const viewAttestation = async (a) => {
    setLoading(true);
    await downloadPDF({
      url: `/young/${young._id}/documents/certificate/${a}`,
      body: { options: { landscape: true } },
      fileName: `${young.firstName} ${young.lastName} - attestation ${a}.pdf`,
    });
    setLoading(false);
  };
  return (
    <div {...rest} onClick={() => viewAttestation(uri)}>
      {loading ? <Spinner size="sm" style={{ borderWidth: "0.1em" }} /> : children}
    </div>
  );
};
