import React, { useEffect, useState } from "react";
import { Col, Row } from "reactstrap";
import styled from "styled-components";
import { Link } from "react-router-dom";

import { translate } from "../../../utils";
import Wrapper from "./wrapper";
import api from "../../../services/api";
import Avatar from "../../../components/Avatar";

export default ({ young }) => {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", width: "100%" }}>
      <Wrapper young={young} tab="phase2">
        <Box>
          <p style={{ padding: "2rem" }}>Tic tac tic tac</p>
        </Box>
      </Wrapper>
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
