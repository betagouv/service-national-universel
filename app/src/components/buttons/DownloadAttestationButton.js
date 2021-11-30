import React, { useState } from "react";
import { Spinner } from "reactstrap";
import styled from "styled-components";

import { colors } from "../../utils";
import downloadPDF from "../../utils/download-pdf";

const DownloadAttestationButton = ({ young, children, uri, ...rest }) => {
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
    <PrimaryStyle {...rest} onClick={() => viewAttestation(uri)}>
      {loading ? <Spinner size="sm" style={{ borderWidth: "0.1em" }} /> : children}
    </PrimaryStyle>
  );
};

export default DownloadAttestationButton;

export const PrimaryStyle = styled.div`
  font-size: 0.9rem;
  color: ${colors.purple};
  cursor: pointer;
  :hover {
    color: ${colors.darkPurple};
    text-decoration: underline;
  }
`;
