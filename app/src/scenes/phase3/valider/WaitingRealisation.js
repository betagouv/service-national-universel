import React from "react";
import styled from "styled-components";
import { Row, Col } from "reactstrap";
import { Formik, Field } from "formik";
import { useHistory } from "react-router-dom";
import { toastr } from "react-redux-toastr";
import { useDispatch, useSelector } from "react-redux";

import { setYoung } from "../../../redux/auth/actions";
import { MISSION_DOMAINS, translate, YOUNG_STATUS_PHASE3 } from "../../../utils";
import ErrorMessage, { requiredMessage } from "../../inscription/components/errorMessage";
import api from "../../../services/api";

export default () => {
  const history = useHistory();
  const dispatch = useDispatch();
  const young = useSelector((state) => state.Auth.young);

  return (
    <Formik
      validateOnChange={false}
      validateOnBlur={false}
      initialValues={{
        phase3StructureName: "",
        phase3MissionDomain: "",
        phase3MissionDescription: "",
        phase3MissionStartAt: "",
        phase3MissionEndAt: "",
        phase3TutorFirstName: "",
        phase3TutorLastName: "",
        phase3TutorEmail: "",
        phase3TutorPhone: "",
        statusPhase3: YOUNG_STATUS_PHASE3.WAITING_VALIDATION,
      }}
      onSubmit={async (values) => {
        // return console.log(values);
        try {
          const { ok, code, data } = await api.put(`/young/${young._id}/validate-mission-phase3`, values);
          if (!ok) return toastr.error("Une erreur s'est produite !", translate(code));
          toastr.success("Demande envoyée !");
          dispatch(setYoung(data));
          history.push(`/`);
        } catch (e) {
          return toastr.error("Une erreur s'est produite ", e?.error?.message);
        }
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
              <Field
                placeholder="Nom de la structure"
                className="form-control"
                validate={(v) => !v && requiredMessage}
                name="phase3StructureName"
                value={values.phase3StructureName}
                onChange={handleChange}
              />
              <ErrorMessage errors={errors} touched={touched} name="phase3StructureName" />
            </Col>
          </FormRow>
          <FormRow align="center">
            <Col md={4}>
              <Label>Ma mission</Label>
            </Col>
            <Col>
              <Field
                className="form-control"
                validate={(v) => !v && requiredMessage}
                component="select"
                name="phase3MissionDomain"
                value={values.phase3MissionDomain}
                onChange={handleChange}
              >
                <option value="" disabled>
                  Domaine de la mission
                </option>
                {Object.keys(MISSION_DOMAINS).map((d, i) => (
                  <option value={d} key={i}>
                    {translate(d)}
                  </option>
                ))}
              </Field>
              <ErrorMessage errors={errors} touched={touched} name="phase3StructureName" />

              <Field
                component="textarea"
                placeholder="Décrivez votre mission en quelques mots"
                className="form-control"
                validate={(v) => !v && requiredMessage}
                name="phase3MissionDescription"
                value={values.phase3MissionDescription}
                onChange={handleChange}
                rows={3}
              />
              <ErrorMessage errors={errors} touched={touched} name="phase3MissionDescription" />
              <FormGroup>
                <Row>
                  <Col style={{ display: "flex", alignItems: "center" }}>
                    <span style={{ marginRight: "1rem" }}>de</span>

                    <Field
                      validate={(v) => {
                        if (!v) return requiredMessage;
                      }}
                      type="date"
                      name="phase3MissionStartAt"
                      onChange={handleChange}
                      placeholder="Date de début"
                    />
                    <ErrorMessage errors={errors} touched={touched} name="phase3MissionStartAt" />
                  </Col>
                  <Col style={{ display: "flex", alignItems: "center" }}>
                    <span style={{ marginRight: "1rem" }}>à</span>

                    <Field
                      validate={(v) => {
                        if (!v) return requiredMessage;
                        const end = new Date(v);
                        const start = new Date(values.phase3MissionStartAt);
                        if (end.getTime() < start.getTime()) return "La date de fin doit être après la date de début.";
                      }}
                      type="date"
                      name="phase3MissionEndAt"
                      onChange={handleChange}
                      placeholder="Date de fin"
                    />
                    <ErrorMessage errors={errors} touched={touched} name="phase3MissionEndAt" />
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
              <Field
                placeholder="Prénom"
                className="form-control"
                validate={(v) => !v && requiredMessage}
                name="phase3TutorFirstName"
                value={values.phase3TutorFirstName}
                onChange={handleChange}
              />
              <ErrorMessage errors={errors} touched={touched} name="phase3TutorFirstName" />
            </Col>
          </FormRow>
          <FormRow>
            <Col md={4}>
              <Label>Nom</Label>
            </Col>
            <Col>
              <Field
                placeholder="Nom"
                className="form-control"
                validate={(v) => !v && requiredMessage}
                name="phase3TutorLastName"
                value={values.phase3TutorLastName}
                onChange={handleChange}
              />
              <ErrorMessage errors={errors} touched={touched} name="phase3TutorLastName" />
            </Col>
          </FormRow>
          <FormRow>
            <Col md={4}>
              <Label>Email</Label>
            </Col>
            <Col>
              <Field
                placeholder="Email"
                className="form-control"
                validate={(v) => !v && requiredMessage}
                name="phase3TutorEmail"
                value={values.phase3TutorEmail}
                onChange={handleChange}
              />
              <ErrorMessage errors={errors} touched={touched} name="phase3TutorEmail" />
            </Col>
          </FormRow>
          <FormRow>
            <Col md={4}>
              <Label>Téléphone</Label>
            </Col>
            <Col>
              <Field
                placeholder="Téléphone"
                className="form-control"
                validate={(v) => !v && requiredMessage}
                name="phase3TutorPhone"
                value={values.phase3TutorPhone}
                onChange={handleChange}
              />
              <ErrorMessage errors={errors} touched={touched} name="phase3TutorPhone" />
            </Col>
          </FormRow>
          <Footer>
            <h1>Faites valider la réalisation de votre mission par votre tuteur</h1>
            <h2>
              Un e-mail sera envoyé au tuteur pour valider votre mission.
              <br />
              L'administration pourra ensuite éditer votre attestion de réalisation du SNU.
            </h2>
            <ContinueButton
              onClick={() => {
                handleSubmit();
              }}
            >
              Faire valider ma phase 3
            </ContinueButton>
            {Object.keys(errors).length ? <h3>Vous ne pouvez passer à l'étape suivante car tous les champs ne sont pas correctement renseignés.</h3> : null}
          </Footer>
        </>
      )}
    </Formik>
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
  h2 {
    font-size: 1rem;
    color: #6b7280;
    font-weight: 400;
  }
  h3 {
    border: 1px solid #fc8181;
    border-radius: 0.25em;
    background-color: #fff5f5;
    color: #c53030;
    font-weight: 400;
    font-size: 12px;
    padding: 1em;
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
  input,
  textarea,
  select {
    margin: 0.5rem;
  }
`;

const Label = styled.div`
  color: #374151;
  font-weight: 500;
  margin-bottom: 10px;
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
