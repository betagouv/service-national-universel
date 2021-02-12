import React, { useEffect, useState } from "react";
import { Col, Row } from "reactstrap";
import styled from "styled-components";
import { Link } from "react-router-dom";

import { translate as t } from "../../../utils";
import WrapperPhase2 from "./wrapper";
import api from "../../../services/api";
import Avatar from "../../../components/Avatar";

export default ({ young }) => {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", width: "100%" }}>
      <WrapperPhase2 young={young} tab="phase2">
        <Box>
          <Bloc title="Réalisation d'une mission d'interêt général">
            <p>
              Le volontaire doit achever sa phase 2 avant le <b>31 décembre 2021</b>
            </p>
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
                <Details title="Domaines">{young.domains && young.domains.map((d, i) => <Badge key={i}>{t(d)}</Badge>)}</Details>
                <Details title="Projet professionnel" value={`${young.professionnalProject} (${young.professionnalProjectPrecision})`} />
              </Bloc>
              <Bloc>
                <Details title="Période privilégiée">
                  <div style={{ fontWeight: 600 }}>{t(young.period)}</div>
                  {young.periodRanking.map((p, i) => (
                    <div key={i} style={{ marginLeft: "1rem" }}>{`${i + 1}. ${t(p)}`}</div>
                  ))}
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
                  {young.mobilityTransport.map((transport, i) => (
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
          <Legend>{title}</Legend>
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

const DetailsToogle = ({ title, name, values, handleChange, disabled, optionLabels }) => {
  return (
    <div className="detail">
      <div className="detail-title">{`${title} :`}</div>
      <ToggleSwitch
        optionLabels={optionLabels}
        id={name}
        checked={values[name] === "true"}
        onChange={(checked) => handleChange({ target: { value: checked ? "true" : "false", name } })}
        disabled={disabled}
      />
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
        {hide ? <Gradient color="white" /> : null}
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

const Badge = styled.span`
  display: inline-block;
  padding: 0.25rem 1rem;
  margin: 0 0.25rem 0.25rem 0.25rem;
  border-radius: 99999px;
  font-size: 0.8rem;
  font-weight: 500;
  color: #9a9a9a;
  background-color: #f6f6f6;
  border: 1px solid #cecece;
  ${({ color }) => `
    color: ${color};
    background-color: ${color}33;
    border: 1px solid ${color};
  `};
`;

const Gradient = styled.div`
  position: absolute;
  bottom: 0px;
  left: 0px;
  width: 100%;
  height: 100px;
  background: -moz-linear-gradient(top, rgba(137, 255, 241, 0) 0%, rgba(255, 255, 255, 1) 100%); /* FF3.6+ */
  background: -webkit-gradient(linear, left top, left bottom, color-stop(0%, rgba(137, 255, 241, 0)), color-stop(100%, rgba(255, 255, 255, 1))); /* Chrome,Safari4+ */
  background: -webkit-linear-gradient(top, rgba(137, 255, 241, 0) 0%, rgba(255, 255, 255, 1) 100%); /* Chrome10+,Safari5.1+ */
  background: -o-linear-gradient(top, rgba(137, 255, 241, 0) 0%, rgba(255, 255, 255, 1) 100%); /* Opera 11.10+ */
  background: -ms-linear-gradient(top, rgba(137, 255, 241, 0) 0%, rgba(255, 255, 255, 1) 100%); /* IE10+ */
  background: linear-gradient(to bottom, rgba(137, 255, 241, 0) 0%, rgba(255, 255, 255, 1) 80%); /* W3C */
  filter: progid:DXImageTransform.Microsoft.gradient( startColorstr='#0089fff1', endColorstr='#FFFFFF',GradientType=0 ); /* IE6-9 */
`;

const Box = styled.div`
  width: ${(props) => props.width || 100}%;
  height: 100%;
  max-height: ${({ hide }) => (hide ? "20rem" : "none")};
  overflow: hidden;
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
