import React, { useState } from "react";
import { Col, Row } from "reactstrap";
import styled from "styled-components";
import { useSelector } from "react-redux";

import { translate as t, YOUNG_PHASE, YOUNG_STATUS_PHASE3 } from "../../../utils";
import WrapperPhase3 from "./wrapper";
import SelectStatus from "../../../components/selectStatus";

export default ({ young }) => {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", width: "100%" }}>
      <WrapperPhase3 young={young} tab="phase3">
        <Box>
          <Bloc title="Réalisation d'une nouvelle mission d'intérêt général">
            <div style={{ display: "flex" }}>
              <p style={{ flex: 1 }}>Le volontaire doit réaliser sa phase 3 avant ses 25 ans.</p>
              {young.statusPhase3 ? <SelectStatus hit={young} statusName="statusPhase3" phase={YOUNG_PHASE.CONTINUE} options={Object.keys(YOUNG_STATUS_PHASE3)} /> : null}
            </div>
          </Bloc>
        </Box>
      </WrapperPhase3>
    </div>
  );
};

const Bloc = ({ children, title, borderBottom, borderRight, borderLeft, disabled }) => {
  return (
    <Row
      style={{
        borderBottom: borderBottom ? "2px solid #f4f5f7" : 0,
        borderRight: borderRight ? "2px solid #f4f5f7" : 0,
        borderLeft: borderLeft ? "2px solid #f4f5f7" : 0,
        backgroundColor: disabled ? "#f9f9f9" : "transparent",
      }}
    >
      <Wrapper>
        <div style={{ display: "flex" }}>
          <Legend>{title}</Legend>
        </div>
        {children}
      </Wrapper>
    </Row>
  );
};

const Box = styled.div`
  width: ${(props) => props.width || 100}%;
  height: 100%;
  max-height: ${({ hide }) => (hide ? "20rem" : "none")};
  ${({ hide }) => (hide ? "overflow: hidden;" : "")};
  background-color: #fff;
  filter: drop-shadow(0px 2px 4px rgba(0, 0, 0, 0.05));
  margin-bottom: 33px;
  border-radius: 8px;
`;

const Wrapper = styled.div`
  padding: 3rem;
  width: 100%;
  .detail {
    display: flex;
    align-items: flex-start;
    font-size: 14px;
    text-align: left;
    margin-top: 1rem;
    &-title {
      color: #798399;
    }
    &-text {
      color: rgba(26, 32, 44);
    }
  }
  p {
    font-size: 13px;
    color: #798399;
    margin-top: 1rem;
  }
`;

const Legend = styled.div`
  color: rgb(38, 42, 62);
  font-size: 1.3rem;
  font-weight: 500;
`;
