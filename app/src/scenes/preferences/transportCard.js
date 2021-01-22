import React from "react";
import styled from "styled-components";
import { translate } from "./utils";
import Button from "./button";
import { Field } from "formik";
import { Row, Col } from "reactstrap";
import ErrorMessage, { requiredMessage } from "./errorMessage";

export default ({ title, handleChange, values, errors, touched }) => {
  return (
    <Container>
      <Title>{title}</Title>
      <Row style={{ marginBottom: "1rem" }}>
        <Button name="mobilityTransport" handleChange={handleChange} values={values} value="PUBLIC" title="Réseau de transport en commun" />
        <Button name="mobilityTransport" handleChange={handleChange} values={values} value="BIKE" title="Vélo" />
      </Row>
      <Row>
        <Button name="mobilityTransport" handleChange={handleChange} values={values} value="MOTOR" title="Motorisé" />
        <Button name="mobilityTransport" handleChange={handleChange} values={values} value="CARPOOLING" title="Covoiturage" />
        <Button name="mobilityTransport" handleChange={handleChange} values={values} value="OTHER" title="Autre" />
      </Row>
      <ErrorMessage errors={errors} touched={touched} name="mobilityTransport" />
      {values.mobilityTransport === "OTHER" ? (
        <>
          <span style={{ textTransform: "uppercase", letterSpacing: "0.05rem", margin: "0.75rem 0", fontSize: "0,875rem", fontWeight: "500", color: "#6b7280" }}>Précisez</span>
          <Field
            validate={(v) => {
              if (!v) return requiredMessage;
            }}
            placeholder="Quel moyen de transport utilisez-vous ?"
            className="form-control"
            name="mobilityTransportOther"
            value={values.mobilityTransportOther}
            onChange={handleChange}
          />
          <ErrorMessage errors={errors} touched={touched} name="mobilityTransportOther" />
        </>
      ) : null}
    </Container>
  );
};

const Container = styled.div`
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  padding: 1.5rem;
  border-width: 1px;
  border-radius: 0.5rem;
  border-style: solid;
  border-color: #d2d6dc;
  margin: 0 0.25rem 1rem 0.25rem;
  display: flex;
  flex-direction: column;
  width: 100%;
  input {
    max-width: 20rem;
    margin-bottom: 0.5rem;
  }
`;

const Title = styled.h2`
  margin-bottom: 1rem;
  font-size: 0.875rem;
  letter-spacing: 0.05rem;
  color: #161e2e;
  text-transform: uppercase;
  font-weight: 700;
`;
