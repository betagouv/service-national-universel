import React from "react";
import MissionView from "./wrapper";
import { Box } from "../../../components/box";

const formatLongDate = (date) => {
  if (!date) return "-";
  const d = new Date(date);
  return d.toLocaleDateString("fr-FR", { year: "numeric", month: "long", day: "numeric" });
};

export default ({ mission }) => {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", width: "100%" }}>
      <MissionView mission={mission} tab="historic">
        <Box>
          <p style={{ padding: "2rem" }}>Dernière mise à jour : {formatLongDate(mission.updatedAt)}</p>
        </Box>
      </MissionView>
    </div>
  );
};
