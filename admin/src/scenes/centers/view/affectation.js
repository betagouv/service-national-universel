import React, { useState } from "react";
import CenterView from "./wrapper";
import { useSelector } from "react-redux";
import { Redirect } from "react-router-dom";

import { Box, BoxContent, BoxHeadTitle } from "../../../components/box";
import ComboBoxYoungs from "../components/ComboBoxYoungs";
import Panel from "../../volontaires/panel";
import { ENABLE_ASSIGN_CENTER, ENABLE_ASSIGN_CENTER_ROLES } from "../../../utils";

export default ({ center, updateCenter }) => {
  const [young, setYoung] = useState(null);
  const user = useSelector((state) => state.Auth.user);

  if (!ENABLE_ASSIGN_CENTER_ROLES.includes(user.role) || !ENABLE_ASSIGN_CENTER) return <Redirect to="/" />;

  return (
    <div style={{ display: "flex", alignItems: "flex-start", width: "100%" }}>
      <CenterView center={center} tab="affectation">
        <Box style={{ minHeight: 0 }}>
          <BoxHeadTitle>Affectez un volontaire au centre</BoxHeadTitle>
          <BoxContent>
            <ComboBoxYoungs center={center} onAffect={updateCenter} onClick={setYoung} />
          </BoxContent>
        </Box>
      </CenterView>
      <Panel value={young} onChange={() => setYoung(null)} />
    </div>
  );
};
