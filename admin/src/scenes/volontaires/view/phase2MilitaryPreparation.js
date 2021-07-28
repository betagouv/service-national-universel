import React, { useState } from "react";
import { Col, Row } from "reactstrap";
import styled from "styled-components";

import { translate as t } from "../../../utils";
import Badge from "../../../components/Badge";
import { Box, BoxTitle, Separator } from "../../../components/box";
import DownloadButton from "../../../components/buttons/DownloadButton";
import api from "../../../services/api";
import LoadingButton from "../../../components/buttons/LoadingButton";

export default ({ young }) => {
  if (!["WAITING_VALIDATION", "VALIDATED", "WAITING_CORRECTION", "REFUSED"].includes(young.statusMilitaryPreparationFiles)) {
    console.log("cehck", young.statusMilitaryPreparationFiles);
    return <div>no</div>;
  }

  const handleValidate = () => {
    console.log("handleValidate");
    // pass the application to WAITING_VALIDATION
    // notify young
  };
  const handleCorrection = () => {
    console.log("handleCorrection");
    // display modal with text prefilled and pass the statusMilitaryPreparationFiles to WAITING_CORRECTION
    // notify young
  };
  const handleRefused = () => {
    console.log("handleRefused");
    // display modal with text prefilled and pass the statusMilitaryPreparationFiles to REFUSED
    // notify young
  };

  return (
    <Box>
      <Bloc title="Documents - Préparation militaire" titleRight={<Badge text={t(young.statusMilitaryPreparationFiles)} />}>
        <Line>
          {(young.militaryPreparationFilesIdentity || []).map((e, i) => (
            <DownloadButton
              key={i}
              source={() => api.get(`/referent/youngFile/${young._id}/militaryPreparationFilesIdentity/${e}`)}
              title={`Télécharger la pièce d'identité (${i + 1}/${young.militaryPreparationFilesIdentity.length})`}
            />
          ))}
        </Line>
        <Line>
          {(young.militaryPreparationFilesCensus || []).map((e, i) => (
            <DownloadButton
              key={i}
              source={() => api.get(`/referent/youngFile/${young._id}/militaryPreparationFilesCensus/${e}`)}
              title={`Télécharger l'attestation de recensement (${i + 1}/${young.militaryPreparationFilesCensus.length})`}
            />
          ))}
        </Line>
        <Line>
          {(young.militaryPreparationFilesAuthorization || []).map((e, i) => (
            <DownloadButton
              key={i}
              source={() => api.get(`/referent/youngFile/${young._id}/militaryPreparationFilesAuthorization/${e}`)}
              title={`Télécharger l'autorisation parentale pour effectuer une préparation militaire (${i + 1}/${young.militaryPreparationFilesAuthorization.length})`}
            />
          ))}
        </Line>
        <Line>
          {(young.militaryPreparationFilesCertificate || []).map((e, i) => (
            <DownloadButton
              key={i}
              source={() => api.get(`/referent/youngFile/${young._id}/militaryPreparationFilesCertificate/${e}`)}
              title={`Télécharger le certificat médical de non contre indication à la pratique sportive  (${i + 1}/${young.militaryPreparationFilesCertificate.length})`}
            />
          ))}
        </Line>
        <Separator />
        <LoadingButton onClick={handleValidate} color={"#0f0"} textColor={"#fff"}>
          Valider
        </LoadingButton>
        <LoadingButton onClick={handleCorrection} color={"#00f"} textColor={"#fff"}>
          Demander correction
        </LoadingButton>
        <LoadingButton onClick={handleRefused} color={"#f00"} textColor={"#fff"}>
          Refuser
        </LoadingButton>
      </Bloc>
    </Box>
  );
};

const Bloc = ({ children, title, titleRight, borderBottom, borderRight, borderLeft, disabled }) => {
  return (
    <Row
      style={{
        borderBottom: borderBottom ? "2px solid #f4f5f7" : 0,
        borderRight: borderRight ? "2px solid #f4f5f7" : 0,
        borderLeft: borderLeft ? "2px solid #f4f5f7" : 0,
        backgroundColor: disabled ? "#f9f9f9" : "transparent",
      }}
    >
      <Wrapper
        style={{
          width: "100%",
        }}
      >
        <div style={{ display: "flex", width: "100%" }}>
          <BoxTitle>
            <div>{title}</div>
            <div>{titleRight}</div>
          </BoxTitle>
        </div>
        {children}
      </Wrapper>
    </Row>
  );
};

const Line = styled.div`
  display: flex;
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
