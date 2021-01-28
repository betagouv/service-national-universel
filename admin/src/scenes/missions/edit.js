import React, { useEffect, useState } from "react";
import { Col, Row, Input } from "reactstrap";
import styled from "styled-components";
import { toastr } from "react-redux-toastr";
import { useDispatch, useSelector } from "react-redux";
import { Formik, Field } from "formik";
import { Link, Redirect } from "react-router-dom";

import MultiSelect from "../../components/Multiselect";
import AddressInput from "../../components/addressInput";

import { domains, translate, departmentList } from "../../utils";
import api from "../../services/api";

export default (props) => {
  const [defaultValue, setDefaultValue] = useState();
  const [redirect, setRedirect] = useState(false);

  const structure = useSelector((state) => state.Auth.structure) || {}; // empty object if no stucture

  useEffect(() => {
    (async () => {
      const id = props.match && props.match.params && props.match.params.id;
      if (!id) return setDefaultValue(null);
      const { data } = await api.get(`/mission/${id}`);
      setDefaultValue(data);
    })();
  }, []);

  if (defaultValue === undefined) return <div>Chargement...</div>;

  if (redirect) return <Redirect to="/mission" />;

  return (
    <Formik
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
            <Title>{values._id ? values.name : "Création d'une mission"}</Title>
            <ButtonContainer>
              <button
                className="white-button"
                disabled={!isValid}
                onClick={() => {
                  console.log("SAVE");
                  handleChange({ target: { value: "DRAFT", name: "status" } });
                  handleSubmit();
                }}
              >
                Enregistrer
              </button>
              <button
                disabled={!isValid}
                onClick={() => {
                  handleChange({ target: { value: "WAITING_VALIDATION", name: "status" } });
                  handleSubmit();
                }}
              >
                Enregistrer et proposer la mission
              </button>
            </ButtonContainer>
          </Header>
          <Box>
            <Row style={{ borderBottom: "2px solid #f4f5f7" }}>
              <Col md={6} style={{ borderRight: "2px solid #f4f5f7" }}>
                <Wrapper>
                  <Legend>Détails de la mission</Legend>
                  <FormGroup>
                    <label>
                      <span>*</span>NOM DE LA MISSION
                    </label>
                    <p style={{ color: "#a0aec1", fontSize: 12 }}>
                      Privilégiez une phrase précisant l'action du volontaire.
                      <br />
                      Exemple: "Je fais les courses de produits pour mes voisons les plus fragiles
                    </p>
                    <Field
                      // validate={(v) => !v.length}
                      value={values.name}
                      onChange={handleChange}
                      name="name"
                      placeholder="Nom de votre mission"
                    />
                  </FormGroup>
                  <FormGroup>
                    <label>STRUCTURE RATTACHÉE</label>
                    <Input disabled value={values.structureName} placeholder="Structure de la mission" />
                  </FormGroup>
                  <FormGroup>
                    <label>DOMAINES D'ACTION</label>
                    <MultiSelect value={values.domains} onChange={handleChange} name="domains" options={domains} placeholder="Sélectionnez un ou plusieurs domains" />
                  </FormGroup>
                  <FormGroup>
                    <label>
                      <span>*</span>TYPE DE MISSION
                    </label>
                    <Field component="select" name="format" value={values.format} onChange={handleChange}>
                      <option key="CONTINUOUS" value="CONTINUOUS">
                        {translate("CONTINUOUS")}
                      </option>
                      <option key="DISCONTINUOUS" value="DISCONTINUOUS">
                        {translate("DISCONTINUOUS")}
                      </option>
                    </Field>
                  </FormGroup>
                  <FormGroup>
                    <label>
                      <span>*</span>OBJECTIFS DE LA MISSION
                    </label>
                    <Field
                      // validate={(v) => !v.length}
                      name="description"
                      component="textarea"
                      rows={2}
                      value={values.description}
                      onChange={handleChange}
                      placeholder="Décrivez en quelques mots votre mission"
                    />
                  </FormGroup>
                  <FormGroup>
                    <label>
                      <span>*</span>ACTIONS CONCRÈTES CONFIÉES AU(X) VOLONTAIRE(S)
                    </label>
                    <Field
                      // validate={(v) => !v.length}
                      name="actions"
                      component="textarea"
                      rows={2}
                      value={values.actions}
                      onChange={handleChange}
                      placeholder="Listez briévement les actions confiées au(x) volontaire(s)"
                    />
                  </FormGroup>
                  <FormGroup>
                    <label>CONTRAINTES SPÉCIFIQUES POUR CETTE MISSION ?</label>
                    <p style={{ color: "#a0aec1", fontSize: 12 }}>
                      Précisez les informations complémentaires à préciser au volontaire.
                      <br />
                      Exemple : Conditons physiques / Période de formation / Mission en soirée / etc
                    </p>
                    <Field
                      // validate={(v) => !v.length}
                      name="contraintes"
                      component="textarea"
                      rows={2}
                      value={values.contraintes}
                      onChange={handleChange}
                      placeholder="Spécifiez les contraintes liées à la mission"
                    />
                  </FormGroup>
                </Wrapper>
              </Col>
              <Col md={6}>
                <Row style={{ borderBottom: "2px solid #f4f5f7" }}>
                  <Wrapper>
                    <Legend>Date et places disponibles</Legend>
                    <FormGroup>
                      <label>
                        <span>*</span>DATES DE LA MISSION
                      </label>
                      <Row>
                        <Col>
                          <Input type="date" name="startAt" value={values.startAt} onChange={handleChange} placeholder="Date de début" />
                        </Col>
                        <Col>
                          <Input type="date" name="endAt" value={values.endAt} onChange={handleChange} placeholder="Date de fin" />
                        </Col>
                      </Row>
                    </FormGroup>
                    <FormGroup>
                      <label>FRÉQUENCE ESTIMÉE DE LA MISSION</label>
                      <p style={{ color: "#a0aec1", fontSize: 12 }}>Par exemple, tous les mardis soirs, le samedi, tous les mercredis après-midi pendant un trimestre, etc.</p>
                      <Field
                        // validate={(v) => !v.length}
                        name="frequence"
                        component="textarea"
                        rows={2}
                        value={values.frequence}
                        onChange={handleChange}
                        placeholder="Fréquence estimée de la mission"
                      />
                    </FormGroup>
                    <FormGroup>
                      <label>PÉRIODES POSSIBLES POUR RÉALISER LA MISSION</label>
                      {/* TODO specs les periodes ? */}
                      <input placeholder="Sélectionner les périodes" />
                    </FormGroup>
                    <FormGroup>
                      <label>NOMBRE DE VOLONTAIRES RECHERCHÉS POUR CETTE MISSION</label>
                      <p style={{ color: "#a0aec1", fontSize: 12 }}>
                        Précisez ce nombre en fonction de vos contraintes logistiques et votre capacité à accompagner les volontaires.
                      </p>
                      <Input name="placesTotal" onChange={handleChange} value={values.placesTotal} type="number" min={1} max={999} />
                    </FormGroup>
                  </Wrapper>
                </Row>
                <Wrapper>
                  <Legend>Tuteur de la mission</Legend>
                  <FormGroup>
                    <label>
                      <span>*</span>TUTEUR
                    </label>
                    <p style={{ color: "#a0aec1", fontSize: 12 }}>
                      Sélectionner le tuteur qui va s'occuper de la mission. <br />
                      Vous pouvez également{" "}
                      <u>
                        <Link to="/team/invite">ajouter un nouveau tuteur</Link>
                      </u>{" "}
                      à votre équipe.
                    </p>
                    <Field component="select" name="tuteur_id" value={values.tuteur_id} onChange={handleChange}>
                      <option value="">Sélectionner un tuteur</option>
                      {/* todo map sur les tuteurs de la structure */}
                      <option value="CONTINUOUS">{translate("CONTINUOUS")}</option>
                      <option value="DISCONTINUOUS">{translate("DISCONTINUOUS")}</option>
                    </Field>
                  </FormGroup>
                </Wrapper>
              </Col>
            </Row>
            <Row>
              <Col md={12}>
                <Wrapper>
                  <Legend>Lieu où se déroule la mission</Legend>
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

            {/* <Legend>Détail de la mission</Legend>
            <FormGroup>
              <label>
                <span>*</span>EN QUOI LA MISSION PROPOSÉE PERMETTRA-T-ELLE AU VOLONTAIRE D’AGIR EN FAVEUR DE L’INTÉRÊT GÉNÉRAL ?
              </label>
              <p style={{ color: "#a0aec1", fontSize: 12 }}>
                Les réponses à cette question ne seront pas publiées. Elles permettront aux services référents de valider les missions.
              </p>
              <Field
                // validate={(v) => !v.length}
                name="justifications"
                component="textarea"
                rows={2}
                value={values.justifications}
                onChange={handleChange}
                placeholder="Décrivez votre mission, en quelques mots"
              />
            </FormGroup> */}
          </Box>
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
  align-items: flex-start;
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
