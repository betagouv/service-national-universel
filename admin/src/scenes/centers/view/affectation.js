import React, { useState } from "react";
import CenterView from "./wrapper";
import Box from "../components/Box";
import BoxContent from "../components/BoxContent";
import BoxTitle from "../components/BoxTitle";
import ComboBoxYoungs from "../components/ComboBoxYoungs";
import Panel from "../../volontaires/panel";

export default ({ center, updateCenter }) => {
  const [young, setYoung] = useState(null);
  return (
    <div style={{ display: "flex", alignItems: "flex-start", width: "100%" }}>
      <CenterView center={center} tab="affectation">
        <Box style={{ minHeight: 0 }}>
          <BoxTitle>Affectez un volontaire au centre</BoxTitle>
          <BoxContent>
            <ComboBoxYoungs center={center} onAffect={updateCenter} onClick={setYoung} />
          </BoxContent>
        </Box>
      </CenterView>
      <Panel value={young} onChange={() => setYoung(null)} />
    </div>
  );
};
