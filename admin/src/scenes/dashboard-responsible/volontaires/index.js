import React from "react";
import styled from "styled-components";
import { Col, Row } from "reactstrap";
import { toastr } from "react-redux-toastr";

import { colors, copyToClipboard } from "../../../utils";
import Applications from "./applications";

export default ({ referentManagerPhase2 }) => {
  return (
    <>
      <Row style={{}}>
        <Col md={6}>
          <Title>Volontaires</Title>
        </Col>
        {referentManagerPhase2 ? (
          <Col md={6}>
            <ReferentInfo>
              {`Contacter mon référent départemental Phase 2 (${referentManagerPhase2.department}) - ${referentManagerPhase2.firstName} ${referentManagerPhase2.lastName} :`}
              <div className="email">{`${referentManagerPhase2.email}`}</div>
              <div
                className="icon"
                onClick={() => {
                  copyToClipboard(referentManagerPhase2.email);
                  toastr.success(`'${referentManagerPhase2.email}' a été copié dans le presse papier.`);
                }}
              />
            </ReferentInfo>
          </Col>
        ) : null}
      </Row>
      <Applications />
    </>
  );
};

// Title line with filters
const Title = styled.h2`
  color: #242526;
  font-weight: bold;
  font-size: 28px;
  margin-bottom: 10px;
`;

const ReferentInfo = styled.div`
  display: flex;
  justify-content: flex-end;
  color: ${colors.grey};
  .email {
    color: ${colors.purple};
    margin-left: 0.5rem;
  }
  .icon {
    cursor: pointer;
    margin: 0 0.5rem;
    width: 15px;
    height: 15px;
    background: ${`url(${require("../../../assets/copy.svg")})`};
    background-repeat: no-repeat;
    background-position: center;
    background-size: 15px 15px;
  }
`;
