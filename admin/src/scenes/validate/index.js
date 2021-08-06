import React, { useState, useEffect } from "react";
import { FormGroup } from "reactstrap";
import { Formik, Field } from "formik";
import { Redirect } from "react-router-dom";
import { toastr } from "react-redux-toastr";
import styled from "styled-components";
import queryString from "query-string";

import api from "../../services/api";
import LoadingButton from "../../components/buttons/LoadingButton";
import Loader from "../../components/Loader";
import Done from "./done.js";
import { colors } from "../../utils";

export default () => {
  const [young, setYoung] = useState(null);
  const [done, setDone] = useState(false);
  const params = queryString.parse(location.search);
  const { token, young_id } = params;

  if (!token || !young_id) {
    return <Redirect to="/" />;
  }

  useEffect(() => {
    (async () => {
      try {
        const { ok, data, code } = await api.get(`/young/validate_phase3/${young_id}/${token}`);
        if (!ok) return;
        if (data.phase3Token !== token) return;
        setYoung(data);
      } catch (e) {
        console.log(e);
      }
    })();
  }, []);
  if (!young) return <Loader />;
  if (done) return <Done />;
  else
    return (
      <Container>
        <Formik
          initialValues={young}
          onSubmit={async (values) => {
            try {
              const { ok, data, code } = await api.put(`/young/validate_phase3/${young_id}/${token}`, values);
              if (!ok) return;
              setDone(true);
            } catch (e) {
              console.log(e);
              return toastr.error("Erreur détectée", e);
            }
          }}
        >
          {({ values, isSubmitting, handleChange, handleSubmit }) => {
            return (
              <Form onSubmit={handleSubmit}>
                <img src={require("../../assets/logo-snu.png")} height={70} />
                <Title>Validation de la mission SNU du volontaire</Title>
                <Text>
                  Je soussigné(e),{" "}
                  <Bold>
                    {young.phase3TutorFirstName} {young.phase3TutorLastName}
                  </Bold>
                  , confirme la participation de{" "}
                  <Bold>
                    {young.firstName} {young.lastName}
                  </Bold>{" "}
                  à une mission de bénévolat au sein de la structure <Bold>{young.phase3StructureName}</Bold> .
                </Text>
                <Separator />
                <StyledFormGroup>
                  <div>
                    <label htmlFor="phase3MissionDescription">LA MISSION DÉCRITE EN QUELQUES MOTS PAR LE VOLONTAIRE</label>
                    <Field component="textarea" className="form-control" name="phase3MissionDescription" value={values.phase3MissionDescription} onChange={handleChange} rows={3} />
                  </div>
                </StyledFormGroup>
                <StyledFormGroup>
                  <div>
                    <label htmlFor="phase3TutorNote">PRÉCISEZ SI BESOIN QUELQUES INFORMATIONS COMPLÉMENTAIRES</label>
                    <Field
                      component="textarea"
                      placeholder="Informations complémentaires"
                      className="form-control"
                      name="phase3TutorNote"
                      value={values.phase3TutorNote}
                      onChange={handleChange}
                      rows={3}
                    />
                  </div>
                </StyledFormGroup>
                <Submit loading={isSubmitting} type="submit">
                  Valider la participation
                </Submit>
                <Register>
                  <a href="mailto:support@snu.gouv.fr">Contacter l'administration du SNU ›</a>
                </Register>
              </Form>
            );
          }}
        </Formik>
      </Container>
    );
};

const Bold = ({ children }) => <span style={{ fontWeight: "500" }}>{children}</span>;

const Separator = styled.hr`
  /* margin: 0 2.5rem; */
  height: 1px;
  margin: 0;
  border-style: none;
  background-color: #e5e7eb;
`;

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  > * {
    flex: 1;
  }
`;

const Title = styled.h1`
  position: relative;
  font-size: 2rem;
  text-align: center;
  @media (max-width: 768px) {
    font-size: 1.2rem;
  }
  font-weight: 700;
  margin: 1rem 0;
`;

const Text = styled.h2`
  text-align: center;
  position: relative;
  font-size: 1rem;
  color: #6e757c;
  @media (max-width: 768px) {
    font-size: 0.8rem;
  }
  font-weight: 400;
  margin-bottom: 20px;
`;

const Register = styled.h3`
  position: relative;
  font-size: 1rem;
  text-align: center;
  color: #6e757c;
  @media (max-width: 768px) {
    font-size: 0.8rem;
  }
  font-weight: 400;
  margin-bottom: 20px;
  a {
    color: #32267f;
    font-weight: 500;
  }
`;

const Form = styled.form`
  padding: 4rem;
  background-color: #f6f6f6;
  align-items: center;
  justify-content: center;
  display: flex;
  flex-direction: column;
  max-width: 40%;
  textarea {
    width: 100%;
  }
  @media (max-width: 768px) {
    border-radius: 0;
    margin: 0;
  }
`;

const StyledFormGroup = styled(FormGroup)`
  width: 100%;
  margin-bottom: 25px;
  label {
    color: rgb(106, 111, 133);
    font-size: 10px;
    text-transform: uppercase;
    font-weight: 700;
  }
`;
const InputField = styled(Field)`
  background-color: #fff;
  outline: 0;
  display: block;
  width: 100%;
  padding: 12px 20px;
  border: 1px solid #e2e8f0;
  border-radius: 5px;
  color: #798fb0;
  -webkit-transition: border 0.2s ease;
  transition: border 0.2s ease;
  line-height: 1.2;
  ::placeholder {
    color: #798fb0;
  }
  &:focus {
    outline: none;
    border: 1px solid rgba(66, 153, 225, 0.5);
    & + label {
      color: #434190;
    }
    ::placeholder {
      color: #ccd5e0;
    }
  }
`;
const Forgot = styled.div`
  margin-bottom: 20px;
  a {
    color: ${colors.purple};
    font-size: 14px;
  }
`;

const Submit = styled(LoadingButton)`
  display: block;
  font-size: 1rem;
  font-weight: 700;
  border-radius: 0;
  padding: 0.5rem 3rem;
  border: 0;
  background-color: ${colors.purple};
  margin-top: 30px;
  margin-bottom: 30px;
  border-radius: 10px;
  box-shadow: rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px;
  cursor: pointer;
  :hover {
    background-color: #42389d;
  }
  :focus {
    box-shadow: rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px;
  }
`;

const ErrorLogin = styled.div`
  background-color: #fff5f5;
  display: block;
  width: 100%;
  padding: 15px;
  margin-top: 3px;
  margin-bottom: 0;
  border: 1px solid #fc8180;
  color: #c73738;
  line-height: 1.2;
  border-radius: 5px;
`;
