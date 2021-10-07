import React, { useState } from "react";
import { Col, Row } from "reactstrap";
import styled from "styled-components";

import { translate as t, YOUNG_PHASE, YOUNG_STATUS_PHASE2, getLimitDateForPhase2, ENABLE_PM, colors } from "../../../utils";
import WrapperPhase2 from "./wrapper";
import ApplicationList from "./applicationList.js";
import Phase2MilitaryPreparation from "./phase2MilitaryPreparation";
import SelectStatus from "../../../components/selectStatus";
import Badge from "../../../components/Badge";
import DownloadAttestationButton from "../../../components/buttons/DownloadAttestationButton";
import MailAttestationButton from "../../../components/buttons/MailAttestationButton";
import { Box, BoxTitle } from "../../../components/box";

export default ({ young, onChange }) => {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", width: "100%" }}>
      <WrapperPhase2 young={young} tab="phase2">
        <Box>
          <Row>
            <Col md={4} sm={4} style={{ padding: "3rem", borderRight: "2px solid #f4f5f7" }}>
              <BoxTitle>Réalisation des 84 heures de mission d'intérêt général</BoxTitle>
              <p style={{ flex: 1 }}>
                Le volontaire doit achever sa phase 2 avant le <b>{getLimitDateForPhase2(young.cohort)}</b>
              </p>
            </Col>
            <Col md={4} sm={4} style={{ padding: 0, borderRight: "2px solid #f4f5f7" }}>
              <Row
                style={{
                  height: "50%",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  padding: "1rem",
                  margin: 0,
                  borderBottom: "2px solid #f4f5f7",
                }}
              >
                <HourTitle>Heures de MIG prévisionnelles</HourTitle>
                <HourDetail>{young.phase2NumberHoursEstimated || "0"}h</HourDetail>
              </Row>
              <Row style={{ height: "50%", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "1rem", margin: 0 }}>
                <HourTitle>Heures de MIG réalisées</HourTitle>
                <HourDetail>{young.phase2NumberHoursDone || "0"}h sur 84h</HourDetail>
              </Row>
            </Col>
            <Col md={4} sm={4} style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
              <SelectStatus hit={young} statusName="statusPhase2" phase={YOUNG_PHASE.INTEREST_MISSION} options={Object.keys(YOUNG_STATUS_PHASE2)} />
            </Col>
          </Row>
        </Box>
        {ENABLE_PM && <Phase2MilitaryPreparation young={young} />}
        <Box>
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
                <Details title="Format préféré" value={t(young.missionFormat)} />
                <Details title="Engagement parallèle">
                  <div>
                    <span style={{ fontWeight: 600 }}>{t(young.engaged)}</span>&nbsp;({young.engagedDescription})
                  </div>
                  <div style={{ marginLeft: "1rem", fontStyle: "italic" }}></div>
                </Details>
                <Details title="Précision additonnelles">
                  <div style={{ fontStyle: "italic" }}>{young.desiredLocation}</div>
                </Details>
              </Bloc>
            </Col>
            <Col md={6}>
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
                      <div style={{ marginLeft: "1rem" }}>{`${young.mobilityNearRelativeName || ""} • ${young.mobilityNearRelativeZip || ""} ${
                        young.mobilityNearRelativeCity || ""
                      }`}</div>
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
          </Row>
        </Box>
        <Box>
          <ApplicationList young={young} onChangeApplication={onChange} />
        </Box>
        {young.statusPhase2 === "VALIDATED" ? (
          <div style={{ display: "flex", alignItems: "flex-start" }}>
            <div style={{ textAlign: "center" }}>
              <DownloadAttestationButton young={young} uri="2">
                Télécharger l'attestation de réalisation de la phase 2
              </DownloadAttestationButton>
              <MailAttestationButton style={{ marginTop: ".5rem" }} young={young} type="2" template="certificate" placeholder="Attestation de réalisation de la phase 2">
                Envoyer l'attestation par mail
              </MailAttestationButton>
            </div>
          </div>
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
        {title && (
          <div style={{ display: "flex" }}>
            <BoxTitle>{title}</BoxTitle>
          </div>
        )}
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

const Wrapper = styled.div`
  padding: 1rem 2rem;
  width: 100%;
  .detail {
    display: flex;
    align-items: flex-start;
    margin: 0.5rem 0;
    font-size: 14px;
    text-align: left;
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
const HourTitle = styled.div`
  text-transform: uppercase;
  color: ${colors.grey};
  font-size: 0.8rem;
`;
const HourDetail = styled.div`
  font-size: 1.2rem;
`;
