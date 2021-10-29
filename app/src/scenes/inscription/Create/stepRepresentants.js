import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { Row, Col } from "reactstrap";
import { Field, Formik } from "formik";
import { useSelector, useDispatch } from "react-redux";
import { toastr } from "react-redux-toastr";
import validator from "validator";
import { useHistory } from "react-router-dom";

import AddressInput from "../../../components/addressInputV2";
import api from "../../../services/api";
import { setYoung } from "../../../redux/auth/actions";
import ErrorMessage, { requiredMessage } from "../components/errorMessage";
import FranceConnectButton from "../components/FranceConnectButton";
import { environment } from "../../../config";
import { saveYoung, STEPS } from "../utils";
import { translate } from "../../../utils";
import FormLegend from "../../../components/form/FormLegend";
import FormRow from "../../../components/form/FormRow";
import FormFooter from "../../../components/form/FormFooter";

const Parent = ({ id = 1, values, errors, touched, handleChange }) => {
  const isParentFromFranceConnect = values[`parent${id}FromFranceConnect`] === "true";

  function FranceConnectZone({ id, handleSave }) {
    function getFranceConnectCallback(idRepresentant) {
      return `inscription/france-connect-callback?representant=${idRepresentant}`;
    }
    if (isParentFromFranceConnect) {
      return <i>Les information en provenance de FranceConnect du représentant légal n°{id} ont bien été enregistrées.</i>;
    }
    return (
      <FormRow>
        <Col>
          <p>
            En tant que représentant légal n°{id}, vous pouvez utiliser ce bouton pour vous identifier avec FranceConnect et récupérer vos données personnelles (nom, prénom et
            email), ou remplir les informations manuellement ci-dessous.
          </p>
          <FranceConnectButton callback={getFranceConnectCallback(id)} beforeRedirect={() => handleSave()} />
          <p>
            L'identification via <b>FranceConnect</b> dispense de signature numérique du consentement du ou des représentants légaux.
          </p>
        </Col>
      </FormRow>
    );
  }
  async function handleSave() {
    await saveYoung(values);
  }
  return (
    <>
      <FormLegend>
        Représentant légal n°{id}
        <FranceConnectZone handleSave={() => handleSave()} id={id} />
      </FormLegend>

      <FormRow>
        <Col md={4}>
          <Label>Je suis</Label>
        </Col>
        <Col>
          <Inline>
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
          </Inline>
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
            placeholder={`Prénom du représentant légal numéro ${id}`}
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
            placeholder={`Nom du représentant légal numéro ${id}`}
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
            placeholder={`Email du représentant légal numéro ${id}`}
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
            placeholder={`Téléphone du représentant légal numéro ${id}`}
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
          <Inline>
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
          </Inline>
          <ErrorMessage errors={errors} touched={touched} name={`parent${id}OwnAddress`} />
          {values[`parent${id}OwnAddress`] === "true" && (
            <FormRow>
              <Col md={12} style={{ marginTop: 15 }}>
                <AddressInput
                  keys={{
                    city: `parent${id}City`,
                    zip: `parent${id}Zip`,
                    address: `parent${id}Address`,
                    location: `parent${id}Location`,
                    department: `parent${id}Department`,
                    region: `parent${id}Region`,
                    country: `parent${id}Country`,
                  }}
                  values={values}
                  handleChange={handleChange}
                  errors={errors}
                  touched={touched}
                  countryVisible
                />
                <ErrorMessage errors={errors} touched={touched} name={`parent${id}OwnAddress`} />
              </Col>
            </FormRow>
          )}
        </Col>
      </FormRow>
    </>
  );
};

export default () => {
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

  return (
    <Wrapper>
      <Heading>
        <h2>Coordonnées de votre ou de vos représentants légaux</h2>
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
              <Col md={4} style={{ padding: "20px 0" }}>
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
            <FormFooter values={values} handleSubmit={handleSubmit} errors={errors} />
          </>
        )}
      </Formik>
    </Wrapper>
  );
};

const Inline = styled.div`
  display: flex;
  align-items: center;
`;

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
    color: #6b7280;
    margin-bottom: 0;
    font-size: 16px;
    font-weight: 400;
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
  margin-right: 15px;
  input {
    cursor: pointer;
    margin-right: 5px;
    width: 15px;
    height: 15px;
    min-width: 15px;
    min-height: 15px;
  }
`;

const BorderButton = styled.button`
  color: #5145cd;
  border: 1px solid #d1d5db;
  padding: 12px 25px;
  background-color: transparent;
  outline: 0;
  border-radius: 6px;
  font-weight: 500;
  :hover {
    background-color: #f9fafb;
    border: 1px solid #5145cd;
  }
`;
