import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { Col } from "reactstrap";
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
import { translate } from "../../../utils";
import FormLegend from "../../../components/form/FormLegend";
import FormRow from "../../../components/form/FormRow";
import FormFooter from "../../../components/form/FormFooter";
import InfoIcon from "../../../components/InfoIcon";

const Parent = ({ id = 1, values, errors, touched, handleChange, validateField }) => {
  const isParentFromFranceConnect = values[`parent${id}FromFranceConnect`] === "true";

  function FranceConnectZone({ id }) {
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
          <FranceConnectButton callback={getFranceConnectCallback(id)} />
          <p>
            L&apos;identification via <b>FranceConnect</b> dispense de signature numérique du consentement du ou des représentants légaux.
          </p>
        </Col>
      </FormRow>
    );
  }

  useEffect(() => {
    if (values[`parent${id}Email`]) validateField(`parent${id}Email`);
  }, [values[`parent${id}Email`]]);
  useEffect(() => {
    if (values[`parent${id}Phone`]) validateField(`parent${id}Phone`);
  }, [values[`parent${id}Phone`]]);

  return (
    <>
      <FormLegend>
        <h5>Représentant légal n°{id}</h5>
        <FranceConnectZone id={id} />
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
              <Col md={12}>
                <AddressInput
                  keys={{
                    city: `parent${id}City`,
                    zip: `parent${id}Zip`,
                    address: `parent${id}Address`,
                    location: `parent${id}Location`,
                    department: `parent${id}Department`,
                    region: `parent${id}Region`,
                    country: `parent${id}Country`,
                    addressVerified: `addressParent${id}Verified`,
                  }}
                  values={values}
                  handleChange={handleChange}
                  errors={errors}
                  touched={touched}
                  countryVisible
                  validateField={validateField}
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

export default function StepRepresentants() {
  const history = useHistory();
  const dispatch = useDispatch();
  const young = useSelector((state) => state.Auth.young);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState();
  const [isParent2Visible, setIsParent2Visible] = useState(false);

  const hasParent2Infos = () => {
    return young?.parent2Status || young?.parent2FirstName || young?.parent2LastName || young?.parent2Email || young?.parent2Phone ? true : false;
  };

  useEffect(() => {
    if (young) {
      setData({
        parent1Status: young.parent1Status,
        parent1FirstName: young.parent1FirstName,
        parent1LastName: young.parent1LastName,
        parent1Email: young.parent1Email,
        parent1Phone: young.parent1Phone,
        parent1OwnAddress: young.parent1OwnAddress,
        parent1City: young.parent1City,
        parent1Zip: young.parent1Zip,
        parent1Address: young.parent1Address,
        parent1Location: young.parent1Location,
        parent1Department: young.parent1Department,
        parent1Region: young.parent1Region,
        parent1Country: young.parent1Country,
        parent1FromFranceConnect: young.parent1FromFranceConnect,
        parent2Status: young.parent2Status,
        parent2FirstName: young.parent2FirstName,
        parent2LastName: young.parent2LastName,
        parent2Email: young.parent2Email,
        parent2Phone: young.parent2Phone,
        parent2OwnAddress: young.parent2OwnAddress,
        parent2City: young.parent2City,
        parent2Zip: young.parent2Zip,
        parent2Address: young.parent2Address,
        parent2Location: young.parent2Location,
        parent2Department: young.parent2Department,
        parent2Region: young.parent2Region,
        parent2Country: young.parent2Country,
        parent2FromFranceConnect: young.parent2FromFranceConnect,
      });
      setIsParent2Visible(hasParent2Infos());
      if (young.parent1Region && young.parent1Region) {
        setData((data) => ({ ...data, addressParent1Verified: "true" }));
      }
      if (young.parent2Region && young.parent2Region) {
        setData((data) => ({ ...data, addressParent2Verified: "true" }));
      }
    } else {
      history.push("/inscription/profil");
    }
  }, [young]);

  const onSubmit = async ({ values, type }) => {
    if (type === "next") setLoading(true);
    try {
      //Check location
      for (let id = 1; id <= 2; id++) {
        if (values[`parent${id}OwnAddress`] === "true") {
          if (values[`parent${id}Country`] !== "France") {
            delete values[`parent${id}Region`];
            delete values[`parent${id}Department`];
            delete values[`parent${id}Location`];
            delete values[`addressParent${id}Verified`];
          }
        } else {
          delete values[`parent${id}City`];
          delete values[`parent${id}Zip`];
          delete values[`parent${id}Address`];
          delete values[`parent${id}Location`];
          delete values[`parent${id}Department`];
          delete values[`parent${id}Region`];
          delete values[`parent${id}Country`];
          delete values[`addressParent${id}Verified`];
        }
      }
      if (!isParent2Visible) {
        delete values.parent2Email;
        delete values.parent2FirstName;
        delete values.parent2LastName;
        delete values.parent2OwnAddress;
        delete values.parent2Phone;
        delete values.parent2Status;
      }
      values.parent2 = isParent2Visible;
      const { ok, code, data } = await api.put(`/young/inscription/representant/${type}`, values);
      if (!ok || !data?._id) return toastr.error("Une erreur s'est produite :", translate(code));
      if (type === "save") toastr.success("Vos modifications ont bien été enregistrees !");
      dispatch(setYoung(data));
      if (type === "next") history.push("/inscription/consentements");
    } catch (e) {
      console.log(e);
      toastr.error("Oups, une erreur est survenue pendant le traitement du formulaire :", translate(e.code));
    } finally {
      setLoading(false);
    }
  };

  if (!data) return null;

  return (
    <Wrapper>
      <Heading>
        <h2>Coordonnées de votre ou de vos représentants légaux</h2>
        <p>Faites compléter les informations ci-dessous par votre ou vos représentants légaux.</p>
      </Heading>
      <Formik initialValues={data} enableReinitialize={true} validateOnChange={false} validateOnBlur={false} onSubmit={(values) => onSubmit({ values, type: "next" })}>
        {({ values, handleChange, handleSubmit, errors, touched, validateField }) => (
          <>
            <Parent id={1} values={values} handleChange={handleChange} errors={errors} touched={touched} validateField={validateField} />
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
                    delete values.parent2Country;
                  }}>
                  {!isParent2Visible ? "Ajouter" : "Retirer"} le représentant légal nº2
                </BorderButton>
              </Col>
              {isParent2Visible ? (
                <Infos>
                  <InfoIcon color="#32257F" />
                  <p>
                    Veuillez noter que dans le cas où les deux représentants légaux sont renseignés, ceux-ci devront signer conjointement l’ensemble des autorisations demandées
                    dans la suite du parcours SNU.
                  </p>
                </Infos>
              ) : null}
            </FormRow>
            {isParent2Visible ? <Parent id={2} values={values} handleChange={handleChange} errors={errors} touched={touched} validateField={validateField} /> : null}
            <FormFooter loading={loading} values={values} handleSubmit={handleSubmit} errors={errors} save={onSubmit} />
          </>
        )}
      </Formik>
    </Wrapper>
  );
}

const Inline = styled.div`
  display: flex;
  align-items: center;
  @media (max-width: 420px) {
    flex-wrap: wrap;
  }
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

const Infos = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: flex-start;
  background: rgba(79, 70, 229, 0.1);
  padding: 1rem;
  color: #32257f;
  border-radius: 6px;
  svg {
    margin-top: 4px;
  }
  p {
    flex: 1;
  }
`;
