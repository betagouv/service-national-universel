import React, { useState } from "react";
import LoadingButton from "./LoadingButton";
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
    <LoadingButton loading={loading} onClick={onClick}>
      {children}
    </LoadingButton>
  );
};
