import React, { useState } from "react";
import { Spinner } from "reactstrap";
import api from "../../services/api";

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
    <div {...rest} onClick={() => viewAttestation(uri)}>
      {loading ? <Spinner size="sm" style={{ borderWidth: "0.1em" }} /> : children}
    </div>
  );
};
