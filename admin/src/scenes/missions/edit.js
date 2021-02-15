import React, { useEffect, useState } from "react";
import { Col, Row, Input } from "reactstrap";
import styled from "styled-components";
import { toastr } from "react-redux-toastr";
import { useSelector } from "react-redux";
import { Formik, Field } from "formik";
import { Redirect } from "react-router-dom";

import MultiSelect from "../../components/Multiselect";
import AddressInput from "../../components/addressInput";
import ErrorMessage, { requiredMessage } from "../../components/errorMessage";
import { ReactiveBase, ReactiveList, SingleList, MultiDropdownList, MultiList, DataSearch } from "@appbaseio/reactivesearch";
import { apiURL } from "../../config";
import { domains, translate, MISSION_PERIOD_DURING_HOLIDAYS, MISSION_PERIOD_DURING_SCHOOL } from "../../utils";
import api from "../../services/api";

export default ({ isNew, ...props }) => {
  const [defaultValue, setDefaultValue] = useState(null);
  const [redirect, setRedirect] = useState(false);
  const [structure, setStructure] = useState();

  const user = useSelector((state) => state.Auth.user);
  const canSelectStructure = user.role === "admin" || user.role === "referent";

  useEffect(() => {
    (async () => {
      if (isNew) return;
      const id = props.match && props.match.params && props.match.params.id;
      const { data } = await api.get(`/mission/${id}`);
      setDefaultValue(data);
    })();
    (async () => {
      if (!user.structureId) return setStructure({});
      const { data, ok } = await api.get(`/structure/${user.structureId}`);
      if (ok) return setStructure(data);
      console.error("Structure introuvable");
      setStructure({});
    })();
  }, []);

  const handleSave = async (values) => {
    if (!values._id) {
      values.placesLeft = values.placesTotal;
      const { ok, code, data: mission } = await api.post("/mission", values);
      if (!ok) return toastr.error("Une erreur s'est produite lors de l'enregistrement de cette mission", translate(code));
      if (ok) toastr.success("Mission enregistrée");
    } else {
      const { ok, code, data: mission } = await api.put("/mission", values);
      if (!ok) return toastr.error("Une erreur s'est produite lors de l'enregistrement de cette mission", translate(code));
      if (ok) toastr.success("Mission enregistrée");
    }
  };

  if ((!defaultValue && !isNew) || structure === undefined) return <div>Chargement...</div>;
  if (redirect) return <Redirect to="/mission" />;

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
        <div>
          <Header>
            <Title>{defaultValue ? values.name : "Création d'une mission"}</Title>
            {Object.keys(errors).length ? <h3>Vous ne pouvez pas porposer cette mission car tous les champs ne sont pas correctement renseignés.</h3> : null}
            <ButtonContainer>
              {!defaultValue ? (
                <button
                  className="white-button"
                  disabled={!isValid}
                  onClick={() => {
                    console.log("SAVE");
                    handleChange({ target: { value: "DRAFT", name: "status" } });
                    handleSave(values);
                  }}
                >
                  Enregistrer
                </button>
              ) : null}
              <button
                disabled={!isValid}
                onClick={() => {
                  handleChange({ target: { value: "WAITING_VALIDATION", name: "status" } });
                  handleSubmit();
                }}
              >
                {defaultValue ? "Enregistrer les modifications" : "Enregistrer et proposer la mission"}
              </button>
            </ButtonContainer>
          </Header>
          <Wrapper>
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
                        Exemple: "Je fais les courses de produits pour mes voisons les plus fragiles"
                      </p>
                      <Field validate={(v) => !v && requiredMessage} value={values.name} onChange={handleChange} name="name" placeholder="Nom de votre mission" />
                      <ErrorMessage errors={errors} touched={touched} name="name" />
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
                      <Field validate={(v) => !v && requiredMessage} component="select" name="format" value={values.format} onChange={handleChange}>
                        <option key="CONTINUOUS" value="CONTINUOUS">
                          {translate("CONTINUOUS")}
                        </option>
                        <option key="DISCONTINUOUS" value="DISCONTINUOUS">
                          {translate("DISCONTINUOUS")}
                        </option>
                      </Field>
                      <ErrorMessage errors={errors} touched={touched} name="format" />
                    </FormGroup>
                    <FormGroup>
                      <label>
                        <span>*</span>OBJECTIFS DE LA MISSION
                      </label>
                      <Field
                        validate={(v) => !v && requiredMessage}
                        name="description"
                        component="textarea"
                        rows={2}
                        value={values.description}
                        onChange={handleChange}
                        placeholder="Décrivez en quelques mots votre mission"
                      />
                      <ErrorMessage errors={errors} touched={touched} name="description" />
                    </FormGroup>
                    <FormGroup>
                      <label>
                        <span>*</span>ACTIONS CONCRÈTES CONFIÉES AU(X) VOLONTAIRE(S)
                      </label>
                      <Field
                        validate={(v) => !v && requiredMessage}
                        name="actions"
                        component="textarea"
                        rows={2}
                        value={values.actions}
                        onChange={handleChange}
                        placeholder="Listez briévement les actions confiées au(x) volontaire(s)"
                      />
                      <ErrorMessage errors={errors} touched={touched} name="actions" />
                    </FormGroup>
                    <FormGroup>
                      <label>CONTRAINTES SPÉCIFIQUES POUR CETTE MISSION ?</label>
                      <p style={{ color: "#a0aec1", fontSize: 12 }}>
                        Précisez les informations complémentaires à préciser au volontaire.
                        <br />
                        Exemple : Conditons physiques / Période de formation / Mission en soirée / etc
                      </p>
                      <Field
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
                            <Field
                              validate={(v) => {
                                if (!v) return requiredMessage;
                                const start = new Date(v);
                                if (start.getTime() < Date.now()) return "La date de début ne peut pas être dans le passé.";
                              }}
                              type="date"
                              name="startAt"
                              value={values.startAt}
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
                              value={values.endAt}
                              onChange={handleChange}
                              placeholder="Date de fin"
                            />
                            <ErrorMessage errors={errors} touched={touched} name="endAt" />
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
                        <MultiSelect
                          value={values.period}
                          onChange={handleChange}
                          name="period"
                          options={Object.keys(MISSION_PERIOD_DURING_SCHOOL)
                            .concat(Object.keys(MISSION_PERIOD_DURING_HOLIDAYS))
                            .map((p) => translate(p))}
                          placeholder="Sélectionnez une ou plusieurs périodes"
                        />
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
                        {/* todo invite tuteur */}
                        {/* Vous pouvez également{" "}
                      <u>
                        <Link to="/team/invite">ajouter un nouveau tuteur</Link>
                      </u>{" "}
                      à votre équipe. */}
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
                    <AddressInput
                      keys={{ city: "city", zip: "zip", address: "address", location: "location", department: "department", region: "region" }}
                      values={values}
                      handleChange={handleChange}
                      errors={errors}
                      touched={touched}
                    />
                    <p style={{ color: "#a0aec1", fontSize: 12 }}>Si l'adresse n'est pas reconnue, veuillez saisir le nom de la ville.</p>
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
            <Header style={{ justifyContent: "flex-end" }}>
              {Object.keys(errors).length ? <h3>Vous ne pouvez pas porposer cette mission car tous les champs ne sont pas correctement renseignés.</h3> : null}
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
          </Wrapper>
        </div>
      )}
    </Formik>
  );
};

const Wrapper = styled.div`
  padding: 2rem;
  li {
    list-style-type: none;
  }
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
