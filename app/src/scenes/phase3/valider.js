import React from "react";
import styled from "styled-components";
import { Row, Col, Input, Container, CustomInput } from "reactstrap";
import { Formik, Field } from "formik";
import { Link } from "react-router-dom";

import { MISSION_DOMAINS, translate } from "../../utils";
import ErrorMessage, { requiredMessage } from "../inscription/components/errorMessage";

export default () => {
  return (
    <Wrapper>
      <Heading>
        <p>VALIDER MA PHASE 3</p>
        <h1>J'ai terminé ma mission de phase 3</h1>
      </Heading>
      <Formik
        validateOnChange={false}
        validateOnBlur={false}
        initialValues={{}}
        onSubmit={async (values) => {
          // try {
          //   const { ok, code, data: mission } = await api[values._id ? "put" : "post"]("/mission", values);
          //   if (!ok) return toastr.error("Une erreur s'est produite lors de l'enregistrement de cette mission", translate(code));
          //   history.push(`/mission/${mission._id}`);
          //   toastr.success("Mission enregistrée");
          // } catch (e) {
          //   return toastr.error("Une erreur s'est produite lors de l'enregistrement de cette mission", e?.error?.message);
          // }
        }}
      >
        {({ values, handleChange, handleSubmit, isValid, errors, touched }) => (
          <>
            <FormLegend>
              Ma mission
              <p>Renseignez ici votre justificatif de fin de mission</p>
            </FormLegend>
            <FormRow>
              <Col md={4}>
                <Label>Nom de la structure</Label>
              </Col>
              <Col>
                <Input />
              </Col>
            </FormRow>
            <FormRow align="center">
              <Col md={4}>
                <Label>Ma mission</Label>
              </Col>
              <Col>
                <CustomInput type="select" id="domain" defaultValue="" style={{ marginBottom: 10 }}>
                  <option value="" disabled>
                    Domaine de la mission
                  </option>
                  {Object.keys(MISSION_DOMAINS).map((d, i) => (
                    <option value={d} key={i}>
                      {translate(d)}
                    </option>
                  ))}
                </CustomInput>
                <Input type="textarea" style={{ marginBottom: 10 }} rows={3} placeholder="Décrivez votre mission en quelques mots" />
                <FormGroup>
                  <Row>
                    <Col>
                      <Field
                        validate={(v) => {
                          if (!v) return requiredMessage;
                        }}
                        type="date"
                        name="startAt"
                        onChange={handleChange}
                        placeholder="Date de début"
                      />
                      <ErrorMessage errors={errors} touched={touched} name="startAt" />
                    </Col>
                    <Col>
                      <Field
                        validate={(v) => {
                          if (!v) return requiredMessage;
                          const end = new Date(v);
                          const start = new Date(values.startAt);
                          if (end.getTime() < start.getTime()) return "La date de fin doit être après la date de début.";
                        }}
                        type="date"
                        name="endAt"
                        onChange={handleChange}
                        placeholder="Date de fin"
                      />
                      <ErrorMessage errors={errors} touched={touched} name="endAt" />
                    </Col>
                  </Row>
                </FormGroup>
              </Col>
            </FormRow>

            <FormLegend>
              Mon tuteur
              <p>Coordonnées de votre tuteur</p>
            </FormLegend>
            <FormRow>
              <Col md={4}>
                <Label>Prénom</Label>
              </Col>
              <Col>
                <Input />
              </Col>
            </FormRow>
            <FormRow>
              <Col md={4}>
                <Label>Nom</Label>
              </Col>
              <Col>
                <Input />
              </Col>
            </FormRow>
            <FormRow>
              <Col md={4}>
                <Label>Email</Label>
              </Col>
              <Col>
                <Input />
              </Col>
            </FormRow>
            <FormRow>
              <Col md={4}>
                <Label>Téléphone</Label>
              </Col>
              <Col>
                <Input />
              </Col>
            </FormRow>
            <Footer>
              <h1>Faites valider la réalisation de votre mission par votre tuteur</h1>
              <h3>
                Un e-mail sera envoyé au tuteur pour valider votre mission.
                <br />
                L'administration pourra ensuite éditer votre attestion de réalisation du SNU.
              </h3>
              <ContinueButton>Faire valider ma phase 3</ContinueButton>
            </Footer>
          </>
        )}
      </Formik>
    </Wrapper>
  );
};

const Footer = styled.div`
  text-align: center;
  display: flex;
  align-items: center;
  flex-direction: column;
  h1 {
    font-size: 1.2rem;
    color: #000;
  }
  h3 {
    font-size: 1rem;
    color: #6b7280;
    font-weight: 400;
  }
`;

const Wrapper = styled(Container)`
  padding: 20px 40px;
  border-radius: 6px;
  background: #fff;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  margin-bottom: 2rem;
`;
const Heading = styled.div`
  margin-bottom: 30px;
  h1 {
    color: #161e2e;
    font-size: 36px;
    font-weight: 700;
  }
  p {
    color: #42389d;
    font-size: 16px;
    font-weight: 700;
    margin-bottom: 5px;
  }
`;

const FormLegend = styled.div`
  color: #161e2e;
  font-size: 18px;
  border-top: 1px solid #e5e7eb;
  /* border-bottom: 1px solid #e5e7eb; */
  padding: 3rem 0 1.5rem;
  p {
    color: #6b7280;
    margin-bottom: 0;
    font-size: 15px;
    font-weight: 400;
  }
`;

const FormRow = styled(Row)`
  border-top: 1px solid #e5e7eb;
  padding-top: 20px;
  padding-bottom: 20px;
  align-items: ${({ align }) => align};
  text-align: left;
`;

const Label = styled.div`
  color: #374151;
  font-weight: 500;
  margin-bottom: 10px;
`;

const ImageInput = styled.label`
  border: 1px dashed #d2d6dc;
  padding: 25px;
  text-align: center;
  display: block;
  outline: 0;
  border-radius: 6px;
  cursor: pointer;
  color: #4b5563;
  max-width: 500px;
  font-size: 14px;
  line-height: 1.7;
  cursor: pointer;

  img {
    height: 40px;
    display: block;
    margin: 10px auto;
  }
`;

const ContinueButton = styled.button`
  color: #fff;
  background-color: #5145cd;
  padding: 9px 20px;
  border: 0;
  outline: 0;
  border-radius: 99999999px;
  font-weight: 400;
  font-size: 20px;
  margin: 1rem 0;
  outline: 0;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  :hover {
    opacity: 0.9;
  }
`;

const Modifybutton = styled(Link)`
  border: 1px solid #d2d6dc;
  padding: 10px 15px;
  color: #3d4151;
  font-size: 12px;
  border-radius: 4px;
  margin-top: 5px;
  display: inline-block;
  :hover {
    color: #333;
  }
`;
const FormGroup = styled.div`
  margin-bottom: 25px;
  > label {
    font-size: 11px;
    font-weight: 500;
    text-transform: uppercase;
    color: #6a6f85;
    display: block;
    margin-bottom: 10px;
    > span {
      color: red;
      font-size: 10px;
      margin-right: 5px;
    }
  }
  select,
  textarea,
  input {
    display: block;
    width: 100%;
    background-color: #fff;
    color: #606266;
    border: 0;
    outline: 0;
    padding: 11px 20px;
    border-radius: 6px;
    margin-right: 15px;
    border: 1px solid #dcdfe6;
    ::placeholder {
      color: #d6d6e1;
    }
    :focus {
      border: 1px solid #aaa;
    }
  }
`;
