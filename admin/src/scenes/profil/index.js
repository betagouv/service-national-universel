import React from "react";
import { Col, Row, Input } from "reactstrap";
import styled from "styled-components";
import { useDispatch, useSelector } from "react-redux";
import { Formik } from "formik";
import { toastr } from "react-redux-toastr";

import { setUser } from "../../redux/auth/actions";
import api from "../../services/api";

import { translate, REFERENT_ROLES, REFERENT_DEPARTMENT_SUBROLE, REFERENT_REGION_SUBROLE } from "../../utils";

export default () => {
  const user = useSelector((state) => state.Auth.user);
  const dispatch = useDispatch();

  const getSubRole = (role) => {
    let subRole = [];
    if (role === "referent_department") subRole = REFERENT_DEPARTMENT_SUBROLE;
    if (role === "referent_region") subRole = REFERENT_REGION_SUBROLE;
    return Object.keys(subRole).map((e) => ({ value: e, label: translate(subRole[e]) }));
  };

  return (
    <Wrapper>
      <Subtitle>PROFIL</Subtitle>
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
        {({ values, errors, isSubmitting, handleChange, handleSubmit }) => {
          return (
            <form onSubmit={handleSubmit}>
              <Title>
                {`${user.firstName} ${user.lastName}`}
                <Tag>{translate(user.role)}</Tag>
              </Title>
              <Legend>Informations générales</Legend>
              <FormGroup>
                <label>
                  <span>*</span>EMAIL
                </label>
                <Input placeholder="Email" name="email" value={values.email} onChange={handleChange} />
              </FormGroup>
              {user.role === REFERENT_ROLES.REFERENT_DEPARTMENT ? (
                <FormGroup>
                  <label>Département</label>
                  <Input disabled name="department" value={values.department} onChange={handleChange} />
                </FormGroup>
              ) : null}
              {user.role === REFERENT_ROLES.REFERENT_REGION ? (
                <FormGroup>
                  <label>Région</label>
                  <Input disabled name="region" value={values.region} onChange={handleChange} />
                </FormGroup>
              ) : null}
              <Row>
                <Col>
                  <FormGroup>
                    <label>
                      <span>*</span>PRÉNOM
                    </label>
                    <Input placeholder="Prénom" name="firstName" value={values.firstName} onChange={handleChange} />
                  </FormGroup>
                </Col>
                <Col>
                  <FormGroup>
                    <label>
                      <span>*</span>NOM
                    </label>
                    <Input placeholder="Nom de famille" name="lastName" value={values.lastName} onChange={handleChange} />
                  </FormGroup>
                </Col>
              </Row>
              <Row>
                <Col>
                  <FormGroup>
                    <label>TÉLÉPHONE MOBILE</label>
                    <Input placeholder="Téléphone mobile" name="mobile" value={values.mobile} onChange={handleChange} />
                  </FormGroup>
                </Col>
                <Col>
                  <FormGroup>
                    <label>TÉLÉPHONE FIXE</label>
                    <Input placeholder="Téléphone fixe" name="phone" value={values.phone} onChange={handleChange} />
                  </FormGroup>
                </Col>
              </Row>
              {["referent_department", "referent_region"].includes(values.role) ? (
                <Select name="subRole" values={values} onChange={handleChange} title="Fonction" options={getSubRole(values.role)} />
              ) : null}
              <Button type="submit" onClick={handleSubmit}>
                Enregistrer
              </Button>
            </form>
          );
        }}
      </Formik>
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
                {o.value}
              </option>
            ))}
          </select>
        </FormGroup>
      </Col>
    </Row>
  );
};

const Wrapper = styled.div`
  padding: 40px;
  ${FormGroup} {
    max-width: 750px;
  }
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
  display: flex;
  align-items: center;
`;

const Legend = styled.div`
  color: rgb(38, 42, 62);
  margin-top: 30px;
  margin-bottom: 20px;
  font-size: 20px;
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
`;

const Tag = styled.span`
  background-color: rgb(244, 244, 245);
  border: 1px solid rgb(233, 233, 235);
  color: rgb(144, 147, 153);
  align-self: flex-start;
  border-radius: 4px;
  padding: 6px 15px;
  font-size: 12px;
  font-weight: 400;
  cursor: pointer;
  margin-left: 15px;
  align-self: flex-start;
`;
