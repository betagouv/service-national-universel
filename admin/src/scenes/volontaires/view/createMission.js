import { Field, Formik } from "formik";
import React, { useEffect, useState, useRef } from "react";
import { toastr } from "react-redux-toastr";
import { useHistory } from "react-router-dom";
import Select, { components } from "react-select";
import { Col, Input, Row } from "reactstrap";
import styled from "styled-components";
import plausibleEvent from "../../../services/pausible";

import CrossSVG from "../../../assets/cross.svg";
import PlusSVG from "../../../assets/plus.svg";
import AddressInput from "../../../components/addressInputV2";
import LoadingButton from "../../../components/buttons/LoadingButton";
import ErrorMessage, { requiredMessage } from "../../../components/errorMessage";
import MultiSelect from "../../../components/Multiselect";
import api from "../../../services/api";
import {
  dateForDatePicker,
  MISSION_DOMAINS,
  MISSION_PERIOD_DURING_HOLIDAYS,
  MISSION_PERIOD_DURING_SCHOOL,
  PERIOD,
  ROLES,
  SENDINBLUE_TEMPLATES,
  translate,
  translateApplication,
} from "../../../utils";

export default function CreateMission({ young, onSend }) {
  const history = useHistory();
  const [structures, setStructures] = useState();
  const [structure, setStructure] = useState();
  const [referents, setReferents] = useState([]);
  const [createTutorVisible, setCreateTutorVisible] = useState(false);
  const refTutor = useRef();

  useEffect(() => {
    (async () => {
      const { data, ok } = await api.get("/structure");
      if (ok) {
        const res = data.map((s) => ({ label: s.name, value: s.name, _id: s._id, detail: s.department + " - " + s.city + " - " + s.zip }));
        if (data) setStructures(res);
      } else {
        setStructures(null);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      if (!structure) return;
      const body = { query: { bool: { must: { match_all: {} }, filter: [{ term: { "structureId.keyword": structure._id } }] } } };
      const { responses } = await api.esQuery("referent", body);
      if (responses.length) {
        if (responses) setReferents(responses[0]?.hits?.hits.map((e) => ({ _id: e._id, ...e._source })));
      }
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
      missionDuration: mission.duration,
      structureId: mission.structureId,
      tutorId: mission.tutorId,
      tutorName: mission.tutorName,
    };
    const { ok, code, data } = await api.post(`/application`, application);
    if (!ok) return toastr.error("Oups, une erreur est survenue lors de la candidature", code);
    toastr.success("Candidature ajoutée !", code);
    return data;
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
        location: {},
        department: "",
        region: "",
        structureLegalStatus: "PUBLIC",
        applicationStatus: "DONE",
        mainDomain: "",
        domains: [],
        period: [],
        subPeriod: [],
      }}
      onSubmit={async (values) => {
        plausibleEvent("Volontaires/profil/phase2 CTA - Créer mission personnalisée");
        values.placesLeft = values.placesTotal;
        if (values.duration) values.duration = values.duration.toString();
        if (!values.location) values.location = {};
        try {
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
          const application = await handleProposal(responseMission.data, values.applicationStatus);
          toastr.success("Mission enregistrée");
          onSend();
          history.push(`/volontaire/${young._id}/phase2/application/${application._id}/contrat`);
        } catch (e) {
          console.log("ERRROR", e);
          return toastr.error("Une erreur s'est produite lors de l'enregistrement de cette mission", e?.error?.message);
        }
      }}>
      {({ values, handleChange, handleSubmit, errors, touched, isSubmitting, validateField }) => (
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
                      Privilégiez une phrase précisant l&apos;action du volontaire.
                      <br />
                      Exemple: &quot;Je fais les courses de produits pour mes voisins les plus fragiles&quot;
                    </p>
                    <Field validate={(v) => !v && requiredMessage} value={values.name} onChange={handleChange} name="name" placeholder="Nom de votre mission" />
                    <ErrorMessage errors={errors} touched={touched} name="name" />
                  </FormGroup>
                  <FormGroup>
                    <label>STRUCTURE RATTACHÉE</label>
                    {structures ? (
                      <>
                        <AutocompleteSelectStructure
                          refTutor={refTutor}
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
                    <div className="flex items-center gap-2 mt-2">
                      <div className="text-gray-500">Vous ne trouvez pas votre structure ?</div>
                      <button
                        className=" text-gray-600  hover:scale-105 hover:underline"
                        onClick={() => history.push(`/structure/create?redirect=/volontaire/${young._id.toString()}/phase2`)}>
                        Créer une structure
                      </button>
                    </div>
                  </FormGroup>
                  <FormGroup>
                    <label>
                      <span>*</span>DOMAINE D&apos;ACTION PRINCIPAL
                    </label>
                    <Field component="select" value={values.mainDomain} onChange={handleChange} name="mainDomain" validate={(v) => !v && requiredMessage}>
                      <option value="" label="Sélectionnez un domaine principal">
                        Sélectionnez un domaine principal
                      </option>
                      {Object.keys(MISSION_DOMAINS).map((el) => (
                        <option key={el} value={el}>
                          {translate(el)}
                        </option>
                      ))}
                    </Field>
                    <ErrorMessage errors={errors} touched={touched} name="mainDomain" />
                  </FormGroup>
                  <FormGroup>
                    <label>DOMAINE(S) D&apos;ACTION SECONDAIRE(S)</label>
                    <MultiSelect
                      value={values.domains || []}
                      valueToExclude={values.mainDomain}
                      onChange={handleChange}
                      name="domains"
                      options={Object.keys(MISSION_DOMAINS).concat(values.domains.filter((e) => !Object.keys(MISSION_DOMAINS).includes(e)))}
                      placeholder="Sélectionnez un ou plusieurs domaines"
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
                    <label>Durée de la mission</label>
                    <p style={{ color: "#a0aec1", fontSize: 12 }}>Saisissez un nombre d&apos;heures prévisionnelles pour la réalisation de la mission</p>
                    <Row>
                      <Col>
                        <Input type="number" name="duration" onChange={handleChange} value={values.duration} />
                      </Col>
                      <Col style={{ display: "flex", alignItems: "center" }}>heure(s)</Col>
                    </Row>
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
                      <label>Période de réalisation de la mission :</label>
                      <MultiSelect
                        value={values.period}
                        valueRenderer={(values) => {
                          const valuesFiltered = values.map((el) => el.label);
                          return valuesFiltered.length ? valuesFiltered.join(", ") : "Sélectionnez une ou plusieurs périodes";
                        }}
                        onChange={handleChange}
                        name="period"
                        options={Object.keys(PERIOD)}
                      />
                      {values.period?.length ? (
                        <>
                          <label style={{ marginTop: "10px" }}>Précisez :</label>
                          <MultiSelect
                            value={values.subPeriod}
                            valueRenderer={(values) => {
                              const valuesFiltered = values.map((el) => el.label);
                              return valuesFiltered.length ? valuesFiltered.join(", ") : "Sélectionnez une ou plusieurs périodes";
                            }}
                            onChange={handleChange}
                            name="subPeriod"
                            options={(() => {
                              let options = [];
                              if (values.period?.indexOf(PERIOD.DURING_HOLIDAYS) !== -1) options.push(...Object.keys(MISSION_PERIOD_DURING_HOLIDAYS));
                              if (values.period?.indexOf(PERIOD.DURING_SCHOOL) !== -1) options.push(...Object.keys(MISSION_PERIOD_DURING_SCHOOL));
                              return options;
                            })()}
                          />
                        </>
                      ) : null}
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
                {structure ? (
                  <Wrapper>
                    <Legend>Tuteur de la mission</Legend>
                    <FormGroup>
                      <label>
                        <span>*</span>TUTEUR
                      </label>
                      <p style={{ color: "#a0aec1", fontSize: 12 }}>
                        Sélectionner le tuteur qui va s&apos;occuper de la mission. <br />
                        {/* todo invite tuteur */}
                        {structure && (
                          <span>
                            Vous pouvez également{" "}
                            <u>
                              <a
                                style={{ textDecoration: "underline", cursor: "pointer" }}
                                onClick={() => {
                                  setCreateTutorVisible(true);
                                }}>
                                ajouter un nouveau tuteur
                              </a>
                            </u>{" "}
                            à votre équipe.
                          </span>
                        )}
                      </p>
                      {!createTutorVisible ? (
                        <>
                          <div className="mt-3">
                            <AutocompleteSelectTutor
                              refTutor={refTutor}
                              values={values}
                              handleChange={handleChange}
                              placeholder="Sélectionner un tuteur"
                              options={
                                referents
                                  ? referents.map((referent) => {
                                      return { value: referent._id, label: `${referent.firstName} ${referent.lastName}` };
                                    })
                                  : []
                              }
                            />
                          </div>
                          <ErrorMessage errors={errors} touched={touched} name="tutorId" />
                        </>
                      ) : null}
                    </FormGroup>

                    <ToggleBloc
                      visible={createTutorVisible}
                      onClick={() => {
                        setCreateTutorVisible(!createTutorVisible);
                      }}
                      title="Ajouter un nouveau tuteur">
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
                ) : null}
                <Wrapper>
                  <Legend>Statut de la candidature</Legend>
                  <FormGroup>
                    <Field validate={(v) => !v && requiredMessage} component="select" name="applicationStatus" value={values.applicationStatus} onChange={handleChange}>
                      <option value="DONE">{translateApplication("DONE")}</option>
                      <option value="VALIDATED">{translateApplication("VALIDATED")}</option>
                      <option value="IN_PROGRESS">{translateApplication("IN_PROGRESS")}</option>
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
                    keys={{ city: "city", zip: "zip", address: "address", location: "location", department: "department", region: "region", addressVerified: "addressVerified" }}
                    values={values}
                    handleChange={handleChange}
                    errors={errors}
                    touched={touched}
                    validateField={validateField}
                    required={true}
                  />
                </Wrapper>
              </Col>
            </Row>
            {Object.keys(errors).length ? <h3 className="alert">Vous ne pouvez pas proposer cette mission car tous les champs ne sont pas correctement renseignés.</h3> : null}
            <Header style={{ justifyContent: "flex-end" }}>
              <ButtonContainer>
                <LoadingButton loading={isSubmitting} onClick={handleSubmit}>
                  Enregistrer et rattacher la mission
                </LoadingButton>
              </ButtonContainer>
            </Header>
          </Wrapper>
        </div>
      )}
    </Formik>
  );
}

const AutocompleteSelectStructure = ({ values, handleChange, placeholder, options, onSelect, refTutor }) => {
  const formatOptionLabel = ({ label, detail }) => (
    <div className="flex flex-col">
      <div>{label}</div>
      <div className="text-gray-600 text-xs">{detail}</div>
    </div>
  );

  // Change la maniere de rendu de l'option une fois selectionne
  const SingleValue = (props) => <components.SingleValue {...props}>{props.data.label}</components.SingleValue>;

  return (
    <>
      <Field hidden name="structureName" value={values.structureName} validate={(v) => !v && requiredMessage} />
      <Field hidden name="structureId" value={values.structureId} validate={(v) => !v && requiredMessage} />
      <Select
        options={options}
        formatOptionLabel={formatOptionLabel}
        components={{ SingleValue }}
        placeholder={placeholder}
        noOptionsMessage={() => "Aucune structure ne correspond à cette recherche."}
        onChange={(e) => {
          handleChange({ target: { value: e.value, name: "structureName" } });
          handleChange({ target: { value: e._id, name: "structureId" } });
          handleChange({ target: { value: undefined, name: "tutorId" } });
          if (values.tutorId) refTutor.current.onChange("");
          onSelect(e);
        }}
      />
    </>
  );
};

const AutocompleteSelectTutor = ({ values, handleChange, placeholder, options, refTutor }) => {
  return (
    <>
      <Field hidden validate={(v) => !v && requiredMessage} name="tutorId" value={values.tutorId} />
      <Select
        ref={refTutor}
        options={options}
        placeholder={placeholder}
        noOptionsMessage={() => "Aucun tuteur trouvé."}
        onChange={(e) => {
          handleChange({ target: { value: e.value, name: "tutorId" } });
        }}
      />
    </>
  );
};

const ToggleBloc = ({ children, title, onClick, visible }) => {
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
