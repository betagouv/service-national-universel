import React, { useEffect, useState } from "react";
import { Container, Table, Modal, ModalHeader, ModalBody, Button, Row, Col, FormGroup, Input } from "reactstrap";
import { useHistory } from "react-router-dom";
import { Formik, Field } from "formik";
import styled from "styled-components";
import { useDispatch, useSelector } from "react-redux";

import { toastr } from "react-redux-toastr";

import { departmentList } from "../../utils";

import LoadingButton from "../../components/loadingButton";
import api from "../../services/api";

export default ({ setOpen, open }) => {
  const { user } = useSelector((state) => state.Auth);

  return (
    <Invitation style={{ marginBottom: 10, textAlign: "right" }}>
      <Modal isOpen={open} toggle={() => setOpen(false)} size="lg">
        <Invitation>
          <ModalHeader toggle={() => setOpen(false)}>Inviter un référent</ModalHeader>
          <ModalBody>
            <Formik
              initialValues={{
                firstName: "",
                lastName: "",
                role: "",
                email: "",
                department: "",
              }}
              onSubmit={async (values, { setSubmitting }) => {
                try {
                  await api.post("/referent/signup_invite/referent_department", values);
                  toastr.success("Invitation envoyée");
                  setOpen();
                  setOpen(false);
                } catch (e) {
                  console.log(e);
                  toastr.error("Erreur !", e.code);
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
                    <Col md={6}>
                      <FormGroup>
                        <div>Département</div>
                        <ChooseDepartment value={values.department} onChange={handleChange} />
                      </FormGroup>
                    </Col>
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

  useEffect(() => {
    if (user.role === "referent_department") {
      return onChange({ target: { value: user.department, name: "department" } });
    }
    return onChange({ target: { value: departmentList[0], name: "department" } });
  }, []);

  return (
    <Input disabled={user.role === "referent_department"} type="select" name="department" value={value} onChange={onChange}>
      {departmentList.map((e) => {
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
