import React from "react";

import StructureView from "./wrapper";
import { Box } from "../../../components/box";

const formatLongDate = (date) => {
  if (!date) return "-";
  const d = new Date(date);
  return d.toLocaleDateString("fr-FR", { year: "numeric", month: "long", day: "numeric" });
};

export default ({ structure }) => {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", width: "100%" }}>
      <StructureView structure={structure} tab="historic">
        <Box>
          <p style={{ padding: "2rem" }}>Dernière mise à jour : {formatLongDate(structure.updatedAt)}</p>
        </Box>
      </StructureView>
    </div>
  );
};
