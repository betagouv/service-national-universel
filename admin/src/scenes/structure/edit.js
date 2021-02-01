import React, { useEffect, useState } from "react";
import { Col, Row, Input } from "reactstrap";
import styled from "styled-components";
import { toastr } from "react-redux-toastr";
import { useDispatch, useSelector } from "react-redux";
import { Formik, Field } from "formik";
import { Link, Redirect } from "react-router-dom";

import MultiSelect from "../../components/Multiselect";
import AddressInput from "../../components/addressInput";
import ErrorMessage, { requiredMessage } from "../../components/errorMessage";

import { domains, translate, departmentList, MISSION_PERIOD_DURING_HOLIDAYS, MISSION_PERIOD_DURING_SCHOOL } from "../../utils";
import api from "../../services/api";

export default (props) => {
  const [defaultValue, setDefaultValue] = useState();
  const [redirect, setRedirect] = useState(false);

  useEffect(() => {
    (async () => {
      const id = props.match && props.match.params && props.match.params.id;
      if (!id) return setDefaultValue(null);
      const { data } = await api.get(`/structure/${id}`);
      setDefaultValue(data);
    })();
  }, []);

  const handleSave = async (values) => {
    const { ok, code } = await api.put("/structure", values);
    if (!ok) return toastr.error("Une erreur s'est produite lors de l'enregistrement de votre progression", code);
    if (ok) toastr.success("Progression enregistrée");
  };

  if (defaultValue === undefined) return <div>Chargement...</div>;
  if (redirect) return <Redirect to="/structure" />;

  return (
    <Formik
      validateOnChange={false}
      validateOnBlur={false}
      initialValues={
        defaultValue || {
          placesTotal: 1,
          format: "CONTINUOUS",
          structureId: structure._id,
          structureName: structure.name,
          name: "",
          description: "",
          actions: "",
          justifications: "",
          contraintes: "",
          departement: "",
          tuteur: "",
          startAt: "",
          endAt: "",
          city: "",
          zip: "",
          address: "",
          location: "",
          department: "",
          region: "",
        }
      }
      onSubmit={async (values) => {
        try {
          console.log("values", values);
          if (!values._id) {
            values.placesLeft = values.placesTotal;
            await api.post("/mission", values);
            return toastr.success("Mission créée");
          }
          //TODO PLACE TAKEN
          values.placesLeft = values.placesTotal - values.placesTaken;
          await api.put(`/mission/${values._id}`, values);
          return toastr.success("Mission mise à jour");
        } catch (e) {
          console.log(e);
          toastr.error("Erreur!");
        }
      }}
    >
      {({ values, handleChange, handleSubmit, isValid, errors, touched }) => (
        <Wrapper>
          <Header>
            <Title>{defaultValue ? values.name : "Création d'une structure"}</Title>
            {Object.keys(errors).length ? <h3>Vous ne pouvez pas continuer car tous les champs ne sont pas correctement renseignés.</h3> : null}
            <ButtonContainer>
              <button disabled={!isValid} onClick={handleSubmit}>
                {defaultValue ? "Enregistrer les modifications" : "Créer la structure"}
              </button>
            </ButtonContainer>
          </Header>
          <Box>
            <Row style={{ borderBottom: "2px solid #f4f5f7" }}>
              <Col md={6} style={{ borderRight: "2px solid #f4f5f7" }}>
                <Wrapper>
                  <Legend>Informations sur structure d'accueil</Legend>
                  <FormGroup>
                    <label>
                      <span>*</span>NOM DE LA STRUCTURE
                    </label>
                    <Field validate={(v) => !v && requiredMessage} value={values.name} onChange={handleChange} name="name" placeholder="Nom de votre structure" />
                    <ErrorMessage errors={errors} touched={touched} name="name" />
                  </FormGroup>
                  <FormGroup>
                    <label>
                      <span>*</span>STATUT JURIDIQUE
                    </label>
                    <Field validate={(v) => !v && requiredMessage} component="select" name="legalStatus" value={values.legalStatus} onChange={handleChange}></Field>
                    <ErrorMessage errors={errors} touched={touched} name="legalStatus" />
                  </FormGroup>
                  <FormGroup>
                    <label>DISPOSEZ-VOUS D'UN AGRÉMENT ?</label>
                    {/* TODO */}
                    <Field component="select" name="" value={""} onChange={handleChange}></Field>
                  </FormGroup>
                  <FormGroup>
                    <label>
                      <span>*</span>PRÉSENTATION SYNTHÉTIQUE DE LA STRUCTURE
                    </label>
                    <Field
                      validate={(v) => !v && requiredMessage}
                      name="description"
                      component="textarea"
                      rows={4}
                      value={values.description}
                      onChange={handleChange}
                      placeholder="Décrivez en quelques mots votre structure"
                    />
                    <ErrorMessage errors={errors} touched={touched} name="description" />
                  </FormGroup>
                  <FormGroup>
                    <label>NUMÉRO DE SIRET (SI DISPONIBLE)</label>
                    <Field value={values.siret} onChange={handleChange} name="siret" placeholder="Numéro de SIRET" />
                  </FormGroup>
                  <Row>
                    <Col md={6}>
                      <FormGroup>
                        <label>SITE INTERNET</label>
                        <Field value={values.website} onChange={handleChange} name="website" placeholder="Site internet" />
                      </FormGroup>
                    </Col>
                    <Col md={6}>
                      <FormGroup>
                        <label>FACEBOOK</label>
                        <Field value={values.facebook} onChange={handleChange} name="facebook" placeholder="Facebook" />
                      </FormGroup>
                    </Col>
                  </Row>
                  <Row>
                    <Col md={6}>
                      <FormGroup>
                        <label>TWITTER</label>
                        <Field value={values.twitter} onChange={handleChange} name="twitter" placeholder="Twitter" />
                      </FormGroup>
                    </Col>
                    <Col md={6}>
                      <FormGroup>
                        <label>INSTAGRAM</label>
                        <Field value={values.instagram} onChange={handleChange} name="instagram" placeholder="Instagram" />
                      </FormGroup>
                    </Col>
                  </Row>
                  <FormGroup>
                    <label>RÉSEAU NATIONAL</label>
                    <p style={{ color: "#a0aec1", fontSize: 12 }}>
                      Si l’organisation est membre d'un réseau national (Les Banques alimentaires, Armée du Salut...), renseignez son nom. Vous permettez ainsi au superviseur de
                      votre réseau de visualiser les missions et bénévoles rattachés à votre organisation.
                    </p>
                    {/* TODO */}
                    <Field component="select" name="" value={""} onChange={handleChange}></Field>
                  </FormGroup>
                  <FormGroup>
                    <label>TÊTE DE RÉSEAU</label>
                    {/* TODO */}
                  </FormGroup>
                </Wrapper>
              </Col>
              <Col md={6}>{/* <Row style={{ borderBottom: "2px solid #f4f5f7" }}></Row> */}</Col>
            </Row>
            <Row>
              <Col md={12}>
                <Wrapper>
                  <Legend>Lieu de la structure</Legend>
                  <FormGroup>
                    <label>
                      <span>*</span>LIEU
                    </label>
                    <AddressInput
                      keys={{ city: "city", zip: "zip", address: "address", location: "location", department: "department", region: "region" }}
                      values={values}
                      handleChange={handleChange}
                      errors={errors}
                      touched={touched}
                    />
                    <p style={{ color: "#a0aec1", fontSize: 12 }}>Si l'adresse n'est pas reconnue, veuillez saisir le nom de la ville.</p>
                  </FormGroup>
                </Wrapper>
              </Col>
            </Row>
          </Box>
          <Header style={{ justifyContent: "flex-end" }}>
            {Object.keys(errors).length ? <h3>Vous ne pouvez pas continuer car tous les champs ne sont pas correctement renseignés.</h3> : null}
            <ButtonContainer>
              <button
                disabled={!isValid}
                onClick={() => {
                  handleChange({ target: { value: "WAITING_VALIDATION", name: "status" } });
                  handleSubmit();
                }}
              >
                {defaultValue ? "Enregistrer les modifications" : "Créer la structure"}
              </button>
            </ButtonContainer>
          </Header>
        </Wrapper>
      )}
    </Formik>
  );
};

const Wrapper = styled.div`
  padding: 3rem;
`;

const Header = styled.div`
  padding: 0 25px 0;
  display: flex;
  margin-top: 25px;
  align-items: center;
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

const Subtitle = styled.div`
  color: rgb(113, 128, 150);
  font-weight: 400;
  text-transform: uppercase;
  font-size: 18px;
`;
const Title = styled.div`
  color: rgb(38, 42, 62);
  font-weight: 700;
  font-size: 24px;
  margin-bottom: 10px;
  flex: 1;
`;

const Legend = styled.div`
  color: rgb(38, 42, 62);
  margin-bottom: 20px;
  font-size: 20px;
`;

const ButtonLight = styled.button`
  background-color: #fff;
  border: 1px solid #dcdfe6;
  outline: 0;
  align-self: flex-start;
  border-radius: 4px;
  padding: 10px 20px;
  font-size: 14px;
  width: 120px;
  color: #646b7d;
  cursor: pointer;
  margin-right: 10px;
  :hover {
    color: rgb(49, 130, 206);
    border-color: rgb(193, 218, 240);
    background-color: rgb(234, 243, 250);
  }
`;
const Button = styled.button`
  background-color: #3182ce;
  outline: 0;
  border: 0;
  color: #fff;
  border-radius: 4px;
  padding: 10px 20px;
  font-size: 14px;
  cursor: pointer;
  :hover {
    background-color: #5a9bd8;
  }
  :disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ButtonContainer = styled.div`
  button {
    background-color: #5245cc;
    color: #fff;
    &.white-button {
      color: #000;
      background-color: #fff;
      :hover {
        background: #ddd;
      }
    }
    margin-left: 1rem;
    border: none;
    border-radius: 5px;
    padding: 7px 30px;
    font-size: 14px;
    font-weight: 700;
    cursor: pointer;
    :hover {
      background: #372f78;
    }
  }
`;

const Box = styled.div`
  width: ${(props) => props.width || 100}%;
  min-height: 400px;
  height: 100%;
  background-color: #fff;
  filter: drop-shadow(0px 2px 4px rgba(0, 0, 0, 0.05));
  margin-bottom: 33px;
  border-radius: 8px;
`;
