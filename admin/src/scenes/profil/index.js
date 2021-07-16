import React, { useEffect, useState } from "react";
import { Col, Row } from "reactstrap";
import styled from "styled-components";
import { useDispatch, useSelector } from "react-redux";
import { Formik, Field } from "formik";
import { toastr } from "react-redux-toastr";

import { setUser } from "../../redux/auth/actions";
import api from "../../services/api";
import LoadingButton from "../../components/buttons/LoadingButton";
import Loader from "../../components/Loader";
import Badge from "../../components/Badge";
import Error, { requiredMessage } from "../../components/errorMessage";
import { Box, BoxContent } from "../../components/box";
import { translate, ROLES, REFERENT_DEPARTMENT_SUBROLE, REFERENT_REGION_SUBROLE } from "../../utils";

export default () => {
  const user = useSelector((state) => state.Auth.user);
  const [service, setService] = useState();
  const dispatch = useDispatch();

  const getSubRole = (role) => {
    let subRole = [];
    if (role === ROLES.REFERENT_DEPARTMENT) subRole = REFERENT_DEPARTMENT_SUBROLE;
    if (role === ROLES.REFERENT_REGION) subRole = REFERENT_REGION_SUBROLE;
    return Object.keys(subRole).map((e) => ({ value: e, label: translate(subRole[e]) }));
  };

  useEffect(() => {
    (async () => {
      const { data: d } = await api.get(`/department-service/referent/${user._id}`);
      setService(d);
    })();
  }, []);

  if (user === undefined || service === undefined) return <Loader />;

  return (
    <Wrapper>
      <TopTitle>Mon profil</TopTitle>
      <Row>
        <Col md={6}>
          <Formik
            initialValues={user}
            onSubmit={async (values, actions) => {
              try {
                const { data, ok } = await api.put("/referent", values);
                if (ok) {
                  dispatch(setUser(data));
                  return toastr.success("Profil mis à jour !");
                }
              } catch (e) {
                console.log(e);
              }
              toastr.error("Erreur");
              actions.setSubmitting(false);
            }}
          >
            {({ values, errors, touched, isSubmitting, handleChange, handleSubmit }) => (
              <>
                <TitleWrapper>
                  <Title>
                    <span>{`${user.firstName} ${user.lastName}`}</span>
                    <Badge text={translate(user.role)} />
                  </Title>
                </TitleWrapper>
                <Box style={{ height: "fit-content" }}>
                  <BoxTitle>
                    <h3>Informations générales</h3>
                    <p>Données personnelles</p>
                  </BoxTitle>
                  <BoxContent direction="column">
                    <Item required title="E-mail" values={values} name="email" handleChange={handleChange} errors={errors} touched={touched} />
                    {user.role === ROLES.REFERENT_DEPARTMENT ? <Item title="Département" disabled values={values} name="department" handleChange={handleChange} /> : null}
                    {user.role === ROLES.REFERENT_REGION ? <Item title="Région" disabled values={values} name="region" handleChange={handleChange} /> : null}
                    <Row>
                      <Col md={6}>
                        <Item required title="Prénom" values={values} name="firstName" handleChange={handleChange} errors={errors} touched={touched} />
                      </Col>
                      <Col md={6}>
                        <Item required title="Nom" values={values} name="lastName" handleChange={handleChange} errors={errors} touched={touched} />
                      </Col>
                    </Row>
                    <Row>
                      <Col md={6}>
                        <Item title="Téléphone mobile" values={values} name="mobile" handleChange={handleChange} />
                      </Col>
                      <Col md={6}>
                        <Item title="Téléphone fixe" values={values} name="phone" handleChange={handleChange} />
                      </Col>
                    </Row>
                    {[ROLES.REFERENT_DEPARTMENT, ROLES.REFERENT_REGION].includes(values.role) ? (
                      <Select name="subRole" values={values} onChange={handleChange} title="Fonction" options={getSubRole(values.role)} />
                    ) : null}
                  </BoxContent>
                </Box>
                <SaveBtn loading={isSubmitting} onClick={handleSubmit}>
                  Enregistrer
                </SaveBtn>
              </>
            )}
          </Formik>
        </Col>
        {user.role === ROLES.REFERENT_DEPARTMENT && (
          <Col md={6}>
            <Formik
              initialValues={service || { department: user.department }}
              onSubmit={async (values) => {
                try {
                  const { ok, code, data } = await api.post(`/department-service`, values);
                  if (!ok) toastr.error("Une erreur s'est produite :", translate(code));
                  setService(data);
                  toastr.success("Service départemental mis à jour !");
                } catch (e) {
                  console.log(e);
                  toastr.error("Oups, une erreur est survenue pendant la mise à jour des informations :", translate(e.code));
                }
              }}
            >
              {({ values, handleChange, handleSubmit, isSubmitting, submitForm }) => (
                <>
                  <TitleWrapper>
                    <div>
                      <Title>Information du service départemental {values.department && `(${values.department})`}</Title>
                    </div>
                  </TitleWrapper>
                  <Box style={{ height: "fit-content" }}>
                    <BoxTitle>
                      <h3>Service Départemental</h3>
                      <p>Données partagées par tous les référents de votre département</p>
                    </BoxTitle>
                    <BoxContent direction="column">
                      <Item title="Nom de la direction" values={values} name="directionName" handleChange={handleChange} />
                      <Item title="Adresse" values={values} name="address" handleChange={handleChange} />
                      <Item title="Complément d'adresse" values={values} name="complementAddress" handleChange={handleChange} />
                      <Item title="Code postal" values={values} name="zip" handleChange={handleChange} />
                      <Item title="Ville" values={values} name="city" handleChange={handleChange} />
                    </BoxContent>
                  </Box>
                  <SaveBtn loading={isSubmitting} onClick={handleSubmit}>
                    Enregistrer
                  </SaveBtn>
                </>
              )}
            </Formik>
          </Col>
        )}
      </Row>
    </Wrapper>
  );
};

const Select = ({ title, name, values, onChange, disabled, errors, touched, validate, options }) => {
  return (
    <Row>
      <Col md={6}>
        <FormGroup>
          <label>{title}</label>
          <select disabled={disabled} className="form-control" name={name} value={values[name]} onChange={onChange}>
            <option key={-1} value="" label=""></option>
            {options.map((o, i) => (
              <option key={i} value={o.value} label={o.label}>
                {o.label}
              </option>
            ))}
          </select>
        </FormGroup>
      </Col>
    </Row>
  );
};

const Item = ({ title, values, name, handleChange, disabled, required, errors, touched }) => {
  return (
    <FormGroup>
      <label>
        {required && <span>*</span>}
        {title}
      </label>
      <Field
        disabled={disabled}
        className="form-control"
        value={translate(values[name])}
        name={name}
        onChange={handleChange}
        type="text"
        validate={(v) => required && !v && requiredMessage}
      />
      {errors && touched && <Error errors={errors} touched={touched} name={name} />}
    </FormGroup>
  );
};

const Wrapper = styled.div`
  padding: 20px 40px;
`;

const FormGroup = styled.div`
  margin-bottom: 25px;
  label {
    font-size: 11px;
    font-weight: 500;
    text-transform: uppercase;
    color: #6a6f85;
    display: block;
    margin-bottom: 10px;
    span {
      color: red;
      font-size: 10px;
      margin-right: 5px;
    }
  }
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

const TopTitle = styled.div`
  color: rgb(113, 128, 150);
  font-weight: 400;
  text-transform: uppercase;
  font-size: 18px;
`;

const SaveBtn = styled(LoadingButton)`
  background-color: #5245cc;
  border: none;
  border-radius: 5px;
  padding: 7px 30px;
  font-size: 14px;
  font-weight: 700;
  color: #fff;
  cursor: pointer;
  :hover {
    background: #372f78;
  }
  &.outlined {
    :hover {
      background: #fff;
    }
    background-color: transparent;
    border: solid 1px #5245cc;
    color: #5245cc;
    font-size: 13px;
    padding: 4px 20px;
  }
`;

const TitleWrapper = styled.div`
  margin: 32px 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-height: 4rem;
`;

const Title = styled.h2`
  color: #242526;
  font-weight: bold;
  font-size: 1.5rem;
  display: flex;
  align-items: center;
  span {
    margin-right: 1rem;
  }
`;

const BoxTitle = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  border-bottom: 1px solid #f2f1f1;
  min-height: 5rem;
  padding: 22px;
  h3 {
    color: #171725;
    font-size: 16px;
    font-weight: bold;
  }
  p {
    color: #aaa;
    font-size: 14px;
    font-weight: 300;
    display: flex;
    align-items: center;
    font-style: italic;
    margin: 0;
  }
`;
