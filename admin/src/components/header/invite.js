import React, { useEffect, useState } from "react";
import { Modal, ModalHeader, ModalBody, Row, Col, FormGroup, Input } from "reactstrap";
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
} from "../../utils";

import { Footer } from "../../components/modals/Modal";
import ModalButton from "../../components/buttons/ModalButton";
import api from "../../services/api";

export default function InviteHeader({ setOpen, open, label = "Inviter un référent" }) {
  const { user } = useSelector((state) => state.Auth);

  const [centers, setCenters] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        let { data } = await api.get("/cohesion-center");

        if (user.role === ROLES.REFERENT_REGION) data = data.filter((e) => e.region === user.region);
        if (user.role === ROLES.REFERENT_DEPARTMENT) data = data.filter((e) => e.department === user.department);

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
    <Invitation style={{ marginBottom: 10, textAlign: "right" }}>
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
              department: "",
              cohesionCenterName: "",
              cohesionCenterId: "",
              sessionPhase1Id: "",
            }}
            onSubmit={async (values, { setSubmitting }) => {
              try {
                const obj = { ...values };
                if (obj.role === ROLES.REFERENT_DEPARTMENT) obj.region = department2region[obj.department];
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
            {({ values, handleChange, handleSubmit, isSubmitting, errors }) => (
              <React.Fragment>
                <ModalBody>
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
                  </Row>
                  {values.role === ROLES.REFERENT_REGION && (
                    <Row>
                      <Col md={6}>
                        <FormGroup>
                          <div>Région</div>
                          <ChooseRegion validate={(v) => !v} value={values.region} onChange={handleChange} />
                        </FormGroup>
                      </Col>
                      <Col md={6}>
                        <FormGroup>
                          <div>Fonction</div>
                          <ChooseSubRole validate={(v) => !v} value={values.subRole} onChange={handleChange} options={getSubRoleOptions(REFERENT_REGION_SUBROLE)} />
                        </FormGroup>
                      </Col>
                    </Row>
                  )}
                  {values.role === ROLES.REFERENT_DEPARTMENT && (
                    <Row>
                      <Col md={6}>
                        <FormGroup>
                          <div>Département</div>
                          <ChooseDepartment validate={(v) => !v} value={values.department} onChange={handleChange} />
                        </FormGroup>
                      </Col>
                      <Col md={6}>
                        <FormGroup>
                          <div>Fonction</div>
                          <ChooseSubRole validate={(v) => !v} value={values.subRole} onChange={handleChange} options={getSubRoleOptions(REFERENT_DEPARTMENT_SUBROLE)} />
                        </FormGroup>
                      </Col>
                    </Row>
                  )}
                  {values.role === ROLES.VISITOR && (
                    <Row>
                      <Col md={6}>
                        <FormGroup>
                          <div>Région</div>
                          <ChooseRegion validate={(v) => !v} value={values.region} onChange={handleChange} />
                        </FormGroup>
                      </Col>
                      <Col md={6}>
                        <FormGroup>
                          <div>Fonction</div>
                          <ChooseSubRole validate={(v) => !v} value={values.subRole} onChange={handleChange} options={getSubRoleOptions(VISITOR_SUBROLES)} />
                        </FormGroup>
                      </Col>
                    </Row>
                  )}
                  {values.role === ROLES.HEAD_CENTER && (
                    <Row>
                      <Col md={6}>
                        <FormGroup>
                          <ChooseCenter value={values} onChange={handleChange} centers={centers} />
                        </FormGroup>
                      </Col>
                      <Col md={6}>
                        <FormGroup>
                          <ChooseSessionPhase1 value={values} onChange={handleChange} />
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

const ChooseDepartment = ({ value, onChange, validate }) => {
  const { user } = useSelector((state) => state.Auth);
  const [list, setList] = useState(departmentList);

  useEffect(() => {
    //force the value if it is a referent_department
    if (user.role === ROLES.REFERENT_DEPARTMENT) {
      return onChange({ target: { value: user.department, name: "department" } });
    }
    //filter the array if it is a referent_region
    if (user.role === ROLES.REFERENT_REGION) {
      setList(region2department[user.region]);
    }
  }, []);

  return (
    <Field
      disabled={user.role === ROLES.REFERENT_DEPARTMENT}
      as="select"
      validate={validate}
      className="form-control"
      placeholder="Département"
      name="department"
      value={value}
      onChange={onChange}>
      <option disabled value="" label=""></option>
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

const ChooseCenter = ({ onChange, centers, onSelect, value }) => {
  const { user } = useSelector((state) => state.Auth);

  useEffect(() => {
    if (user.role === ROLES.HEAD_CENTER) {
      return onChange({ target: { value: user.cohesionCenterId, name: "cohesionCenterId" } }), onChange({ target: { value: user.cohesionCenterName, name: "cohesionCenterName" } });
    }
  }, []);

  return (
    <>
      <Field hidden value={value.cohesionCenterName} name="cohesionCenterName" onChange={onChange} validate={(v) => !v} />
      <Field hidden value={value.cohesionCenterId} name="cohesionCenterId" onChange={onChange} validate={(v) => !v} />
      <ReactSelect
        disabled={user.role === ROLES.HEAD_CENTER}
        options={centers}
        placeholder="Choisir un centre"
        noOptionsMessage={() => "Aucun centre ne correspond à cette recherche."}
        onChange={(e) => {
          onChange({ target: { value: e._id, name: "cohesionCenterId" } });
          onChange({ target: { value: e.value, name: "cohesionCenterName" } });
          onSelect?.(e);
        }}
      />
    </>
  );
};

const ChooseSessionPhase1 = ({ onChange, value }) => {
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
      <Field hidden value={value.sessionPhase1Id} name="sessionPhase1Id" onChange={onChange} validate={(v) => !v} />
      <ReactSelect
        options={sessions}
        placeholder="Choisir une session"
        noOptionsMessage={() => "Aucune session ne correspond à cette recherche."}
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
      {user.role === ROLES.ADMIN ? <option value={ROLES.VISITOR}>{translate(ROLES.VISITOR)}</option> : null}
      <option value={ROLES.HEAD_CENTER}>{translate(ROLES.HEAD_CENTER)}</option>
      <option value={ROLES.REFERENT_DEPARTMENT}>{translate(ROLES.REFERENT_DEPARTMENT)}</option>
      {user.role === ROLES.ADMIN || user.role === ROLES.REFERENT_REGION ? <option value={ROLES.REFERENT_REGION}>{translate(ROLES.REFERENT_REGION)}</option> : null}
      {user.role === ROLES.ADMIN ? <option value={ROLES.ADMIN}>{translate(ROLES.ADMIN)}</option> : null}
    </Field>
  );
};

const ChooseSubRole = ({ value, onChange, options }) => {
  return (
    <Input type="select" name="subRole" value={value} onChange={onChange}>
      <option value=""></option>
      {options.map((o, i) => (
        <option key={i} value={o.value} label={o.label}>
          {o.label}
        </option>
      ))}
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
