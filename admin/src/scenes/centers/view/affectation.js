import React, { useState } from "react";
import CenterView from "./wrapper";
import { useSelector } from "react-redux";
import { Redirect } from "react-router-dom";

import { Box, BoxContent, BoxHeadTitle } from "../../../components/box";
import ComboBoxYoungs from "../components/ComboBoxYoungs";
import Panel from "../../volontaires/panel";
import { canAssignCohesionCenter } from "../../../utils";
import Details from "./details";

export default function Affectation({ center, updateCenter }) {
  const [young, setYoung] = useState(null);
  const user = useSelector((state) => state.Auth.user);

  if (!canAssignCohesionCenter(user)) return <Redirect to="/" />;

  return (
    <div style={{ display: "flex", alignItems: "flex-start", width: "100%" }}>
      <div style={{ displey: "flex", flexDirection: "column", flex: "1" }}>
        <Details center={center} />
        <CenterView center={center} tab="affectation">
          <Box style={{ minHeight: 0 }}>
            <BoxHeadTitle>Affectez un volontaire au centre</BoxHeadTitle>
            <BoxContent>
              <ComboBoxYoungs center={center} onAffect={updateCenter} onClick={setYoung} />
            </BoxContent>
          </Box>
        </CenterView>
      </div>
      <Panel value={young} onChange={() => setYoung(null)} />
    </div>
  );
}
