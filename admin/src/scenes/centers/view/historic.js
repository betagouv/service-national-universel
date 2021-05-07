import React from "react";
import styled from "styled-components";
import MissionView from "./wrapper";

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

const Box = styled.div`
  width: ${(props) => props.width || 100}%;
  height: 100%;
  background-color: #fff;
  filter: drop-shadow(0px 2px 4px rgba(0, 0, 0, 0.05));
  margin-bottom: 33px;
  border-radius: 8px;
`;
