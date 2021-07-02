import React from "react";
import styled from "styled-components";
import { translate } from "../../utils";
import Button from "./button";
import { Field } from "formik";
import ErrorMessage, { requiredMessage } from "./errorMessage";

export default ({ title, handleChange, values, errors, touched }) => {
  return (
    <Container>
      <Title>{title}</Title>
      <Item values={values} handleChange={handleChange} name="mobilityNearSchool" label="Votre établissement" errors={errors} touched={touched} />
      <Item values={values} handleChange={handleChange} name="mobilityNearHome" label="Votre domicile" errors={errors} touched={touched} />
      <Item values={values} handleChange={handleChange} name="mobilityNearRelative" label="Hébergement chez un proche" errors={errors} touched={touched} />
      {values.mobilityNearRelative === "true" ? (
        <>
          <span style={{ textTransform: "uppercase", letterSpacing: "0.05rem", margin: "0.75rem 0", fontSize: "0,875rem", fontWeight: "500", color: "#6b7280" }}>Précisez</span>
          <Field
            validate={(v) => {
              if (!v) return requiredMessage;
            }}
            placeholder="Chez qui ?"
            className="form-control"
            name="mobilityNearRelativeName"
            value={values.mobilityNearRelativeName}
            onChange={handleChange}
          />
          <ErrorMessage errors={errors} touched={touched} name="mobilityNearRelativeName" />
          <Field
            validate={(v) => {
              if (!v) return requiredMessage;
            }}
            placeholder="Adresse"
            className="form-control"
            name="mobilityNearRelativeAddress"
            value={values.mobilityNearRelativeAddress}
            onChange={handleChange}
          />
          <ErrorMessage errors={errors} touched={touched} name="mobilityNearRelativeAddress" />
          <Field
            validate={(v) => {
              if (!v) return requiredMessage;
              if (!/\d{5}/.test(v)) return "Format incorrect";
            }}
            placeholder="Code postal"
            className="form-control"
            name="mobilityNearRelativeZip"
            value={values.mobilityNearRelativeZip}
            onChange={handleChange}
          />
          <ErrorMessage errors={errors} touched={touched} name="mobilityNearRelativeZip" />
        </>
      ) : null}
    </Container>
  );
};

const Item = ({ values, handleChange, name, label, errors, touched }) => {
  return (
    <>
      <ItemContainer>
        <Wrapper>
          <Label>{translate(label)}</Label>
        </Wrapper>
        <Wrapper>
          <Button name={name} handleChange={handleChange} values={values} value="true" title="Oui" />
          <Button name={name} handleChange={handleChange} values={values} value="false" title="Non" />
        </Wrapper>
      </ItemContainer>
      <ErrorMessage errors={errors} touched={touched} name={name} />
    </>
  );
};

const Wrapper = styled.div`
  display: flex;
  text-align: center;
  @media (max-width: 1080px) {
    display: block;
    > * {
      margin: 0.5rem auto;
    }
  }
`;

const Label = styled.div`
  margin: 0 1rem;
`;

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
    margin-top: 0.5rem;
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

const ItemContainer = styled.div`
  border-top-width: 1px;
  border-top-color: #d2d6dc;
  border-top-style: solid;
  width: 100%;
  flex: 1;
  padding: 1rem 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  text-align: center;
  @media (max-width: 1080px) {
    padding: 0;
    display: block;
    > * {
      margin: 0.5rem auto;
    }
  }
`;
