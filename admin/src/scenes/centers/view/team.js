import React from "react";

import { Box } from "../../../components/box";

export default function Team({ center, focusedCohort }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", width: "100%" }}>
      <Box>
        <div style={{ padding: "2rem" }}>Bientôt Disponible ! On y affichera l&apos;équipe de {focusedCohort}</div>
      </Box>
    </div>
  );
}
