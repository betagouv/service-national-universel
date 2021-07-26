import React, { useEffect, useState } from "react";
import { Col, Row, Input } from "reactstrap";
import styled from "styled-components";
import { toastr } from "react-redux-toastr";
import { useSelector } from "react-redux";
import { Formik, Field } from "formik";
import { useHistory } from "react-router-dom";
import ReactSelect from "react-select";

import MultiSelect from "../../components/Multiselect";
import AddressInput from "../../components/addressInput";
import ErrorMessage, { requiredMessage } from "../../components/errorMessage";
import { translate, MISSION_PERIOD_DURING_HOLIDAYS, MISSION_PERIOD_DURING_SCHOOL, MISSION_DOMAINS, PERIOD, dateForDatePicker, putLocation, ROLES } from "../../utils";
import api from "../../services/api";
import Invite from "../structure/components/invite";
import Loader from "../../components/Loader";
import { Box, BoxTitle } from "../../components/box";
import LoadingButton from "../../components/buttons/LoadingButton";

export default (props) => {
  const [defaultValue, setDefaultValue] = useState(null);
  const [structure, setStructure] = useState();
  const [structures, setStructures] = useState();
  const [referents, setReferents] = useState([]);
  const [showTutor, setShowTutor] = useState();
  const [loadings, setLoadings] = useState({
    saveButton: false,
    submitButton: false,
    changeStructureButton: false,
  });
  const history = useHistory();
  const user = useSelector((state) => state.Auth.user);
  const isNew = !props?.match?.params?.id;

  async function initMission() {
    if (isNew) return setDefaultValue(null);
    const id = props.match && props.match.params && props.match.params.id;
    const { data } = await api.get(`/mission/${id}`);
    if (data && data.startAt) data.startAt = dateForDatePicker(data.startAt);
    if (data && data.endAt) data.endAt = dateForDatePicker(data.endAt);
    setDefaultValue(data);
  }
  async function initReferents() {
    if (!structure) return;
    const queries = [{ index: "referent", type: "_doc" }, { query: { bool: { must: { match_all: {} }, filter: [{ term: { "structureId.keyword": structure._id } }] } } }];
    const { responses } = await api.esQuery(queries);
    if (responses) setReferents(responses[0]?.hits?.hits.map((e) => ({ _id: e._id, ...e._source })));
  }

  async function initStructure() {
    let structureId;
    if (props?.match?.params?.structureId) structureId = props.match.params.structureId;
    else if (defaultValue) structureId = defaultValue.structureId;
    else if (user.structureId) structureId = user.structureId;

    if (structureId) {
      const { data, ok } = await api.get(`/structure/${structureId}`);
      if (!ok && isNew) {
        toastr.error("Impossible de trouver la structure pour créer la mission", "Vous devez créer la mission depuis une structure existante", { timeOut: 5000 });
        history.goBack();
      }
      return setStructure(ok ? data : null);
    }
  }

  async function initStructures() {
    const responseStructure = await api.get(`/structure/all`);
    const s = responseStructure.data.map((e) => ({ label: e.name, value: e.name, _id: e._id, structure: e }));
    setStructures(s);
  }

  async function modifyStructure() {
    try {
      setLoadings({
        saveButton: false,
        submitButton: false,
        changeStructureButton: true,
      });
      const { ok, code, data: y } = await api.put(`/mission/${defaultValue._id}/structure/${structure._id}`);
      setLoadings({
        saveButton: false,
        submitButton: false,
        changeStructureButton: false,
      });
      if (!ok)
        return code === "OPERATION_NOT_ALLOWED"
          ? toastr.error(translate(code), "Le tuteur de cette mission est affilié à d'autres missions de la structure.")
          : toastr.error(translate(code), "Une erreur s'est produite lors de la modification de la structure.");
      history.push(`/mission/${defaultValue._id}`);
      toastr.success("Structure modifiée");
    } catch (e) {
      setLoadings({
        saveButton: false,
        submitButton: false,
        changeStructureButton: false,
      });
      return toastr.error("Une erreur s'est produite lors de la modification de la structure", e?.error?.message);
    }
  }

  useEffect(() => {
    initMission();
    initStructures();
  }, []);
  useEffect(() => {
    initStructure();
  }, [defaultValue]);
  useEffect(() => {
    initReferents();
  }, [structure]);

  if ((!defaultValue && !isNew) || !structure) return <Loader />;
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
          startAt: dateForDatePicker(Date.now()),
          endAt: dateForDatePicker(Date.now() + 1000 * 60 * 60 * 24 * 7),
          city: "",
          zip: "",
          address: "",
          location: "",
          department: "",
          region: "",
          period: [],
          domains: [],
          subPeriod: [],
          isMilitaryPreparation: "",
        }
      }
      onSubmit={async (values) => {
        values.status === "DRAFT"
          ? setLoadings({
              saveButton: true,
              submitButton: false,
              changeStructureButton: false,
            })
          : setLoadings({
              saveButton: false,
              submitButton: true,
              changeStructureButton: false,
            });
        //if new mission, init placesLeft to placesTotal
        if (isNew) values.placesLeft = values.placesTotal;
        //if edit mission, add modified delta to placesLeft
        else values.placesLeft += values.placesTotal - defaultValue.placesTotal;

        //get the period given the subperiods
        values.subPeriod.forEach((p) => {
          if (MISSION_PERIOD_DURING_HOLIDAYS[p] && values.period.indexOf(PERIOD.DURING_HOLIDAYS) === -1) values.period.push(PERIOD.DURING_HOLIDAYS);
          if (MISSION_PERIOD_DURING_SCHOOL[p] && values.period.indexOf(PERIOD.DURING_SCHOOL) === -1) values.period.push(PERIOD.DURING_SCHOOL);
        });
        try {
          //if mission doesn't have location, put one from city and zip code
          //or put Paris location
          if (!values.location || !values.location.lat || !values.location.lon) {
            values.location = await putLocation(values.city, values.zip);
          }
          const { ok, code, data: mission } = await api[values._id ? "put" : "post"]("/mission", values);
          setLoadings({
            saveButton: false,
            submitButton: false,
            changeStructureButton: false,
          });
          if (!ok) return toastr.error("Une erreur s'est produite lors de l'enregistrement de cette mission", translate(code));
          history.push(`/mission/${mission._id}`);
          toastr.success("Mission enregistrée");
        } catch (e) {
          setLoading({
            saveButton: false,
            submitButton: false,
            changeStructureButton: false,
          });
          return toastr.error("Une erreur s'est produite lors de l'enregistrement de cette mission", e?.error?.message);
        }
      }}
    >
      {({ values, handleChange, handleSubmit, errors, touched }) => (
        <div>
          <Header>
            <Title>{defaultValue ? values.name : "Création d'une mission"}</Title>
            {!defaultValue ? (
              <LoadingButton
                color={"#fff"}
                textColor={"#767697"}
                loading={loadings.saveButton}
                disabled={loadings.submitButton || loadings.changeStructureButton}
                onClick={() => {
                  handleChange({ target: { value: "DRAFT", name: "status" } });
                  handleSubmit();
                }}
              >
                Enregistrer
              </LoadingButton>
            ) : null}

            <LoadingButton
              loading={loadings.submitButton}
              disabled={loadings.saveButton || loadings.changeStructureButton}
              onClick={() => {
                handleChange({ target: { value: "WAITING_VALIDATION", name: "status" } });
                handleSubmit();
              }}
            >
              {defaultValue ? "Enregistrer les modifications" : "Enregistrer et proposer la mission"}
            </LoadingButton>
          </Header>
          <Wrapper>
            {Object.keys(errors).length ? <h3 className="alert">Vous ne pouvez pas proposer cette mission car tous les champs ne sont pas correctement renseignés.</h3> : null}
            <Box>
              <Row style={{ borderBottom: "2px solid #f4f5f7" }}>
                <Col md={6} style={{ borderRight: "2px solid #f4f5f7" }}>
                  <Wrapper>
                    <BoxTitle>Détails de la mission</BoxTitle>
                    <FormGroup>
                      <label>
                        <span>*</span>NOM DE LA MISSION
                      </label>
                      <p style={{ color: "#a0aec1", fontSize: 12 }}>
                        Privilégiez une phrase précisant l'action du volontaire.
                        <br />
                        Exemple: "Je fais les courses de produits pour mes voisins les plus fragiles"
                      </p>
                      <Field validate={(v) => !v && requiredMessage} value={values.name} onChange={handleChange} name="name" placeholder="Nom de votre mission" />
                      <ErrorMessage errors={errors} touched={touched} name="name" />
                    </FormGroup>
                    <FormGroup>
                      <label>DOMAINES D'ACTION</label>
                      <MultiSelect
                        value={values.domains || []}
                        onChange={handleChange}
                        name="domains"
                        options={Object.keys(MISSION_DOMAINS).concat(values.domains.filter((e) => !MISSION_DOMAINS.hasOwnProperty(e)))}
                        placeholder="Sélectionnez un ou plusieurs domains"
                      />
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
                        rows={4}
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
                        rows={4}
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
                        rows={4}
                        value={values.contraintes || ""}
                        onChange={handleChange}
                        placeholder="Spécifiez les contraintes liées à la mission"
                      />
                    </FormGroup>
                    {structure.isMilitaryPreparation === "true" ? (
                      <FormGroup>
                        <div>
                          <label>PRÉPARATION MILITAIRE</label>
                          <Field component="select" name="isMilitaryPreparation" value={values.isMilitaryPreparation} onChange={handleChange}>
                            <option key="false" value="false">
                              Non
                            </option>
                            <option key="true" value="true">
                              Oui
                            </option>
                          </Field>
                        </div>
                      </FormGroup>
                    ) : null}
                  </Wrapper>
                </Col>
                <Col md={6}>
                  <Row style={{ borderBottom: "2px solid #f4f5f7" }}>
                    <Wrapper style={{ maxWidth: "100%" }}>
                      <BoxTitle>Date et places disponibles</BoxTitle>
                      <FormGroup>
                        <label>
                          <span>*</span>DATES DE LA MISSION
                        </label>
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
                          value={values.subPeriod}
                          onChange={handleChange}
                          name="subPeriod"
                          options={Object.keys(MISSION_PERIOD_DURING_SCHOOL)
                            .concat(Object.keys(MISSION_PERIOD_DURING_HOLIDAYS))
                            .concat(values.subPeriod.filter((e) => !(MISSION_PERIOD_DURING_SCHOOL.hasOwnProperty(e) || MISSION_PERIOD_DURING_HOLIDAYS.hasOwnProperty(e))))}
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
                    <BoxTitle>Tuteur de la mission</BoxTitle>
                    <FormGroup>
                      <label>
                        <span>*</span>TUTEUR
                      </label>
                      <p style={{ color: "#a0aec1", fontSize: 12 }}>
                        Sélectionner le tuteur qui va s'occuper de la mission. <br />
                        {/* todo invite tuteur */}
                        {structure && (
                          <span>
                            Vous pouvez également{" "}
                            <u>
                              <a
                                style={{ textDecoration: "underline", cursor: "pointer" }}
                                onClick={() => {
                                  setShowTutor(true);
                                }}
                              >
                                ajouter un nouveau tuteur
                              </a>
                            </u>{" "}
                            à votre équipe.
                          </span>
                        )}
                      </p>
                      <Field component="select" name="tutorId" value={values.tutorId} onChange={handleChange}>
                        <option value="">Sélectionner un tuteur</option>
                        {referents &&
                          referents.map((referent) => {
                            return <option key={referent._id} value={referent._id}>{`${referent.firstName} ${referent.lastName}`}</option>;
                          })}
                      </Field>
                      {structure && showTutor && <Invite structure={structure} />}
                    </FormGroup>
                  </Wrapper>
                </Col>
              </Row>
              <Row>
                <Col md={12}>
                  <Wrapper>
                    <BoxTitle>Lieu où se déroule la mission</BoxTitle>
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
            </Box>
            {user.role === ROLES.ADMIN && defaultValue ? (
              structures?.length ? (
                <Box>
                  <Row>
                    <Col md={12}>
                      <Wrapper>
                        <BoxTitle>Structure associée</BoxTitle>
                        <Header>
                          <ReactSelect
                            styles={{
                              container: () => ({ flex: 1 }),
                              menu: () => ({
                                borderStyle: "solid",
                                borderWidth: 1,
                                borderRadius: 5,
                                borderColor: "#dedede",
                              }),
                            }}
                            defaultValue={{ label: structure.name, value: structure.name, _id: structure._id }}
                            options={structures}
                            placeholder={"Modifier la structure rattachée"}
                            noOptionsMessage={() => "Aucune structure ne correspond à cette recherche."}
                            onChange={(e) => {
                              setStructure(e.structure);
                            }}
                          />
                          <div style={{ alignSelf: "flex-start" }}>
                            <LoadingButton
                              loading={loadings.changeStructureButton}
                              disabled={loadings.saveButton || loadings.submitButton}
                              onClick={() => {
                                modifyStructure();
                              }}
                            >
                              Modifier la structure
                            </LoadingButton>
                          </div>
                        </Header>
                      </Wrapper>
                    </Col>
                  </Row>
                </Box>
              ) : (
                <Loader />
              )
            ) : null}

            {Object.keys(errors).length ? <h3 className="alert">Vous ne pouvez pas proposer cette mission car tous les champs ne sont pas correctement renseignés.</h3> : null}
            <Header style={{ justifyContent: "flex-end" }}>
              {!defaultValue ? (
                <LoadingButton
                  color={"#fff"}
                  textColor={"#767697"}
                  loading={loadings.saveButton}
                  disabled={loadings.submitButton || loadings.changeStructureButton}
                  onClick={() => {
                    handleChange({ target: { value: "DRAFT", name: "status" } });
                    handleSubmit();
                  }}
                >
                  Enregistrer
                </LoadingButton>
              ) : null}

              <LoadingButton
                loading={loadings.submitButton}
                disabled={loadings.saveButton || loadings.changeStructureButton}
                onClick={() => {
                  handleChange({ target: { value: "WAITING_VALIDATION", name: "status" } });
                  handleSubmit();
                }}
              >
                {defaultValue ? "Enregistrer les modifications" : "Enregistrer et proposer la mission"}
              </LoadingButton>
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
  h3.alert {
    border: 1px solid #fc8181;
    border-radius: 0.25em;
    background-color: #fff5f5;
    color: #c53030;
    font-weight: 400;
    font-size: 12px;
    padding: 1em;
    text-align: center;
  }
`;

const Header = styled.div`
  padding: 0 25px 0;
  display: flex;
  margin-top: 25px;
  align-items: center;
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

const Title = styled.div`
  color: rgb(38, 42, 62);
  font-weight: 700;
  font-size: 24px;
  margin-bottom: 10px;
  flex: 1;
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
