import React, { useState } from "react";
import { Col, Row } from "reactstrap";
import styled from "styled-components";

import { translate as t, YOUNG_PHASE, YOUNG_STATUS_PHASE2, getLimitDateForPhase2 } from "../../../utils";
import WrapperPhase2 from "./wrapper";
import ApplicationList from "./applicationList.js";
import SelectStatus from "../../../components/selectStatus";
import Badge from "../../../components/Badge";
import DownloadAttestationButton from "../../../components/buttons/DownloadAttestationButton";
import { Box, BoxTitle } from "../../../components/box";

export default ({ young, onChange }) => {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", width: "100%" }}>
      <WrapperPhase2 young={young} tab="phase2">
        <Box>
          <Bloc title="Réalisation d'une mission d'intérêt général">
            <div style={{ display: "flex" }}>
              <p style={{ flex: 1 }}>
                Le volontaire doit achever sa phase 2 avant le <b>{getLimitDateForPhase2(young.cohort)}</b>
              </p>
              <SelectStatus hit={young} statusName="statusPhase2" phase={YOUNG_PHASE.INTEREST_MISSION} options={Object.keys(YOUNG_STATUS_PHASE2)} />
            </div>
          </Bloc>
        </Box>
        <ToggleBox>
          <Row>
            <Col md={12}>
              <Bloc title="Préférences de missions renseignées par le volontaire" borderBottom></Bloc>
            </Col>
            <Col
              md={6}
              style={{
                borderRight: "2px solid #f4f5f7",
              }}
            >
              <Bloc borderBottom>
                <Details title="Domaines">{young.domains && young.domains.map((d, i) => <Badge key={i} text={t(d)} />)}</Details>
                <Details title="Projet professionnel">
                  {young.professionnalProject ? (
                    <div>
                      {t(young.professionnalProject)} {young.professionnalProjectPrecision ? `(${t(young.professionnalProjectPrecision)})` : null}
                    </div>
                  ) : null}
                </Details>
              </Bloc>
              <Bloc>
                <Details title="Période privilégiée">
                  <div style={{ fontWeight: 600 }}>{t(young.period)}</div>
                  {young.periodRanking && young.periodRanking.map((p, i) => <div key={i} style={{ marginLeft: "1rem" }}>{`${i + 1}. ${t(p)}`}</div>)}
                </Details>
                <Details title="Mission à proximité de">
                  {young.mobilityNearHome === "true" ? <div>Votre domicile</div> : null}
                  {young.mobilityNearSchool === "true" ? <div>Votre établissement</div> : null}
                  {young.mobilityNearRelative === "true" ? (
                    <>
                      <div>Hébergement chez un proche</div>
                      <div style={{ marginLeft: "1rem" }}>{`${young.mobilityNearRelativeName} • ${young.mobilityNearRelativeZip}`}</div>
                    </>
                  ) : null}
                </Details>
                <Details title="Transports privilégiés">
                  {young.mobilityTransport &&
                    young.mobilityTransport.map((transport, i) => (
                      <div key={i}>
                        {t(transport)} {transport === "OTHER" ? `(${young.mobilityTransportOther})` : null}
                      </div>
                    ))}
                </Details>
              </Bloc>
            </Col>
            <Col md={6}>
              <Bloc>
                <Details title="Format préféré" value={t(young.missionFormat)} />
                <Details title="Engagement parallèle">
                  <div style={{ fontWeight: 600 }}>{t(young.engaged)}</div>
                  <div style={{ marginLeft: "1rem", fontStyle: "italic" }}>{young.engagedDescription}</div>
                </Details>
                <Details title="Précision additonnelles">
                  <div style={{ fontStyle: "italic" }}>{young.desiredLocation}</div>
                </Details>
              </Bloc>
            </Col>
          </Row>
        </ToggleBox>
        <Box>
          <ApplicationList young={young} onChangeApplication={onChange} />
        </Box>
        {young.statusPhase2 === "VALIDATED" ? (
          <DownloadAttestationButton young={young} uri="2">
            Télécharger l'attestation de réalisation de la phase 2
          </DownloadAttestationButton>
        ) : null}
      </WrapperPhase2>
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

const Details = ({ title, value, children }) => {
  // if (!value) return <div />;
  if (typeof value === "function") value = value();
  return (
    <div className="detail">
      <Col md={5}>
        <div className="detail-title">{`${title} :`}</div>
      </Col>
      <Col md={7}>
        {value ? <div className="detail-text">{value || "Ceci est vide"}</div> : null}
        {children ? children : null}
      </Col>
    </div>
  );
};

const ToggleBox = ({ children }) => {
  const [hide, setHide] = useState(true);
  const toggle = () => {
    setHide(!hide);
  };
  return (
    <>
      <Box hide={hide} style={{ borderBottomLeftRadius: 0, borderBottomRightRadius: 0, marginBottom: 0 }}>
        {children}
      </Box>
      <Box style={{ borderTopLeftRadius: 0, borderTopRightRadius: 0, marginTop: 0 }}>
        <SeeMore onClick={toggle}>
          {hide ? (
            <>
              Voir plus
              <svg width="9" height="7" viewBox="0 0 9 7" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M-5.2078e-08 1.69141L4.5 6.5L9 1.69141L7.88505 0.5L4.5 4.11719L1.11495 0.5L-5.2078e-08 1.69141Z" fill="#5245CC" />
              </svg>
            </>
          ) : (
            <>
              Voir Moins
              <svg width="10" height="7" viewBox="0 0 10 7" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9.5 5.30859L5 0.5L0.5 5.30859L1.61495 6.5L5 2.88281L8.38505 6.5L9.5 5.30859Z" fill="#5245CC" />
              </svg>
            </>
          )}
        </SeeMore>
      </Box>
    </>
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

const SeeMore = styled.div`
  cursor: pointer;
  color: #5245cc;
  font-size: 0.9rem;
  font-weight: 400;
  text-transform: uppercase;
  text-align: center;
  padding: 1rem;
  border-top: 2px solid #f4f5f7;
  > * {
    margin: 0.25rem;
  }
`;
