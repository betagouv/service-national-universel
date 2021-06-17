import React, { useState } from "react";
import api from "../../services/api";
import LoadingButton from "./LoadingButton";

export default ({ young, children, disabled, uri }) => {
  const [loading, setLoading] = useState();

  const viewContract = async (contractId) => {
    setLoading(true);
    const file = await api.openpdf(`/contract/${contractId}/download`);
    const fileName = `${young.firstName} ${young.lastName} - contrat ${contractId}.pdf`;
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
    <LoadingButton loading={loading} onClick={() => viewContract(uri)}>
      {children}
    </LoadingButton>
  );
};
