import React, { useEffect, useState } from "react";
import { Spinner } from "reactstrap";
import styled from "styled-components";
import api from "../../services/api";
import { environment } from "../../config";
import LoadingButton from "./LoadingButton";

export default ({ cohesionCenterId, children, disabled, uri }) => {
  const [loading, setLoading] = useState();

  const viewAttestation = async () => {
    setLoading(true);
    const file = await api.openpdf(`/cohesion-center/${cohesionCenterId}/certificate`, { options: { landscape: true } });
    const fileName = `attestations.pdf`;
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
    <LoadingButton loading={loading} onClick={() => viewAttestation()}>
      {children}
    </LoadingButton>
  );
};
