import React, { useState } from "react";
import { Spinner } from "reactstrap";
import api from "../../services/api";

export default ({ young, children, disabled, uri, ...rest }) => {
  const [loading, setLoading] = useState();

  const onClick = async () => {
    setLoading(true);
    await api.post(`/young/${young._id}/documents/certificate/${uri}/send-email`, {
      fileName: `${young.firstName} ${young.lastName} - attestation ${uri}.pdf`,
    });
    setLoading(false);
  };
  return (
    <div {...rest} onClick={onClick}>
      {loading ? <Spinner size="sm" style={{ borderWidth: "0.1em" }} /> : children}
    </div>
  );
};
