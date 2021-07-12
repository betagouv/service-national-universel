import React from "react";
import styled from "styled-components";
import { translate as t, TRANSPORT } from "../../utils";
import Button from "./button";
import { Field } from "formik";
import { Row } from "reactstrap";
import ErrorMessage, { requiredMessage } from "./errorMessage";

export default ({ title, handleChange, values, errors, touched }) => {
  const onClick = (value) => {
    const d = values.mobilityTransport;
    const index = d.indexOf(value);
    if (index !== -1) {
      // delete from the array
      d.splice(index, 1);
    } else {
      d.push(value);
    }
    handleChange({ target: { name: "mobilityTransport", value: d } });
    // delete the other if the other is unselected
    if (d.indexOf(TRANSPORT.OTHER) === -1) handleChange({ target: { name: "mobilityTransportOther", value: "" } });
  };

  return (
    <Container>
      <Title>{title}</Title>
      <Row>
        <Button
          name="mobilityTransport"
          onClick={() => onClick(TRANSPORT.PUBLIC_TRANSPORT)}
          values={values}
          value={TRANSPORT.PUBLIC_TRANSPORT}
          title={t(TRANSPORT.PUBLIC_TRANSPORT)}
        />
        <Button name="mobilityTransport" onClick={() => onClick(TRANSPORT.BIKE)} values={values} value={TRANSPORT.BIKE} title={t(TRANSPORT.BIKE)} />
      </Row>
      <Row>
        <Button name="mobilityTransport" onClick={() => onClick(TRANSPORT.MOTOR)} values={values} value={TRANSPORT.MOTOR} title={t(TRANSPORT.MOTOR)} />
        <Button name="mobilityTransport" onClick={() => onClick(TRANSPORT.CARPOOLING)} values={values} value={TRANSPORT.CARPOOLING} title={t(TRANSPORT.CARPOOLING)} />
        <Button name="mobilityTransport" onClick={() => onClick(TRANSPORT.OTHER)} values={values} value={TRANSPORT.OTHER} title={t(TRANSPORT.OTHER)} />
      </Row>
      <ErrorMessage errors={errors} touched={touched} name="mobilityTransport" />
      {values.mobilityTransport.indexOf(TRANSPORT.OTHER) !== -1 ? (
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
  font-size: 0.875rem !important;
  letter-spacing: 0.05rem;
  color: #161e2e;
  text-transform: uppercase;
  font-weight: 700;
`;
