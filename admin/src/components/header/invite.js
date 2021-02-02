import React, { useEffect, useState } from "react";
import { Container, Table, Modal, ModalHeader, ModalBody, Button, Row, Col, FormGroup, Input } from "reactstrap";
import { useHistory } from "react-router-dom";
import { Formik, Field } from "formik";
import styled from "styled-components";
import { useDispatch, useSelector } from "react-redux";

import { toastr } from "react-redux-toastr";

import { translate, departmentList, regionList, region2department, REFERENT_ROLES } from "../../utils";
import LoadingButton from "../../components/loadingButton";
import api from "../../services/api";

export default ({ setOpen, open, label = "Inviter un référent", role = "" }) => {
  const { user } = useSelector((state) => state.Auth);

  return (
    <Invitation style={{ marginBottom: 10, textAlign: "right" }}>
      <Modal isOpen={open} toggle={() => setOpen(false)} size="lg">
        <Invitation>
          <ModalHeader toggle={() => setOpen(false)}>{label}</ModalHeader>
          <ModalBody>
            <Formik
              validateOnChange={false}
              validateOnBlur={false}
              initialValues={{
                firstName: "",
                lastName: "",
                role: "",
                email: "",
                region: "",
                department: "",
              }}
              onSubmit={async (values, { setSubmitting }) => {
                try {
                  await api.post(`/referent/signup_invite/${role}`, values);
                  toastr.success("Invitation envoyée");
                  setOpen();
                  setOpen(false);
                } catch (e) {
                  console.log(e);
                  toastr.error("Erreur !", translate(e.code));
                }
                setSubmitting(false);
              }}
            >
              {({ values, handleChange, handleSubmit, isSubmitting, errors }) => (
                <React.Fragment>
                  <Row>
                    <Col md={6}>
                      <FormGroup>
                        <div>Prénom</div>
                        <Field validate={(v) => !v} name="firstName" value={values.firstName} onChange={handleChange} />
                      </FormGroup>
                    </Col>
                    <Col md={6}>
                      <FormGroup>
                        <div>Nom</div>
                        <Field validate={(v) => !v} name="lastName" value={values.lastName} onChange={handleChange} />
                      </FormGroup>
                    </Col>
                    <Col md={6}>
                      <FormGroup>
                        <div>Email</div>
                        <Field validate={(v) => !v} name="email" value={values.email} onChange={handleChange} />
                      </FormGroup>
                    </Col>
                  </Row>
                  <Row>
                    <Col md={6}>
                      <FormGroup>
                        <div>Rôle</div>
                        <ChooseRole validate={(v) => !v} value={values.role} onChange={handleChange} />
                      </FormGroup>
                    </Col>
                    <Col md={6}>
                      <FormGroup>
                        {values.role === REFERENT_ROLES.REFERENT_DEPARTMENT ? (
                          <>
                            <div>Département</div>
                            <ChooseDepartment validate={(v) => !v} value={values.department} onChange={handleChange} />
                          </>
                        ) : null}
                        {values.role === REFERENT_ROLES.REFERENT_REGION ? (
                          <>
                            <div>Région</div>
                            <ChooseRegion validate={(v) => !v} value={values.region} onChange={handleChange} />
                          </>
                        ) : null}
                      </FormGroup>
                    </Col>
                  </Row>
                  <br />
                  <LoadingButton loading={isSubmitting} color="info" onClick={handleSubmit}>
                    Envoyer l'invitation
                  </LoadingButton>
                  {Object.keys(errors).length ? <h3>Merci de remplir tous les champs avant d'envoyer une invitation.</h3> : null}
                </React.Fragment>
              )}
            </Formik>
          </ModalBody>
        </Invitation>
      </Modal>
    </Invitation>
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
    <Input disabled={user.role === REFERENT_ROLES.REFERENT_DEPARTMENT} type="select" name="department" value={value} onChange={onChange}>
      {list.map((e) => {
        return (
          <option value={e} key={e}>
            {e}
          </option>
        );
      })}
    </Input>
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
    <Input disabled={user.role === REFERENT_ROLES.REFERENT_REGION} type="select" name="region" value={value} onChange={onChange}>
      {regionList.map((e) => {
        return (
          <option value={e} key={e}>
            {e}
          </option>
        );
      })}
    </Input>
  );
};

const ChooseRole = ({ value, onChange }) => {
  const { user } = useSelector((state) => state.Auth);

  return (
    <Input type="select" name="role" value={value} onChange={onChange}>
      <option value=""></option>
      <option value={REFERENT_ROLES.REFERENT_DEPARTMENT}>{translate(REFERENT_ROLES.REFERENT_DEPARTMENT)}</option>
      {user.role === REFERENT_ROLES.ADMIN || user.role === REFERENT_ROLES.REFERENT_REGION ? (
        <option value={REFERENT_ROLES.REFERENT_REGION}>{translate(REFERENT_ROLES.REFERENT_REGION)}</option>
      ) : null}{" "}
      {user.role === REFERENT_ROLES.ADMIN ? <option value={REFERENT_ROLES.ADMIN}>{translate(REFERENT_ROLES.ADMIN)}</option> : null}
    </Input>
  );
};

const Invitation = styled.div`
  input {
    display: block;
    width: 100%;
    height: calc(1.5em + 0.75rem + 2px);
    padding: 0.375rem 0.75rem;
    font-size: 1rem;
    font-weight: 400;
    line-height: 1.5;
    color: #495057;
    background-color: #fff;
    background-clip: padding-box;
    border: 1px solid #ced4da;
    border-radius: 0.25rem;
    transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
  }
  h3 {
    border: 1px solid #fc8181;
    border-radius: 0.25em;
    margin-top: 1em;
    background-color: #fff5f5;
    color: #c53030;
    font-weight: 400;
    font-size: 12px;
    padding: 1em;
    text-align: center;
  }
`;
