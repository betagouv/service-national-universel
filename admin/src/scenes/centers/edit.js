import React, { useEffect, useState } from "react";
import { Col, Row } from "reactstrap";
import styled from "styled-components";
import { toastr } from "react-redux-toastr";
import { Formik, Field } from "formik";
import { useHistory } from "react-router-dom";
import { useSelector } from "react-redux";

import { translate, translateSessionStatus, SESSION_STATUS, status } from "../../utils";
import api from "../../services/api";
import Loader from "../../components/Loader";
import { Box, BoxContent, BoxHeadTitle } from "../../components/box";
import Item from "./components/Item";
import Select from "./components/Select";
import LoadingButton from "../../components/buttons/LoadingButton";
import AddressInput from "../../components/addressInputV2";
import MultiSelect from "../../components/Multiselect";
import Error, { requiredMessage } from "../../components/errorMessage";

export default function Edit(props) {
  const [defaultValue, setDefaultValue] = useState(null);
  const [loading, setLoading] = useState(false);
  const history = useHistory();
  const isNew = !props?.match?.params?.id;
  const user = useSelector((state) => state.Auth.user);
  const [sessionShow, setsessionShow] = useState(null)
  const [sessionStatus, setSessionStatus] = useState()

  async function init() {
    if (isNew) return setDefaultValue(null);
    const id = props.match && props.match.params && props.match.params.id;
    const { data: center } = await api.get(`/cohesion-center/${id}`);
    let obj = center;

    if (!center || !center?.cohorts || !center?.cohorts?.length) return;

    for (const cohort of center.cohorts) {
      const sessionPhase1Response = await api.get(`/cohesion-center/${id}/cohort/${cohort}/session-phase1`);
      if (!sessionPhase1Response.ok) return toastr.error("Oups, une erreur est survenue lors de la récupération de la session", translate(sessionPhase1Response.code));
      obj[sessionPhase1Response.data.cohort] = sessionPhase1Response.data.placesTotal;
    }
    setDefaultValue(obj);
  }

  useEffect(() => {
    init();
    setSessionStatus(Object.values(SESSION_STATUS))
  }, []);

  const updateSessions = async (newValues) => {
    //Dynamic update for cohorts
    let sessionToUpdate = [];
    for (let i = 0; i < newValues.cohorts.length; i++) {
      const sessionPhase1Response = await api.get(`/cohesion-center/${newValues._id}/cohort/${newValues.cohorts[i]}/session-phase1`);
      if (!sessionPhase1Response.ok) return toastr.error("Oups, une erreur est survenue lors de la récupération de la session", translate(sessionPhase1Response.code));
      sessionToUpdate.push(sessionPhase1Response.data);
    }

    for (const session of sessionToUpdate) {
      if (session.placesTotal !== newValues[session.cohort]) {
        const { ok, code } = await api.put(`/session-phase1/${session._id}`, { placesTotal: newValues[session.cohort], status: newValues[status] });
        if (!ok) return toastr.error(`Oups, une erreur est survenue lors de la mise à jour de la session ${session.cohort}`, translate(code));
      }
    }
  };

  if (!defaultValue && !isNew) return <Loader />;

  return (
    <Formik
      validateOnChange={false}
      validateOnBlur={false}
      initialValues={defaultValue || {}}
      onSubmit={async (values) => {
        try {
          setLoading(true);
          if (isNew) values.placesLeft = values.placesTotal;
          else values.placesLeft += values.placesTotal - defaultValue.placesTotal;

          const { ok, code, data } = values._id ? await api.put(`/cohesion-center/${values._id}`, values) : await api.post("/cohesion-center", values);
          await updateSessions(values);

          setLoading(false);
          if (!ok) return toastr.error("Une erreur s'est produite lors de l'enregistrement de ce centre !!", translate(code));
          history.push(`/centre/${data._id}`);
          toastr.success("Centre enregistré");
        } catch (e) {
          setLoading(false);
          return toastr.error("Une erreur s'est produite lors de l'enregistrement de ce centre", e?.error?.message);
        }
      }}>
      {({ values, handleChange, handleSubmit, errors, touched, validateField }) => (
        <div>
          <Header>
            <Title>{defaultValue ? values.name : "Création d'un centre"}</Title>
            <LoadingButton onClick={handleSubmit} loading={loading}>
              {defaultValue ? "Enregistrer les modifications" : "Créer le centre"}
            </LoadingButton>
          </Header>
          <Wrapper>
            {Object.keys(errors).length ? <h3 className="alert">Vous ne pouvez pas enregistrer ce centre car tous les champs ne sont pas correctement renseignés.</h3> : null}
            <Row>
              <Col className="mb-10">
                <Box>
                  <BoxHeadTitle>Informations générales</BoxHeadTitle>
                  <BoxContent direction="column">
                    <div> Nom </div>
                    <Item title="Nom du centre" values={values} name={"name"} handleChange={handleChange} required errors={errors} touched={touched} />
                    <div> Adresse </div>
                    <AddressInput
                      keys={{
                        country: "country",
                        city: "city",
                        zip: "zip",
                        address: "address",
                        location: "location",
                        department: "department",
                        region: "region",
                        addressVerified: "addressVerified",
                      }}
                      values={values}
                      departAndRegionVisible={true}
                      handleChange={handleChange}
                      errors={errors}
                      touched={touched}
                      validateField={validateField}
                      required
                    />
                    <div> Code </div>
                    <Item disabled={user.role !== "admin"} title="Code" values={values} name="code" handleChange={handleChange} />
                    <Item disabled={user.role !== "admin"} title="Code 2022" values={values} name="code2022" handleChange={handleChange} />
                    <div> Accessibilité PMR </div>
                    <Select
                      name="pmr"
                      values={values}
                      handleChange={handleChange}
                      title="Accessibilité aux personnes à mobilité réduite"
                      options={[
                        { value: "true", label: "Oui" },
                        { value: "false", label: "Non" },
                      ]}
                      required
                      errors={errors}
                      touched={touched}
                    />
                  </BoxContent>
                </Box>
              </Col>
              <Col className="mb-10">
                <Box>
                  <BoxHeadTitle>Par séjour</BoxHeadTitle>
                  <BoxContent direction="column">
                    <MultiSelectWithTitle
                      required
                      errors={errors}
                      touched={touched}
                      title="Séjour(s) de cohésion concerné(s)"
                      value={values.cohorts}
                      onChange={handleChange}
                      name="cohorts"
                      options={["Juillet 2022", "Juin 2022", "Février 2022", "2021"]}
                      placeholder="Sélectionner un ou plusieurs séjour de cohésion"
                    />
                  </BoxContent>
                  {values.cohorts?.length ? (
                    <>
                      <div>
                        <div className="flex justify-start ml-10 border-bottom mb-2">
                          {(values.cohorts || []).map((cohort, index) => (
                            <>
                              <div key={index} className={`mx-5 mb-2 ${sessionShow === cohort ? "text-snu-purple-300 border-bottom border-snu-purple-300" : null}`} onClick={() => { setsessionShow(cohort) }}> {cohort} </div>
                            </>
                          ))}
                        </div>
                        <div className="flex justify-start  ml-5 mt-8">
                          <div className="border w-1/4 p-1 rounded-lg">
                            <div> Capacite d'acceuil</div>
                            <Field
                              disabled={false}
                              value={translate(values[sessionShow])}
                              name={sessionShow}
                              onChange={handleChange}
                              type={"text"}
                              validate={(v) => required && !v && requiredMessage}
                              placeholder={"Nombre de place" || sessionShow}
                            />
                          </div>
                          <div className="border p-1 rounded-lg w-1/2">
                            <div> Statut</div>
                            <select name="status" value={defaultValue.status} className="w-full" onChange={handleChange}>
                              {sessionStatus.map((status, index) => (
                                <option value={status} key={index} > {translateSessionStatus(status)} </option>
                              ))
                              }
                            </select>
                          </div>
                        </div>
                      </div>
                      {/* <BoxContent direction="column">
                        {(values.cohorts || []).map((cohort) => (
                          <Item
                            key={cohort}
                            title={cohort}
                            values={values}
                            name={cohort}
                            placeholder="Nombre de place"
                            handleChange={handleChange}
                            required
                            errors={errors}
                            touched={touched}
                          />
                        ))}
                      </BoxContent> */}
                    </>) : (null)}
                </Box>
              </Col>
            </Row>
            {Object.keys(errors).length ? <h3 className="alert">Vous ne pouvez pas proposer cette mission car tous les champs ne sont pas correctement renseignés.</h3> : null}
            <Header style={{ justifyContent: "flex-end" }}>
              <LoadingButton onClick={handleSubmit} loading={loading}>
                {defaultValue ? "Enregistrer les modifications" : "Créer le centre"}
              </LoadingButton>
            </Header>
          </Wrapper>
        </div>
      )}
    </Formik>
  );
}
const MultiSelectWithTitle = ({ title, value, onChange, name, options, placeholder, required, errors, touched }) => {
  return (
    <Row className="detail">
      <Col md={4}>
        <label>{title}</label>
      </Col>
      <Col md={8}>
        <Field hidden value={value} name={name} onChange={onChange} validate={(v) => required && !v?.length && requiredMessage} />
        <MultiSelect value={value} onChange={onChange} name={name} options={options} placeholder={placeholder} />
        {errors && touched && <Error errors={errors} touched={touched} name={name} />}
      </Col>
    </Row>
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

const Title = styled.div`
  color: rgb(38, 42, 62);
  font-weight: 700;
  font-size: 24px;
  margin-bottom: 10px;
  flex: 1;
`;
