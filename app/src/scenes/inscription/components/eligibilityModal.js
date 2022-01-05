import React, { useState } from "react";
import { Modal, Col } from "reactstrap";
import styled from "styled-components";
import { Formik, Field } from "formik";
import close from "../../../assets/cancel.png";
import logo from "../../../assets/logo-snu.png";
import tick from "../../../assets/tick.svg";
import cross from "../../../assets/cross.png";

import api from "../../../services/api";
import LoadingButton from "../../../components/buttons/LoadingButton";
import ErrorMessage, { requiredMessage } from "../../inscription/components/errorMessage";
import { ModalContainer } from "../../../components/modals/Modal";
import Note from "../../../components/Note";
import { departmentList, translate } from "../../../utils";

const levels = [
  { label: "3ème", value: "3eme" },
  { label: "2nd", value: "2nd" },
  { label: "1ère", value: "1ere" },
  { label: "1ère année CAP", value: "1ere CAP" },
  { label: "Terminale", value: "Terminale" },
  { label: "Terminale CAP", value: "Terminale CAP" },
  { label: "SEGPA", value: "SEGPA" },
  { label: "Classe relais", value: "Classe relais" },
  { label: "Autre", value: "Autre" },
];

export default function EligibilityModal({ onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isEligible, setIsEligible] = useState(false);
  const [display, setDisplay] = useState(false);

  return (
    <>
      <Modal centered isOpen={isOpen} toggle={onChange}>
        <Container>
          <Header>
            <img src={logo} />
            <h4>Vérifiez rapidement votre éligibilité</h4>
            <p>Renseignez les informations ci-dessous</p>
          </Header>
          <Form>
            <img src={close} className="close_icon" onClick={() => setIsOpen(false)} />
            <Formik
              initialValues={{ birthDate: "", school: false, schoolLevel: "", department: "" }}
              validateOnChange={false}
              validateOnBlur={false}
              onSubmit={async (values) => {
                try {
                  setLoading(true);
                  let { birthDate, schoolLevel, department, school } = values;
                  if (!school) schoolLevel = "";
                  const { ok, code, data } = await api.post("/cohort-session/eligibility/2022", {
                    birthDate,
                    schoolLevel,
                    department,
                  });
                  setLoading(false);
                  if (!ok) return console.log("Une erreur s'est produite lors de la création de ce ticket :", translate(code));
                  setIsEligible(!!data.length);
                  setDisplay(true);
                } catch (e) {
                  console.log(e);
                }
              }}>
              {({ values, handleChange, handleSubmit, isSubmitting, errors, touched }) => (
                <>
                  <Item
                    name="birthDate"
                    title="Date de naissance"
                    subTitle="Au format : JJ/MM/AAAA"
                    placeholder="Exemple : 22/05/2005"
                    type="input"
                    value={values.birthDate}
                    handleChange={handleChange}
                    validate={(v) => {
                      if (!v) return requiredMessage;
                      const regex = /^[0-9]{2}\/[0-9]{2}\/[0-9]{4}$/;
                      if (!regex.test(values.birthDate)) return "La date doit être au format JJ/MM/AAAA";
                    }}
                    errors={errors}
                    touched={touched}
                    rows="2"
                  />
                  <CheckboxContainer>
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
                  </CheckboxContainer>
                  {values.school && (
                    <Item
                      style={{ marginTop: "0" }}
                      name="schoolLevel"
                      type="select"
                      options={levels}
                      title=""
                      selectPlaceholder="Sélectionner ma classe"
                      handleChange={handleChange}
                      value={values.schoolLevel}
                      values={values}
                    />
                  )}
                  <Item
                    name="department"
                    title="Département"
                    selectPlaceholder="Sélectionner mon département"
                    type="select"
                    options={departmentList.map((d) => ({ value: d, label: d }))?.sort((a, b) => a.label.localeCompare(b.label))}
                    values={values}
                    value={values.department}
                    handleChange={handleChange}
                    validate={(v) => !v && requiredMessage}
                    errors={errors}
                    touched={touched}
                    rows="2"
                  />
                  <LoadingButton loading={loading} type="submit" className="submit-button" onClick={handleSubmit} disabled={isSubmitting}>
                    Vérifier
                  </LoadingButton>
                  {isEligible && display ? (
                    <Note
                      title="Félicitations, vous êtes bien éligible au SNU."
                      text="Vous pouvez donc procéder à l'inscription."
                      textLink="Commencer l’inscription ›"
                      link="https://inscription.snu.gouv.fr/inscription/profil"
                      icon={tick}
                      backgroundColor="#ECFDF5"
                      titleColor="#065F46"
                      textColor="#047857"
                      linkColor="#065F46"
                    />
                  ) : null}
                  {!isEligible && display ? (
                    <Note
                      title="Malheureusement, vous n'êtes pas éligible au SNU."
                      text="Vous pouvez découvrir d'autres formes d'engagement en "
                      textLink="cliquant ici."
                      link="https://support.snu.gouv.fr/help/fr-fr/16-comprendre-le-snu/7-les-autres-formes-d-engagement"
                      icon={cross}
                      backgroundColor="#FEF2F2"
                      titleColor="#991B1B"
                      textColor="#B91C1C"
                      linkColor="#991B1B"
                      linkInText={true}
                    />
                  ) : null}
                </>
              )}
            </Formik>
          </Form>
        </Container>
      </Modal>
      <ModalButton onClick={() => setIsOpen(true)}>Vérifier votre éligibilité</ModalButton>
    </>
  );
}

const Item = ({ title, subTitle, name, value, values, handleChange, errors, touched, validate, type, options, selectPlaceholder, style, ...props }) => {
  return (
    <Col style={{ marginTop: "20px", ...style }}>
      <Label>
        {title} <Subtitle>{subTitle}</Subtitle>
      </Label>
      {type === "select" ? (
        <Field as={type} className="form-control" name={name} value={value} onChange={handleChange} validate={validate} {...props}>
          <option disabled key={-1} value="" defaultValue={!values[name]} label={selectPlaceholder}>
            {selectPlaceholder}
          </option>
          {options?.map((o, i) => (
            <option key={i} value={o.value} label={o.label}>
              {o.label}
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

const ModalButton = styled.button`
  background: transparent;
  border: 0.1rem solid #32257f;
  height: 3rem;
  width: 18rem;
  color: #32257f;
  border-radius: 60px;
`;

const Header = styled.header`
  text-align: center;
  img {
    width: 3rem;
  }
  h4 {
    margin-top: 1rem;
  }
  p {
    color: #6b7280;
    margin: 0;
  }
`;

const Label = styled.div`
  color: #374151;
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 5px;
`;

const Subtitle = styled.p`
  color: grey;
  font-size: 0.7rem;
  margin-bottom: 0;
`;

const Form = styled.div`
  display: flex;
  flex-direction: column;
  margin: 0 auto;
  width: 100%;
  .submit-button {
    margin: 1.5rem auto 0 auto;
    width: 93%;
  }
  @media (max-width: 767px) {
    width: 100%;
    .submit-button {
      margin: 0.5rem auto 0 auto;
    }
  }
  .close_icon {
    cursor: pointer;
    position: absolute;
    height: 1.5rem;
    width: 1.5rem;
    top: 1.5rem;
    right: 1.5rem;
  }
`;

const CheckboxContainer = styled.section`
  display: flex;
  padding: 1rem 1rem 0 1rem;
  align-items: baseline;
  .checkbox_label {
    margin-left: 0.7rem;
  }
`;

const Container = styled(ModalContainer)`
  position: relative;
  padding: 2rem;
`;
