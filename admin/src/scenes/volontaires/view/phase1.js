import React, { useState } from "react";
import { Col, Row } from "reactstrap";
import styled from "styled-components";
import { Formik } from "formik";

import { translate as t, YOUNG_PHASE } from "../../../utils";
import WrapperPhase1 from "./wrapper";
import api from "../../../services/api";
import Avatar from "../../../components/Avatar";
import ToggleSwitch from "../../../components/ToogleSwitch";

export default ({ young }) => {
  const [disabled, setDisabled] = useState(young.phase === YOUNG_PHASE.INSCRIPTION);
  return (
    <div style={{ display: "flex", alignItems: "flex-start", width: "100%" }}>
      <WrapperPhase1 young={young} tab="phase1">
        <Box>
          <Row>
            <Col md={6} style={{ borderRight: "2px solid #f4f5f7" }}>
              <Bloc title="Séjour de cohésion">
                {young.cohesionCity ? (
                  <p>
                    Le volontaire a été affecté au centre de {young.cohesionCity}({young.cohesionDepartment})
                  </p>
                ) : (
                  <p>Le volontaire est en attente d'affectation à un centre de cohésion</p>
                )}
                {/* todo update model to integrate cohesion infos */}
                <Details title="Région" value={null} />
                <Details title="Dép." value={null} />
                <Details title="Ville" value={null} />
                <Details title="Adresse" value={null} />
                <Details title="Chef de centre" value={null} />
                <Details title="E-mail" value={null} />
                <Details title="Tel." value={null} />
              </Bloc>
            </Col>
            <Col md={6}>
              <Formik
                initialValues={young}
                onSubmit={async (values) => {
                  try {
                    const { ok, code, data: young } = await api.put(`/referent/young/${values._id}`, values);
                    if (!ok) toastr.error("Une erreur s'est produite :", translate(code));
                    toastr.success("Mis à jour!");
                  } catch (e) {
                    console.log(e);
                    toastr.error("Oups, une erreur est survenue pendant la mise à jour des informations :", translate(e.code));
                  }
                }}
              >
                {({ values, handleChange, handleSubmit, isSubmitting, submitForm }) => (
                  <>
                    <Bloc title="Date de séjour" borderBottom disabled={disabled}>
                      <Details title="Début" value={young.cohesionStartAt} />
                      <Details title="Fin" value={young.cohesionEndAt} />
                      <DetailsToogle
                        title="Présence"
                        optionLabels={["Présent", "Absent"]}
                        values={values}
                        name={"cohesionPresence"}
                        handleChange={handleChange}
                        disabled={disabled}
                      />
                    </Bloc>
                    <Bloc title="Fiche sanitaire" disabled={disabled}>
                      <DetailsToogle
                        title="Document"
                        optionLabels={["Réceptionné", "Non réceptionné"]}
                        values={values}
                        name={"cohesionSanitaryFile"}
                        handleChange={handleChange}
                        disabled={disabled}
                      />
                    </Bloc>
                  </>
                )}
              </Formik>
            </Col>
          </Row>
        </Box>
      </WrapperPhase1>
    </div>
  );
};

const Bloc = ({ children, title, borderBottom, borderRight, disabled }) => {
  return (
    <Row
      style={{ borderBottom: borderBottom ? "2px solid #f4f5f7" : 0, borderRight: borderRight ? "2px solid #f4f5f7" : 0, backgroundColor: disabled ? "#f9f9f9" : "transparent" }}
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

const Box = styled.div`
  width: ${(props) => props.width || 100}%;
  height: 100%;
  background-color: #fff;
  filter: drop-shadow(0px 2px 4px rgba(0, 0, 0, 0.05));
  margin-bottom: 33px;
  border-radius: 8px;
`;

const Wrapper = styled.div`
  padding: 3rem;
  .detail {
    display: flex;
    align-items: flex-start;
    font-size: 14px;
    text-align: left;
    margin-top: 1rem;
    &-title {
      min-width: 90px;
      width: 90px;
      margin-right: 1rem;
      color: #798399;
    }
    &-text {
      color: rgba(26, 32, 44);
    }
  }
  p {
    font-size: 13px;
    color: #798399;
  }
`;

const Legend = styled.div`
  color: rgb(38, 42, 62);
  margin-bottom: 20px;
  font-size: 1.3rem;
  font-weight: 500;
`;
