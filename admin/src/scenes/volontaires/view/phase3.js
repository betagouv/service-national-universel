import React from "react";
import { Col, Row } from "reactstrap";
import styled from "styled-components";

import { YOUNG_PHASE, YOUNG_STATUS_PHASE3 } from "../../../utils";
import WrapperPhase3 from "./wrapper";
import SelectStatus from "../../../components/selectStatus";
import DownloadAttestationButton from "../../../components/buttons/DownloadAttestationButton";
import { Box, BoxTitle } from "../../../components/box";

export default ({ young }) => {
  const getText = () => {
    if (young.statusPhase3 === YOUNG_STATUS_PHASE3.WAITING_VALIDATION) return "Le tuteur n'a pas encore validé la mission";
    if (young.statusPhase3 === YOUNG_STATUS_PHASE3.VALIDATED) return "Le tuteur a validé la mission";
  };

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
        {young.statusPhase3 !== YOUNG_STATUS_PHASE3.WAITING_REALISATION ? (
          <Box>
            <Row>
              <Col md={6} style={{ borderRight: "2px solid #f4f5f7" }}>
                <Bloc title="Mission de phase 3 réalisée">
                  <p style={{ flex: 1 }}>{getText()}</p>
                  <Details title="Structure" value={young.phase3StructureName} />
                  <Details title="Descriptif" value={young.phase3MissionDescription} />
                </Bloc>
              </Col>
              <Col md={6}>
                <Bloc title="Tuteur">
                  <Details title="Prénom" value={young.phase3TutorFirstName} />
                  <Details title="Nom" value={young.phase3TutorLastName} />
                  <Details title="E-mail" value={young.phase3TutorEmail} />
                  <Details title="Téléphone" value={young.phase3TutorPhone} />
                </Bloc>
              </Col>
            </Row>
          </Box>
        ) : null}
        {young.statusPhase3 === "VALIDATED" ? (
          <DownloadAttestationButton young={young} uri="3">
            Télécharger l'attestation de réalisation de la phase 3
          </DownloadAttestationButton>
        ) : null}
      </WrapperPhase3>
    </div>
  );
};

const Details = ({ title, value }) => {
  if (!value) return <div />;
  if (typeof value === "function") value = value();
  return (
    <div className="detail">
      <div className="detail-title">{`${title} :`}</div>
      <div className="detail-text">{value}</div>
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
          <BoxTitle>{title}</BoxTitle>
        </div>
        {children}
      </Wrapper>
    </Row>
  );
};

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
