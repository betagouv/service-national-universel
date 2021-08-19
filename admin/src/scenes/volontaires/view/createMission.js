import React, { useEffect, useState } from "react";
import { Col, Row, Input } from "reactstrap";
import styled from "styled-components";
import { toastr } from "react-redux-toastr";
import { Formik, Field } from "formik";
import Select from "react-select";

import MultiSelect from "../../../components/Multiselect";
import AddressInput from "../../../components/addressInput";
import ErrorMessage, { requiredMessage } from "../../../components/errorMessage";
import { translate, MISSION_PERIOD_DURING_HOLIDAYS, MISSION_PERIOD_DURING_SCHOOL, MISSION_DOMAINS, dateForDatePicker, ROLES, SENDINBLUE_TEMPLATES } from "../../../utils";
import api from "../../../services/api";
import PlusSVG from "../../../assets/plus.svg";
import CrossSVG from "../../../assets/cross.svg";

export default ({ young, onSend }) => {
  const [structures, setStructures] = useState();
  const [structure, setStructure] = useState();
  const [referents, setReferents] = useState([]);
  const [createStructureVisible, setCreateStructureVisible] = useState(false);
  const [createTutorVisible, setCreateTutorVisible] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await api.get("/structure");
      const res = data.map((s) => ({ label: s.name, value: s.name, _id: s._id }));
      if (data) setStructures(res);
    })();
  }, []);

  useEffect(() => {
    (async () => {
      if (!structure) return;
      const queries = [{ index: "referent", type: "_doc" }, { query: { bool: { must: { match_all: {} }, filter: [{ term: { "structureId.keyword": structure._id } }] } } }];
      const { responses } = await api.esQuery("referent", queries);
      if (responses) setReferents(responses[0]?.hits?.hits.map((e) => ({ _id: e._id, ...e._source })));
    })();
  }, [structure]);

  const handleProposal = async (mission, status) => {
    const application = {
      status,
      youngId: young._id,
      youngFirstName: young.firstName,
      youngLastName: young.lastName,
      youngEmail: young.email,
      youngBirthdateAt: young.birthdateAt,
      youngCity: young.city,
      youngDepartment: young.department,
      youngCohort: young.cohort,
      missionId: mission._id,
      missionName: mission.name,
      missionDepartment: mission.department,
      missionRegion: mission.region,
      structureId: mission.structureId,
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
        status: "VALIDATED",
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
        structureLegalStatus: "PUBLIC",
        applicationStatus: "DONE",
      }}
      onSubmit={async (values) => {
        values.placesLeft = values.placesTotal;
        try {
          // create the strucutre if it is a new one
          if (createStructureVisible) {
            const responseStructure = await api.post("/structure", {
              status: "VALIDATED",
              name: values.structureName,
              legalStatus: values.structureLegalStatus,
              description: values.structureDescription,
              address: values.address,
              city: values.city,
              zip: values.zip,
              department: values.department,
              region: values.region,
              location: values.location,
            });
            if (!responseStructure.ok) return toastr.error("Une erreur s'est produite lors de la creation de la strucutre", translate(responseStructure.code));
            values.structureId = responseStructure.data._id;
          }
          // create the responsible if it is a new one
          if (createTutorVisible) {
            const responseResponsible = await api.post(`/referent/signup_invite/${SENDINBLUE_TEMPLATES.invitationReferent[ROLES.RESPONSIBLE]}`, {
              role: ROLES.RESPONSIBLE,
              structureId: values.structureId,
              structureName: values.structureName,
              firstName: values.tutorFirstName,
              lastName: values.tutorLastName,
              email: values.tutorEmail,
            });
            if (!responseResponsible.ok) return toastr.error("Une erreur s'est produite lors de la creation du responsable", translate(responseResponsible.code));
            values.tutorId = responseResponsible.data._id;
            values.tutorName = `${responseResponsible.data.firstName} ${responseResponsible.data.lastName}`;
          }

          // if the user selected the responsible from the list, we do not have his name,
          // we get it from the db
          if (values.tutorId && !values.tutorName) {
            const ref = await api.get(`/referent/${values.tutorId}`);
            if (ref.ok) values.tutorName = `${ref.data.firstName} ${ref.data.lastName}`;
          }

          //then, we create the mission with all the information...
          const responseMission = await api.post("/mission", values);
          if (!responseMission.ok) return toastr.error("Une erreur s'est produite lors de l'enregistrement de cette mission", translate(responseMission.code));

          //...finally, we create the application
          await handleProposal(responseMission.data, values.applicationStatus);
          toastr.success("Mission enregistrée");
          onSend();
        } catch (e) {
          console.log("ERRROR", e);
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
                      Exemple: "Je fais les courses de produits pour mes voisins les plus fragiles"
                    </p>
                    <Field validate={(v) => !v && requiredMessage} value={values.name} onChange={handleChange} name="name" placeholder="Nom de votre mission" />
                    <ErrorMessage errors={errors} touched={touched} name="name" />
                  </FormGroup>
                  <FormGroup>
                    <label>STRUCTURE RATTACHÉE</label>
                    {structures && !createStructureVisible ? (
                      <>
                        <AutocompleteSelectStructure
                          values={values}
                          handleChange={handleChange}
                          placeholder="Choisir une structure"
                          options={structures}
                          onSelect={(e) => {
                            setStructure(e);
                          }}
                        />
                        <ErrorMessage errors={errors} touched={touched} name="structureId" />
                      </>
                    ) : null}
                    <ToggleBloc
                      visible={createStructureVisible}
                      onClick={() => {
                        setCreateStructureVisible(!createStructureVisible);
                        setCreateTutorVisible(!createStructureVisible);
                        setStructure(null);
                      }}
                      title="Créer une nouvelle structure"
                    >
                      <FormGroup>
                        <Field
                          validate={(v) => !v && requiredMessage}
                          value={values.structureName}
                          onChange={handleChange}
                          name="structureName"
                          placeholder="Nom de la structure"
                        />
                        <ErrorMessage errors={errors} touched={touched} name="structureName" />
                      </FormGroup>
                      <FormGroup>
                        <Field validate={(v) => !v && requiredMessage} component="select" name="structureLegalStatus" value={values.structureLegalStatus} onChange={handleChange}>
                          <option key="null"></option>
                          <option key="PUBLIC" value="PUBLIC">
                            {translate("PUBLIC")}
                          </option>
                          <option key="PRIVATE" value="PRIVATE">
                            {translate("PRIVATE")}
                          </option>
                          <option key="ASSOCIATION" value="ASSOCIATION">
                            {translate("ASSOCIATION")}
                          </option>
                          <option key="OTHER" value="OTHER">
                            {translate("OTHER")}
                          </option>
                        </Field>
                        <ErrorMessage errors={errors} touched={touched} name="structureLegalStatus" />
                      </FormGroup>
                      <FormGroup>
                        <Field
                          validate={(v) => !v && requiredMessage}
                          name="structureDescription"
                          component="textarea"
                          rows={4}
                          value={values.structureDescription}
                          onChange={handleChange}
                          placeholder="Présentez en quelques mots la structure"
                        />
                        <ErrorMessage errors={errors} touched={touched} name="structureDescription" />
                      </FormGroup>
                    </ToggleBloc>
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
                  {structure ? (
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
                                  setCreateTutorVisible(true);
                                }}
                              >
                                ajouter un nouveau tuteur
                              </a>
                            </u>{" "}
                            à votre équipe.
                          </span>
                        )}
                      </p>
                      <Field validate={(v) => !v && requiredMessage} component="select" name="tutorId" value={values.tutorId} onChange={handleChange}>
                        <option value="">Sélectionner un tuteur</option>
                        {referents &&
                          referents.map((referent) => {
                            return <option key={referent._id} value={referent._id}>{`${referent.firstName} ${referent.lastName}`}</option>;
                          })}
                      </Field>
                      <ErrorMessage errors={errors} touched={touched} name="tutorId" />
                    </FormGroup>
                  ) : null}
                  <ToggleBloc
                    visible={createTutorVisible || createStructureVisible}
                    onClick={() => {
                      setCreateTutorVisible(!createTutorVisible);
                    }}
                    title="Ajouter un nouveau tuteur"
                  >
                    <FormGroup>
                      <Field validate={(v) => !v && requiredMessage} value={values.tutorFirstName} onChange={handleChange} name="tutorFirstName" placeholder="Prénom" />
                      <ErrorMessage errors={errors} touched={touched} name="tutorFirstName" />
                    </FormGroup>
                    <FormGroup>
                      <Field validate={(v) => !v && requiredMessage} value={values.tutorLastName} onChange={handleChange} name="tutorLastName" placeholder="Nom" />
                      <ErrorMessage errors={errors} touched={touched} name="tutorLastName" />
                    </FormGroup>
                    <FormGroup>
                      <Field validate={(v) => !v && requiredMessage} value={values.tutorEmail} onChange={handleChange} name="tutorEmail" placeholder="E-mail" />
                      <ErrorMessage errors={errors} touched={touched} name="tutorEmail" />
                    </FormGroup>
                  </ToggleBloc>
                </Wrapper>
                <Wrapper>
                  <Legend>Statut de la mission</Legend>
                  <FormGroup>
                    <Field validate={(v) => !v && requiredMessage} component="select" name="applicationStatus" value={values.applicationStatus} onChange={handleChange}>
                      <option value="DONE">{translate("DONE")}</option>
                      <option value="VALIDATED">{translate("VALIDATED")}</option>
                      <option value="IN_PROGRESS">{translate("IN_PROGRESS")}</option>
                    </Field>
                    <ErrorMessage errors={errors} touched={touched} name="applicationStatus" />
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
                <button onClick={handleSubmit}>Enregistrer et proposer la mission</button>
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

const ToggleBloc = ({ children, title, borderBottom, borderRight, borderLeft, disabled, onClick, visible }) => {
  return (
    <Wrapper style={{ marginTop: "1rem", padding: ".5rem", border: "1px solid #cccccc", borderRadius: ".5rem" }}>
      <div onClick={onClick} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }}>
        <div style={{ color: "#808080" }}>{title}</div>
        <div>
          <Icon src={visible ? CrossSVG : PlusSVG} />
        </div>
      </div>
      {visible ? <div style={{ marginTop: "1rem" }}>{children} </div> : null}
    </Wrapper>
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

const Icon = styled.img`
  height: 14px;
  font-size: 14px;
  cursor: pointer;
`;
