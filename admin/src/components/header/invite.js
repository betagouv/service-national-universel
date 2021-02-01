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
              initialValues={{
                firstName: "",
                lastName: "",
                role,
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
              {({ values, handleChange, handleSubmit, isSubmitting }) => (
                <React.Fragment>
                  <Row>
                    <Col md={6}>
                      <FormGroup>
                        <div>Prénom</div>
                        <Field name="firstName" value={values.firstName} onChange={handleChange} />
                      </FormGroup>
                    </Col>
                    <Col md={6}>
                      <FormGroup>
                        <div>Nom</div>
                        <Field name="lastName" value={values.lastName} onChange={handleChange} />
                      </FormGroup>
                    </Col>
                    <Col md={6}>
                      <FormGroup>
                        <div>Email</div>
                        <Field name="email" value={values.email} onChange={handleChange} />
                      </FormGroup>
                    </Col>
                    {role === REFERENT_ROLES.REFERENT_DEPARTMENT ? (
                      <Col md={6}>
                        <FormGroup>
                          <div>Département</div>
                          <ChooseDepartment value={values.department} onChange={handleChange} />
                        </FormGroup>
                      </Col>
                    ) : null}
                    {role === REFERENT_ROLES.REFERENT_REGION ? (
                      <Col md={6}>
                        <FormGroup>
                          <div>Région</div>
                          <ChooseRegion value={values.region} onChange={handleChange} />
                        </FormGroup>
                      </Col>
                    ) : null}
                  </Row>
                  <br />
                  <LoadingButton loading={isSubmitting} color="info" onClick={handleSubmit}>
                    Envoyer l'invitation
                  </LoadingButton>
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
`;
