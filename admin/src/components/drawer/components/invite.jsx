import React, { useEffect, useState } from "react";
import { Modal, ModalHeader, ModalBody, Row, Col, FormGroup } from "reactstrap";
import { Formik, Field } from "formik";
import styled from "styled-components";
import ReactSelect from "react-select";
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
} from "../../../utils";

import { Footer } from "../../modals/Modal";
import ModalButton from "../../buttons/ModalButton";
import api from "../../../services/api";
import ErrorMessage, { requiredMessage } from "../../errorMessage";
import CustomMultiSelect from "../../CustomMultiSelect";

export default function InviteHeader({ setOpen, open, label = "Inviter un référent" }) {
  const { user } = useSelector((state) => state.Auth);

  const [centers, setCenters] = useState(null);

  // TODO - Refresh session on reselect other center

  useEffect(() => {
    (async () => {
      try {
        let { data } = await api.get("/cohesion-center");

        if (user.role === ROLES.REFERENT_REGION) data = data.filter((e) => e.region === user.region);
        if (user.role === ROLES.REFERENT_DEPARTMENT) data = data.filter((e) => user.department.includes(e.department));

        const c = data.map((e) => ({ label: e.name, value: e.name, _id: e._id }));
        setCenters(c);
      } catch (e) {
        console.log(e);
      }
    })();
  }, []);

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
              cohesionCenterName: "",
              cohesionCenterId: "",
              sessionPhase1Id: "",
            }}
            onSubmit={async (values, { setSubmitting }) => {
              try {
                const obj = { ...values };
                if (obj.role === ROLES.REFERENT_DEPARTMENT) obj.region = department2region[obj.department[0]];
                if (obj.role === ROLES.REFERENT_REGION) obj.department = null;
                if (obj.role !== ROLES.HEAD_CENTER) {
                  obj.cohesionCenterId = null;
                  obj.cohesionCenterName = null;
                  obj.sessionPhase1Id = null;
                }
                if (obj.department && !obj.region) obj.region = department2region[obj.department];
                const { data: referent } = await api.post(`/referent/signup_invite/${SENDINBLUE_TEMPLATES.invitationReferent[obj.role]}`, obj);

                if (values.sessionPhase1Id) {
                  await api.put(`/session-phase1/${values.sessionPhase1Id}`, { headCenterId: referent._id });
                }
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
                  {values.role === ROLES.HEAD_CENTER && (
                    <Row>
                      <Col md={6}>
                        <FormGroup>
                          <ChooseCenter validate={(v) => !v && requiredMessage} value={values} name="cohesionCenterId" onChange={handleChange} centers={centers} />
                          <ErrorMessage errors={errors} touched={touched} name="cohesionCenterId" />
                        </FormGroup>
                      </Col>
                      <Col md={6}>
                        <FormGroup>
                          <ChooseSessionPhase1 validate={(v) => !v && requiredMessage} value={values} name="sessionPhase1Id" onChange={handleChange} />
                          <ErrorMessage errors={errors} touched={touched} name="sessionPhase1Id" />
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

const ChooseCenter = ({ onChange, centers, onSelect, value, validate }) => {
  const { user } = useSelector((state) => state.Auth);

  useEffect(() => {
    if (user.role === ROLES.HEAD_CENTER) {
      return onChange({ target: { value: user.cohesionCenterId, name: "cohesionCenterId" } }), onChange({ target: { value: user.cohesionCenterName, name: "cohesionCenterName" } });
    }
  }, []);

  return (
    <>
      <Field hidden value={value.cohesionCenterName} name="cohesionCenterName" onChange={onChange} validate={validate} />
      <Field hidden value={value.cohesionCenterId} name="cohesionCenterId" onChange={onChange} validate={validate} />
      <ReactSelect
        disabled={user.role === ROLES.HEAD_CENTER}
        options={centers}
        placeholder="Choisir un centre"
        noOptionsMessage={() => "Aucun centre ne correspond à cette recherche."}
        validate={validate}
        onChange={(e) => {
          onChange({ target: { value: e._id, name: "cohesionCenterId" } });
          onChange({ target: { value: e.value, name: "cohesionCenterName" } });
          onSelect?.(e);
        }}
      />
    </>
  );
};

const ChooseSessionPhase1 = ({ onChange, value, validate }) => {
  const [sessions, setSessions] = useState([]);
  useEffect(() => {
    if (!value.cohesionCenterId) return;

    (async () => {
      const { ok, error, data } = await api.get(`/cohesion-center/${value.cohesionCenterId}/session-phase1`);
      if (!ok) return toastr.error("Erreur", error);
      setSessions(data.map((e) => ({ label: e.cohort, value: e._id })));
    })();
  }, [value.cohesionCenterId]);

  return (
    <>
      <Field hidden value={value.sessionPhase1Id} name="sessionPhase1Id" onChange={onChange} validate={validate} />
      <ReactSelect
        options={sessions}
        placeholder="Choisir une session"
        noOptionsMessage={() => "Aucune session ne correspond à cette recherche."}
        validate={validate}
        onChange={(e) => {
          onChange({ target: { value: e.value, name: "sessionPhase1Id" } });
        }}
      />
    </>
  );
};

const ChooseRole = ({ value, onChange, validate }) => {
  const { user } = useSelector((state) => state.Auth);

  return (
    <Field as="select" validate={validate} className="form-control" placeholder="Rôle" name="role" value={value} onChange={onChange}>
      <option value=""></option>
      {[ROLES.ADMIN, ROLES.REFERENT_REGION].includes(user.role) ? <option value={ROLES.VISITOR}>{translate(ROLES.VISITOR)}</option> : null}
      {user.role === ROLES.ADMIN ? <option value={ROLES.HEAD_CENTER}>{translate(ROLES.HEAD_CENTER)}</option> : null}
      <option value={ROLES.REFERENT_DEPARTMENT}>{translate(ROLES.REFERENT_DEPARTMENT)}</option>
      {user.role === ROLES.ADMIN || user.role === ROLES.REFERENT_REGION ? <option value={ROLES.REFERENT_REGION}>{translate(ROLES.REFERENT_REGION)}</option> : null}
      {user.role === ROLES.ADMIN ? <option value={ROLES.ADMIN}>{translate(ROLES.ADMIN)}</option> : null}
      {user.role === ROLES.ADMIN ? <option value={ROLES.DSNJ}>{translate(ROLES.DSNJ)}</option> : null}
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
    transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
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
