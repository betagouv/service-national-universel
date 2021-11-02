import React, { useEffect } from "react";
import styled from "styled-components";
import { Row, Col } from "reactstrap";
import { Field } from "formik";
import ErrorMessage, { requiredMessage } from "../scenes/inscription/components/errorMessage";

export default ({ keys, values, handleChange, errors, touched }) => {


  useEffect(() => {
    if (document.getElementsByTagName) {
      const inputElements = document.getElementsByTagName("input");
      for (let i = 0; inputElements[i]; i++) inputElements[i].setAttribute("autocomplete", "novalue");
    }
  }, []);

  // keys is not defined at first load ??
  if (!keys) return <div />;

  return (
    <Wrapper>
      <Row>
        <Col>
          <Field
            placeholder="Nom de l'hébergeur"
            className="form-control"
            validate={(v) => !v && requiredMessage}
            name={keys.hostLastName}
            value={values[keys.hostLastName]}
            onChange={(e) => {
              const value = e.target.value;
              handleChange({ target: { name: keys.hostLastName, value } });
            }}
          />
          <ErrorMessage errors={errors} touched={touched} name="hostLastName" />
        </Col>
        <Col>
          <Field
            placeholder="Prénom de l'hébergeur"
            className="form-control"
            validate={(v) => !v && requiredMessage}
            name={keys.hostFirstName}
            value={values[keys.hostFirstName]}
            onChange={(e) => {
              const value = e.target.value;
              handleChange({ target: { name: keys.hostFirstName, value } });
            }}
          />
          <ErrorMessage errors={errors} touched={touched} name="hostFirstName" />
        </Col>
      </Row>
      <Row>
        <Col>
          <Field
            style={{ marginTop: "1rem" }}
            as="select"
            validate={(v) => !v && requiredMessage}
            className="form-control"
            placeholder="Précisez votre lien avec l'hébergeur"
            name={keys.link}
            value={values[keys.link]}
            onChange={(e) => {
              const value = e.target.value;
              handleChange({ target: { name: keys.link, value } });
            }}
          >
            {["Parent", "ami de la famille", "etc"].map((link) => (
              <option key={link} value={link}>
                {`${link}`}
              </option>
            ))}
          </Field>
        </Col>
      </Row>
      <Row>
        <Col md={12} style={{ marginTop: 15 }}>
          <Field
            validate={(v) => !v && requiredMessage}
            className="form-control"
            placeholder="Renseignez son adresse"
            name={keys.hostAddress}
            value={values[keys.hostAddress]}
            onChange={(e) => {
              const value = e.target.value;
              handleChange({ target: { name: keys.hostAddress, value } });
            }}
          />
          <ErrorMessage errors={errors} touched={touched} name={keys.hostAddress} />
        </Col>
        <Col md={6} style={{ marginTop: 15 }}>
          <Field
            validate={(v) => !v && requiredMessage}
            className="form-control"
            placeholder="Ville"
            name={keys.hostCity}
            value={values[keys.hostCity]}
            onChange={(e) => {
              const value = e.target.value;
              handleChange({ target: { name: keys.hostCity, value } });
            }}
          />
          <ErrorMessage errors={errors} touched={touched} name={keys.hostCity} />
        </Col>
        <Col md={6} style={{ marginTop: 15 }}>
          <Field
            validate={(v) => !v && requiredMessage}
            className="form-control"
            placeholder="Code postal"
            name={keys.hostZip}
            value={values[keys.hostZip]}
            onChange={(e) => {
              const value = e.target.value;
              handleChange({ target: { name: keys.hostZip, value } });
            }}
          />
          <ErrorMessage errors={errors} touched={touched} name={keys.hostZip} />
        </Col>
      </Row>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  .react-autosuggest__container {
    position: relative;
  }
  .react-autosuggest__suggestions-list {
    position: absolute;
    background-color: white;
    margin: 0;
    width: 100%;
    z-index: 10;
    left: 0px;
    top: 106%;
    border: 1px solid #ddd;
    padding: 5px 0;
    border-radius: 6px;
  }
  .react-autosuggest__suggestions-list li {
    cursor: pointer;
    padding: 7px 10px;
    :hover {
      background-color: #f3f3f3;
    }
  }
  .react-autosuggest__suggestion--highlighted {
    background-color: #f3f3f3;
  }
`;

const Label = styled.div`
  color: #374151;
  font-size: 14px;
  margin-bottom: 10px;
`;
