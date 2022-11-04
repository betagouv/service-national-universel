import React, { useEffect, useState } from "react";
import { Col, Row } from "reactstrap";
import styled from "styled-components";
import { toastr } from "react-redux-toastr";
import { useSelector } from "react-redux";
import { Formik, Field } from "formik";
import { useHistory } from "react-router-dom";

import ErrorMessage, { requiredMessage } from "../../components/errorMessage";
import { translate, REFERENT_ROLES, departmentList, regionList, region2department, department2region } from "../../utils";
import api from "../../services/api";
import Loader from "../../components/Loader";
import { Box, BoxTitle } from "../../components/box";
import LoadingButton from "../../components/buttons/LoadingButton";

export default function Edit(props) {
  const [defaultValue, setDefaultValue] = useState(null);
  const [loading, setLoading] = useState(false);
  const history = useHistory();
  const isNew = !props?.match?.params?.id;

  useEffect(() => {
    (async () => {
      if (isNew) return setDefaultValue(null);
      const id = props.match && props.match.params && props.match.params.id;
      const { data } = await api.get(`/program/${id}`);
      setDefaultValue(data);
    })();
  }, []);

  if (!defaultValue && !isNew) return <Loader />;

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
          setLoading(true);
          if (values.visibility === "DEPARTMENT") values.region = department2region[values.department];

          const { ok, code } = values._id ? await api.put(`/program/${values._id}`, values) : await api.post("/program", values);

          setLoading(false);
          if (!ok) return toastr.error("Une erreur s'est produite lors de l'enregistrement de cette possibilité d'engagement", translate(code));
          history.push(`/contenu`);
          toastr.success("Enregistrée");
        } catch (e) {
          setLoading(false);
          return toastr.error("Une erreur s'est produite lors de l'enregistrement de cette possibilité d'engagement", e?.message);
        }
      }}>
      {({ values, handleChange, handleSubmit, errors, touched }) => (
        <div>
          <Header>
            <Title>{defaultValue ? values.name : "Nouvelle possibilité d'engagement"}</Title>
            <LoadingButton onClick={handleSubmit} loading={loading}>
              {defaultValue ? "Enregistrer les modifications" : "Enregistrer et publier"}
            </LoadingButton>
          </Header>
          <Wrapper>
            {Object.keys(errors).length ? <h3 className="alert">Vous ne pouvez pas proposer cette mission car tous les champs ne sont pas correctement renseignés.</h3> : null}
            <Box>
              <Row style={{ borderBottom: "2px solid #f4f5f7" }}>
                <Col md={6} style={{ borderRight: "2px solid #f4f5f7" }}>
                  <Wrapper>
                    <BoxTitle>Détails</BoxTitle>
                    <FormGroup>
                      <label>
                        <span>*</span>Le dispositif
                      </label>
                      <Field validate={(v) => !v && requiredMessage} value={values.name} onChange={handleChange} name="name" placeholder="Nom du dispositif d'engagement" />
                      <ErrorMessage errors={errors} touched={touched} name="name" />
                    </FormGroup>
                    <FormGroup>
                      <label>
                        <span>*</span>Qu&apos;est ce que c&apos;est ?
                      </label>
                      <Field
                        validate={(v) => !v && requiredMessage}
                        name="description"
                        component="textarea"
                        rows={2}
                        value={values.description}
                        onChange={handleChange}
                        placeholder="Message..."
                      />
                      <ErrorMessage errors={errors} touched={touched} name="description" />
                    </FormGroup>
                    <FormGroup>
                      <label>C&apos;est pour ?</label>
                      <Field name="descriptionFor" component="textarea" rows={2} value={values.descriptionFor} onChange={handleChange} placeholder="Message..." />
                    </FormGroup>
                    <FormGroup>
                      <label>Est-ce indemnisé ?</label>
                      <Field name="descriptionMoney" component="textarea" rows={2} value={values.descriptionMoney} onChange={handleChange} placeholder="Message..." />
                    </FormGroup>
                    <FormGroup>
                      <label>Quelle durée d&apos;engagement ?</label>
                      <Field name="descriptionDuration" component="textarea" rows={2} value={values.descriptionDuration} onChange={handleChange} placeholder="Message..." />
                    </FormGroup>
                    <FormGroup>
                      <label>
                        <span>*</span>URL du site
                      </label>
                      <Field validate={(v) => !v && requiredMessage} value={values.url} onChange={handleChange} name="url" placeholder="www.site.com" />
                      <ErrorMessage errors={errors} touched={touched} name="url" />
                    </FormGroup>
                    <FormGroup>
                      <label>URL de l&apos;image</label>
                      <Field value={values.imageFile} onChange={handleChange} name="imageFile" placeholder="www.site.com/ma-super-image.jpg" />
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
                          <option key="" value="" disabled>
                            Choisir un type
                          </option>
                          <option key="ENGAGEMENT" value="Engagement">
                            Engagement
                          </option>
                          <option key="FORMATION" value="Formation">
                            Formation
                          </option>
                          <option key="RECONNAISSANCE" value="Reconnaissance">
                            Reconnaissance
                          </option>
                        </Field>
                        <ErrorMessage errors={errors} touched={touched} name="type" />
                      </FormGroup>
                      <FormGroup>
                        <label>Visibilité</label>
                        <ChooseVisibility validate={(v) => !v && requiredMessage} value={values.visibility} onChange={handleChange} />
                        <ErrorMessage errors={errors} touched={touched} name="visibility" />
                      </FormGroup>
                      {values.visibility === "DEPARTMENT" ? (
                        <FormGroup>
                          <label>Département(s)</label>
                          <ChooseDepartment validate={(v) => !v && requiredMessage} value={values.department} onChange={handleChange} />
                          <ErrorMessage errors={errors} touched={touched} name="department" />
                        </FormGroup>
                      ) : null}
                      {values.visibility === "REGION" ? (
                        <FormGroup>
                          <label>Région</label>
                          <ChooseRegion validate={(v) => !v && requiredMessage} value={values.region} onChange={handleChange} />
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
              <LoadingButton onClick={handleSubmit} loading={loading}>
                {defaultValue ? "Enregistrer les modifications" : "Enregistrer et publier"}
              </LoadingButton>
            </Header>
          </Wrapper>
        </div>
      )}
    </Formik>
  );
}

const ChooseVisibility = ({ value, onChange, validate }) => {
  const { user } = useSelector((state) => state.Auth);

  return (
    <Field validate={validate} component="select" name="visibility" value={value} onChange={onChange}>
      <option value="" disabled label="Choisir une visibilité">
        Choisir une visibilité
      </option>
      <option value="DEPARTMENT" label="Départementale">
        Départementale
      </option>
      <option value="HEAD_CENTER" label={translate("head_center")}>
        {translate("head_center")}
      </option>
      {user.role === REFERENT_ROLES.ADMIN || user.role === REFERENT_ROLES.REFERENT_REGION ? (
        <option value="REGION" label="Régionale">
          Régionale
        </option>
      ) : null}
      {user.role === REFERENT_ROLES.ADMIN ? (
        <option value="NATIONAL" label="Nationale">
          Nationale
        </option>
      ) : null}
    </Field>
  );
};

const ChooseDepartment = ({ value, onChange, validate }) => {
  const { user } = useSelector((state) => state.Auth);
  const [list, setList] = useState(departmentList);

  useEffect(() => {
    //force the value if it is a referent_department
    if (user.role === REFERENT_ROLES.REFERENT_DEPARTMENT) {
      setList(user.department);
    }
    //filter the array if it is a referent_region
    if (user.role === REFERENT_ROLES.REFERENT_REGION) {
      setList(region2department[user.region]);
    }
    return onChange({ target: { value: list[0], name: "department" } });
  }, []);

  return (
    <Field
      validate={validate}
      component="select"
      disabled={user.role === REFERENT_ROLES.REFERENT_DEPARTMENT && user.department.length === 1}
      name="department"
      value={value}
      onChange={onChange}>
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

const ChooseRegion = ({ value, onChange, validate }) => {
  const { user } = useSelector((state) => state.Auth);

  useEffect(() => {
    if (value) return;

    if (user.role === REFERENT_ROLES.REFERENT_REGION) {
      return onChange({ target: { value: user.region, name: "region" } });
    }
    return onChange({ target: { value: regionList[0], name: "region" } });
  }, []);

  return (
    <Field validate={validate} component="select" disabled={user.role === REFERENT_ROLES.REFERENT_REGION} name="region" value={value} onChange={onChange}>
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
