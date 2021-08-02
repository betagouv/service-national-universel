import React, { useState } from "react";
import LoadingButton from "./LoadingButton";
import api from "../../services/api";

export default ({ children }) => {
  const [loading, setLoading] = useState();

  const onClick = async () => {
    setLoading(true);
    await api.post("/contract/download/all");
    setLoading(false);
  };
  return (
    <LoadingButton loading={loading} onClick={onClick}>
      {children}
    </LoadingButton>
  );
};
