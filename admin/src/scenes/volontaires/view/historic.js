import React, { useEffect, useState } from "react";
import { Col, Row } from "reactstrap";
import styled from "styled-components";
import { Link } from "react-router-dom";

import { translate } from "../../../utils";
import StructureView from "./wrapper";
import api from "../../../services/api";
import Avatar from "../../../components/Avatar";

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

const Box = styled.div`
  width: ${(props) => props.width || 100}%;
  height: 100%;
  background-color: #fff;
  filter: drop-shadow(0px 2px 4px rgba(0, 0, 0, 0.05));
  margin-bottom: 33px;
  border-radius: 8px;
`;
