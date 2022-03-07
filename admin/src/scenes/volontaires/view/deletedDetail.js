import React, { useState } from "react";
import { Col, Row } from "reactstrap";
import styled from "styled-components";
import { useSelector } from "react-redux";

import { translate as t, isInRuralArea, ROLES, copyToClipboard, formatStringDate, getAge } from "../../../utils";
import YoungView from "./wrapper";
import { Box, BoxTitle } from "../../../components/box";
import { BiCopy } from "react-icons/bi";
import { HiCheckCircle } from "react-icons/hi";

export default function DeletedVolontaireViewDetails({ young, onChange }) {
  const user = useSelector((state) => state.Auth.user);
  const [isDeleted] = useState(young.status === "DELETED");

  return (
    <div style={{ display: "flex", alignItems: "flex-start", width: "100%" }}>
      <YoungView young={young} tab="details" onChange={onChange}>
        <Box>
          <Row>
            <Col md={6} style={{ borderRight: "2px solid #f4f5f7" }}>
              <Bloc title="Informations générales">
                <Details title="Date de naissance" value={`${formatStringDate(young.birthdateAt)} • ${getAge(young.birthdateAt)} ans`} />
                <Details title="Sexe" value={t(young.gender)} />
                <Details title="Ville" value={young.city} />
                <Details title="Code Postal" value={young.zip} />
                <Details title="Dép" value={young.department} />
                <Details title="Région" value={young.region} />
              </Bloc>
              <Bloc title="Situations particulières">
                <Details title="Quartier Prioritaire de la Ville" value={t(young.qpv)} />
                <Details title="Zone Rurale" value={t(isInRuralArea(young))} />
                <Details title="Handicap" value={t(young.handicap)} />
                <Details title="PPS" value={t(young.ppsBeneficiary)} />
                <Details title="PAI" value={t(young.paiBeneficiary)} />
                <Details title="Activités de haut niveau" value={t(young.highSkilledActivity)} />
              </Bloc>
            </Col>
            <Col md={6}>
              <Bloc title="Situation">
                <Details title="Statut" value={t(young.situation)} />
              </Bloc>
            </Col>
          </Row>
        </Box>
      </YoungView>
    </div>
  );
}

const Bloc = ({ children, title, last }) => {
  return (
    <Row style={{ borderBottom: last ? 0 : "2px solid #f4f5f7" }}>
      <Wrapper>
        <div>
          <BoxTitle>{title}</BoxTitle>
        </div>
        {children}
      </Wrapper>
    </Row>
  );
};

const Details = ({ title, value, copy, style }) => {
  if (!value) return <div />;
  const [copied, setCopied] = React.useState(false);
  if (typeof value === "function") value = value();
  React.useEffect(() => {
    if (copied) {
      setTimeout(() => setCopied(false), 3000);
    }
  }, [copied]);
  return (
    <div className="detail" style={style}>
      <div className="detail-title">{`${title} :`}</div>
      <section style={{ display: "flex" }}>
        <div className="detail-text">{value}</div>
        {copy ? (
          <div
            className="flex items-center justify-center mx-1 cursor-pointer hover:scale-105 text-snu-purple-400"
            onClick={() => {
              copyToClipboard(value);
              setCopied(true);
            }}>
            {copied ? <HiCheckCircle className="text-green-500" /> : <BiCopy className="text-snu-purple-300" />}
          </div>
        ) : null}
      </section>
    </div>
  );
};

const Wrapper = styled.div`
  padding: 3rem;
  width: 100%;
  .detail {
    border-bottom: 0.5px solid rgba(244, 245, 247, 0.5);
    display: flex;
    justify-content: space-between;
    font-size: 14px;
    margin-top: 1rem;
    padding-bottom: 0.5rem;
    &-title {
      min-width: 90px;
      margin-right: 1rem;
      color: #798399;
    }
    &-text {
      color: rgba(26, 32, 44);
    }
  }
  .icon {
    cursor: pointer;
    margin: 0 0.5rem;
  }
`;
