import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { Row, Col } from "reactstrap";
import { Field, Formik } from "formik";
import { useSelector, useDispatch } from "react-redux";
import { toastr } from "react-redux-toastr";
import validator from "validator";
import { useHistory } from "react-router-dom";

import AddressInput from "../../../components/addressInput";
import api from "../../../services/api";
import matomo from "../../../services/matomo";

import { setYoung } from "../../../redux/auth/actions";
import ErrorMessage, { requiredMessage } from "../components/errorMessage";
import FranceConnectButton from "../components/FranceConnectButton";
import { environment } from "../../../config";

import { saveYoung, STEPS } from "../utils";
import { translate } from "../../../utils";

const Parent = ({ id = 1, values, errors, touched, handleChange }) => {
  const isParentFromFranceConnect = values[`parent${id}FromFranceConnect`] === "true";

  function FranceConnectZone({ id, handleSave }) {
    function getFranceConnectCallback(idRepresentant) {
      return `inscription/france-connect-callback?representant=${idRepresentant}`;
    }
    if (environment === "production") return null;
    if (isParentFromFranceConnect) {
      return <i>Les information en provenance de FranceConnect du représentant légal n°{id} ont bien été enregistrées.</i>;
    }
    return (
      <FormRow>
        <Col>
          <p>
            Vous pouvez utiliser ce bouton vous pour identifier et récupérer les données (nom, prénom et email) du représentant légal n°{id} avec FranceConnect, ou remplir les
            informations manuellement ci-dessous.
          </p>
          <FranceConnectButton callback={getFranceConnectCallback(id)} beforeRedirect={() => handleSave()} />
        </Col>
      </FormRow>
    );
  }
  async function handleSave() {
    await saveYoung(values);
  }
  return (
    <>
      <FormLegend>Représentant légal n°{id}</FormLegend>
      <FranceConnectZone handleSave={() => handleSave()} id={id} />

      <FormRow>
        <Col md={4}>
          <Label>Je suis</Label>
        </Col>
        <Col>
          <RadioLabel>
            <Field
              validate={(v) => !v && requiredMessage}
              type="radio"
              name={`parent${id}Status`}
              onChange={handleChange}
              value="mother"
              checked={values[`parent${id}Status`] === "mother"}
            />
            La mère
          </RadioLabel>
          <RadioLabel>
            <Field
              validate={(v) => !v && requiredMessage}
              type="radio"
              name={`parent${id}Status`}
              onChange={handleChange}
              value="father"
              checked={values[`parent${id}Status`] === "father"}
            />
            Le père
          </RadioLabel>
          <RadioLabel>
            <Field
              validate={(v) => !v && requiredMessage}
              type="radio"
              name={`parent${id}Status`}
              onChange={handleChange}
              value="representant"
              checked={values[`parent${id}Status`] === "representant"}
            />
            Le représentant légal
          </RadioLabel>
          <ErrorMessage errors={errors} touched={touched} name={`parent${id}Status`} />
        </Col>
      </FormRow>
      <FormRow align="center">
        <Col md={4}>
          <Label>Prénom</Label>
        </Col>
        <Col>
          <Field
            validate={(v) => !v && requiredMessage}
            placeholder={`Prénom du parent ${id}`}
            name={`parent${id}FirstName`}
            value={values[`parent${id}FirstName`]}
            onChange={handleChange}
            className="form-control"
            disabled={isParentFromFranceConnect}
          />
          <ErrorMessage errors={errors} touched={touched} name={`parent${id}FirstName`} />
        </Col>
      </FormRow>
      <FormRow align="center">
        <Col md={4}>
          <Label>{isParentFromFranceConnect ? "Nom de naissance" : "Nom"}</Label>
        </Col>
        <Col>
          <Field
            validate={(v) => !v && requiredMessage}
            placeholder={`Nom du parent ${id}`}
            name={`parent${id}LastName`}
            value={values[`parent${id}LastName`]}
            onChange={handleChange}
            className="form-control"
            disabled={isParentFromFranceConnect}
          />
          <ErrorMessage errors={errors} touched={touched} name={`parent${id}LastName`} />
        </Col>
      </FormRow>
      <FormRow align="center">
        <Col md={4}>
          <Label>E-mail</Label>
        </Col>
        <Col>
          <Field
            validate={(v) => (!v && requiredMessage) || (!validator.isEmail(v) && "Ce champs est au mauvais format")}
            placeholder={`Email du parent ${id}`}
            type="email"
            name={`parent${id}Email`}
            value={values[`parent${id}Email`]}
            onChange={handleChange}
            className="form-control"
          />
          <ErrorMessage errors={errors} touched={touched} name={`parent${id}Email`} />
        </Col>
      </FormRow>
      <FormRow align="center">
        <Col md={4}>
          <Label>Téléphone</Label>
        </Col>
        <Col>
          <Field
            validate={(v) => (!v && requiredMessage) || (!validator.isMobilePhone(v) && "Le numéro de téléphone est au mauvais format. Format attendu : 06XXXXXXXX ou +33XXXXXXXX")}
            placeholder={`Téléphone du parent ${id}`}
            type="tel"
            name={`parent${id}Phone`}
            value={values[`parent${id}Phone`]}
            onChange={handleChange}
            className="form-control"
          />
          <ErrorMessage errors={errors} touched={touched} name={`parent${id}Phone`} />
        </Col>
      </FormRow>
      <FormRow>
        <Col md={4}>
          <Label>Lieu de résidence</Label>
        </Col>
        <Col>
          <RadioLabel>
            <Field
              validate={(v) => !v && requiredMessage}
              className="form-control"
              type="radio"
              name={`parent${id}OwnAddress`}
              value="false"
              checked={values[`parent${id}OwnAddress`] === "false"}
              onChange={handleChange}
            />
            Identique à celle du volontaire
          </RadioLabel>
          <RadioLabel>
            <Field
              validate={(v) => !v && requiredMessage}
              className="form-control"
              type="radio"
              name={`parent${id}OwnAddress`}
              value="true"
              checked={values[`parent${id}OwnAddress`] === "true"}
              onChange={handleChange}
            />
            Différente de celle du volontaire
          </RadioLabel>
          <ErrorMessage errors={errors} touched={touched} name={`parent${id}OwnAddress`} />
          {values[`parent${id}OwnAddress`] === "true" && (
            <FormRow>
              <Col>
                <Row>
                  <Col md={12} style={{ marginTop: 15 }}>
                    <Label>Rechercher</Label>
                    <AddressInput
                      keys={{
                        city: `parent${id}City`,
                        zip: `parent${id}Zip`,
                        address: `parent${id}Address`,
                        location: `parent${id}Location`,
                        department: `parent${id}Department`,
                        region: `parent${id}Region`,
                      }}
                      values={values}
                      handleChange={handleChange}
                      errors={errors}
                      touched={touched}
                    />
                  </Col>
                </Row>
              </Col>
            </FormRow>
          )}
        </Col>
      </FormRow>
    </>
  );
};

export default () => {
  useEffect(() => {
    matomo.logEvent("inscription", "open_step", "step", 3);
  }, []);

  const history = useHistory();
  const dispatch = useDispatch();
  const young = useSelector((state) => state.Auth.young);
  const [isParent2Visible, setIsParent2Visible] = useState(false);
  const [initialValues, setInitialValues] = useState(young);

  const hasParent2Infos = () => {
    return young && (young.parent2Status || young.parent2FirstName || young.parent2LastName || young.parent2Email || young.parent2Phone);
  };
  useEffect(() => {
    setIsParent2Visible(hasParent2Infos());
  }, [young]);

  if (!young) {
    history.push("/inscription/profil");
    return <div />;
  }

  const handleSave = async (values) => {
    const young = await saveYoung(values);
    if (young) dispatch(setYoung(young));
  };

  return (
    <Wrapper>
      <Heading>
        <h2>Coordonnées du ou des représentants légaux</h2>
        <p>Faites compléter les informations ci-dessous par votre ou vos représentants légaux.</p>
      </Heading>
      <Formik
        initialValues={initialValues}
        enableReinitialize={true}
        validateOnChange={false}
        validateOnBlur={false}
        onSubmit={async (values) => {
          try {
            values.inscriptionStep = STEPS.CONSENTEMENTS;
            const { ok, code, data: young } = await api.put("/young", values);
            if (!ok) return toastr.error("Une erreur s'est produite :", translate(code));
            dispatch(setYoung(young));
            history.push("/inscription/consentements");
          } catch (e) {
            console.log(e);
            toastr.error("Oups, une erreur est survenue pendant le traitement du formulaire :", translate(e.code));
          }
        }}
      >
        {({ values, handleChange, handleSubmit, isSubmitting, submitForm, errors, touched }) => (
          <>
            <Parent id={1} values={values} handleChange={handleChange} errors={errors} touched={touched} />
            <FormRow>
              <Col md={{ offset: 4 }} style={{ padding: "45px 20px" }}>
                <BorderButton
                  onClick={() => {
                    setIsParent2Visible(!isParent2Visible);
                    delete values.parent2Status;
                    delete values.parent2FirstName;
                    delete values.parent2LastName;
                    delete values.parent2Email;
                    delete values.parent2Phone;
                    delete values.parent2OwnAddress;
                    delete values.parent2Address;
                    delete values.parent2ComplementAddress;
                    delete values.parent2Zip;
                    delete values.parent2City;
                    delete values.parent2Department;
                    delete values.parent2Location;
                  }}
                >
                  {!isParent2Visible ? "Ajouter" : "Retirer"} un représentant légal
                </BorderButton>
              </Col>
            </FormRow>
            {isParent2Visible ? <Parent id={2} values={values} handleChange={handleChange} errors={errors} touched={touched} /> : null}
            <Footer>
              <ButtonContainer>
                <SaveButton onClick={() => handleSave(values)}>Enregistrer</SaveButton>
                <ContinueButton onClick={handleSubmit}>Continuer</ContinueButton>
              </ButtonContainer>
              {Object.keys(errors).length ? <h3>Vous ne pouvez passer à l'étape suivante car tous les champs ne sont pas correctement renseignés.</h3> : null}
            </Footer>
          </>
        )}
      </Formik>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  padding: 40px;
  @media (max-width: 768px) {
    padding: 22px;
  }
`;
const Heading = styled.div`
  margin-bottom: 30px;
  h2 {
    color: #161e2e;
    font-size: 1.8rem;
    font-weight: 700;
  }
  p {
    color: #161e2e;
    font-size: 1rem;
    margin: 0;
  }
`;
const Warning = styled.div`
  background-color: #88001711;
  border-radius: 0.5rem;
  border: 1px solid #880017;
  padding: 0.5rem;
  margin-top: 0.5rem;
  display: flex;
  align-items: center;
  img {
    height: 1rem;
    margin: 0.5rem;
  }
  p {
    color: #880017;
    font-size: 0.8rem;
  }
`;

const FormLegend = styled.div`
  color: #161e2e;
  font-size: 20px;
  font-weight: 700;
  border-top: 1px solid #e5e7eb;
  border-bottom: 1px solid #e5e7eb;
  padding: 20px 0;
`;

const FormRow = styled(Row)`
  border-bottom: 1px solid #e5e7eb;
  padding-top: 20px;
  padding-bottom: 20px;
  align-items: ${({ align }) => align};
  text-align: left;
  input[type="text"] {
    max-width: 500px;
  }
`;

const Label = styled.div`
  color: #374151;
  margin-bottom: 10px;
`;

const RadioLabel = styled.label`
  display: flex;
  align-items: center;
  color: #374151;
  font-size: 14px;
  margin-bottom: 15px;
  :last-child {
    margin-bottom: 0;
  }
  input {
    cursor: pointer;
    margin-right: 12px;
    width: 15px;
    height: 15px;
    min-width: 15px;
    min-height: 15px;
  }
`;

const BorderButton = styled.button`
  color: #5145cd;
  border: 1px solid #5145cd;
  padding: 12px 25px;
  background-color: transparent;
  outline: 0;
  border-radius: 6px;
  font-weight: 500;
  :hover {
    background-color: #f9fafb;
  }
`;

const Footer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  h3 {
    border: 1px solid #fc8181;
    border-radius: 0.25em;
    margin-top: 1em;
    background-color: #fff5f5;
    color: #c53030;
    font-weight: 400;
    font-size: 12px;
    padding: 1em;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;

const ContinueButton = styled.button`
  color: #fff;
  background-color: #5145cd;
  padding: 9px 20px;
  border: 0;
  outline: 0;
  border-radius: 6px;
  font-weight: 500;
  font-size: 20px;
  margin-right: 10px;
  margin-top: 40px;
  @media (max-width: 768px) {
    margin-top: 10px;
  }
  display: block;
  width: 140px;
  outline: 0;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  :hover {
    opacity: 0.9;
  }
`;

const SaveButton = styled(ContinueButton)`
  color: #374151;
  background-color: #f9fafb;
  border-width: 1px;
  border-color: transparent;
`;
