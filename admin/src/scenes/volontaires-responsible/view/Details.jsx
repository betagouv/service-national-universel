import React from "react";
import { Col, Row } from "reactstrap";
import styled from "styled-components";

import { translate as t } from "snu-lib";
import { Box, BoxTitle } from "../../../components/box";

export default function DetailsVolontaires({ young }) {
  return (
    <Box>
      <Row>
        <Col md={6} style={{ borderRight: "2px solid #f4f5f7" }}>
          <Bloc title="Informations générales">
            <Details title="E-mail" value={young.email} />
            <Details title="Tel" value={young.phone} />
            <Details title="Région" value={young.region} />
            <Details title="Dép" value={young.department} />
            <Details title="Ville" value={young.city && young.zip && `${young.city} (${young.zip})`} />
            <Details title="Adresse" value={young.address} />
          </Bloc>

          {young.motivations && (
            <Bloc title="Motivations">
              <div className="quote">{`« ${young.motivations} »`}</div>
            </Bloc>
          )}

          <Bloc title="Situation">
            <Details title="Statut" value={t(young.situation)} />
            <Details title="Type" value={young.schoolType} />
            <Details title="Nom" value={young.schoolName} />
            <Details title="Région" value={young.schoolRegion} />
            <Details title="Dép" value={young.schoolDepartment} />
            <Details title="Ville" value={young.schoolCity && young.schoolZip && `${young.schoolCity} (${young.schoolZip})`} />
            <Details title="Adresse" value={young.schoolAddress} />
          </Bloc>
        </Col>

        <Col md={6}>
          <Bloc title="Représentant légal n°1">
            <Details title="Statut" value={t(young.parent1Status)} />
            <Details title="Prénom" value={young.parent1FirstName} />
            <Details title="Nom" value={young.parent1LastName} />
            <Details title="E-mail" value={young.parent1Email} />
            <Details title="Tel" value={young.parent1Phone} />
            <Details title="Région" value={young.parent1Region} />
            <Details title="Dép" value={young.parent1Department} />
            <Details title="Ville" value={young.parent1City && young.parent1Zip && `${young.parent1City} (${young.parent1Zip})`} />
            <Details title="Adresse" value={young.parent1Address} />
          </Bloc>

          {young.parent2Status ? (
            <Bloc title="Représentant légal n°2">
              <Details title="Statut" value={t(young.parent2Status)} />
              <Details title="Prénom" value={young.parent2FirstName} />
              <Details title="Nom" value={young.parent2LastName} />
              <Details title="E-mail" value={young.parent2Email} />
              <Details title="Tel" value={young.parent2Phone} />
              <Details title="Région" value={young.parent2Region} />
              <Details title="Dép" value={young.parent2Department} />
              <Details title="Ville" value={young.parent2City && young.parent2Zip && `${young.parent2City} (${young.parent2Zip})`} />
              <Details title="Adresse" value={young.parent2Address} />
            </Bloc>
          ) : null}
        </Col>
      </Row>
    </Box>
  );
}

const Bloc = ({ children, title, last }) => {
  return (
    <Row style={{ borderBottom: last ? 0 : "2px solid #f4f5f7" }}>
      <Wrapper>
        <div style={{ display: "flex" }}>
          <BoxTitle>{title}</BoxTitle>
        </div>
        {children}
      </Wrapper>
    </Row>
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

const Wrapper = styled.div`
  padding: 3rem;
  width: 100%;
  .detail {
    border-bottom: 0.5px solid rgba(244, 245, 247, 0.5);
    display: flex;
    justify-content: space-between;
    font-size: 14px;
    text-align: left;
    margin-top: 1rem;
    &-title {
      min-width: 90px;
      margin-right: 1rem;
      color: #798399;
    }
    &-text {
      color: rgba(26, 32, 44);
    }
  }
`;
