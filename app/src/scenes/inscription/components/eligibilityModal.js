import React, { useState } from "react";
import { Modal, Col, Row } from "reactstrap";
import styled from "styled-components";
//import Modal from "./modal";
import { Formik, Field } from "formik";
import close from "../../../assets/cancel.png";

import { translate } from "../../../utils";
import LoadingButton from "../../../components/buttons/LoadingButton";
import ErrorMessage, { requiredMessage } from "../../inscription/components/errorMessage";
import { SelectTag, step1, step2TechnicalPublic, step2QuestionPublic } from "../../support-center/ticket/worflow";
import { ModalContainer, Content, Footer } from "../../../components/modals/Modal";

export default function EligibilityModal({ onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  return (
    <>
      <Modal centered isOpen={isOpen} toggle={onChange}>
        <Container>
          <div>
            <h2>Vérifiez rapidement votre éligibilité</h2>
            <p>Renseignez les informations ci-dessous</p>
          </div>
          <Form>
            <img src={close} onClick={() => setIsOpen(false)} />
            <Formik
              initialValues={{ birthDate: "", school: false, schoolLevel: "", address: "" }}
              validateOnChange={false}
              validateOnBlur={false}
              onSubmit={async (values) => {
                try {
                  setLoading(true);
                  const { birthDate, school, schoolLevel, address } = values;
                  setLoading(false);
                } catch (e) {
                  console.log(e);
                }
              }}>
              {({ values, handleChange, handleSubmit, isSubmitting, errors, touched }) => (
                <>
                  <Item
                    name="birthDate"
                    title="Date de naissance"
                    placeholder="Renseignez votre date de naissance"
                    type="input"
                    value={values.birthDate}
                    handleChange={handleChange}
                    validate={(v) => !v && requiredMessage}
                    errors={errors}
                    touched={touched}
                    rows="2"
                  />
                  <Checkbox>
                    <Field
                      type="checkbox"
                      className="checkbox_input"
                      name="school"
                      value="true"
                      checked={values.school === true}
                      errors={errors}
                      touched={touched}
                      onChange={(e) => handleChange({ target: { name: e.target.name, value: e.target.checked ? true : false } })}
                    />
                    <Label className="checkbox_label">Je suis toujours scolarisé</Label>
                  </Checkbox>
                  {values.school && (
                    <Item
                      name="schoolLevel"
                      type="select"
                      options={["Seconde", "Première", "Terminale"]}
                      title=""
                      selectPlaceholder="Sélectionnez votre classe"
                      handleChange={handleChange}
                      value={values.schoolLevel}
                    />
                  )}
                  <Item
                    name="address"
                    title="Adresse"
                    placeholder="Renseignez votre adresse"
                    type="input"
                    value={values.address}
                    handleChange={handleChange}
                    validate={(v) => !v && requiredMessage}
                    errors={errors}
                    touched={touched}
                    rows="2"
                  />
                  <LoadingButton loading={loading} type="submit" style={{ margin: "1.5rem auto 0 auto", width: "93%" }} onClick={handleSubmit} disabled={isSubmitting}>
                    Vérifier
                  </LoadingButton>
                </>
              )}
            </Formik>
          </Form>
        </Container>
      </Modal>
      <button onClick={() => setIsOpen(true)}>Vérifier mon éligibilité</button>
    </>
  );
}

const Item = ({ title, name, value, handleChange, errors, touched, validate, type, options, selectPlaceholder, ...props }) => {
  return (
    <Col style={{ marginTop: 20 }}>
      <Label>{title}</Label>
      {type === "select" ? (
        <Field as={type} className="form-control" name={name} value={value} onChange={handleChange} validate={validate} {...props}>
          <option value="" disabled>
            {selectPlaceholder}
          </option>
          {options?.map((option) => (
            <option value={option} key={option}>
              {option}
            </option>
          ))}
        </Field>
      ) : (
        <Field type={type} className="form-control" name={name} value={value} onChange={handleChange} validate={validate} {...props} />
      )}
      {errors && <ErrorMessage errors={errors} touched={touched} name={name} />}
    </Col>
  );
};

const Label = styled.div`
  color: #374151;
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 5px;
`;

const Form = styled.div`
  display: flex;
  padding: 2rem;
  flex-direction: column;
  margin: 0 auto;
  width: 100%;
  @media (max-width: 767px) {
    width: 100%;
  }
`;

const Checkbox = styled.section`
  display: flex;
  padding: 1rem 1rem 0 1rem;
  align-items: baseline;
  .checkbox_label {
    width: 50%;
    margin-left: 0.7rem;
  }
`;

const Container = styled(ModalContainer)`
  position: relative;
  padding: 1rem;
  img {
    cursor: pointer;
    position: absolute;
    height: 1.5rem;
    width: 1.5rem;
    top: 1.5rem;
    right: 1.5rem;
  }
`;
