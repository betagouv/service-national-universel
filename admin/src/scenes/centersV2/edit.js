import { Field, Formik } from "formik";
import React, { useEffect, useState } from "react";
import { BiHandicap } from "react-icons/bi";
import { useSelector } from "react-redux";
import { toastr } from "react-redux-toastr";
import { useHistory } from "react-router-dom";
import { Col, DropdownItem, DropdownMenu, DropdownToggle, Row, UncontrolledDropdown } from "reactstrap";
import styled from "styled-components";
import Trash from "../../assets/icons/Trash";
import AddressInput from "../../components/addressInputVCenter";
import Badge from "../../components/Badge";
import { Box, BoxContent } from "../../components/box";
import LoadingButton from "../../components/buttons/LoadingButton";
import Chevron from "../../components/Chevron.js";
import Error, { requiredMessage } from "../../components/errorMessage";
import Loader from "../../components/Loader";
import api from "../../services/api";
import { colors, ROLES, SESSION_STATUS, translate, translateSessionStatus } from "../../utils";

const cohortList = ["Juillet 2022", "Juin 2022", "Février 2022", "2021"];

export default function Edit(props) {
  const [defaultValue, setDefaultValue] = useState(null);
  const [loading, setLoading] = useState(false);
  const history = useHistory();
  const isNew = !props?.match?.params?.id;
  const user = useSelector((state) => state.Auth.user);
  const [sessionShow, setsessionShow] = useState(null);
  const [sessionStatus, setSessionStatus] = useState(null);

  async function init() {
    if (isNew) return setDefaultValue(null);
    const id = props.match && props.match.params && props.match.params.id;
    const { data: center } = await api.get(`/cohesion-center/${id}`);
    let obj = center;

    if (!center || !center?.cohorts || !center?.cohorts?.length) return;

    for (const cohort of center.cohorts) {
      const sessionPhase1Response = await api.get(`/cohesion-center/${id}/cohort/${cohort}/session-phase1`);
      if (!sessionPhase1Response.ok) return toastr.error("Oups, une erreur est survenue lors de la récupération de la session", translate(sessionPhase1Response.code));
      obj[sessionPhase1Response.data.cohort] = {
        placesTotal: sessionPhase1Response.data.placesTotal,
        placesLeft: sessionPhase1Response.data.placesLeft,
        status: sessionPhase1Response.data.status,
      };
      setsessionShow(sessionPhase1Response.data.cohort);
    }
    setDefaultValue(obj);
  }

  useEffect(() => {
    const optionSessionStatus = [];
    Object.values(SESSION_STATUS).map((status) => optionSessionStatus.push({ value: status, label: translateSessionStatus(status) }));
    setSessionStatus(optionSessionStatus);

    init();
  }, []);

  if (!defaultValue && !isNew) return <Loader />;

  return (
    <Formik
      validateOnChange={false}
      validateOnBlur={false}
      initialValues={defaultValue || {}}
      onSubmit={async (values) => {
        try {
          setLoading(true);
          values.sessionStatus = [];
          values.cohorts.map((cohort) => {
            //maj session status
            values.sessionStatus.push(values[cohort].status);
            //maj places
            values[cohort].placesTotal = Number(values[cohort].placesTotal);
            if (defaultValue && defaultValue[cohort]) values[cohort].placesLeft += values[cohort].placesTotal - defaultValue[cohort].placesTotal;
            else values[cohort].placesLeft = values[cohort].placesTotal;
          });
          const { ok, code, data } = values._id ? await api.put(`/cohesion-center/${values._id}`, values) : await api.post("/cohesion-center", values);
          setLoading(false);
          if (!ok) return toastr.error("Une erreur s'est produite lors de l'enregistrement de ce centre !!", translate(code));
          history.push(`/centre/${data._id}`);
          toastr.success("Centre enregistré");
        } catch (e) {
          setLoading(false);
          return toastr.error("Une erreur s'est produite lors de l'enregistrement de ce centre", e?.message);
        }
      }}>
      {({ values, handleChange, handleSubmit, errors, touched, validateField, setFieldValue }) => {
        const handleChangeCohort = (cohort) => {
          let tempCohorts = values.cohorts ? values.cohorts : [];
          if (tempCohorts.includes(cohort)) tempCohorts = tempCohorts.filter((c) => c !== cohort);
          else tempCohorts.push(cohort);
          setFieldValue("cohorts", tempCohorts);
          tempCohorts.length > 0 ? setsessionShow(tempCohorts[tempCohorts.length - 1]) : setsessionShow(null);
        };
        const filteredCohorts = cohortList.filter((cohort) => !values.cohorts?.includes(cohort));
        return (
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
                <Col className="mb-10 w-1/2">
                  <Box>
                    <BoxContent direction="column">
                      <div className="ml-1 font-bold text-lg">Informations générales</div>
                      <div className="ml-1 mt-8"> Nom </div>
                      <Item title="Nom du centre" values={values} name={"name"} handleChange={handleChange} required errors={errors} touched={touched} />
                      {user.role === ROLES.ADMIN ? (
                        <>
                          <div className="ml-1 mt-8">
                            Code (2022) <Badge text="modérateur" color={colors.purple} />
                          </div>
                          <Item title="Identifiant du centre - version 2022" values={values} name={"code2022"} handleChange={handleChange} errors={errors} touched={touched} />
                        </>
                      ) : null}
                      <div className="ml-1 mt-8"> Adresse </div>
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
                      <div className="ml-1 mt-8"> Accessibilité PMR </div>
                      <SelectPMR
                        name="pmr"
                        values={values["pmr"]}
                        handleChange={handleChange}
                        title="Accessibilité aux personnes à mobilité réduite"
                        options={[
                          { value: "true", label: "Oui" },
                          { value: "false", label: "Non" },
                        ]}
                        validate={(e) => !e && "L'Accessibilité PMR doit être renseignée"}
                        errors={errors}
                        touched={touched}
                      />
                      <div className="flex flex-col items-center ">
                        <Error errors={errors} name={"pmr"} />
                      </div>
                    </BoxContent>
                  </Box>
                </Col>
                <Col className="mb-10 w-1/2">
                  <Box>
                    <div className="flex flex-row items-center justify-between p-6">
                      <div className="text-lg font-bold">Par séjour</div>
                    </div>
                    <div className="flex justify-center">
                      <Field
                        hidden
                        value={values.cohorts}
                        name={"cohorts"}
                        onChange={handleChange}
                        validate={(v) => v && !v?.length && "Vous devez sélectionner au moins un séjour"}
                      />
                      {!values?.cohorts?.length ? <Error errors={errors} touched={touched} name={"cohorts"} /> : null}
                    </div>
                    {values.cohorts?.length ? (
                      <>
                        <div className="">
                          <div className="flex border-bottom mb-2 pl-2 gap-2">
                            {(values.cohorts || []).map((cohort, index) => (
                              <>
                                <div
                                  key={index}
                                  className={`pb-2 px-2 cursor-pointer hover:text-snu-purple-300 hover:border-b-2 hover:border-snu-purple-300 ${
                                    sessionShow === cohort ? "text-snu-purple-300 border-b-2  border-snu-purple-300" : null
                                  }`}
                                  onClick={() => {
                                    setsessionShow(cohort);
                                  }}>
                                  {cohort}
                                </div>
                              </>
                            ))}
                            {filteredCohorts.length ? (
                              <button className="pb-2 px-2 hover:text-snu-purple-300">
                                <UncontrolledDropdown setActiveFromChild>
                                  <DropdownToggle tag="button" className="inline-flex">
                                    Ajouter un séjour
                                    <Chevron color="#444" />
                                  </DropdownToggle>
                                  <DropdownMenu>
                                    {filteredCohorts.map((o, i) => (
                                      <DropdownItem onClick={() => handleChangeCohort(o)} className="dropdown-item text-sm" key={i}>
                                        {o}
                                      </DropdownItem>
                                    ))}
                                  </DropdownMenu>
                                </UncontrolledDropdown>
                              </button>
                            ) : null}
                          </div>
                          {sessionShow
                            ? values.cohorts.map((cohort) => {
                                const nbJeunes = defaultValue[cohort]?.placesTotal - defaultValue[cohort]?.placesLeft;
                                return (
                                  <div key={cohort} className="ml-5 mt-4" hidden={cohort !== sessionShow}>
                                    <div className="mb-2 text-gray-500">
                                      <span className="font-weight-bold">{nbJeunes > 0 ? nbJeunes : "Aucun"}</span>
                                      {nbJeunes > 1 ? " jeunes sont affectés" : " jeune" + (nbJeunes > 0 ? " est" : " n'est") + " affecté"} dans ce centre pour ce séjour.
                                    </div>
                                    <div className="flex">
                                      <div className="w-1/4 flex border flex-col justify-items-start rounded-lg rounded-grey-300 p-1">
                                        <PlaceCapacity
                                          key={`${cohort}.Places`}
                                          title={"Capacite d'accueil"}
                                          values={values[cohort]?.placesTotal || ""}
                                          name={`${cohort}.placesTotal`}
                                          handleChange={handleChange}
                                          required
                                          errors={errors}
                                          touched={touched}
                                          validate={(e) => !e && `La capacité d'accueil de ${cohort} doit être renseignée`}
                                        />
                                      </div>
                                      <div className="w-2/4 flex border flex-col justify-items-start ml-2 rounded-lg rounded-grey-300 p-1">
                                        <SelectStatus
                                          name={`${cohort}.status`}
                                          values={values[cohort]?.status || ""}
                                          handleChange={handleChange}
                                          title="Statut"
                                          options={sessionStatus}
                                          required
                                          errors={errors}
                                          touched={touched}
                                          validate={(e) => !e && `Le status pour la session de ${cohort} est obligatoire`}
                                        />
                                      </div>
                                    </div>
                                    <div className="flex flex-row-reverse mt-3 mr-4">
                                      <DeleteSejourBtn
                                        onClick={() => {
                                          const nbVolontaires = defaultValue[cohort]?.placesLeft >= 0 ? defaultValue[cohort]?.placesTotal - defaultValue[cohort]?.placesLeft : 0;
                                          return nbVolontaires > 0 ? toastr.error("Des volontaires sont assignés à ce séjour !") : handleChangeCohort(cohort);
                                        }}
                                      />
                                    </div>
                                  </div>
                                );
                              })
                            : null}
                          <div className="ml-5 mt-2 flex flex-col items-center w-3/4">
                            {values.cohorts.map((cohort) => (
                              <>
                                <div>
                                  <Error errors={errors} name={`${cohort}.status`} />
                                </div>
                                <div>
                                  <Error errors={errors} name={`${cohort}.placesTotal`} />
                                </div>
                              </>
                            ))}
                          </div>
                        </div>
                      </>
                    ) : null}
                  </Box>
                </Col>
              </Row>
              {Object.keys(errors).length ? <h3 className="alert">Vous ne pouvez pas enregistrer ce centre car tous les champs ne sont pas correctement renseignés.</h3> : null}
              <Header style={{ justifyContent: "flex-end" }}>
                <LoadingButton onClick={handleSubmit} loading={loading}>
                  {defaultValue ? "Enregistrer les modifications" : "Créer le centre"}
                </LoadingButton>
              </Header>
            </Wrapper>
          </div>
        );
      }}
    </Formik>
  );
}

const DeleteSejourBtn = ({ onClick }) => (
  <button className="group flex justify-center items-center p-2 bg-white rounded shadow-sm gap-2" onClick={() => onClick()}>
    <Trash className="text-red-400 group-hover:scale-110" width={14} height={14} />
    Supprimer le séjour
  </button>
);

const PlaceCapacity = ({ title, values, name, handleChange, disabled = false, validate }) => {
  return (
    <>
      <div className="text-gray-500 text-xs"> {title} </div>
      <Field disabled={disabled} value={values} name={name} onChange={handleChange} validate={validate} />
    </>
  );
};

const SelectStatus = ({ title, name, values, handleChange, disabled, options, validate }) => {
  return (
    <div className="">
      <div className="text-gray-500 text-xs"> {title} </div>

      <Field hidden value={values} name={name} onChange={handleChange} validate={validate} />
      <select disabled={disabled} name={name} value={values} required onChange={handleChange} className="w-full bg-inherit cursor-pointer">
        <option disabled value="">
          Sélectionner un statut
        </option>
        {options.map((o, i) => (
          <option key={i} value={o.value} label={o.label}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
};

const SelectPMR = ({ title, name, values, handleChange, disabled, options, validate }) => {
  return (
    <div className="flex border w-full  justify-items-start ml-0.5 my-1 rounded-lg rounded-grey-300 p-2">
      <div className="bg-gray-100 rounded-full p-1">
        <BiHandicap size={28} />
      </div>
      <div className="items-start ml-2 w-full">
        <div className="ml-1 text-xs"> {title} </div>
        <Field hidden value={values} name={name} onChange={handleChange} validate={validate} />
        <select disabled={disabled} className="w-full bg-inherit cursor-pointer" name={name} value={values} onChange={handleChange}>
          <option key={-1} value="" label=""></option>
          {options.map((o, i) => (
            <option key={i} value={o.value} label={o.label}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

const Item = ({ title, placeholder, values, name, handleChange, type = "text", disabled = false, required = false, errors, touched }) => {
  return (
    <Row className="flex w-full border flex-col justify-items-start m-1 rounded-lg rounded-grey-300 p-2">
      <div className="text-gray-500 text-xs">
        <label>{title}</label>
      </div>
      <Field
        disabled={disabled}
        value={translate(values[name])}
        name={name}
        onChange={handleChange}
        type={type}
        validate={(v) => required && !v && requiredMessage}
        placeholder={placeholder || title}
      />
      {errors && touched && <Error errors={errors} touched={touched} name={name} />}
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
