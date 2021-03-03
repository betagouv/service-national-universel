import React, { useEffect, useState } from "react";
import { Col, Row, Input } from "reactstrap";
import styled from "styled-components";
import { toastr } from "react-redux-toastr";
import { Formik, Field } from "formik";
import Select from "react-select";

import MultiSelect from "../../../components/Multiselect";
import AddressInput from "../../../components/addressInput";
import ErrorMessage, { requiredMessage } from "../../../components/errorMessage";
import { translate, MISSION_PERIOD_DURING_HOLIDAYS, MISSION_PERIOD_DURING_SCHOOL, MISSION_DOMAINS, APPLICATION_STATUS } from "../../../utils";
import api from "../../../services/api";
import Invite from "../../structure/components/invite";

export default ({ young, onSend }) => {
  const [structures, setStructures] = useState();
  const [structure, setStructure] = useState();
  const [referents, setReferents] = useState([]);
  const [showTutor, setShowTutor] = useState();

  useEffect(() => {
    (async () => {
      const { data } = await api.get("/structure/all");
      const res = data.map((s) => ({ label: s.name, value: s.name, _id: s._id }));
      if (data) setStructures(res);
    })();
  }, []);

  useEffect(() => {
    (async () => {
      if (!structure) return;
      const queries = [{ index: "referent", type: "_doc" }, { query: { bool: { must: { match_all: {} }, filter: [{ term: { "structureId.keyword": structure._id } }] } } }];
      const { responses } = await api.esQuery(queries);
      if (responses) setReferents(responses[0]?.hits?.hits.map((e) => ({ _id: e._id, ...e._source })));
    })();
  }, [structure]);

  function dateForDatePicker(d) {
    return new Date(d).toISOString().split("T")[0];
  }

  const handleProposal = async (mission) => {
    const application = {
      status: APPLICATION_STATUS.DONE,
      youngId: young._id,
      youngFirstName: young.firstName,
      youngLastName: young.lastName,
      youngEmail: young.email,
      youngBirthdateAt: young.birthdateAt,
      youngCity: young.city,
      youngDepartment: young.department,
      missionId: mission._id,
      missionName: mission.name,
      missionDepartment: mission.department,
      missionRegion: mission.region,
      structureId: structure._id,
      tutorId: mission.tutorId,
      tutorName: mission.tutorName,
    };
    const { ok, code } = await api.post(`/application`, application);
    if (!ok) return toastr.error("Oups, une erreur est survenue lors de la candidature", code);
    return toastr.success("Candidature ajoutée !", code);
  };

  return (
    <Formik
      validateOnChange={false}
      validateOnBlur={false}
      initialValues={{
        placesTotal: 1,
        format: "CONTINUOUS",
        structureId: "",
        structureName: "",
        name: "",
        description: "",
        actions: "",
        justifications: "",
        contraintes: "",
        tuteur: "",
        startAt: dateForDatePicker(Date.now()),
        endAt: dateForDatePicker(Date.now() + 1000 * 60 * 60 * 24 * 7),
        city: "",
        zip: "",
        address: "",
        location: "",
        department: "",
        region: "",
      }}
      onSubmit={async (values) => {
        if (!values._id) values.placesLeft = values.placesTotal;
        try {
          const { ok, code, data: mission } = await api.post("/mission", values);
          if (!ok) return toastr.error("Une erreur s'est produite lors de l'enregistrement de cette mission", translate(code));
          await handleProposal(mission);
          toastr.success("Mission enregistrée");
          onSend();
        } catch (e) {
          return toastr.error("Une erreur s'est produite lors de l'enregistrement de cette mission", e?.error?.message);
        }
      }}
    >
      {({ values, handleChange, handleSubmit, errors, touched }) => (
        <div>
          <Wrapper>
            {Object.keys(errors).length ? <h3 className="alert">Vous ne pouvez pas proposer cette mission car tous les champs ne sont pas correctement renseignés.</h3> : null}
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
                    {structures ? (
                      <AutocompleteSelectStructure
                        values={values}
                        handleChange={handleChange}
                        placeholder="Choisir une structure"
                        options={structures}
                        onSelect={(e) => {
                          setStructure(e);
                        }}
                      />
                    ) : null}
                    <ErrorMessage errors={errors} touched={touched} name="structureId" />
                  </FormGroup>
                  <FormGroup>
                    <label>DOMAINES D'ACTION</label>
                    <MultiSelect
                      value={values.domains || []}
                      onChange={handleChange}
                      name="domains"
                      options={Object.keys(MISSION_DOMAINS).concat(values.domains || [])}
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
                </Wrapper>
              </Col>
              <Col md={6}>
                <Row style={{ borderBottom: "2px solid #f4f5f7" }}>
                  <Wrapper style={{ maxWidth: "100%" }}>
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
                        value={values.period}
                        onChange={handleChange}
                        name="period"
                        options={Object.keys(MISSION_PERIOD_DURING_SCHOOL)
                          .concat(Object.keys(MISSION_PERIOD_DURING_HOLIDAYS))
                          .concat(values.period || [])}
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
            {Object.keys(errors).length ? <h3 className="alert">Vous ne pouvez pas proposer cette mission car tous les champs ne sont pas correctement renseignés.</h3> : null}
            <Header style={{ justifyContent: "flex-end" }}>
              <ButtonContainer>
                <button
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

const AutocompleteSelectStructure = ({ values, handleChange, placeholder, options, onSelect }) => {
  return (
    <>
      <Field hidden name="structureName" value={values.structureName} validate={(v) => !v && requiredMessage} />
      <Field hidden name="structureId" value={values.structureId} validate={(v) => !v && requiredMessage} />
      <Select
        options={options}
        placeholder={placeholder}
        noOptionsMessage={() => "Aucune structure ne correspond à cette recherche."}
        onChange={(e) => {
          handleChange({ target: { value: e.value, name: "structureName" } });
          handleChange({ target: { value: e._id, name: "structureId" } });
          onSelect(e);
        }}
      />
    </>
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

const Legend = styled.div`
  color: rgb(38, 42, 62);
  margin-bottom: 20px;
  font-size: 20px;
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
