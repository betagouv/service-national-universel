import React from "react";
import { useSelector } from "react-redux";
import { Redirect } from "react-router-dom";

import { ROLES } from "../../../utils";
import WrapperHistory from "./wrapper";
import HistoricComponent from "../../../components/views/Historic";

export default function History({ young }) {
  const user = useSelector((state) => state.Auth.user);
  if (user.role !== ROLES.ADMIN) return <Redirect to="/" />;

  return (
    <div style={{ display: "flex", alignItems: "flex-start", width: "100%" }}>
      <WrapperHistory young={young} tab="historique">
        <HistoricComponent model="young" value={young} />
      </WrapperHistory>
    </div>
  );
}
