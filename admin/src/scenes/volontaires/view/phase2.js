import React from "react";
import { Col, Row } from "reactstrap";
import styled from "styled-components";
import Badge from "../../../components/Badge";
import { Box, BoxTitle } from "../../../components/box";
import DownloadAttestationButton from "../../../components/buttons/DownloadAttestationButton";
import MailAttestationButton from "../../../components/buttons/MailAttestationButton";
import SelectStatus from "../../../components/selectStatus";
import { environment } from "../../../config";
import api from "../../../services/api";
import { colors, ENABLE_PM, translate as t, YOUNG_PHASE, YOUNG_STATUS_PHASE2 } from "../../../utils";
import CardEquivalence from "../components/Equivalence";
import ApplicationList from "./applicationList.js";
import Phase2MilitaryPreparation from "./phase2MilitaryPreparation";
import Phase2militaryPrepartionV2 from "./phase2MilitaryPreparationV2";
import WrapperPhase2 from "./wrapper";

export default function Phase2({ young, onChange }) {
  const [equivalences, setEquivalences] = React.useState([]);
  React.useEffect(() => {
    (async () => {
      const { ok, data } = await api.get(`/young/${young._id.toString()}/phase2/equivalences`);
      if (ok) return setEquivalences(data);
    })();
  }, []);

  return (
    <div style={{ display: "flex", alignItems: "flex-start", width: "100%" }}>
      <WrapperPhase2 young={young} tab="phase2" onChange={onChange}>
        <Box>
          <Row>
            <Col md={4} sm={4} style={{ padding: "3rem", borderRight: "2px solid #f4f5f7" }}>
              <BoxTitle>Réalisation des 84 heures de mission d&apos;intérêt général</BoxTitle>
              <p style={{ flex: 1 }}>
                Le volontaire doit réaliser sa phase 2 dans l&apos;année suivant son séjour de cohésion.
                <br />
                Pour plus d&apos;informations,{" "}
                <a
                  className="underline hover:underline"
                  href="https://support.snu.gouv.fr/base-de-connaissance/de-combien-de-temps-je-dispose-pour-realiser-ma-mig"
                  target="_blank"
                  rel="noreferrer">
                  cliquez-ici
                </a>
                .
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
                }}>
                <HourTitle>Heures de MIG prévisionnelles</HourTitle>
                <HourDetail>{young.phase2NumberHoursEstimated || "0"}h</HourDetail>
              </Row>
              <Row style={{ height: "50%", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "1rem", margin: 0 }}>
                <HourTitle>Heures de MIG réalisées</HourTitle>
                <HourDetail>{young.phase2NumberHoursDone || "0"}h sur 84h</HourDetail>
              </Row>
            </Col>
            <Col md={4} sm={4} style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
              <SelectStatus
                hit={young}
                statusName="statusPhase2"
                phase={YOUNG_PHASE.INTEREST_MISSION}
                options={Object.keys(YOUNG_STATUS_PHASE2).filter((e) => e !== YOUNG_STATUS_PHASE2.WITHDRAWN)}
              />
            </Col>
          </Row>
        </Box>
        {ENABLE_PM ? environment !== "production" ? <Phase2militaryPrepartionV2 young={young} /> : <Phase2MilitaryPreparation young={young} /> : null}
        {environment !== "production" ? equivalences.map((equivalence, index) => <CardEquivalence key={index} equivalence={equivalence} young={young} />) : null}
        <Box>
          <Row>
            <Col md={12}>
              <Bloc borderBottom>
                <BoxTitle style={{ marginBottom: 0 }}>Préférences de missions renseignées par le volontaire</BoxTitle>
              </Bloc>
            </Col>
            <Col
              md={6}
              style={{
                borderRight: "2px solid #f4f5f7",
              }}>
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
                Télécharger l&apos;attestation de réalisation de la phase 2
              </DownloadAttestationButton>
              <MailAttestationButton style={{ marginTop: ".5rem" }} young={young} type="2" template="certificate" placeholder="Attestation de réalisation de la phase 2">
                Envoyer l&apos;attestation par mail
              </MailAttestationButton>
            </div>
          </div>
        ) : null}
      </WrapperPhase2>
    </div>
  );
}

const Bloc = ({ children, title, borderBottom, borderRight, borderLeft, disabled }) => {
  return (
    <Row
      style={{
        borderBottom: borderBottom ? "2px solid #f4f5f7" : 0,
        borderRight: borderRight ? "2px solid #f4f5f7" : 0,
        borderLeft: borderLeft ? "2px solid #f4f5f7" : 0,
        backgroundColor: disabled ? "#f9f9f9" : "transparent",
      }}>
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
const HourTitle = styled.div`
  text-transform: uppercase;
  color: ${colors.grey};
  font-size: 0.8rem;
`;
const HourDetail = styled.div`
  font-size: 1.2rem;
`;
