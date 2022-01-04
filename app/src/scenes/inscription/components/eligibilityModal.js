import React, { useState } from "react";
import { Modal, Col } from "reactstrap";
import styled from "styled-components";
//import Modal from "./modal";
import { Formik, Field } from "formik";
import close from "../../../assets/cancel.png";
import logo from "../../../assets/logo-snu.png";
import tick from "../../../assets/tick.svg";
import cross from "../../../assets/cross.png";

import LoadingButton from "../../../components/buttons/LoadingButton";
import ErrorMessage, { requiredMessage } from "../../inscription/components/errorMessage";
import { ModalContainer } from "../../../components/modals/Modal";
import Note from "../../../components/Note";

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
              initialValues={{ birthDate: "", school: false, schoolLevel: "", address: "" }}
              validateOnChange={false}
              validateOnBlur={false}
              onSubmit={async (values) => {
                try {
                  setLoading(true);
                  let { birthDate, schoolLevel, address, school } = values;
                  if (!school) schoolLevel = "";
                  let sessions = [
                    {
                      month: "Février",
                      excludedGrade: ["3ème", "1ère", "Terminale", "Terminale CAP"],
                      // exclude all DOM-TOMs
                      excludedZip: ["971", "972", "973", "974", "975", "976", "978", "984", "986", "987", "988"],
                      includedBirthdate: { begin: "2004-02-26", end: "2007-02-12" },
                      stringDate: "13 au 25 février 2022",
                      info: "Pour les élèves de 2nde scolarisés dans un établissement relevant du ministère de l’éducation nationale, de la jeunesse et des sports, l’inscription est possible y compris dans le cas où une semaine du séjour de cohésion se déroule sur le temps scolaire. Ils bénéficieront d’une autorisation de participation au séjour de cohésion.",
                      buffer: 1.15,
                      id: "Février 2022",
                    },
                    {
                      month: "Juin",
                      excludedGrade: ["3ème", "1ère", "Terminale", "Terminale CAP"],
                      excludedZip: [],
                      includedBirthdate: { begin: "2004-06-25", end: "2007-06-11" },
                      stringDate: "12 au 24 juin 2022",
                      buffer: 1.25,
                      id: "Juin 2022",
                    },
                    {
                      month: "Juillet",
                      excludedGrade: [],
                      excludedZip: [],
                      includedBirthdate: { begin: "2004-07-16", end: "2007-07-02" },
                      stringDate: "3 au 15 juillet 2022",
                      buffer: 1.25,
                      id: "Juillet 2022",
                    },
                  ].filter((el) => {
                    if (el.excludedGrade.includes(schoolLevel)) return false;
                    else if (el.excludedZip.some((e) => address.includes(e))) return false;
                    else if (
                      new Date(el.includedBirthdate.begin).getTime() <= new Date(birthDate).getTime() &&
                      new Date(birthDate).getTime() <= new Date(el.includedBirthdate.end).getTime()
                    ) {
                      return true;
                    }
                    return false;
                  });
                  setLoading(false);
                  setIsEligible(!!sessions.length);
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
                    subTitle="Au format : AAAA/MM/JJ"
                    placeholder="Par exemple : 2005/05/22"
                    type="input"
                    value={values.birthDate}
                    handleChange={handleChange}
                    validate={(v) => !v && requiredMessage}
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
                      name="schoolLevel"
                      type="select"
                      options={["3ème", "Seconde", "1ère", "Terminale", "Terminale CAP"]}
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

const Item = ({ title, subTitle, name, value, handleChange, errors, touched, validate, type, options, selectPlaceholder, ...props }) => {
  return (
    <Col style={{ marginTop: type !== "select" ? 20 : 0 }}>
      <Label>
        {title} <Subtitle>{subTitle}</Subtitle>
      </Label>
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
  @media (max-width: 767px) {
    width: 100%;
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
    width: 50%;
    margin-left: 0.7rem;
  }
`;

const Container = styled(ModalContainer)`
  position: relative;
  padding: 2rem;
`;
