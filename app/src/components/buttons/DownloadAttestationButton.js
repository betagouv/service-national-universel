import React, { useEffect, useState } from "react";
import { Spinner } from "reactstrap";
import styled from "styled-components";
import api from "../../services/api";
import { environment } from "../../config";

export default ({ young, children, disabled, uri, ...rest }) => {
  const [loading, setLoading] = useState();

  const viewAttestation = async (a) => {
    setLoading(true);
    const file = await api.openpdf(`/young/${young._id}/certificate/${a}`, { options: { landscape: true } });
    const fileName = `${young.firstName} ${young.lastName} - attestation ${a}.pdf`;
    if (window.navigator.msSaveOrOpenBlob) {
      //IE11 & Edge
      window.navigator.msSaveOrOpenBlob(file, fileName);
    } else {
      //Other browsers
      const a = document.createElement("a");
      document.body.appendChild(a);
      a.href = URL.createObjectURL(file);
      a.download = fileName;
      a.click();
    }
    setLoading(false);
  };
  return (
    <DownloadButton {...rest} onClick={() => viewAttestation(uri)}>
      {loading ? <Spinner size="sm" style={{ borderWidth: "0.1em" }} /> : children}
    </DownloadButton>
  );
};

const DownloadButton = styled.span`
  display: block;
  color: #b4c6fc;
  font-size: 12px;
  font-weight: 400;
  cursor: pointer;
  text-align: center;
  :hover {
    text-decoration: underline;
    color: #fff;
  }
`;
