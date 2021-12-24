import React from "react";

import CenterView from "./wrapper";
import { Box } from "../../../components/box";

export default function Team({ center }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", width: "100%" }}>
      <CenterView center={center} tab="equipe">
        <Box>
          <div style={{ padding: "2rem" }}>Bientôt Disponible !</div>
        </Box>
      </CenterView>
    </div>
  );
}
