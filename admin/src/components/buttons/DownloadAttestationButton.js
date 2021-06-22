import React, { useEffect, useState } from "react";
import { Spinner } from "reactstrap";
import styled from "styled-components";
import api from "../../services/api";
import { environment } from "../../config";
import LoadingButton from "./LoadingButton";

export default ({ young, children, disabled, uri, ...rest }) => {
  const [loading, setLoading] = useState();

  const viewAttestation = async (a) => {
    setLoading(true);
    await downloadPDF({
      url = `/young/${young._id}/certificate/${a}`,
      fileName = `${young.firstName} ${young.lastName} - attestation ${a}.pdf`,
    });
    setLoading(false);
  };
  return (
    <LoadingButton loading={loading} onClick={() => viewAttestation(uri)}>
      {children}
    </LoadingButton>
  );
};
