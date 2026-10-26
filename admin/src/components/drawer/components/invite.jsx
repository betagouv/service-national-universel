import React, { useEffect, useState } from "react";
import { Modal, ModalHeader, ModalBody, Row, Col, FormGroup } from "reactstrap";
import { Formik, Field } from "formik";
import styled from "styled-components";
import { useSelector } from "react-redux";
import { toastr } from "react-redux-toastr";
import {
  colors,
  translate,
  departmentList,
  regionList,
  region2department,
  department2region,
  REFERENT_DEPARTMENT_SUBROLE,
  REFERENT_REGION_SUBROLE,
  ROLES,
  SENDINBLUE_TEMPLATES,
  VISITOR_SUBROLES,
} from "snu-lib";

import { Footer } from "../../modals/Modal";
import ModalButton from "../../buttons/ModalButton";
import api from "../../../services/api";
import ErrorMessage, { requiredMessage } from "../../errorMessage";
import CustomMultiSelect from "../../CustomMultiSelect";

export default function InviteHeader({ setOpen, open, label = "Inviter un référent" }) {
  const getSubRoleOptions = (subRoles) => {
    return Object.keys(subRoles).map((e) => ({ value: e, label: translate(subRoles[e]) }));
  };

  return (
    <Invitation>
      <Modal isOpen={open} toggle={() => setOpen(false)} size="lg">
        <Invitation>
          <ModalHeader style={{ border: "none" }} toggle={() => setOpen(false)}>
            {label}
          </ModalHeader>
          <Formik
            validateOnChange={false}
            validateOnBlur={false}
            initialValues={{
              firstName: "",
              lastName: "",
              role: "",
              subRole: "",
              email: "",
              region: "",
              department: [],
            }}
            onSubmit={async (values, { setSubmitting }) => {
              try {
                const obj = { ...values };
                if (obj.role === ROLES.REFERENT_DEPARTMENT) obj.region = department2region[obj.department[0]];
                if (obj.role === ROLES.REFERENT_REGION) obj.department = null;
                if (obj.department && !obj.region) obj.region = department2region[obj.department];
                await api.post(`/referent/signup_invite/${SENDINBLUE_TEMPLATES.invitationReferent[obj.role]}`, obj);
                toastr.success("Invitation envoyée");
                setOpen();
                setOpen(false);
              } catch (e) {
                console.log(e);
                toastr.error("Erreur !", translate(e.code));
              }
              setSubmitting(false);
            }}>
            {({ values, handleChange, handleSubmit, isSubmitting, errors, touched }) => (
              <React.Fragment>
                <ModalBody>
                  <Row>
                    <Col md={6}>
                      <FormGroup>
                        <div>Prénom</div>
                        <Field validate={(v) => !v && requiredMessage} name="firstName" value={values.firstName} onChange={handleChange} />
                        <ErrorMessage errors={errors} touched={touched} name="firstName" />
                      </FormGroup>
                    </Col>
                    <Col md={6}>
                      <FormGroup>
                        <div>Nom</div>
                        <Field validate={(v) => !v && requiredMessage} name="lastName" value={values.lastName} onChange={handleChange} />
                        <ErrorMessage errors={errors} touched={touched} name="lastName" />
                      </FormGroup>
                    </Col>
                    <Col md={6}>
                      <FormGroup>
                        <div>Email</div>
                        <Field validate={(v) => !v && requiredMessage} name="email" value={values.email} onChange={handleChange} />
                        <ErrorMessage errors={errors} touched={touched} name="email" />
                      </FormGroup>
                    </Col>
                  </Row>
                  <Row>
                    <Col md={6}>
                      <FormGroup>
                        <div>Rôle</div>
                        <ChooseRole validate={(v) => !v && requiredMessage} name="role" value={values.role} onChange={handleChange} />
                        <ErrorMessage errors={errors} touched={touched} name="role" />
                      </FormGroup>
                    </Col>
                  </Row>
                  {values.role === ROLES.REFERENT_REGION && (
                    <Row>
                      <Col md={6}>
                        <FormGroup>
                          <div>Région</div>
                          <ChooseRegion validate={(v) => !v && requiredMessage} name="region" value={values.region} onChange={handleChange} />
                          <ErrorMessage errors={errors} touched={touched} name="region" />
                        </FormGroup>
                      </Col>
                      <Col md={6}>
                        <FormGroup>
                          <div>Fonction</div>
                          <ChooseSubRole
                            validate={(v) => !v && requiredMessage}
                            name="subRole"
                            value={values.subRole}
                            onChange={handleChange}
                            options={getSubRoleOptions(REFERENT_REGION_SUBROLE)}
                          />
                          <ErrorMessage errors={errors} touched={touched} name="subRole" />
                        </FormGroup>
                      </Col>
                    </Row>
                  )}
                  {values.role === ROLES.REFERENT_DEPARTMENT && (
                    <Row>
                      <Col md={6}>
                        <FormGroup>
                          <div>Département(s)</div>
                          <ChooseDepartment handleChange={handleChange} />
                          <ErrorMessage errors={errors} touched={touched} name="department" />
                        </FormGroup>
                      </Col>
                      <Col md={6}>
                        <FormGroup>
                          <div>Fonction</div>
                          <ChooseSubRole
                            validate={(v) => !v && requiredMessage}
                            name="subRole"
                            value={values.subRole}
                            onChange={handleChange}
                            options={getSubRoleOptions(REFERENT_DEPARTMENT_SUBROLE)}
                          />
                          <ErrorMessage errors={errors} touched={touched} name="subRole" />
                        </FormGroup>
                      </Col>
                    </Row>
                  )}
                  {values.role === ROLES.VISITOR && (
                    <Row>
                      <Col md={6}>
                        <FormGroup>
                          <div>Région</div>
                          <ChooseRegion validate={(v) => !v && requiredMessage} name="region" value={values.region} onChange={handleChange} />
                          <ErrorMessage errors={errors} touched={touched} name="region" />
                        </FormGroup>
                      </Col>
                      <Col md={6}>
                        <FormGroup>
                          <div>Fonction</div>
                          <ChooseSubRole
                            validate={(v) => !v && requiredMessage}
                            name="subRole"
                            value={values.subRole}
                            onChange={handleChange}
                            options={getSubRoleOptions(VISITOR_SUBROLES)}
                          />
                          <ErrorMessage errors={errors} touched={touched} name="subRole" />
                        </FormGroup>
                      </Col>
                    </Row>
                  )}
                </ModalBody>

                <br />
                <Footer>
                  <ModalButton loading={isSubmitting} onClick={handleSubmit} primary>
                    Envoyer l&apos;invitation
                  </ModalButton>
                  {Object.keys(errors).length ? <h3>Merci de remplir tous les champs avant d&apos;envoyer une invitation.</h3> : null}
                </Footer>
              </React.Fragment>
            )}
          </Formik>
        </Invitation>
      </Modal>
    </Invitation>
  );
}

const ChooseDepartment = ({ handleChange }) => {
  const { user } = useSelector((state) => state.Auth);
  const [list, setList] = useState([]);

  useEffect(() => {
    const list = user.role === ROLES.REFERENT_REGION ? region2department[user.region] : user.role === ROLES.REFERENT_DEPARTMENT ? user.department : departmentList;

    setList(list.map((e) => ({ value: e, label: e })));
  }, []);

  return (
    <Field
      name="department"
      options={list}
      component={CustomMultiSelect}
      placeholder="Sélectionnez le(s) département(s)..."
      onChangeAdditionnel={(val) => {
        handleChange({ target: { name: "region", value: department2region[val[0]] } });
      }}
      disabled={user.role === ROLES.REFERENT_DEPARTMENT && user.department.length === 1}
      validate={(v) => !v.length && requiredMessage}
    />
  );
};

const ChooseRegion = ({ value, onChange, validate }) => {
  const { user } = useSelector((state) => state.Auth);

  useEffect(() => {
    if (user.role === ROLES.REFERENT_REGION) {
      return onChange({ target: { value: user.region, name: "region" } });
    }
  }, []);

  return (
    <Field
      disabled={user.role === ROLES.REFERENT_REGION}
      as="select"
      validate={validate}
      className="form-control"
      placeholder="Région"
      name="region"
      value={value}
      onChange={onChange}>
      <option key={-1} value="" label=""></option>
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

const ChooseRole = ({ value, onChange, validate }) => {
  const { user } = useSelector((state) => state.Auth);

  return (
    <Field as="select" validate={validate} className="form-control" placeholder="Rôle" name="role" value={value} onChange={onChange}>
      <option value=""></option>
      {[ROLES.ADMIN, ROLES.REFERENT_REGION].includes(user.role) ? <option value={ROLES.VISITOR}>{translate(ROLES.VISITOR)}</option> : null}
      <option value={ROLES.REFERENT_DEPARTMENT}>{translate(ROLES.REFERENT_DEPARTMENT)}</option>
      {user.role === ROLES.ADMIN || user.role === ROLES.REFERENT_REGION ? <option value={ROLES.REFERENT_REGION}>{translate(ROLES.REFERENT_REGION)}</option> : null}
      {user.role === ROLES.ADMIN ? <option value={ROLES.ADMIN}>{translate(ROLES.ADMIN)}</option> : null}
      {user.role === ROLES.ADMIN ? <option value={ROLES.DSNJ}>{translate(ROLES.DSNJ)}</option> : null}
      {user.role === ROLES.ADMIN ? <option value={ROLES.INJEP}>{translate(ROLES.INJEP)}</option> : null}
      {user.role === ROLES.ADMIN ? <option value={ROLES.TRANSPORTER}>{translate(ROLES.TRANSPORTER)}</option> : null}
      {user.role === ROLES.ADMIN ? <option value={ROLES.ADMINISTRATEUR_CLE}>{translate(ROLES.ADMINISTRATEUR_CLE)}</option> : null}
    </Field>
  );
};

const ChooseSubRole = ({ value, onChange, options, validate }) => {
  return (
    <Field as="select" className="form-control" name="subRole" validate={validate} value={value} onChange={onChange}>
      <option value=""></option>
      {options.map((o, i) => (
        <option key={i} value={o.value} label={o.label}>
          {o.label}
        </option>
      ))}
    </Field>
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
    transition:
      border-color 0.15s ease-in-out,
      box-shadow 0.15s ease-in-out;
  }
  h3 {
    border: 1px solid ${colors.red};
    border-radius: 0.25em;
    margin-top: 1em;
    background-color: #fff5f5;
    color: ${colors.red};
    font-weight: 400;
    font-size: 12px;
    padding: 1em;
    text-align: center;
  }
`;
