import React, { useEffect, useState } from "react";
import { Col, Row, Input } from "reactstrap";
import styled from "styled-components";
import { toastr } from "react-redux-toastr";
import { useSelector } from "react-redux";
import { Formik, Field } from "formik";
import { useHistory } from "react-router-dom";

import MultiSelect from "../../components/Multiselect";
import AddressInput from "../../components/addressInput";
import ErrorMessage, { requiredMessage } from "../../components/errorMessage";
import {
  translate,
  MISSION_PERIOD_DURING_HOLIDAYS,
  MISSION_PERIOD_DURING_SCHOOL,
  MISSION_DOMAINS,
  PERIOD,
  REFERENT_ROLES,
  departmentList,
  regionList,
  region2department,
} from "../../utils";
import api from "../../services/api";
import Invite from "../structure/components/invite";

export default (props) => {
  const [defaultValue, setDefaultValue] = useState(null);
  const history = useHistory();
  const user = useSelector((state) => state.Auth.user);
  const isNew = !props?.match?.params?.id;

  useEffect(() => {
    (async () => {
      if (isNew) return setDefaultValue(null);
      const id = props.match && props.match.params && props.match.params.id;
      const { data } = await api.get(`/program/${id}`);
      setDefaultValue(data);
    })();
  }, []);

  if (!defaultValue && !isNew) return <div>Chargement...</div>;

  return (
    <Formik
      validateOnChange={false}
      validateOnBlur={false}
      initialValues={
        defaultValue || {
          name: "",
          description: "",
          url: "",
          imageFile: "",
          type: "",
          department: "",
          region: "",
          visibility: "",
        }
      }
      onSubmit={async (values) => {
        try {
          const { ok, code, data } = await api[values._id ? "put" : "post"]("/program", values);
          if (!ok) return toastr.error("Une erreur s'est produite lors de l'enregistrement de cette possibilité d'engagement", translate(code));
          history.push(`/program`);
          toastr.success("Enregistrée");
        } catch (e) {
          return toastr.error("Une erreur s'est produite lors de l'enregistrement de cette possibilité d'engagement", e?.error?.message);
        }
      }}
    >
      {({ values, handleChange, handleSubmit, isValid, errors, touched }) => (
        <div>
          <Header>
            <Title>{defaultValue ? values.name : "Nouvelle possibilité d'engagement"}</Title>
            <ButtonContainer>
              <button disabled={!isValid} onClick={handleSubmit}>
                {defaultValue ? "Enregistrer les modifications" : "Enregistrer et publier"}
              </button>
            </ButtonContainer>
          </Header>
          <Wrapper>
            {Object.keys(errors).length ? <h3 className="alert">Vous ne pouvez pas proposer cette mission car tous les champs ne sont pas correctement renseignés.</h3> : null}
            <Box>
              <Row style={{ borderBottom: "2px solid #f4f5f7" }}>
                <Col md={6} style={{ borderRight: "2px solid #f4f5f7" }}>
                  <Wrapper>
                    <Legend>Détails</Legend>
                    <FormGroup>
                      <label>
                        <span>*</span>Le dispositif
                      </label>
                      <Field validate={(v) => !v && requiredMessage} value={values.name} onChange={handleChange} name="name" placeholder="Nom du dispositif d'engagement" />
                      <ErrorMessage errors={errors} touched={touched} name="name" />
                    </FormGroup>
                    <FormGroup>
                      <label>
                        <span>*</span>Le dispositif en quelques mots
                      </label>
                      <Field
                        validate={(v) => !v && requiredMessage}
                        name="description"
                        component="textarea"
                        rows={4}
                        value={values.description}
                        onChange={handleChange}
                        placeholder="Décrivez en quelques mots ce dispositif"
                      />
                      <ErrorMessage errors={errors} touched={touched} name="description" />
                    </FormGroup>
                    <FormGroup>
                      <label>
                        <span>*</span>URL du site
                      </label>
                      <Field validate={(v) => !v && requiredMessage} value={values.url} onChange={handleChange} name="url" placeholder="www.site.com" />
                      <ErrorMessage errors={errors} touched={touched} name="url" />
                    </FormGroup>
                  </Wrapper>
                </Col>
                <Col md={6}>
                  <Row style={{ borderBottom: "2px solid #f4f5f7" }}>
                    <Wrapper style={{ maxWidth: "100%" }}>
                      <FormGroup>
                        <label>
                          <span>*</span>TYPE DE DISPOSITIF
                        </label>
                        <Field validate={(v) => !v && requiredMessage} component="select" name="type" value={values.type} onChange={handleChange}>
                          <option key="ENGAGEMENT" value="ENGAGEMENT">
                            {translate("ENGAGEMENT")}
                          </option>
                          <option key="FORMATION" value="FORMATION">
                            {translate("FORMATION")}
                          </option>
                          <option key="RECONNAISSANCE" value="RECONNAISSANCE">
                            {translate("RECONNAISSANCE")}
                          </option>
                        </Field>
                        <ErrorMessage errors={errors} touched={touched} name="type" />
                      </FormGroup>
                      <FormGroup>
                        <label>Visibilité</label>
                        <ChooseVisibility value={values.visibility} onChange={handleChange} />
                        <ErrorMessage errors={errors} touched={touched} name="visibility" />
                      </FormGroup>
                      {values.visibility === "DEPARTMENT" ? (
                        <FormGroup>
                          <label>Département</label>
                          <ChooseDepartment validate={(v) => !v} value={values.department} onChange={handleChange} />
                          <ErrorMessage errors={errors} touched={touched} name="department" />
                        </FormGroup>
                      ) : null}
                      {values.visibility === "REGION" ? (
                        <FormGroup>
                          <label>Région</label>
                          <ChooseRegion validate={(v) => !v} value={values.region} onChange={handleChange} />
                          <ErrorMessage errors={errors} touched={touched} name="region" />
                        </FormGroup>
                      ) : null}
                    </Wrapper>
                  </Row>
                </Col>
              </Row>
            </Box>
            {Object.keys(errors).length ? <h3 className="alert">Vous ne pouvez pas proposer cette mission car tous les champs ne sont pas correctement renseignés.</h3> : null}
            <Header style={{ justifyContent: "flex-end" }}>
              <ButtonContainer>
                {!defaultValue ? (
                  <button
                    className="white-button"
                    disabled={!isValid}
                    onClick={() => {
                      handleChange({ target: { value: "DRAFT", name: "status" } });
                      handleSubmit();
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
          </Wrapper>
        </div>
      )}
    </Formik>
  );
};

const ChooseVisibility = ({ value, onChange }) => {
  const { user } = useSelector((state) => state.Auth);

  return (
    <Field component="select" name="visibility" value={value} onChange={onChange}>
      <option value=""></option>
      <option value="DEPARTMENT">{translate("DEPARTMENT")}</option>
      {user.role === REFERENT_ROLES.ADMIN || user.role === REFERENT_ROLES.REFERENT_REGION ? <option value="REGION">{translate("REGION")}</option> : null}
      {user.role === REFERENT_ROLES.ADMIN ? <option value="NATIONAL">{translate("NATIONAL")}</option> : null}
    </Field>
  );
};

const ChooseDepartment = ({ value, onChange }) => {
  const { user } = useSelector((state) => state.Auth);
  const [list, setList] = useState(departmentList);

  useEffect(() => {
    //force the value if it is a referent_department
    if (user.role === REFERENT_ROLES.REFERENT_DEPARTMENT) {
      return onChange({ target: { value: user.department, name: "department" } });
    }
    //filter the array if it is a referent_region
    if (user.role === REFERENT_ROLES.REFERENT_REGION) {
      setList(region2department[user.region]);
    }
    return onChange({ target: { value: list[0], name: "department" } });
  }, []);

  return (
    <Field component="select" disabled={user.role === REFERENT_ROLES.REFERENT_DEPARTMENT} name="department" value={value} onChange={onChange}>
      {list.map((e) => {
        return (
          <option value={e} key={e}>
            {e}
          </option>
        );
      })}
    </Field>
  );
};

const ChooseRegion = ({ value, onChange }) => {
  const { user } = useSelector((state) => state.Auth);

  useEffect(() => {
    if (user.role === REFERENT_ROLES.REFERENT_REGION) {
      return onChange({ target: { value: user.region, name: "region" } });
    }
    return onChange({ target: { value: regionList[0], name: "region" } });
  }, []);

  return (
    <Field component="select" disabled={user.role === REFERENT_ROLES.REFERENT_REGION} name="region" value={value} onChange={onChange}>
      {regionList.map((e) => {
        return (
          <option value={e} key={e}>
            {e}
          </option>
        );
      })}
    </Field>
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

const Box = styled.div`
  width: ${(props) => props.width || 100}%;
  min-height: 400px;
  height: 100%;
  background-color: #fff;
  filter: drop-shadow(0px 2px 4px rgba(0, 0, 0, 0.05));
  margin-bottom: 33px;
  border-radius: 8px;
`;
